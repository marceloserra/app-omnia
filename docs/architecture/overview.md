# Omnia Architecture Overview

## Structural Paradigm

Omnia strictly eschews the rigid "Atomic Design" (Atoms, Molecules, Organisms) pattern, favoring a **Feature-Sliced Design (FSD) + Colocation** approach across a Monorepo boundary. 

This ensures that developers can scale the app infinitely without getting lost in deeply nested, globally shared component trees that suffer from premature abstraction and prop-drilling.

### 1. The Monorepo Boundary
Business logic is decoupled from the UI framework (React Native) via `pnpm` workspaces:
- `@omnia/shared-types`: The single source of truth for domain interfaces (Messages, Conversations).
- `@omnia/storage`: Pure TypeScript repository pattern over SQLite. Completely unaware of React or Expo.
- `@omnia/providers`: Pure TypeScript adapters for AI APIs (OpenAI, Anthropic, Ollama).

*Rule: The mobile app imports logic from these packages, but these packages never import from the mobile app.*

### 2. Feature Colocation
In `apps/mobile/app`, we follow the "colocation" principle popularized by Next.js and the React Core Team:
- **`components/ui/`**: Strict, dumb, purely visual primitive components (e.g., `ConfirmDialog`, `Input`). These take props and return UI. They hold no business logic.
- **`components/chat/`**: Domain-aware composed components (e.g., `ChatInput`, `ModelPickerSheet`). These are tightly coupled to the Chat feature, injecting stores and reading theme contexts directly. They live next to the screens that use them.

## Testing Strategy (The "Testing Trophy")

Mobile UI testing is historically fragile, slow, and prone to false negatives due to the React Native bridge and native view hierarchies. For Omnia, we adopt the "Testing Trophy" methodology:

1. **Static Typing (100% Coverage):** TypeScript is our first line of defense. The build fails if the types between the DB, the Providers, and the UI mismatch.
2. **Business Logic Unit Tests (Critical Path):** The highest ROI for tests in Omnia lies in `@omnia/storage` (testing SQLite transaction integrity) and `@omnia/providers` (testing LLM chunk parsing). *These are slated for the post-MVP hardening phase.*
3. **UI Component Tests (Low ROI for Composed Views):** We do not write Jest snapshot tests for domain components (`ChatInput`, `ModelPickerSheet`), as UI requirements change rapidly. 
4. **End-to-End (E2E) Tests:** We will rely on tools like Maestro or Detox for holistic critical path testing (e.g., "User opens app, selects model, types message, and receives response") rather than isolating components.

## Storybook Strategy

Omnia uses Storybook strictly as a **Primitive Design System Catalog**, not as an exhaustive component viewer.
- **Allowed:** `Input`, `ConfirmDialog`, `MessageBubble` (pure visual components).
- **Disallowed:** `ChatInput` (has keyboard logic and stores), `ModelPickerSheet` (requires gesture handlers and complex state).

Attempting to mount complex, stateful domain components in Storybook requires writing massive mocks for SQLite, Zustand, and Expo Router, which creates a parallel universe of code that is harder to maintain than the app itself.
