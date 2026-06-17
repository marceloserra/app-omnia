# Release Engineering Strategy

## Purpose
Release Engineering exists to transform source code into distributable artifacts.
The goal is to ensure every Omnia release is:
*   Reproducible
*   Automated
*   Traceable
*   Downloadable
*   Well documented

A release should require **no manual packaging work**.

---

## Philosophy
*   A repository is not a product.
*   A build is not a product.
*   A downloadable artifact is the first step toward becoming a product.
*   Every release must produce something a user can install.

---

## Release Goals
Every tagged release should:
*   Generate artifacts automatically
*   Generate release notes automatically
*   Publish GitHub Releases automatically
*   Attach versioned binaries automatically

---

## Versioning Strategy
Use Semantic Versioning (SemVer).
*   **Patch (`vX.Y.Z+1`)**: Bug fixes. Example: `v0.2.1`
*   **Minor (`vX.Y+1.0`)**: New features. Example: `v0.3.0`
*   **Major (`vX+1.0.0`)**: Breaking changes. Example: `v1.0.0`

## Branching Strategy
Release work follows `docs/process/git-flow.md`.

*   `main` is production-only and must reflect released code.
*   `develop` is the integration branch for reviewed work.
*   `feature/*`, `bugfix/*`, `chore/*`, and `docs/*` branches target `develop`.
*   `release/vX.Y.Z` branches stabilize a release from `develop` before merging to `main` and tagging.
*   `hotfix/*` branches are reserved for urgent fixes from `main` and must be back-merged to `develop`.

---

## GitHub Actions Strategy

### 1. Branch Validation
**Workflow:** `.github/workflows/branch-validation.yml`
**Trigger:** Pushing to scoped work or integration branches: `feature/**`, `bugfix/**`, `hotfix/**`, `chore/**`, `docs/**`, `release/**`, or `develop`.
**Jobs:**
*   Lint (`pnpm lint`)
*   Typecheck (`pnpm typecheck`)
*   Unit Tests (`pnpm test`)
*   *Note: Artifacts are not generated here.*

### 2. PR Validation
**Workflow:** `.github/workflows/pr-validation.yml`
**Trigger:** Opening or updating a pull request targeting `develop`, `main`, or `release/**`.
**Jobs:**
*   Install with frozen lockfile
*   Lint (`pnpm lint`)
*   Typecheck (`pnpm typecheck`)
*   Unit Tests (`pnpm test`)
*   *Note: Artifacts are not generated here.*

### 3. Main Validation
**Workflow:** `.github/workflows/main-validation.yml`
**Trigger:** Merge to `main` through the release or hotfix flow.
**Jobs:**
*   Build Validation (`expo export`)
*   Android Debug Build check
*   Documentation Validation
*   *Purpose: Ensure the repository is always in a releasable state.*

### 4. Hotfix Back-Merge
**Workflow:** `.github/workflows/hotfix-backmerge.yml`
**Trigger:** A `hotfix/**` pull request is merged into `main`.
**Jobs:**
*   Create an automation branch from `develop`
*   Merge `main` into that branch
*   Open a PR back to `develop`
*   *Purpose: Ensure urgent production fixes flow back into integration without bypassing branch protection.*

### 5. Release APK
**Workflow:** `.github/workflows/release-apk.yml`
**Trigger:** Pushing a Git Tag (e.g., `refs/tags/v*`).
**Jobs:**
1.  **Build Artifacts:** Run Expo prebuild and compile the Android APK (`gradlew assembleRelease`).
2.  **Generate Checksums:** Compute SHA256 hashes for all generated binaries.
3.  **Generate Release Notes:** Extract commit history since the last tag.
4.  **Create GitHub Release:** Publish the release on GitHub.
5.  **Upload Assets:** Attach the APK and checksums to the release payload.

---

## Artifact Matrix
**Current:**
*   Android APK (`Omnia-vX.Y.Z.apk`)

**Future:**
*   Android AAB (For Google Play)
*   iOS IPA (For TestFlight / Sideloading)
*   Web Static Bundle

---

## Checksums
Every uploaded artifact must be accompanied by a SHA256 checksum in the release notes or as a separate `.sha256` file to ensure integrity.

---

## Release Naming Convention
Releases should carry descriptive titles based on the current phase completion:
*   `Release 0.1.0 — Foundation`
*   `Release 0.2.0 — Design Foundation`
*   `Release 0.8.0 — Conversation Management`
*   `Release 1.0.0 — Stable MVP`

---

## Success Criteria
A release is considered successful when:
1.  Git tag is created and pushed.
2.  GitHub Actions completes successfully without errors.
3.  APK artifact exists and is downloadable.
4.  Release notes exist with highlights and automated changelogs.
5.  Checksums match the binary.
6.  Users can download and install the release on their device.
**No manual intervention should be required.**

---

## Release Runbook

This section documents the exact operational steps to cut a release. It exists so any team member can execute a release without prior context.

### Pre-Release Checklist

Before creating any tag, always verify the full quality gate passes locally:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
```

All four commands must exit with code 0. Do not tag if any of them fail.

### Cutting a New Release

```bash
# 1. Stabilize from develop
git checkout develop
git pull origin develop
git checkout -b release/vX.Y.Z

# 2. Run the full pre-release gate
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test

# 3. Merge the release branch into main
git checkout main
git pull origin main
git merge release/vX.Y.Z --no-ff

# 4. Ensure main is clean and pushed
git status
git push origin main

# 5. Create an annotated tag with the release body inline
git tag -a vX.Y.Z -m "Omnia vX.Y.Z — <Title>

<Release body here>"

# 6. Push the tag — this triggers the Release APK workflow automatically
git push origin vX.Y.Z

# 7. Back-merge release stabilization into develop
git checkout develop
git pull origin develop
git merge release/vX.Y.Z --no-ff
git push origin develop
```

The GitHub Actions Release APK workflow will then:
1. Checkout the tagged commit
2. Run `expo export --platform android` to generate the JS bundle
3. Compile the Android APK (`omnia-android-vX.Y.Z-universal.apk`)
4. Compute a SHA256 checksum (`omnia-android-vX.Y.Z-universal.apk.sha256`)
5. Create the GitHub Release with the tag message as the body
6. Attach the APK and checksum as downloadable assets

No further action is required.

### Cutting a Hotfix Release

Use this path only for urgent defects in an already released artifact. Standard feature and bugfix work still targets `develop`.

```bash
# 1. Branch from main
git checkout main
git pull origin main
git checkout -b hotfix/<short-description>

# 2. Fix the issue, verify, push, and open a PR to main
git commit -m "fix(scope): short description"
git push origin hotfix/<short-description>
# Open PR: hotfix/<short-description> -> main

# 3. After the PR merges, tag the patch release from main
git checkout main
git pull origin main
git tag -a vX.Y.Z -m "Omnia vX.Y.Z — Hotfix: <Title>

<Release body here>"
git push origin vX.Y.Z

# 4. Back-merge main into develop immediately
git checkout develop
git pull origin develop
git merge main --no-ff
git push origin develop
```

Hotfix acceptance criteria:

1. The hotfix PR uses `.github/pull_request_template.md`.
2. The PR target is `main`.
3. The patch tag is created from `main`, not from the hotfix branch.
4. The Release APK workflow publishes a downloadable APK and checksum.
5. `main` is back-merged into `develop` after the tag is pushed.
6. Any skipped local release-build checks are documented with residual risk.

Hotfix propagation rule:

- The hotfix lands in `main` first.
- After tagging, merge `main` into `develop`; this is the required propagation step.
- If a release candidate branch already exists, merge `main` into that branch as well.
- If the fix was originally authored on `develop`, cherry-pick it into a `hotfix/*` branch created from `main`, then follow the normal hotfix flow.

### Moving a Tag (Re-releasing)

If a tag was created pointing to the wrong commit, delete it and recreate:

```bash
# Delete locally and on remote
git tag -d vX.Y.Z
git push origin :refs/tags/vX.Y.Z

# Recreate pointing to the correct commit (HEAD or a specific sha)
git tag -a vX.Y.Z -m "<Release body>"
git push origin vX.Y.Z
```

> Note: Moving a tag re-triggers the Release APK workflow and overwrites the previous GitHub Release assets.

### Dependency Hygiene Rule

Always verify the lockfile is clean before tagging. A common failure mode is a transitive dependency contaminating the Babel peer resolution graph and breaking the Expo export step. Specifically:

- `@babel/core` must only exist at `^7.x` across the entire dependency tree.
- No package in `apps/mobile/package.json` should declare `@babel/core` as a direct dependency — it is managed at the workspace root.
- Check for contamination with: `pnpm list @babel/core --filter mobile`

---

## Release History

Every release is a permanent, historical artifact. Tags are never deleted without a documented reason.

| Tag | Commit | Title | Notes |
| --- | --- | --- | --- |
| `v0.9.0` | `68ca965` | Pre-stable Foundation | |
| `v1.0.0` | `31a5302` | Stable MVP | First production-grade release |
| `v1.0.1` | `e2cecc1` | Foundation Release | CI pipeline hardened; Babel peer contamination resolved |
