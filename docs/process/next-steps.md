# Next Steps: Phase 3 → Phase 4 → Phase 5

## Overview

This document maps the immediate implementation roadmap following Phase 2 sign-off.
The goal is to go from a working Design System to a fully functional chat experience with real AI providers.

---

## Step 1 — Provider Settings Screen ✅ DONE (2026-06-16)

**Goal:** Allow the user to select a provider, enter credentials, and validate the connection on-device.

### What to build
- `apps/mobile/app/settings.tsx` — Settings screen reachable from the Stack header
- A `ProviderSettingsCard` composed component using `Card`, `Input`, `Button`
- A lightweight state store using **Zustand** (`packages/core` or inline in `apps/mobile/store/`)

### State shape
```ts
interface ProviderState {
  activeProviderId: "openai" | "openai-compatible" | null;
  openaiApiKey: string;
  compatibleBaseUrl: string;
  compatibleApiKey?: string;
  activeModelId: string | null;
  setProvider: (id: ProviderState["activeProviderId"]) => void;
  setOpenaiKey: (key: string) => void;
  setCompatibleUrl: (url: string) => void;
  setActiveModel: (modelId: string) => void;
}
```

### Packages needed
```bash
pnpm --filter mobile add zustand
```

### Files to create
- `apps/mobile/store/provider-store.ts` — Zustand store
- `apps/mobile/app/settings.tsx` — Settings screen
- `apps/mobile/components/ui/ProviderSettingsCard.tsx` — Composed component

### Notes for agents
- Use `packages/providers` `OpenAIProvider.validateConnection()` and `listModels()` directly
- Do NOT persist API keys to AsyncStorage in Phase 3. Use in-memory state only (Phase 4 adds SQLite)
- Add a settings icon `IconButton` to the Stack header of the index screen pointing to `/settings`

---

## Step 2 — SQLite Persistence (Phase 4)

**Goal:** Persist conversations and messages locally on-device using Expo SQLite.

### What to build
- `packages/storage/src/db.ts` — Database setup and migrations
- `packages/storage/src/repositories/conversation-repo.ts` — CRUD for `Conversation`
- `packages/storage/src/repositories/message-repo.ts` — CRUD for `Message`

### Packages needed
```bash
pnpm --filter mobile exec expo install expo-sqlite
```

### Schema
```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  system_prompt TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  provider_id TEXT,
  model_id TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  timestamp INTEGER NOT NULL
);
```

### Notes for agents
- Use the `@omnia/shared-types` domain models as the input/output types for all repo functions
- Use `expo-sqlite` `openDatabaseSync` (synchronous API, SDK 56 compatible)
- Add a migration version table for future schema changes

---

## Step 3 — Chat Interface (Phase 5)

**Goal:** A functional chat screen where the user can send messages and receive streaming AI responses.

### What to build
- `apps/mobile/app/chat/[conversationId].tsx` — Chat screen (dynamic route)
- `apps/mobile/components/chat/MessageBubble.tsx` — User/Assistant message bubbles
- `apps/mobile/components/chat/ChatInput.tsx` — Bottom input bar with send button
- `apps/mobile/components/chat/ConversationList.tsx` — List on the index screen

### UI Design Notes
- MessageBubble: user messages right-aligned with indigo background, assistant messages left-aligned with `SURFACE=#13112a` background
- ChatInput: fixed bottom bar with the `Input` component + `IconButton(Send)`
- ConversationList: each item is an interactive `Card` with last message preview and timestamp

### Notes for agents
- Wire `OpenAIProvider.streamChat()` to update the assistant message in real-time via `useState`
- Use the `MessageRepo` from Phase 4 to persist each message after it's fully streamed
- Load provider config from the Zustand store created in Step 1
