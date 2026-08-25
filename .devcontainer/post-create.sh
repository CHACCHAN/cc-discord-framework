#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing project dependencies"
bun install

echo "==> Installing Antigravity CLI"
curl -fsSL https://antigravity.google/cli/install.sh | bash

echo "==> Installing yt-dlp"
sudo curl -fsSL \
  -o /usr/local/bin/yt-dlp \
  https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux

sudo chmod +x /usr/local/bin/yt-dlp

echo "==> Installing Playwright CLI for coding agents"
# npm lives under nvm (user-owned, on the user's PATH). `sudo npm` fails with
# "command not found" because root's PATH has no nvm — install as the user.
npm install -g @playwright/cli@latest

echo "==> Installing Chromium for Playwright"
# --with-deps invokes sudo internally for apt packages when needed.
playwright-cli install-browser --with-deps

echo "==> Agent development environment ready"
