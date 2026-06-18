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

Once the stable APK is published and verified on physical devices, the project will transition from a traditional chat application into an **Agentic AI Universal Client**, capable of interacting with the physical world, documents, and tools.

> **Inspiration Benchmark:** Agents working on these phases MUST review `/Users/marceloserra/Documents/coding/projects/open-source/llama.cpp/tools/ui` for UI/UX inspiration. It contains excellent implementations for file attachments, MCP server management, and tool-calling UX.

### Phase 10: Multi-Modal Attachments
- **Goal:** Allow users to attach context to their prompts (Images, PDFs, Text files, Camera captures).
- **Tech:** Expo ImagePicker, DocumentPicker, Camera.
- **Reference:** Llama UI `ChatAttachmentsPreview`, `ChatFormFileInputInvisible`.

### Phase 11: Retrieval-Augmented Generation (RAG)
- **Goal:** Allow the LLM to index and retrieve information from attached PDFs and long text documents locally.
- **Tech:** `@omnia/rag` package with local embeddings generation (Xenova/transformers.js or remote OpenAI embeddings), plus local vector search (SQLite `vss` or pure JS cosine similarity).

### Phase 12: WebSearch & Tool Calling
- **Goal:** Enable the LLM to search the web, fetch live data, and use predefined tools.
- **Tech:** Tool calling interfaces (native to OpenAI/Anthropic/llama.cpp). Custom WebFetch proxy or native HTTPS agent to scrape and summarize webpages.

### Phase 13: Model Context Protocol (MCP)
- **Goal:** Full Agentic execution via MCP tools, allowing the app to interact with the device or external services safely.
- **Tech:** Implement native MCP clients so the local or remote LLM can execute device actions (Calendar, Contacts, filesystem, remote APIs).
- **Reference:** Llama UI `McpServerCard`, `McpResourcePreview`, `McpConnectionLogs`.

### Phase 14: Voice & Text-to-Speech (TTS)
- **Goal:** True hands-free conversational interaction.
- **Tech:** Expo Audio, Whisper (local/remote STT), and a TTS engine (OpenAI TTS or local equivalent).

### Phase 15: Multi-Agent Delegation
- **Goal:** Allow the primary LLM to delegate sub-tasks to specialized "Other Agents" (e.g., a "Research Agent" or "Code Agent") operating in the background.
- **Tech:** Background task runner, multi-agent conversation routing within the local SQLite DB.

> **Status:** All future phases (10-15) are currently PENDING. Do not begin implementation until the user explicitly dictates the start of Phase 10.
