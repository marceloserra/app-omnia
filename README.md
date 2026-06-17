<h1 align="center">Omnia AI</h1>

<p align="center">
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/GitHub_Invertocat_Logo.svg/100px-GitHub_Invertocat_Logo.svg.png"
    alt="Omnia icon"
    width="96"
    height="96"
  />
</p>

<p align="center">
  <strong>The FAANG-tier, offline-capable AI client for iOS and Android.</strong>
</p>

<p align="center">
  <img alt="Latest Release" src="https://img.shields.io/badge/Release-v1.0.0-0A84FF?style=flat-square" />
  <img alt="React Native" src="https://img.shields.io/badge/React_Native-05050f?style=flat-square&logo=react" />
  <img alt="Expo" src="https://img.shields.io/badge/Expo-SDK_56-black?style=flat-square&logo=expo" />
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-16A34A?style=flat-square" />
</p>

<p align="center">
  <a href="#why-omnia">Why Omnia</a> •
  <a href="#feature-snapshot">Feature Snapshot</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#quickstart">Quickstart</a>
</p>
<br>

<p align="center">
  <!-- TODO: Replace with actual .gif demo from Simulator -->
  <img
    src="https://via.placeholder.com/360x640/05050f/6366f1?text=Omnia+Demo+Video+.gif"
    alt="Omnia demo"
    width="360"
  />
</p>
<br>

## Why Omnia?

Most mobile AI clients are glorified web wrappers that break down the moment you step into an elevator. **Omnia** is built differently. Engineered with strict FAANG-level mobile patterns, it guarantees that you never lose a prompt, your chats render at a buttery 60 FPS, and the application gracefully falls back to local processing when the cloud goes dark. 

## Feature Snapshot

| Area | Included |
| --- | --- |
| **Chat UX** | Real-time streaming, dynamic title generation, Markdown engine, code highlighting with 1-click copy, and "Dynamic Island" provider chips. |
| **Data Integrity** | Complete local-first SQLite persistence. Swipe-to-delete, Chat Pinning, and infinite scroll history natively optimized. |
| **Resilience** | Circuit Breakers with Auto-Fallback to local models, Exponential Backoff on network drops, and Idempotency Keys to prevent duplicate API billing. |
| **Hardware Integration** | Precise Haptic engine feedback (vibrations) on chat stream completion, errors, and physical interactions. |
| **Personalization** | FAANG-grade bottom sheet modal for live model switching mid-conversation, and unified dark-mode Settings Hub. |

## Built for Mobile Reality

- **Single Source of Truth (Hybrid):** Streams write directly to a synchronous SQLite database running on the device, eliminating React RAM leaks.
- **Graceful Degradation:** If OpenAI hits a `429 Rate Limit` or loses connection, Omnia automatically "trips the circuit" and switches to your embedded/local `OpenAI Compatible` endpoint.
- **Idempotent by Default:** Injects unique `X-Request-ID` headers to prevent duplicated token generation if your 5G connection blinks during a request.
- **Strictly Feature-Sliced:** The codebase follows Colocation and Feature-Sliced Design (FSD), making the monorepo structurally beautiful to navigate.

---

## Quickstart

Omnia uses `pnpm` and `Turborepo` for monorepo orchestration.

```bash
# 1. Clone & Install
git clone https://github.com/marceloserra/app-omnia.git
cd app-omnia
pnpm install

# 2. Run the App
pnpm --filter mobile dev
```

## Monorepo Structure

- `apps/mobile`: The React Native (Expo) application.
- `packages/shared-types`: Universal TypeScript types and schemas.
- `packages/storage`: SQLite database and repositories.
- `packages/providers`: LLM API connections and streaming logic.
- `packages/logger`: Core logging logic.
