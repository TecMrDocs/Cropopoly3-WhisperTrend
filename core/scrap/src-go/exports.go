package main

/*
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include "../../common/common.h"

static char *callTask(Task task, int64_t contextID) {
    return task(contextID);
}
*/
import "C"

import (
	"context"
	"libscraper/scraper"
	"sync"
	"sync/atomic"

	"github.com/chromedp/chromedp"
)

var Workers int = 5

var (
	scraperMap sync.Map
	contextMap sync.Map
)

var scraperNextID int64 = 1

func getNextScraperID() int64 {
	return atomic.AddInt64(&scraperNextID, 1) - 1
}

//export NewScraper
func NewScraper() C.int64_t {
	scrap := scraper.New(scraper.Config{
		Workers: Workers,
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
func Execute(id C.int64_t, contextID C.int64_t, task C.Task, result *C.int64_t) *C.char {
	scrapInterface, ok := scraperMap.Load(int64(id))
	if !ok {
		*result = C.int64_t(1)
		return C.CString("")
	}
	scrap := scrapInterface.(*scraper.Scraper)

	value, _ := scraper.Execute(scrap, func(ctx context.Context) (*C.char, error) {
		contextMap.Store(int64(contextID), &ctx)
		return C.callTask(task, contextID), nil
	})

	*result = C.int64_t(0)
	return value
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
