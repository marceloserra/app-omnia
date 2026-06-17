# AI Dev Telemetry System

## Overview

The AI Dev Telemetry system is a custom logging architecture built specifically to accelerate AI-driven development. 

In a typical mobile development workflow, when an app crashes on a simulator or physical device, the human developer must manually locate the stack trace in their terminal (Metro bundler) and copy-paste it to the AI agent. This creates friction.

This system bypasses that friction. The mobile app intercepts its own errors and warnings, sending them directly via HTTP to a local background server running on the host machine. This server writes the structured logs to a local file (`omnia-telemetry.jsonl`) that the AI agent can read directly.

## Architecture

1. **`@omnia/logger` (Client)**
   - A universal, abstract logging package located at `packages/logger`.
   - Exports a `logger` object with `info`, `warn`, and `error` methods.
   - Detects the host machine IP dynamically (crucial for physical devices) and dispatches logs via `fetch` to `http://<HOST_IP>:8082`.
   - Connected globally to the React Native app in `apps/mobile/app/_layout.tsx` using `global.ErrorUtils` and Expo Router's `ErrorBoundary`.

2. **Telemetry Server (Host)**
   - A lightweight Node.js server (`packages/logger/server.js`) that runs on port `8082`.
   - Listens for `POST` requests and appends them as JSON Lines to `omnia-telemetry.jsonl` in the monorepo root.
   - Also prints colored, formatted logs to the terminal where it's running.

3. **`omnia-telemetry.jsonl` (Storage)**
   - The sink file located at the root of the project.
   - Structured format: `{"timestamp": "...", "level": "error", "tag": "AppCrash", "message": "...", "error": "Stack trace..."}`.

---

## Instructions for AI Agents

If the human user reports a bug, crash, or unexpected behavior during development:

1. **DO NOT** immediately ask the user to copy-paste the error logs.
2. **DO** use your file reading tools to inspect `omnia-telemetry.jsonl` at the root of the project.
   - Example: View the last 50 lines to find the most recent `"level": "error"` entries.
3. Use the stack trace found in the telemetry file to diagnose the issue, propose a fix, and apply it.

If you are implementing a new complex feature (e.g., SQLite transactions, AI streaming), proactively use `logger.info` or `logger.error` to trace the execution flow, so you can debug your own code more easily.

---

## Instructions for Humans

To ensure the telemetry system is active:

1. The telemetry server must be running in the background. Start it with:
   ```bash
   pnpm run telemetry
   ```
   *(Note: The AI agent may have already started this as a background task).*

2. Start the Expo app normally:
   ```bash
   pnpm --filter mobile dev -c
   ```

3. If you see an error in the app, you just need to tell the AI: *"The app crashed"* or *"SQLite failed"*. The AI will automatically read the `omnia-telemetry.jsonl` file to find the root cause.
