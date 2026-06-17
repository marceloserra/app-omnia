# Project: Omnia Mobile Testing Infrastructure Setup

## Architecture
- **Monorepo Structure**:
  - `@omnia/shared-types`: Shared types
  - `@omnia/storage`: SQLite persistence layer
  - `@omnia/providers`: AI provider client library
  - `apps/mobile`: React Native Expo application incorporating all packages
- **Testing Layers**:
  - **Unit Testing**: Jest-expo framework targeting React Native components and library logic, testing React 19 compatibility.
  - **End-to-End Testing**: Detox framework running on native simulator/emulator configurations (iOS/Android), verifying overall flows.

## Code Layout
- `apps/mobile/jest.config.js`: Configuration for Jest unit tests.
- `apps/mobile/jest.setup.js`: Setup file for mocking native elements.
- `apps/mobile/.detoxrc.js`: Configuration for Detox.
- `apps/mobile/e2e/`: E2E test suites directory.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Explorer Phase | Investigation of Jest/Babel and Detox setup | None | DONE |
| 2 | M2: Resolve Jest | Fix React 19 & Jest setup, pass ConfirmDialog test | M1 | DONE |
| 3 | M3: Detox Setup | Install and configure Detox for iOS/Android | M2 | DONE |
| 4 | M4: E2E Suite | Implement chat & settings flow E2E tests | M3 | DONE |
| 5 | M5: Verification | Quality Gates and Expo exports validation | M4 | DONE |

## Interface Contracts
### E2E Test Hooks
- Test IDs are added to key components:
  - Chat Input: `testID="chat-input"`
  - Send Button: `testID="send-message-button"`
  - Settings Button: `testID="settings-button"`
  - Provider Selector: `testID="provider-selector"`
