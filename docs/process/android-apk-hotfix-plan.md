# Android APK Hotfix Plan

## Purpose

Prepare the PR that fixes the two critical final APK defects found after the stable release:

- Android launcher icon shows the Android Studio/default icon instead of Omnia.
- Final Android APK blocks HTTP local provider URLs such as `http://192.168.x.x:1234`.

## Branch

Use the hotfix branch:

```bash
hotfix/android-cleartext-and-icon
```

Target branch:

```bash
main
```

After merge to `main`, tag the next patch release from `main`, then back-merge `main` into `develop` according to `docs/process/git-flow.md`.

## Diagnosis

### Launcher Icon

The Android launcher uses the adaptive icon foreground configured by:

```json
android.adaptiveIcon.foregroundImage
```

`apps/mobile/assets/adaptive-icon.png` was 0 bytes, so Expo/Android could fall back to default generated launcher assets. `apps/mobile/assets/icon.png` was valid, but Android adaptive icons do not use only the root `icon` field.

### HTTP Local Provider Connectivity

Android 9+ blocks cleartext HTTP traffic unless the final native manifest opts into it. Expo Go can hide this during development because development clients need local HTTP access for Metro.

`android.usesCleartextTraffic: true` existed in `app.json`, but the final APK also needs an explicit generated native network security config reference:

```xml
android:usesCleartextTraffic="true"
android:networkSecurityConfig="@xml/network_security_config"
```

The `android.networkSecurityConfig` key in `app.json` is not treated as a reliable Expo app config field by itself. A local Expo config plugin must copy the XML resource into the generated Android project and inject both manifest attributes.

## Fix

1. Replace `apps/mobile/assets/adaptive-icon.png` with a valid 512x512 Omnia PNG.
2. Add `apps/mobile/network_security_config.xml` with cleartext enabled for user-defined local AI endpoints.
3. Add `apps/mobile/plugins/with-android-cleartext-traffic.js`.
4. Register that plugin before `@config-plugins/detox` in `apps/mobile/app.json`. In Expo's dangerous mod composition, this makes the final generated `network_security_config.xml` match Omnia's broad local-provider config instead of Detox's emulator-only config.
5. Keep `android.usesCleartextTraffic: true` in `app.json` for Expo's built-in manifest support.

## User-Facing Note

On a physical Android device, `localhost` means the phone itself, not the developer's computer. For LM Studio, Ollama, or another server running on the computer, use a LAN URL such as:

```text
http://192.168.1.100:1234/v1
```

The computer and phone must be on the same network, and the local server must bind to a reachable interface, usually `0.0.0.0`, not only `127.0.0.1`.

## Verification Plan

Before opening the PR:

```bash
pnpm --filter ./apps/mobile exec expo prebuild --platform android --clean --no-install
test -f apps/mobile/android/app/src/main/res/xml/network_security_config.xml
rg 'usesCleartextTraffic|networkSecurityConfig' apps/mobile/android/app/src/main/AndroidManifest.xml
pnpm --filter ./apps/mobile exec expo export --platform android --output-dir /private/tmp/omnia-android-export --clear
pnpm lint
pnpm typecheck
pnpm test
```

For final release confidence, the release branch should also run:

```bash
pnpm --filter ./apps/mobile exec expo export --platform ios --output-dir /private/tmp/omnia-ios-export --clear
pnpm --filter ./apps/mobile exec expo export --platform android --output-dir /private/tmp/omnia-android-export --clear
```

Manual device verification:

1. Install the generated release APK on a physical Android device.
2. Configure a local provider with a LAN HTTP base URL.
3. Validate that model discovery and chat completion work without HTTPS.
4. Confirm the launcher icon is the Omnia icon after reinstalling the APK.

## PR Checklist

- [ ] PR targets `develop`.
- [ ] PR targets `main`.
- [ ] PR title uses Conventional Commits, for example `fix(android): allow HTTP local providers in release APK`.
- [ ] Generated `apps/mobile/android/` output is not committed.
- [ ] ADR and troubleshooting docs are updated with the root cause.
- [ ] Verification commands and skipped commands are listed in the PR body.
