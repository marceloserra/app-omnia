# Phase 08 - Conversation Management

## Goal
Give users full, native-feeling control over their conversation history.

## What Was Built
- **Bottom Sheet Context Menus:** Long-pressing a conversation in the Sidebar opens a smooth, animated bottom sheet.
- **Rename & Pin:** Users can inline-rename conversations and pin their favorites to the top of the Sidebar.
- **Delete Single Chat:** Deleting a chat uses a beautifully styled, custom `<ConfirmDialog>` instead of jarring native OS alerts.
- **Clear All History:** Added a "Danger Zone" in settings to wipe SQLite history.
- **Search:** Added real-time text filtering for conversation titles in the Sidebar.
- **Date Grouping:** Conversations in the Sidebar are automatically grouped by date (`Today`, `Yesterday`, `Previous 7 Days`, `Older`) with formatted timestamps (e.g., `2h ago`).
- **Provider Status Dot:** A small, glowing green dot (or red if disconnected) appears next to the provider label in the Sidebar footer, giving the user an instant, at-a-glance connection status.
- **Fluid Sidebar Drawer:** Upgraded the drawer from a basic slide to a FAANG-grade materializing panel. It now features rounded corners, a subtle 3D scale-in animation (`0.98` to `1.0`), and a physical `PanResponder` allowing users to swipe it closed interactively.
- **Hamburger Menu wired:** `onPress` handlers for the hamburger `<Pressable>` were restored in both `index.tsx` and `chat/[conversationId].tsx` after being lost during a previous refactor.
- **Empty State Overlay fix:** Refactored the initial screen's "What can I help with?" overlay from a `ListEmptyComponent` inside the inverted `FlatList` (which caused it to appear upside-down on Android due to `scaleY:-1` propagation) to an absolute overlay scoped inside a `flex:1` wrapper — keeping it completely outside the FlatList's transform tree.
- **Typing Indicator (Bouncing Dots):** Added a staggered bounce animation (`TypingIndicator.tsx`) using native drivers to give an immersive, fluid "is typing" feedback inside the chat bubble while waiting for the LLM stream to start.
- **Provider Global Switch:** Overhauled the Settings screen to allow explicitly setting the Global AI Provider, along with a safe "Disconnect" action for Local Network servers.
- **FAB Anchoring:** Fixed the "Scroll to Bottom" FAB overlap issue by anchoring it strictly to the message list container, preventing overlap with expanding text inputs.
- **Markdown Tables:** Added support for rendering tables in markdown within message bubbles.
- **Home to Chat Transition:** Eliminated the white flash by pre-saving the user message in SQLite before transitioning, combining it with `animation: "none"` for a seamless entry into the chat stream.

## Key Decisions
- **ADR-0016 (Premium Mobile UI Patterns):** We rejected swipe-to-delete (PanResponder) to avoid conflicts with Drawer gestures, opting for a FAANG-grade long-press Bottom Sheet instead. We also explicitly rejected standard OS `Alert.alert` dialogs in favor of custom-styled React Native Modals (`ConfirmDialog`) to maintain dark mode immersion.
- **ADR-0018 (Provider Global Switch):** Replaced silent provider activation on save with explicit "Set Active" and "Disconnect" actions in Settings, resolving ambiguity when multiple providers (Local & OpenAI) are configured.
