use crate::scraping::SCRAPER;
use lazy_static::lazy_static;
use fake::{Fake, faker::internet::en::UserAgent};
use scraper::{ElementRef, Html, Selector};

const INSTAGRAM_LOGIN_URL: &str = "https://www.instagram.com/accounts/login/";
const INSTAGRAM_POST_URL: &str = "https://www.instagram.com/explore/tags/";

lazy_static! {
  // login
  static ref USERNAME_SELECTOR: Selector = Selector::parse("input[name='username']").unwrap();
  static ref PASSWORD_SELECTOR: Selector = Selector::parse("input[name='password']").unwrap();
  static ref LOGIN_BUTTON_SELECTOR: Selector = Selector::parse("button[type='submit']").unwrap();
}

pub struct InstagramScraper;

impl InstagramScraper {
    pub async fn login() -> anyhow::Result<()> {
        // let cookies = SCRAPER
        //     .execute_any(move |context| {
        //         let user_agent: String = UserAgent().fake();
        //         context.set_user_agent(&user_agent);
        //         context.navigate(INSTAGRAM_LOGIN_URL);
        //         String::from("")
        //     })
        //     .await;

        Ok(())
    }
}
