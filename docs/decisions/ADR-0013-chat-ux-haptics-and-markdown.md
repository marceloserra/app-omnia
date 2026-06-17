# ADR-0013: Advanced Chat UX, Haptics & Markdown Rendering

## Status

Accepted

## Context

To achieve a "Principal FAANG" level user experience, Omnia's chat interface needs to surpass a simple text feed. It requires tactile feedback, rich text formatting for code, and precise scroll management during long streams.

## Decision

1. **Markdown Rendering**: Adopted `react-native-markdown-display` over raw `<Text>` components to parse standard AI outputs (code blocks, bold, lists). We injected custom CSS-in-JS style rules to match our Dark Indigo FAANG aesthetic.
2. **Micro-Interactions (Haptics)**: Adopted `expo-haptics`. We trigger `ImpactFeedbackStyle.Light` on send, `ImpactFeedbackStyle.Medium` on copy, and `NotificationFeedbackType.Success/Error` on stream completion.
3. **Smart Scroll Management**: We tied the `FlatList` auto-scroll mechanism to an `isScrolledUp` state flag. If the user scrolls up, auto-scrolling pauses, allowing them to read in peace while the AI streams.
4. **Stream Interruption**: We added a "Stop Generating" button that modifies an `AbortController` (or ref flag), immediately halting the generation loop to save tokens and time.

## Consequences

**Positive:**
- The mobile app feels premium, responsive, and "alive".
- Users can reliably copy code blocks and pause erroneous AI responses.
- The UI layer strictly follows our established Design Tokens.

**Negative:**
- The inclusion of native dependencies (`expo-haptics`, `react-native-markdown-display`) requires rebuilding the development client upon cloning.
