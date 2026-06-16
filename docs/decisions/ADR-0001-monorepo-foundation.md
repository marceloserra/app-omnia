# ADR-0001: Monorepo Foundation

**Status:** Accepted
**Date:** 2026-06-15
**Author:** Omnia maintainers

## Context

Omnia needs a mobile-first foundation that supports iOS and Android now, allows future web expansion, and keeps provider logic isolated from application screens.

## Options Considered

1. Expo monorepo with pnpm and Turborepo - Best fit for React Native, workspace tooling, and a single-developer workflow.
2. Vite or web-first monorepo - Strong web tooling, but misaligned with Phase 1 mobile targets.
3. Empty full platform scaffold - Matches the future structure, but creates speculative packages before boundaries are proven.

## Decision

Use Expo SDK 56, Expo Router, TypeScript, NativeWind, pnpm workspaces with hoisted linker, and Turborepo. Create only lightweight placeholder documentation for future app/package areas until their implementation phase begins.

## Consequences

### Positive

- Mobile development starts from the target platform.
- Root commands and CI can validate the whole workspace.
- Future packages have named ownership without premature implementation.

### Negative

- Some future package directories are documentation-only during Phase 1.
- Web is intentionally non-runnable until a future phase.

## Monitoring

Review this decision at the end of Phase 2, when domain models and provider abstraction create real package boundaries.

