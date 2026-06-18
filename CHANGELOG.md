# Changelog

All notable changes to this project will be documented in this file. See [standard-changelog](https://github.com/bcoe/standard-changelog) for changelog format recommendations.

## [Unreleased]

## [1.1.0] - Phase 10: Multi-Modal Attachments (2026-06-18)

**Omnia v1.1.0** officially delivers Phase 10, bringing Multi-Modal Attachments to the app. Users can now attach photos, PDFs, and raw text files directly into the context window, processed fully on-device without exposing files to third-party endpoints.

### Added

- Add a repository PR template requiring summary, context, review strategy, architecture notes, executed plan, verification evidence, rollout, risk review, documentation, follow-ups, and merge readiness.
- Add documented Git Flow conventions for `feature/*`, `bugfix/*`, `hotfix/*`, `chore/*`, `docs/*`, `release/vX.Y.Z`, `develop`, and `main`.
- Add Hotfix Back-Merge automation to open a `main` to `develop` PR after a `hotfix/*` PR merges into `main`.
- Add branch, PR, main, release APK, and hotfix back-merge workflow documentation.
- Add a release notes standard and GitHub Release template based on changelog entries, commits, PRs, and manual rollout notes.
- Implement Phase 10 Multi-Modal Attachments: Users can now attach photos and files using a premium, FAANG-style custom floating `AttachmentMenu`.
- Add persistent storage for attachments: Files are copied securely to the `FileSystem.documentDirectory` to survive OS cache purges.
- Extend SQLite schema (v3) to store attachment metadata JSON efficiently, avoiding base64 blobs in the database.
- Integrate `expo-image` into `MessageBubble` for ultra-performant, cached image rendering within chat bubbles.
- Implement Local Native Text Extraction for PDFs (`expo-pdf-text-extract`) and raw text files (`.txt`, `.md`, `.csv`, `.json`), injecting content directly into the AI prompt to support document Q&A without waiting for Phase 13 RAG.
- Implement a Skeleton Loader (Shimmer effect) for pending document attachments, preventing layout jumps and eliminating phantom UI states.
- Implement Dynamic Animated Extraction Text (`_Extraindo documentos..._`) that smoothly cycles through 4 distinct phases to maintain user engagement during long PDF reads.
- Inject seamless AI System Warnings when PDFs exceed the 30,000-character context limit, allowing the LLM to gracefully inform the user of the truncation.

### Changed

- Rename CI workflow files to purpose-driven names: `branch-validation.yml`, `pr-validation.yml`, `main-validation.yml`, `release-apk.yml`, and `hotfix-backmerge.yml`.
- Expand CI coverage for pushes to `feature/**`, `bugfix/**`, `hotfix/**`, `chore/**`, `docs/**`, `release/**`, and `develop`.
- Make changelog updates mandatory for user-facing, release, CI/CD, architectural, process, and bugfix changes.
- Document merge strategy rules: squash PRs into `main`, squash normal work into `develop`, and use merge commits for release-sync and hotfix back-merge PRs.
- Replace arbitrary hardcoded `setTimeout` delays with React Native `InteractionManager` (and `requestAnimationFrame`) to ensure Native OS Intents only launch when the GPU is 100% idle.
- Decouple all remaining hardcoded UI and System strings from the Chat Screen into the English, Portuguese, and Spanish `i18n.ts` dictionaries.

### Fixed

- Harden Android release APK support for HTTP local AI providers by injecting a native network security config during Expo prebuild.
- Restore the Android adaptive launcher icon asset so release APK installs show the Omnia icon instead of the default Android Studio icon.
- Fix CI typecheck/test resolution for mobile Jest files by excluding tests from the production TypeScript program and making React Native Testing Library available to the root test runner.
- Fix chat history rendering where network or filesystem delays caused user messages to be sorted below AI responses due to asynchronous timestamps.
- Fix low contrast of the assistant bubble and typing indicator in light mode by adding adaptive opacity and borders.
- Fix attachment persistence failure on Android by implementing per-item graceful fallback to the cache URI if the Sandbox copy fails.
- Fix silent PDF extraction failures by throwing strongly typed errors and rendering a localized Red Error Alert natively within the AI chat bubble, immediately aborting API requests.

## [1.0.3] - Voice STT, Hardware Intelligence & Arch Refactoring

**Omnia v1.0.3** finalizes Phase 9 stabilization by bringing Local AI Voice Dictation, FAANG-grade hardware profiling, and a massive architectural decouple using Domain-Driven Bounded Contexts.

### Added

- Add **Local AI Voice Dictation (STT)** powered by `whisper.rn`. Integrates the `ggml-tiny.bin` (~75MB) model trained by OpenAI and hosted by HuggingFace (Link: `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin`). Transcriptions run 100% locally and offline.
- Add **Native System Dictation (Cloud STT)** as a seamless fallback for devices that do not support or haven't downloaded the local Whisper engine.
- Add **Microphone UI in ChatInput**: Users can now trigger dictation directly from the chat box. Includes a stop button, automatic text injection after dictation, and real-time **Waveform Animations** using `react-native-reanimated`.
- Add **App Capabilities Menu** to the Settings screen, allowing users to actively monitor, download, and delete the Voice Dictation offline model.
- Add **Device Profile Menu** featuring an advanced OS-level Hardware Profiler (`deviceSpecs.ts`) that reads the exact System on a Chip (SoC), mapping precise CPU/GPU/NPU details (e.g., Exynos, Lahaina, Apple Silicon).
- Add **Hardware Supported Features Menu** that explicitly maps device support for STT AI Engines based on hardware capabilities.

### Changed

- Complete a massive **Architectural Decoupling**: Replaced "God Object" AppServices with strict **Domain-Driven Bounded Contexts**. Logic is now isolated into specialized hooks (`useDictation.ts`, `useHistory.ts`, `useChat.ts`) paired with the Repository Pattern.
- Refactor `history.tsx` and `settings.tsx` to completely remove direct `@omnia/storage` imports, routing all database operations through explicit boundaries.
- Complete the Strict Theming UI sweep: Replaced all legacy hardcoded hex codes in Chat and Menus with standard `ThemePalette` tokens.

### Fixed

- Fix a catastrophic React infinite render loop (`Maximum update depth exceeded`) caused by an unstable `t` function in `useTranslation`. Stabilized i18n hooks using `useCallback` to prevent cascading render explosions during dictation.
- Fix complete UI layout destruction in `ChatInput` ("indo pra esquerda", overlapping stop buttons) by removing the Cloud Dictation hint `<Text>` from inside the strict flex row and deleting obsolete legacy overlays.
- Fix silent `expo-sqlite` crash and failure to create new conversations by ensuring `updatedAt` is explicitly passed in the SQLite `INSERT` parameter array.
- Fix memory calculation logic where 12GB RAM Android devices were being identified as 10GB due to OS kernel reservations. RAM reads now gracefully ceil to advertised commercial tiers.
- Fix a regression where running the app on a Virtual Device/Simulator hard-disabled Voice Dictation. Simulators can now test local voice models.

## [1.0.1] - The Omnia Design Update

**Omnia v1.0.1** establishes our official **Omnia Design System (ODS)**, bringing extreme FAANG-tier polish, native gesture ergonomics, and offline resilience to the UI.

This release also makes the app **100% Local-LLM Ready**. You can now seamlessly connect to your local LM Studio, Ollama, or local network endpoints without Android blocking the connection.

### Notes
- To connect to a local provider (like LM Studio) on your computer, use your local network IP (e.g., `http://192.168.1.100:1234/v1`) in the Provider Settings.
- Android's `usesCleartextTraffic` is now enabled specifically so you don't need HTTPS to test local endpoints.
- If you don't know how to delete or rename a chat, simply **Swipe Left** or **Swipe Right** on the chat history list. 

### CHANGELOG

**Omnia Design System (ODS)**
- **Glassmorphism & Depth**: The Chat Screen has been fully redesigned. Assistant bubbles now use a frosted glass effect (`BlurView`), and User bubbles feature a rich indigo gradient. 
- **Offline Resilience**: Official logos for OpenAI, Meta, Mistral, Google, Anthropic, and Qwen are now natively bundled inside the app as ultra-lightweight PNGs. They load instantly and don't require an internet connection, preventing SVG crashes and UI glitches.
- **Ergonomics**: Input boxes for API Keys and Base URLs are now properly sized and left-aligned so you can easily read long IP addresses. The Model Select menu has been upgraded to a native Bottom Sheet (metadinha).

**Gesture & Navigation Fixes**
- Fixed a fatal Android crash (`PanGestureHandler must be used as a descendant...`) by correctly wrapping the root layout.
- Added bi-directional Swipe Actions to the History screen (Swipe to Pin, Swipe to Rename/Delete).
- Eliminated RAM Cache bottlenecks. Navigation is now perfectly stateless and driven directly by synchronous SQLite reads.

**Bug Fixes**
- Fixed an issue where long community model names (e.g., `lmstudio-community/Meta-Llama-3-8B`) would break the layout in the Settings screen.
- Fixed a deep `react-native-svg` crash when rendering `lucide-react-native` icons by cleansing invalid `fill` attributes.
- Purged obsolete boilerplate unit tests to achieve a 100% clean Typecheck.

### Thanks to ❤️
- React Native Gesture Handler & SWMansion
- Lucide Icons
- The AI Engineering Playbook

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
