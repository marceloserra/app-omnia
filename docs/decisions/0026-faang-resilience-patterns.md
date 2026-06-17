# ADR-0026: FAANG-Tier Resilience & Idempotency Patterns

## Status
Accepted

## Context
Mobile environments are inherently unstable. Networks drop (elevators, subways), backend APIs throttle or fail (HTTP 429, 503), and memory states can easily diverge from persistent storage if the app is minimized during long-running tasks like AI streaming. 
To achieve Apple-tier UX, the Omnia app must hide these failures from the user and guarantee consistency.

## Decision
We are adopting four FAANG-standard engineering patterns across the application:

1. **Exponential Backoff & Jitter (Resilience):**
   - Network requests to LLM APIs will automatically retry on transient failures (429, 503).
   - Retries will exponentially back off (e.g., 1s, 2s, 4s) with random jitter to prevent thundering herd problems.

2. **Idempotency Keys:**
   - A unique UUID will be injected as an `Idempotency-Key` or `X-Request-ID` into every generation request.
   - If the network drops and the app retries, the backend can recognize the duplicate request and prevent duplicate billing or ghost processing.

3. **Circuit Breaker with Auto-Fallback:**
   - If the primary provider (e.g., OpenAI) fails consecutively (e.g., 2 times), the circuit "trips".
   - The application automatically and transparently falls back to the local provider (`openai-compatible`) to ensure the user is never blocked from chatting.

4. **Single Source of Truth (SSOT Reactive DB):**
   - The UI will no longer manage an independent RAM array of `messages`.
   - The UI will subscribe directly to the SQLite database (Observer pattern). When the AI streams tokens, the DB updates, and the UI reacts to the DB change. This guarantees zero state-loss if the app is backgrounded.

## Consequences
- **Positive:** App feels indestructible to the user. No red error screens for transient network hiccups. Zero message loss.
- **Negative:** Increased complexity in the network layer and data access layer. Requires robust unit testing for the backoff loops.
