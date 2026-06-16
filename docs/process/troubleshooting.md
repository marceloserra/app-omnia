# Troubleshooting & Agent Fix Log

## Purpose
This document serves as a centralized knowledge base for critical errors encountered during development and the exact solutions applied to fix them. **All agents must log significant fixes here after resolving them** to ensure collective memory and prevent regressions.

> [!IMPORTANT]
> After any fix: log the issue, root cause, and exact solution steps in this file. Commit together with the fix.

---

## Logged Issues

### Issue 1: Expo Router Drawer Navigation Crash
- **Date:** 2026-06-16
- **Phase/Context:** Phase 01/02 (Mobile Foundation & Navigation)
- **Status:** ✅ RESOLVED
- **Error/Symptom:**
  ```text
  ERROR  [TypeError: undefined is not a function]
  WARN  Route "./_layout.tsx" is missing the required default export. Ensure a React component is exported as default.
  ```
- **Root Cause:** The `pnpm-lock.yaml` at the monorepo root had stale entries pinning `react-native-gesture-handler@3.0.1` and `expo-router@5.1.11`, which are incompatible with Expo SDK 56. `expo-router/drawer` uses Gesture Handler internals that changed between versions 2.x and 3.x. When the incompatible version loads, it throws `TypeError: undefined is not a function` before the module can export the React component, causing Expo Router to report the misleading "missing default export" warning.
- **Why it was hard to find:** `pnpm install` respects the lockfile by default and skipped re-resolution even after `package.json` was updated. `expo install --fix` was looping endlessly because the lockfile kept re-winning against the fixes.
- **Solution (confirmed, both platforms bundle clean):**
  1. Pin exact SDK 56 compatible versions directly in `apps/mobile/package.json`:
     - `expo`: `~56.0.12`
     - `expo-router`: `~56.2.11`
     - `expo-font`: `~56.0.7`
     - `react-native-gesture-handler`: `~2.31.1`
     - `react-native-reanimated`: `4.3.1`
     - `react-native-safe-area-context`: `~5.7.0`
     - `@types/jest`: `29.5.14`
  2. Force the lockfile to update: `pnpm update --filter mobile <packages...>`
  3. Add `import "react-native-gesture-handler";` as the **very first line** of `apps/mobile/app/_layout.tsx`.
  4. Add `"react-native-reanimated/plugin"` to the `plugins` array in `babel.config.js`.
  5. Clear Metro cache on next dev server start: `expo start -c`.
- **Validated by:** `expo export --platform android` and `expo export --platform ios` both succeed with no errors.
