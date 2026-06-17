# ADR 0015: Inverted FlatList for Keyboard Avoidance

## Status
Accepted

## Context
In a mobile chat application, the message list must naturally push upwards when the software keyboard appears. The common React Native approach of using `KeyboardAvoidingView` combined with dynamic layout measurements (`onLayout` or `onContentSizeChange` triggering `scrollToEnd`) introduces visual artifacts. Specifically, on Android, measuring layout changes during the keyboard animation leads to the `FlatList` scrolling to the bottom *before* the container has fully expanded. This leaves a gap at the bottom of the list when the keyboard hides.

## Decision
We decided to adopt the "inverted FlatList" architecture (`inverted={true}` or scaling via `transform: [{ scaleY: -1 }]`).
- The `messages` array is reversed before rendering: `[...messages].reverse()`.
- The `FlatList` is rendered inverted, placing the origin (`offset: 0`) visually at the bottom of the screen.
- When the container height shrinks or expands due to keyboard animations, items anchored to the bottom naturally stay pinned without requiring any manual scroll events or JS-based delay calculations.

## Consequences
- **Positive:** Butter-smooth keyboard transitions on Android and iOS. No layout bouncing or artificial gaps when opening/closing the keyboard.
- **Negative:** Cognitive overhead. Engineers must remember that `offset: 0` is the bottom of the chat, and the `messages` array must be reversed before rendering. `ListEmptyComponent` also needs an explicit `scaleY: -1` inversion to appear right-side up.
