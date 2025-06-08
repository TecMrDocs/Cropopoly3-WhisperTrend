package main

/*
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include "../../common/common.h"

// Helper function to call a task with a context ID from C
static inline void callTask(Task task, int64_t contextID) {
    task(contextID);
}
*/
import "C"

import (
	"context"
	"encoding/json"
	"fmt"
	"libscraper/scraper"
	"sync"
	"sync/atomic"
	"time"

	"github.com/chromedp/cdproto/emulation"
	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/cdproto/runtime"
	"github.com/chromedp/chromedp"
)

// Global maps to store scrapers and browser contexts
// scraperMap stores scraper instances indexed by ID
// contextMap stores browser contexts indexed by ID
var (
	scraperMap sync.Map
	contextMap sync.Map
)

// Atomic counter for generating unique scraper IDs
var scraperNextID int64 = 1

// getNextScraperID generates the next unique scraper ID atomically
func getNextScraperID() int64 {
	return atomic.AddInt64(&scraperNextID, 1) - 1
}

// mapBlockResources maps string resource names to ChromeDP network resource types
// Used to block specific types of resources during page loading
var mapBlockResources = map[string]network.ResourceType{
	"script":     network.ResourceTypeScript,
	"stylesheet": network.ResourceTypeStylesheet,
	"image":      network.ResourceTypeImage,
	"font":       network.ResourceTypeFont,
	"media":      network.ResourceTypeMedia,
	"other":      network.ResourceTypeOther,
	"document":   network.ResourceTypeDocument,
	"manifest":   network.ResourceTypeManifest,
}

// NewScraper creates a new scraper instance with the specified configuration
// Parameters:
//   - url: Initial URL to navigate to (can be empty)
//   - workers: Number of worker goroutines for the scraper
//   - blockResources: Array of resource types to block during page loading
//
// Returns: Unique scraper ID
//
//export NewScraper
func NewScraper(url *C.char, workers C.int64_t, blockResources []*C.char) C.int64_t {
	urlStr := C.GoString(url)

	// Convert empty string to nil pointer
	var urlPtr *string
	if urlStr != "" {
		urlPtr = &urlStr
	}

	// Convert C string array to Go slice of network resource types
	var blockResourcesList []network.ResourceType
	for _, resource := range blockResources {
		resourceStr := C.GoString(resource)
		if resourceType, ok := mapBlockResources[resourceStr]; ok {
			blockResourcesList = append(blockResourcesList, resourceType)
		}
	}

	// Create new scraper with configuration
	scrap := scraper.New(scraper.Config{
		Workers:        int(workers),
		Url:            urlPtr,
		BlockResources: blockResourcesList,
	})

	// Store scraper in global map with unique ID
	id := getNextScraperID()
	scraperMap.Store(id, scrap)

	return C.int64_t(id)
}

// Navigate navigates the browser context to the specified URL
// Parameters:
//   - ctxID: Browser context ID
//   - url: URL to navigate to
//
// Returns: 0 on success, 1 on error
//
//export Navigate
func Navigate(ctxID C.int64_t, url *C.char) C.int64_t {
	ctxInterface, ok := contextMap.Load(int64(ctxID))
	if !ok {
		return C.int64_t(1)
	}
	ctx := ctxInterface.(*context.Context)

	err := chromedp.Run(*ctx, chromedp.Navigate(C.GoString(url)))
	if err != nil {
		return C.int64_t(1)
	}
	return C.int64_t(0)
}

// Evaluate executes JavaScript code synchronously in the browser context
// Parameters:
//   - ctxID: Browser context ID
//   - expr: JavaScript expression to evaluate
//   - result: Pointer to store the result code (0 = success, 1 = error)
//
// Returns: String result of the JavaScript evaluation
//
//export Evaluate
func Evaluate(ctxID C.int64_t, expr *C.char, result *C.int64_t) *C.char {
	ctxInterface, ok := contextMap.Load(int64(ctxID))
	if !ok {
		fmt.Println("Evaluate: Context not found")
		*result = C.int64_t(1)
		return C.CString("")
	}
	ctx := ctxInterface.(*context.Context)

	var resultStr string
	err := chromedp.Run(*ctx, chromedp.Evaluate(C.GoString(expr), &resultStr))
	if err != nil {
		fmt.Println("Evaluate: ", err)
		*result = C.int64_t(1)
		return C.CString("")
	}
	return C.CString(resultStr)
}

// AsyncEvaluate executes JavaScript code asynchronously in the browser context
// Waits for Promise resolution if the expression returns a Promise
// Parameters:
//   - ctxID: Browser context ID
//   - expr: JavaScript expression to evaluate
//   - result: Pointer to store the result code (0 = success, 1 = error)
//
// Returns: String result of the JavaScript evaluation
//
//export AsyncEvaluate
func AsyncEvaluate(ctxID C.int64_t, expr *C.char, result *C.int64_t) *C.char {
	ctxInterface, ok := contextMap.Load(int64(ctxID))
	if !ok {
		fmt.Println("AsyncEvaluate: Context not found")
		*result = C.int64_t(1)
		return C.CString("")
	}
	ctx := ctxInterface.(*context.Context)

	var resultStr string
	err := chromedp.Run(*ctx, chromedp.Evaluate(C.GoString(expr), &resultStr, func(p *runtime.EvaluateParams) *runtime.EvaluateParams {
		return p.WithAwaitPromise(true)
	}))
	if err != nil {
		fmt.Println("AsyncEvaluate: ", err)
		*result = C.int64_t(1)
		return C.CString("")
	}
	return C.CString(resultStr)
}

// SetUserAgent sets the user agent string for the browser context
// Parameters:
//   - ctxID: Browser context ID
//   - userAgent: User agent string to set
//
// Returns: 0 on success, 1 on error
//
//export SetUserAgent
func SetUserAgent(ctxID C.int64_t, userAgent *C.char) C.int64_t {
	ctxInterface, ok := contextMap.Load(int64(ctxID))
	if !ok {
		return C.int64_t(1)
	}

	ctx := ctxInterface.(*context.Context)
	err := chromedp.Run(*ctx, emulation.SetUserAgentOverride(C.GoString(userAgent)))
	if err != nil {
		return C.int64_t(1)
	}
	return C.int64_t(0)
}

// WaitForElement waits for a DOM element to be ready/available
// Parameters:
//   - ctxID: Browser context ID
//   - selector: CSS selector for the element to wait for
//   - timeoutMs: Timeout in milliseconds
//
// Returns: 0 on success, 1 on error/timeout
//
//export WaitForElement
func WaitForElement(ctxID C.int64_t, selector *C.char, timeoutMs C.int64_t) C.int64_t {
	ctxInterface, ok := contextMap.Load(int64(ctxID))
	if !ok {
		return C.int64_t(1)
	}
	ctx := ctxInterface.(*context.Context)

	// Create timeout context
	timeoutDuration := time.Duration(timeoutMs) * time.Millisecond
	timeoutCtx, cancel := context.WithTimeout(*ctx, timeoutDuration)
	defer cancel()

	err := chromedp.Run(timeoutCtx, chromedp.WaitReady(C.GoString(selector), chromedp.ByQuery))
	if err != nil {
		return C.int64_t(1)
	}

	return C.int64_t(0)
}

// WriteInput types text into an input element
// Parameters:
//   - ctxID: Browser context ID
//   - selector: CSS selector for the input element
//   - text: Text to type into the input
//
// Returns: 0 on success, 1 on error
//
//export WriteInput
func WriteInput(ctxID C.int64_t, selector *C.char, text *C.char) C.int64_t {
	ctxInterface, ok := contextMap.Load(int64(ctxID))
	if !ok {
		return C.int64_t(1)
	}
	ctx := ctxInterface.(*context.Context)

	err := chromedp.Run(*ctx, chromedp.SendKeys(C.GoString(selector), C.GoString(text)))
	if err != nil {
		return C.int64_t(1)
	}
	return C.int64_t(0)
}

// ClickElement clicks on a DOM element
// Parameters:
//   - ctxID: Browser context ID
//   - selector: CSS selector for the element to click
//
// Returns: 0 on success, 1 on error
//
//export ClickElement
func ClickElement(ctxID C.int64_t, selector *C.char) C.int64_t {
	ctxInterface, ok := contextMap.Load(int64(ctxID))
	if !ok {
		return C.int64_t(1)
	}
	ctx := ctxInterface.(*context.Context)

	err := chromedp.Run(*ctx, chromedp.Click(C.GoString(selector), chromedp.ByQuery))
	if err != nil {
		return C.int64_t(1)
	}
	return C.int64_t(0)
}

// StringCookies retrieves all cookies from the browser context as a JSON string
// Parameters:
//   - ctxID: Browser context ID
//   - result: Pointer to store the result code (0 = success, 1 = error)
//
// Returns: JSON string containing all cookies
//
//export StringCookies
func StringCookies(ctxID C.int64_t, result *C.int64_t) *C.char {
	ctxInterface, ok := contextMap.Load(int64(ctxID))
	if !ok {
		*result = C.int64_t(1)
		return C.CString("")
	}
	ctx := ctxInterface.(*context.Context)

	// Get all cookies from the browser
	var cookies []*network.Cookie
	err := chromedp.Run(*ctx, chromedp.ActionFunc(func(ctx context.Context) error {
		var err error
		cookies, err = network.GetCookies().Do(ctx)
		return err
	}))

	if err != nil {
		fmt.Println(err)
		*result = C.int64_t(1)
		return C.CString("[]")
	}

	// Marshal cookies to JSON
	var jsonCookies []byte
	jsonCookies, err = json.Marshal(cookies)
	if err != nil {
		fmt.Println(err)
		*result = C.int64_t(1)
		return C.CString("[]")
	}

	*result = C.int64_t(0)
	return C.CString(string(jsonCookies))
}

// SetStringCookies sets cookies in the browser context from a JSON string
// Parameters:
//   - ctxID: Browser context ID
//   - stringCookies: JSON string containing cookie parameters
//
// Returns: 0 on success, 1 on error
//
//export SetStringCookies
func SetStringCookies(ctxID C.int64_t, stringCookies *C.char) C.int64_t {
	ctxInterface, ok := contextMap.Load(int64(ctxID))
	if !ok {
		return C.int64_t(1)
	}

	ctx := ctxInterface.(*context.Context)

	err := chromedp.Run(*ctx, chromedp.ActionFunc(func(ctx context.Context) error {
		var err error
		var cookies []*network.CookieParam
		// Unmarshal JSON string to cookie parameters
		err = json.Unmarshal([]byte(C.GoString(stringCookies)), &cookies)
		if err != nil {
			return err
		}
		// Set cookies in the browser
		err = network.SetCookies(cookies).Do(ctx)
		return err
	}))

	if err != nil {
		return C.int64_t(1)
	}

	return C.int64_t(0)
}

// GetHTML retrieves the complete HTML content of the current page
// Includes shadow DOM content and handles serialization properly
// Parameters:
//   - ctxID: Browser context ID
//   - result: Pointer to store the result code (0 = success, 1 = error)
//
// Returns: Complete HTML content as a string
//
//export GetHTML
func GetHTML(ctxID C.int64_t, result *C.int64_t) *C.char {
	ctxInterface, ok := contextMap.Load(int64(ctxID))
	if !ok {
		*result = C.int64_t(1)
		return C.CString("")
	}
	ctx := ctxInterface.(*context.Context)

	// JavaScript code to serialize the entire DOM including shadow DOM
	const jsScript = `
	(() => {
			const serializeNode = (node) => {
					// Handle text nodes
					if (node.nodeType === 3) return node.textContent;
					// Handle comment nodes
					if (node.nodeType === 8) return '<!--' + node.textContent + '-->';
					
					// Handle element nodes
					let html = '<' + node.localName;
					
					// Add attributes
					for (const attr of node.attributes || []) {
							html += ' ' + attr.name + '="' + attr.value.replace(/"/g, '&quot;') + '"';
					}
					
					html += '>';
					
					// Handle shadow DOM
					if (node.shadowRoot) {
							html += '<!--shadow-root-->';
							for (const child of node.shadowRoot.childNodes) {
									html += serializeNode(child);
							}
							html += '<!--/shadow-root-->';
					}
					
					// Handle child nodes
					for (const child of node.childNodes) {
							html += serializeNode(child);
					}
					
					// Close tag
					if (!node.localName) return html;
					return html + '</' + node.localName + '>';
			};
			
			// Serialize from document element
			return serializeNode(document.documentElement);
	})();
	`

	var htmlContent string
	err := chromedp.Run(*ctx, chromedp.Evaluate(jsScript, &htmlContent))
	if err != nil {
		*result = C.int64_t(1)
		return C.CString("")
	}

	*result = C.int64_t(0)
	return C.CString(htmlContent)
}

// Execute runs a task within a scraper context
// The task is a C function that will be called with the context ID
// Parameters:
//   - id: Scraper ID
//   - contextID: Context ID to pass to the task
//   - task: C function pointer to execute
//   - result: Pointer to store the result code (0 = success, 1 = error)
//
//export Execute
func Execute(id C.int64_t, contextID C.int64_t, task C.Task, result *C.int64_t) {
	scrapInterface, ok := scraperMap.Load(int64(id))
	if !ok {
		*result = C.int64_t(1)
		return
	}
	scrap := scrapInterface.(*scraper.Scraper)

	// Execute the task within the scraper context
	_, err := scrap.Execute(func(ctx context.Context) (any, error) {
		// Store the context for the task to use
		contextMap.Store(int64(contextID), &ctx)
		// Call the C task function
		C.callTask(task, contextID)
		return struct{}{}, nil
	})

	if err != nil {
		*result = C.int64_t(1)
	} else {
		*result = C.int64_t(0)
	}
}

// Close shuts down a scraper instance and removes it from the global map
// Parameters:
//   - id: Scraper ID to close
//
//export Close
func Close(id C.int64_t) {
	scrapInterface, ok := scraperMap.Load(int64(id))
	if !ok {
		return
	}
	scrap := scrapInterface.(*scraper.Scraper)
	scrap.Close()
	scraperMap.Delete(int64(id))
}

// CloseContext removes a browser context from the global map
// Parameters:
//   - id: Context ID to remove
//
//export CloseContext
func CloseContext(id C.int64_t) {
	contextMap.Delete(int64(id))
}
