# ADR 0024: RAM Cache for SQLite Storage

Date: 2026-06-17

## Superseded

This ADR was superseded on 2026-06-17. The RAM cache was removed because it does not scale on mobile (unbounded memory growth). The actual root cause of perceived latency was `setMessages([])` clearing the UI before new data loaded. Since `router.setParams` does not remount the component, simply removing that clear call eliminates the flash with zero caching overhead. See the revised implementation in `apps/mobile/app/chat/[conversationId].tsx`.

## Status

Superseded

## Context

As the number of messages in a conversation grows, synchronously querying the SQLite database for the entire message history blocks the React Native JavaScript thread. Because markdown parsing and rendering are also computationally heavy, querying the database and rendering the `FlatList` simultaneously causes severe UI thread drops. This manifests as a frozen UI ("segundinho pra carregar"), leading users to mistakenly tap chats twice because the initial navigation action is visually delayed or blocked by the bridge bottleneck.

To maintain a fluid, SPA-like navigation experience with zero-latency screen transitions, we need to eliminate the SQLite I/O bottleneck during screen mounts.

## Decision

We will implement an in-memory RAM cache layer directly within the UI store layer (via Zustand) to cache conversation histories.

1. **Zustand Cache Store**: We will create a `useChatCacheStore` that maps `conversationId` to an array of `Message` objects.
2. **Read-Through Architecture**: When `ChatScreen` mounts, it will instantly load messages from the RAM cache. If the cache is empty (cache miss), it will asynchronously query SQLite, update the UI, and populate the cache.
3. **Write-Through Architecture**: Whenever a new message is sent or received, the cache will be updated synchronously to guarantee immediate UI consistency, followed by a background SQLite insert.
4. **Memory Management**: To prevent unbounded memory growth, the cache will be restricted to the most recently active conversations (e.g., retaining the last 5 accessed chats) or we can simply allow the JS garbage collector to manage it if we only cache the active conversation.

## Consequences

- **Positive**: Screen transitions will be instant. The Drawer closing animation will not be interrupted. The "click twice" illusion will disappear.
- **Negative**: Adds state synchronization complexity between the SQLite repository and the Zustand cache.
- **Mitigation**: We will ensure the `ChatScreen` acts as the single source of truth for hydrating the cache, avoiding scattered cache invalidation logic.
