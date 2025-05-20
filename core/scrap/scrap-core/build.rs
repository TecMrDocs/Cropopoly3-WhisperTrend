use bindgen;
use std::{
    env,
    fs,
    path::{Path, PathBuf},
    process::Command,
    time::SystemTime,
};

const LIB: &str = "scraper";

fn main() {
    let current_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").expect("Failed to get CARGO_MANIFEST_DIR"));
    let src_go = current_dir.join("src-go");

    let profile = env::var("PROFILE").unwrap_or_else(|_| "debug".to_string());

    build_common_library(&profile);

    if cfg!(target_os = "macos") {
        println!("cargo:rustc-link-lib=framework=CoreFoundation");
        println!("cargo:rustc-link-lib=framework=Security");
    }

    let lib_extension = if cfg!(target_os = "windows") { "lib" } else { "a" };
    let lib_path = src_go.join(format!("lib{}.{}", LIB, lib_extension));

    if needs_rebuild(&src_go, &lib_path) {
        println!("cargo:warning=Rebuilding Go library...");
        build_go_library(&src_go, &profile);
    }

    generate_bindings_if_needed(&src_go, &current_dir);

    println!("cargo:rustc-link-search=native={}", src_go.to_string_lossy());
    println!("cargo:rustc-link-lib=static={}", LIB);

    if cfg!(target_os = "windows") {
        println!("cargo:rustc-cfg=static");
        println!("cargo:rustc-env=CRT_STATIC=1");
    }

    println!("cargo:rerun-if-changed={}", src_go.join("go.mod").to_string_lossy());
    println!("cargo:rerun-if-changed={}", src_go.join("go.sum").to_string_lossy());
    watch_go_files(&src_go);
    println!("cargo:rerun-if-env-changed=PROFILE");
    println!("cargo:rerun-if-changed=build.rs");
}

fn build_common_library(profile: &str) {
    let common_dir = Path::new("../../common");
    let target_arch = env::var("CARGO_CFG_TARGET_ARCH").unwrap_or_else(|_| "x86_64".to_string());
    let target = if cfg!(target_os = "windows") {
        match &target_arch[..] {
            "x86_64" => Some("x86_64-pc-windows-msvc"),
            "aarch64" => Some("aarch64-pc-windows-msvc"),
            "x86" => Some("i686-pc-windows-msvc"),
            _ => None,
        }
    } else {
        None
    };

    let mut cmd = Command::new("cargo");
    cmd.current_dir(&common_dir).arg("build");

    if profile == "release" {
        cmd.arg("--release");
    }

    if let Some(triple) = target {
        cmd.args(&["--target", triple]);
    }

    let status = cmd.status().expect("Error compiling common library");
    if !status.success() {
        panic!("Error compiling common library");
    }
}

fn build_go_library(src_go: &PathBuf, profile: &str) {
    let common_path = if profile == "release" {
        Path::new("..").join("..").join("common").join("target").join("release")
    } else {
        Path::new("..").join("..").join("common").join("target").join("debug")
    };

    let target_os = env::var("CARGO_CFG_TARGET_OS").unwrap_or_else(|_| "unknown".to_string());
    let cgo_ldflags = match target_os.as_str() {
        "linux" => format!("-L{} -lcommon -ldl", common_path.to_string_lossy()),
        "windows" => format!("-L{} -lcommon", common_path.to_string_lossy()),
        "macos" => format!(
            "-L{} -lcommon -framework CoreFoundation -framework Security",
            common_path.to_string_lossy()
        ),
        _ => panic!("Unsupported platform: {}", target_os),
    };

    let mut go_build = Command::new("go");
    go_build.env("CGO_ENABLED", "1");

    let mut args = vec!["build", "-buildmode=c-archive"];

    if profile == "release" {
        args.extend_from_slice(&[
            "-tags", "release",
            "-ldflags", "-s -w",
            "-gcflags", "-trimpath=$GOPATH",
            "-asmflags", "-trimpath=$GOPATH",
        ]);
    } else {
        if target_os == "windows" {
            args.extend_from_slice(&["-ldflags", "-s -w", "-gcflags", "all=-N -l"]);
        } else {
            args.extend_from_slice(&["-gcflags", "all=-N -l"]);
        }
    }

    let status = go_build
        .current_dir(src_go)
        .env("CGO_LDFLAGS", cgo_ldflags)
        .args(&args)
        .status()
        .expect("Error executing Go build");

    if !status.success() {
        panic!("Go build command failed");
    }
}

fn needs_rebuild(src_go: &PathBuf, lib_path: &PathBuf) -> bool {
    if !lib_path.exists() {
        return true;
    }

    let lib_time = match lib_path.metadata().and_then(|m| m.modified()) {
        Ok(time) => time,
        Err(_) => return true,
    };

    for file in ["go.mod", "go.sum"].iter() {
        let file_path = src_go.join(file);
        if file_path.exists() && is_file_newer_than(&file_path, lib_time) {
            return true;
        }
    }

    check_dir_for_newer_files(src_go, lib_time)
}

fn is_file_newer_than(path: &PathBuf, compare_time: SystemTime) -> bool {
    path.metadata()
        .and_then(|m| m.modified())
        .map(|time| time > compare_time)
        .unwrap_or(true)
}

fn check_dir_for_newer_files(dir: &PathBuf, compare_time: SystemTime) -> bool {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Ok(ft) = entry.file_type() {
                if ft.is_dir() && check_dir_for_newer_files(&path, compare_time) {
                    return true;
                } else if ft.is_file() && path.extension().map_or(false, |ext| ext == "go") {
                    if is_file_newer_than(&path, compare_time) {
                        return true;
                    }
                }
            }
        }
    }
    false
}

fn generate_bindings_if_needed(src_go: &PathBuf, current_dir: &PathBuf) {
    let header_path = src_go.join(format!("lib{}.h", LIB));
    let bindings_path = current_dir.join("bindings.rs");

    let regenerate = if !bindings_path.exists() {
        true
    } else {
        let header_time = header_path.metadata().and_then(|m| m.modified()).unwrap_or(SystemTime::UNIX_EPOCH);
        let bindings_time = bindings_path.metadata().and_then(|m| m.modified()).unwrap_or(SystemTime::UNIX_EPOCH);
        header_time > bindings_time
    };

    if regenerate {
        let mut builder = bindgen::Builder::default()
            .header(header_path.to_string_lossy().as_ref())
            .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()))
            .layout_tests(false)
            .derive_debug(false);

        if cfg!(target_os = "linux") {
            if let Ok(llvm_path) = env::var("LIBCLANG_PATH") {
                builder = builder.clang_arg(format!("-I{}", llvm_path));
                println!("cargo:warning=Using LIBCLANG_PATH: {}", llvm_path);
            } else {
                println!("cargo:warning=LIBCLANG_PATH not defined, using default path");
            }
        }

        let bindings = builder.generate().expect("Could not generate bindings");
        bindings
            .write_to_file(&bindings_path)
            .expect("Could not write bindings file");
    }
}

fn watch_go_files(dir: &PathBuf) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Ok(ft) = entry.file_type() {
                if ft.is_dir() {
                    watch_go_files(&path);
                } else if ft.is_file() && path.extension().map_or(false, |ext| ext == "go") {
                    println!("cargo:rerun-if-changed={}", path.to_string_lossy());
                }
            }
        }
    }
}
