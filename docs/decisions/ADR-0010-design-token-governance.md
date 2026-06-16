# ADR-0010: Design Token Governance

## Status
Accepted

## Context
To ensure our "Calm and Clean" aesthetic scales across both Light and Dark themes, we need a strictly typed design token system. We must avoid hardcoded hex colors sprinkled across React components.

## Decision
We adopt **CSS Custom Properties** (variables) mapped directly into the **NativeWind (`tailwind.config.js`)** theme extension. All color tokens will utilize the perceptually uniform **OKLCH** color space to guarantee consistent contrast ratios across hues.

## Consequences
- **Positive:** Switching between Light and Dark mode is instant and handled at the CSS layer without React re-renders.
- **Positive:** OKLCH prevents the "muddy" colors often seen in standard RGB interpolations.
- **Negative:** Developers must strictly use the semantic tokens (e.g., `bg-card` or `text-muted-foreground`) instead of absolute colors (`bg-gray-800`), which requires a slight learning curve.
