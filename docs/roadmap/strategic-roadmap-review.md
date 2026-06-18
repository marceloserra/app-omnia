# Omnia Strategic Roadmap Review

## Context

Omnia is no longer a proof of concept.
The project has evolved into a usable AI application with:
* Local LLM support
* OpenAI-compatible providers
* Conversation history
* Settings management
* Mobile-first UX
* Design system
* Navigation architecture
* Daily usage by the primary stakeholder

The objective moving forward is not to accumulate features.
The objective is to evolve Omnia into an **AI Workspace** and eventually an **AI Operating Environment** while preserving stability and usability.

---

## Product Vision

### Current State
Today Omnia behaves as a **Chat Application**.
The user sends text. The model returns text.

### Target State
Omnia should evolve into an **AI Workspace**.
Where users interact with:
* Conversations
* Knowledge
* Documents
* Images
* Tools
* Capabilities
* Workspaces
* Agents

### Long-Term State
Eventually Omnia may become an **AI Operating Environment**.
A unified interface for:
* Local AI
* Cloud AI
* Personal Knowledge
* Capabilities
* Automation
* Agent Orchestration

---

## Roadmap Review

### Phase 10 — Multi-Modal Attachments
**Priority:** HIGH
**Goal:** Transform Omnia from Text → Text into Image/PDF/Camera → Model.
**User Value:** Immediate. Users can interact with contracts, invoices, receipts, diagrams, screenshots, photos, reports.
**Deliverables:** `attachments/`, `image-preview/`, `pdf-preview/`, `camera-capture/`, `file-picker/`.
**Success Criteria:** Users can attach and inspect files naturally. The attachment workflow feels native and mobile-first.

### Phase 11 — Knowledge Base
**Important Principle:** Do NOT expose the term "RAG" to end users. Users care about "My Knowledge", not about retrieval architecture.
**UX Concept:** Knowledge Base containing PDFs, Markdown, Notes, Websites, Documents.
**Internal Implementation:** Embeddings, Chunking, SQLite, Vector Search, Retrieval.
**Goal:** Allow users to build persistent knowledge collections that can be queried from any conversation.
**Success Criteria:** A user can upload documents and naturally ask: "What does my document say about X?" without understanding any RAG concepts.

### Phase 12 — Tool Calling
**Goal:** Enable models to execute actions (e.g., Web Search, Calculator, Weather, Filesystem, Email, WhatsApp, Shell, Calendar).
**Architecture Recommendation:** Create a dedicated layer: `tools/`. Each tool should expose Inputs, Outputs, Permissions, Error Handling, Metadata.
**Success Criteria:** Tools can be added without modifying core chat architecture.

### Phase 12.5 — Skills & Capabilities (New)
**Motivation:** Capabilities are reusable building blocks. They must exist before MCP and before Agents.
**Goal:** Capabilities should be reusable by Chat, Tools, Agents, MCP Servers, and future workflows.
**Architecture:** `capabilities/`, `registry/`, `contracts/`.
**Success Criteria:** Capabilities exist independently from the execution layer.

### Phase 13 — Workspaces (New)
**Goal:** Create context isolation (e.g., ENEM, Orbitarium, AI Research Lab, Personal).
**Inspiration:** Claude Projects, ChatGPT Projects.
**Differentiator:** Local-first architecture.
**Success Criteria:** Users can organize different domains of work without context pollution. Each workspace contains its own Knowledge, Chats, Files, Capabilities, Settings, and Agents.

### Phase 14 — Model Context Protocol (MCP)
**Recommendation:** Implement only after Knowledge Base, Tool Calling, Capabilities, and Workspaces.
**Reason:** MCP provides value primarily to developers. End users care about outcomes, not protocol layers.
**Success Criteria:** MCP enables reuse and interoperability rather than introducing complexity.

### Phase 15 — Voice (Split Stage)
- **Phase 15A — Speech To Text:** Allow users to speak (Whisper/Cloud). Value: Very high.
- **Phase 15B — Text To Speech:** Allow Omnia to answer with audio. Value: High.
- **Phase 15C — Realtime Voice:** Natural voice conversations. Value: High. Complexity: Very high (treat as separate initiative).

### Phase 16 — Multi-Agent Delegation
**Important Question:** Do not implement agents because they are trendy. Implement them only when they solve real problems.
**Candidate Architecture:** Planner Agent, Research Agent, Execution Agent, Review Agent.
**Recommendation:** Only pursue after Tools, Capabilities, Knowledge Base, and Workspaces are mature.
**Success Criteria:** Agents solve real user problems rather than demonstrating technology.

---

## Product Stability Rules

1. **Main Branch Rule:** The default branch (`main`) must always represent a usable product.
2. **Feature Isolation Rule:** All experimental work must happen in `feature/*` branches (e.g., `feature/voice`, `feature/mcp`).
3. **Daily Driver Rule:** After every merge, the author should still want to use Omnia daily. If a feature degrades usability, do not merge it.

---

## Recommended Execution Order
- Phase 10 - Attachments
- Phase 11 - Knowledge Base
- Phase 12 - Tool Calling
- Phase 12.5 - Skills & Capabilities
- Phase 13 - Workspaces
- Phase 14 - MCP
- Phase 15 - Voice
- Phase 16 - Multi-Agent
