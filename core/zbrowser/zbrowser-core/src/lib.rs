//! ZBrowser Core Library
//! 
//! This library provides a Rust wrapper around native browser automation bindings.
//! It allows for web scraping and browser automation tasks through a high-level API
//! that manages browser contexts and execution of JavaScript operations.

// Allow unsafe operations and non-standard naming conventions
// These are necessary due to FFI (Foreign Function Interface) requirements
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
    sync::{
        Arc, Mutex,
        atomic::{AtomicI64, Ordering},
    },
};
use tokio::task;
use tracing::error;

// Include the native bindings generated at compile time
include!(concat!(env!("CARGO_MANIFEST_DIR"), "/bindings.rs"));

/// Type alias for callback functions that receive a context ID
type Callback = Box<dyn Fn(i64) + Send + Sync>;

lazy_static! {
    /// Global atomic counter for generating unique callback IDs
    static ref NEXT_ID: AtomicI64 = AtomicI64::new(0);
    /// Global thread-safe map storing registered callbacks by their ID
    static ref CALLBACKS: DashMap<i64, Callback> = DashMap::new();
}

/// C-compatible callback trampoline function
/// This function is called from the native layer and dispatches to the appropriate Rust callback
unsafe extern "C" fn callback_trampoline(context_id: i64) {
    if let Some(cb) = CALLBACKS.get(&context_id) {
        cb(context_id);
    } else {
        eprintln!("Not found callback for {}", context_id);
    }
}

/// Registers a callback function and returns its unique ID
/// 
/// # Arguments
/// * `cb` - The callback function to register
/// 
/// # Returns
/// A unique ID that can be used to identify this callback
fn register_callback(cb: Callback) -> i64 {
    let id = NEXT_ID.fetch_add(1, Ordering::Relaxed);
    CALLBACKS.insert(id, cb);
    id
}

/// Enumeration of resource types that can be blocked during browser automation
/// This helps optimize performance by preventing unnecessary resource loading
pub enum BlockResource {
    /// JavaScript files
    Script,
    /// CSS stylesheets
    Stylesheet,
    /// Image files
    Image,
    /// Font files
    Font,
    /// Media files (audio, video)
    Media,
    /// Other miscellaneous resources
    Other,
    /// HTML documents
    Document,
    /// Web app manifests
    Manifest,
}

impl BlockResource {
    /// Returns the string representation of the resource type
    /// Used when communicating with the native browser layer
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

/// Main scraper instance that manages browser automation
/// Each scraper can handle multiple concurrent browser contexts
pub struct Scraper {
    /// Unique identifier for this scraper instance
    id: i64,
}

/// Browser context representing a single browser tab/window
/// Provides methods for navigation, element interaction, and JavaScript execution
pub struct Context {
    /// Unique identifier for this context
    id: i64,
}

impl Context {
    /// Creates a new context with the given ID
    /// 
    /// # Arguments
    /// * `id` - The unique identifier for this context
    pub fn new(id: i64) -> Self {
        Self { id }
    }

    /// Navigates the browser context to the specified URL
    /// 
    /// # Arguments
    /// * `url` - The URL to navigate to
    pub fn navigate<T: AsRef<str>>(&self, url: T) {
        let c_url = CString::new(url.as_ref()).unwrap_or_default();
        unsafe {
            Navigate(self.id, c_url.as_ptr() as *mut c_char);
        }
    }

    /// Sets the user agent string for this browser context
    /// 
    /// # Arguments
    /// * `user_agent` - The user agent string to use
    pub fn set_user_agent<T: AsRef<str>>(&self, user_agent: T) {
        let c_user_agent = CString::new(user_agent.as_ref()).unwrap_or_default();
        unsafe {
            SetUserAgent(self.id, c_user_agent.as_ptr() as *mut c_char);
        }
    }

    /// Waits for an element matching the given CSS selector to appear
    /// 
    /// # Arguments
    /// * `selector` - CSS selector for the element to wait for
    /// * `timeout` - Maximum time to wait in milliseconds
    pub fn wait_for_element<T: AsRef<str>>(&self, selector: T, timeout: i64) {
        let c_selector = CString::new(selector.as_ref()).unwrap_or_default();
        unsafe {
            WaitForElement(self.id, c_selector.as_ptr() as *mut c_char, timeout);
        }
    }

    /// Types text into an input element
    /// 
    /// # Arguments
    /// * `selector` - CSS selector for the input element
    /// * `text` - Text to type into the element
    pub fn write_input<T: AsRef<str>, U: AsRef<str>>(&self, selector: T, text: U) {
        let c_selector = CString::new(selector.as_ref()).unwrap_or_default();
        let c_text = CString::new(text.as_ref()).unwrap_or_default();
        unsafe {
            WriteInput(
                self.id,
                c_selector.as_ptr() as *mut c_char,
                c_text.as_ptr() as *mut c_char,
            );
        }
    }

    /// Clicks on an element matching the given CSS selector
    /// 
    /// # Arguments
    /// * `selector` - CSS selector for the element to click
    pub fn click_element<T: AsRef<str>>(&self, selector: T) {
        let c_selector = CString::new(selector.as_ref()).unwrap_or_default();
        unsafe {
            ClickElement(self.id, c_selector.as_ptr() as *mut c_char);
        }
    }

    /// Retrieves all cookies as a string
    /// 
    /// # Returns
    /// A string representation of all cookies, or an empty string on error
    pub fn string_cookies(&self) -> String {
        unsafe {
            let mut err = 0;
            let result = StringCookies(self.id, &mut err);

            match err {
                0 => CStr::from_ptr(result).to_string_lossy().to_string(),
                _ => {
                    error!("Failed to get cookies");
                    String::new()
                }
            }
        }
    }

    /// Sets cookies from a string representation
    /// 
    /// # Arguments
    /// * `cookies` - String representation of cookies to set
    pub fn set_string_cookies<T: AsRef<str>>(&self, cookies: T) {
        let c_cookies = CString::new(cookies.as_ref()).unwrap_or_default();
        unsafe {
            SetStringCookies(self.id, c_cookies.as_ptr() as *mut c_char);
        }
    }

    /// Executes a JavaScript expression synchronously and returns the result
    /// 
    /// # Arguments
    /// * `expr` - JavaScript expression to evaluate
    /// 
    /// # Returns
    /// String result of the JavaScript evaluation, or empty string on error
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

    /// Executes a JavaScript expression asynchronously and returns the result
    /// 
    /// # Arguments
    /// * `expr` - JavaScript expression to evaluate
    /// 
    /// # Returns
    /// String result of the JavaScript evaluation, or empty string on error
    pub fn async_evaluate<T: AsRef<str>>(&self, expr: T) -> String {
        let c_expr = CString::new(expr.as_ref()).unwrap_or_default();
        unsafe {
            let mut err = 0;
            let result = AsyncEvaluate(self.id, c_expr.as_ptr() as *mut c_char, &mut err);

            match err {
                0 => CStr::from_ptr(result).to_string_lossy().to_string(),
                _ => {
                    error!("Failed to evaluate expression");
                    String::new()
                }
            }
        }
    }

    /// Retrieves the HTML content of the current page
    /// 
    /// # Returns
    /// HTML content as a string, or empty string on error
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

/// Automatically closes the browser context when dropped
impl Drop for Context {
    fn drop(&mut self) {
        unsafe {
            CloseContext(self.id);
        }
    }
}

impl Scraper {
    /// Creates a new scraper instance
    /// 
    /// # Arguments
    /// * `url` - Optional initial URL to navigate to
    /// * `workers` - Number of worker threads for concurrent operations
    /// * `block_resources` - List of resource types to block for performance
    /// 
    /// # Returns
    /// A new Scraper instance
    pub fn new<T: AsRef<str> + Default>(
        url: Option<T>,
        workers: i64,
        block_resources: Vec<BlockResource>,
    ) -> Self {
        let c_url = CString::new(url.unwrap_or_default().as_ref()).unwrap_or_default();
        let c_block_resources = block_resources
            .iter()
            .map(|r| CString::new(r.as_str()).unwrap_or_default())
            .collect::<Vec<_>>();

        let ptrs: Vec<*mut c_char> = c_block_resources
            .iter()
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

    /// Internal method to execute a task with a browser context
    /// This method handles the low-level callback registration and execution
    async fn raw_execute<F>(&self, task: F)
    where
        F: Fn(Context) + Send + Sync + 'static,
    {
        let scraper_id = self.id;

        task::spawn_blocking(move || {
            let context_id =
                register_callback(Box::new(move |context_id| task(Context::new(context_id))));

            unsafe {
                let mut err = 0;
                Execute(scraper_id, context_id, Some(callback_trampoline), &mut err);

                match err {
                    0 => (),
                    _ => {
                        error!("Failed to execute task");
                    }
                }
            }
        })
        .await
        .unwrap_or_default()
    }

    /// Executes a task with a browser context and returns the result
    /// 
    /// # Arguments
    /// * `task` - Function that takes a Context and returns a result
    /// 
    /// # Returns
    /// Result containing the task's return value or an error
    /// 
    /// # Type Parameters
    /// * `F` - Function type that takes Context and returns R
    /// * `R` - Return type of the task function
    pub async fn execute<F, R>(&self, task: F) -> anyhow::Result<R>
    where
        F: Fn(Context) -> R + Send + Sync + 'static,
        R: Send + Sync + 'static,
    {
        let result = Arc::new(Mutex::new(None::<R>));
        let result_clone = Arc::clone(&result);

        self.raw_execute(move |ctx| {
            let task_result = task(ctx);
            if let Ok(mut guard) = result_clone.lock() {
                *guard = Some(task_result);
            }
        })
        .await;

        if let Ok(mut guard) = result.lock() {
            guard
                .take()
                .ok_or_else(|| anyhow::anyhow!("Failed to execute task"))
        } else {
            Err(anyhow::anyhow!("Failed to lock result"))
        }
    }
}

/// Automatically closes the scraper when dropped
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

    /// Test case demonstrating basic scraper functionality
    /// Creates a scraper, navigates to example.com, and extracts the page title
    #[tokio::test]
    async fn test_execute() {
        let scraper = Scraper::new::<&str>(None, 1, vec![]);
        let title = scraper
            .execute(|ctx| {
                ctx.navigate("https://www.example.com");
                return ctx.evaluate("document.querySelector('h1').textContent");
            })
            .await;

        assert_eq!(title.unwrap(), "Example Domain");
    }
}
