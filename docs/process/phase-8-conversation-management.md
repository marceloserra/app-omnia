# Next Steps: Phase 8 (Conversation Management)

## Overview

Phase 7 is **complete**. The app is now a polished, FAANG-grade chat interface with:
- Drawer navigation (hamburger → conversation list)
- Markdown + custom code block rendering with copy
- Haptics on all key interactions
- Stop Generating, auto-scroll FAB, keyboard push-up on Android

The goal of **Phase 8** is to give users full control over their conversation history. Currently, conversations accumulate silently in the sidebar with no way to organize, rename, or remove them. This phase closes that gap and brings Omnia in line with ChatGPT and Gemini's conversation management UX.

---

## Step 1 — Delete Conversation (Context Menu over Swipe)

**Goal:** Let users remove individual conversations from history.

### What was built
- **Decision (ADR-0016):** Swipe-to-delete using PanResponder was bypassed in favor of a FAANG-grade **Bottom Sheet Context Menu** triggered by a long-press. This prevents gesture conflicts with the Drawer navigation.
- A custom `<ConfirmDialog>` component replaces the native `Alert.alert` to maintain the premium dark-mode aesthetic.
- Deletion removes rows from SQLite via `convRepo.delete(id)` and `msgRepo.deleteByConversation(id)`.
- Haptics: `Haptics.notificationAsync(Warning)` on delete.

---

## Step 2 — Rename & Pin Conversation

**Goal:** Allow users to give conversations a meaningful title and pin favorites.

### What was built
- **Long-press** on a `ConversationListItem` reveals the Bottom Sheet.
- 📌 **Pin** — Adds the conversation ID to a Set, rendering it at the top with a distinct icon.
- ✏️ **Rename** — Opens an inline `TextInput` replacing the title in the list seamlessly.
- 🗑️ **Delete** — Opens the custom `ConfirmDialog`.

---

## Step 3 — Delete All Conversations (Clear History)

**Goal:** One-tap nuclear option for clearing all history.

### What was built
- Added a **"Clear All History"** Danger Zone card in `settings.tsx`.
- Uses the custom `<ConfirmDialog>` instead of a native Alert (ADR-0016).
- On confirm: calls `deleteAll()` on repos and navigates to `router.replace("/")`.

---

## Step 4 — Conversation Search (Sidebar Filter)

**Goal:** Let users find past conversations by keyword.

### What was built
- Search bar at the top of the `Sidebar`.
- Filters the in-memory array by `title.toLowerCase()`.

---

## Step 5 — Conversation Timestamps & Grouping

**Goal:** Make the sidebar scannable and date-aware, like ChatGPT.

### What to build
- Group conversations by relative date: **Today**, **Yesterday**, **Last 7 days**, **Older**.
- Display section headers between groups (small uppercase labels, already in sidebar style).
- Format timestamps on each conversation item: `"2h ago"`, `"Yesterday"`, `"Jun 12"`.
- Use `date-fns` or a lightweight pure-JS time formatter (no moment.js).

---

## Phase 8 Non-Goals

- No cloud sync or cross-device conversation history.
- No conversation branching or forking.
- No folder/tag organization (deferred to a future phase).
- No bulk multi-select delete (deferred).
- No search across message *content* (only title search in this phase).

---

## Quality Gates (Phase 8)

Before declaring Phase 8 complete, all of the following must pass:

| Gate | Command | Required Result |
|------|---------|-----------------|
| Typecheck | `pnpm typecheck` | No TS errors |
| Lint | `pnpm lint` | No lint errors |
| Android bundle | `pnpm --filter ./apps/mobile exec expo export --platform android ...` | Bundle completes |
| iOS bundle | `pnpm --filter ./apps/mobile exec expo export --platform ios ...` | Bundle completes |
| Manual QA: Delete | Swipe-delete a conversation | Row removed from sidebar and SQLite |
| Manual QA: Rename | Long-press rename | Title updated in sidebar and SQLite |
| Manual QA: Clear All | Settings → Clear All | Home screen, all history gone |
| Manual QA: Search | Type in sidebar search | List filters correctly |
| Manual QA: Keyboard | Open any chat, tap input | Input visible above keyboard on Android |

> **Agent Rule:** Phase 8 work must not be started until the user explicitly activates it. When activated, update `AGENTS.md` to set `Active phase: Phase 8`.
