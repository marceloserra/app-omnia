# Repository Assessment Report — Phase 02: Design Foundation

## Executive Summary

This report assesses the current state of the Omnia mobile application repository and identifies gaps that must be addressed to complete Phase 02 (Design Foundation). The assessment compares the existing codebase against the requirements defined in `docs/phases/phase-02-design-foundation.md`.

**Current Status:** Phase 01 (Foundation) is complete. Phase 02 has not yet begun implementation.
**Target Completion:** All design documentation, ADRs, Storybook setup, theme system, and core UI components must be implemented before proceeding to Phase 03.

---

## Repository Structure Assessment

### Existing Structure ✅

```
apps/mobile/
├── app/                    # Expo Router navigation (basic)
│   ├── _layout.tsx        # Root layout with ThemeProvider
│   └── index.tsx          # Placeholder home screen
├── assets/css/            # Global CSS (NativeWind)
├── package.json           # Dependencies configured
├── tailwind.config.js     # NativeWind preset only
└── tsconfig.json          # TypeScript configuration

docs/
├── design/                # Design documentation directory exists
│   ├── omnia-design-vision.md  # Basic vision document (partial)
│   └── design-tokens.md        # Placeholder tokens file
└── phases/
    └── phase-02-design-foundation.md  # Phase requirements defined

docs/adrs/                 # ADR directory exists but empty
```

### Missing Structure ❌

The following directories and files are required by Phase 02 but do not exist:

#### Documentation (Required)
- `docs/design/llama-ui-analysis.md` — Detailed llama.cpp UI analysis
- `docs/design/design-principles.md` — Formal design principles with examples
- `docs/design/component-architecture.md` — Component hierarchy and ownership
- `docs/design/mobile-navigation.md` — Navigation architecture diagrams
- `docs/design/design-governance.md` — Design review and contribution rules

#### ADRs (Required)
- `docs/adrs/ADR-007-design-system-strategy.md`
- `docs/adrs/ADR-008-storybook-adoption.md`
- `docs/adrs/ADR-009-mobile-navigation-strategy.md`
- `docs/adrs/ADR-010-design-token-governance.md`

#### Storybook (Required)
- `.storybook/` directory with configuration
- Stories for all primitive and composed components

#### Components (Required)
- `apps/mobile/components/ui/` — Primitive UI components
  - Button.tsx
  - IconButton.tsx
  - Input.tsx
  - Avatar.tsx
  - Divider.tsx
  - Card.tsx
  - Sheet.tsx
- `apps/mobile/components/chat/` — Composed chat components
  - ChatBubble.tsx
  - ChatComposer.tsx
  - ConversationItem.tsx
  - ProviderCard.tsx
  - SettingsRow.tsx
  - ModelSelector.tsx

#### Theme System (Required)
- `apps/mobile/theme/` or integrated into NativeWind config
- Light theme definitions
- Dark theme definitions
- Design token exports

---

## Current Codebase Analysis

### apps/mobile/app/_layout.tsx
**Status:** Basic implementation ✅
**Issues:**
- Uses `@react-navigation/native` ThemeProvider but doesn't define custom themes
- No dark mode toggle mechanism
- Missing integration with design tokens
- Fonts loading placeholder (`useFonts({})`) — no fonts configured

### apps/mobile/app/index.tsx
**Status:** Placeholder only ❌
**Issues:**
- Simple centered text view
- No navigation to other screens
- No component usage from design system
- Doesn't demonstrate theme capabilities

### tailwind.config.js
**Status:** Minimal configuration ❌
**Current:** Only NativeWind preset and content paths
**Required:** 
- Custom color tokens mapped to semantic names
- Typography scale definitions
- Spacing scale if needed
- Dark mode class strategy
- Component-specific utilities

### assets/css/global.css
**Status:** Basic Tailwind directives only ❌
**Required:**
- CSS custom properties for design tokens
- Global base styles
- Theme variable definitions

---

## Dependency Assessment

### Current Dependencies (from package.json)
```json
{
  "dependencies": {
    "@expo/vector-icons": "^v14.0.0",
    "expo-router": "~v5.0.7",
    "nativewind": "^4.6.0",
    "react-native-paper": "^v5.6.3"  // ⚠️ CONFLICT
  },
  "devDependencies": {
    "@types/react": "~19.1.9",
    "eslint": "^9.28.0",
    "typescript": "~5.8.3"
  }
}
```

### Critical Issues Identified

#### ⚠️ react-native-paper Conflict
**Problem:** `react-native-paper` is installed but Phase 02 requires a custom design system, not Material Design components. This creates:
- Visual inconsistency with the "calm, clean" design direction
- Potential conflicts with NativeWind styling
- Unnecessary bundle size increase

**Recommendation:** Remove `react-native-paper` and build custom components from scratch using React Native primitives + NativeWind.

#### Missing Dependencies Required for Phase 02
1. **Storybook for React Native** — `@storybook/react-native`, `@storybook/react-native-webpack5`
2. **Icon library** — Consider `lucide-react-native` or keep `@expo/vector-icons` with custom icon set
3. **Animation library** — `react-native-reanimated` (already in Expo SDK) for smooth transitions

---

## Design Reference Analysis: llama.cpp UI

### Key Findings from Source Code Review

#### Architecture Patterns
1. **Component Hierarchy:** Three-tier architecture
   - Primitive UI components (`$lib/components/ui/`) — shadcn-svelte based
   - Composed app components (`$lib/components/app/`) — domain-specific compositions
   - Feature screens — route-level compositions

2. **State Management:** Svelte stores with reactive contexts
   - `chat.svelte` — Chat state management
   - `conversations.svelte` — Conversation list/state
   - `models.svelte` — Model selection/state
   - `settings.svelte` — Configuration persistence
   - `server.svelte` — Server connection status

3. **Styling Approach:** 
   - Tailwind CSS utility classes throughout
   - CSS custom properties for theming (`--primary`, `--secondary`, etc.)
   - Dark mode via class strategy
   - No inline styles except dynamic values

#### Visual Design Characteristics
1. **Chat Bubbles:**
   - User messages: Subtle background with rounded corners (1.125rem)
   - Assistant messages: Clean text on white/light background
   - Max-width constraint (80%) for readability
   - Backdrop blur effect for depth

2. **Navigation:**
   - Sidebar navigation on desktop
   - Collapsible conversation list
   - Search functionality in sidebar
   - Model selector dropdown

3. **Information Density:**
   - Low density — generous whitespace
   - Minimal borders and dividers
   - Typography-driven hierarchy (not color or size)

4. **Interaction Patterns:**
   - Keyboard shortcuts for power users
   - Drag-and-drop file upload
   - Auto-scroll with user override
   - Progressive loading states

### Mobile Adaptation Strategy

From llama.cpp UI, Omnia should adapt:
- ✅ Chat bubble design (rounded corners, max-width)
- ✅ Low visual density approach
- ✅ Typography hierarchy
- ✅ Minimal chrome philosophy

Omnia should NOT copy directly:
- ❌ Sidebar navigation (use drawer for mobile)
- ❌ Desktop-specific interactions (keyboard shortcuts)
- ❌ Svelte component model (different framework)
- ❌ shadcn-svelte dependency (React Native equivalent needed)

---

## Gap Analysis Summary

| Requirement | Status | Priority | Effort |
|-------------|--------|----------|--------|
| llama-ui-analysis.md | Missing | High | Medium |
| design-principles.md | Partial | High | Low |
| component-architecture.md | Missing | High | Medium |
| mobile-navigation.md | Missing | High | Medium |
| design-governance.md | Missing | Medium | Low |
| ADR-007 to ADR-010 | All missing | High | Medium |
| Storybook setup | Missing | Critical | High |
| Theme system | Partial | Critical | High |
| Primitive components | Missing | Critical | High |
| Composed components | Missing | Critical | High |
| Design tokens | Placeholder | Critical | Medium |

---

## Recommended Implementation Sequence

### Phase 02 Execution Order

1. **Documentation First** (Low risk, high clarity)
   - Create all required documentation files
   - Define design principles and token values
   - Write ADRs to lock in technical decisions

2. **Theme System** (Foundation for everything else)
   - Implement NativeWind theme configuration
   - Define CSS custom properties
   - Create light/dark theme support

3. **Storybook Setup** (Enables component development)
   - Configure Storybook for React Native
   - Create initial stories for primitives

4. **Primitive Components** (Building blocks)
   - Button, IconButton, Input, Avatar, Divider, Card, Sheet
   - Each with Storybook coverage

5. **Composed Components** (Domain-specific)
   - ChatBubble, ChatComposer, ConversationItem
   - ProviderCard, SettingsRow, ModelSelector

6. **Navigation Implementation** (User-facing structure)
   - Drawer navigation setup
   - Screen routing configuration
   - Navigation patterns from mobile-navigation.md

---

## Risk Assessment

### High Risks
1. **react-native-paper dependency conflict** — Must be removed early to avoid design system contamination
2. **Storybook React Native complexity** — Setup can be challenging; requires careful configuration
3. **Scope creep into Phase 03 features** — Strict boundary enforcement needed

### Medium Risks
1. **Dark mode implementation completeness** — Requires thorough testing on both platforms
2. **Component consistency across platforms** — iOS and Android may render differently

### Low Risks
1. **Documentation creation** — Straightforward but time-consuming
2. **Design token definition** — Clear requirements from phase document

---

## Success Criteria Checklist

Phase 02 is complete when ALL of the following are true:

- [ ] All 5 required documentation files exist and are comprehensive
- [ ] All 4 ADRs (007-010) exist and are approved
- [ ] Storybook is operational with stories for all components
- [ ] Theme system supports both light and dark modes
- [ ] Design tokens are defined and exported
- [ ] Component architecture is documented and implemented
- [ ] Core UI components (primitives + composed) exist
- [ ] Visual identity matches "calm, clean, modern" direction
- [ ] No Phase 03 functionality has been implemented
- [ ] Future phases can build features without redefining UI foundations

---

## Next Steps

1. Create Repository Assessment Report ✅ (This document)
2. Generate detailed implementation plan with task dependencies
3. Dispatch background specialists for parallel work streams
4. Monitor completion via hook-driven callbacks
5. Reconcile results and verify acceptance criteria

**Estimated Duration:** 2-3 weeks of focused development
**Team Size Required:** 1-2 engineers working in parallel lanes

---

*Report generated on: $(date)*
*Assessment scope: Phase 02 — Design Foundation only*