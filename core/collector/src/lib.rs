#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let scraper = scraper::Scraper::new();
        let title = scraper.execute(|ctx| {
            ctx.navigate(String::from("https://www.example.com/"));
            ctx.evaluate(String::from("document.title"))
        });

        assert_eq!(title, "Example Domain");
    }
}
