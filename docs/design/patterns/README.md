# UI Patterns — Omnia Mobile

This directory contains design pattern documentation for Omnia's recurring UI components and interaction patterns. Each pattern describes **what the component is**, **why it is designed that way**, and **how to implement it consistently**.

## Patterns

| Pattern | Category | Phase |
|---|---|---|
| [ProviderStatusChip](./provider-status-chip.md) | Navigation · Status Feedback | 8 |
| [TypingIndicator](./typing-indicator.md) | Feedback · Animation | 8 |

## How to Add a Pattern

When a new reusable UI pattern is introduced:

1. Create a new `.md` file in this directory named after the component (kebab-case).
2. Follow the structure of existing patterns: What It Is → Visual Anatomy → Styles Reference → Composition → Rationale → Do Not.
3. Reference the ADR if a formal architecture decision was made.
4. Update the table above.
