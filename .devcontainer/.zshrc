# Initialize starship
eval "$(starship init zsh)"

# Load fast-syntax-highlighting plugin
for plugin in /nix/store/*-zsh-fast-syntax-highlighting*/share/zsh/site-functions/fast-syntax-highlighting.plugin.zsh; do
  [ -f "$plugin" ] && source "$plugin"
done

# Load zsh-autosuggestions plugin
for plugin in /nix/store/*-zsh-autosuggestions*/share/zsh-autosuggestions/zsh-autosuggestions.zsh; do
  [ -f "$plugin" ] && source "$plugin"
done

export PQ_LIB_DIR="/nix/store/*postgresql-13.*-lib*/lib"
export LD_LIBRARY_PATH="/nix/store/*postgresql-13.*-lib*/lib:$LD_LIBRARY_PATH"