# Architectural Refactoring & Scaling Patterns

*Document created during Phase 9 (Release Management / Stabilization)*

As the Omnia codebase matures, we are encountering scaling bottlenecks associated with rapid prototyping. To ensure long-term maintainability and performance, the codebase will adhere to the following architectural design patterns.

## 1. Separation of Concerns (MVVM / Custom Hooks)
**Context:** Components like `chat/[conversationId].tsx` and `settings.tsx` grew into "God Components," handling UI layout, filesystem interactions, native bridging, and local state management simultaneously.
**Pattern:** We are shifting to an **MVVM (Model-View-ViewModel)** paradigm using React Custom Hooks.
**Implementation:**
- UI components (`.tsx`) must strictly contain JSX mapping, animated styles, and localized `ThemePalette` wiring.
- All complex business logic, asynchronous actions, and state machinery must be abstracted into dedicated hooks (e.g., `useChat.ts`, `useSettings.ts`, `useDictation.ts`).

## 2. Service Layer (Facade Pattern)
**Context:** React UI components were acting as orchestration "Maestros" between the network layer (Providers) and the persistent layer (SQLite). The `chat` view was manually iterating over the AI stream and saving each chunk directly via `msgRepo.updateContent()`.
**Pattern:** We introduce a **Service Layer** to act as a Facade.
**Implementation:**
- Components should only call methods like `chatService.sendMessage(payload)`.
- The `ChatService` encapsulates the orchestration: interacting with the LLM API (`ProviderStrategy`), parsing the streamed response, pushing updates to the Database (`Repository`), and triggering reactivity.

## 3. Strict Theming System (Dependency Injection)
**Context:** Development speed led to the introduction of hardcoded hexadecimal values (e.g., `"#1C1C1E"`, `"#3b82f6"`) injected via inline styles or ternary operators checking `isDark`. This bypasses the Omnia Design System.
**Pattern:** Strict adherence to the `useTheme()` **Dependency Injection Pattern**.
**Implementation:**
- No component is permitted to declare static hex codes.
- All colors must map to the `ThemePalette` (e.g., `theme.surface`, `theme.indigo`, `theme.red`).
- This guarantees uniform UI updates, respects systemic light/dark OS transitions, and facilitates future white-labeling or user-defined accent colors.
