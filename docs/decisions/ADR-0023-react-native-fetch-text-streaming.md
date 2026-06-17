# ADR 0023: React Native Fetch Text Streaming

## Status
Accepted

## Context
Omnia aims to deliver a "FAANG-tier" chat experience. A core requirement of this experience is a near-zero Time to First Token (TTFT) and a buttery-smooth real-time streaming effect as the Large Language Model (LLM) generates responses. 

During testing, we observed that while the LLM on the server (whether local via LM Studio/Ollama or cloud via OpenAI) was generating tokens instantly, the React Native application appeared to "think" for 2-5 seconds and then abruptly flush a massive chunk of text to the UI.

This behavior occurs because React Native's default `fetch` implementation buffers HTTP streaming responses over the bridge. It waits for the buffer to reach a certain threshold before passing the chunks across the JSI (JavaScript Interface) bridge from the native network layer to the JavaScript thread. This buffering breaks Server-Sent Events (SSE) and real-time chunk yielding.

## Decision
We decided to bypass the native network buffering layer by using the React Native specific `fetch` option: `reactNative: { textStreaming: true }`.

```typescript
const response = await fetch(`${baseUrl}/chat/completions`, {
  method: "POST",
  headers: this.getHeaders(config),
  body: JSON.stringify({...}),
  reactNative: { textStreaming: true } // <-- The fix
} as any);
```

## Consequences

### Positive
- **Instantaneous Streaming:** The UI now updates token-by-token in true real-time, drastically reducing the perceived TTFT.
- **Better Haptic Sync:** Typing haptics now map perfectly to the actual token generation speed, improving the premium physical feel of the app.
- **No Extra Dependencies:** We avoid the need to install third-party SSE polyfills (like `react-native-sse` or `eventsource`), relying entirely on the modern React Native `fetch` API.

### Negative
- **TypeScript Workaround:** Because `reactNative` is a non-standard property on the standard Web API `RequestInit` type, we have to cast the configuration object to `any` (or augment the global interface) to pass the TypeScript compiler.
- **High Bridge Traffic:** Streaming token-by-token increases the frequency of cross-bridge messages. However, since the text payload per chunk is tiny and modern Hermes/JSI handles this efficiently, the performance trade-off is completely justified for the UX gain.
