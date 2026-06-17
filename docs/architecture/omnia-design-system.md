# Omnia Design System

## Overview
The **Omnia Design System** (ODS) is a premium, FAANG-tier UI framework engineered specifically for the Omnia mobile application. It merges the fluid, gesture-driven ergonomics of Apple's Human Interface Guidelines (HIG) with modern aesthetic paradigms like glassmorphism, contextual elevation, and subtle haptics.

## Core Principles

### 1. Native-First Ergonomics
- **Bottom Sheets over Modals:** Use anchored Bottom Sheets (metadinhas) for complex selections (e.g., Model Pickers) to ensure effortless one-handed usability on large devices.
- **Grouped Lists:** Implement native iOS-style grouped configurations (`iosGroup`, `iosRow`) with mathematically precise hairline dividers (`StyleSheet.hairlineWidth`), respecting the leading icon margins.
- **Gesture Discoverability:** Integrate bi-directional Swipe Actions for lists (Trailing for destructive actions, Leading for state changes like Pinning), backed by `onLongPress` fallbacks to intuitively teach users the gestures.

### 2. Premium Aesthetics
- **Semantic Color Palette:** Deep, semantic palettes supporting flawless Dark Mode transitions. We utilize deep darks (e.g., `#05050f`) for OLED efficiency and stark whites in light mode, offset by subtle, tinted surface layers (`surface`, `surface2`).
- **Typography:** High-contrast weights. We utilize bold, commanding headers (`800` weight for `largeTitle` at 28pt) contrasting with highly legible, muted secondary text. Inputs and forms use left-aligned typography to naturally accommodate long strings (like URLs and API keys).
- **Iconography:** Clean, unboxed `lucide-react-native` vectors mapped semantically (e.g., `Brain` for OpenAI, `Bot` para Llama, `Sparkles` para Claude). Colorful background squares (`iosIconContainer`) are used specifically in Settings to evoke the classic Apple environment.

### 3. Offline Resilience
- **Bundled Assets:** Core provider representations and model avatars are bundled natively via vectors rather than relying on external CDNs (Wikimedia, etc.), ensuring the UI remains robust, fast, and fully functional in completely offline, local-LLM scenarios.

### 4. Component Catalog (Storybook Integration)
The system is built on atomic, reusable, and strictly typed React Native components, which are primed for documentation in **Storybook**:
- `ModelPickerSheet`: The ergonomic model selector.
- `ConfirmDialog`: The universal, destructive-action safety net.
- `SwipeableRow`: The gesture-driven list item foundation.
- `Input` & `Button`: Foundational UI primitives.

## Naming Convention
Internally and externally, we refer to this aesthetic and component library as the **Omnia Design System**. It represents our commitment to delivering a polished, world-class user experience.
