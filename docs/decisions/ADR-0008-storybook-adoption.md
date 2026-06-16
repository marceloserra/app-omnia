# ADR-0008: Storybook Adoption

## Status
Accepted

## Context
As we build our primitive and composed components from scratch, we need a robust way to visually validate components in isolation (Light Mode, Dark Mode, and interaction states) without needing to manually click through the actual app navigation tree.

## Decision
We adopt `@storybook/react-native` as the single source of truth for component visual validation. Every primitive and composed component must have an associated `.stories.tsx` file that maps out its variants.

## Consequences
- **Positive:** Accelerates the "Visual Validation Mode" feedback loop.
- **Positive:** Forces components to be cleanly decoupled from app-level state.
- **Negative:** Requires strict maintenance to keep Storybook configurations aligned with Expo Router and Metro bundler changes.
