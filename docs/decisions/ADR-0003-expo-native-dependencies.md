# ADR 0003: Expo Native Dependency Resolution in PNPM Workspaces

## Status
Accepted

## Context
The Omnia project uses a `pnpm` monorepo workspace for dependency management. In standard Expo projects, running `npx expo install` automatically registers and links required native peer dependencies. However, in a strict `pnpm` workspace environment, native dependencies required by libraries like `expo-router` or `@react-navigation/drawer` (such as `react-native-gesture-handler`, `react-native-reanimated`, `react-native-screens`, and `react-native-safe-area-context`) might not be auto-linked or hoisted correctly if they are missing from the specific workspace's `package.json`. This leads to crashes like `[TypeError: undefined is not a function]` because the underlying native modules cannot be evaluated.

## Decision
All Expo native dependencies must be explicitly installed into the `apps/mobile` workspace using the Expo CLI via `pnpm`, rather than relying on automatic hoisting or implicit peer resolution. 

When adding a new Expo or React Native UI library, engineers and agents must run:
`pnpm --filter ./apps/mobile exec expo install <packages>`

## Consequences
- **Positive:** Guarantees that Expo strictly aligns the exact version of the native dependencies with the currently installed Expo SDK version.
- **Positive:** Prevents silent evaluation errors and "missing default export" router exceptions due to unlinked native modules.
- **Negative:** Requires slightly more diligence when scaffolding new navigation structures or UI components to ensure all underlying dependencies are manually tracked in the `apps/mobile/package.json`.
