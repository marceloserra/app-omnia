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
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-16A34A?style=flat-square" />
</p>

<p align="center">
  <a href="#the-motivation">The Motivation</a> •
  <a href="#feature-snapshot">Feature Snapshot</a> •
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

## 🚀 Why Omnia?

We didn't just build another web wrapper. We engineered a native mobile experience that treats your self-hosted local models with the exact same respect, speed, and UI polish as commercial cloud APIs. 

Omnia is built for power users, developers, and AI enthusiasts who demand 60 FPS rendering, solid offline resilience, and a clean dark mode aesthetic. Whether you are hitting OpenAI's servers or your own local rig, Omnia connects instantly, streams smoothly, and preserves your context.

---

## 💡 The Motivation

In my journey of building and experimenting with self-hosted AI projects, I desperately needed a native mobile app that was simple, beautiful, and effortless to connect to my Local Self-Hosted AI stack ([ai-self-hosted-lab](https://github.com/marceloserra/ai-self-hosted-lab)). 

While I absolutely loved incredible projects like **Open WebUI** and **llama.cpp UI**, I always felt the friction of browser-based interfaces on my phone. I wanted something that felt *native*—something that tapped into the iPhone's haptic engine, handled network drops gracefully, and lived on my home screen. So, I decided to build it. Omnia is the bridge between your powerful local lab and your pocket.

---

## 🔥 Feature Snapshot

| Capability | What it means for you |
| --- | --- |
| **Real-Time Streaming** | Tokens render smoothly at 60 FPS, optimized for mobile hardware without causing React RAM leaks. |
| **Provider Chips** | Know exactly which model you are talking to. A borderless floating header houses your active AI provider and model configuration. |
| **Live Model Switching** | Change your mind mid-conversation? Tap the header to open a modal and switch from ChatGPT to your Local Llama on the fly. |
| **Developer-First Markdown** | Native rendering for complex Markdown, tables, and nested formatting. Code blocks feature full syntax highlighting and a 1-click copy button. |
| **Auto-Fallback** | If the cloud rate-limits you or your network drops, Omnia automatically intercepts the error and routes the prompt to your fallback local models. |
| **Swipe-to-Pin & Delete** | Complete local SQLite persistence. Swipe left to delete chats, or swipe right to Pin your most important architecture discussions to the top. |
| **Haptic Engine** | Deep integration with device haptics provides tactile feedback on stream completions, physical interactions, and system errors. |

---

## 🏗 Built for Mobile Reality

Most AI clients crash or lose your long prompt when you switch apps. Omnia is engineered for the chaotic reality of mobile networks:
- **Idempotent by Default:** Injects unique `X-Request-ID` headers to prevent duplicated token generation if your connection blinks.
- **Single Source of Truth:** The chat streams write directly to a synchronous SQLite database running on the device. Even if you kill the app mid-generation, your chat history is perfectly preserved.
- **Feature-Sliced Design:** The monorepo architecture strictly isolates concerns into domain-specific packages, meaning the business logic is decoupled from React Native components.

---

## 🛠 Quickstart

Omnia uses `pnpm` and `Turborepo` for monorepo orchestration.

```bash
# 1. Clone & Install
git clone https://github.com/marceloserra/app-omnia.git
cd app-omnia
pnpm install

# 2. Run the App
pnpm --filter mobile dev
```

---

## 🏆 Credits & Acknowledgements

**Special Thanks & Inspiration:**
- Massive thanks to the **llama.cpp** project for paving the way and inspiring the UI simplicity.
- Shoutout to **LM Studio** for proving that managing local models can be a gorgeous experience.

**Developed by:**
This project was built through heavy pair-programming with local and cloud models:
1. **Claude 3.5 Sonnet**, **Gemini 1.5 Pro**, **GPT-4o**, and **Qwen 2.5 Coder 32B** (provided by [ai-self-hosted-lab](https://github.com/marceloserra/ai-self-hosted-lab)).

<p align="center">
  <i>"One app. Every model. Your pocket."</i>
</p>
