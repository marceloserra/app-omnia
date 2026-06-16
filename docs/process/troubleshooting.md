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
  ERROR  [TypeError: Cannot read property 'ErrorBoundary' of undefined]
  WARN  Route "./_layout.tsx" is missing the required default export.
  ```
- **True Root Cause (found via `diagnose` skill):** `@expo/metro-runtime` was hoisted to root `node_modules` at version `5.0.5` (the pre-SDK 56 series). `expo-router 56.2.11` requires `^56.0.15`. The old runtime bootstraps a completely different module registry that doesn't populate `ErrorBoundary`, causing the entire layout module to crash on evaluation. Expo Router then reports the misleading "missing default export" warning because the file never finishes evaluating.
  - **Why `expo install --fix` looped forever:** It updated `expo`, `expo-router`, and gesture-handler correctly, but never updated `@expo/metro-runtime` because it's an indirect/peer dependency — not listed in `package.json` directly.
  - **Why it looked like a gesture handler issue first:** The `TypeError: undefined is not a function` is the same error surface for both a Gesture Handler API break (3.x vs 2.x) and a Metro runtime mismatch. Fixing gesture handler did nothing because the runtime was still broken.
- **Solution (confirmed ✅ — both platforms export clean):**
  1. Pin exact SDK 56 versions directly in `apps/mobile/package.json` (see below).
  2. Run `pnpm update --filter mobile <packages>` to force lockfile re-resolution (do NOT use `pnpm install` alone — it respects stale lockfile).
  3. **Explicitly add** `@expo/metro-runtime@^56.0.15` as a direct dependency via `pnpm --filter mobile add @expo/metro-runtime@^56.0.15`.
  4. Add `import "react-native-gesture-handler";` as the **very first line** of `_layout.tsx`.
  5. Add `"react-native-reanimated/plugin"` to `plugins` in `babel.config.js`.
  6. Clear Metro cache: `expo start -c`.
- **Required `package.json` versions for SDK 56:**
  ```json
  "expo": "~56.0.12",
  "expo-router": "~56.2.11",
  "expo-font": "~56.0.7",
  "@expo/metro-runtime": "^56.0.15",
  "react-native-gesture-handler": "~2.31.1",
  "react-native-reanimated": "4.3.1",
  "react-native-safe-area-context": "~5.7.0",
  "@types/jest": "29.5.14"
  ```
- **Validated by:** `expo export --platform android` → 4.1MB bundle ✅, `expo export --platform ios` → 3.9MB bundle ✅
