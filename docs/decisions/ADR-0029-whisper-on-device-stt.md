# ADR-0029: Whisper.cpp On-Device STT (Supersedes ADR-0028)

## Status
Accepted

## Context
In Phase 11, we initially adopted `expo-speech-recognition` (ADR-0028) which relies on the OS-level native Speech Recognizer (`SpeechRecognizer` on Android, `SFSpeechRecognizer` on iOS). While this provided a lightweight, zero-footprint solution, we encountered critical limitations:
1. **Accuracy**: The OS-level models struggle significantly with local accents, mumbled words, and fast speech compared to state-of-the-art models.
2. **Device Fragmentation**: Some Android manufacturers (like Xiaomi or older Samsung devices) fail to trigger the correct offline models, resulting in persistent `no-speech` timeout errors.
3. **Local-First Philosophy**: Relying on OS models means the OS will secretly route audio to Google/Apple servers if the device is deemed too old or the language pack is missing, violating strict offline constraints.

To achieve FAANG-level accuracy and true offline privacy, we need to run a Neural Network locally. OpenAI's Whisper model is the industry standard.

## Decision
We will adopt **`whisper.rn`**, a React Native binding for `whisper.cpp`, to run Whisper on-device.

### Technical Approach:
1. **Model Management**: We will NOT bundle the `.bin` or `.gguf` files directly in the APK/IPA, as this would violate app store size best practices and create massive binary downloads for users who don't want Voice Dictation. Instead, we will use `expo-file-system` to download `ggml-tiny.bin` (~75MB) from Hugging Face to the `FileSystem.documentDirectory` the first time the user taps the microphone.
2. **Realtime Transcription**: We will use the modern `whisperContext.transcribeRealtime` (or equivalent streaming implementation) with VAD (Voice Activity Detection) to ensure silence is skipped and transcription feels as instant as ChatGPT.
3. **Graceful Fallback**: If the download fails or the device is too weak, we show a clean error message rather than crashing.

## Consequences
- **Pros**:
  - Unmatched transcription accuracy across multiple languages and accents.
  - 100% offline and private. Audio never leaves the device.
  - Consistent behavior across all Android/iOS hardware (no `no-speech` OS bugs).
- **Cons**:
  - Requires a ~75MB model download on first use.
  - Increased CPU and battery usage during dictation.
  - Requires native C++ compilation (`prebuild`), moving us firmly away from Expo Go (which was already accepted).

## References
- `whisper.rn` documentation and `whisper.cpp` architecture.
- Replaces ADR-0028.
