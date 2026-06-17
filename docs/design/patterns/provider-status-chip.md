# Pattern: ProviderStatusChip

**Category:** Navigation · Status Feedback  
**Location:** `apps/mobile/components/navigation/Sidebar.tsx`  
**Phase introduced:** 8  
**ADR:** [ADR-0017](../../decisions/ADR-0017-provider-status-indicator-placement.md)

---

## What It Is

A compact, inline status indicator that communicates the current AI provider connection state. It lives in the **Sidebar drawer header**, directly below the "Omnia AI" brand name.

```
  ✦  Omnia AI
     ● OpenAI          ← this component
```

It is **not** a button. It is **not** in the footer. It is a read-only contextual signal at the top of the navigation surface.

---

## Visual Anatomy

```
[ dot ] [ label text ]

dot    → 6×6 px circle, borderRadius 3
         green (#22c55e) + glow shadow when connected
         red (#ef4444), no glow, when disconnected

label  → 11px, fontWeight 500, TEXT_SECONDARY (#94a3b8)
         "OpenAI" | "Local AI" | "No provider"
```

**States:**

| State | Dot color | Label |
|---|---|---|
| OpenAI connected | `#22c55e` + glow | `OpenAI` |
| Local AI connected | `#22c55e` + glow | `Local AI` |
| No provider | `#ef4444` | `No provider` |

---

## Styles Reference

```ts
providerChip: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 3,
},
providerChipText: {
  color: TEXT_SECONDARY,   // #94a3b8
  fontSize: 11,
  fontWeight: "500",
  letterSpacing: 0.2,
},
statusDot: {
  width: 6,
  height: 6,
  borderRadius: 3,
  marginRight: 6,
},
statusDotConnected: {
  backgroundColor: "#22c55e",
  shadowColor: "#22c55e",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.8,
  shadowRadius: 4,
  elevation: 2,
},
statusDotDisconnected: {
  backgroundColor: "#ef4444",
},
```

---

## Composition in Context

```tsx
{/* Sidebar Header */}
<View style={styles.logoRow}>
  <View style={styles.logoCircle}>
    <Sparkles size={18} color="#a5b4fc" />
  </View>
  <View>
    <Text style={styles.logoText}>Omnia AI</Text>

    {/* ProviderStatusChip */}
    <View style={styles.providerChip}>
      <View style={[
        styles.statusDot,
        store.activeProviderId
          ? styles.statusDotConnected
          : styles.statusDotDisconnected,
      ]} />
      <Text style={styles.providerChipText}>
        {store.activeProviderId === "openai"
          ? "OpenAI"
          : store.activeProviderId === "openai-compatible"
          ? "Local AI"
          : "No provider"}
      </Text>
    </View>
  </View>
</View>
```

---

## Design Rationale

### Pattern Origin

This follows the **Notion/Discord/Slack** contextual header pattern:

| App | Header shows | Sub-label shows |
|---|---|---|
| Slack | Workspace name | Connection status |
| Discord | Server name | Boost level |
| Notion | Workspace name | Plan badge |
| **Omnia** | Brand name | Provider + connection status |

The header is where the user **establishes context** on open. The dot answers *"am I connected?"* before the user even thinks to ask.

### Why a dot, not a text badge?

A dot requires zero reading. At 6px it is a pre-attentive signal — the brain reads green/red faster than any word. The label beside it adds precision without requiring the dot to be larger. This is the same principle as a Wi-Fi icon: shape = category, color = state.

### Why glow only on connected?

The glow shadow (`shadowColor: green, shadowRadius: 4`) makes the connected state feel *alive* — it subtly pulses the idea of "live connection." The disconnected red is flat because an error should feel inert, not energetic.

---

## Future Expansion Point

If a **model selector** is added (Phase N), the `providerChip` row is the natural tap target. Tapping it could open a bottom sheet to switch models or providers, turning this read-only indicator into an interactive affordance without changing the visual hierarchy.

```
  ✦  Omnia AI
     ● OpenAI · gpt-4o  ›     ← future: tappable chip
```

---

## Do Not

- Do **not** move this to the footer alongside Settings — that mixes navigation affordances with status feedback.
- Do **not** move this to the app top bar — it clutters a header designed to be minimal.
- Do **not** add animation (pulse/blink) to the dot — it would be distracting during conversation reading.
- Do **not** grow the dot beyond 8px — it becomes a badge, not a signal.
