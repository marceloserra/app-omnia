# ADR-0007: Design System Strategy

## Status
Accepted

## Context
Phase 02 requires building a clean, calm, and typography-driven UI foundation inspired by `llama.cpp` and ChatGPT Mobile. We needed to decide whether to leverage a heavy component library (like `react-native-paper`) or build primitive components from scratch using `NativeWind` and standard React Native elements.

## Decision
We will completely reject third-party pre-styled UI component libraries (including removing `react-native-paper` from the codebase) and instead build all primitive components (Buttons, Inputs, Cards, etc.) from scratch using React Native Core primitives styled with `NativeWind`.

## Consequences
- **Positive:** We have absolute control over the visual aesthetic (ensuring low-density, minimal chrome design).
- **Positive:** Reduces bundle size and prevents Material Design "baggage" from leaking into our iOS-first or native-first paradigms.
- **Negative:** Slower initial velocity as we must build and test primitives (like Sheets and Carousels) that would normally come out-of-the-box.
