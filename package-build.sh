#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PACKAGES_DIR="$ROOT_DIR/packages"

ORDER=(core langchain openai otel tracing client)

for pkg_name in "${ORDER[@]}"; do
  pkg="$PACKAGES_DIR/$pkg_name"
  if [ -d "$pkg" ] && [ -f "$pkg/package.json" ]; then
    # Check if package is private
    if grep -q '"private": *true' "$pkg/package.json"; then
      echo "Skipping private package: $pkg_name"
      continue
    fi
    echo "Building $pkg_name..."
    (cd "$pkg" && pnpm build)
  else
    echo "Package $pkg_name does not exist, skipping."
  fi
done