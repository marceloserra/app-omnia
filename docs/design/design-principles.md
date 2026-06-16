# Omnia Design Principles

## Purpose

This document defines the design principles that guide all UI decisions in Omnia. These principles ensure consistency, maintainability, and alignment with our product vision across all contributors and phases.

---

## Core Principles

### 1. Calm Clarity
**Statement:** The interface should feel calm and uncluttered, allowing content to take precedence over chrome.

**Examples:**
- ✅ Generous whitespace between message bubbles
- ✅ Subtle borders instead of heavy dividers
- ✅ Muted colors for metadata (timestamps, model names)
- ❌ Bright, attention-grabbing decorative elements
- ❌ Dense information packing without breathing room

**Rationale:** AI conversations can be complex. The interface should reduce cognitive load, not add to it.

### 2. Progressive Disclosure
**Statement:** Show what's needed when it's needed. Reveal complexity gradually through intentional user actions.

**Examples:**
- ✅ Basic chat interface visible immediately
- ✅ Advanced model parameters in settings screen
- ✅ Tool usage shown inline but collapsible
- ❌ All options visible on primary screens
- ❌ Configuration surfaces without context

**Rationale:** New users should feel welcomed; experienced users should find power when needed.

### 3. Conversation Continuity
**Statement:** Conversations are the primary unit of interaction. Navigation and state management should preserve conversational flow.

**Examples:**
- ✅ Quick access to recent conversations
- ✅ Seamless return to last active conversation
- ✅ Clear indication of active vs. inactive conversations
- ❌ Losing context when switching screens
- ❌ Ambiguous navigation state

**Rationale:** Users invest time in conversations; preserving that investment builds trust.

### 4. Honest Feedback
**Statement:** System states should be communicated clearly and honestly without false promises or hidden delays.

**Examples:**
- ✅ Visible streaming indicators with progress
- ✅ Clear error messages with actionable guidance
- ✅ Accurate estimated completion times
- ❌ Silent failures without indication
- ❌ Vague loading states ("Processing...")

**Rationale:** AI operations can take time; transparency builds confidence in the system.

### 5. Platform Respect
**Statement:** Honor platform conventions while maintaining Omnia's identity. Use native patterns where they serve users well.

**Examples:**
- ✅ iOS swipe gestures for navigation
- ✅ Android back button behavior
- ✅ Platform-native file pickers
- ❌ Forcing web patterns on mobile
- ❌ Ignoring accessibility standards

**Rationale:** Users expect platform familiarity; respecting it reduces friction.

---

## Anti-Patterns (What to Avoid)

### 1. Visual Noise
Avoid:
- Decorative gradients or shadows without purpose
- Multiple competing accent colors
- Animated elements that don't serve function
- Excessive iconography replacing text

**Instead:** Use color and motion purposefully to guide attention.

### 2. Hidden Actions
Avoid:
- Critical actions buried in menus
- Required steps not visible in primary flows
- Configuration options without discoverability paths

**Instead:** Make important actions accessible within 2 taps.

### 3. Inconsistent Patterns
Avoid:
- Different spacing for similar elements
- Varying button styles across screens
- Inconsistent typography hierarchy

**Instead:** Use design tokens consistently; reference component library.

### 4. Premature Optimization
Avoid:
- Complex animations before core functionality works
- Performance tweaks that sacrifice clarity
- Feature additions without user need validation

**Instead:** Prioritize functional completeness over polish.

---

## Decision Framework

When making UI decisions, ask:

1. **Does this serve the user's primary goal?** (chatting with AI)
2. **Is this discoverable without instruction?** (intuitive interaction)
3. **Does this maintain calm clarity?** (visual hierarchy)
4. **Is this consistent with established patterns?** (predictability)
5. **Will this remain maintainable?** (component reuse, tokens)

If any answer is "no," reconsider the approach.

---

## Principle Ownership

These principles are owned by the design system team and may be updated through ADR process. All contributors should reference these principles when:

- Creating new components
- Modifying existing UI
- Resolving design conflicts
- Reviewing pull requests

---

*Principles established June 2025. Reviewed against llama.cpp UX patterns and ChatGPT Mobile reference.*
