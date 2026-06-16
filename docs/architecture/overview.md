# Architecture Overview

## Purpose

Describe the Phase 1 architecture boundaries for Omnia.

## Current Structure

- `apps/mobile` contains the Expo React Native app.
- `apps/web` is documentation-only during MVP.
- `packages/shared-types` will own domain models and Zod schemas.
- `packages/core`, `packages/providers`, `packages/storage`, and `packages/ui` are reserved for later phases and contain no implementation in Phase 1.

## Agent Boundary

Agents may add documentation to reserved packages during Phase 1, but must not add runtime code there until the matching phase begins.

## Provider Boundary

Provider-specific APIs must not leak into screens. Phase 2 will define an `LLMProvider` abstraction with `listModels`, `validateConnection`, and `streamChat` capabilities before concrete providers are implemented.

## Persistence Boundary

SQLite is the required primary persistence layer. AsyncStorage must not be used as primary storage for providers, conversations, or messages.

## Web Boundary

Web support is future-compatible only. No web implementation is part of MVP Phase 1.
