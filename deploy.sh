#!/bin/bash
# PharmaCare — GitHub Deployment Script
# Run this once from inside your cloned repo folder
# Usage: bash deploy.sh

set -e

REPO_URL="https://github.com/Carter-droid265/Pharmacare.git"
DEPLOY_DIR="$(pwd)"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  PharmaCare — Deploy to GitHub Pages     ║"
echo "║  By Gerald Mdzalimbo                     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# 1 — Ensure git is initialised
if [ ! -d ".git" ]; then
  git init
  git remote add origin "$REPO_URL"
fi

# 2 — Make sure we are on main
git checkout -B main 2>/dev/null || true

# 3 — Stage everything
git add -A

# 4 — Commit
TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
git commit -m "PharmaCare PWA v1.0 — deploy $TIMESTAMP" || echo "Nothing new to commit."

# 5 — Push
git push -u origin main --force

echo ""
echo "✅ Pushed to GitHub!"
echo ""
echo "Enable GitHub Pages:"
echo "  → Settings → Pages → Source: main branch, /root"
echo "  → Your app: https://carter-droid265.github.io/Pharmacare/"
echo ""
