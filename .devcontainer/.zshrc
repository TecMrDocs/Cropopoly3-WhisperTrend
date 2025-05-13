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
