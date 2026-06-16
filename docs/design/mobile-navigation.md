# Mobile Navigation Architecture — Omnia

## Purpose

This document defines the navigation architecture for Omnia mobile, including route structure, navigation patterns, and state management. It ensures consistent navigation behavior across all screens and contributors.

---

## Route Structure

Omnia uses Expo Router for file-based routing. The route structure reflects user mental models: conversations first, then configuration.

### Primary Routes

```
/                          → Home (conversation list or last active)
/chat/[id]                → Active conversation screen
/settings                 → Settings screen
/providers               → Provider selection screen
```

### Route Parameters

| Route | Parameter | Description | Example |
|-------|-----------|-------------|---------|
| `/chat/[id]` | `id` | Conversation identifier | `/chat/abc123` |
| `/settings` | (none) | Settings home | `/settings` |
| `/providers` | (none) | Provider list | `/providers` |

---

## Navigation Patterns

### 1. Drawer Navigation (Primary)

**Purpose:** Access conversations, providers, and settings from any screen.

**Structure:**
```
┌─────────────────────┐
│ Drawer Header       │
│ - User Profile      │
│ - Account Settings  │
├─────────────────────┤
│ Conversations       │ ← Primary section
│ - Recent Chat 1     │
│ - Recent Chat 2     │
│ ...                 │
├─────────────────────┤
│ Providers           │ ← Secondary section
│ - OpenAI            │
│ - Anthropic         │
│ ...                 │
├─────────────────────┤
│ Settings            │ ← Tertiary section
│ - Preferences       │
│ - Appearance        │
└─────────────────────┘
```

**Interaction:**
- Swipe from left edge to open
- Button tap in header to open
- Tap item to navigate and close drawer
- Swipe right or back button to close

### 2. Stack Navigation (Within Screens)

**Purpose:** Navigate within a context without losing primary screen.

**Examples:**
- Settings → Specific setting detail
- Provider selection → Model list for provider
- Conversation → Edit title modal

**Pattern:** Use React Navigation stack or Expo Router nested routes.

### 3. Modal Sheets (Overlays)

**Purpose:** Temporary overlays that don't change navigation stack.

**Use Cases:**
- Model selector within chat screen
- Quick settings toggle
- Confirmation dialogs
- Attachment picker

**Behavior:**
- Present over current screen
- Dismiss returns to previous state
- Don't add to navigation history

---

## Navigation State Management

### Active Conversation Tracking

The app maintains active conversation state:
```typescript
interface AppState {
  activeConversationId?: string;
  lastActiveTimestamp: number;
}
```

**Behavior:**
- On app launch, restore last active conversation if exists
- On drawer selection, update active conversation
- On chat screen close, preserve active state for return

### Conversation List State

Drawer maintains conversation list:
```typescript
interface ConversationListState {
  conversations: Conversation[];
  isLoading: boolean;
  hasMore: boolean; // pagination
}
```

**Behavior:**
- Load recent conversations on drawer open
- Paginate as user scrolls
- Update in real-time when new messages arrive

---

## Navigation Transitions

### Screen Transition Patterns

| From | To | Transition | Duration |
|------|-----|------------|----------|
| Home → Chat | Slide from right | 300ms |
| Chat → Settings | Fade | 200ms |
| Drawer open → close | Swipe dismiss | 250ms |
| Modal present → dismiss | Scale down | 200ms |

### Implementation Notes

Use React Navigation transition presets:
```typescript
<Stack.Screen
  name="chat"
  options={{
    animation: 'slide_from_right',
    animationDuration: 300,
  }}
/>
```

---

## Accessibility Considerations

### Screen Reader Navigation

- Drawer items must have clear labels
- Current screen announced on navigation
- Back button behavior consistent across platforms

### Keyboard Navigation (Testing)

- Tab order follows visual hierarchy
- Focus management during modal presentation
- Escape key dismisses modals/drawers

---

## Platform-Specific Behavior

### iOS
- Swipe from left edge opens drawer
- Back swipe closes screen (if stack allows)
- Haptic feedback on navigation actions

### Android
- System back button behavior:
  - Drawer open → close drawer
  - Modal present → dismiss modal
  - Stack screen → navigate back
  - Home screen → exit app (with confirmation if needed)

---

## Navigation Analytics (Future Phase)

Track navigation patterns for optimization:
- Time spent per screen type
- Navigation frequency between screens
- Drawer open/close rates
- Error states during navigation

**Note:** Implement in Phase 04+ when analytics infrastructure exists.

---

*Navigation architecture defined June 2025. Aligned with Expo Router capabilities and mobile UX conventions.*
