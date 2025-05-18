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
    sync::atomic::{AtomicI64, Ordering},
};
use tracing::error;

include!(concat!(env!("CARGO_MANIFEST_DIR"), "/bindings.rs"));

type Callback = Box<dyn Fn(i64) -> String + Send + Sync>;

lazy_static! {
    static ref NEXT_ID: AtomicI64 = AtomicI64::new(0);
    static ref CALLBACKS: DashMap<i64, Callback> = DashMap::new();
}

unsafe extern "C" fn callback_trampoline(context_id: i64) -> *mut i8 {
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
            Navigate(self.id, c_url.as_ptr() as *mut i8);
        }
    }

    pub fn evaluate<T: AsRef<str>>(&self, expr: T) -> String {
        let c_expr = CString::new(expr.as_ref()).unwrap_or_default();
        unsafe {
            let mut err = 0;
            let result: *mut i8 = Evaluate(self.id, c_expr.as_ptr() as *mut i8, &mut err);

            match err {
                0 => CStr::from_ptr(result).to_string_lossy().to_string(),
                _ => {
                    error!("Failed to evaluate expression");
                    String::new()
                },
            }
        }
    }

    pub fn get_html(&self) -> String {
        let mut err = 0;
        unsafe {
            let result: *mut i8 = GetHTML(self.id, &mut err);

            match err {
                0 => CStr::from_ptr(result).to_string_lossy().to_string(),
                _ => {
                    error!("Failed to get HTML");
                    String::new()
                },
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
    pub fn new() -> Self {
        unsafe {
            let id = NewScraper();
            Self { id }
        }
    }

    pub fn execute(&self, task: impl Fn(Context) -> String + Send + Sync + 'static) -> String {
        let context_id =
            register_callback(Box::new(move |context_id| task(Context::new(context_id))));

        unsafe {
            let mut err = 0;
            let result = Execute(self.id, context_id, Some(callback_trampoline), &mut err);

            match err {
                0 => CStr::from_ptr(result).to_string_lossy().to_string(),
                _ => {
                    error!("Failed to execute task");
                    String::new()
                },
            }
        }
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

    #[test]
    fn test_execute() {
        let scraper = Scraper::new();
        let title = scraper.execute(|ctx| {
            ctx.navigate("https://www.example.com");
            return ctx.evaluate("document.querySelector('h1').textContent");
        });

        assert_eq!(title, "Example Domain");
    }
}
