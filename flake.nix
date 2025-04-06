{
  description = "environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/release-24.11";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, rust-overlay, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs {
          inherit system overlays;
        };

        rustWithMirror = pkgs.rust-bin.stable.latest.default.override {
          extensions = [ "rust-src" "rust-analyzer" ];
        };

        commonPackages = [
          pkgs.zsh
          pkgs.starship
          pkgs.zsh-fast-syntax-highlighting
          pkgs.zsh-autosuggestions

          # Python and related tools
          pkgs.python311
          pkgs.poetry

          # Rust and tools
          rustWithMirror

          # Go and tools
          pkgs.go
          pkgs.gopls

          # Bun
          pkgs.nodejs
          pkgs.nodePackages.npm
          pkgs.bun

          # C/C++ and tools
          pkgs.gcc
          pkgs.gdb
          pkgs.clang
          pkgs.clang-tools
          pkgs.cmake
          pkgs.gnumake
          pkgs.ninja

          # General development tools
          pkgs.gh
          pkgs.git
          pkgs.openssh
          pkgs.curl
          pkgs.wget

          # Development editors and utilities
          pkgs.jq
          pkgs.neovim
          pkgs.tmux
          pkgs.ripgrep
          pkgs.fd
          pkgs.dos2unix
          pkgs.openssl
        ];
      in {
        devShell = pkgs.mkShell {
          name = "environment";
          buildInputs = commonPackages;

          shellHook = ''
            export STARSHIP_CONFIG="/dev/null"

            if [ -e ~/.nix-profile/etc/profile.d/nix.sh ]; then
              source ~/.nix-profile/etc/profile.d/nix.sh
            fi

            if [ -n "$ZSH_VERSION" ]; then
              eval "$(starship init zsh)"
              
              for plugin in ${pkgs.zsh-fast-syntax-highlighting}/share/zsh/site-functions/fast-syntax-highlighting.plugin.zsh; do
                [ -f "$plugin" ] && source "$plugin"
              done
              
              for plugin in ${pkgs.zsh-autosuggestions}/share/zsh-autosuggestions/zsh-autosuggestions.zsh; do
                [ -f "$plugin" ] && source "$plugin"
              done
            else
              eval "$(starship init bash)"
            fi
          '';
        };

        defaultPackage = pkgs.buildEnv {
          name = "development-environment";
          paths = commonPackages;
          ignoreCollisions = true;
        };
      }
    );
}
