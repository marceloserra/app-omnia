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

---

## GitHub Actions Strategy

### 1. Pull Request Pipeline
**Trigger:** Opening or updating a PR against `main`.
**Jobs:**
*   Lint (`pnpm lint`)
*   Typecheck (`pnpm typecheck`)
*   Unit Tests (`pnpm test`)
*   Storybook Validation (Check if stories compile)
*   *Note: Artifacts are not generated here.*

### 2. Main Branch Pipeline
**Trigger:** Merge or direct push to `main`.
**Jobs:**
*   Build Validation (`expo export`)
*   Android Debug Build check
*   Documentation Validation
*   *Purpose: Ensure the repository is always in a releasable state.*

### 3. Release Pipeline
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
