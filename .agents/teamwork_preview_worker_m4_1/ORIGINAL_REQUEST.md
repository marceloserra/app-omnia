## 2026-06-17T21:28:09Z

MANDATORY INTEGRITY WARNING — include this verbatim in the Worker's dispatch prompt:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Objective:
Implement comprehensive Detox E2E tests covering the main user flows of the application (booting the app, sending a chat message, and settings interactions) in `apps/mobile` (Milestone 4).

Specific tasks:
1. Run `pnpm install` at the workspace root to ensure `detox` and `@config-plugins/detox` dependencies are locked in `pnpm-lock.yaml` and installed locally.
2. Edit `apps/mobile/components/navigation/TabBar.tsx` to add `testID` props:
   - Home tab pressable: `testID="tab-home"`
   - History tab pressable: `testID="tab-history"`
   - New Chat tab pressable: `testID="tab-new-chat"`
   - Settings tab pressable: `testID="tab-settings"`
3. Edit `apps/mobile/components/chat/ChatInput.tsx` to add `testID` props:
   - TextInput field: `testID="chat-input"`
   - Send message Pressable: `testID="send-message-button"`
4. Edit `apps/mobile/app/(tabs)/settings.tsx` to add `testID` props:
   - OpenAI API Key TextInput: `testID="openai-api-key-input"`
   - OpenAI/Compatible provider Connect/Test Pressable: `testID="connect-provider-button"`
5. Write the Detox E2E tests in a new file `apps/mobile/e2e/omnia.e2e.js` (or overwrite `firstTest.e2e.js`). The test suite must cover:
   - Checking that the app launches successfully and shows the dashboard (greeting, main title 'Omnia').
   - Navigating to the settings tab using `element(by.id('tab-settings'))`, verifying settings header is visible, entering an API key in `element(by.id('openai-api-key-input'))`, and tapping the connect button `element(by.id('connect-provider-button'))`.
   - Navigating back to the home tab or tapping `element(by.id('tab-new-chat'))` to start a new chat, verifying the chat input `element(by.id('chat-input'))` is visible, typing a test message (e.g. 'Hello Omnia'), tapping the send button `element(by.id('send-message-button'))`, and checking that it sends or moves to the conversation view.
6. Verify your code compiles and passes typescript validation by running `pnpm --filter mobile typecheck` and `pnpm lint`.

Write a handoff report detailing your changes, the files updated, and the console command outputs of running `pnpm --filter mobile typecheck` and `pnpm lint`. Save this handoff report to:
/Users/marceloserra/Documents/coding/projects/app-omnia/.agents/teamwork_preview_worker_m4_1/handoff.md

Your workspace directory is /Users/marceloserra/Documents/coding/projects/app-omnia/
Please perform the edits and execute verification commands.
