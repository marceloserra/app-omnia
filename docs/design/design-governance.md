# Design Governance — Omnia Mobile

## Purpose

This document defines the governance process for design decisions, component contributions, and visual consistency in Omnia. It ensures all contributors follow established patterns while enabling efficient iteration.

---

## Decision Authority

### Design Decisions Hierarchy

| Decision Type | Authority | Process |
|---------------|-----------|---------|
| Visual tokens (colors, spacing) | Design System Owner | ADR + team review |
| Component API design | Component Owner | PR review with design lead |
| Screen layout patterns | Feature Owner | Alignment with architecture doc |
| Interaction patterns | UX Lead | Discussion in issue/PR |

### Escalation Path

1. **Contributor** → Creates PR with proposed change
2. **Reviewer** → Validates against principles and patterns
3. **Design Lead** → Approves or requests revision
4. **ADR Process** → For significant deviations, create ADR

---

## Contribution Rules

### Adding New Components

**Required:**
1. Storybook story showing all variants
2. JSDoc documentation for props
3. Usage example in documentation
4. Accessibility attributes (ARIA labels)
5. Light/dark theme support verification

**Review Checklist:**
- [ ] Follows component architecture tier rules
- [ ] Uses primitives exclusively (no direct RN primitives)
- [ ] Styled with NativeWind classes and design tokens
- [ ] Supports all required variants/states
- [ ] Tested on iOS and Android simulators
- [ ] Screen reader tested (VoiceOver/TalkBack)

### Modifying Existing Components

**Breaking Changes:**
- Require ADR for significant API changes
- Update all dependent components simultaneously
- Update Storybook stories to reflect changes
- Notify team via issue/announcement

**Non-Breaking Changes:**
- PR with clear description of change
- Verify existing stories still pass
- Update documentation if behavior changed

---

## Design Review Process

### Pre-Merge Requirements

All UI-related PRs must include:

1. **Screenshot Comparison**
   - Before/after screenshots for visual changes
   - Both light and dark mode variants
   - iOS and Android renders if platform-specific

2. **Storybook Verification**
   - All stories render without errors
   - Interactive controls work as expected
   - No console warnings or errors

3. **Accessibility Check**
   - VoiceOver/TalkBack navigation tested
   - ARIA labels present and accurate
   - Focus order logical

### Review Timeline

- Standard PRs: 24-hour review window
- Breaking changes: 72-hour review + team discussion
- Urgent fixes: Expedited with post-merge documentation update

---

## Token Governance

### Design Token Changes

**Color Tokens:**
- Require contrast ratio verification (WCAG AA minimum)
- Update both light and dark themes simultaneously
- Test on multiple device types

**Spacing Tokens:**
- Maintain consistent scale (4px base)
- Verify no layout breakage in dependent components
- Update documentation with new values

**Typography Tokens:**
- Font family changes require license verification
- Size changes must maintain hierarchy ratios
- Test readability on small screens

### Token Change Process

1. Propose change in issue with rationale
2. Provide visual examples of impact
3. Design lead approval required
4. Update tokens in `tailwind.config.js` and CSS variables
5. Verify all components render correctly
6. Merge with documentation update

---

## Documentation Standards

### Component Documentation

Each component must include:

1. **Overview** — Purpose and use cases
2. **Props Table** — All props with types, defaults, descriptions
3. **Variants** — Visual examples of each variant
4. **States** — Default, hover, active, disabled, loading
5. **Accessibility** — ARIA attributes, keyboard navigation
6. **Examples** — Code snippets for common use cases

### Storybook Documentation

Stories must include:
- Controls panel with all configurable props
- Docs tab with component documentation
- Play function for interactive testing
- Responsive preview (iOS/Android sizes)

---

## Versioning Strategy

### Component Versions

Components follow semantic versioning aligned with app releases:

| Change Type | Version Impact | Example |
|-------------|----------------|---------|
| Bug fix | Patch | 1.0.1 → 1.0.2 |
| New variant/state | Minor | 1.0.2 → 1.1.0 |
| Breaking API change | Major | 1.x.x → 2.0.0 |

### Deprecation Process

1. Mark component/prop as deprecated in JSDoc
2. Provide migration path documentation
3. Set deprecation timeline (minimum 2 releases)
4. Remove after timeline expires with breaking version bump

---

## Incident Response

### Design Bugs

**Severity Levels:**

| Level | Description | Response Time |
|-------|-------------|---------------|
| Critical | Visual breakage affecting usability | 4 hours |
| High | Inconsistent rendering across platforms | 24 hours |
| Medium | Minor visual inconsistency | Next release |
| Low | Cosmetic preference issue | Backlog |

**Response Process:**
1. Report via issue with screenshots and device info
2. Triage by design lead within response time
3. Assign to component owner or design team
4. Fix and verify on all affected platforms
5. Release patch if critical/high severity

---

## Governance Updates

This governance document may be updated through ADR process. Proposed changes should:

1. Be discussed in team meeting or async thread
2. Have clear rationale and impact assessment
3. Receive design lead approval
4. Update this document with version history

---

*Governance established June 2025. Reviewed against open-source contribution patterns.*
