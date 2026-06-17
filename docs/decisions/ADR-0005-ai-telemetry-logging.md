# ADR 0005: AI Telemetry Logging System

## Status
Accepted

## Context
When an app crashes in development or production, autonomous AI agents need to debug the issue without asking the user to manually extract `logcat` dumps or connect standard debugging tools. Third-party cloud error trackers (like Sentry) introduce external dependencies and network latency. We need an offline, file-system-based logger optimized for AI ingestion.

## Decision
We implemented `@omnia/logger`, a custom telemetry module that writes logs directly to the device's local file system in JSON Lines (`.jsonl`) format. 
- All critical application events, state transitions, and unhandled exceptions are appended to `omnia-telemetry.jsonl`.
- The format is optimized for LLM reading (one JSON object per line).
- Agents are explicitly instructed in `AGENTS.md` to read this file via their file-reading tools when investigating user-reported crashes.

## Consequences
- **Positive:** Zero reliance on third-party tracking. Debugging is 100% local, fast, and seamlessly integrated into the autonomous agent workflow.
- **Negative:** Telemetry files can grow over time. We will need log rotation or a file-size cap mechanism in the future to prevent disk space exhaustion.
