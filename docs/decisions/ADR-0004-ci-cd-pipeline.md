# ADR 0004: CI/CD Pipeline Architecture

## Status
Accepted

## Context
Omnia requires a reliable, automated pipeline to ensure code quality, type safety, and artifact generation. Given the AI-driven development model, agents need immediate feedback if they break the build. We need a CI/CD system that enforces strict quality gates without slowing down local iteration.

## Decision
We will use **GitHub Actions** as our CI/CD platform with five distinct workflows:

1. `branch-validation.yml`: Runs on pushes to scoped work and integration branches (`feature/**`, `bugfix/**`, `hotfix/**`, `chore/**`, `docs/**`, `release/**`, `develop`). Executes `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
2. `pr-validation.yml`: Runs on pull requests targeting `develop`, `main`, or `release/**`. Executes `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
3. `main-validation.yml`: Runs when release or hotfix work reaches `main`. Runs native Android validation (`expo prebuild`, `expo export`, and `assembleDebug`) to ensure the production branch is buildable.
4. `hotfix-backmerge.yml`: Runs after a merged `hotfix/**` PR to `main`. It opens an automated back-merge PR from `main` to `develop` so production fixes do not get lost from integration.
5. `release-apk.yml`: Triggered by tags (`v*.*.*`). Builds the production Android APK (`assembleRelease`), computes SHA-256 checksums, and publishes the GitHub Release assets.

## Consequences
- **Positive:** Agents have a strict, impenetrable quality gate. The repository remains mathematically sound. Releases are completely automated, removing human toil.
- **Negative:** Build times on GitHub Actions for React Native Android can take 3-5 minutes, creating a slight delay between tag push and artifact availability.
