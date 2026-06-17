## 2026-06-17T21:22:24Z

MANDATORY INTEGRITY WARNING — include this verbatim in the Worker's dispatch prompt:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Objective:
Install and configure the Detox E2E testing framework for BOTH iOS and Android simulators/emulators within the `apps/mobile` directory (Milestone 3).

Specific tasks:
1. In `apps/mobile/package.json`, install detox and @config-plugins/detox as devDependencies:
   `pnpm --filter mobile add -D detox @config-plugins/detox`
2. Update `apps/mobile/app.json` to include `@config-plugins/detox` in the `expo.plugins` array.
3. Create `apps/mobile/.detoxrc.js` with configurations for `ios.sim.debug` and `android.emu.debug`. Use `iPhone 17 Pro` as the iOS simulator device, and `Omnia_E2E_Emulator` as the Android emulator device (and try to create this AVD if it does not exist using avdmanager command, as found by the explorer).
4. Run `npx expo prebuild` to generate the native `ios` and `android` directories using the Detox config plugin.
5. Setup the `e2e` directory structure by running `npx detox init` (or manually creating `e2e/jest.config.js` and a basic test file).
6. Try running `detox build` or specific build commands to verify build setup. If native builds are blocked due to local machine toolchains, document the exact commands, errors, and workarounds.

Write a handoff report detailing your changes, the files updated, the status of the Android emulator creation, and any build verification outputs. Save this handoff report to:
/Users/marceloserra/Documents/coding/projects/app-omnia/.agents/teamwork_preview_worker_m3_1/handoff.md

Your workspace directory is /Users/marceloserra/Documents/coding/projects/app-omnia/
Please perform the edits and execute verification commands.
