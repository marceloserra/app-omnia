# Omnia Manifest

## Purpose

Omnia is a mobile-first universal AI client for local and cloud-hosted LLMs.

## Playbook Inheritance

This repository follows the AI Engineering Playbook bootstrap conventions from:

- `/Users/marceloserra/Documents/coding/projects/ai-engineering-playbook/bootstrap/bootstrap-prompt.md`

When project requirements and playbook conventions conflict:

- Functional requirements in the Omnia foundation prompt take precedence.
- Engineering conventions from the bootstrap prompt take precedence.

## Active Phase

Phase 1: monorepo foundation, tooling, CI/CD, documentation, and quality gates.

## Agent Contract

Repository-level agent instructions live in `AGENTS.md`. Any agent working in this repository must load those instructions before editing files.

## Phase Boundary

Phase 1 must not implement provider logic, persistence, chat UI, authentication, sync, RAG, agents, MCP, tool calling, plugins, voice, or cloud backend features.

## Quality Gates

Required checks before Phase 1 completion:

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Native Expo bundle verification for iOS and Android
