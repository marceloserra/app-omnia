# ADR-0028: Speech-to-Text (STT) Engine Selection

## Status
Accepted

## Context
As part of Phase 11, Omnia requires Speech-to-Text (STT) capabilities to allow users to dictate messages hands-free. We need an engine that can listen to the microphone, translate audio to text in real-time, and handle start/stop/abort states reliably within the Expo SDK 56 environment.

We considered two architectural approaches:
1. **Cloud-Based Audio API:** Use `expo-audio` to record an `.m4a`/`.wav` file, then upload it to OpenAI's Whisper API (`/v1/audio/transcriptions`).
2. **Native On-Device Dictation:** Use the OS-level speech recognition engines (Apple Speech framework on iOS and Google SpeechRecognizer on Android).

## Decisions

### 1. Adopt `expo-speech-recognition`
We will adopt **`expo-speech-recognition`** (a community-maintained library fully compatible with Expo SDK 56) to power **Native On-Device Dictation** instead of relying on Cloud APIs like Whisper.

### 2. Justification: Offline & Local-LLM Philosophy
Omnia's core value proposition is supporting Local AI (e.g., LM Studio, Ollama). If a user is offline and talking to a local model, dictation must still work. Cloud APIs (like Whisper) would break this offline workflow. Native OS dictation works completely offline on modern iOS and Android devices.

### 3. Justification: Real-Time Streaming (FAANG UX)
Cloud APIs require the user to stop recording before transcription begins (batch processing). Native STT provides a real-time stream of partial results, allowing us to show the text appearing in the input box *as the user speaks*, which is the expected industry standard.

### 4. Justification: Cost Efficiency
Native dictation is completely free. Relying on Whisper API would incur extra costs ($0.006 / minute) for every audio message the user sends.

## Consequences
- **Positive:** Free, offline-capable, real-time typing feedback, high privacy.
- **Negative:** Accuracy depends on the device OS. Older Android devices might have slightly worse accuracy than a state-of-the-art cloud model like Whisper v3.
- **Build Requirement:** Because this library uses native code (Apple Speech / Android SpeechRecognizer), we must regenerate the native Android/iOS folders (`npx expo run:android`) after installation via the plugin config in `app.json`.
