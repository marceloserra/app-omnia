# ADR-0014: Drawer Navigation Pattern (FAANG Chat UX)

## Status
Accepted — Phase 07

## Context
The original app architecture used a dedicated `index.tsx` as a conversation list screen with a Floating Action Button (FAB) to start new chats. This created an extra navigation step: user opens app → sees list → taps FAB → navigates to chat.

Both ChatGPT and Gemini mobile follow the industry-standard FAANG chat UX pattern:
- The **primary/home screen is always a fresh chat** ready to accept input.
- **Conversation history lives in a slide-in Drawer** (hamburger), not a standalone list screen.
- The drawer is accessible from **every screen** (home + existing conversations) via a consistent hamburger button in the top-left.

## Decision
Adopt the FAANG Drawer Navigation pattern:

1. **`index.tsx`** is now the primary **new chat screen** (combines what was `new-chat.tsx`).
   - Features a full-height FlatList for messages.
   - When user sends their first message, the conversation is created and navigation replaces to `chat/[conversationId]`.

2. **`new-chat.tsx` is deleted.** No longer needed as a separate route.

3. **Hamburger button (`AlignLeft` icon)** appears in the top-left of the custom header on both:
   - `index.tsx` (home)
   - `chat/[conversationId].tsx` (existing conversation)

4. The hamburger opens `Sidebar.tsx` — an `Animated.Value`-driven modal drawer that slides from the left, already implemented in Phase 07 with:
   - Spring animation on open, timing on close
   - Backdrop with `TouchableWithoutFeedback` to dismiss
   - Conversation list sorted by recency
   - "New chat" gradient button
   - Settings row in footer
   - `Haptics` feedback on all interactions

5. The `_layout.tsx` no longer defines a `new-chat` Stack.Screen.

## Header Anatomy (Both Screens)
```
[ ≡ Hamburger (40x40, round, pill border) ] [ Title (centered, flex:1) ] [ ⚙ Settings (40x40, round) ]
```
- All buttons are 40×40 round with a `SURFACE` background and subtle `BORDER`.
- Header background matches the app dark BG, no native shadow.
- Divider is `StyleSheet.hairlineWidth` below the header.

## Consequences
- **Positive:** Matches muscle memory from ChatGPT, Gemini, Claude apps — users land in a ready-to-use chat.
- **Positive:** Conversation history is always one swipe away, not a dedicated screen taking up app real estate.
- **Positive:** Eliminates the `index.tsx` conversation list and the `new-chat.tsx` route, reducing the navigation graph complexity.
- **Negative:** Users cannot see conversation history without opening the drawer (acceptable, mirrors FAANG standard).
- **Constraint:** The Sidebar must **never** use `@react-navigation/drawer` (blocked in SDK 56). Must remain the custom `Modal` + `Animated.Value` implementation.
