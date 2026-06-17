# ADR 0018: Provider Management Global Switch

## Status
Accepted

## Context
As the application supports multiple AI providers (OpenAI Cloud and Local Network AI like LM Studio), users need a way to easily know which provider is active, configure credentials without accidentally swapping active providers, and disconnect local servers when leaving their network. Previously, saving a configuration in any tab silently made it the active provider, creating ambiguity.

## Decision
We decided to implement a **Global Provider Switch** model (Option B from `provider_ux_review.md`).
1. **Active State Representation:** The Settings screen acts as the source of truth. The segmented control indicates the globally active provider with a green dot (`#10b981`).
2. **Action Segregation:** The "Save" button was split into context-aware actions:
   - "Set Active": Changes the global active provider.
   - "Update Provider": Saves credentials for the currently active provider.
   - "Disconnect": A destructive but safe action that sets `activeProviderId` to `null` without wiping the saved IP/Base URL.
3. **Empty States:** The home screen empty state catches `!activeProviderId` and redirects the user to the Settings screen to select one.

## Consequences
- **Positive:** Users have 100% clarity on what AI engine is currently powering their conversations. They can keep a Local AI Base URL saved for home use, but easily disconnect it and switch to OpenAI when on cellular data.
- **Negative:** Users cannot mix providers within a single conversation thread natively (e.g., prompt OpenAI, then prompt Local AI in the same chat) without going to Settings first. This is an acceptable tradeoff for phase 8.
