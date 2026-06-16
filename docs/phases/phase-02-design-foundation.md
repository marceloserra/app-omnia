Phase 02 — Design Foundation

Purpose

Establish Omnia’s visual language, design system, component architecture, navigation patterns, and user experience foundations before implementing product functionality.

This phase exists to define how Omnia looks, feels, and behaves.

This phase does not exist to implement business features.

⸻

Context

Phase 01 (Foundation) has already been completed.

The repository already contains:

- Monorepo structure
- Build pipeline
- CI/CD
- Project governance
- Engineering standards
- Initial architecture documentation

The application successfully builds and runs.

The next step is defining Omnia’s design language.

⸻

Design References

Primary Reference

Analyze the llama.cpp UI implementation located at:

/Users/marceloserra/Documents/coding/projects/open-source/llama.cpp/tools/ui

The objective is not to copy implementation details.

The objective is to understand:

- UX philosophy
- Visual hierarchy
- Layout composition
- Navigation patterns
- Component relationships
- Information density
- Interaction design
- Content prioritization

Secondary Reference

ChatGPT Mobile

Focus on:

- Simplicity
- Readability
- Conversation-first UX
- Mobile-native interactions

⸻

Analysis Quality Requirement

The llama.cpp analysis must be detailed enough that:

A new engineer who has never seen the llama.cpp UI can understand its design philosophy, navigation model, component structure, and user experience principles without opening the repository.

The resulting document should act as a design knowledge transfer artifact.

⸻

Design Objectives

Omnia should feel:

- Clean
- Calm
- Modern
- Fast
- Lightweight
- Mobile-native
- Conversation-focused

Omnia should NOT feel:

- Enterprise
- Dashboard-oriented
- Admin-panel-like
- Developer-centric
- Open WebUI-like
- Configuration-heavy

⸻

Required Documentation

docs/design/llama-ui-analysis.md

Required sections:

- Executive Summary
- Design Philosophy
- Navigation Analysis
- Layout Analysis
- Visual Hierarchy
- Component Inventory
- Interaction Patterns
- Mobile Adaptation Strategy
- What Omnia Should Copy
- What Omnia Should Avoid

⸻

docs/design/design-principles.md

Define Omnia’s official design principles.

At minimum:

- Conversation First
- Minimal Chrome
- Content Over Controls
- Fast Feedback
- Mobile First
- Progressive Disclosure
- Low Visual Noise

Each principle must include:

- Description
- Rationale
- Examples
- Anti-patterns

⸻

docs/design/design-tokens.md

Define:

Colors

- Semantic Colors
- Surface Colors
- Text Colors
- Status Colors

Typography

- Typography Scale
- Font Weights
- Line Heights

Layout

- Spacing Scale
- Radius Scale
- Elevation Scale
- Shadow Scale

Motion

- Motion Scale
- Transition Timing

Icons

- Iconography Rules

Accessibility

- Accessibility Considerations
- Contrast Rules

Theming

- Dark Theme Mapping
- Theme Inheritance Rules

Every token group must include rationale.

⸻

docs/design/component-architecture.md

Define:

Primitive Components

- Button
- IconButton
- Input
- Avatar
- Divider
- Card
- Sheet

Composed Components

- ChatBubble
- ChatComposer
- ConversationItem
- ProviderCard
- SettingsRow
- ModelSelector

Feature Components

- ChatScreen
- ConversationDrawer
- ProviderScreen
- SettingsScreen

Document:

- Responsibilities
- Ownership boundaries
- Composition rules
- Reuse rules

⸻

docs/design/mobile-navigation.md

Define:

- Navigation architecture
- Drawer strategy
- Conversation access
- Provider access
- Settings access
- Future extensibility

Include navigation diagrams.

⸻

docs/design/design-governance.md

Define:

- Token ownership
- Component ownership
- Design review process
- Future contribution rules
- Design approval process

⸻

Required ADRs

ADR-007 — Design System Strategy

Why Omnia adopts a design system before feature development.

⸻

ADR-008 — Storybook Adoption

Why Storybook is introduced now.

Must discuss:

- Component isolation
- Visual testing
- Design reviews
- Long-term maintainability

⸻

ADR-009 — Mobile Navigation Strategy

Why Omnia adopts a conversation-first navigation model.

⸻

ADR-010 — Design Token Governance

Why all future UI must be built on centralized design tokens.

⸻

Storybook Requirements

Storybook becomes mandatory starting in Phase 02.

Storybook is considered a product asset.

Every reusable component must have a corresponding Storybook story.

Future phases are NOT allowed to introduce reusable components without Storybook coverage.

⸻

Required Storybook Components

Create stories for:

Primitive Components

- Button
- Input
- Card
- IconButton
- Avatar
- Divider

Composed Components

- ChatBubble
- ChatComposer
- ConversationItem
- ProviderCard
- SettingsRow

Each story must include:

- Default state
- Dark theme state
- Loading state (when applicable)
- Interaction examples

⸻

Theme System

Implement:

Light Theme

Default experience.

Dark Theme

Fully supported.

Design Targets

- Apple Human Interface Guidelines
- ChatGPT Mobile
- llama.cpp UI

Avoid:

- Material-heavy aesthetics
- Enterprise dashboards
- Excessive visual density

⸻

Visual Quality Rules

Prioritize:

- Whitespace
- Readable typography
- Low visual density
- Few borders
- Few colors
- Consistency

Avoid:

- Decorative elements
- Gradients
- Glassmorphism
- Neumorphism
- Flashy animations
- Excessive shadows

⸻

Visual Success Criteria

When comparing Omnia to:

- ChatGPT Mobile
- llama.cpp UI

The resulting interface should be perceived as:

- Calmer
- Cleaner
- Less dense

than Open WebUI.

⸻

Explicit Non-Goals

Do NOT implement:

- Networking
- Provider Layer
- OpenAI
- Anthropic
- Gemini
- LM Studio
- SQLite
- Persistence
- Streaming
- Chat functionality
- Model loading

These belong to future phases.

⸻

Acceptance Criteria

Phase 02 is complete only if:

- All required documentation exists
- All required ADRs exist
- Storybook is operational
- Theme system is operational
- Design tokens exist
- Component architecture exists
- Core UI components exist
- Visual identity is clearly established
- Future phases can build features without redefining UI foundations

⸻

Definition of Done

Phase 02 is considered complete when:

1. Documentation is approved.
2. ADRs are approved.
3. Storybook is operational.
4. Theme system is operational.
5. Component architecture is documented.
6. Design governance exists.
7. Design tokens are finalized.
8. Future development can proceed without revisiting design foundations.

⸻

Stop Conditions

Stop immediately after all acceptance criteria are satisfied.

Do not implement any future-phase functionality.
