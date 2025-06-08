use bindgen;
use std::{
    env,
    fs,
    path::{Path, PathBuf},
    process::Command,
    time::SystemTime,
};

// Name of the Go library being built
const LIB: &str = "scraper";

/// Main build script entry point
/// This script handles building a Go library, generating Rust bindings,
/// and setting up the necessary linking configuration for the Rust crate
fn main() {
    // Get the current directory where Cargo.toml is located
    let current_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").expect("Failed to get CARGO_MANIFEST_DIR"));

    // Check if the common library needs to be built first
    let common_dir = current_dir.join("..").join("common").join("target");
    if !common_dir.exists() {
        // Build the common library dependency if it doesn't exist
        std::process::Command::new("cargo")
            .current_dir(current_dir.join("..").join("common"))
            .args(&["build"])
            .output()
            .expect("Failed to build common library");
    }

    // Directory containing Go source code
    let src_go = current_dir.join("src-go");

    // Get build profile (debug or release)
    let profile = env::var("PROFILE").unwrap_or_else(|_| "debug".to_string());

    // Build the common Rust library first
    build_common_library(&profile);

    // Platform-specific linking for macOS frameworks
    if cfg!(target_os = "macos") {
        println!("cargo:rustc-link-lib=framework=CoreFoundation");
        println!("cargo:rustc-link-lib=framework=Security");
    }

    // Determine library file extension based on target OS
    let lib_extension = if cfg!(target_os = "windows") { "lib" } else { "a" };
    let lib_path = src_go.join(format!("lib{}.{}", LIB, lib_extension));

    // Check if Go library needs to be rebuilt and build if necessary
    if needs_rebuild(&src_go, &lib_path) {
        println!("cargo:warning=Rebuilding Go library...");
        build_go_library(&src_go, &profile);
    }

    // Generate Rust bindings from C header if needed
    generate_bindings_if_needed(&src_go, &current_dir);

    // Tell Cargo where to find the static library and how to link it
    println!("cargo:rustc-link-search=native={}", src_go.to_string_lossy());
    println!("cargo:rustc-link-lib=static={}", LIB);

    // Windows-specific static linking configuration
    if cfg!(target_os = "windows") {
        println!("cargo:rustc-cfg=static");
        println!("cargo:rustc-env=CRT_STATIC=1");
    }

    // Set up rerun triggers for when files change
    println!("cargo:rerun-if-changed={}", src_go.join("go.mod").to_string_lossy());
    println!("cargo:rerun-if-changed={}", src_go.join("go.sum").to_string_lossy());
    watch_go_files(&src_go);
    println!("cargo:rerun-if-env-changed=PROFILE");
    println!("cargo:rerun-if-changed=build.rs");
}

/// Builds the common Rust library dependency
/// This library contains shared code used by multiple components
fn build_common_library(profile: &str) {
    let common_dir = Path::new("../common");
    let target_arch = env::var("CARGO_CFG_TARGET_ARCH").unwrap_or_else(|_| "x86_64".to_string());
    
    // Determine target triple for cross-compilation on Windows
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

    // Set up cargo build command
    let mut cmd = Command::new("cargo");
    cmd.current_dir(&common_dir).arg("build");

    // Add release flag if building in release mode
    if profile == "release" {
        cmd.arg("--release");
    }

    // Add target triple for cross-compilation if specified
    if let Some(triple) = target {
        cmd.args(&["--target", triple]);
    }

    // Execute the build command and check for success
    let status = cmd.status().expect("Error compiling common library");
    if !status.success() {
        panic!("Error compiling common library");
    }
}

/// Builds the Go library using CGO to create a C-compatible static library
/// This function handles platform-specific linking flags and build optimizations
fn build_go_library(src_go: &PathBuf, profile: &str) {
    // Determine path to the common library based on build profile
    let common_path = if profile == "release" {
        Path::new("..").join("common").join("target").join("release")
    } else {
        Path::new("..").join("common").join("target").join("debug")
    };

    // Get target OS for platform-specific linking
    let target_os = env::var("CARGO_CFG_TARGET_OS").unwrap_or_else(|_| "unknown".to_string());
    
    // Configure CGO linker flags based on target platform
    let cgo_ldflags = match target_os.as_str() {
        "linux" => format!("-L{} -lcommon -ldl", common_path.to_string_lossy()),
        "windows" => format!("-L{} -lcommon", common_path.to_string_lossy()),
        "macos" => format!(
            "-L{} -lcommon -framework CoreFoundation -framework Security",
            common_path.to_string_lossy()
        ),
        _ => panic!("Unsupported platform: {}", target_os),
    };

    // Set up Go build command with CGO enabled
    let mut go_build = Command::new("go");
    go_build.env("CGO_ENABLED", "1");

    // Base arguments for building a C-compatible archive
    let mut args = vec!["build", "-buildmode=c-archive"];

    // Configure build flags based on profile
    if profile == "release" {
        // Release mode: optimize for size and remove debug info
        args.extend_from_slice(&[
            "-tags", "release",
            "-ldflags", "-s -w",  // Strip symbol table and debug info
            "-gcflags", "-trimpath=$GOPATH",  // Remove absolute paths
            "-asmflags", "-trimpath=$GOPATH",
        ]);
    } else {
        // Debug mode: include debug information
        if target_os == "windows" {
            args.extend_from_slice(&["-ldflags", "-s -w", "-gcflags", "all=-N -l"]);
        } else {
            args.extend_from_slice(&["-gcflags", "all=-N -l"]);  // Disable optimizations for debugging
        }
    }

    // Execute the Go build command
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

/// Determines if the Go library needs to be rebuilt by comparing modification times
/// Returns true if any source files are newer than the existing library
fn needs_rebuild(src_go: &PathBuf, lib_path: &PathBuf) -> bool {
    // If library doesn't exist, we definitely need to build it
    if !lib_path.exists() {
        return true;
    }

    // Get the modification time of the existing library
    let lib_time = match lib_path.metadata().and_then(|m| m.modified()) {
        Ok(time) => time,
        Err(_) => return true,  // If we can't read metadata, rebuild to be safe
    };

    // Check if Go module files have been updated
    for file in ["go.mod", "go.sum"].iter() {
        let file_path = src_go.join(file);
        if file_path.exists() && is_file_newer_than(&file_path, lib_time) {
            return true;
        }
    }

    // Recursively check all Go source files for changes
    check_dir_for_newer_files(src_go, lib_time)
}

/// Checks if a file is newer than the given timestamp
fn is_file_newer_than(path: &PathBuf, compare_time: SystemTime) -> bool {
    path.metadata()
        .and_then(|m| m.modified())
        .map(|time| time > compare_time)
        .unwrap_or(true)  // If we can't determine, assume it's newer
}

/// Recursively checks a directory for any Go files newer than the given timestamp
fn check_dir_for_newer_files(dir: &PathBuf, compare_time: SystemTime) -> bool {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Ok(ft) = entry.file_type() {
                if ft.is_dir() && check_dir_for_newer_files(&path, compare_time) {
                    return true;
                } else if ft.is_file() && path.extension().map_or(false, |ext| ext == "go") {
                    // Check if this Go file is newer than the library
                    if is_file_newer_than(&path, compare_time) {
                        return true;
                    }
                }
            }
        }
    }
    false
}

/// Generates Rust bindings from the C header file if needed
/// This creates safe Rust wrappers for the C functions exported by the Go library
fn generate_bindings_if_needed(src_go: &PathBuf, current_dir: &PathBuf) {
    let header_path = src_go.join(format!("lib{}.h", LIB));
    let bindings_path = current_dir.join("bindings.rs");

    // Determine if we need to regenerate bindings
    let regenerate = if !bindings_path.exists() {
        true  // No bindings file exists
    } else {
        // Check if header is newer than existing bindings
        let header_time = header_path.metadata().and_then(|m| m.modified()).unwrap_or(SystemTime::UNIX_EPOCH);
        let bindings_time = bindings_path.metadata().and_then(|m| m.modified()).unwrap_or(SystemTime::UNIX_EPOCH);
        header_time > bindings_time
    };

    if regenerate {
        // Configure bindgen to generate Rust bindings from C header
        let mut builder = bindgen::Builder::default()
            .header(header_path.to_string_lossy().as_ref())
            .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()))
            .layout_tests(false)  // Skip layout tests for faster generation
            .derive_debug(false); // Skip Debug trait derivation

        // Linux-specific clang configuration
        if cfg!(target_os = "linux") {
            if let Ok(llvm_path) = env::var("LIBCLANG_PATH") {
                builder = builder.clang_arg(format!("-I{}", llvm_path));
                println!("cargo:warning=Using LIBCLANG_PATH: {}", llvm_path);
            } else {
                println!("cargo:warning=LIBCLANG_PATH not defined, using default path");
            }
        }

        // Generate and write the bindings to file
        let bindings = builder.generate().expect("Could not generate bindings");
        bindings
            .write_to_file(&bindings_path)
            .expect("Could not write bindings file");
    }
}

/// Recursively adds all Go files in a directory to Cargo's rerun-if-changed list
/// This ensures the build script reruns when any Go source file is modified
fn watch_go_files(dir: &PathBuf) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Ok(ft) = entry.file_type() {
                if ft.is_dir() {
                    // Recursively watch subdirectories
                    watch_go_files(&path);
                } else if ft.is_file() && path.extension().map_or(false, |ext| ext == "go") {
                    // Add Go files to watch list
                    println!("cargo:rerun-if-changed={}", path.to_string_lossy());
                }
            }
        }
    }
}
