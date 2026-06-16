# ADR-009: Mobile Navigation Strategy

## Status
Accepted

## Context
Omnia needs a navigation strategy that supports conversation-first mental model while providing access to settings and provider configuration. We need to decide on the navigation pattern that best serves mobile users.

## Decision
We will implement drawer-based primary navigation using React Navigation Drawer, with stack navigation within screens and modal sheets for temporary overlays. Expo Router will handle file-based routing for screen definitions.

## Consequences

### Positive
- Conversation list always accessible via drawer
- Clear hierarchy: conversations → settings → providers
- Platform-native gesture support (swipe to open/close)
- Flexible overlay patterns for model selection, quick settings
- State preservation during navigation transitions

### Negative
- Drawer consumes screen real estate when open
- Learning curve for users unfamiliar with drawer pattern
- Complex state management for active conversation tracking
- Platform-specific behavior differences require testing

## Alternatives Considered

### Tab Navigation (Bottom Tabs)
**Rejected because:**
- Limits number of primary navigation destinations (3-5 ideal)
- Doesn't scale well as we add more sections
- Conversation list doesn't fit tab paradigm naturally
- Less flexible for future expansion

### Stack-Only Navigation
**Rejected because:**
- No quick access to conversations from any screen
- Deep navigation stacks confusing for users
- Back button behavior inconsistent across contexts
- Doesn't support conversation-first mental model

### Sidebar Navigation (Desktop Pattern)
**Rejected because:**
- Not idiomatic for mobile platforms
- Consumes too much screen space on small devices
- Gesture patterns differ from platform conventions
- Better suited for tablet/desktop experiences

## Implementation Notes

1. **Drawer Configuration**
   - Use React Navigation Drawer with custom content component
   - Implement swipe gesture support (left edge open, right close)
   - Include conversation list as primary drawer section
   - Add provider and settings sections below conversations

2. **State Management**
   - Track active conversation ID in app state
   - Persist last active conversation for session restoration
   - Update drawer selection state on navigation
   - Clear active state appropriately on screen changes

3. **Platform Behavior**
   - iOS: Swipe from left edge opens drawer; haptic feedback on actions
   - Android: System back button closes drawer/modal first, then navigates
   - Both: Consistent visual presentation and animation timing

4. **Accessibility**
   - Drawer open/close announced to screen readers
   - Focus management during drawer presentation
   - Keyboard navigation support for testing
   - ARIA labels on all interactive elements

## References
- Phase 02 requirements: `docs/phases/phase-02-design-foundation.md`
- Mobile navigation design: `docs/design/mobile-navigation.md`
- React Navigation docs: https://reactnavigation.io/
- Expo Router docs: https://docs.expo.dev/router/

---

*Decision made June 2025 by navigation team.*
