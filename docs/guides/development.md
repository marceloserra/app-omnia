# Development Guide

## Purpose

Document the local workflow for Omnia contributors and agents.

## Prerequisites

- Node.js compatible with Expo SDK 56
- pnpm `10.34.3`
- Xcode (iOS simulator)
- Android Studio + SDK (Android emulator/device)

## Local Environment Setup

### iOS Simulator

Install Xcode from the Mac App Store or via Homebrew:

```bash
brew install --cask xcode
```

After installation, accept Xcode licenses and install CLI tools:

```bash
sudo xcodebuild -license agree
xcode-select --install
```

Verify simulator availability:

```bash
xcrun simctl list devices
```

### Android Emulator / Device

Install Android Studio (includes SDK + adb):

```bash
brew install --cask android-studio
```

Open Android Studio and complete the setup wizard to install SDK components. Then configure your shell:

```bash
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$ANDROID_HOME/platform-tools:$PATH' >> ~/.zshrc
source ~/.zshrc
```

Verify adb is available:

```bash
adb version
```

#### Create an Android Virtual Device (AVD)

Expo requires a running emulator or connected device. To create one:

1. Open **Android Studio** → `Tools` → `Device Manager`
2. Click **"Create Device"** and pick a hardware profile (e.g., Pixel 6 or Pixel 7)
3. On the "System Image" screen, select an image with **"Google Play"** matching your SDK API level
4. Download the system image if prompted, then click **"Next"** → **"Finish"**
5. In Device Manager, click the ▶️ play button to start the emulator

See [Expo Android Studio Emulator docs](https://docs.expo.dev/workflow/android-studio-emulator) for detailed setup and troubleshooting.

## Setup

```bash
pnpm install
```

## Common Commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
```

## Mobile Verification

### Native Bundle Exports (CI)

```bash
pnpm --filter ./apps/mobile exec expo export --platform ios --output-dir /private/tmp/omnia-ios-export --clear
pnpm --filter ./apps/mobile exec expo export --platform android --output-dir /private/tmp/omnia-android-export --clear
```

### Local Development Servers

Requires Xcode (iOS) and Android SDK + adb (Android):

```bash
npx expo start --ios    # launches iOS simulator
npx expo start --android # launches Android emulator or connected device
```

If `--android` fails with "Failed to resolve the Android SDK path", verify `ANDROID_HOME` is set and `adb` exists on PATH (see Local Environment Setup above).

If `--android` reports "No Android connected device found", ensure an AVD is created and running in Device Manager.

## Phase Discipline

The active phase is documented in `MANIFEST.md`, `AGENTS.md`, and `docs/references/phase-scope.md`.

Do not implement capabilities outside the active phase. During Phase 9, production APK stabilization, release automation, documentation, and approved UI/UX polish are allowed. RAG, agents, MCP, tool calling, WebFetch, voice, sync, authentication, plugins, and cloud backend work remain out of scope.

## Branch Discipline

Follow `docs/process/git-flow.md` for all changes. Work branches target `develop`; release branches stabilize from `develop`; emergency hotfixes branch from `main` and are back-merged to `develop`.
