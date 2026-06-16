# Omnia

> One app. Every model.

Universal AI client for mobile. Connect to local and cloud LLMs from one application. Clean, modern, ChatGPT-like experience.

## Status

Current phase: `0.1.0-alpha` foundation.

Phase 1 scope is monorepo setup, tooling, CI/CD, documentation, and quality gates. Product features begin in later phases.

## Monorepo Structure

- `apps/mobile/` - React Native + Expo mobile application
- `apps/web/` - Placeholder documentation for future web expansion
- `packages/shared-types/` - Domain models and Zod schemas
- `packages/core/` - Future business logic and chat orchestration
- `packages/providers/` - Future provider abstraction and implementations
- `packages/storage/` - Future SQLite persistence
- `packages/ui/` - Future shared UI components, only if justified
- `docs/architecture/` - Architecture documentation
- `docs/decisions/` - Playbook-aligned decision records
- `docs/process/` - Quality gates and workflow notes
- `docs/guides/` - Contributor guides

## Quick Start

```bash
pnpm install
pnpm dev
```

## Quality Gates

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Native bundle checks:

```bash
pnpm --filter ./apps/mobile exec expo export --platform ios --output-dir /private/tmp/omnia-ios-export --clear
pnpm --filter ./apps/mobile exec expo export --platform android --output-dir /private/tmp/omnia-android-export --clear
```

## Playbook

Omnia follows the AI Engineering Playbook bootstrap conventions. Agents and contributors must read `AGENTS.md` before making changes.

Key references:

- `MANIFEST.md`
- `AGENTS.md`
- `docs/process/quality-gates.md`
- `docs/references/phase-scope.md`
- `docs/architecture/overview.md`

## License

MIT
