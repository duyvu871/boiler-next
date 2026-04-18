#!/bin/sh
set -e
cd /app

# Bind mount hides image node_modules — reinstall when missing or lockfile changed
if [ ! -f node_modules/.install-stamp ] || [ package-lock.json -nt node_modules/.install-stamp ]; then
  echo "[dev] Installing npm dependencies..."
  npm ci --ignore-scripts
  touch node_modules/.install-stamp
fi

exec "$@"
