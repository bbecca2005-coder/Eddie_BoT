#!/usr/bin/env bash
# Launcher for Eddy — starts the local server (if needed) and opens the UI.
set -u

PROJECT_DIR="/Users/rebeccabrown/Documents/Projects_A/eddy-ai"
PORT="${EDDY_PORT:-4317}"
URL="http://127.0.0.1:${PORT}"

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

cd "$PROJECT_DIR" || {
  osascript -e "display alert \"Eddy\" message \"Project directory not found: $PROJECT_DIR\""
  exit 1
}

LOG_FILE="/tmp/eddy-server.log"
PID_FILE="/tmp/eddy-server.pid"

open_ui() {
  local chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  if [ -x "$chrome" ]; then
    "$chrome" --app="$URL" >/dev/null 2>&1 &
  else
    open "$URL"
  fi
}

# Already running? Just open a window.
if curl -s -f "$URL/api/health" >/dev/null 2>&1; then
  open_ui
  exit 0
fi

# Build frontend if missing.
if [ ! -f "$PROJECT_DIR/dist/index.html" ]; then
  npm run build >>"$LOG_FILE" 2>&1 || {
    osascript -e "display alert \"Eddy\" message \"Build failed. See $LOG_FILE\""
    exit 1
  }
fi

# Start the server detached from this shell.
: >"$LOG_FILE"
nohup npx tsx "$PROJECT_DIR/server/index.ts" >>"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"

# Wait up to ~30s for the port to come up.
for _ in $(seq 1 60); do
  if curl -s -f "$URL/api/health" >/dev/null 2>&1; then
    open_ui
    exit 0
  fi
  sleep 0.5
done

osascript -e "display alert \"Eddy\" message \"Server didn't come up in time. Check $LOG_FILE\""
exit 1
