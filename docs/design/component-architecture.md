# Component Architecture — Omnia Mobile

## Purpose

This document defines the component hierarchy, ownership boundaries, and composition patterns for Omnia's mobile UI. It ensures consistent structure across contributors and phases.

---

## Architecture Overview

Omnia components follow a three-tier architecture:

```
Tier 1: Primitives (ui/)
   ↓ Composed by
Tier 2: Feature Components (chat/, settings/, etc.)
   ↓ Assembled into
Tier 3: Screens (app/)
```

### Tier Responsibilities

| Tier | Location | Responsibility | Example |
|------|----------|----------------|---------|
| Primitives | `components/ui/` | Basic building blocks, no domain logic | Button, Input, Card |
| Feature | `components/{feature}/` | Domain-specific compositions | ChatBubble, SettingsRow |
| Screens | `app/` | Screen-level assembly, navigation | `_layout.tsx`, `index.tsx` |

---

## Primitive Components (Tier 1)

### Directory: `apps/mobile/components/ui/`

Primitive components are framework-agnostic building blocks. They:
- Accept props for configuration
- Have no business logic
- Are styled via NativeWind classes
- Support light/dark themes through design tokens
- Are documented in Storybook

### Required Primitives (Phase 02)

#### Button.tsx
**Purpose:** Primary interactive element for actions.
**Variants:** primary, secondary, ghost, destructive
**Sizes:** sm, md, lg
**States:** default, loading, disabled

```tsx
<Button variant="primary" size="md">Send</Button>
<Button variant="destructive" loading={true}>Deleting...</Button>
```

#### IconButton.tsx
**Purpose:** Icon-only button for compact interactions.
**Props:** icon (Lucide React component), size, variant

```tsx
<IconButton icon={Settings} size="md" />
```

#### Input.tsx
**Purpose:** Text input field with label support.
**Variants:** text, textarea, search
**States:** default, error, disabled

```tsx
<Input label="Message" placeholder="Type..." variant="textarea" />
```

#### Avatar.tsx
**Purpose:** User or model representation.
**Props:** image, initials, size, status indicator

```tsx
<Avatar initials="GPT-4" size="md" />
```

#### Divider.tsx
**Purpose:** Visual separation between sections.
**Variants:** horizontal, vertical

```tsx
<Divider orientation="horizontal" />
```

#### Card.tsx
**Purpose:** Content container with elevation.
**Props:** children, padding variant, interactive flag

```tsx
<Card padding="md">Content</Card>
```

#### Sheet.tsx
**Purpose:** Bottom sheet for mobile overlays (settings, model selection).
**Props:** open, onDismiss, children, height

```tsx
<Sheet open={isOpen} onDismiss={() => setIsOpen(false)}>
  <ModelSelector />
</Sheet>
```

---

## Feature Components (Tier 2)

### Directory: `apps/mobile/components/{feature}/`

Feature components compose primitives for domain-specific use. They:
- May contain business logic hooks
- Use primitives exclusively (no direct React Native primitives)
- Are styled consistently with design tokens
- Have Storybook stories showing variants

### Required Feature Components (Phase 02)

#### ChatBubble.tsx (`components/chat/`)
**Purpose:** Message display for user or assistant.
**Props:** role, content, timestamp, isStreaming

```tsx
<ChatBubble role="assistant" content="Hello!" timestamp={Date.now()} />
```

#### ChatComposer.tsx (`components/chat/`)
**Purpose:** Message input with send action.
**Props:** value, onChange, onSend, modelSelectorRef

```tsx
<ChatComposer value={message} onChange={setMessage} onSend={handleSubmit} />
```

#### ConversationItem.tsx (`components/chat/`)
**Purpose:** Conversation list item in drawer.
**Props:** title, preview, isActive, onSelect

```tsx
<ConversationItem title="Project Discussion" preview="Last message..." isActive={true} />
```

#### ProviderCard.tsx (`components/providers/`)
**Purpose:** AI provider selection card.
**Props:** name, models[], isSelected, onSelect

```tsx
<ProviderCard name="OpenAI" models={['GPT-4', 'GPT-3.5']} isSelected={true} />
```

#### SettingsRow.tsx (`components/settings/`)
**Purpose:** Individual setting configuration row.
**Props:** label, description, control (toggle/select/input), value

```tsx
<SettingsRow label="Dark Mode" control={<Toggle />} value={darkMode} />
```

#### ModelSelector.tsx (`components/model/`)
**Purpose:** Model selection interface within sheet or dropdown.
**Props:** models[], selectedId, onSelect, filterByModality

```tsx
<ModelSelector models={availableModels} selectedId="gpt-4" onSelect={handleSelect} />
```

---

## Screen Assembly (Tier 3)

### Directory: `apps/mobile/app/`

Screens assemble feature components with navigation context. They:
- Handle route parameters and state
- Manage screen-level effects (hooks, subscriptions)
- Compose multiple feature components
- Define layout structure

### Example Composition Pattern

```tsx
// app/chat/[id].tsx
export default function ChatScreen() {
  return (
    <View className="flex flex-col h-full">
      <Header title={conversation.title} />
      <ScrollView>
        {messages.map(msg => (
          <ChatBubble key={msg.id} {...msg} />
        ))}
      </ScrollView>
      <ChatComposer value={input} onChange={setInput} onSend={sendMessage} />
    </View>
  );
}
```

---

## Ownership Boundaries

### Component Ownership Matrix

| Component Type | Owner | Modification Rights |
|---------------|-------|---------------------|
| Primitives (ui/) | Design System Team | All contributors with review |
| Feature Components | Feature Owners | Feature team + design review |
| Screens | Screen Owners | Screen team only |

### Cross-Tier Dependencies

- **Primitives → Feature:** ✅ Allowed (composition)
- **Feature → Primitives:** ❌ Not allowed (primitives should be generic)
- **Screen → Feature:** ✅ Allowed (assembly)
- **Feature → Screen:** ❌ Not allowed (screens are leaf nodes)
- **Screen → Primitive:** ⚠️ Discouraged (use feature components instead)

---

## Styling Strategy

### NativeWind Classes
All components use NativeWind for styling:
```tsx
<Button className="px-4 py-2 bg-primary rounded-md">
```

### Design Token References
Custom tokens via CSS variables:
```css
--spacing-sm: 8px;
--color-muted: oklch(0.556 0 0);
```

### Theme Support
Components must support light/dark through:
- NativeWind dark mode class strategy
- Design token color references
- No hardcoded colors in components

---

## Documentation Requirements

Every component must have:
1. **Storybook story** showing all variants and states
2. **JSDoc comments** for props with descriptions
3. **Usage examples** in documentation or stories
4. **Accessibility notes** (ARIA attributes, screen reader behavior)

---

*Architecture defined June 2025. Reviewed against llama.cpp component patterns.*
