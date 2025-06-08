// Package scraper provides functionality for web resource interception and monitoring
package scraper

import (
	"context"

	"github.com/chromedp/cdproto/cdp"
	"github.com/chromedp/cdproto/fetch"
	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/chromedp"
)

// Request represents a captured network request with its details
type Request struct {
	URL                string            // The requested URL
	Method             string            // HTTP method (GET, POST, etc.)
	ResponseHeaders    map[string]string // Response headers as key-value pairs
	ResponseStatusCode int64             // HTTP status code of the response
	Payload            string            // Request payload/body data
}

// Inspector creates an event handler function that intercepts and processes network requests
// It can block specific resource types and captures request details for analysis
//
// Parameters:
//   - ctx: Context for the Chrome DevTools Protocol session
//   - blockResources: Map of resource types to block (images, stylesheets, etc.)
//   - requests: Channel to send captured request information
//
// Returns:
//   - A function that handles Chrome DevTools Protocol events
func Inspector(
	ctx context.Context,
	blockResources map[network.ResourceType]struct{},
	requests chan<- Request,
) func(event interface{}) {
	return func(event interface{}) {
		// Handle different types of Chrome DevTools Protocol events
		switch ev := event.(type) {
		case *fetch.EventRequestPaused:
			// Process paused requests in a separate goroutine to avoid blocking
			go func() {
				// Get Chrome DevTools Protocol connection from context
				c := chromedp.FromContext(ctx)
				ctx := cdp.WithExecutor(ctx, c.Target)

				// Check if this resource type should be blocked
				if _, ok := blockResources[ev.ResourceType]; ok {
					// Block the request by failing it with a blocked-by-client error
					fetch.FailRequest(ev.RequestID, network.ErrorReasonBlockedByClient).Do(ctx)
				} else {
					// Extract response headers from the event
					headers := make(map[string]string)

					for _, header := range ev.ResponseHeaders {
						if header != nil {
							headers[header.Name] = header.Value
						}
					}

					// Extract POST data payload from the request
					payload := ""

					for _, content := range ev.Request.PostDataEntries {
						payload += content.Bytes
					}

					// Send the captured request details to the channel
					requests <- Request{
						URL:                ev.Request.URL,
						Method:             ev.Request.Method,
						ResponseHeaders:    headers,
						ResponseStatusCode: ev.ResponseStatusCode,
						Payload:            payload,
					}

					// Allow the request to continue normally
					fetch.ContinueRequest(ev.RequestID).Do(ctx)
				}
			}()
		}
	}
}
