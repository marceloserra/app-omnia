# Phase 9: Release Management & Production Stabilization

## Objective
Establish a professional, FAANG-grade Release Engineering pipeline inspired by projects like `llama.cpp`. Transform the repository from a codebase into a distributable product via automated GitHub Actions, SemVer tagging, and checksum verification.

## Scope

### CI/CD Pipelines
- [x] **Branch Validation (`branch-validation.yml`):** Run linting, typechecking, and unit tests on pushes to `feature/**`, `bugfix/**`, `hotfix/**`, `chore/**`, `docs/**`, `release/**`, and `develop`.
- [x] **PR Validation (`pr-validation.yml`):** Run linting, typechecking, and unit tests on pull requests targeting `develop`, `main`, or `release/**`.
- [x] **Main Validation (`main-validation.yml`):** Verify that the codebase builds correctly (`expo prebuild`, Android export, and `assembleDebug`) to ensure `main` is always in a releasable state.
- [x] **Hotfix Back-Merge (`hotfix-backmerge.yml`):** Open an automatic `main -> develop` back-merge PR after a `hotfix/**` PR is merged into `main`.
- [x] **Release APK (`release-apk.yml`):** Triggered by `v*.*.*` git tags. Automates Android APK generation, SHA256 checksums, and GitHub Release asset upload.

### Documentation & Architecture
- [x] Create `ADR` or Architectural documentation defining the Release Strategy (Versioning, Naming, Asset Matrix).
- [x] Document Git Flow and branch conventions in `docs/process/git-flow.md`.
- [ ] Create `CONTRIBUTING.md` or equivalent contributor entrypoint that links release and Git Flow docs.

### Production APK Stabilization
- [x] Tag `v1.0.0` and test the Release APK workflow end-to-end.
- [x] Tag `v1.0.1` patch release.
- [ ] Fix final APK defects discovered after install, including Android launcher icon and HTTP cleartext connectivity for local providers.
- [ ] Cut the next patch release after verification.

## Out of Scope
- Google Play Console integration (fastlane).
- Apple App Store Connect / TestFlight (Requires macOS cloud runners and provisioning profiles).
- Advanced Agent features (MCP, WebFetch, RAG) — These belong to Phase 10+.
