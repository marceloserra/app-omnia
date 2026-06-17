# Phase 04 - SQLite Persistence

## Goal
Enable offline-first, on-device storage for conversations and messages.

## What Was Built
- Created `packages/storage` wrapper around `expo-sqlite`.
- Initialized SQLite tables: `conversations` and `messages`.
- Created `createConversationRepo(db)` and `createMessageRepo(db)` following the repository pattern.
- Implemented full CRUD operations (Create, Read, Update, Delete) for messages and conversations.

## Key Decisions
- Ignored `AsyncStorage` for chat history due to its limitations with large unstructured datasets.
- Adopted local-first architecture: The database acts as the single source of truth; the UI queries the database.
