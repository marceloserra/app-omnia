# Quality Gates

## Purpose

Define the checks required before an Omnia phase is considered complete.

## Branch Gate

All code changes must follow `docs/process/git-flow.md`.

- Work branches (`feature/*`, `bugfix/*`, `chore/*`, `docs/*`) target `develop`.
- Release stabilization branches (`release/vX.Y.Z`) branch from `develop` and merge to `main` only when ready to tag.
- Emergency production fixes use `hotfix/*` from `main`, then back-merge to `develop`.
- Defects found in an already released artifact that block critical production behavior must use `hotfix/*`, target `main`, receive a patch tag from `main`, and then be back-merged into `develop`.
- Agents and contributors must not commit directly to `main` or `develop`.

## CI Coverage

| Workflow | Trigger | Covered branches |
| --- | --- | --- |
| `.github/workflows/branch-validation.yml` | Push | `feature/**`, `bugfix/**`, `hotfix/**`, `chore/**`, `docs/**`, `release/**`, `develop` |
| `.github/workflows/pr-validation.yml` | Pull request | PRs targeting `develop`, `main`, or `release/**` |
| `.github/workflows/main-validation.yml` | Push | `main` |
| `.github/workflows/hotfix-backmerge.yml` | Merged pull request | `hotfix/**` PRs merged into `main` |
| `.github/workflows/release-apk.yml` | Tag push | `v*.*.*` |

`feature/**` is validated twice when used normally: once on branch push through Branch Validation, and once when opened as a PR to `develop` through PR Validation.

## Release Handoff Gates

| Gate | Command or Evidence | Required Result |
|------|---------------------|-----------------|
| Dependency reproducibility | `pnpm install --frozen-lockfile` | Lockfile installs without mutation |
| Lint | `pnpm lint` | No lint errors |
| Typecheck | `pnpm typecheck` | No TypeScript errors |
| Tests | `pnpm test` (using Jest for mobile) | Test command exits successfully |
| iOS bundle | `pnpm --filter ./apps/mobile exec expo export --platform ios --output-dir /private/tmp/omnia-ios-export --clear` | Bundle completes |
| Android bundle | `pnpm --filter ./apps/mobile exec expo export --platform android --output-dir /private/tmp/omnia-android-export --clear` | Bundle completes |

For native packaging changes that affect the final APK, also verify the release build path documented in `docs/architecture/release-strategy.md`.

## Phase Completion Rule

Do not begin the next implementation phase until the current phase gates pass or an exception is documented with rationale and mitigation.

## Agent Handoff

Agents must record failed or skipped gates in their final response with the command, failure reason, and residual risk.
