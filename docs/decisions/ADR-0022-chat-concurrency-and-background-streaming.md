# ADR 0022: Chat Concurrency and Background Streaming Strategy

## Context
When building a GenAI chat interface, we must decide how to handle multiple rapid-fire user inputs and how to handle network streaming when the app is backgrounded.

1. **Concurrency/Queuing**: Users might attempt to send a new message while the AI is still generating a response for the previous one. Providers like OpenAI and Anthropic generally expect a strict turn-based interaction model per conversation.
2. **Background Execution**: React Native execution is paused by mobile operating systems (iOS/Android) after a certain period when sent to the background, which can interrupt long-running network requests (like LLM streaming).

We need a clear strategy to handle these edge cases to prevent corrupt state, API errors, and data loss.

## Decision

### 1. Strict Turn-Based Concurrency (No Queuing)
We will enforce a strict turn-based UX. 
- While the AI is streaming a response, the "Send" button transforms into a "Stop" button.
- The user **cannot** enqueue a second message until the stream finishes naturally or they explicitly press "Stop".
- **Why**: Building a robust offline-capable local message queue introduces immense complexity (managing failed chunks, re-syncing chat history arrays before the provider API receives them, and handling context-window limits dynamically). A strict turn-based flow aligns with standard FAANG implementations (ChatGPT, Claude) and guarantees that the `messages` array sent to the LLM is always predictable.

### 2. Aggressive SQLite Chunk Persistence (Stateless Backgrounding)
We will rely on standard OS behavior for background fetch execution rather than building heavy native background services, but we will aggressively persist data to mitigate OS-level kills.
- When the user sends the app to the background, the React Native Fetch API streaming the chunked response will continue running momentarily as allowed by the OS.
- Because our UI layer streams chunks directly into SQLite (`msgRepo.updateContent`), **tokens are persisted to disk aggressively**. To prevent database lock contention and micro-stutters during high-speed generation, the SQLite updates are throttled to every **500 milliseconds**.
- **Why**: If the OS suspends the app and kills the network connection to save battery, we will not lose the conversation. Upon reopening the app, the UI will simply load the SQLite state, showing the response exactly up to the last word received before the connection was killed. The user can simply ask the model to "continue" if desired.

### 3. Lifecycle-Bound Stream Cancellation (Unmount Aborts)
When a user explicitly navigates away from the active Chat Screen (e.g., pressing "Back" to return to the history list), the underlying generation stream is **aborted immediately**.
- The `useEffect` cleanup hook sets a cancellation ref (`isAbortedRef.current = true`), forcing the background stream loop to break.
- **Why**: React Native's Strict Mode and concurrent features can otherwise cause component remounts to spawn duplicate background network requests. Furthermore, running a stream in the background for a component that has been unmounted causes memory leaks and "rogue" haptics/sounds because the background loop still triggers UI side-effects without an active view. If the user wishes to see the generation, they must remain on the screen. If they leave, the partial text generated up to that microsecond is saved via the SQLite throttle.

## Consequences

### Positive
* **Stability**: Zero risk of sending overlapping, out-of-sync message histories to providers.
* **Simplicity**: No complex Redux-saga/Queue-worker infrastructure needed for local offline syncing.
* **Data Safety**: Aggressive chunk persistence means users never lose a long generation if they briefly switch to WhatsApp and the OS suspends the app.

### Negative
* If a generation takes 60 seconds and the user backgrounds the app on an aggressive OS (like standard iOS battery saver mode), the stream *will* be cut off halfway through. The user will have to manually prompt the AI to continue. (This is considered an acceptable trade-off compared to writing native Swift/Kotlin background execution handlers for Phase 9).
