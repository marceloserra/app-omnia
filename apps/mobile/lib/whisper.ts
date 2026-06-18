import * as FileSystem from 'expo-file-system/legacy';
// @ts-ignore
import { initWhisper } from 'whisper.rn/index.js';
// @ts-ignore
import { RealtimeTranscriber } from 'whisper.rn/realtime-transcription/RealtimeTranscriber.js';
// @ts-ignore
import { AudioPcmStreamAdapter } from 'whisper.rn/realtime-transcription/adapters/AudioPcmStreamAdapter.js';
import { logger } from '@omnia/logger';
const MODEL_URL = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin';
export const MODEL_FILE_PATH = `${(FileSystem as any).documentDirectory}ggml-base.bin`;

let globalWhisperContext: any = null;

export async function isModelDownloaded(): Promise<boolean> {
  const fileInfo = await FileSystem.getInfoAsync(MODEL_FILE_PATH);
  return fileInfo.exists;
}

export async function downloadWhisperModel(onProgress?: (progress: number) => void): Promise<void> {
  const fileInfo = await FileSystem.getInfoAsync(MODEL_FILE_PATH);
  if (fileInfo.exists) return;

  const downloadResumable = FileSystem.createDownloadResumable(
    MODEL_URL,
    MODEL_FILE_PATH,
    {},
    (downloadProgress) => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      if (onProgress) onProgress(progress);
    }
  );

  console.log("[Whisper] Downloading ggml-base.bin model (~142MB)...");
  logger.info("Whisper", "Downloading ggml-base.bin model (~142MB)...");
  await downloadResumable.downloadAsync();
  logger.info("Whisper", "Download complete!");
}

export async function deleteWhisperModel(): Promise<void> {
  try {
    if (globalWhisperContext) {
      await globalWhisperContext.release();
      globalWhisperContext = null;
    }
  } catch (e) {
    console.warn("Failed to release whisper context:", e);
  }
  
  const fileInfo = await FileSystem.getInfoAsync(MODEL_FILE_PATH);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(MODEL_FILE_PATH);
  }
}

export async function getWhisperContext(): Promise<any> {
  if (globalWhisperContext) {
    return globalWhisperContext;
  }

  const downloaded = await isModelDownloaded();
  if (!downloaded) {
    throw new Error("Whisper model not downloaded yet. Please download it in Settings.");
  }
  
  console.log("[Whisper] Initializing Context...");
  globalWhisperContext = await initWhisper({
    filePath: MODEL_FILE_PATH,
  });
  
  return globalWhisperContext;
}

let globalTranscriber: any = null;

export async function startWhisperRealtime(
  language: string,
  onResult: (text: string, isCapturing: boolean) => void,
  onError?: (err: any) => void
): Promise<{ stop: () => Promise<void> }> {
  logger.info("Whisper", `startWhisperRealtime requested. UI Language: ${language}`);
  
  const context = await getWhisperContext();
  if (!context) {
    logger.error("Whisper", "Failed to start: Context is not initialized.");
    throw new Error("Whisper context not initialized");
  }

  // Always recreate the transcriber to ensure clean state and avoid "only works first time" bug
  if (globalTranscriber) {
    try {
      await globalTranscriber.stop();
    } catch (e) {
      // ignore
    }
    globalTranscriber = null;
  }

  // Create a contextual prompt to guide the model towards the UI language,
  // while still allowing it to auto-detect and transcribe other languages.
  let promptHint = "The user is speaking in English to the AI assistant Omnia. Here is the transcription:";
  if (language === 'pt') promptHint = "O usuário está falando em português com a inteligência artificial Omnia. Aqui está a transcrição precisa e natural:";
  else if (language === 'es') promptHint = "El usuario está hablando en español con la inteligencia artificial Omnia. Aquí está la transcripción precisa e natural:";

  logger.info("Whisper", `Initializing RealtimeTranscriber with promptHint: "${promptHint}"`);

  const audioStream = new AudioPcmStreamAdapter();
  globalTranscriber = new RealtimeTranscriber(
    {
      whisperContext: context,
      audioStream,
    },
    {
      // Keep buffer small so inference doesn't take exponentially longer
      audioSliceSec: 15,
      // Process every 800ms instead of 200ms to eliminate CPU choke and UI lag
      realtimeProcessingPauseMs: 800,
      initRealtimeAfterMs: 500,
      initialPrompt: promptHint,
      transcribeOptions: {
        language: 'auto',
        temperature: 0.0,
      }
    },
    {
      onTranscribe: (evt: any) => {
        const rawResult = evt.data?.result || "";
        const detectedLang = evt.data?.language || "unknown";
        const processTime = evt.processTime;
        const recordingTime = evt.recordingTime;
        const sliceIndex = evt.sliceIndex;
        
        logger.debug("Whisper.onTranscribe", `EVENT: ${evt.type} | Slice: ${sliceIndex} | RecTime: ${recordingTime}ms | ProcTime: ${processTime}ms | Detected Lang: ${detectedLang}`);
        logger.debug("Whisper.onTranscribe", `Raw Text: "${rawResult}"`);

        let text = rawResult.trim();
        
        // Anti-hallucination filter for common Whisper artifacts during silence
        const lowerText = text.toLowerCase().replace(/[^a-z]/g, '');
        const hallucinations = ["thankyou", "thanksforwatching", "pleasesubscribe", "obrigado", "gracias", "silence", "music"];
        if (hallucinations.includes(lowerText)) {
          logger.debug("Whisper.onTranscribe", `FILTERED OUT hallucination: "${text}"`);
          text = "";
        }
        
        // Also strip text inside brackets like [Música] or (silêncio)
        const oldText = text;
        text = text.replace(/\[.*?\]|\(.*?\)/g, '').trim();
        if (oldText !== text && oldText.length > 0) {
          logger.debug("Whisper.onTranscribe", `STRIPPED BRACKETS. Old: "${oldText}" -> New: "${text}"`);
        }

        logger.debug("Whisper.onTranscribe", `Final Text Emitted: "${text}" | isCapturing: ${evt.isCapturing}`);
        onResult(text, evt.isCapturing);
      },
      onError: (err: any) => {
        if (onError) onError(err);
      }
    }
  );

  await globalTranscriber.start();

  return {
    stop: async () => {
      if (globalTranscriber) {
        await globalTranscriber.stop();
        globalTranscriber = null;
      }
    }
  };
}
