# Original User Request

## Initial Request — 2026-06-17T17:54:14-03:00

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Configure robust testing infrastructure for the Omnia mobile application, specifically resolving Jest/Babel dependency conflicts for React Native Testing Library (with React 19) and setting up Detox for End-to-End (E2E) testing.

Working directory: /Users/marceloserra/Documents/coding/projects/app-omnia
Integrity mode: demo

## Requirements

### R1. Resolve Jest UI Testing
Fix the `moduleMocker` and Babel resolution errors in the `apps/mobile` Jest configuration so that `@testing-library/react-native` tests execute successfully against React 19.

### R2. Setup Detox E2E Framework
Install and configure the Detox E2E testing framework for BOTH iOS and Android simulators/emulators within the `apps/mobile` directory.

### R3. Write Comprehensive E2E Suite
Create Detox E2E tests covering the main user flows of the application, including booting the app, sending a chat message, and interacting with the provider settings.

## Acceptance Criteria

### Unit Testing
- [ ] Running `pnpm --filter mobile test` executes the existing `ConfirmDialog.test.tsx` successfully without Babel or `moduleMocker` crashes.

### E2E Setup
- [ ] The `apps/mobile` directory contains valid Detox configuration targeting both `ios.sim.debug` and `android.emu.debug`.
- [ ] An `e2e/` folder exists with test scripts that interact with the app's core UI elements (Chat Input, Settings Button).
