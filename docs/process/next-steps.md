# Omnia Roadmap & Next Phases

## Overview

The Foundation Phases (1 through 8) are complete. Phase 9 remains active for release management, production APK stabilization, Git Flow adoption, and final MVP polish.

The core application is built:
- **UI/UX Finalized:** Glassmorphism, Dark/Light reactive themes, native Android keyboard physics, and Sidebar Modal navigation.
- **Data Layer:** SQLite persistence with array-bound varargs for native crash prevention.
- **Release Engineering:** GitHub Actions pipeline generating automated APKs and SHA256 checksums.

`v1.0.0` and `v1.0.1` have been cut. Current work should focus on critical final APK defects and the next patch release.

---

## UI/UX Code Freeze
**IMPORTANT:** The user has explicitly mandated a freeze on UI/UX refactoring.
*"Nosso foco e somente finalizar a UI e lancar a stable agr"*

Do not suggest, build, or implement any further visual design changes unless specifically requested to fix a critical bug.

---

## Future Scope (Post Stable APK Verification)

Once the stable APK is published and verified on physical devices, the project may transition from a traditional chat application into an **Agentic AI Assistant**.

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
