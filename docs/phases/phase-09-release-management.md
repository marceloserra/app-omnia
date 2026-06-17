# Phase 9: Release Management & v1.0.0 Stable

## Objective
Establish a professional, FAANG-grade Release Engineering pipeline inspired by projects like `llama.cpp`. Transform the repository from a codebase into a distributable product via automated GitHub Actions, SemVer tagging, and checksum verification.

## Scope

### CI/CD Pipelines
- [x] **Pull Request Pipeline (`pr.yml`):** Automatically run linting, typechecking, and unit tests on every PR to `main`.
- [x] **Main Branch Pipeline (`main.yml`):** Verify that the codebase builds correctly (`expo prebuild` and `assembleDebug`) to ensure `main` is always in a releasable state.
- [x] **Release Pipeline (`release.yml`):** Triggered by `v*.*.*` git tags. Automates the generation of Android APKs, calculates SHA256 checksums, and attaches them to an automated GitHub Release payload with auto-generated changelogs.

### Documentation & Architecture
- [x] Create `ADR` or Architectural documentation defining the Release Strategy (Versioning, Naming, Asset Matrix).
- [ ] Create `CONTRIBUTING.md` instructing future contributors on how to cut a release.

### Final V1 Stabilization
- [ ] Ensure all remaining UI/UX refactoring (e.g. Theme/Language global injection) is merged before tagging `v1.0.0`.
- [ ] Tag `v1.0.0` and test the Release Pipeline end-to-end.

## Out of Scope
- Google Play Console integration (fastlane).
- Apple App Store Connect / TestFlight (Requires macOS cloud runners and provisioning profiles).
- Advanced Agent features (MCP, WebFetch, RAG) — These belong to Phase 10+.
