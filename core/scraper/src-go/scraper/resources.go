package scraper

import (
	"context"

	"github.com/chromedp/cdproto/cdp"
	"github.com/chromedp/cdproto/fetch"
	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/chromedp"
)

type Request struct {
	URL                string
	Method             string
	ResponseHeaders    map[string]string
	ResponseStatusCode int64
	Payload            string
}

func Inspector(
	ctx context.Context,
	blockResources map[network.ResourceType]struct{},
	requests chan<- Request,
) func(event interface{}) {
	return func(event interface{}) {
		switch ev := event.(type) {
		case *fetch.EventRequestPaused:
			go func() {
				c := chromedp.FromContext(ctx)
				ctx := cdp.WithExecutor(ctx, c.Target)

				if _, ok := blockResources[ev.ResourceType]; ok {
					fetch.FailRequest(ev.RequestID, network.ErrorReasonBlockedByClient).Do(ctx)
				} else {
					headers := make(map[string]string)

					for _, header := range ev.ResponseHeaders {
						if header != nil {
							headers[header.Name] = header.Value
						}
					}

					payload := ""

					for _, content := range ev.Request.PostDataEntries {
						payload += content.Bytes
					}

					requests <- Request{
						URL:                ev.Request.URL,
						Method:             ev.Request.Method,
						ResponseHeaders:    headers,
						ResponseStatusCode: ev.ResponseStatusCode,
						Payload:            payload,
					}

					fetch.ContinueRequest(ev.RequestID).Do(ctx)
				}
			}()
		}
	}
}
