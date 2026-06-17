# ADR 0016: Premium Mobile UI Patterns (Bottom Sheets and Confirm Dialogs)

## Status
Accepted

## Context
Phase 8 introduced conversation management actions (Pin, Rename, Delete, Clear All). Early implementations used native OS popups (`Alert.alert`) and fixed-position context menus. However, these patterns break immersion and violate the "FAANG-grade premium UI" standard set for Omnia. Native alerts look jarring against the custom dark mode theme, and fixed floating menus often misalign on different screen sizes.

## Decision
We established custom, pure React Native UI patterns for critical interactions:

1. **Context Menus → Bottom Sheets:**
   Instead of using absolute positioned floating menus for list item actions (e.g., long-pressing a chat), we use an animated Bottom Sheet (`Animated.spring` moving from the bottom edge). This provides a larger touch target, feels native to modern mobile paradigms, and avoids edge-cutoff issues.

2. **Native Alerts → Custom `ConfirmDialog`:**
   Destructive actions (Delete Chat, Clear All History) now use a custom `<ConfirmDialog>` component instead of `Alert.alert`.
   - Uses the app's established design tokens (glassmorphism, `SURFACE_2` backgrounds, custom typography).
   - Includes haptic feedback mapped directly to custom buttons.
   - Preserves dark mode immersion.

## Consequences
- **Positive:** The app feels significantly more premium and cohesive. Users are not snapped out of the experience by system dialogs.
- **Negative:** We must maintain these custom overlay components. Managing multiple custom Modals on Android can sometimes cause Z-index or focus issues, requiring careful `transparent`, `statusBarTranslucent`, and `onRequestClose` handling.
