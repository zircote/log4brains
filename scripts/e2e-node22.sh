#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[e2e] Preparing test dependencies..."
(
  cd e2e-tests
  yarn install --silent
)

run_e2e() {
  echo "[e2e] Node: $(node -v)"
  ( cd e2e-tests && node e2e-launcher.js )
}

# If current Node is already 22.x, just run
CURRENT_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [[ "$CURRENT_MAJOR" == "22" ]]; then
  echo "[e2e] Detected Node 22.x on host. Running tests..."
  run_e2e
  exit 0
fi

# Try Volta if available
if command -v volta >/dev/null 2>&1; then
  echo "[e2e] Using Volta to run with Node 22"
  volta run --node 22 -- bash -lc '( cd e2e-tests && node e2e-launcher.js )'
  exit 0
fi

# Try NVM if available
NVM_DIR_DEFAULT="$HOME/.nvm"
if [[ -s "${NVM_DIR:-$NVM_DIR_DEFAULT}/nvm.sh" ]]; then
  echo "[e2e] Using nvm to run with Node 22"
  # shellcheck disable=SC1090
  . "${NVM_DIR:-$NVM_DIR_DEFAULT}/nvm.sh"
  nvm install 22 >/dev/null
  nvm exec 22 bash -lc '( cd e2e-tests && node e2e-launcher.js )'
  exit 0
fi

# Try asdf if available
if command -v asdf >/dev/null 2>&1; then
  echo "[e2e] Using asdf to run with Node 22"
  asdf plugin add nodejs >/dev/null 2>&1 || true
  asdf install nodejs 22.18.0 >/dev/null 2>&1 || true
  asdf shell nodejs 22.18.0
  ( cd e2e-tests && node e2e-launcher.js )
  exit 0
fi

echo "[e2e] No Node version manager (volta/nvm/asdf) detected."
echo "[e2e] Please run under Node 22 manually, e.g.:"
echo "       nvm install 22 && nvm use 22 && yarn e2e"
exit 1

