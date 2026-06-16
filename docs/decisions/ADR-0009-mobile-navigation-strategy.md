# ADR-0009: Mobile Navigation Strategy

## Status
Accepted

## Context
We need a navigation paradigm that keeps the user focused entirely on the conversation while allowing them to swap models, change settings, or jump between past chat sessions.

## Decision
We will utilize **Expo Router** and implement a **Drawer Navigation** paradigm as our root layout. The primary viewport will exclusively render the active conversation, while the drawer will house the list of past conversations and settings links. 

## Consequences
- **Positive:** Adheres to the "minimal chrome" design principle by hiding navigation when it is not actively needed.
- **Positive:** Provides a natural mapping to the `llama.cpp` desktop sidebar paradigm.
- **Negative:** Requires explicit installation of React Native gesture handler and reanimated native dependencies to avoid crashes.
