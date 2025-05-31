#![allow(unsafe_op_in_unsafe_fn)]
#![allow(improper_ctypes)]
#![allow(non_upper_case_globals)]
#![allow(non_camel_case_types)]
#![allow(non_snake_case)]
#![allow(dead_code)]

use dashmap::DashMap;
use lazy_static::lazy_static;
use std::{
    ffi::{CStr, CString},
    os::raw::c_char,
    sync::atomic::{AtomicI64, Ordering},
};
use tokio::task;
use tracing::error;

include!(concat!(env!("CARGO_MANIFEST_DIR"), "/bindings.rs"));

type Callback = Box<dyn Fn(i64) -> String + Send + Sync>;

lazy_static! {
    static ref NEXT_ID: AtomicI64 = AtomicI64::new(0);
    static ref CALLBACKS: DashMap<i64, Callback> = DashMap::new();
}

unsafe extern "C" fn callback_trampoline(context_id: i64) -> *mut c_char {
    if let Some(cb) = CALLBACKS.get(&context_id) {
        let result = cb(context_id);
        CString::new(result).unwrap_or_default().into_raw()
    } else {
        eprintln!("Not found callback for {}", context_id);
        CString::new("").unwrap_or_default().into_raw()
    }
}

fn register_callback(cb: Callback) -> i64 {
    let id = NEXT_ID.fetch_add(1, Ordering::Relaxed);
    CALLBACKS.insert(id, cb);
    id
}

pub enum BlockResource {
    Script,
    Stylesheet,
    Image,
    Font,
    Media,
    Other,
    Document,
    Manifest,
}

impl BlockResource {
    pub fn as_str(&self) -> &str {
        match self {
            BlockResource::Script => "script",
            BlockResource::Stylesheet => "stylesheet",
            BlockResource::Image => "image",
            BlockResource::Font => "font",
            BlockResource::Media => "media",
            BlockResource::Other => "other",
            BlockResource::Document => "document",
            BlockResource::Manifest => "manifest",
        }
    }
}

pub struct Scraper {
    id: i64,
}

pub struct Context {
    id: i64,
}

impl Context {
    pub fn new(id: i64) -> Self {
        Self { id }
    }

    pub fn navigate<T: AsRef<str>>(&self, url: T) {
        let c_url = CString::new(url.as_ref()).unwrap_or_default();
        unsafe {
            Navigate(self.id, c_url.as_ptr() as *mut c_char);
        }
    }

    pub fn set_user_agent<T: AsRef<str>>(&self, user_agent: T) {
        let c_user_agent = CString::new(user_agent.as_ref()).unwrap_or_default();
        unsafe {
            SetUserAgent(self.id, c_user_agent.as_ptr() as *mut c_char);
        }
    }

    pub fn wait_for_element<T: AsRef<str>>(&self, selector: T, timeout: i64) {
        let c_selector = CString::new(selector.as_ref()).unwrap_or_default();
        unsafe {
            WaitForElement(self.id, c_selector.as_ptr() as *mut c_char, timeout);
        }
    }

    pub fn evaluate<T: AsRef<str>>(&self, expr: T) -> String {
        let c_expr = CString::new(expr.as_ref()).unwrap_or_default();
        unsafe {
            let mut err = 0;
            let result = Evaluate(self.id, c_expr.as_ptr() as *mut c_char, &mut err);

            match err {
                0 => CStr::from_ptr(result).to_string_lossy().to_string(),
                _ => {
                    error!("Failed to evaluate expression");
                    String::new()
                }
            }
        }
    }

    pub fn get_html(&self) -> String {
        let mut err = 0;
        unsafe {
            let result = GetHTML(self.id, &mut err);

            match err {
                0 => CStr::from_ptr(result).to_string_lossy().to_string(),
                _ => {
                    error!("Failed to get HTML");
                    String::new()
                }
            }
        }
    }
}

impl Drop for Context {
    fn drop(&mut self) {
        unsafe {
            CloseContext(self.id);
        }
    }
}

impl Scraper {
    pub fn new<T: AsRef<str> + Default>(url: Option<T>, workers: i64, block_resources: Vec<BlockResource>) -> Self {
        let c_url = CString::new(url.unwrap_or_default().as_ref()).unwrap_or_default();
        let c_block_resources = block_resources
            .iter()
            .map(|r| CString::new(r.as_str()).unwrap_or_default())
            .collect::<Vec<_>>();

        let ptrs: Vec<*mut c_char> = c_block_resources.iter()
            .map(|s| s.as_ptr() as *mut c_char)
            .collect();

        unsafe {
            let slice = GoSlice {
                data: ptrs.as_ptr() as *mut std::ffi::c_void,
                len: ptrs.len() as GoInt,
                cap: ptrs.len() as GoInt,
            };
            
            let id = NewScraper(c_url.as_ptr() as *mut c_char, workers, slice);
            Self { id }
        }
    }

    pub async fn execute<F>(&self, task: F) -> String
    where
        F: Fn(Context) -> String + Send + Sync + 'static,
    {
        let scraper_id = self.id;

        task::spawn_blocking(move || {
            let context_id =
                register_callback(Box::new(move |context_id| task(Context::new(context_id))));

            unsafe {
                let mut err = 0;
                let result = Execute(scraper_id, context_id, Some(callback_trampoline), &mut err);

                match err {
                    0 => CStr::from_ptr(result).to_string_lossy().to_string(),
                    _ => {
                        error!("Failed to execute task");
                        String::new()
                    }
                }
            }
        })
        .await
        .unwrap_or_default()
    }
}

impl Drop for Scraper {
    fn drop(&mut self) {
        unsafe {
            Close(self.id);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // #[tokio::test]
    // async fn test_execute() {
    //     let scraper = Scraper::new::<&str>(None, 1, vec![]);
    //     let title = scraper
    //         .execute(|ctx| {
    //             ctx.navigate("https://www.example.com");
    //             return ctx.evaluate("document.querySelector('h1').textContent");
    //         })
    //         .await;

    //     assert_eq!(title, "Example Domain");
    // }

    #[tokio::test]
    async fn test_reddit() {
        let scraper = Scraper::new::<&str>(Some("ws://localhost:9222"), 1, vec![]);
        let title = scraper
            .execute(|ctx| {
                ctx.navigate("https://www.reddit.com/search/?q=tesla");
                return ctx.evaluate("document.documentElement.outerHTML");
            })
            .await;

        println!("p: {}", title);
    }
}
