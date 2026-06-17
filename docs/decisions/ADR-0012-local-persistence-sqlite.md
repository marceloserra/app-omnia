# ADR-0012: Local Persistence Strategy with Expo SQLite

## Status

Accepted

## Context

The chat history (conversations and messages) needs to be stored on the device for a seamless, privacy-first mobile experience. We evaluated `AsyncStorage` but decided it is insufficient for relational data (e.g., fetching messages by `conversationId`, counting tokens, deleting cascading records).

## Decision

We chose `expo-sqlite` (specifically the `openDatabaseSync` API for React Native/Expo SDK 56) to handle all core domain data. 

We established a Repository Pattern in `packages/storage/src/repositories`:
- `conversation-repo.ts`: Handles CRUD for Conversations.
- `message-repo.ts`: Handles CRUD for Messages.

## Consequences

**Positive:**
- True relational integrity (Foreign Keys with `ON DELETE CASCADE` work perfectly).
- Extremely fast queries compared to parsing JSON blobs out of `AsyncStorage`.
- Architecture allows for clean schema migrations in future phases.

**Negative:**
- Requires native module compilation.
- Introduces complexity when synchronizing data with a future Cloud Backend (Phase 9+), though the strict schema will mitigate this.
