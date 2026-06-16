# Development Guide

## Purpose

Document the local workflow for Phase 1 contributors.

## Prerequisites

- Node.js compatible with Expo SDK 56
- pnpm `10.34.3`
- Expo Go or a native simulator/device for mobile validation

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

```bash
pnpm --filter ./apps/mobile exec expo export --platform ios --output-dir /private/tmp/omnia-ios-export --clear
pnpm --filter ./apps/mobile exec expo export --platform android --output-dir /private/tmp/omnia-android-export --clear
```

## Phase Discipline

Phase 1 is foundation only. Do not add providers, SQLite persistence, or chat features until the documented phase that owns them.

