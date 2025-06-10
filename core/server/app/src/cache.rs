use dashmap::DashMap;
use chrono::{DateTime, Utc};

/// Cada entrada del OTPCache asocia user_id (i32) con (otp: String, expires_at: DateTime<Utc>)
pub type OtpCache = DashMap<i32, (String, DateTime<Utc>)>;
