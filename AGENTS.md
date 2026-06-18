# Agent Instructions

## Read Order

Before changing this repository, read these files in order:

1. `MANIFEST.md`
2. `docs/references/phase-scope.md`
3. `docs/process/quality-gates.md`
4. `docs/process/git-flow.md`
5. `docs/architecture/overview.md`
6. Relevant ADRs in `docs/decisions/`
7. Area-specific `AGENTS.md` files, such as `apps/mobile/AGENTS.md`

## Source Of Truth

Omnia follows the local AI Engineering Playbook:

- `/Users/marceloserra/Documents/coding/projects/ai-engineering-playbook/bootstrap/bootstrap-prompt.md`

If instructions conflict:

- Omnia functional requirements take precedence.
- Playbook engineering conventions take precedence.
- Area-specific `AGENTS.md` files refine these rules for their subtree.

## Current Phase

Active phase: **Phase 9 ACTIVE**

### Phase 9 — Release Management (In Progress)

**Completed:**
- Defined Release Engineering Strategy (`docs/architecture/release-strategy.md`).
- Implemented Branch Validation Pipeline (`.github/workflows/branch-validation.yml`).
- Implemented PR Validation Pipeline (`.github/workflows/pr-validation.yml`).
- Implemented Main Validation Pipeline (`.github/workflows/main-validation.yml`).
- Implemented automated Release APK Pipeline with APK & SHA256 generation (`.github/workflows/release-apk.yml`).
- Implemented Hotfix Back-Merge automation (`.github/workflows/hotfix-backmerge.yml`).
- Cut patch release `v1.0.1` (CI fixes, cleartext HTTP, bugfixes).
- Cut patch release `v1.0.2`.

**Remaining / Adjusted:**
- Full UI/UX refactoring for Theme and Language injection across all components.
- Patch release stabilization for final APK defects.
- Git Flow adoption for all future changes.

Disallowed in Phase 9:
- RAG, Tool Calling, MCP, WebFetch, Voice.

## Architecture Rules

- Keep the app mobile-first. Do not build web implementation during MVP.
- Do not couple screens to provider-specific APIs.
- Keep future packages as documentation-only until their phase starts.
- Do not use AsyncStorage as primary persistence for providers, conversations, or messages.
- Every new abstraction must be justified by current phase requirements.

## Engineering Rules

- Follow `docs/process/git-flow.md`: no direct commits to `main`; use `develop`, `release/vX.Y.Z`, and scoped work branches.
- Use pnpm workspaces and Turborepo root scripts.
- Keep `pnpm-lock.yaml` synchronized with package changes.
- Keep CI commands aligned with root scripts.
- **Use the release notes template in `docs/architecture/release-strategy.md`** when creating annotated tags or GitHub Release descriptions. Draft from `CHANGELOG.md [Unreleased]`, commits since the previous tag, and merged PRs; do not publish raw commit output as final release notes.
- Add ADRs for structural or technology decisions.
- Update documentation in the same change as behavior or workflow changes.
- Update `CHANGELOG.md` in the same change for user-facing behavior, bug fixes, release workflow changes, CI/CD changes, architecture/process changes, and dependency changes. If no changelog entry is needed, state why in the PR.
- When editing documentation or process files, fix directly related documentation divergences in the same change. If a divergence is real but outside the current scope, call it out in the handoff instead of leaving it silent.
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
