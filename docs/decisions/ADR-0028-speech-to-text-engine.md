# ADR-0028: Speech-to-Text (STT) Engine Selection

## Status
Accepted

## Context
As part of Phase 11, Omnia requires Speech-to-Text (STT) capabilities to allow users to dictate messages hands-free. We need an engine that can listen to the microphone, translate audio to text in real-time, and handle start/stop/abort states reliably within the Expo SDK 56 environment.

We evaluated two primary architectural paths:

**Option A (Cloud / API-based):** 
Record an audio file using `expo-audio` and send it to a cloud transcription service like OpenAI's Whisper API (`/v1/audio/transcriptions`).

**Option B (Native / Offline-first):** 
Use the operating system's native built-in Artificial Intelligence speech engines (Apple Siri Speech framework on iOS, Google Assistant SpeechRecognizer on Android).

## Decisions

### 1. Adopt `expo-speech-recognition` (Option B)
We will adopt **`expo-speech-recognition`**, a community-maintained library fully compatible with Expo SDK 56, to power **Native On-Device Dictation** (Option B). 

### 2. Rationale: Local-First Philosophy
Omnia allows users to run local LLM models (LM Studio, Ollama) without an internet connection. If we relied on Option A (Whisper API), the voice dictation feature would "break" whenever the user was offline, undermining the core offline capability. With native OS engines, dictation works 100% offline.

### 3. Rationale: Real-Time (Streaming) UX
With Option A (Whisper), the user must speak, press STOP, send the file to the cloud, wait, and only then does the text appear. With Option B (`expo-speech-recognition`), the text appears *while* the person is speaking, mimicking the native iOS keyboard and providing the expected FAANG-level real-time feedback.

### 4. Rationale: Zero Cost
Option A consumes API credits ($0.006 per minute for Whisper) for every second recorded. Option B leverages the device's hardware and OS entirely for free.

## Consequences
- **Positive:** Free, offline-capable, real-time typing feedback, high privacy.
- **Negative:** Accuracy depends on the device OS. Older Android devices might have slightly worse accuracy than a state-of-the-art cloud model like Whisper v3.
- **Build Requirement:** Because this library uses native code (Apple Speech / Android SpeechRecognizer), we must regenerate the native Android/iOS folders (`npx expo run:android`) after installation via the plugin config in `app.json`.
