# Mobile Agent Instructions

Read the root `AGENTS.md` first.

## Expo

Expo has changed. Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before changing Expo configuration or native app setup.

## Native Compatibility

- Use React Native primitives, not web DOM elements.
- Keep `expo-router` imports compatible with the installed Expo Router version.
- Verify both iOS and Android bundles after navigation, Metro, Babel, or styling changes.
