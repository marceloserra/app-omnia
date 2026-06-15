# Omnia — Phase 1: Monorepo Foundation

**Date:** 2026-06-15  
**Status:** Draft — awaiting approval  
**Next Phase:** Phase 2 — Domain Models & Provider Abstraction  

---

## Product Context

**Name:** Omnia  
**Tagline:** One app. Every model.  
**Vision:** Universal AI client for mobile. Connect to local and cloud LLMs from one application. Clean, modern, ChatGPT-like experience.  
**License:** MIT  

---

## Complete Monorepo Structure (Future State)

```
omnia/
├── apps/
│   ├── mobile/          # React Native + Expo + TypeScript
│   └── web/             # Placeholder (future phase, not MVP)
├── packages/
│   ├── core/            # Business logic, chat engine
│   ├── providers/       # Provider implementations
│   ├── shared-types/    # Domain models, Zod schemas
│   ├── storage/         # SQLite persistence layer
│   └── ui/              # Shared UI components
├── docs/
│   ├── adr/             # Architecture Decision Records
│   └── architecture/    # Architecture overview
├── .github/workflows/   # CI: lint, type-check, test
├── package.json         # Root scripts (Turborepo)
├── pnpm-workspace.yaml  # Workspace definition
├── turbo.json           # Task orchestration
└── tsconfig.root.json   # Shared TypeScript config
```

---

## Technology Stack (Locked)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Mobile Framework | **React Native via Expo SDK 56** | Latest stable, best monorepo support |
| Package Manager | **pnpm with `hoisted` nodeLinker** | Required for RN libraries in Expo monorepos |
| Task Orchestrator | **Turborepo** | Fast, Expo-native ecosystem, minimal config |
| Navigation | **Expo Router** | File-based routing, native deep linking |
| Styling | **NativeWind v4.1 (stable)** | Tailwind in RN; v5 is preview — risk on production |
| State Management | **Zustand** | Lightweight, no boilerplate |
| Data Fetching | **TanStack Query** | Standard for React ecosystem |
| Persistence | **SQLite via expo-sqlite** | Structured local data, relational queries |
| Validation | **Zod** | Runtime type validation, schema-first |
| Testing | **Vitest + React Native Testing Library** | Fast, modern test runner |
| CI/CD | **GitHub Actions** | Industry standard, free tier sufficient |

---

## Versioning & Release Strategy

**Semantic Versioning (SemVer):** `MAJOR.MINOR.PATCH`

**Pre-release tags:** `-alpha`, `-beta`, `-rc`

| Milestone | Version | Meaning |
|-----------|---------|---------|
| Phase 1 — Foundation | `0.1.0-alpha` | Monorepo scaffolded, tooling verified |
| Phase 2–3 — Providers | `0.2.0-alpha` | Provider abstraction + implementations working |
| MVP Complete | `1.0.0-beta` | All MVP features functional, ready for testing |
| First Release | `1.0.0` | Production-ready mobile app |

**Changelog:** Standard Changelog CLI — automatic from conventional commits. Zero manual maintenance. Single command generates changelog per version bump.

Commits follow: `type(scope): subject` format (imperative mood), aligned with AI Engineering Playbook git conventions.

---

## Phase 1: Monorepo Foundation — Agent Task List

### Step 1 — Root Configuration Files

**Owner:** Orchestrator  
**Status:** Pending  

Create:
- `pnpm-workspace.yaml` — define `apps/*`, `packages/*` workspaces
- Root `package.json`:
  - name: `omnia`
  - version: `0.1.0-alpha`
  - private: true
  - devDependencies: TypeScript, eslint, Turborepo, standard-changelog
  - scripts: `dev` (turbo run dev), `lint` (turbo run lint), `typecheck` (turbo run typecheck), `test` (turbo run test)
- `turbo.json`:
  - tasks: `build`, `lint`, `typecheck`, `test`, `dev`
  - `^hash` for dependency ordering
  - Output caching enabled

### Step 2 — TypeScript Configuration

**Owner:** Orchestrator  
**Status:** Pending  

Create `tsconfig.root.json`:
- strict: true
- target: ESNext
- moduleResolution: bundler
- baseUrl relative paths
- compilerOptions shared across packages

Each package extends this root config.

### Step 3 — CI/CD Pipeline

**Owner:** Orchestrator  
**Status:** Pending  

Create `.github/workflows/ci.yml`:
- Trigger: push to `main`, pull requests
- Jobs:
  - **lint**: eslint via pnpm
  - **typecheck**: tsc --noEmit per package
  - **test**: vitest run
- Runner: ubuntu-latest
- Setup: actions/checkout + pnpm setup

### Step 4 — Mobile App Scaffold

**Owner:** @fixer  
**Status:** Pending  

Run `npx create-expo-app@latest apps/mobile --template expo-template-blank-typescript`

Configure:
1. **NativeWind v4.1**:
   - Install `nativewind`, `tailwindcss`
   - Create `tailwind.config.js` with `nativewind/preset`
   - Update babel config: `jsxImportSource: "nativewind"` + `"nativewink/babel"` preset
   - Metro config: wrap with `withNativeWind` from nativewind/metro
   - Create `apps/mobile/assets/css/global.css` with `@tailwind base; @tailwind components; @tailwind utilities;`
   - Import CSS in `_layout.tsx`

2. **Expo Router**:
   - Install `expo-router`
   - Replace default app structure with router-based navigation
   - Create minimal `_layout.tsx` and `(auth)` group placeholder

3. **Package.json for apps/mobile**:
   - Dependencies: react-native, expo, nativewind, expo-router, zustand, @tanstack/react-query, zod
   - Scripts: `dev`, `lint`, `typecheck`, `test`

### Step 5 — Shared Types Package

**Owner:** @fixer  
**Status:** Pending  

Create `packages/shared-types/`:
- `package.json`: name `@omnia/shared-types`, TypeScript, Zod as deps
- `tsconfig.json`: extends root config
- `src/index.ts`: empty exports barrel
- `src/types/` directory structure ready for domain models

### Step 6 — Documentation Structure

**Owner:** Orchestrator  
**Status:** Pending  

Create:
- `docs/adr/.gitkeep`
- `docs/architecture/.gitkeep`
- Root `README.md`: project overview, monorepo structure, quick start commands
- Root `CHANGELOG.md`: initial entry for `0.1.0-alpha` via standard-changelog

### Step 7 — Phase 1 ADR

**Owner:** Orchestrator  
**Status:** Pending  

Write `docs/adr/001-monorepo-foundation.md`:
- Decision: Expo SDK 56 + pnpm hoisted + Turborepo + NativeWind v4.1
- Alternatives considered: Vite, yarn/npm, NativeWind v5 preview, Storybook
- Consequences: locked stack, fast iteration path, mobile-first constraint

### Step 8 — Verification

**Owner:** Orchestrator  
**Status:** Pending  

Execute and verify:
1. `pnpm install` — succeeds without errors
2. `npx expo start --no-dev --no-unoptimized` (apps/mobile) — builds successfully
3. `pnpm lint` — no errors
4. `pnpm typecheck` — no errors

---

## Design Decisions

### Why Approach A (Lean Foundation)?

The spec says "avoid speculative architecture" and "every abstraction must justify its existence." Empty packages violate that principle. The monorepo grows organically:
- Phase 1: `apps/mobile`, `packages/shared-types` only
- Phase 2+: create `packages/providers`, `packages/core` when implementations exist
- Phase 5+: create `packages/ui` when shared components emerge

### Why No Storybook?

Single-developer project. The app itself is the best documentation. Storybook adds build config, maintenance burden, and CI cost that delay actual product work. Post-MVP option for `packages/ui`.

### Design Philosophy (For Future @designer Work)

When Phase 5+ reaches UI screens:
- **Reference:** llama.cpp/ui design philosophy — conversation-first, minimal, whitespace, clean typography, fast interactions, streaming-first
- **Goal:** ChatGPT-like feel, NOT Open WebUI complexity
- **Principles:** simplicity over features, mobile first

---

## Agent Handoff Protocol

Each phase records:
1. What was done (completed steps)
2. Why decisions were made (ADR references)
3. What's next (pending steps with context)

A new session reads this spec + agent log and continues from the first pending item.

---

## Next Phase Preview

**Phase 2:** Domain Models & Provider Abstraction
- Define `ConnectionProfile`, `Conversation`, `Message`, `Model`, `Provider` in shared-types
- Create provider interface (`listModels()`, `validateConnection()`, `streamChat()`)
- Implement `OpenAICompatibleProvider` (LM Studio, Ollama, llama.cpp, vLLM, LocalAI, OpenRouter)
