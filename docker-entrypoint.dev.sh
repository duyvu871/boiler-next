#!/bin/sh
set -e
cd /app

# Bind mount hides image node_modules — reinstall when missing or lockfile changed
if [ ! -f node_modules/.install-stamp ] || [ package-lock.json -nt node_modules/.install-stamp ]; then
  echo "[dev] Installing npm dependencies..."
  npm ci --ignore-scripts --legacy-peer-deps
  touch node_modules/.install-stamp
fi

# `.:/app` hides layers built in the image; Prisma client must exist on the mounted tree.
export DATABASE_URL="${DATABASE_URL:-postgresql://127.0.0.1:5432/postgres}"
echo "[dev] prisma generate"
npx prisma generate

exec "$@"
