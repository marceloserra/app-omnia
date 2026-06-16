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

## Phase 2 (Active)

- Design Foundation
- Theme System & Design Tokens
- Storybook Setup
- Primitive & Composed UI Components

## Phase 3

- Domain models
- Shared types
- Provider abstraction

- OpenAI provider
- OpenAI-compatible provider

## Phase 4

- SQLite persistence

## Phase 5

- Chat interface

## Phase 6

- Provider management

## Non Goals

Do not implement MCP, agents, RAG, tool calling, function calling, voice, sync, authentication, cloud backend, workflows, plugins, or multi-device synchronization for MVP.
