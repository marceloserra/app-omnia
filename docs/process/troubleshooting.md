# Troubleshooting & Agent Fix Log

## Purpose
This document serves as a centralized knowledge base for critical errors encountered during development and the exact solutions applied to fix them. **All agents must log significant fixes here after resolving them** to ensure collective memory and prevent regressions.

---

## Logged Issues

### Issue 1: Expo Router Drawer Navigation Crash
- **Date:** 2026-06-16
- **Phase/Context:** Phase 01/02 (Mobile Foundation & Navigation)
- **Error/Symptom:** 
  ```text
  ERROR  [TypeError: undefined is not a function]
  WARN  Route "./_layout.tsx" is missing the required default export. Ensure a React component is exported as default.
  ```
- **Root Cause:** `expo-router/drawer` evaluates its dependencies (`react-native-reanimated` and `react-native-gesture-handler`) at startup. If these dependencies are not properly linked or initialized, the entire `_layout.tsx` file crashes during evaluation. Because the file fails to evaluate, Expo Router cannot detect the `export default`, leading to the misleading "missing required default export" warning.
- **Solution:** 
  1. Added `import "react-native-gesture-handler";` as the absolute first line in `_layout.tsx`.
  2. Ensured `react-native-reanimated/plugin` was present in `babel.config.js`.
  3. Ran `npx expo install --fix` to downgrade mismatched package versions to SDK 56 compatible versions.
  4. **Active Debugging:** Temporarily replaced `<Drawer />` with `<Slot />` to isolate if `expo-router/drawer` was the sole cause of the crash.
