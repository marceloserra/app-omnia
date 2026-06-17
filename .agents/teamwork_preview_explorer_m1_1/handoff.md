# Testing Infrastructure & React 19 Investigation Report

This report summarizes findings regarding unit test execution failures in `apps/mobile`, configuration conflicts, system simulator/emulator detection, and a step-by-step Detox E2E testing setup strategy.

---

## 1. Observation

### Unit Test Failures
Running `pnpm --filter mobile test` results in the following unit test failure inside `apps/mobile/components/ui/__tests__/ConfirmDialog.test.tsx`:

```
> mobile@1.0.0 test /Users/marceloserra/Documents/coding/projects/app-omnia/apps/mobile
> jest

FAIL components/ui/__tests__/ConfirmDialog.test.tsx
  ConfirmDialog
    ✕ renders correctly when visible (236 ms)
    ✕ calls onConfirm when confirm button is pressed (2 ms)
    ✕ calls onCancel when cancel button is pressed (1 ms)

  ● ConfirmDialog › renders correctly when visible

    `render` function has not been called

      31 |     );
      32 |
    > 33 |     expect(screen.getByText('Delete Chat?')).toBeTruthy();
         |                   ^
      34 |     expect(screen.getByText('This action cannot be undone.')).toBeTruthy();
      35 |     expect(screen.getByText('Cancel')).toBeTruthy();
      36 |     expect(screen.getByText('Delete')).toBeTruthy();

      at Object.notImplemented (../../node_modules/@testing-library/react-native/src/screen.ts:8:9)
      at Object.getByText (components/ui/__tests__/ConfirmDialog.test.tsx:33:19)
```

### Inspected Files
*   **`apps/mobile/package.json`**:
    *   `react`: `19.2.3`
    *   `react-native`: `0.85.3`
    *   `@testing-library/react-native`: `^14.0.0`
    *   `jest-expo`: `^56.0.5`
    *   `react-native-reanimated`: `^4.4.1`
*   **`apps/mobile/jest.config.js`**:
    *   Configures `preset: 'jest-expo'`.
    *   Sets up `transformIgnorePatterns` (does not compile `react-native-reanimated` because it is excluded from the negative lookahead).
*   **`apps/mobile/jest.setup.js`**:
    *   Imports `@testing-library/react-native` but does not define any mocks for `react-native-reanimated`.
*   **`node_modules/@testing-library/react-native/dist/render.js`**:
    *   Line 22: `async function render(element, options = {})`
    *   Line 83: `(0, _screen.setRenderResult)(result)`
*   **`node_modules/@testing-library/react-native/dist/screen.js`**:
    *   Line 9-11:
        ```javascript
        const SCREEN_ERROR = '`render` function has not been called';
        const notImplemented = () => {
          throw new Error(SCREEN_ERROR);
        };
        ```

### System Simulator & Emulator Environment
*   **iOS Simulators**:
    Inspection of `/Users/marceloserra/Library/Developer/CoreSimulator/Devices/device_set.plist` shows available simulators under runtime `com.apple.CoreSimulator.SimRuntime.iOS-26-5`:
    *   `iPhone 17` (UUID: `BEB185F6-3043-4187-A4C3-E908BDFD6422`)
    *   `iPhone 17 Pro` (UUID: `940BF63D-8FD7-40FA-A517-5303868A9299`)
    *   `iPhone 17 Pro Max` (UUID: `40D67798-C20F-43C6-B582-80FB0E2F1A0E`)
    *   `iPhone 17e` (UUID: `45DCFCC5-84AC-4C97-8588-943AA7C2DC9F`)
    *   `iPhone Air` (UUID: `8D6CAA46-08C5-4CA8-925A-99FB8DEA74BD`)
*   **Android Emulators**:
    *   `/Users/marceloserra/.android/avd` is **empty** (no AVDs have been created on this host yet).
    *   `/Users/marceloserra/Library/Android/sdk/system-images/android-37.0/google_apis_playstore_ps16k` exists, meaning Android 37 system image is available for creating emulators.

---

## 2. Logic Chain

1.  **Asynchronous RNTL render in v14**:
    *   Under React Native Testing Library (RNTL) v14.0.0, the `render` function was refactored to be asynchronous (returns a `Promise<RenderResult>`) to support React 19's asynchronous/concurrent rendering updates.
2.  **Why the test throws `render function has not been called`**:
    *   `ConfirmDialog.test.tsx` invokes `render(...)` synchronously:
        ```typescript
        render(<ConfirmDialog ... />);
        expect(screen.getByText(...)).toBeTruthy();
        ```
    *   Because `render` is not awaited, the execution immediately proceeds to queries on the `screen` object.
    *   `screen` is initialized as a proxy that throws `` `render` function has not been called `` for all methods until `setRenderResult()` is invoked inside the resolved promise of the `render` function.
    *   Since the test evaluates queries synchronously before the promise resolves, it encounters the `SCREEN_ERROR` exception.
3.  **Transitive Reanimated and moduleMocker concerns**:
    *   Although the mobile app source does not directly use `react-native-reanimated`, libraries like `@gorhom/bottom-sheet` and `@react-navigation/drawer` do.
    *   Because `react-native-reanimated` is excluded from transpilation in `jest.config.js` and there is no mock defined in `jest.setup.js`, invoking tests on components that transitively render these libraries will crash when trying to invoke Native Modules or resolve native `moduleMocker` bindings inside Reanimated.

---

## 3. Caveats

*   **No live execution of fixes**: Under the read-only constraint of this investigation ("Do NOT make any code edits or modifications"), we did not run the unit tests with the asynchronous updates applied.
*   **No Local Android Virtual Device (AVD) exists**: Detox cannot run Android tests out-of-the-box in the current host environment without first running commands (`avdmanager`) or using Android Studio to create a device.
*   **Simctl command timeout**: `xcrun simctl list devices` timed out due to system-level prompt requirements. Simulator definitions were fetched directly by reading Xcode CoreSimulator device registration plists.

---

## 4. Conclusion

### Resolving Unit Test Failures
1.  **Modify the test file** to await the `render` call. Every test block in `ConfirmDialog.test.tsx` must be marked `async` and use `await render(...)`.
2.  **Add react-native-reanimated mocks & transpilation rules** to prevent future mock errors:
    *   In `apps/mobile/jest.setup.js`, add:
        ```javascript
        jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
        ```
    *   In `apps/mobile/jest.config.js`, update `transformIgnorePatterns` to allow `react-native-reanimated` and related packages to be transpiled:
        ```javascript
        transformIgnorePatterns: [
          'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|tailwind-variants|react-native-reanimated|@gorhom/bottom-sheet)'
        ]
        ```

### Detox E2E Setup Strategy
Since no Detox configuration exists, we outline a configuration template and a step-by-step setup strategy.

#### Proposed `.detoxrc.js` config
Write a `.detoxrc.js` file at `apps/mobile/.detoxrc.js`:

```javascript
/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    compiler: 'typescript',
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      // Run prebuild and build using xcodebuild targeting the simulator
      build: 'npx expo prebuild --platform ios && xcodebuild -workspace ios/Omnia.xcworkspace -scheme Omnia -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/Omnia.app'
    },
    'android.debug': {
      type: 'android.apk',
      // Run prebuild and compile debug APKs
      build: 'npx expo prebuild --platform android && cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 17 Pro'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Omnia_E2E_Emulator'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    }
  }
};
```

#### Step-by-Step Setup Strategy
1.  **Configure Environment**:
    Install Detox CLI globally:
    ```bash
    npm install -g detox-cli
    ```
2.  **Add AVD (Android Emulator)**:
    Create the emulator matching the Detox device name (`Omnia_E2E_Emulator`):
    ```bash
    $ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd \
      --name "Omnia_E2E_Emulator" \
      --package "system-images;android-37;google_apis_playstore_ps16k" \
      --device "pixel_5"
    ```
3.  **Generate Expo Prebuild Files**:
    Detox tests run against the native iOS (`.app`) and Android (`.apk`) packages. Generate them by running:
    ```bash
    pnpm --filter mobile exec expo prebuild
    ```
4.  **Install Detox Dev-Dependencies**:
    Under `apps/mobile`:
    ```bash
    pnpm --filter mobile add -D detox @config-plugins/detox
    ```
    Add `"@config-plugins/detox"` to the `plugins` block inside `apps/mobile/app.json`.
5.  **Initialize Test Suite**:
    Generate the test harness templates inside `apps/mobile/e2e`:
    ```bash
    cd apps/mobile && npx detox init
    ```
6.  **Build Apps**:
    Build the native binaries for test executions:
    ```bash
    # Build iOS Debug
    npx detox build --configuration ios.sim.debug

    # Build Android Debug
    npx detox build --configuration android.emu.debug
    ```
7.  **Run Tests**:
    Execute E2E test suites:
    ```bash
    npx detox test --configuration ios.sim.debug
    ```

---

## 5. Verification Method

To verify the unit test resolution:
1.  Open `/Users/marceloserra/Documents/coding/projects/app-omnia/apps/mobile/components/ui/__tests__/ConfirmDialog.test.tsx`.
2.  Update it to await the renders:
    ```typescript
    it('renders correctly when visible', async () => {
      await render(<ConfirmDialog visible={true} ... />);
      expect(screen.getByText('Delete Chat?')).toBeTruthy();
    });
    ```
3.  Run:
    ```bash
    pnpm --filter mobile test
    ```
4.  Check that the test execution reports `Test Suites: 1 passed, 1 total`.
