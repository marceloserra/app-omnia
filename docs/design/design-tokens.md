# Design Tokens — Omnia Mobile

## Purpose

This document defines all design tokens for Omnia mobile. Tokens provide a single source of truth for visual properties, ensuring consistency across components and enabling theme switching.

---

## Token Categories

### 1. Colors
Semantic color tokens for backgrounds, text, interactive elements, and states.

### 2. Spacing
Consistent spacing scale based on 4px increments.

### 3. Typography
Font families, sizes, weights, and line heights.

### 4. Radius
Border radius values for components.

### 5. Elevation
Shadow/elevation levels for depth indication.

---

## Color Tokens

### Light Theme

| Token | Value (OKLCH) | Usage |
|-------|---------------|-------|
| `--color-background` | `oklch(1 0 0)` | Page background |
| `--color-foreground` | `oklch(0.145 0 0)` | Primary text |
| `--color-card` | `oklch(1 0 0)` | Card backgrounds |
| `--color-card-foreground` | `oklch(0.145 0 0)` | Card text |
| `--color-primary` | `oklch(0.205 0 0)` | Primary buttons, links |
| `--color-primary-foreground` | `oklch(0.985 0 0)` | Text on primary |
| `--color-secondary` | `oklch(0.95 0 0)` | Secondary backgrounds |
| `--color-secondary-foreground` | `oklch(0.205 0 0)` | Secondary text |
| `--color-muted` | `oklch(0.97 0 0)` | Disabled, placeholder |
| `--color-muted-foreground` | `oklch(0.556 0 0)` | Muted text |
| `--color-accent` | `oklch(0.95 0 0)` | Hover/active states |
| `--color-accent-foreground` | `oklch(0.205 0 0)` | Text on accent |
| `--color-destructive` | `oklch(0.577 0.245 27.325)` | Error, delete actions |
| `--color-border` | `oklch(0.875 0 0)` | Dividers, borders |
| `--color-input` | `oklch(0.92 0 0)` | Input backgrounds |
| `--color-ring` | `oklch(0.708 0 0)` | Focus indicators |

### Dark Theme

| Token | Value (OKLCH) | Usage |
|-------|---------------|-------|
| `--color-background` | `oklch(0.16 0 0)` | Page background |
| `--color-foreground` | `oklch(0.985 0 0)` | Primary text |
| `--color-card` | `oklch(0.205 0 0)` | Card backgrounds |
| `--color-card-foreground` | `oklch(0.985 0 0)` | Card text |
| `--color-primary` | `oklch(0.922 0 0)` | Primary buttons, links |
| `--color-primary-foreground` | `oklch(0.205 0 0)` | Text on primary |
| `--color-secondary` | `oklch(0.29 0 0)` | Secondary backgrounds |
| `--color-secondary-foreground` | `oklch(0.985 0 0)` | Secondary text |
| `--color-muted` | `oklch(0.269 0 0)` | Disabled, placeholder |
| `--color-muted-foreground` | `oklch(0.708 0 0)` | Muted text |
| `--color-accent` | `oklch(0.269 0 0)` | Hover/active states |
| `--color-accent-foreground` | `oklch(0.985 0 0)` | Text on accent |
| `--color-destructive` | `oklch(0.704 0.191 22.216)` | Error, delete actions |
| `--color-border` | `oklch(1 0 0 / 30%)` | Dividers, borders |
| `--color-input` | `oklch(1 0 0 / 30%)` | Input backgrounds |
| `--color-ring` | `oklch(0.556 0 0)` | Focus indicators |

### Semantic Color Notes
- All color tokens use OKLCH format for perceptual uniformity
- Contrast ratios verified against WCAG AA standards
- Light/dark themes maintain consistent semantic relationships

---

## Spacing Tokens

Based on 4px increment scale:

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-xs` | `4px` | Micro-spacing, padding within icons |
| `--spacing-sm` | `8px` | Standard component padding/margins |
| `--spacing-md` | `16px` | Section spacing, card padding |
| `--spacing-lg` | `24px` | Major divisions, screen padding |
| `--spacing-xl` | `32px` | Large gaps, hero sections |
| `--spacing-2xl` | `40px` | Extra-large gaps |
| `--spacing-3xl` | `48px` | Maximum spacing |

### Spacing Usage Guidelines
- Use `xs` for internal component spacing (icon to text)
- Use `sm` for standard padding and margins
- Use `md` for section divisions within screens
- Use `lg+` for screen-level layout spacing

---

## Typography Tokens

### Font Families
| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `system-ui, -apple-system, sans-serif` | Body text, UI elements |
| `--font-mono` | `ui-monospace, SFMono-Regular, 'SF Mono', Monaco, monospace` | Code, technical content |

### Font Sizes
| Token | Value | Usage |
|-------|-------|-------|
| `--text-xs` | `12px` | Captions, metadata |
| `--text-sm` | `14px` | Secondary text, labels |
| `--text-base` | `16px` | Body text (default) |
| `--text-lg` | `18px` | Emphasized body |
| `--text-xl` | `20px` | Section headers |
| `--text-2xl` | `24px` | Page titles |
| `--text-3xl` | `30px` | Hero headings |

### Font Weights
| Token | Value | Usage |
|-------|-------|-------|
| `--font-normal` | `400` | Body text |
| `--font-medium` | `500` | Emphasis, buttons |
| `--font-semibold` | `600` | Headers, strong emphasis |
| `--font-bold` | `700` | Primary headings |

### Line Heights
| Token | Value | Usage |
|-------|-------|-------|
| `--leading-tight` | `1.25` | Headings |
| `--leading-normal` | `1.5` | Body text |
| `--leading-relaxed` | `1.75` | Long-form reading |

---

## Radius Tokens

Border radius values for component corners:

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Small components, buttons |
| `--radius-md` | `8px` | Standard cards, inputs |
| `--radius-lg` | `12px` | Large cards, modals |
| `--radius-xl` | `16px` | Hero elements |
| `--radius-full` | `9999px` | Circular elements, avatars |

---

## Elevation Tokens

Shadow levels for depth indication:

| Token | Value (CSS) | Usage |
|-------|-------------|-------|
| `--elevation-1` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `--elevation-2` | `0 2px 4px rgba(0,0,0,0.1)` | Standard cards |
| `--elevation-3` | `0 4px 8px rgba(0,0,0,0.15)` | Elevated modals |

**Note:** React Native shadows require platform-specific handling via `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`.

---

## Token Implementation Notes

### CSS Custom Properties
All tokens defined as CSS variables in global stylesheet:
```css
:root {
  --color-background: oklch(1 0 0);
  --spacing-sm: 8px;
  /* ... etc */
}

.dark {
  --color-background: oklch(0.16 0 0);
  /* ... dark variants */
}
```

### NativeWind Integration
Tokens referenced in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      background: 'var(--color-background)',
      // ... etc
    },
    spacing: {
      xs: 'var(--spacing-xs)',
      // ... etc
    }
  }
}
```

### Theme Switching
Implemented via class strategy on root element:
```tsx
<View className={theme === 'dark' ? 'dark' : ''}>
  {/* App content */}
</View>
```

---

*Tokens defined June 2025. Based on llama.cpp UI analysis and WCAG accessibility standards.*
