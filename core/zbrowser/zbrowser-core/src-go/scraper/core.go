package scraper

import (
	"context"
	"sync"

	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/chromedp"
)

// Config holds the configuration options for the scraper
type Config struct {
	Workers        int                             // Number of concurrent worker goroutines
	Opts           []func(*chromedp.ExecAllocator) // Additional Chrome options
	BlockResources []network.ResourceType          // Resources to block during scraping (e.g., images, stylesheets)
	Url            *string                         // Optional remote Chrome instance URL
}

// Task represents a scraping task to be executed
type Task struct {
	Func   func(context.Context) (any, error) // Function to execute with Chrome context
	Result chan Result[any]                   // Channel to receive the result
}

// Result holds the outcome of a task execution
type Result[T any] struct {
	Value T     // The returned value from the task
	Err   error // Any error that occurred during execution
}

// Scraper manages Chrome instances and task execution
type Scraper struct {
	blockResources map[network.ResourceType]struct{} // Set of resources to block

	Config Config         // Scraper configuration
	tasks  chan Task      // Channel for incoming tasks
	close  chan struct{}  // Channel to signal shutdown
	taskWg sync.WaitGroup // WaitGroup to track active tasks

	allocCtx    context.Context    // Chrome allocator context
	allocCancel context.CancelFunc // Function to cancel the allocator
}

// New creates and initializes a new Scraper instance
func New(config Config) *Scraper {
	// Ensure at least one worker is configured
	if config.Workers <= 0 {
		config.Workers = 1
	}

	// Initialize the scraper with basic configuration
	s := &Scraper{
		Config: config,
		tasks:  make(chan Task, config.Workers),
		close:  make(chan struct{}),
	}

	// Convert blocked resources slice to a map for O(1) lookup
	if len(config.BlockResources) > 0 {
		blockResources := make(map[network.ResourceType]struct{})
		for _, r := range config.BlockResources {
			blockResources[network.ResourceType(r)] = struct{}{}
		}

		s.blockResources = blockResources
	}

	// Set up default Chrome options for a realistic browser experience
	defaultOpts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"),
		chromedp.Flag("headless", false),    // Run in non-headless mode
		chromedp.Flag("disable-gpu", false), // Enable GPU acceleration
		chromedp.Flag("disable-dev-shm-usage", false),
		chromedp.Flag("no-sandbox", false),
		chromedp.Flag("window-size", "1920,1080"), // Set window size
	)

	// Append user-provided options
	defaultOpts = append(defaultOpts, config.Opts...)

	// Initialize Chrome allocator - either remote or local
	if config.Url != nil {
		// Connect to remote Chrome instance (e.g., running in Docker)
		allocCtx, allocCancel := chromedp.NewRemoteAllocator(context.Background(), *config.Url, chromedp.NoModifyURL)
		s.allocCtx = allocCtx
		s.allocCancel = allocCancel
	} else {
		// Launch local Chrome instance
		allocCtx, allocCancel := chromedp.NewExecAllocator(context.Background(), defaultOpts...)
		s.allocCtx = allocCtx
		s.allocCancel = allocCancel
	}

	// Start worker goroutines
	s.startWorkers()
	return s
}

// startWorkers initializes and starts the worker goroutines that execute tasks
func (s *Scraper) startWorkers() {
	// Create communication channels for each worker
	requests := make([]chan Request, s.Config.Workers)
	doneCollecting := make([]chan bool, s.Config.Workers)

	// Create Chrome contexts and cancellation functions for each worker
	ctxPool := make([]context.Context, s.Config.Workers)
	cancels := make([]context.CancelFunc, s.Config.Workers)

	// Initialize contexts and set up network request inspection for each worker
	for i := 0; i < s.Config.Workers; i++ {
		requests[i] = make(chan Request, 1)
		doneCollecting[i] = make(chan bool, 1)
		ctxPool[i], cancels[i] = chromedp.NewContext(s.allocCtx)
		// Set up network request interception to block specified resources
		chromedp.ListenTarget(ctxPool[i], Inspector(ctxPool[i], s.blockResources, requests[i]))
	}

	// Start worker goroutines
	for i := 0; i < s.Config.Workers; i++ {
		go func(idx int) {
			for {
				select {
				case task := <-s.tasks:
					// Execute the task using the worker's Chrome context
					result, err := task.Func(ctxPool[idx])
					close(doneCollecting[idx])

					// Clean up the browser state after successful execution
					if err == nil {
						// Clear context to prevent data leakage between tasks
						chromedp.Run(ctxPool[idx],
							chromedp.ActionFunc(func(ctx context.Context) error {
								// Clear browser cookies
								network.ClearBrowserCookies().Do(ctx)

								// Clear browser cache
								network.ClearBrowserCache().Do(ctx)

								return nil
							}))
					}

					// Send result back to the caller
					task.Result <- Result[any]{
						Value: result,
						Err:   err,
					}

					// Mark task as complete
					s.taskWg.Done()
					doneCollecting[idx] = make(chan bool, 1)
				case <-s.close:
					// Shutdown signal received - clean up and exit
					cancels[idx]()
					return
				}
			}
		}(i)
	}
}

// Execute submits a task to be executed by one of the worker goroutines
// Returns the result and any error from the task execution
func (s *Scraper) Execute(task func(context.Context) (any, error)) (any, error) {
	resultChan := make(chan Result[any], 1)
	s.taskWg.Add(1)                                 // Track this task
	s.tasks <- Task{Func: task, Result: resultChan} // Submit task to workers
	result := <-resultChan                          // Wait for result
	return result.Value, result.Err
}

// Execute is a generic wrapper function that provides type safety
// T is the expected return type of the task function
func Execute[T any](scraper *Scraper, task func(context.Context) (T, error)) (T, error) {
	// Execute the task and get the generic result
	res, err := scraper.Execute(func(ctx context.Context) (any, error) {
		return task(ctx)
	})

	// Handle error case - return zero value and error
	if err != nil {
		return *new(T), err
	} else {
		// Type assert the result to the expected type
		return res.(T), nil
	}
}

// Close gracefully shuts down the scraper
// Waits for all active tasks to complete before closing
func (s *Scraper) Close() {
	s.taskWg.Wait() // Wait for all tasks to complete
	close(s.close)  // Signal workers to shutdown
	close(s.tasks)  // Close task channel
	s.allocCancel() // Cancel Chrome allocator context
}
