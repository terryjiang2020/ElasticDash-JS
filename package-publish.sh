#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PACKAGES_DIR="$ROOT_DIR/packages"

for pkg in "$PACKAGES_DIR"/*; do
  if [ -d "$pkg" ] && [ -f "$pkg/package.json" ]; then
    # Check if package is private
    if grep -q '"private": *true' "$pkg/package.json"; then
      echo "Skipping private package: $(basename "$pkg")"
      continue
    fi
    echo "Publishing $(basename "$pkg")..."
    (cd "$pkg" && pnpm publish --access public)
  fi
done