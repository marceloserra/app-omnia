Omnia Strategic Roadmap Review

Context

Omnia is no longer a proof of concept.

The project has evolved into a usable AI application with:

- Local LLM support
- OpenAI-compatible providers
- Conversation history
- Settings management
- Mobile-first UX
- Design system
- Navigation architecture
- Daily usage by the primary stakeholder

The objective moving forward is not to accumulate features.

The objective is to evolve Omnia into an AI Workspace and eventually an AI Operating Environment while preserving stability and usability.

⸻

Product Vision

Current State

Today Omnia behaves as:

Chat Application

The user sends text.

The model returns text.

⸻

Target State

Omnia should evolve into:

AI Workspace

Where users interact with:

- Conversations
- Knowledge
- Documents
- Images
- Tools
- Capabilities
- Workspaces
- Agents

⸻

Long-Term State

Eventually Omnia may become:

AI Operating Environment

A unified interface for:

- Local AI
- Cloud AI
- Personal Knowledge
- Capabilities
- Automation
- Agent Orchestration

⸻

Roadmap Review

Phase 10 — Multi-Modal Attachments

Priority

HIGH

Goal

Transform Omnia from:

Text → Text

Into:

Image → Model
PDF → Model
Camera → Model

User Value

Immediate.

Users can interact with:

- Contracts
- Invoices
- Receipts
- Diagrams
- Screenshots
- Photos
- Reports

Deliverables

attachments/
image-preview/
pdf-preview/
camera-capture/
file-picker/

Success Criteria

Users can attach and inspect files naturally.

The attachment workflow feels native and mobile-first.

⸻

Phase 11 — Knowledge Base

Important Principle

Do NOT expose the term:

RAG

to end users.

Users care about:

My Knowledge

not about retrieval architecture.

UX Concept

Knowledge Base
├── PDFs
├── Markdown
├── Notes
├── Websites
└── Documents

Internal Implementation

Embeddings
Chunking
SQLite
Vector Search
Retrieval

Goal

Allow users to build persistent knowledge collections that can be queried from any conversation.

Success Criteria

A user can upload documents and naturally ask:

What does my document say about X?

without understanding any RAG concepts.

⸻

Phase 12 — Tool Calling

Goal

Enable models to execute actions.

Examples

Web Search
Calculator
Weather
Filesystem
Email
WhatsApp
Shell
Calendar

Architecture Recommendation

Create a dedicated layer:

tools/

Each tool should expose:

Inputs
Outputs
Permissions
Error Handling
Metadata

Success Criteria

Tools can be added without modifying core chat architecture.

⸻

Phase 12.5 — Skills & Capabilities

New Proposed Phase

Before MCP.

Before Agents.

Motivation

Capabilities are reusable building blocks.

Examples:

WhatsApp Messaging
Email Sending
Filesystem Access
Calendar Integration
Knowledge Retrieval
Web Search
Weather Queries

Architecture

capabilities/
registry/
contracts/

Goal

Capabilities should be reusable by:

- Chat
- Tools
- Agents
- MCP Servers
- Future workflows

Success Criteria

Capabilities exist independently from the execution layer.

⸻

Phase 13 — Workspaces

New Proposed Phase

Goal

Create context isolation.

Examples:

Workspace: ENEM
Workspace: Orbitarium
Workspace: AI Research Lab
Workspace: Personal

Each Workspace Contains

Knowledge
Chats
Files
Capabilities
Settings
Agents

Inspiration

- Claude Projects
- ChatGPT Projects

Differentiator

Local-first architecture.

Success Criteria

Users can organize different domains of work without context pollution.

⸻

Phase 14 — Model Context Protocol (MCP)

Recommendation

Implement only after:

- Knowledge Base
- Tool Calling
- Capabilities
- Workspaces

Reason

MCP provides value primarily to developers and advanced users.

End users care about outcomes, not protocol layers.

Evaluation Questions

Before implementation answer:

- What problem does MCP solve today?
- Which capabilities require MCP?
- Which workflows become easier with MCP?

Success Criteria

MCP enables reuse and interoperability rather than introducing complexity.

⸻

Phase 15 — Voice

Split Into Three Stages

Phase 15A — Speech To Text

Goal

Allow users to speak.

Technology

- Whisper
- Whisper.cpp
- Cloud providers

Value

Very high.

Complexity

Moderate.

⸻

Phase 15B — Text To Speech

Goal

Allow Omnia to answer with audio.

Value

High.

Complexity

Moderate.

⸻

Phase 15C — Realtime Voice

Goal

Natural voice conversations.

Value

High.

Complexity

Very high.

Recommendation

Treat this as a separate initiative.

⸻

Phase 16 — Multi-Agent Delegation

Important Question

Do not implement agents because agents are trendy.

Implement agents only when they solve real problems.

Questions To Answer

- What tasks require delegation?
- What tasks cannot be solved using tools?
- What tasks benefit from planning and orchestration?

Candidate Architecture

Planner Agent
Research Agent
Execution Agent
Review Agent

Recommendation

Only pursue after:

- Tools
- Capabilities
- Knowledge Base
- Workspaces

are mature.

Success Criteria

Agents solve real user problems rather than demonstrating technology.

⸻

Product Stability Rules

Main Branch Rule

The default branch must always represent a usable product.

⸻

Feature Isolation Rule

All experimental work must happen in:

feature/\*

branches.

Examples:

feature/voice
feature/mcp
feature/workspaces
feature/rag

⸻

Daily Driver Rule

After every merge:

The author should still want to use Omnia daily.

If a feature degrades usability:

Do not merge it.

⸻

Recommended Execution Order

Phase 10 - Attachments
Phase 11 - Knowledge Base
Phase 12 - Tool Calling
Phase 12.5 - Skills & Capabilities
Phase 13 - Workspaces
Phase 14 - MCP
Phase 15 - Voice
Phase 16 - Multi-Agent

⸻

Long-Term Vision

If executed correctly, Omnia should evolve from:

Chat Application

to:

AI Workspace

and eventually:

AI Operating Environment

where users can interact with:

- Models
- Knowledge
- Documents
- Tools
- Capabilities
- Agents
- Automation

through a single unified experience.

The ultimate goal is not to build another chat client.

The ultimate goal is to create the best interface for interacting with local and remote AI systems.
