# ADR-0002: Agent Operating Contract

**Status:** Accepted
**Date:** 2026-06-15
**Author:** Omnia maintainers

## Context

Omnia is expected to be developed by multiple AI agents over time. Without a repository-level contract, agents can drift across phases, implement future-scope features too early, or skip quality gates.

## Options Considered

1. Keep instructions only in prompts - Flexible, but easy to lose across sessions.
2. Keep instructions only in README - Visible, but mixed with contributor onboarding.
3. Add root `AGENTS.md` plus area-specific files - Explicit, discoverable, and compatible with agent workflows.

## Decision

Add root `AGENTS.md` as the required read-before-editing contract. Area-specific `AGENTS.md` files may add constraints for their subtree.

## Consequences

### Positive

- Future agents have a stable entry point for repository rules.
- Phase boundaries are harder to miss.
- Quality gate expectations are visible before implementation.

### Negative

- Agent instructions must be kept synchronized with phase changes.
- Overly broad rules could slow small fixes if not maintained.

## Monitoring

Review `AGENTS.md` at the end of every phase and update active phase, allowed work, disallowed work, and quality gates.

