use std::os::raw::c_char;

pub type Task = extern "C" fn(context_id: i64) -> *mut c_char;
