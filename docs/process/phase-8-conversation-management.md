# Next Steps: Phase 8 (Conversation Management)

## Overview

Phase 7 is **complete**. The app is now a polished, FAANG-grade chat interface with:
- Drawer navigation (hamburger → conversation list)
- Markdown + custom code block rendering with copy
- Haptics on all key interactions
- Stop Generating, auto-scroll FAB, keyboard push-up on Android

The goal of **Phase 8** is to give users full control over their conversation history. Currently, conversations accumulate silently in the sidebar with no way to organize, rename, or remove them. This phase closes that gap and brings Omnia in line with ChatGPT and Gemini's conversation management UX.

---

## Step 1 — Delete Conversation (Swipe-to-Delete in Sidebar)

**Goal:** Let users remove individual conversations from history.

### What to build
- Implement a **swipe-left gesture** on each `ConversationListItem` in the `Sidebar`.
- Reveal a red **Delete** action button (trash icon) on swipe.
- On confirm, delete from SQLite via `convRepo.delete(id)` and `msgRepo.deleteByConversation(id)`.
- Add a brief **undo toast** (2s window) before the delete is committed, matching iOS/Android patterns.
- Haptics: `Haptics.notificationAsync(Warning)` on delete, `Haptics.impactAsync(Light)` on undo.

### Technical Notes
- Implement swipe gesture using `Animated.Value` + `PanResponder` (no external gesture library required — must stay within the pure RN constraint).
- Do NOT use `react-native-gesture-handler` swipeables, as they require native linking that can conflict with Expo Go.

---

## Step 2 — Rename Conversation

**Goal:** Allow users to give conversations a meaningful title.

### What to build
- **Long-press** on a `ConversationListItem` in the sidebar reveals an **action sheet** (custom modal bottom sheet, pure RN — no `@gorhom/bottom-sheet`).
- Action sheet options:
  - ✏️ **Rename** — opens an inline `TextInput` replacing the title in the list.
  - 🗑️ **Delete** — same flow as Step 1 (delete with undo).
- On rename confirm, call `convRepo.update(id, { title: newTitle })`.
- Cap title at 60 characters, auto-trim whitespace.

---

## Step 3 — Delete All Conversations (Clear History)

**Goal:** One-tap nuclear option for clearing all history.

### What to build
- Add a **"Clear All History"** button in `settings.tsx` under a "Danger Zone" section.
- Show a native `Alert.alert` confirmation dialog before executing.
- On confirm: delete all rows from `conversations` and `messages` tables.
- Navigate to home screen (`router.replace("/")`) after clearing.
- Haptics: `Haptics.notificationAsync(Warning)`.

---

## Step 4 — Conversation Search (Sidebar Filter)

**Goal:** Let users find past conversations by keyword.

### What to build
- Add a **search bar** at the top of the `Sidebar` conversation list (appears below the "New Chat" button).
- Filters the in-memory `conversations` array by `title.toLowerCase().includes(query)` on each keystroke.
- Placeholder: `"Search chats…"` with a `Search` lucide icon.
- Animate the list filtering with `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)`.
- Shows a subtle empty state ("No results for '…'") when no matches found.

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
