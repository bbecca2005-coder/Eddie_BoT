# Eddy

A React chat app with Eddy's personality, powered by Claude via your local Claude Code CLI subscription — no API key required.

## How it works

- Frontend: React + Vite (`src/`)
- Backend: tiny Express server (`server/index.ts`) that calls `@anthropic-ai/claude-agent-sdk`
- Auth: the Agent SDK talks to the installed `claude` CLI, which uses whichever Claude subscription is logged into `claude` on this machine

## Prerequisites

- Node.js 18+
- `claude` CLI installed and logged in (`claude` on its own should open an interactive session)

## Run locally (dev)

```bash
npm install
npm run dev
```

This runs the Express server (port 4317) and Vite (port 3000) together; open <http://localhost:3000>. Vite proxies `/api` to the backend.

## Run as an app (production-style)

```bash
npm start
```

Builds the frontend and serves everything from the Express server at <http://127.0.0.1:4317>.

## macOS launcher

`~/Applications/Eddy.app` is a tiny AppleScript bundle that:

1. Starts the server if it isn't running (builds the frontend on first run).
2. Opens the UI in a Chrome app-mode window (falls back to the default browser).

Launch it from Spotlight, Launchpad, or Finder like any app. Logs: `/tmp/eddy-server.log`.

To rebuild the launcher after moving the project:

```bash
osacompile -o ~/Applications/Eddy.app scripts/eddy-launcher.applescript
```

(edit the path in `scripts/launch-eddy.sh` first if the project moves).
