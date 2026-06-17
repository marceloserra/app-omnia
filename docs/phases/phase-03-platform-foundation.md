# Phase 03 - Platform Foundation

## Goal
Define the domain models and provider contracts.

## What Was Built
- Created `packages/shared-types` containing types for `Message`, `Conversation`, `LLMConfig`.
- Created `packages/providers` defining the abstract interface `BaseProvider`.
- Implemented `OpenAIProvider` for cloud streaming.
- Implemented `OpenAICompatibleProvider` for local models (e.g., LM Studio, Ollama).
- Implemented the core Zustand state management in `provider-store.ts`.

## Key Decisions
- Extracted shared types and providers into their own Turborepo packages (`@omnia/shared-types`, `@omnia/providers`) to ensure clear dependency boundaries.
- Adopted an async streaming architecture (`streamChat`) that yields `AsyncGenerator<string>` to allow real-time UI updates.