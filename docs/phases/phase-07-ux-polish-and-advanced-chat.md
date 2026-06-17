# Phase 07 - UX Polish & Advanced Chat

## Goal
Elevate the UI to FAANG-grade standards and ensure robust message handling.

## What Was Built
- **Markdown & Code Highlighting:** Integrated `react-native-markdown-display`. Created a custom `<CodeBlock>` component allowing users to copy code snippets.
- **Drawer Navigation:** Implemented `expo-router/drawer`. The Hamburger menu reveals conversation history, while the Home icon starts a new chat.
- **Stop Generating:** Added a prominent square button to abort the streaming generator, correctly saving partial responses to SQLite.
- **Android Keyboard Avoidance:** Fixed Android's jumpy keyboard layout by switching to the "inverted FlatList" architecture (`inverted={true}`) combined with `maintainVisibleContentPosition={{ minIndexForVisible: 0 }}`. This eliminated manual padding calculations and scroll jumping.
- **Styling Architecture:** Completely stripped out `NativeWind` and `Tailwind`. Converted the entire application to use strict, pure `StyleSheet.create` for maximum performance and predictability.

## Key Decisions
- **ADR-0015 (Inverted FlatList):** We chose inverted FlatLists over manual `onContentSizeChange` listeners to achieve butter-smooth keyboard transitions and eliminate gap artifacts on Android.
