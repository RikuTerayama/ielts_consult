#!/usr/bin/env bash
set -euo pipefail
echo "=== Build Environment ==="
echo "Node.js: $(node -v)"
echo "pnpm: $(pnpm -v || echo 'not available')"
echo "========================="

