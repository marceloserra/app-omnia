# ADR 0025: Model Selection Belongs in Chat Context, Not Settings

Date: 2026-06-17

## Status

Accepted

## Context

The initial implementation placed model selection inside the Settings screen, alongside provider credentials (API Key, Base URL). This created a poor user experience: switching models required the user to leave the active conversation, navigate to Settings, find the provider section, open a model picker, confirm the change, and return to chat — a 6-step flow for a contextual, frequent action.

Additionally, the original model selector used a "chip grid" layout. Chip grids do not scale beyond ~5 items. Real providers expose many models (OpenAI alone offers gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo, o1, o1-mini, and growing), making the chip approach untenable.

## Decision

We separate concerns into two distinct layers:

### 1. Settings = Infrastructure (credentials only)

`/settings` is the correct place for:
- API Key input and validation
- Base URL configuration for local/compatible providers
- Provider connect / disconnect lifecycle
- Theme and language preferences

Model selection is **not** infrastructure. It does not require authentication context. It is a per-session preference.

### 2. Chat Header = Active Model (contextual switching)

A tappable chip in the chat header shows the currently active model at a glance. Tapping it opens a bottom sheet picker with a search field and a scrollable `FlatList`. This mirrors the pattern used by:
- **Claude.ai** — model pill in the chat header
- **ChatGPT** — model dropdown at the top of the input area
- **Gemini** — model selector accessible from the chat screen

The chip:
- Is green (`#10b981`) to signal "active / connected" status, consistent with the connection dot in provider tabs
- Truncates long model names (`numberOfLines={1}`, `maxWidth`) — full name is visible in the picker sheet
- Is hidden when no provider is active

### 3. Model Picker = Bottom Sheet with Search (not chips)

The model picker is a `Modal` with `presentationStyle="pageSheet"` containing:
- A drag handle
- A header with title and close button
- A search `TextInput` that filters models by substring match
- A `FlatList` of model rows (scales to 1000+ items)
- Selected row highlighted with an indigo left accent border

Chips are **never** the right pattern for lists of unknown or large cardinality. Bottom sheet pickers are the FAANG standard for any list that can grow beyond 5 items.

## Consequences

- **Positive**: Model switching is a 1-tap action from within the chat context.
- **Positive**: Settings is cleaner, focused on authentication and infrastructure.
- **Positive**: The picker scales to any number of models without layout degradation.
- **Negative**: Users must understand that the header chip is interactive (mitigated by the chevron icon and green color drawing attention).
- **Guideline**: Any future per-session preference (e.g., temperature, system prompt) should follow this same pattern — surfaced in the chat header or input area, not buried in Settings.
