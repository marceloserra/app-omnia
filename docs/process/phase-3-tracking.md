# Phase 3 Tracking: Domain Models & Providers

> **Phase 2 Sign-off (2026-06-16):** Design System is LIVE on device with deep indigo/glassmorphism aesthetic. All 5 UI components rewritten using native RN `StyleSheet`-compatible styles (no `cva`, no `hover:` classes). Storybook stories updated to match. See troubleshooting.md Issues 5–8 for all lessons learned.


## Purpose
This document logs the implementation progress and structural decisions made during Phase 3, ensuring other agents can safely continue the work without violating the architecture.

## 1. Domain Models (`packages/shared-types/src/types/chat.ts`)
- **Conversation:** Core entity holding metadata (`title`, `createdAt`, `systemPrompt`).
- **Message:** Belongs to a conversation. Includes fields for `providerId` and `modelId` (to track which AI generated it) and `metadata` for token counts.
- **Role:** Strictly typed to `"system" | "user" | "assistant"`.

## 2. Provider Abstraction (`packages/shared-types/src/types/provider.ts`)
We established the `LLMProvider` interface following the strict requirements of `docs/architecture/provider-architecture.md`:
- `validateConnection(config)`: Boolean check for API key or local URL validity.
- `listModels(config)`: Fetches available models (dynamic for LM Studio/Ollama, static for OpenAI).
- `streamChat(config, request)`: Core asynchronous generator yielding `StreamChunk` objects (`{ content, done }`).

## 3. OpenAI & OpenAI-Compatible Strategy
Because `OpenAICompatibleProvider` must support LM Studio, Ollama, llama.cpp, vLLM, and LocalAI using the exact same code, the `ProviderConnectionConfig` enforces a `baseUrl` property alongside an optional `apiKey`.
- Next step for agents: Implement `OpenAIProvider` in `packages/providers` implementing the `LLMProvider` interface.
- Followed by `OpenAICompatibleProvider` which overrides the base URL to target `http://localhost:1234/v1` (LM Studio default) or custom URLs.

## Agent Guidelines for Phase 3
- DO NOT couple UI components in `apps/mobile` directly to the provider implementations yet.
- DO NOT use native mobile SDKs for HTTP requests unless explicitly required. Use standard cross-platform fetch API inside the provider packages.
- Always use the `packages/shared-types` entities across the monorepo.
