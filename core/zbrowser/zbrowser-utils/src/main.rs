fn main() -> anyhow::Result<()> {
    let current_dir = String::from(env!("CARGO_MANIFEST_DIR"));
    let current_dir = std::path::Path::new(&current_dir);
    let workspace_root = current_dir
        .parent()
        .ok_or(anyhow::anyhow!("Could not get workspace root"))?;

    let src_go_dir = workspace_root.join("zbrowser-core/src-go");
    let libscraper_h = src_go_dir.join("libscraper.h");
    let libscraper_a = src_go_dir.join("libscraper.a");
    let bindings = workspace_root.join("zbrowser-core/bindings.rs");
    let common_dir = workspace_root.join("common/common.h");

    let _ = std::fs::remove_file(bindings);
    let _ = std::fs::remove_file(libscraper_h);
    let _ = std::fs::remove_file(libscraper_a);
    let _ = std::fs::remove_file(common_dir);

    std::process::Command::new("cargo")
        .current_dir(workspace_root.join("zbrowser-core"))
        .args(&["clean"])
        .output()?;

    Ok(())
}
