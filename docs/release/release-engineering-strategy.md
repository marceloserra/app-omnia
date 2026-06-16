Release Engineering Strategy

Purpose

Release Engineering exists to transform source code into distributable artifacts.

The goal is to ensure every Omnia release is:

- Reproducible
- Automated
- Traceable
- Downloadable
- Well documented

A release should require no manual packaging work.

⸻

Philosophy

A repository is not a product.

A build is not a product.

A downloadable artifact is the first step toward becoming a product.

Every release must produce something a user can install.

⸻

Release Goals

Every tagged release should:

- Generate artifacts automatically
- Generate release notes automatically
- Publish GitHub Releases automatically
- Attach versioned binaries automatically

⸻

Versioning Strategy

Use Semantic Versioning.

Examples:

v0.1.0

v0.2.0

v0.3.0

v1.0.0

⸻

Release Types

Patch

Bug fixes.

Example:

v0.2.1

⸻

Minor

New features.

Example:

v0.3.0

⸻

Major

Breaking changes.

Example:

v1.0.0

⸻

GitHub Actions Strategy

Pull Request Pipeline

Run:

- Lint
- Typecheck
- Unit Tests
- Storybook Validation

Artifacts are not generated.

⸻

Main Branch Pipeline

Run:

- Build Validation
- Android Debug Build
- Documentation Validation

Purpose:

Ensure the repository is always releasable.

⸻

Release Pipeline

Triggered by:

Git Tag

Example:

v0.2.0

⸻

Pipeline must:

1. Build artifacts
2. Generate release notes
3. Create GitHub Release
4. Upload assets

⸻

Release Assets

Android

Generate:

Omnia-vX.Y.Z.apk

Future:

Omnia-vX.Y.Z.aab

⸻

Source

Automatically include:

Source Code (zip)

Source Code (tar.gz)

GitHub already provides these.

⸻

Checksums

Generate:

SHA256

For every uploaded artifact.

Example:

Omnia-v0.2.0.apk

sha256:
xxxxxxxxxxxxxxxx

⸻

Release Notes

Automatically generate from commits.

Structure:

Highlights

Human curated.

⸻

Changes

Generated automatically.

Example:

- Added Storybook support
- Added Theme System
- Added ChatBubble component

⸻

Assets

List downloadable artifacts.

⸻

Release Naming

Examples:

Release 0.1.0 — Foundation

Release 0.2.0 — Design Foundation

Release 0.3.0 — First Conversation

Release 0.4.0 — Conversation Experience

⸻

Artifact Matrix

Current:

Android APK

Future:

Android AAB

Future:

iOS IPA

Future:

Web Static Bundle

⸻

Distribution Strategy

Primary:

GitHub Releases

Future:

Google Play Internal Testing

Future:

Apple TestFlight

⸻

Success Criteria

A release is considered successful when:

- Git tag is created
- GitHub Actions completes successfully
- APK artifact exists
- Release notes exist
- Checksums exist
- Users can download and install the release

No manual intervention should be required.
