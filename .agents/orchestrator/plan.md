# Project Plan: Omnia Mobile Testing Infrastructure Setup

## Overview
This plan outlines the steps required to configure the testing infrastructure for the Omnia mobile application, resolving Jest conflicts for React 19 / mobile, setting up Detox E2E for iOS/Android, and writing tests.

## Milestones

### Milestone 1: Explorer Phase — Investigation & Troubleshooting
- **Goal**: Analyze the exact Jest/Babel dependency errors, missing Detox config requirements, and project setup.
- **Tasks**:
  - Run the existing Jest tests to observe the exact Jest/Babel / `moduleMocker` conflicts.
  - Explore the React 19 + Expo 56 + React Native environment.
  - Determine required dependencies/resolutions for `@testing-library/react-native` on React 19.
  - Determine Detox requirements for iOS/Android in the monorepo context.
- **Deliverables**: Detailed report on Jest fixes and Detox configuration steps.

### Milestone 2: Resolve Jest UI Testing (R1)
- **Goal**: Ensure unit tests run successfully.
- **Tasks**:
  - Update `apps/mobile/jest.config.js`, `apps/mobile/jest.setup.js`, and Babel setup if needed.
  - Resolve `moduleMocker` (related to `react-native-reanimated` mock or similar) and Babel resolution errors.
  - Run `pnpm --filter mobile test` to verify `ConfirmDialog.test.tsx` runs successfully.
- **Deliverables**: Passing Jest test run, clean config files.

### Milestone 3: Setup Detox E2E Framework (R2)
- **Goal**: Configure Detox for iOS and Android.
- **Tasks**:
  - Install Detox dependencies in `apps/mobile` (and root if required).
  - Create Detox configuration file (e.g. `.detoxrc.js` or `detox.config.js`).
  - Configure `ios.sim.debug` and `android.emu.debug` targets in the Detox config.
  - Add necessary configuration for Metro, Expo, and detox-expo-helpers if needed.
- **Deliverables**: Valid `.detoxrc.js` config pointing to simulator/emulator targets.

### Milestone 4: Write Comprehensive E2E Suite (R3)
- **Goal**: Implement and verify E2E tests for core flows.
- **Tasks**:
  - Create `apps/mobile/e2e` folder.
  - Write test cases for:
    - App booting.
    - Sending a chat message.
    - Interacting with provider settings.
  - Add scripts in `package.json` to build and run Detox tests.
- **Deliverables**: Executable Detox test files under `apps/mobile/e2e/`.

### Milestone 5: Verification & Quality Gate Passes
- **Goal**: Verify everything with all standard quality gates in `AGENTS.md`.
- **Tasks**:
  - Run `pnpm install --frozen-lockfile`.
  - Run `pnpm lint`.
  - Run `pnpm typecheck`.
  - Run `pnpm test` (verify all pass).
  - Verify Expo exports for iOS and Android.
- **Deliverables**: Clean build, lint, typecheck, unit, and E2E results.
