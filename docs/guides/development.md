# Development Guide

## Purpose

Document the local workflow for Phase 1 contributors.

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

## Phase Discipline

Phase 1 is foundation only. Do not add providers, SQLite persistence, or chat features until the documented phase that owns them.