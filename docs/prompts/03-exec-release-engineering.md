OMNIA — RELEASE ENGINEERING FOUNDATION

Execute the first Release Engineering implementation for Omnia.

Goal:

Create a minimal but production-oriented release pipeline.

Do NOT overengineer.

Do NOT build a llama.cpp-sized matrix.

⸻

Deliverables

Create:

docs/architecture/release-engineering.md

Create:

.github/workflows/

release.yml

ci.yml

⸻

CI Requirements

Pull Requests:

- Install dependencies
- Typecheck
- Lint
- Run tests if available

⸻

Release Requirements

Triggered by Git tags.

Example:

v0.1.0

v0.2.0

⸻

Pipeline must:

1. Build Android APK
2. Generate SHA256 checksum
3. Create GitHub Release
4. Upload APK
5. Upload checksum file
6. Generate release notes

⸻

Release Asset Naming

Omnia-vX.Y.Z.apk

Example:

Omnia-v0.2.0.apk

⸻

Explicit Non Goals

Do NOT implement:

- iOS builds
- Play Store publishing
- TestFlight publishing
- Multi-platform build matrix

These belong to future iterations.

⸻

Success Criteria

Creating:

git tag v0.2.0

git push origin v0.2.0

must automatically produce:

GitHub Release

APK Asset

SHA256 Asset

Release Notes

with no manual intervention.
