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

PQ_LIB_PATH=$(ls -d /nix/store/*-postgresql-13.*-lib/lib | head -1)
export PQ_LIB_DIR="$PQ_LIB_PATH"
export LD_LIBRARY_PATH="$PQ_LIB_PATH:$LD_LIBRARY_PATH"

LIBCLANG_PATH=$(ls -d /nix/store/*-clang-*-lib/lib | head -1)
export LIBCLANG_PATH="$LIBCLANG_PATH"

CLANG_INCLUDE=$(find $LIBCLANG_PATH/clang -name include -type d | head -1)
GLIBC_INCLUDE=$(find /nix/store -name include -path "*glibc*dev*" -type d | head -1)

export BINDGEN_EXTRA_CLANG_ARGS="-I$CLANG_INCLUDE -I$LIBCLANG_PATH/include -I$GLIBC_INCLUDE"
