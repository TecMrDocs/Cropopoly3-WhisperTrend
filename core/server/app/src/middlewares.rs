use crate::config::{Claims, Config};
use actix_web::{
    Error, HttpMessage, HttpResponse,
    body::MessageBody,
    dev::{ServiceRequest, ServiceResponse},
    middleware::Next,
};
use auth::TokenService;
use tracing::error;

// Header name where the authentication token is expected
const AUTH_HEADER: &str = "token";

/// Authentication middleware that validates JWT tokens
/// Extracts token from request headers, validates it, and adds user ID to request extensions
pub async fn auth(
    req: ServiceRequest,
    next: Next<impl MessageBody + 'static>,
) -> Result<ServiceResponse<impl MessageBody>, Error> {
    // Extract token from the "token" header
    if let Some(Some(token)) = req
        .headers()
        .get(AUTH_HEADER)
        .map(|s| s.to_str().ok().map(|s| s.to_string()))
    {
        // Decode and validate the JWT token
        if let Ok(claims) = TokenService::<Claims>::decode(&Config::get_secret_key(), &token) {
            // Check if the token has expired
            if claims.exp < chrono::Utc::now().timestamp() as usize {
                let response = HttpResponse::Unauthorized().finish();
                return Ok(req.into_response(response).map_into_right_body());
            }

            // Token is valid - add user ID to request extensions for downstream handlers
            req.extensions_mut().insert(claims.id);
            return Ok(next.call(req).await?.map_into_left_body());
        }
    }

    // No valid token found - return unauthorized response
    error!("Unauthorized");
    let response = HttpResponse::Unauthorized().finish();
    Ok(req.into_response(response).map_into_right_body())
}
