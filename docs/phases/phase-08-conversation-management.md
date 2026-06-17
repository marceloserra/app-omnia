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

## Key Decisions
- **ADR-0016 (Premium Mobile UI Patterns):** We rejected swipe-to-delete (PanResponder) to avoid conflicts with Drawer gestures, opting for a FAANG-grade long-press Bottom Sheet instead. We also explicitly rejected standard OS `Alert.alert` dialogs in favor of custom-styled React Native Modals (`ConfirmDialog`) to maintain dark mode immersion.
