package scraper

import (
	"context"
	"sync"

	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/chromedp"
)

type Config struct {
	Workers        int
	Opts           []func(*chromedp.ExecAllocator)
	BlockResources []network.ResourceType
	Url            *string
}

type Task struct {
	Func   func(context.Context) (any, error)
	Result chan Result[any]
}

type Result[T any] struct {
	Value T
	Err   error
}

type Scraper struct {
	blockResources map[network.ResourceType]struct{}

	Config Config
	tasks  chan Task
	close  chan struct{}
	taskWg sync.WaitGroup

	allocCtx    context.Context
	allocCancel context.CancelFunc
}

func New(config Config) *Scraper {
	if config.Workers <= 0 {
		config.Workers = 1
	}

	s := &Scraper{
		Config: config,
		tasks:  make(chan Task, config.Workers),
		close:  make(chan struct{}),
	}

	if len(config.BlockResources) > 0 {
		blockResources := make(map[network.ResourceType]struct{})
		for _, r := range config.BlockResources {
			blockResources[network.ResourceType(r)] = struct{}{}
		}

		s.blockResources = blockResources
	}

	defaultOpts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.DisableGPU,
		chromedp.NoFirstRun,
		chromedp.NoDefaultBrowserCheck,
	)

	defaultOpts = append(defaultOpts, config.Opts...)

	if config.Url != nil {
		allocCtx, allocCancel := chromedp.NewRemoteAllocator(context.Background(), *config.Url)
		s.allocCtx = allocCtx
		s.allocCancel = allocCancel
	} else {
		allocCtx, allocCancel := chromedp.NewExecAllocator(context.Background(), defaultOpts...)
		s.allocCtx = allocCtx
		s.allocCancel = allocCancel
	}

	s.startWorkers()
	return s
}

func (s *Scraper) startWorkers() {
	requests := make([]chan Request, s.Config.Workers)
	doneCollecting := make([]chan bool, s.Config.Workers)

	ctxPool := make([]context.Context, s.Config.Workers)
	cancels := make([]context.CancelFunc, s.Config.Workers)

	for i := 0; i < s.Config.Workers; i++ {
		requests[i] = make(chan Request, 1)
		doneCollecting[i] = make(chan bool, 1)
		ctxPool[i], cancels[i] = chromedp.NewContext(s.allocCtx)
		chromedp.ListenTarget(ctxPool[i], Inspector(ctxPool[i], s.blockResources, requests[i]))
	}

	for i := 0; i < s.Config.Workers; i++ {
		go func(idx int) {
			for {
				select {
				case task := <-s.tasks:
					// run task
					result, err := task.Func(ctxPool[idx])
					close(doneCollecting[idx])

					if err == nil {
						// Clear context
						chromedp.Run(ctxPool[idx],
							chromedp.ActionFunc(func(ctx context.Context) error {
								// Clear cookies
								network.ClearBrowserCookies().Do(ctx)

								// Clear cache
								network.ClearBrowserCache().Do(ctx)

								return nil
							}))
					}

					task.Result <- Result[any]{
						Value: result,
						Err:   err,
					}

					s.taskWg.Done()
					doneCollecting[idx] = make(chan bool, 1)
				case <-s.close:
					cancels[idx]()
					return
				}
			}
		}(i)
	}
}

func (s *Scraper) execute(task func(context.Context) (any, error)) (any, error) {
	resultChan := make(chan Result[any], 1)
	s.taskWg.Add(1)
	s.tasks <- Task{Func: task, Result: resultChan}
	result := <-resultChan
	return result.Value, result.Err
}

func Execute[T any](scraper *Scraper, task func(context.Context) (T, error)) (T, error) {
	res, err := scraper.execute(func(ctx context.Context) (any, error) {
		return task(ctx)
	})

	if err != nil {
		return *new(T), err
	} else {
		return res.(T), nil
	}
}

func (s *Scraper) Close() {
	s.taskWg.Wait()
	close(s.close)
	close(s.tasks)
	s.allocCancel()
}
