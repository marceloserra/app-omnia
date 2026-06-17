# ADR-0017 — Provider Status Indicator Placement

**Status:** Accepted  
**Date:** 2026-06-17  
**Phase:** 8 — Conversation Management (Polish)

---

## Context

Omnia supports multiple AI providers (OpenAI cloud, Local AI via OpenAI-compatible endpoint). Users need an always-visible, at-a-glance signal of their current connection state — especially when switching from cloud to local and back.

The question was: **where in the navigation surface does this indicator live?**

Three candidates were evaluated:

| Location | Description |
|---|---|
| **A — Sidebar footer** | Inline with the Settings button at the bottom of the drawer |
| **B — Sidebar header** | Below the "Omnia AI" logo, at the top of the drawer |
| **C — App top bar** | Next to the hamburger or model name in `index.tsx` / `chat/` headers |

---

## Decision

**Option B — Sidebar header**, directly below the brand logo text.

The status chip is rendered as:

```
┌──────────────────────────────────────┐
│  ✦  Omnia AI                       ✕ │
│     ● OpenAI                         │  ← providerChip (11px, TEXT_SECONDARY)
├──────────────────────────────────────┤
│  + New chat                          │
│  🔍 Search chats...                  │
│  ...conversation list...             │
├──────────────────────────────────────┤
│  ⚙  Settings                        │  ← clean, navigation-only
└──────────────────────────────────────┘
```

---

## Rationale

### Why not the footer (Option A)?

The footer is a **navigation affordance** — it leads the user somewhere (Settings). Mixing operational status (connected/disconnected) with navigation creates a cognitive category error. Users scan footers for "where do I go," not "what state am I in." The information is buried and almost always ignored.

### Why not the app bar (Option C)?

The top bars in `index.tsx` and `chat/[conversationId].tsx` are intentionally minimal (hamburger · logo · settings). Adding a status indicator there would crowd a header whose primary job is identity and navigation. It would also appear on every screen, while the provider context is most relevant when the user is *managing* conversations — exactly when the drawer is open.

### Why the header (Option B)?

This is the **Notion/Discord/Slack pattern**:

- **Notion:** Workspace name → workspace plan badge
- **Discord:** Server name → server boost level indicator
- **Slack:** Workspace name → connection status indicator

The header is where the user **establishes session context**: *who am I connected to?* The dot appears the moment the drawer opens, requiring zero additional interaction. It answers the question before the user has to ask it.

The footer returns to its single responsibility: navigation to Settings.

---

## Consequences

- `Sidebar.tsx` header now renders a `providerChip` row below `logoText`.
- The `statusDot` style is shared between `statusDotConnected` (green with glow shadow) and `statusDotDisconnected` (red, no glow).
- The footer `Settings` row is simplified to icon + label only — no status text.
- If a future phase adds a "model selector" feature, the chip area in the header is the natural expansion point (e.g., tap chip → open model picker sheet).

---

## References

- [Sidebar.tsx](../../apps/mobile/components/navigation/Sidebar.tsx)
- [ADR-0016 — Premium Mobile UI Patterns](./ADR-0016-premium-mobile-ui-patterns.md)
- [Component Pattern: ProviderStatusChip](../design/patterns/provider-status-chip.md)
