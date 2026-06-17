# ADR-0011: Provider Abstraction & State Management

## Status

Accepted

## Context

Omnia requires the ability to switch between multiple AI providers (e.g., OpenAI, Anthropic, or local open-source models via OpenAI-Compatible endpoints like LM Studio) seamlessly. Furthermore, user configurations for these providers (API keys, URLs) must be preserved across app launches.

## Decision

1. **Provider Abstraction (`packages/providers`)**: We created a unified `BaseProvider` interface with a `streamChat` method that yields standard `ChatStreamChunk` objects, regardless of the underlying SDK used.
2. **State Management (`Zustand`)**: We adopted Zustand to hold the volatile connection state and the currently selected provider configuration.
3. **Persistence (`AsyncStorage`)**: We wrap the Zustand store in `persist` using `@react-native-async-storage/async-storage`. We use a `partialize` filter to save sensitive/static configurations (keys, base URLs) while discarding ephemeral UI states (e.g., `isValidating`, `isConnected`).

## Consequences

**Positive:**
- New providers can be added simply by implementing the `BaseProvider` interface without breaking the UI layer.
- Zustand provides lightweight global state without the heavy boilerplate of Redux.
- User configs survive app restarts thanks to `AsyncStorage`.

**Negative:**
- `AsyncStorage` is currently storing API keys in plain text JSON. In future phases (Production Security), this must be upgraded to `expo-secure-store`.
