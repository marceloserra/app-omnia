# Git Flow & Branch Conventions

## Mandate

**As of v1.0.1, no code is committed directly to `main`.**

All changes go through branches. `main` is a protected, production-only branch and must always reflect the last released version. Every agent and every contributor must follow this workflow without exception.

Production defects found after a public release use the hotfix flow. They do not wait for the next `develop` release candidate when the defect blocks installability, startup, local provider connectivity, data safety, or another critical shipped behavior.

---

## Branch Structure

```
main                    production only. mirrors the latest tag.
develop                 integration branch. always deployable.
  feature/xxx           new capabilities
  bugfix/xxx            bug corrections
  hotfix/xxx            emergency fix branched from main
  chore/xxx             tooling, deps, config
  docs/xxx              documentation-only changes
release/vX.Y.Z          release stabilization, branched from develop
```

---

## Branch Naming

| Type | Pattern | Example |
| --- | --- | --- |
| Feature | `feature/<short-description>` | `feature/voice-input` |
| Bug Fix | `bugfix/<short-description>` | `bugfix/android-cleartext-http` |
| Hot Fix | `hotfix/<short-description>` | `hotfix/crash-on-empty-api-key` |
| Release | `release/vX.Y.Z` | `release/v1.1.0` |
| Chore | `chore/<short-description>` | `chore/upgrade-expo-57` |
| Docs | `docs/<short-description>` | `docs/update-architecture-overview` |

Rules:
- All lowercase, words separated by hyphens.
- No slashes inside the description (only the prefix slash).
- Be descriptive but concise. Max ~5 words after the prefix.

---

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

| Type | When to use |
| --- | --- |
| `feat` | A new user-facing feature |
| `fix` | A bug fix |
| `chore` | Build process, dependency updates, tooling |
| `docs` | Documentation only |
| `refactor` | Code restructure without behavior change |
| `test` | Adding or fixing tests |
| `style` | Formatting, whitespace, no logic change |
| `perf` | Performance improvements |
| `ci` | CI/CD pipeline changes |

Examples:
```
feat(chat): add swipe-to-pin gesture to history screen
fix(android): allow cleartext HTTP traffic for local AI endpoints
chore(deps): remove react-native-worklets, contaminated babel peer graph
docs(release): add Release Runbook and dependency hygiene rules
ci(release): fix expo prebuild step to emit correct AndroidManifest
```

---

## Workflow

### Standard Feature or Bugfix

```bash
# 1. Always branch from develop (not main)
git checkout develop
git pull origin develop
git checkout -b bugfix/my-fix

# 2. Make your changes. Commit often with conventional commits.
git add .
git commit -m "fix(scope): description"

# 3. Push and open a PR targeting develop
git push origin bugfix/my-fix
# Open PR: bugfix/my-fix → develop
```

### Merging to develop
- PR must pass all CI checks (lint, typecheck, test).
- PR must use `.github/pull_request_template.md` and fill every relevant section. Do not leave placeholder bullets, empty headings, or unexplained skipped checks in the final PR body.
- Squash merge is preferred to keep history clean.
- Delete the branch after merge.

### CI Coverage by Branch

- Pushes to `feature/**`, `bugfix/**`, `hotfix/**`, `chore/**`, `docs/**`, `release/**`, and `develop` run `.github/workflows/branch-validation.yml`.
- PRs targeting `develop`, `main`, or `release/**` run `.github/workflows/pr-validation.yml`.
- Pushes to `main` run `.github/workflows/main-validation.yml`.
- Merged `hotfix/**` PRs into `main` run `.github/workflows/hotfix-backmerge.yml`, which opens a `main -> develop` back-merge PR.
- Version tags matching `v*.*.*` run `.github/workflows/release-apk.yml`.

### Cutting a Release

```bash
# 1. Branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0

# 2. Only stabilization commits go here (version bumps, final fixes)
# No new features.

# 3. Merge into main when ready
git checkout main
git merge release/v1.1.0 --no-ff
git tag -a v1.1.0 -m "Omnia v1.1.0 — <Title> ..."
git push origin main --tags

# 4. Back-merge into develop to keep them in sync
git checkout develop
git merge release/v1.1.0 --no-ff
git push origin develop

# 5. Delete the release branch
git push origin --delete release/v1.1.0
```

### Emergency Hotfix (from main)

Use this flow when a defect affects an already released artifact. Examples:
- Final APK cannot connect to valid local HTTP providers.
- Final APK ships wrong branding or broken launcher assets.
- A production crash blocks a core flow.
- A release pipeline defect prevents publishing a corrected artifact.

```bash
# 1. Branch from main directly (not develop)
git checkout main
git pull origin main
git checkout -b hotfix/critical-crash

# 2. Fix, commit, push, and open a PR to main
git commit -m "fix(scope): emergency fix description"
git push origin hotfix/critical-crash
# Open PR: hotfix/critical-crash -> main

# 3. Merge into main through PR, then tag the patch release
git checkout main
git pull origin main
git tag -a vX.Y.Z -m "Omnia vX.Y.Z — Hotfix: ..."
git push origin vX.Y.Z

# 4. Back-merge main into develop
git checkout develop
git pull origin develop
git merge main --no-ff
git push origin develop
```

Hotfix rules:
- PR target is `main`.
- Do not create a `release/vX.Y.Z` branch for urgent production patch releases.
- The patch tag is created from `main` after the hotfix PR is merged.
- Back-merge `main` into `develop` immediately after tagging so future release candidates include the fix.
- If the work started on `bugfix/*` but is reclassified as production-critical, rename the branch to `hotfix/*` before opening the PR.

Hotfix propagation terminology:
- **Hotfix to `main`:** The fix lands in `main` through the hotfix PR. This is not a backport; it is the primary production patch.
- **Back-merge to `develop`:** After the patch tag is pushed from `main`, merge `main` into `develop` so integration work contains the production fix.
- **Existing release candidate:** If a `release/vX.Y.Z` branch is already open, merge `main` into that release branch too, or cherry-pick only when a merge is not viable.
- **Fix already exists in `develop`:** Create `hotfix/*` from `main`, cherry-pick the relevant commit from `develop`, open the hotfix PR to `main`, then merge `main` back into `develop` after release.

---

## Agent Rules

- **Never commit directly to `main` or `develop`.**
- **Fix directly related documentation divergences when you find them.** If the divergence is real but outside the current task, mention it in the handoff with the file path.
- **Always verify the full quality gate before opening a PR:**
  ```bash
  pnpm install --frozen-lockfile
  pnpm lint
  pnpm typecheck
  pnpm test
  ```
- **Never move or delete a tag without documenting the reason in `docs/architecture/release-strategy.md`.**
- **Never add `@babel/core` as a direct dependency to `apps/mobile/package.json`.** It is managed at the workspace root. Verify with `pnpm list @babel/core --filter mobile`.
- **One concern per branch.** Do not mix feature work with dependency upgrades.
- **PRs must target `develop`, not `main`**, unless it is a documented hotfix.
- **PR descriptions must use `.github/pull_request_template.md`** and include the executive summary, review strategy, plan executed, verification evidence, skipped checks, rollout plan, and residual risk.
- **Production-critical defects in released artifacts must use `hotfix/*`**, target `main`, and be back-merged from `main` into `develop` after the patch tag is published.
