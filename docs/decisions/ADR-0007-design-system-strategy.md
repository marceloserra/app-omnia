# ADR-0007: Design System Strategy

## Status
Amended (NativeWind Abandoned in Phase 07)

## Context
Phase 02 originally introduced NativeWind for building primitive components. However, in Phase 07, severe stability and layout corruption issues were discovered in Android during the transition to SDK 56. The NativeWind babel plugin was hijacking React Native primitives and failing silently when complex native dependencies (like `react-native-reanimated`) were removed, causing catastrophic UI collapses (all components collapsing to the left without `gap` or `margin` support).

## Decision
We have completely eradicated `nativewind` and `tailwindcss` from the project. All primitive UI components and screens MUST be built using pure React Native `StyleSheet.create` with explicit layout properties. We will maintain the clean, FAANG-level aesthetic manually using robust Flexbox rules, `useSafeAreaInsets()`, and explicit dimensions.

## Consequences
- **Positive:** Total immunity to third-party layout bugs. The app layout is now lightning-fast, rock-solid, and identical on iOS and Android.
- **Positive:** Removed complex Babel configurations and Metro interceptors, significantly improving build stability and reducing bundle size.
- **Negative:** We lose utility-class convenience, but the trade-off is worth the stability for a production-grade app.
