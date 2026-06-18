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

Phase 9: release management, production APK stabilization, Git Flow adoption, and final MVP polish.

## Agent Contract

Repository-level agent instructions live in `AGENTS.md`. Any agent working in this repository must load those instructions before editing files.

## Phase Boundary

Phase 9 must not implement post-MVP capabilities such as RAG, agents, MCP, tool calling, WebFetch, voice, sync, authentication, plugins, or cloud backend features.

Release stabilization may fix production APK defects, release automation, native packaging configuration, documentation, and Phase 9 UI/UX polish.

## Quality Gates

Required checks before release handoff:

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Native Expo bundle verification for iOS and Android
