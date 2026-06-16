# ADR-007: Design System Strategy

## Status
Accepted

## Context
Omnia requires a consistent visual language across all screens and components. We need to decide on the design system approach that will support our mobile application while maintaining flexibility for future growth.

## Decision
We will implement a custom design system using NativeWind (Tailwind CSS for React Native) with CSS custom properties for design tokens, rather than adopting an existing component library like react-native-paper or React Native Paper.

## Consequences

### Positive
- Full control over visual design aligned with "calm clarity" principles
- No dependency on external component library updates or breaking changes
- Smaller bundle size without unused components
- Consistent styling through NativeWind utility classes
- Easy theme switching via CSS custom properties

### Negative
- More initial investment in building primitives from scratch
- Responsibility for accessibility implementation falls to our team
- Need to maintain consistency across contributors manually
- No pre-built complex components (data tables, etc.) — but not needed for Phase 02+

## Alternatives Considered

### react-native-paper
**Rejected because:**
- Material Design visual language conflicts with our "calm clarity" direction
- Heavy dependency with many unused components
- Styling customization limited compared to NativeWind approach
- Bundle size impact unnecessary for our component set

### React Native Elements
**Rejected because:**
- Opinionated styling harder to customize
- Component API inconsistencies across versions
- Maintenance burden of tracking external updates

### Custom StyleSheet Approach
**Rejected because:**
- No utility class composition benefits
- Harder to maintain consistent spacing/colors without token system
- Less developer ergonomics compared to Tailwind classes

## Implementation Notes

1. **NativeWind Configuration**
   - Extend theme with custom design tokens
   - Configure dark mode via class strategy
   - Define component-specific utilities as needed

2. **CSS Custom Properties**
   - Define all design tokens as CSS variables
   - Reference in NativeWind config for consistency
   - Enable runtime theme switching

3. **Component Structure**
   - Primitives in `components/ui/` directory
   - Feature components compose primitives exclusively
   - No direct React Native primitive usage in feature components

4. **Documentation**
   - Storybook for component documentation and testing
   - Design token documentation in separate file
   - Usage examples for each component variant

## References
- Phase 02 requirements: `docs/phases/phase-02-design-foundation.md`
- llama.cpp UI analysis: `docs/design/llama-ui-analysis.md`
- NativeWind documentation: https://www.nativewind.org/

---

*Decision made June 2025 by design system team.*
