# Phase Scope Reference

## Purpose

Keep implementation work aligned with the Omnia foundation prompt.

## Agent Rule

Agents must not implement work from a later phase unless the user explicitly advances the active phase.
*Crucially, this means no "mock UIs" or placeholder scaffolding for features belonging to future phases (e.g., no mock chat interfaces during Phase 1).*

## Phase 1

- Monorepo foundation
- Tooling
- CI/CD
- Documentation
- Quality gates

## Phase 2

- Design Foundation
- Theme System & Design Tokens
- Storybook Setup
- Primitive & Composed UI Components

## Phase 3 (Completed)

- Domain models
- Shared types
- Provider abstraction
- OpenAI provider
- OpenAI-compatible provider

## Phase 4 (Completed)

- SQLite persistence

## Phase 5 (Completed)

- Chat interface

## Phase 6 (Completed)

- Provider management

## Phase 7 (Completed — UX Polish & Advanced Chat)

- Markdown parsing and Code block highlighting (custom CodeBlock, no external crash-prone lib)
- Haptic feedback (Taptic Engine) on all key interactions
- Copy to clipboard & Retry message actions (long-press bubbles)
- "Stop generating" functionality (square button aborts stream)
- Auto-scroll floating FAB button
- FAANG Drawer Navigation (hamburger → conversation history, home = new chat)
- Android keyboard fix (pan mode + KeyboardAvoidingView padding)
- NativeWind permanently removed; all styling via pure `StyleSheet.create`

## Phase 8 (Conversation Management — Next)

- Swipe-to-delete individual conversations (with undo toast)
- Long-press context menu: Rename and Delete
- Delete All History (Settings danger zone + Alert confirmation)
- Sidebar search/filter by conversation title
- Conversation date grouping: Today / Yesterday / Last 7 days / Older

## Phase 9 (Release Management & Premium UI Pivot — ACTIVE)

- Pivot architecture to Home-based Tab Navigation (replacing legacy Drawer)
- Floating Glassmorphism Tab Bar (visionOS/Apple HIG aesthetic)
- Dynamic icons in Model Picker (OpenAI, Meta, Mistral, Google, etc.)
- SectionList bucketing for Chat History ("Today", "Yesterday", etc.)
- Full UI/UX refactoring for Theme and Language injection
- Release Engineering Strategy and Pipelines (PR, Main, Release APK/SHA256)

## Non Goals

Do not implement MCP, agents, RAG, tool calling, function calling, voice, sync, authentication, cloud backend, workflows, plugins, or multi-device synchronization for MVP.
