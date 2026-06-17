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
  5. **Crucial:** Wrap the `Drawer` or the entire return inside `_layout.tsx` with `<GestureHandlerRootView style={{ flex: 1 }}>`.
  6. Add `"react-native-reanimated/plugin"` to `plugins` in `babel.config.js`.
  7. Clear Metro cache: `expo start -c`.
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

### Issue 2: Storybook Story TypeScript Compilation & Jest Test Failures (RNTL v14)
- **Date:** 2026-06-16
- **Phase/Context:** Phase 02 (Design Foundation UI Components)
- **Status:** ✅ RESOLVED
- **Error/Symptom:**
  - `pnpm typecheck` failed on Storybook files because of invalid or obsolete prop signatures (e.g. `elevation` on `CardProps`, `spacing` on `DividerProps`, invalid variants, and string icon references).
  - Jest unit tests for `ChatBubble` failed with `TypeError: getByText is not a function`.
- **Root Cause:**
  - Storybook files were written with outdated/incorrect props that didn't match the final TypeScript types defined on UI components.
  - React Native Testing Library (RNTL) v14 supports React 19 concurrent features, where the `render` function returns a `Promise<RenderResult>`. Calling it synchronously resulted in destructuring from a Promise, making `getByText` undefined.
- **Solution:**
  - Updated all Storybook files to match the correct types (e.g. removed `elevation` from `Card` story, replaced string icon names with imported Lucide icon components in `IconButton` story, split string `error` prop into boolean `error` + `errorMessage` in `Input` story).
  - Added `async/await` to all test `render(...)` calls in `apps/mobile/__tests__/ChatBubble.test.tsx` (matching `Button.test.tsx`).
- **Validated by:** `pnpm typecheck` → 0 errors ✅, `pnpm test` → 10/10 tests passed ✅

### Issue 3: Reanimated Version Mismatch Crash in Expo Go
- **Date:** 2026-06-16
- **Phase/Context:** Phase 02 (Design Foundation Runtime integration)
- **Status:** ✅ RESOLVED
- **Error/Symptom:**
  ```text
  ERROR  [Error: Exception in HostFunction: TurboModule method "installTurboModule" called with 1 arguments (expected argument count: 0).]
  ```
- **Root Cause:**
  - The Expo Go client for Expo SDK 56 includes native binaries for `react-native-reanimated` compiled at version `4.3.1` (Reanimated 4).
  - Reanimated 4's native `installTurboModule` expects 0 arguments.
  - Downgrading the JavaScript package to `~3.16.7` (Reanimated 3) causes the JS layer to call the function with 1 argument, triggering a fatal C++ host function mismatch.
- **Solution:**
  - Restored `react-native-reanimated` back to `4.3.1` in `apps/mobile/package.json`.
  - Ran `pnpm install --frozen-lockfile` to synchronize the JavaScript and native versions.
- **Validated by:** Dev server runs successfully, and bundle exports for iOS/Android compile without errors.

### Issue 4: Blank Screen After Fixing Navigation Crashes
- **Date:** 2026-06-16
- **Phase/Context:** Phase 01/02
- **Status:** ✅ RESOLVED (Expected Behavior)
- **Symptom:** App successfully builds and opens but shows only a blank white screen with no components.
- **Root Cause:** The `_layout.tsx` was stripped down to a bare minimum layout (e.g. rendering `<Slot />` or empty views) during the isolation of the Expo Router and Reanimated crashes. The UI hasn't been implemented yet in Phase 2.
- **Solution:** This is expected. The next steps in Phase 2 will introduce the Design System, Theme Provider, and proper UI components to populate the screens.

### Issue 5: Expo Router Drawer + Reanimated 4 Runtime Crash in Expo Go
- **Date:** 2026-06-16
- **Phase/Context:** Phase 01/02
- **Status:** ✅ RESOLVED (Architectural Workaround)
- **Error/Symptom:**
  ```text
  ERROR  [TypeError: undefined is not a function]
  WARN  Route "./_layout.tsx" is missing the required default export. Ensure a React component is exported as default.
  ERROR  [TypeError: Cannot read property 'ErrorBoundary' of undefined]
  ```
- **Root Cause:**
  - Even with `@expo/metro-runtime` fixed, the `import { Drawer } from "expo-router/drawer"` causes a fatal runtime evaluation error specifically within the Expo Go client environment for SDK 56.
  - This is tied to how `Drawer` initializes its `react-native-reanimated` bindings. Although the production bundle (`expo export --platform android`) compiles 100% cleanly without errors, the dev-mode execution in Expo Go crashes completely.
  - **Important Context:** We also found that `react-native-reanimated/plugin` should NOT be manually added to `babel.config.js` in SDK 56 because `babel-preset-expo` already includes it. Duplicating it corrupts the AST.
- **Solution (Mandatory Rule for Agents):**
  - **DO NOT attempt to use `Drawer` from `expo-router/drawer` during the development of Phase 1 and Phase 2 while using Expo Go.**
  - We have temporarily swapped the root layout navigation to `<Stack>` to bypass this environment bug and unblock the development of the Design System and UI components.
  - If a Drawer is absolutely required later, it must be tested exclusively on a standalone development build (Dev Client) and not on Expo Go.

### Issue 6: NativeWind v4 "transition-colors" / Reanimated "makeMutable" crash
- **Date:** 2026-06-16
- **Phase/Context:** Phase 02 (UI Components)
- **Status:** ✅ RESOLVED (Nuclear Workaround)
- **Error/Symptom:** 
  ```text
  ERROR  [TypeError: Cannot read property 'makeMutable' of undefined]
  ```
  Followed by `undefined is not a function` evaluating UI component files.
- **Root Cause:** 
  - The `Button.tsx` component had a Tailwind class `transition-colors`.
  - When NativeWind v4 encounters `transition-*` classes, its Babel preset silently injects imports to `react-native-reanimated` to power the animations.
  - However, `react-native-reanimated` v4 native engine fails to initialize properly inside the Expo Go SDK 56 environment. Thus, the JS injection attempts to call the uninitialized C++ `makeMutable`, crashing the entire JS thread immediately.
- **Solution (Mandatory Rule for Agents):**
  - **REMOVED `react-native-reanimated` completely from `package.json`.**
  - **REMOVED `transition-colors` (and any other `transition-*` classes) from UI components.**
  - If Reanimated is ever added back, you must ensure that NativeWind doesn't accidentally trigger a silent Reanimated crash on Expo Go. For Phase 2, we rely on standard React Native styles/animations to keep the app 100% stable.

### Issue 7: `lucide-react-native` crashing with `undefined is not a function`
- **Date:** 2026-06-16
- **Phase/Context:** Phase 02
- **Status:** ✅ RESOLVED
- **Root Cause:** `lucide-react-native` was installed without its mandatory peer dependency `react-native-svg`. Importing any icon silently threw `undefined is not a function` during module evaluation.
- **Solution:** Installed `react-native-svg` via `expo install`.

### Issue 8: `cva` + NativeWind dynamic className produces zero styling in React Native
- **Date:** 2026-06-16
- **Phase/Context:** Phase 02 (UI Components)
- **Status:** ✅ RESOLVED (Architecture Decision)
- **Symptom:** Components rendered but had zero styling — no colors, no padding, no borders. Everything looked like plain unstyled text.
- **Root Cause:**
  - `cva` (class-variance-authority) generates class strings **dynamically at runtime**.
  - NativeWind v4 requires its Babel plugin to **statically analyze** class names at compile time to generate native `StyleSheet` objects. Dynamic runtime strings from `cva` are invisible to the Babel transform and are silently dropped.
  - Additionally, web-only Tailwind classes like `inline-flex`, `hover:*`, and `min-h-[100px]` do not exist in React Native and are silently ignored.
- **Solution (Mandatory Rule for Agents):**
  - **DO NOT use `cva`, `tailwind-variants`, or any runtime class-string-generator for styling native components.**
  - **DO NOT use web-only Tailwind classes** (`inline-flex`, `hover:*`, `focus:*`, `min-h-[...]`) in NativeWind RN components.
  - All UI components were **rewritten using React Native inline style objects** with the design token colors hard-coded from our palette.
  - Design token palette: `BG=#0a0918`, `SURFACE=#13112a`, `PRIMARY_INDIGO=#6366f1`, `ACCENT_VIOLET=#8b5cf6`, `TEXT_PRIMARY=#f0efff`, `TEXT_SECONDARY=#9d9bcc`.

### Issue 9: Stack header appearing white despite dark theme
- **Date:** 2026-06-16
- **Phase/Context:** Phase 02
- **Status:** ✅ RESOLVED
- **Symptom:** The `<Stack>` navigator header rendered with a white background and dark text, completely out of sync with the dark indigo app theme.
- **Root Cause:** `<ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>` from `@react-navigation/native` was wrapping the `<Stack>`. Even when the device is in dark mode, the `DarkTheme` colors from React Navigation are grey/black (`#1c1c1e`) — not our custom palette. The `ThemeProvider` was overriding every `screenOptions` we tried to set.
- **Solution (Mandatory Rule for Agents):**
  - **Removed `ThemeProvider` entirely from `_layout.tsx`.**
  - Applied our custom palette directly via `screenOptions` on the `<Stack>`:
    ```tsx
    screenOptions={{
      headerStyle: { backgroundColor: "#0a0918" },
      headerTintColor: "#f0efff",
      headerTitleStyle: { fontWeight: "700" },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: "#0a0918" },
    }}
    ```
  - Also set `headerLargeTitle: true` on the index screen for the native iOS large title effect.

### Issue 10: `expo-router/drawer` Fatal Crash in Expo Go (SDK 56) — Phase 7 Regression
- **Date:** 2026-06-17
- **Phase/Context:** Phase 07 (UX Polish — Hamburger Drawer Navigation)
- **Status:** ✅ RESOLVED (Permanent Architectural Workaround)
- **Error/Symptom:**
  ```text
  ERROR  [TypeError: undefined is not a function]
  WARN   Route "./(drawer)/_layout.tsx" is missing the required default export.
  ERROR  [AppCrash] Unhandled JS Exception at _layout.tsx:1
  ```
- **Root Cause:**
  - Repeat of Issue 5. `expo-router/drawer` depends on `react-native-reanimated`, whose native bindings fail to initialize in Expo Go SDK 56.
  - Adding `react-native-reanimated/plugin` manually to `babel.config.js` corrupts the Babel AST (repeat of Issue 6).
- **Solution (Mandatory Rule for Agents):**
  - Removed `react-native-reanimated` from `package.json` entirely.
  - Deleted `app/(drawer)/` route group, restored flat route structure.
  - Implemented custom `Sidebar` component using `Modal` + `Animated` from `react-native` (not Reanimated).
  - Created `AppHeader` component replacing `Stack.Screen` headers, with hamburger + new-chat icons.
- **Permanent Rule:** DO NOT use `expo-router/drawer` or `react-native-reanimated` on Expo Go. Use Dev Client for native Drawer.
- **Validated by:** `pnpm typecheck` → 0 errors ✅

### Issue 11: `@react-navigation/elements` Blocked in SDK 56
- **Date:** 2026-06-16
- **Phase/Context:** Phase 07 (UX Polish — Keyboard Layout)
- **Status:** ✅ RESOLVED
- **Error/Symptom:**
  ```text
  ERROR  As of SDK 56, expo-router is no longer compatible with react-navigation.
  ```
- **Root Cause:**
  - Expo SDK 56 strictly enforces its own routing paradigm and blocks direct imports from `@react-navigation/*` at the bundler level (unless explicitly bypassed via env vars).
  - We attempted to import `useHeaderHeight` from `@react-navigation/elements` to dynamically set the `KeyboardAvoidingView` offset.
- **Solution (Mandatory Rule for Agents):**
  - **DO NOT import anything from `@react-navigation/*` directly in SDK 56.**
  - To calculate dynamic header heights for `KeyboardAvoidingView`, use `useSafeAreaInsets` from `react-native-safe-area-context` and add standard native header constants (e.g. `insets.top + 44`).

### UI/UX Architecture Rule: FAANG-Level Chat Input
- **Rule:** The `ChatInput` component must maintain a strict "Pill" geometry with inline actions.
- **Implementation Detail:** 
  - The input container MUST be a `flex-row` with `alignItems: "flex-end"`.
  - The `TextInput` must have a `minHeight` perfectly matching the action button `height` (e.g. 34px) so that when single-line, the button and text are perfectly centered vertically.
  - DO NOT stack the text and the button vertically. Doing so breaks the Apple/ChatGPT standard of chat inputs.

### Issue 11: Android Complete Layout Collapse (NativeWind `gap` & `className` interception)
- **Symptom:** On Android, screens suddenly lose all flexbox structure (components collapse to the top-left, margins and gaps are ignored) after updating dependencies or removing `react-native-reanimated`. Metro throws `Cannot find module 'nativewind/metro'`.
- **Root Cause:**
  - NativeWind v4 heavily hooks into `babel.config.js` (`jsxImportSource: "nativewind"`) and `metro.config.js`. 
  - When its underlying C++ dependencies (like Reanimated) are removed to fix iOS build issues, NativeWind's Babel transformer silently crashes on Android, discarding React Native style objects entirely.
  - Using `gap` in Flexbox layouts is also notoriously flaky on older Android SDKs.
- **Solution (Mandatory Rule for Agents):**
  - **NATIVEWIND IS PERMANENTLY BANNED FROM THIS PROJECT.**
  - All styling MUST be done using React Native's standard `StyleSheet.create`.
  - Do NOT use `className` anywhere in the `apps/mobile` directory.
  - Do NOT use flexbox `gap`. Use explicit `marginLeft`, `marginRight`, `marginTop`, `marginBottom`, and `padding` to separate elements.

### Issue 12: Android Double Keyboard Shift (Inverted FlatList Jump)
- **Date:** 2026-06-17
- **Phase/Context:** Phase 08 (Conversation Management & Keyboard UX)
- **Status:** ✅ RESOLVED
- **Error/Symptom:** When the keyboard opens on Android, the chat list pushes up correctly. However, when the keyboard closes, the layout breaks and the chat is visually disjointed or "doesn't return to its original position."
- **Root Cause:** 
  - `app.json` was set to `"softwareKeyboardLayoutMode": "pan"`, which instructs the Android OS to physically push the entire window up.
  - At the same time, we were using `<KeyboardAvoidingView behavior="padding">`. 
  - This resulted in a **Double Shift**: The OS pushed the app up, AND React Native added padding to the bottom. When closing, the inverted FlatList lost track of its zero offset because the container height changed unexpectedly.
- **Solution (Mandatory Rule for Agents):**
  - **Android:** `"softwareKeyboardLayoutMode"` must be set to `"resize"` in `app.json`. This tells Android to natively shrink the `flex: 1` window.
  - **React Native:** `KeyboardAvoidingView` must have `behavior={Platform.OS === "ios" ? "padding" : undefined}`. Android natively resizes, so it doesn't need (and cannot have) `behavior="padding"`. iOS still requires `behavior="padding"`.

### Issue 13: Final Android APK Blocks HTTP Local Provider URLs
- **Date:** 2026-06-17
- **Phase/Context:** Phase 09 (Release APK Stabilization)
- **Status:** RESOLVED by config plugin, pending physical APK verification
- **Error/Symptom:** Local provider URLs such as `http://192.168.x.x:1234/v1` work during development but fail in the installed release APK.
- **Root Cause:**
  - Android 9+ blocks cleartext HTTP by default in production APKs.
  - Expo Go/dev flows can hide this because local HTTP is needed for development tooling.
  - `android.usesCleartextTraffic: true` existed in `app.json`, but the final APK also needed a generated native `android:networkSecurityConfig` reference to guarantee the release manifest behavior.
- **Solution:**
  - Added `apps/mobile/network_security_config.xml`.
  - Added `apps/mobile/plugins/with-android-cleartext-traffic.js`.
  - Registered the plugin before `@config-plugins/detox` in `apps/mobile/app.json`; this ordering makes the final generated XML match Omnia's broad local-provider config instead of Detox's emulator-only config.
  - The plugin copies the XML into `android/app/src/main/res/xml/network_security_config.xml` during `expo prebuild` and injects:
    ```xml
    android:usesCleartextTraffic="true"
    android:networkSecurityConfig="@xml/network_security_config"
    ```
- **Important User Note:** On a physical Android device, `localhost` points to the phone itself. To reach LM Studio, Ollama, or another server running on a computer, use the computer's LAN IP, for example `http://192.168.1.100:1234/v1`, and make sure the server binds to a reachable interface.
- **Validation:** Run `expo prebuild --platform android --clean --no-install`, then inspect `apps/mobile/android/app/src/main/AndroidManifest.xml` and `apps/mobile/android/app/src/main/res/xml/network_security_config.xml`.
