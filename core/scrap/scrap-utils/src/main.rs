fn main() -> anyhow::Result<()> {
    let current_dir = String::from(env!("CARGO_MANIFEST_DIR"));
    let current_dir = std::path::Path::new(&current_dir);
    let workspace_root = current_dir
        .parent()
        .ok_or(anyhow::anyhow!("Could not get workspace root"))?;

    let src_go_dir = workspace_root.join("scrap-core/src-go");
    let libscraper_h = src_go_dir.join("libscraper.h");
    let libscraper_a = src_go_dir.join("libscraper.a");
    let bindings = workspace_root.join("scrap-core/bindings.rs");

    let _ = std::fs::remove_file(bindings);
    let _ = std::fs::remove_file(libscraper_h);
    let _ = std::fs::remove_file(libscraper_a);

    std::process::Command::new("cargo")
        .current_dir(workspace_root.join("scrap-core"))
        .args(&["clean"])
        .output()?;

    Ok(())
}
