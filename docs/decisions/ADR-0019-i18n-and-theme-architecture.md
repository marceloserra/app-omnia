# ADR 0019: i18n and Theme Architecture

## Status
Accepted

## Context
As the Omnia App moves towards completion of its UI/UX foundation, two critical global state dimensions are required:
1. **Localization (i18n):** Support for English (en), Portuguese (pt), and Spanish (es), syncing with the OS by default with English as a fallback.
2. **Theming:** Support for Light Mode alongside the existing Dark Mode, adhering strictly to the FAANG-grade premium aesthetics already established.

## Decision
1. **State Management:** We will introduce a new Zustand store `useSettingsStore` (`apps/mobile/store/settings-store.ts`) to persist `theme` (`"system" | "light" | "dark"`) and `language` (`"system" | "en" | "pt" | "es"`).
2. **Localization Implementation:** To keep the bundle size small and avoid complex compilation chains, we will implement a lightweight dictionary-based `t()` function hook in `lib/i18n.ts` rather than pulling in `react-i18next`.
3. **Theme Implementation:** All hardcoded hex colors (`#05050f`, `#6366f1`, etc.) will be extracted into a `lib/theme.ts` file that exports `DarkPalette` and `LightPalette`. A custom hook `useTheme()` will return the active palette based on the Zustand store and `useColorScheme()` from React Native.

## Consequences
- **Positive:** Components become purely reactive to theme and language changes. The app achieves global reach and accessibility standards.
- **Negative:** Heavy initial refactoring overhead. Every existing component (Sidebar, Settings, Chat, UI primitives) must be updated to replace static constants with `const theme = useTheme()` and `const t = useTranslation()`.
