# ADR-010: Design Token Governance

## Status
Accepted

## Context
Omnia needs a consistent approach to managing design tokens (colors, spacing, typography) that ensures visual consistency while allowing theme switching and future customization. We need to decide on the token management strategy and governance process.

## Decision
We will implement design tokens using CSS custom properties referenced in NativeWind configuration. Tokens will be organized by category (color, spacing, typography, elevation) with light/dark variants. Changes to tokens require design lead approval and verification across all components.

## Consequences

### Positive
- Centralized token management reduces inconsistency
- Theme switching via CSS variable updates
- Easy customization for future branding or accessibility needs
- Clear ownership and change process prevents drift
- Automated contrast ratio verification possible

### Negative
- Initial investment in comprehensive token definition
- Change process adds friction to visual updates
- Requires discipline from contributors to use tokens consistently
- Debugging token-related issues may require cross-component review

## Alternatives Considered

### Hardcoded Values in Components
**Rejected because:**
- No centralization leads to inconsistency
- Theme switching requires component-by-component changes
- Difficult to enforce consistency across contributors
- Maintenance burden increases with component count

### External Token Library (e.g., Style Dictionary)
**Rejected because:**
- Additional build complexity for Phase 02 scope
- Over-engineering for current token set size
- NativeWind already provides token integration path
- Can adopt later if token management becomes complex

### Inline Theme Objects Only
**Rejected because:**
- No CSS variable benefits for runtime switching
- Harder to reference consistently across styling approaches
- Less flexible for dynamic theme updates
- Doesn't leverage NativeWind's built-in theming

## Implementation Notes

1. **Token Organization**
   ```
   --color-*        → Semantic colors (background, foreground, primary, etc.)
   --spacing-*      → Spacing scale (xs, sm, md, lg, xl)
   --font-*         → Typography scale (sm, base, lg, xl, heading)
   --radius-*       → Border radius values (sm, md, lg, full)
   --elevation-*    → Shadow/elevation levels (1, 2, 3)
   ```

2. **Light/Dark Variants**
   - Define both light and dark values for each token
   - Use CSS `@media (prefers-color-scheme)` or class-based switching
   - Verify contrast ratios meet WCAG AA minimum for all combinations

3. **NativeWind Integration**
   ```javascript
   // tailwind.config.js
   theme: {
     extend: {
       colors: {
         background: 'var(--color-background)',
         foreground: 'var(--color-foreground)',
         // ... etc
       },
       spacing: {
         xs: 'var(--spacing-xs)',
         sm: 'var(--spacing-sm)',
         // ... etc
       }
     }
   }
   ```

4. **Change Process**
   - Propose token change in issue with rationale and visual examples
   - Design lead approval required before implementation
   - Update both light and dark variants simultaneously
   - Verify all components render correctly after change
   - Update documentation with new values

5. **Verification Requirements**
   - Contrast ratio check for color tokens (WCAG AA minimum)
   - Component rendering test on iOS and Android
   - Storybook story verification for affected components
   - Accessibility screen reader testing if token affects semantics

## References
- Phase 02 requirements: `docs/phases/phase-02-design-foundation.md`
- Design tokens document: `docs/design/design-tokens.md`
- NativeWind theming docs: https://www.nativewind.org/docs/theme
- WCAG contrast guidelines: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum

---

*Decision made June 2025 by design system team.*
