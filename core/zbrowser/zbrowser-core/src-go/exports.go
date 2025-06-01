package main

/*
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include "../../common/common.h"

static inline void callTask(Task task, int64_t contextID) {
    task(contextID);
}
*/
import "C"

import (
	"context"
	"libscraper/scraper"
	"sync"
	"sync/atomic"
	"time"

	"github.com/chromedp/cdproto/emulation"
	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/chromedp"
)

var (
	scraperMap sync.Map
	contextMap sync.Map
)

var scraperNextID int64 = 1

func getNextScraperID() int64 {
	return atomic.AddInt64(&scraperNextID, 1) - 1
}

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

//export NewScraper
func NewScraper(url *C.char, workers C.int64_t, blockResources []*C.char) C.int64_t {
	urlStr := C.GoString(url)

	var urlPtr *string
	if urlStr != "" {
		urlPtr = &urlStr
	}

	var blockResourcesList []network.ResourceType
	for _, resource := range blockResources {
		resourceStr := C.GoString(resource)
		if resourceType, ok := mapBlockResources[resourceStr]; ok {
			blockResourcesList = append(blockResourcesList, resourceType)
		}
	}

	scrap := scraper.New(scraper.Config{
		Workers:        int(workers),
		Url:            urlPtr,
		BlockResources: blockResourcesList,
	})

	id := getNextScraperID()
	scraperMap.Store(id, scrap)

	return C.int64_t(id)
}

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

//export Evaluate
func Evaluate(ctxID C.int64_t, expr *C.char, result *C.int64_t) *C.char {
	ctxInterface, ok := contextMap.Load(int64(ctxID))
	if !ok {
		*result = C.int64_t(1)
		return C.CString("")
	}
	ctx := ctxInterface.(*context.Context)

	var resultStr string
	err := chromedp.Run(*ctx, chromedp.Evaluate(C.GoString(expr), &resultStr))
	if err != nil {
		*result = C.int64_t(1)
		return C.CString("")
	}
	return C.CString(resultStr)
}

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

//export WaitForElement
func WaitForElement(ctxID C.int64_t, selector *C.char, timeoutMs C.int64_t) C.int64_t {
	ctxInterface, ok := contextMap.Load(int64(ctxID))
	if !ok {
		return C.int64_t(1)
	}
	ctx := ctxInterface.(*context.Context)

	timeoutDuration := time.Duration(timeoutMs) * time.Millisecond
	timeoutCtx, cancel := context.WithTimeout(*ctx, timeoutDuration)
	defer cancel()

	err := chromedp.Run(timeoutCtx, chromedp.WaitReady(C.GoString(selector), chromedp.ByQuery))
	if err != nil {
		return C.int64_t(1)
	}

	return C.int64_t(0)
}

//export GetHTML
func GetHTML(ctxID C.int64_t, result *C.int64_t) *C.char {
	ctxInterface, ok := contextMap.Load(int64(ctxID))
	if !ok {
		*result = C.int64_t(1)
		return C.CString("")
	}
	ctx := ctxInterface.(*context.Context)

	const jsScript = `
	(() => {
			const serializeNode = (node) => {
					if (node.nodeType === 3) return node.textContent;
					if (node.nodeType === 8) return '<!--' + node.textContent + '-->';
					
					let html = '<' + node.localName;
					
					for (const attr of node.attributes || []) {
							html += ' ' + attr.name + '="' + attr.value.replace(/"/g, '&quot;') + '"';
					}
					
					html += '>';
					
					if (node.shadowRoot) {
							html += '<!--shadow-root-->';
							for (const child of node.shadowRoot.childNodes) {
									html += serializeNode(child);
							}
							html += '<!--/shadow-root-->';
					}
					
					for (const child of node.childNodes) {
							html += serializeNode(child);
					}
					
					if (!node.localName) return html;
					return html + '</' + node.localName + '>';
			};
			
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

//export Execute
func Execute(id C.int64_t, contextID C.int64_t, task C.Task, result *C.int64_t) {
	scrapInterface, ok := scraperMap.Load(int64(id))
	if !ok {
		*result = C.int64_t(1)
		return
	}
	scrap := scrapInterface.(*scraper.Scraper)

	_, err := scrap.Execute(func(ctx context.Context) (any, error) {
		contextMap.Store(int64(contextID), &ctx)
		C.callTask(task, contextID)
		return struct{}{}, nil
	})

	if err != nil {
		*result = C.int64_t(1)
	} else {
		*result = C.int64_t(0)
	}
}

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

//export CloseContext
func CloseContext(id C.int64_t) {
	contextMap.Delete(int64(id))
}
