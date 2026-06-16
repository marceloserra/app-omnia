# Llama.cpp UI Analysis — UX Philosophy & Patterns

## Executive Summary

This document analyzes the llama.cpp web UI implementation to extract UX philosophy, layout strategies, navigation patterns, and component relationships. The goal is to inform Omnia's mobile design system with proven interaction patterns while adapting them for mobile-first experiences.

---

## Core UX Philosophy

### 1. Conversation-First Mental Model
The llama.cpp UI treats conversations as the primary unit of interaction:
- Conversations are always accessible via sidebar
- Active conversation is prominently displayed
- New conversations can be created without leaving context
- Conversation history provides continuity

**Mobile Adaptation:** Drawer navigation with conversation list as primary surface.

### 2. Calm Information Density
Despite supporting complex features (MCP servers, tools, reasoning), the UI maintains visual calm:
- Generous whitespace between elements
- Clear typographic hierarchy
- Subtle borders instead of heavy dividers
- Muted colors for secondary information

**Mobile Adaptation:** Use spacing tokens generously; avoid cramped interfaces.

### 3. Progressive Disclosure
Complex features are revealed progressively:
- Basic chat interface is immediately accessible
- Advanced settings (temperature, top_p) available in dedicated screens
- MCP server configuration hidden behind settings navigation
- Tool usage shown inline but collapsible

**Mobile Adaptation:** Settings screens for advanced configuration; keep primary chat surface simple.

---

## Layout Strategy

### Desktop Layout Pattern
```
┌─────────────────────────────────────────────────────┐
│ Sidebar (250px) │ Main Content Area                 │
│ - Conversations │ - Chat Messages                   │
│ - Search        │ - Input Composer                  │
│ - Settings      │                                   │
│                 │                                   │
└─────────────────────────────────────────────────────┘
```

**Key Observations:**
- Sidebar is collapsible but always accessible
- Main content area adapts to available space
- Chat form area has fixed height constraints
- Scroll behavior is carefully managed (auto-scroll, manual override)

### Mobile Adaptation Strategy
```
┌─────────────────────┐
│ Navigation Drawer   │ ← Swipe or button trigger
│ - Conversations     │
│ - Providers         │
│ - Settings          │
├─────────────────────┤
│ Chat Screen         │ ← Primary surface
│ - Messages          │
│ - Composer          │
└─────────────────────┘
```

---

## Navigation Patterns

### 1. Sidebar Navigation (Desktop)
- **Structure:** Tree-based with conversation groups
- **Interaction:** Click to select, swipe gestures on mobile
- **Search:** Inline search filters conversations in real-time
- **Actions:** Rename, delete available via context menu

**Mobile Translation:** Bottom sheet or drawer with:
- Conversation list (primary)
- Provider selector (secondary)
- Settings entry point (tertiary)

### 2. Route-Based Navigation
Routes observed in llama.cpp:
- `/(chat)/` — Chat home (new conversation)
- `/(chat)/chat/[id]` — Specific conversation
- `/settings/[[section]]` — Settings with sections
- `/mcp-servers` — MCP server management

**Mobile Translation:** Expo Router screens:
- `/` — Home (conversation list or last active)
- `/chat/[id]` — Active conversation
- `/settings` — Settings screen
- `/providers` — Provider selection

### 3. State Management Pattern
llama.cpp uses Svelte stores for state:
- `conversationsStore` — Conversation CRUD + active state
- `chatStore` — Message streaming, UI state
- `modelsStore` — Model selection and availability
- `settingsStore` — User preferences

**Mobile Translation:** React Context or Zustand for similar patterns.

---

## Component Relationships

### Chat Screen Composition
```
ChatScreen
├── ChatMessages (scrollable list)
│   └── MessageBubble (user/assistant variants)
│       ├── TextContent
│       ├── CodeBlocks (with syntax highlighting)
│       ├── ToolUsage (collapsible sections)
│       └── ReasoningChain (if enabled)
├── ChatFormArea
│   ├── InputComposer (text input + attachments)
│   ├── SendButton
│   └── ModelSelector (dropdown)
└── ProcessingInfo (streaming status, tokens/sec)
```

### Settings Screen Composition
```
SettingsScreen
├── SettingsGroup (repeated for each category)
│   ├── GroupHeader
│   ├── SettingRow (toggle, select, input variants)
│   └── GroupFooter (if needed)
└── SettingsFooter (version info, links)
```

---

## Visual Hierarchy

### Typography Scale
- **Headers:** Bold, larger size for section titles
- **Body:** Regular weight for message content
- **Caption:** Smaller, muted for metadata
- **Code:** Monospace with distinct background

### Color Strategy
- **Primary:** Used for interactive elements (buttons, links)
- **Secondary:** Supporting actions and information
- **Muted:** Metadata, timestamps, disabled states
- **Destructive:** Error states, delete actions
- **Accent:** Highlights, selections

### Spacing Pattern
- **XS (4px):** Micro-spacing within components
- **SM (8px):** Standard padding/margins
- **MD (16px):** Section spacing
- **LG (24px):** Major divisions
- **XL (32px+):** Screen-level spacing

---

## Interaction Patterns

### 1. Message Streaming
- Real-time token display with typing indicator
- Auto-scroll follows new content
- Manual scroll disables auto-scroll temporarily
- Processing info shows model, tokens/sec, estimated time

**Mobile Consideration:** Ensure smooth scrolling; provide clear streaming indicators.

### 2. Attachment Handling
- Drag-and-drop on desktop
- File picker on mobile
- Inline preview for supported types
- Error handling for unsupported formats

**Mobile Consideration:** Use platform-native file pickers; show clear feedback.

### 3. Model Selection
- Dropdown selector in chat form
- Availability indicators (online/offline)
- Modality filters (text, vision, etc.)
- Quick switch without losing conversation

**Mobile Consideration:** Bottom sheet for model selection; keep it accessible.

---

## Accessibility Patterns

- Keyboard navigation support (arrow keys, shortcuts)
- ARIA labels on interactive elements
- Focus management during dialogs
- High contrast mode support
- Screen reader friendly structure

**Mobile Translation:** VoiceOver/TalkBack compatibility; proper accessibility labels.

---

## Key Takeaways for Omnia Mobile

1. **Conversation-first navigation** — Drawer with conversations as primary surface
2. **Calm visual design** — Generous spacing, muted secondary information
3. **Progressive disclosure** — Advanced settings in dedicated screens
4. **Clear component hierarchy** — Primitives → Composed → Feature components
5. **Streaming UX** — Smooth indicators, auto-scroll behavior
6. **Model accessibility** — Easy model switching without friction
7. **Settings organization** — Grouped settings with clear navigation

---

*Analysis based on llama.cpp UI source code as of June 2025.*
