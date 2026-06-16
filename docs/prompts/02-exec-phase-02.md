OMNIA — PHASE 02 EXECUTION ORDER

You are acting as a Senior Staff Engineer responsible for executing Phase 02 of the Omnia project.

Your objective is NOT to create features.

Your objective is to establish the design, navigation and component foundations that every future phase will depend on.

You must strictly follow the project documentation.

Do not improvise.

Do not skip documentation.

Do not anticipate future phases.

⸻

Repository Discovery (Mandatory)

Before making any code changes, perform a complete repository assessment.

Read and understand:

1. README.md
2. CONTRIBUTING.md (if present)
3. Bootstrap and engineering governance documentation
4. docs/architecture/\*
5. docs/adr/\*
6. docs/roadmap/\*
7. docs/design/\*
8. docs/phases/\*

Pay special attention to:

- Project vision
- Architectural principles
- Existing ADRs
- Repository conventions
- Coding standards
- Documentation standards

⸻

External Reference Analysis

Analyze the llama.cpp UI implementation located at:

/Users/marceloserra/Documents/coding/projects/open-source/llama.cpp/tools/ui

Study the implementation deeply.

The goal is NOT to copy code.

The goal is to extract:

- UX philosophy
- Layout strategy
- Navigation patterns
- Visual hierarchy
- Information density
- Component relationships
- Design language
- Interaction patterns

Also use ChatGPT Mobile as a secondary UX reference.

⸻

Phase Scope

You are executing:

Phase 02 — Design Foundation

You are NOT executing:

- Platform Foundation
- First Conversation
- Persistence
- Providers
- Model Management
- Attachments

Anything belonging to future phases is out of scope.

⸻

Before Implementation

Create a Repository Assessment Report.

The report must include:

Current State

- Repository structure
- Existing architecture
- Existing ADRs
- Existing documentation

Findings

- Strengths
- Weaknesses
- Missing design assets
- Missing governance

Risks

- Design risks
- Architecture risks
- Future maintainability risks

Execution Plan

Detailed plan for Phase 02.

Do not start implementation until the report is complete.

⸻

Mandatory Deliverables

Create:

docs/design/llama-ui-analysis.md
docs/design/design-principles.md
docs/design/design-tokens.md
docs/design/component-architecture.md
docs/design/mobile-navigation.md
docs/design/design-governance.md

⸻

Documentation Requirements

The llama.cpp analysis must be detailed enough that:

A new engineer who has never seen the llama.cpp UI can fully understand its UX philosophy, component hierarchy and navigation model without opening the original repository.

Documentation quality is a first-class deliverable.

⸻

Required ADRs

Create:

ADR-007-design-system-strategy.md
ADR-008-storybook-adoption.md
ADR-009-mobile-navigation-strategy.md
ADR-010-design-token-governance.md

Each ADR must include:

- Context
- Decision
- Consequences
- Alternatives Considered

Follow repository ADR conventions.

⸻

Storybook Requirements

Storybook becomes mandatory starting in Phase 02.

Storybook is considered a product asset.

Every reusable component must have Storybook coverage.

Future phases are not allowed to introduce reusable components without stories.

⸻

Required Storybook Components

Primitive Components:

- Button
- Input
- Card
- Avatar
- Divider
- IconButton

Composed Components:

- ChatBubble
- ChatComposer
- ConversationItem
- ProviderCard
- SettingsRow

Each story must contain:

- Default state
- Dark theme state
- Interaction examples
- Loading state when applicable

⸻

Theme System Requirements

Implement:

Light Theme

Primary experience.

Dark Theme

Fully supported.

The visual direction should be inspired by:

- ChatGPT Mobile
- llama.cpp UI
- Apple Human Interface Guidelines

Avoid:

- Material-heavy aesthetics
- Dashboard aesthetics
- Enterprise SaaS visual patterns

⸻

Design Token Requirements

The design system must define:

- Semantic Colors
- Typography Scale
- Spacing Scale
- Radius Scale
- Shadow Scale
- Motion Scale
- Iconography Rules
- Dark Theme Mapping
- Accessibility Considerations

No hardcoded design values should exist outside design tokens.

⸻

Visual Quality Standards

Prioritize:

- Whitespace
- Readable typography
- Low visual density
- Few borders
- Few colors
- Consistency

Avoid:

- Decorative UI
- Gradients
- Glassmorphism
- Neumorphism
- Flashy animations
- Excessive shadows

⸻

Visual Success Criteria

Compared to:

- ChatGPT Mobile
- llama.cpp UI

Omnia should be perceived as:

- Calmer
- Cleaner
- Less dense

than Open WebUI.

⸻

Explicit Non Goals

Do NOT implement:

- Networking
- OpenAI integration
- Anthropic integration
- Gemini integration
- LM Studio integration
- SQLite
- Persistence
- Streaming
- Conversations
- Model loading
- Provider management

These belong to future phases.

⸻

Required Execution Order

Step 1

Repository Assessment Report

STOP

⸻

Step 2

Documentation

STOP

⸻

Step 3

ADRs

STOP

⸻

Step 4

Storybook Setup

STOP

⸻

Step 5

Theme System

STOP

⸻

Step 6

Primitive Components

STOP

⸻

Step 7

Composed Components

STOP

⸻

Step 8

Storybook Stories

STOP

⸻

Step 9

Phase Completion Report

STOP

⸻

Completion Report

Provide:

- Files created
- ADRs created
- Components created
- Storybook coverage
- Theme coverage
- Design gaps
- Recommendations for Phase 03

⸻

Final Rule

Documentation quality is more important than implementation speed.

The output of Phase 02 must be a durable design system and experience foundation that future engineers and AI agents can use without redefining Omnia’s visual language.
