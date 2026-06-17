# ADR 0004: CI/CD Pipeline Architecture

## Status
Accepted

## Context
Omnia requires a reliable, automated pipeline to ensure code quality, type safety, and artifact generation. Given the AI-driven development model, agents need immediate feedback if they break the build. We need a CI/CD system that enforces strict quality gates without slowing down local iteration.

## Decision
We will use **GitHub Actions** as our CI/CD platform with three distinct pipelines:
1. `pr.yml`: Runs on Pull Requests to `main`. Executes `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
2. `main.yml`: Runs on pushes to `main`. Repeats quality gates to ensure the mainline is never broken.
3. `release.yml`: Triggered by tags (`v*.*.*`). Builds the production Android APK (`assembleRelease`), computes SHA-256 checksums, and uses an automated script to extract rich release notes from `CHANGELOG.md` for the GitHub Release page.

## Consequences
- **Positive:** Agents have a strict, impenetrable quality gate. The repository remains mathematically sound. Releases are completely automated, removing human toil.
- **Negative:** Build times on GitHub Actions for React Native Android can take 3-5 minutes, creating a slight delay between tag push and artifact availability.
