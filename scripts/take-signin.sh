#!/usr/bin/env bash
# Take the GilbPlatformCode sign-in unit into this app as its own copy.
#
# Where the pointer came from: the vault chooser record `Signin`
# (7.Project/Active/GilbPlatformCode/03Execution/Chooser/Signin.md, vault origin/main 7e4e4c708):
#   "clone https://github.com/KaiGilb/GilbPlatformCode.git path units/signin"
# Pinned to the SHA that record's verification run measured (72e579a38). `main` moves; this does not.
#
# After the take, ./signin is this app's code. Nothing reads the grab home again at install,
# build or run time. This script is only the record of how the copy was made, plus a way to
# compare the copy against its source.
#
#   scripts/take-signin.sh          take the unit into ./signin (refuses if ./signin exists)
#   scripts/take-signin.sh --diff   compare ./signin with the source at the pinned SHA
#                                   exit 0 = identical, exit 1 = this app has changed its copy
set -euo pipefail

GRAB_URL="https://github.com/KaiGilb/GilbPlatformCode.git"
GRAB_PATH="units/signin"
GRAB_SHA="72e579a38fb7b40e66832b57f74e34cffcef49e9"

here="$(cd "$(dirname "$0")/.." && pwd)"
dest="$here/signin"
mode="${1:-take}"

case "$mode" in
  take | --diff) ;;
  *)
    echo "usage: scripts/take-signin.sh [--diff]" >&2
    exit 64
    ;;
esac

if [ "$mode" = "take" ] && [ -e "$dest" ]; then
  echo "take-signin: REFUSED — ./signin already exists. It is this app's own copy now;" >&2
  echo "a second take would overwrite this app's changes. Use --diff to compare." >&2
  exit 2
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
git clone -q --no-checkout "$GRAB_URL" "$tmp/grab"
git -C "$tmp/grab" checkout -q --detach "$GRAB_SHA"
src="$tmp/grab/$GRAB_PATH"
if [ ! -d "$src" ]; then
  echo "take-signin: FAIL — $GRAB_PATH not found at $GRAB_SHA" >&2
  exit 1
fi

if [ "$mode" = "take" ]; then
  mkdir -p "$dest"
  # package-lock.json stays behind: this app's root lock file governs the workspace.
  (cd "$src" && tar --exclude=node_modules --exclude=package-lock.json -cf - .) | (cd "$dest" && tar -xf -)
  echo "take-signin: took $GRAB_PATH @ $GRAB_SHA into ./signin"
  exit 0
fi

if diff -r -x node_modules -x package-lock.json "$src" "$dest"; then
  echo "take-signin: ./signin is identical to $GRAB_PATH @ ${GRAB_SHA:0:9} (package-lock.json not compared)"
  exit 0
fi
echo "take-signin: ./signin differs from $GRAB_PATH @ ${GRAB_SHA:0:9} (lines above) — this app's own changes"
exit 1
