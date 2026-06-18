# Executive Summary

<!-- 2-4 bullets. State the customer/developer outcome, not the implementation trivia. -->

<!-- Replace this comment with concrete bullets before requesting review. -->

## Context

<!-- Why does this PR exist? Link the issue, release blocker, incident, phase requirement, or user report. Include constraints that shaped the solution. -->

<!--
- Problem:
- Impact:
- Constraints:
- Out of scope:
-->

## Review Strategy

<!-- Tell reviewers how to read this PR efficiently. Point to the highest-signal files first. -->

<!--
1. Highest-signal file or area to review first.
2. Next most important area.
3. Tests, docs, or rollout details to inspect last.
-->

## Key Changes

<!-- Group by area. Keep bullets concrete and reviewable. -->

### Product Behavior

<!-- Replace with user-visible behavior changes. Write "None." if not applicable. -->

### Implementation

<!-- Replace with implementation changes. -->

### Documentation and Process

<!-- Replace with documentation and process changes. Write "None." if not applicable. -->

## Architecture and Decisions

<!-- Required for native config, workflows, package boundaries, persistence, provider contracts, navigation, shared abstractions, or security posture. Otherwise write "None." -->

<!--
- Decision record:
- Architectural impact:
- Invariants preserved:
- Alternatives considered:
- Tradeoffs accepted:
-->

## Plan Executed

<!-- Paste or summarize the plan followed. Mark each item as done, skipped, or not applicable. -->

- [ ] Reproduce or confirm the reported behavior
- [ ] Identify the root cause
- [ ] Define the smallest scoped fix
- [ ] Implement the change
- [ ] Update related docs, ADRs, runbooks, or troubleshooting entries
- [ ] Verify with automated checks
- [ ] Verify with platform-specific/manual checks where required
- [ ] Document skipped checks and residual risk

## Verification Evidence

<!-- Include exact commands and outcomes. Do not write "tested locally" without evidence. -->

### Required Gates

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm --filter ./apps/mobile exec expo export --platform ios --output-dir /private/tmp/omnia-ios-export --clear`
- [ ] `pnpm --filter ./apps/mobile exec expo export --platform android --output-dir /private/tmp/omnia-android-export --clear`

### Additional Evidence

<!-- Examples: generated manifest inspection, APK install test, screenshot, migration dry run, release workflow run, telemetry trace. -->

<!-- Replace with concrete evidence beyond the required gates. Write "None." if not applicable. -->

### Skipped or Failed Checks

<!-- Required. If none, write "None." -->

<!--
- Command:
- Reason:
- Residual risk:
- Follow-up owner:
-->

## Release and Rollout

<!-- Required for user-facing, release, hotfix, native, persistence, or workflow changes. -->

<!--
- Target branch:
- Release type:
- Rollout steps:
- Rollback plan:
- Manual QA:
-->

## Risk Review

<!-- Be explicit. Reviewers should not have to infer the blast radius. -->

<!--
- User impact:
- Security/privacy:
- Native/platform:
- Data/persistence:
- Performance:
- Compatibility:
- Operational risk:
-->

## Documentation

<!-- Link all updated docs. Write "None" only when documentation is genuinely irrelevant. -->

<!-- Link all updated docs, ADRs, plans, or runbooks. -->

## Follow-Ups

<!-- List follow-ups that should not block this PR. Write "None" if there are none. -->

<!-- List follow-ups that should not block this PR. Write "None." if there are none. -->

## Merge Readiness

- [ ] PR targets the correct branch according to `docs/process/git-flow.md`
- [ ] PR title uses Conventional Commits
- [ ] Scope is limited to one concern
- [ ] No generated native output is committed unless explicitly required
- [ ] Reviewers have enough context to validate the change without reconstructing the investigation
