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

> **Inspiration Benchmark:** Agents MUST review `/Users/marceloserra/Documents/coding/projects/open-source/llama.cpp/tools/ui` for UI/UX inspiration on attachments, capabilities, and MCP execution.

### Phase 10: Multi-Modal Attachments
- **Goal:** Image → Model, PDF → Model, Camera → Model.
- **Value:** Interact naturally with contracts, invoices, screenshots.

### Phase 11: Knowledge Base
- **Goal:** Persistent knowledge collections ("My Knowledge" - do not use the term RAG).
- **Tech:** Local embeddings, chunking, SQLite vector search.

### Phase 12: Tool Calling
- **Goal:** Enable models to execute actions (Web Search, Calculator, Shell).

### Phase 12.5: Skills & Capabilities
- **Goal:** Reusable building blocks independent of the execution layer.
- **Tech:** `capabilities/`, `registry/`, `contracts/`.

### Phase 13: Workspaces
- **Goal:** Context isolation (e.g., Personal, Orbitarium, Work).
- **Tech:** Local-first architecture isolating chats, files, and agents per domain.

### Phase 14: Model Context Protocol (MCP)
- **Goal:** Developer-centric reuse and interoperability (only after Tools and Workspaces are mature).

### Phase 15: Voice
- **15A:** Speech To Text (Whisper)
- **15B:** Text To Speech
- **15C:** Realtime Voice (Separate Initiative)

### Phase 16: Multi-Agent Delegation
- **Goal:** Solve complex problems via Planner, Researcher, and Execution agents.

> **Status:** All future phases (10-16) are currently PENDING. Do not begin implementation until the user explicitly dictates the start of Phase 10.
> **Daily Driver Rule:** Experimental work MUST happen in `feature/*` branches. Merging to `develop` must never degrade the core daily usability.
