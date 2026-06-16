# Quality Gates

## Purpose

Define the checks required before an Omnia phase is considered complete.

## Phase 1 Gates

| Gate | Command or Evidence | Required Result |
|------|---------------------|-----------------|
| Dependency reproducibility | `pnpm install --frozen-lockfile` | Lockfile installs without mutation |
| Lint | `pnpm lint` | No lint errors |
| Typecheck | `pnpm typecheck` | No TypeScript errors |
| Tests | `pnpm test` | Test command exits successfully |
| iOS bundle | `pnpm --filter ./apps/mobile exec expo export --platform ios --output-dir /private/tmp/omnia-ios-export --clear` | Bundle completes |
| Android bundle | `pnpm --filter ./apps/mobile exec expo export --platform android --output-dir /private/tmp/omnia-android-export --clear` | Bundle completes |

## Phase Completion Rule

Do not begin the next implementation phase until the current phase gates pass or an exception is documented with rationale and mitigation.

## Agent Handoff

Agents must record failed or skipped gates in their final response with the command, failure reason, and residual risk.
