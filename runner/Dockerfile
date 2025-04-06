FROM nixos/nix:latest AS builder

WORKDIR /build

# Copy flake.nix and flake.lock
COPY flake.nix .
COPY flake.lock .

# Build the project using Nix in flakes mode
RUN nix --extra-experimental-features "nix-command flakes" \
    --option filter-syscalls false build

# Final image based on the runner
FROM summerwind/actions-runner:ubuntu-20.04

USER root

# Install necessary dependencies
RUN apt-get update && apt-get install -y \
    xz-utils \
    sudo \
    ca-certificates \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy the Nix store and the build result from the builder stage
COPY --from=builder /nix /nix
COPY --from=builder /build/result /source

# Copy the binaries to the runner
RUN cp -rn /source/bin/* /usr/local/bin/

RUN mkdir -p /home/runner/.rustup/tmp && chown -R runner:runner /home/runner/.rustup

COPY .devcontainer/.zshrc /root/.zshrc
RUN dos2unix /root/.zshrc

RUN mkdir -p /root/.config/starship
COPY .devcontainer/starship.toml /root/.config/starship.toml
RUN dos2unix /root/.config/starship.toml

# Back to the runner user to respect the runner entrypoint
USER runner
