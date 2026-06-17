# Changelog

All notable changes to this project will be documented in this file. See [standard-changelog](https://github.com/bcoe/standard-changelog) for changelog format recommendations.

## [0.1.0-alpha] (2026-06-15)

### Features

- Initialize monorepo with pnpm workspaces and Turborepo
- Setup TypeScript configuration across packages
- Scaffold Expo SDK 56 mobile app with NativeWind v4.1 and Router
- Configure CI/CD pipeline with GitHub Actions

## [1.0.0] - Foundation Stable & UI Freeze (2026-06-17)

Omnia `v1.0.0` marks the official completion of the Architectural Foundation and UI/UX Phase (Phases 1-9). This release serves as the bedrock upon which all future AI capabilities (RAG, WebFetch, MCP, Voice) will be built. The primary goal of this milestone was to engineer a robust, crash-proof, and visually stunning mobile application that adheres strictly to FAANG engineering and design standards.

### 🏛 Architectural Decisions & Engineering Excellence

**Monorepo Structure (Turborepo & pnpm)**
To ensure long-term scalability and strict module boundaries, Omnia was built as a monorepo. This prevents tight coupling between the UI (`apps/mobile`) and the domain logic (`@omnia/providers`, `@omnia/storage`, `@omnia/logger`, `@omnia/shared-types`). Each package operates independently with its own TypeScript `tsconfig` and linting rules.

**Dropping NativeWind for Raw React Native Performance**
During development, `NativeWind` (Tailwind for React Native) caused severe layout crashes (e.g., flexbox `gap` compatibility on Android) and unpredictable Metro Bundler behavior on Expo SDK 56. We made the architectural decision to rewrite all UI primitives using raw `StyleSheet` and dynamic JS contexts (`useTheme`). This resulted in a **100% crash-free layout engine**, extreme rendering speed, and total control over animations.

**The Persistence Layer (Expo SQLite + Zustand)**
Relying on `AsyncStorage` for complex chat history is an anti-pattern that leads to memory bloat and slow boot times. We implemented a robust relational database using `expo-sqlite` (SDK 56).
- Migrations are handled explicitly.
- Data access is synchronous (`getAllSync`), eliminating Promise waterfalls on render.
- **Critical Fix:** We intercepted and neutralized a fatal `NullPointerException` inside Android's JNI bridge by strictly enforcing array-bound arguments for all SQL queries.

**Telemetry & AI-Driven Debugging**
We built `@omnia/logger`, an isolated telemetry system that hooks into the global `ErrorBoundary`. It traps unhandled JS exceptions and writes structured `.jsonl` stack traces directly to the filesystem. This guarantees that if the app crashes in production, the AI Engineering team has an exact breadcrumb trail without relying on third-party tracking like Sentry.

### 🎨 FAANG UI/UX & Theming System

**True Glassmorphism & Micro-Interactions**
The interface was crafted to feel premium. We heavily utilized `expo-blur` and `expo-linear-gradient` to create depth.
- **Dynamic Theming:** Seamless transition between Dark, Light, and System OS preferences without reloading the app.
- **Haptics:** Tactile feedback (`expo-haptics`) was integrated into critical actions (Provider selection, sending messages, stream completion) to make the app feel alive.
- **Sidebar Navigation:** Instead of relying on buggy third-party drawer libraries, we built a highly performant, gesture-driven `Modal` Sidebar from scratch. It features precise horizontal swipe detection, context menus (Pin, Rename, Delete), and a custom `isNavigating` lock to prevent multiple rapid clicks.

**Advanced Chat Experience**
- **Markdown & Code:** Integrated `react-native-markdown-display` with a robust `react-native-syntax-highlighter` (`Prism` / `vscDarkPlus` theme). The Metro resolver was manually patched to support legacy syntax styles, enabling perfect code block rendering.
- **Smart Scroll:** The chat features an inverted `FlatList` that automatically scrolls as the LLM streams tokens. It seamlessly handles keyboard appearances (`adjustResize`) and pauses scrolling if the user manually drags the chat up to read history.

### 🔌 Provider Agnosticism & Validation

Omnia is designed to be fully decentralized. The `@omnia/providers` package abstracts the AI engine.
- **Dual Support:** Natively supports both Remote APIs (OpenAI) and Local Network LLMs (LM Studio, Ollama) via an OpenAI-Compatible adapter.
- **Pre-flight Engine:** Before a provider is activated, a background validator tests the `Base URL`, validates the `API Key`, and dynamically fetches all available models, ensuring the user cannot save a broken configuration.

### 🐛 Major Bug Squashes

- **Android Keyboard Physics:** The keyboard `adjustResize` feature was breaking due to a conflict with `androidStatusBar.translucent: true`. We disabled translucency at the manifest level but dynamically matched the status bar color using `<StatusBar backgroundColor={theme.bg} />`, achieving both visual harmony and perfect keyboard physics.
- **White Flash Eliminated:** Navigating between chats previously caused a 1-frame white flash due to asynchronous SQLite loading. We refactored the `useState` initializer to fetch SQLite data synchronously on mount, achieving instantaneous, 120Hz-smooth screen transitions.
- **Horizontal Table Scroll:** Markdown tables were difficult to scroll horizontally. We injected `flexGrow: 1` and `minWidth: "100%"` into the scroll container, expanding the touch target to the entire screen width.

> **UI FREEZE ACTIVE:** With v1.0.0 Stable, the foundational UI is locked. The team will now pivot to Phase 10 (RAG) and Phase 11 (WebFetch).
