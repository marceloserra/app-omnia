# Next Steps: Phase 7 (UX Polish & Advanced Chat)

## Overview

Phases 1 through 6 are **officially complete**. We have successfully built the foundation:
- Monorepo structure, tooling, and quality gates
- Provider abstractions (OpenAI & OpenAI-Compatible Local AI)
- Complete UI foundation with Native `StyleSheet`, `expo-blur`, and `expo-linear-gradient`
- Local persistence using Expo SQLite
- Streaming chat interface
- Abstract Telemetry System (`@omnia/logger`)

The goal of **Phase 7** is to elevate the UX to the absolute pinnacle of FAANG standards. As a Staff UI/UX Engineer, the baseline interface is solid, but it lacks the micro-interactions, rich text rendering, and utility features expected of a world-class AI mobile app.

---

## Step 1 — Markdown Parsing & Syntax Highlighting

**Goal:** The AI often returns code blocks, bold text, lists, and tables. Currently, this renders as plain text in the `MessageBubble`. We need to parse Markdown and highlight code elegantly.

### What to build
- Integrate `react-native-markdown-display` or a custom parser.
- Implement a custom code block renderer that uses a syntax highlighter.
- Ensure the code blocks follow the Dark Indigo theme (e.g., using a customized one-dark syntax theme).
- Add a tiny "Copy Code" button on the top right of every code block.

---

## Step 2 — Micro-Interactions (Haptics)

**Goal:** Add tactile feedback to make the app feel "alive".

### What to build
- Integrate `expo-haptics`.
- **Triggers:**
  - `Haptics.selectionAsync()` when changing the active Provider Tab.
  - `Haptics.impactAsync(Light)` when tapping "Send".
  - `Haptics.notificationAsync(Success)` when the AI finishes streaming its response.
  - `Haptics.notificationAsync(Error)` if the connection or stream fails.

---

## Step 3 — Contextual Chat Actions

**Goal:** Allow users to manage their chat messages.

### What to build
- **Copy Message:** Long-press a message bubble to copy its entire content to the clipboard.
- **Stop Generating:** While `isStreaming` is true, the "Send" button should transform into a "Stop" (Square) button. Pressing it aborts the stream and saves the partial response to SQLite.
- **Retry / Edit:** (Optional extension) Allow the user to tap their own message to edit and resend it, branching the conversation.

---

## Step 4 — Scroll & Keyboard UX Polish

**Goal:** Ensure the user never loses context during long AI streams.

### What to build
- **Auto-scroll:** As the stream arrives, the `FlatList` already scrolls to the end, but if the user manually scrolls UP to read previous messages while the AI is typing, the auto-scroll should pause.
- **Scroll to Bottom FAB:** A small floating circular button with a downward arrow that appears only when the user is scrolled up.

---

> By completing Phase 7, Omnia will not only be structurally robust but will feel like a flagship application on the App Store/Play Store.
