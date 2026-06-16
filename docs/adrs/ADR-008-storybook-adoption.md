# ADR-008: Storybook Adoption for Component Documentation

## Status
Accepted

## Context
Omnia needs a way to document, test, and demonstrate UI components independently from application screens. We need to decide on the documentation approach that will support contributors and ensure component quality.

## Decision
We will adopt Storybook for React Native (`@storybook/react-native`) as our component documentation and testing tool. All components must have Storybook stories showing variants, states, and interactive controls.

## Consequences

### Positive
- Visual documentation of all components in one place
- Interactive testing without running full application
- Contributor onboarding through visual examples
- Automated regression detection via story screenshots
- Platform verification (iOS/Android) in isolated environment

### Negative
- Additional setup complexity for React Native Storybook
- Build time increase during development
- Maintenance burden as components evolve
- Learning curve for contributors unfamiliar with Storybook

## Alternatives Considered

### Inline Documentation Only
**Rejected because:**
- No visual verification without running app
- Hard to test component variants in isolation
- Contributor friction when exploring components
- No automated regression detection

### Separate Demo App
**Rejected because:**
- Duplication of routing and setup code
- Synchronization burden with main app
- Less standardized than Storybook ecosystem
- Tooling support weaker than Storybook

### Component Tests Only (Jest/React Native Testing Library)
**Rejected because:**
- No visual verification for contributors
- Accessibility testing incomplete without manual review
- State demonstration requires complex test setup
- Visual regression not captured

## Implementation Notes

1. **Storybook Configuration**
   - Install `@storybook/react-native` and related packages
   - Configure `.storybook/main.ts` with correct paths
   - Set up preview with theme providers and global decorators
   - Document usage in CONTRIBUTING.md

2. **Story Requirements**
   - Every component must have at least one story
   - Stories show all variants and states
   - Controls panel exposes configurable props
   - Docs tab includes component documentation
   - Play function demonstrates interactive behavior

3. **Build Integration**
   - Storybook build included in CI pipeline
   - Screenshot comparison for visual regression (future phase)
   - Storybook static site deployment for contributor reference

4. **Performance Considerations**
   - Lazy load stories to minimize bundle impact
   - Exclude Storybook from production builds
   - Optimize story rendering for fast interaction

## References
- Phase 02 requirements: `docs/phases/phase-02-design-foundation.md`
- Storybook React Native docs: https://storybook.js.org/docs/react-native/
- Component architecture: `docs/design/component-architecture.md`

---

*Decision made June 2025 by design system team.*
