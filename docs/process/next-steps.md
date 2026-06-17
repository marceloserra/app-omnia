# Omnia Roadmap & Next Phases

## Overview

The Foundation Phases (1 through 9) are **officially complete**. We have successfully built the core application, ensuring extreme stability and FAANG-level UX:
- **UI/UX Finalized:** Glassmorphism, Dark/Light reactive themes, native Android keyboard physics, and Sidebar Modal navigation.
- **Data Layer:** SQLite persistence with array-bound varargs for native crash prevention.
- **Release Engineering:** GitHub Actions pipeline generating automated APKs and SHA256 checksums.

We are currently cutting the **v1.0.0 Stable** release. The current codebase requires NO further UI or architectural refactoring.

---

## 🚫 UI/UX Code Freeze
**IMPORTANT:** The user has explicitly mandated a freeze on UI/UX refactoring.
*"Nosso foco e somente finalizar a UI e lancar a stable agr"*

Do not suggest, build, or implement any further visual design changes unless specifically requested to fix a critical bug.

---

## Future Scope (Post v1.0.0 Stable)

Once `v1.0.0` is published and verified on physical devices, the project will transition from a traditional chat application into an **Agentic AI Assistant**.

### Phase 10: Retrieval-Augmented Generation (RAG)
- **Goal:** Allow users to upload PDFs, text files, and images.
- **Tech:** `@omnia/rag` package with local embeddings generation (Xenova/transformers.js) or relying on OpenAI embeddings, plus a local vector search implementation (SQLite `vss` or pure JS cosine similarity).

### Phase 11: WebFetch & Browsing
- **Goal:** Enable the LLM to search the web and scrape real-time data.
- **Tech:** Tool calling interfaces to execute proxy-based or native HTTPS requests to fetch webpage content and summarize it.

### Phase 12: Model Context Protocol (MCP)
- **Goal:** Full Agentic execution via MCP tools.
- **Tech:** Implement native MCP clients so the local or remote LLM can execute device actions (Calendar, Contacts, filesystem).

### Phase 13: Voice & Speech-to-Text
- **Goal:** Hands-free interaction.
- **Tech:** Expo Audio, Whisper (local or remote), and TTS engine.

> **Status:** All future phases are currently PENDING. Do not begin implementation until the user explicitly dictates the start of Phase 10.
