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

## Phase 7 (UX Polish & Advanced Chat - Active)

- Markdown parsing and Code block highlighting
- Haptic feedback (Taptic Engine)
- Copy to clipboard & Retry message actions
- "Stop generating" functionality
- Auto-scroll floating button

## Non Goals

Do not implement MCP, agents, RAG, tool calling, function calling, voice, sync, authentication, cloud backend, workflows, plugins, or multi-device synchronization for MVP.
