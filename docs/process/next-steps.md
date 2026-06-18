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

## Future Scope: The AI Workspace Evolution

Once the stable APK is published and verified on physical devices, the project will transition from a traditional chat application into an **AI Workspace** and eventually an **AI Operating Environment**.

For full strategic details, read `docs/roadmap/strategic-roadmap-review.md`.

> **Inspiration Benchmark:** Agents MUST review world-class FAANG UIs (ChatGPT, Claude, Apple Intelligence) and open-source benchmarks like `/Users/marceloserra/Documents/coding/projects/open-source/llama.cpp/tools/ui` for UX inspiration. The goal is a premium, zero-friction experience for attachments, capabilities, and tool execution.

### Phase 10: Multi-Modal Attachments
- **Goal:** Image → Model, PDF → Model, Camera → Model.
- **Value:** Interact naturally with contracts, invoices, screenshots.
- **Inspiration:** ChatGPT/Claude attachment pill UI, Apple Messages camera integration, and Llama.cpp attachment menus.

### Phase 11: Voice (Microphone / STT)
- **Goal:** Allow users to speak to the model instead of typing.
- **Tech Options:** 
  - *Native/Free:* `SFSpeechRecognizer` (iOS) & `SpeechRecognizer` (Android) — Zero cost, works offline.
  - *Modern/LLM-grade:* Whisper API (via Groq for 0 latency free-tier) or Whisper.cpp (local execution).

### Phase 12: WebSearch
- **Goal:** Enable the LLM to search the web and fetch live data.
- **Tech Options:**
  - *100% Free:* DuckDuckGo HTML scraping proxy (zero API keys).
  - *Agentic/Free-Tier:* Tavily API (built for LLMs, 1000 free searches/month) or Brave Search API.

### Phase 13: Knowledge Base
- **Goal:** Persistent knowledge collections ("My Knowledge").
- **Tech:** Local embeddings, chunking, SQLite vector search.

### Phase 14: Skills & Capabilities
- **Goal:** Reusable building blocks independent of the execution layer.
- **Tech:** `capabilities/`, `registry/`, `contracts/`.

### Phase 15: Workspaces
- **Goal:** Context isolation (e.g., Personal, Orbitarium, Work).
- **Tech:** Local-first architecture isolating chats, files, and agents per domain.

### Phase 16: Model Context Protocol (MCP) & Multi-Agent
- **Goal:** Developer-centric reuse and complex problem solving via Planner, Researcher, and Execution agents.

> **Status:** All future phases (10-16) are currently PENDING. Do not begin implementation until the user explicitly dictates the start of Phase 10.
> **Daily Driver Rule:** Experimental work MUST happen in `feature/*` branches. Merging to `develop` must never degrade the core daily usability.
