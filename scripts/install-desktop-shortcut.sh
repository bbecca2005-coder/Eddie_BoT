#!/usr/bin/env bash
# Install (or re-install) the Eddy macOS launcher and a Desktop shortcut.
#
# What this does:
#   1. Rebuilds ~/Applications/Eddy.app with this project's current path
#      baked into the AppleScript.
#   2. Creates a Finder alias at ~/Desktop/Eddy so double-clicking the
#      desktop icon fully launches Eddy (server + UI).
#
# Re-run this script any time you move the project directory.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

APP_PATH="$HOME/Applications/Eddy.app"
DESKTOP_ALIAS="$HOME/Desktop/Eddy"
LAUNCHER_SH="$PROJECT_DIR/scripts/launch-eddy.sh"
APPLESCRIPT_SRC="$PROJECT_DIR/scripts/eddy-launcher.applescript"

if [ ! -x "$LAUNCHER_SH" ]; then
  chmod +x "$LAUNCHER_SH"
fi

# Write a fresh AppleScript source with the current launcher path embedded.
# This is the source we commit; osacompile will produce the .app bundle.
cat >"$APPLESCRIPT_SRC" <<APPLESCRIPT
on run
    do shell script "$LAUNCHER_SH >/dev/null 2>&1 &"
end run
APPLESCRIPT

mkdir -p "$HOME/Applications"
rm -rf "$APP_PATH"
osacompile -o "$APP_PATH" "$APPLESCRIPT_SRC"

# Replace any previous Desktop shortcut with a fresh Finder alias.
rm -rf "$DESKTOP_ALIAS" "$HOME/Desktop/Eddy.app"

osascript <<APPLESCRIPT
tell application "Finder"
    set appAlias to make new alias file at desktop to POSIX file "$APP_PATH"
    set name of appAlias to "Eddy"
end tell
APPLESCRIPT

echo "Installed:  $APP_PATH"
echo "Shortcut:   $HOME/Desktop/Eddy"
echo "Launcher:   $LAUNCHER_SH"
