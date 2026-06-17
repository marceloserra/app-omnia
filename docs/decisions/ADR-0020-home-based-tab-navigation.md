# ADR-0020: Home-Based Tab Navigation Pattern (Premium UI/UX)

## Status
Accepted — Phase 09

## Context
In ADR-0014, we adopted a "Chat-first" architecture with a Drawer (Hamburger) menu, mimicking older iterations of ChatGPT and Gemini. While functional, user feedback and modern UI analysis revealed that this approach felt cluttered and less premium on modern iOS devices. The Drawer pattern required a hamburger icon constantly present in the chat header, adding visual noise to the conversation area.

To achieve a "FAANG-grade", visionOS-inspired, and Apple-native aesthetic, we need to separate the utility of starting a chat from the ecosystem hub of the application. Modern flagship AI interfaces (like Pi by Inflection, Arc Browser, and the ChatGPT Mac app) utilize a centralized "Hub" or "Home" with a distinct Tab Navigation system, moving away from legacy Drawer menus.

## Decision
1. **Pivot to Tab-Based Architecture:** We adopted `expo-router` Tabs. The root index `app/(tabs)/index.tsx` is now a dedicated "Home Dashboard" instead of an immediate chat screen.
2. **Floating Pill Tab Bar:** Implemented a custom `TabBar.tsx` that uses Glassmorphism (`BlurView`) to hover over the bottom of the screen. It contains ultra-minimalist, synergistic flat icons: `Home`, `MessageSquare` (History), `SquarePen` (New Chat), and `Settings`.
3. **Full-Screen Immersive Chat:** The Chat screens (`app/chat/new.tsx` and `app/chat/[conversationId].tsx`) are now isolated in a Native Stack above the Tabs. This ensures that when a user is chatting, the Tab Bar disappears, allowing the Chat Input and Keyboard to cleanly anchor to the bottom of the screen. The hamburger menu icon is replaced by a simple `ChevronLeft` back button.
4. **SectionList History:** Replaced the legacy single-list history with an Apple HIG standard `SectionList` grouping conversations by relative time ("Today", "Yesterday", "Previous 7 Days").

## Consequences
### Positive
* **Premium Aesthetic:** The app feels exceptionally modern, cohesive, and aligned with Apple's HIG and Spatial Computing design language.
* **Reduced Visual Noise:** Chat screens are now 100% dedicated to conversation content without navigation elements cluttering the footer or header.
* **Scalability:** The Hub/Tabs architecture easily allows adding new primary areas (like "Agents", "Files", or "Discover") without overcrowding a slide-out drawer.

### Negative
* **Extra Tap to Chat:** Users opening the app now land on the Home Dashboard and must tap the "New Chat" icon or a suggestion card to begin typing, instead of immediately seeing an active keyboard. This trade-off is accepted for the sake of the premium UX and broader feature scalability.
