# Phase 06 - Provider Management

## Goal
Allow users to switch between local and cloud providers dynamically via the settings screen.

## What Was Built
- Added a dedicated `Settings` screen.
- Implemented visual connection status indicators (checking if endpoints are reachable).
- Added forms to configure OpenAI API Keys and Local AI API Bases (LM Studio).
- Persisted active provider choice and credentials to secure storage / local settings.

## Key Decisions
- Ephemeral network connection states (`isConnected`) are not heavily guarded to avoid locking users out of the UI; we assume optimistic UI where users can attempt to send messages and rely on error handling if the provider is down.
