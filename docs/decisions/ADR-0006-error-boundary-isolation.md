# ADR 0006: React Error Boundary Isolation

## Status
Accepted

## Context
React Native applications are prone to fatal "Red Screen of Death" crashes during development or immediate process death in production when an unhandled Javascript exception escapes the React tree. To ensure the AI telemetry system (ADR 0005) captures these failures before the app dies, we need a mechanism to gracefully intercept rendering errors.

## Decision
We implemented a global React `ErrorBoundary` component at the absolute root of the application hierarchy (`apps/mobile/app/_layout.tsx`). 
- When an error is thrown anywhere in the UI tree, the `ErrorBoundary` catches it using `componentDidCatch`.
- It synchronously passes the `Error` object and React component stack trace to the `@omnia/logger` telemetry service.
- It prevents the app from crashing by rendering a safe, stylized fallback UI ("Oops! Something went wrong") containing the stack trace, allowing the user to copy the error or continue using the app if it's recoverable.

## Consequences
- **Positive:** Fatal UI crashes are neutralized into graceful fallback screens. Error data is guaranteed to be intercepted and written to disk for AI consumption.
- **Negative:** Errors occurring outside the React lifecycle (e.g., inside native modules, asynchronous background fetch callbacks, or Redux/Zustand middleware) will bypass the `ErrorBoundary`. These must be handled with explicit `try/catch` blocks or global `ErrorUtils.setGlobalHandler`.
