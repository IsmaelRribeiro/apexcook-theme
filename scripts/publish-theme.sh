#!/bin/sh
# Publishes theme/ to origin/shopify as a new commit on top of the remote branch, so commits
# Shopify writes back (theme editor saves) are never overwritten by a force push.
# Bring Shopify's commits into theme/ first (see docs/deploy.md).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MSG="${1:-chore: publish theme}"
WT=/tmp/apex-shopify-wt
cd "$ROOT"
git fetch -q origin shopify
rm -rf "$WT"; git worktree prune
git worktree add -q --detach "$WT" origin/shopify
cd "$WT"
git rm -rq --ignore-unmatch .
cp -r "$ROOT/theme/." .
git add -A
if git diff --cached --quiet; then
  echo "nothing to publish"
else
  git commit -qm "$MSG"
  git push -q origin HEAD:shopify
  echo "published $(git rev-parse --short HEAD)"
fi
cd "$ROOT"
git worktree remove --force "$WT"
