#!/usr/bin/env bash
set -euo pipefail

# Rebuild, pack local tarballs, and install the global CLI from this repo.
# Usage: scripts/repack-global.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v yarn >/dev/null 2>&1; then
  echo "yarn is required" >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required" >&2
  exit 1
fi

VERSION=$(node -p "require('./packages/global-cli/package.json').version")
echo "Detected version: $VERSION"

echo "[1/4] Building all workspaces..."
yarn build

echo "[2/4] Packing tarballs..."
rm -f \
  "$ROOT_DIR/cli-common-$VERSION.tgz" \
  "$ROOT_DIR/core-$VERSION.tgz" \
  "$ROOT_DIR/init-$VERSION.tgz" \
  "$ROOT_DIR/web-$VERSION.tgz" \
  "$ROOT_DIR/log4brains-cli-$VERSION.tgz" \
  "$ROOT_DIR/log4brains-$VERSION.tgz"

(cd packages/cli-common && yarn pack --filename "$ROOT_DIR/cli-common-$VERSION.tgz")
(cd packages/core       && yarn pack --filename "$ROOT_DIR/core-$VERSION.tgz")
(cd packages/init       && yarn pack --filename "$ROOT_DIR/init-$VERSION.tgz")
(cd packages/web        && yarn pack --filename "$ROOT_DIR/web-$VERSION.tgz")
(cd packages/cli        && yarn pack --filename "$ROOT_DIR/log4brains-cli-$VERSION.tgz")
(cd packages/global-cli && yarn pack --filename "$ROOT_DIR/log4brains-$VERSION.tgz")

echo "[3/4] Installing globally in dependency order..."
npm install -g \
  "$ROOT_DIR/cli-common-$VERSION.tgz" \
  "$ROOT_DIR/core-$VERSION.tgz" \
  "$ROOT_DIR/init-$VERSION.tgz" \
  "$ROOT_DIR/web-$VERSION.tgz" \
  "$ROOT_DIR/log4brains-cli-$VERSION.tgz" \
  "$ROOT_DIR/log4brains-$VERSION.tgz"

echo "[4/4] Verifying installation..."
command -v log4brains
log4brains --version

echo "Done. log4brains $(log4brains --version) installed globally."

