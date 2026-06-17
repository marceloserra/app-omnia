# Agent Instructions

## Read Order

Before changing this repository, read these files in order:

1. `MANIFEST.md`
2. `docs/references/phase-scope.md`
3. `docs/process/quality-gates.md`
4. `docs/architecture/overview.md`
5. Relevant ADRs in `docs/decisions/`
6. Area-specific `AGENTS.md` files, such as `apps/mobile/AGENTS.md`

## Source Of Truth

Omnia follows the local AI Engineering Playbook:

- `/Users/marceloserra/Documents/coding/projects/ai-engineering-playbook/bootstrap/bootstrap-prompt.md`

If instructions conflict:

- Omnia functional requirements take precedence.
- Playbook engineering conventions take precedence.
- Area-specific `AGENTS.md` files refine these rules for their subtree.

## Current Phase

Active phase: Phase 7 (UX Polish & Advanced Chat).

Allowed work:

- Markdown parsing and Code block highlighting
- Haptic feedback (Taptic Engine)
- Copy to clipboard & Retry message actions
- "Stop generating" functionality
- Auto-scroll floating button

Disallowed Phase 7 work:

- Provider implementations (already done)
- SQLite persistence (already done)
- Authentication, sync, cloud backend, MCP, agents, RAG, tool calling, plugins, voice, or workflows

## Architecture Rules

- Keep the app mobile-first. Do not build web implementation during MVP.
- Do not couple screens to provider-specific APIs.
- Keep future packages as documentation-only until their phase starts.
- Do not use AsyncStorage as primary persistence for providers, conversations, or messages.
- Every new abstraction must be justified by current phase requirements.

## Engineering Rules

- Use pnpm workspaces and Turborepo root scripts.
- Keep `pnpm-lock.yaml` synchronized with package changes.
- Keep CI commands aligned with root scripts.
- Add ADRs for structural or technology decisions.
- Update documentation in the same change as behavior or workflow changes.
- Prefer small, phase-bounded changes over broad scaffolding.
- **AI Telemetry:** If the user reports a crash or bug during development, ALWAYS check `omnia-telemetry.jsonl` at the root of the project to read the structured stack trace before asking the user for logs. (See `docs/architecture/ai-telemetry.md`).

## Verification

Before handing off foundation work, run:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
```

For native app changes, also run:

```bash
pnpm --filter ./apps/mobile exec expo export --platform ios --output-dir /private/tmp/omnia-ios-export --clear
pnpm --filter ./apps/mobile exec expo export --platform android --output-dir /private/tmp/omnia-android-export --clear
```

If a command cannot be run, document the reason and the risk.

