# ADR-001: Monorepo Foundation

## Status

Accepted

## Context

Omnia requires a monorepo structure to support multiple packages (mobile app, shared types, providers, storage) with consistent tooling and build processes. The decision is between different package managers and task orchestrators for optimal developer experience.

## Decision

We will use:
- **pnpm** with `hoisted` nodeLinker — Required for React Native libraries in Expo monorepos
- **Turborepo** — Fast, Expo-native ecosystem, minimal config overhead
- **Expo SDK 56** — Latest stable release with best monorepo support
- **NativeWind v4.1 (stable)** — Tailwind CSS integration for React Native; v5 is preview and carries production risk

## Alternatives Considered

- Vite: Excellent for web, but poor React Native support in Expo ecosystem
- yarn/npm: Slower than pnpm, less efficient disk usage, no workspace hoisting by default
- NativeWind v5 preview: Cutting-edge features but unstable for production use
- Storybook: Adds build config complexity and maintenance burden; deferred to post-MVP

## Consequences

- Locked technology stack across all packages
- Fast iteration path with Turborepo caching
- Mobile-first constraint enforced by architecture
- No speculative packages — each package justified by implementation needs

## Tradeoffs

- Expo SDK 56 may require updates as new features emerge (acceptable risk)
- NativeWind v4.1 stable vs v5 preview: stability over cutting-edge features
- Lean foundation means adding packages later costs small setup time now saves maintenance burden on empty scaffolds
