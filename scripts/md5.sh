#!/bin/sh
# Prints "<md5> <path>" for theme files, to compare with the store's checksumMd5.
cd "$(dirname "$0")/../theme" && for f in "$@"; do printf '%s %s\n' "$(md5sum < "$f" | cut -d' ' -f1)" "$f"; done
