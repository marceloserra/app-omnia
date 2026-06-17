<h1 align="center">Omnia AI</h1>

<p align="center">
  <img
    src="apps/mobile/assets/icon.png"
    alt="Omnia icon"
    width="96"
    height="96"
  />
</p>

<p align="center">
  <strong>A fast, offline-capable native client for your Self-Hosted and Cloud AI models.</strong>
</p>

<p align="center">
  <img alt="Latest Release" src="https://img.shields.io/badge/Release-v1.0.0-0A84FF?style=flat-square" />
  <img alt="React Native" src="https://img.shields.io/badge/React_Native-05050f?style=flat-square&logo=react" />
  <img alt="Expo" src="https://img.shields.io/badge/Expo-SDK_56-black?style=flat-square&logo=expo" />
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite" />
  <img alt="Storybook" src="https://img.shields.io/badge/Storybook-FF4785?style=flat-square&logo=storybook" />
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-16A34A?style=flat-square" />
</p>

<p align="center">
  <a href="#the-motivation">The Motivation</a> •
  <a href="#comprehensive-feature-set">Features</a> •
  <a href="#omnia-design-system-ods">Design System</a> •
  <a href="#built-for-mobile-reality">Architecture</a> •
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

## The Motivation

In my journey of building and experimenting with self-hosted AI projects, I desperately needed a native mobile app that was simple, beautiful, and effortless to connect to my Local Self-Hosted AI stack ([ai-self-hosted-lab](https://github.com/marceloserra/ai-self-hosted-lab)). 

While I absolutely loved incredible projects like Open WebUI and llama.cpp UI, I always felt the friction of browser-based interfaces on my phone. I wanted something that felt *native*—something that tapped into the iPhone's haptic engine, handled network drops gracefully, and lived on my home screen. So, I decided to build it. Omnia is the bridge between your powerful local lab and your pocket.

---

## Comprehensive Feature Set

We didn't just build a chat wrapper; we built a fully-featured, production-ready mobile application. Here is exactly what is inside the box:

### Chat & Conversational Core
- **New Chat Generation:** Instantly spawn fresh conversation contexts with isolated memory boundaries.
- **Infinite History:** A dedicated history screen allowing you to infinitely scroll and instantly resume any past conversation without network latency.
- **Dynamic Title Generation:** The app automatically processes your first prompt and generates a concise, contextual title for the chat.
- **Real-Time Streaming:** Tokens render smoothly at 60 FPS, optimized for mobile hardware without causing React RAM leaks.
- **Developer-First Markdown:** Native rendering for complex Markdown, tables, and nested formatting. Code blocks feature full syntax highlighting and a 1-click copy button.

### Providers & AI Integration
- **Universal Provider Support:** Natively supports commercial giants (OpenAI, Anthropic, Gemini) AND your Local/Custom Endpoints (OpenAI Compatible) for ultimate privacy.
- **Live Provider Validation:** Real-time ping testing for API keys and Base URLs to ensure your self-hosted endpoints are reachable before saving.
- **Live Model Switching:** Change your mind mid-conversation? Tap the floating header to open a modal and switch from ChatGPT to your Local Llama on the fly without dropping context.
- **Dynamic Island Chips:** Know exactly which model you are talking to at a glance with a borderless floating header.

### Native Persistence & UX
- **Swipe-to-Pin & Delete:** Manage your history like a pro. Swipe left to permanently cascade-delete chats, or swipe right to Pin your most important architecture discussions to the top.
- **Granular Customization:** A unified dark-mode settings hub to manage your endpoints and application behaviors.
- **Haptic Engine Toggle:** Deep integration with device haptics provides tactile feedback on stream completions, swipes, and system errors. You can toggle this completely on or off in Settings.

---

## Omnia Design System (ODS)

A premium app requires a premium foundation. We didn't just hardcode styles; we built the **Omnia Design System (ODS)**.

- **Strict Apple-Tier Aesthetic:** Built around a true dark mode (`#05050f`), frosted glass materials, and non-blocking interactions.
- **Component Colocation:** Every UI element (from the Chat Bubbles to the Bottom Sheets) is strictly encapsulated.
- **Storybook Integration:** We leverage Storybook to isolate, test, and document our UI components. You can boot up the component catalog independently to verify the design language without running the full application logic.

---

## Built for Mobile Reality

Most AI clients crash or lose your long prompt when you switch apps. Omnia is engineered for the chaotic reality of mobile networks:

- **Idempotent by Default:** Injects unique `X-Request-ID` headers to prevent duplicated token generation if your 5G connection blinks during a request.
- **Single Source of Truth:** The chat streams write directly to a synchronous SQLite database running on the device. Even if you kill the app mid-generation, your chat history is perfectly preserved.
- **Auto-Fallback Circuit Breakers:** If the cloud rate-limits you or your network drops, Omnia's network layer automatically intercepts the error and routes the prompt to your fallback local models.
- **Feature-Sliced Design:** The monorepo architecture strictly isolates concerns into domain-specific packages (`@omnia/storage`, `@omnia/providers`, etc.).

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

# 3. Run the Omnia Design System (Storybook)
pnpm --filter mobile storybook
```

---

## Credits & Acknowledgements

**Special Thanks & Inspiration:**
- Massive thanks to the **llama.cpp** project for paving the way and inspiring the UI simplicity.
- Shoutout to **LM Studio** for proving that managing local models can be a gorgeous experience.

**Developed by:**
This project was built through heavy pair-programming with local and cloud models:
1. **Claude 3.5 Sonnet**, **Gemini 1.5 Pro**, **GPT-4o**, and **Qwen 2.5 Coder 32B** (provided by [ai-self-hosted-lab](https://github.com/marceloserra/ai-self-hosted-lab)).

<p align="center">
  <i>"One app. Every model. Your pocket."</i>
</p>
