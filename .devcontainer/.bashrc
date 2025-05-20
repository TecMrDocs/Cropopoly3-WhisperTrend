PQ_LIB_PATH=$(ls -d /nix/store/*-postgresql-13.*-lib/lib | head -1)
export PQ_LIB_DIR="$PQ_LIB_PATH"
export LD_LIBRARY_PATH="$PQ_LIB_PATH:$LD_LIBRARY_PATH"

LIBCLANG_PATH=$(ls -d /nix/store/*-clang-*-lib/lib | head -1)
export LIBCLANG_PATH="$LIBCLANG_PATH"

CLANG_INCLUDE=$(find $LIBCLANG_PATH/clang -name include -type d | head -1)
GLIBC_INCLUDE=$(find /nix/store -name include -path "*glibc*dev*" -type d | head -1)

export BINDGEN_EXTRA_CLANG_ARGS="-I$CLANG_INCLUDE -I$LIBCLANG_PATH/include -I$GLIBC_INCLUDE"

PKG_CONFIG_PATH=/usr/lib/*/pkgconfig 

OPENSSL_LIB_PATH=$(ls -d /nix/store/*-openssl-*[^dev]/lib | head -1)
OPENSSL_DEV_PATH=$(ls -d /nix/store/*-openssl-*-dev | head -1)
OPENSSL_INCLUDE_PATH="$OPENSSL_DEV_PATH/include"

export OPENSSL_DIR="$OPENSSL_DEV_PATH"
export OPENSSL_LIB_DIR="$OPENSSL_LIB_PATH"
export OPENSSL_INCLUDE_DIR="$OPENSSL_INCLUDE_PATH"
export PKG_CONFIG_PATH="$OPENSSL_DEV_PATH/lib/pkgconfig:$PKG_CONFIG_PATH"
export RUSTFLAGS="-C link-args=-Wl,-rpath,$OPENSSL_LIB_PATH"