use crate::config::{Claims, Config};
use actix_web::{
    Error, HttpMessage, HttpResponse,
    body::MessageBody,
    dev::{ServiceRequest, ServiceResponse},
    middleware::Next,
};
use auth::TokenService;
use tracing::error;

const AUTH_HEADER: &str = "token";

pub async fn auth(
    req: ServiceRequest,
    next: Next<impl MessageBody + 'static>,
) -> Result<ServiceResponse<impl MessageBody>, Error> {
    if let Some(Some(token)) = req
        .headers()
        .get(AUTH_HEADER)
        .map(|s| s.to_str().ok().map(|s| s.to_string()))
    {
        if let Ok(claims) = TokenService::<Claims>::decode(&Config::get_secret_key(), &token) {
            // Check if the token has expired
            if claims.exp < chrono::Utc::now().timestamp() as usize {
                let response = HttpResponse::Unauthorized().finish();
                return Ok(req.into_response(response).map_into_right_body());
            }

            req.extensions_mut().insert(claims.id);
            return Ok(next.call(req).await?.map_into_left_body());
        }
    }

    error!("Unauthorized");
    let response = HttpResponse::Unauthorized().finish();
    Ok(req.into_response(response).map_into_right_body())
}
