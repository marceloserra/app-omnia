# Changelog

All notable changes to this project will be documented in this file. See [standard-changelog](https://github.com/bcoe/standard-changelog) for changelog format recommendations.

## [0.1.0-alpha] (2026-06-15)

### Features

- Initialize monorepo with pnpm workspaces and Turborepo
- Setup TypeScript configuration across packages
- Scaffold Expo SDK 56 mobile app with NativeWind v4.1 and Router
- Configure CI/CD pipeline with GitHub Actions

## [0.9.0] - Foundation RC (2026-06-17)

This release establishes the complete architectural, storage, and visual foundation of Omnia, ensuring stability for future AI capability modules (RAG, WebFetch, MCP).

### 🚀 Core Architecture & Monorepo
- **Monorepo Setup:** Initialized `pnpm` workspaces and Turborepo for strict package isolation.
- **CI/CD:** Configured GitHub Actions pipeline for linting, typechecking, tests, and automated APK generation.
- **Domain Models:** Scaffolded `@omnia/shared-types` with `Zod` schemas for core entities (Message, Conversation, Provider).
- **Telemetry System:** Built an isolated telemetry logger (`@omnia/logger`) hooked into global ErrorBoundary to trap and record low-level unhandled JS Exceptions without blocking the UI thread.

### 💾 Storage & State Management
- **Local Persistence:** Created `@omnia/storage` wrapping `expo-sqlite` (SDK 56 synchronous API) with explicit migrations.
- **Repositories:** Implemented `conversation-repo` and `message-repo` with robust `INSERT/UPDATE/DELETE` operations.
- **State Management:** Integrated `zustand` with `AsyncStorage` persistence for `provider-store` and `settings-store`.
- **Danger Zone:** Implemented "Delete All Data" wiping capability to reset the SQLite database on demand.

### 🔌 AI Providers Integration
- **Unified Providers:** Built `@omnia/providers` abstraction to handle LLM streaming and requests.
- **OpenAI & Local Network:** Added dual support for OpenAI remote APIs and OpenAI-Compatible local networks (LM Studio, Ollama).
- **Validation Engine:** Added pre-flight connection testing to validate API keys, Base URLs, and fetch available models before activation.

### 🎨 UI/UX & FAANG Aesthetic
- **Native Styling:** Completely rewrote UI primitives from `NativeWind` to raw React Native `StyleSheet` for extreme performance, Android compatibility, and removal of flexbox `gap` crashes.
- **Dynamic Theming:** Implemented pure Dark, Light, and System modes with a `ThemePalette` context, syncing seamlessly with OS preferences.
- **Glassmorphism:** Adopted a premium, multi-layered FAANG visual identity with `expo-blur`, translucent modals, and smooth gradient highlights.
- **Sidebar Drawer:** Created a highly performant custom Modal Sidebar featuring hardware back-button handler support, search filtering, and context menus for conversations.
- **Chat Experience:** Added a fluid Chat Input matching the ChatGPT pill aesthetic, intelligent automatic scroll-to-bottom physics, and Markdown/Codeblock syntax rendering.
- **Settings Dashboard:** Refactored into intuitive segmented controls, dynamic model selection chips, and inline active provider management (Set Active / Disconnect) with color-coded success/danger feedback.

### 🐛 Bug Fixes
- **Android Keyboard Physics:** Restored native Android `adjustResize` behavior by disabling `androidStatusBar.translucent` in `app.json` while maintaining visual harmony via dynamic `<StatusBar backgroundColor={theme.bg} />`.
- **JNI SQLite Crashes:** Obliterated fatal `NullPointerException` errors in Android's native `expo-sqlite` bridge by strictly wrapping all SQL bindings in typed arrays.
- **Navigation Lifecycle:** Fixed severe UX bugs where activating a provider or testing connections erroneously ejected the user from the Settings screen back to Home.
- **Layout Jumps:** Resolved FlatList jumping issues on Android during keyboard transitions.
