# Handoff Report — React 19 Unit Testing Setup Conflicts Resolution (Milestone 2)

## 1. Observation
- Observed test failures in `apps/mobile/components/ui/__tests__/ConfirmDialog.test.tsx` when running `pnpm --filter mobile test` with exit code `1`:
  ```
  FAIL components/ui/__tests__/ConfirmDialog.test.tsx
    ConfirmDialog
      ✕ renders correctly when visible (242 ms)
      ✕ calls onConfirm when confirm button is pressed (2 ms)
      ✕ calls onCancel when cancel button is pressed (1 ms)

    ● ConfirmDialog › renders correctly when visible

      `render` function has not been called

        31 |     );
        32 |
      > 33 |     expect(screen.getByText('Delete Chat?')).toBeTruthy();
  ```
- Checked the contents of `apps/mobile/jest.setup.js` and observed no mock for `react-native-reanimated`.
- Checked `apps/mobile/jest.config.js` and observed the lookahead pattern in `transformIgnorePatterns`:
  ```javascript
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|tailwind-variants)'
  ],
  ```
  This pattern ignored `react-native-reanimated` and `@gorhom/bottom-sheet` from being transpiled, resulting in potential Jest parse or Babel runner issues on ESM syntax inside them.

## 2. Logic Chain
- Under React Native Testing Library (RNTL) v14, `render` operates asynchronously. Therefore, accessing `screen` directly after synchronous call fails with `render function has not been called`. Making all tests in `ConfirmDialog.test.tsx` async and awaiting `render(...)` resolves this.
- To avoid runtime errors/crashes with NativeModules or moduleMockers when using `react-native-reanimated`, we mock it in `jest.setup.js` via `jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));`.
- Because `react-native-reanimated` and `@gorhom/bottom-sheet` are distributed as ESM modules, they need to be transpiled during tests. Adding them to `transformIgnorePatterns` lookahead ensures Jest processes them using Babel.
- After implementing these fixes, we verified that running `pnpm --filter mobile test` succeeds and all tests pass.

## 3. Caveats
- ESLint checks were not fully executed inside the run command because of a prompt timeout, but `eslint.config.js` in `apps/mobile` specifies no custom rules (`rules: {}`), meaning style check is currently trivial.
- Verification commands were run using a local Node.js environment via `pnpm` on macOS.

## 4. Conclusion
- All three specific tasks have been successfully completed:
  1. `ConfirmDialog.test.tsx` has been updated to use `await render`.
  2. `jest.setup.js` has been updated to mock `react-native-reanimated`.
  3. `jest.config.js` has been updated to exclude `react-native-reanimated` and `@gorhom/bottom-sheet` from `transformIgnorePatterns`.
- Running `pnpm --filter mobile test` succeeds with all 3 test cases passing.

## 5. Verification Method
### Commands to run:
- Execute `pnpm --filter mobile test` at the root folder to confirm all tests pass:
  ```bash
  pnpm --filter mobile test
  ```
- Verify TypeScript compilation using:
  ```bash
  pnpm --filter mobile typecheck
  ```

### Verbatim Console Output of `pnpm --filter mobile test`:
```
> mobile@1.0.0 test /Users/marceloserra/Documents/coding/projects/app-omnia/apps/mobile
> jest

PASS components/ui/__tests__/ConfirmDialog.test.tsx
  ConfirmDialog
    ✓ renders correctly when visible (2437 ms)
    ✓ calls onConfirm when confirm button is pressed (2 ms)
    ✓ calls onCancel when cancel button is pressed (2 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        3.609 s
Ran all test suites.
```
