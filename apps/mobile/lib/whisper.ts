import * as FileSystem from 'expo-file-system/legacy';
// @ts-ignore
import { initWhisper } from 'whisper.rn/index.js';
// @ts-ignore
import { RealtimeTranscriber } from 'whisper.rn/realtime-transcription/RealtimeTranscriber.js';
// @ts-ignore
import { AudioPcmStreamAdapter } from 'whisper.rn/realtime-transcription/adapters/AudioPcmStreamAdapter.js';
const MODEL_URL = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin';
export const MODEL_FILE_PATH = `${(FileSystem as any).documentDirectory}ggml-tiny.bin`;

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

  console.log("[Whisper] Downloading ggml-tiny.bin model (~75MB)...");
  await downloadResumable.downloadAsync();
  console.log("[Whisper] Download complete!");
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
  console.log(`[Whisper] startWhisperRealtime requested. UI Language: ${language}`);
  
  const context = await getWhisperContext();
  if (!context) {
    console.error("[Whisper] Failed to start: Context is not initialized.");
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
  let promptHint = "The user is speaking in English. Here is the transcription:";
  if (language === 'pt') promptHint = "O usuário está falando em português. Aqui está a transcrição precisa e natural:";
  else if (language === 'es') promptHint = "El usuario está hablando en español. Aquí está la transcripción precisa e natural:";

  console.log(`[Whisper] Initializing RealtimeTranscriber with promptHint: "${promptHint}"`);

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
        // Use beam search instead of greedy to massively improve understanding of "tiny" model
        beamSize: 5,
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
        
        console.log(`\n[Whisper.onTranscribe] --- EVENT: ${evt.type} ---`);
        console.log(`[Whisper.onTranscribe] Slice: ${sliceIndex} | RecTime: ${recordingTime}ms | ProcTime: ${processTime}ms`);
        console.log(`[Whisper.onTranscribe] Detected Lang: ${detectedLang}`);
        console.log(`[Whisper.onTranscribe] Raw Text: "${rawResult}"`);

        let text = rawResult.trim();
        
        // Anti-hallucination filter for common Whisper artifacts during silence
        const lowerText = text.toLowerCase().replace(/[^a-z]/g, '');
        const hallucinations = ["thankyou", "thanksforwatching", "pleasesubscribe", "obrigado", "gracias", "silence", "music"];
        if (hallucinations.includes(lowerText)) {
          console.log(`[Whisper.onTranscribe] FILTERED OUT hallucination: "${text}"`);
          text = "";
        }
        
        // Also strip text inside brackets like [Música] or (silêncio)
        const oldText = text;
        text = text.replace(/\[.*?\]|\(.*?\)/g, '').trim();
        if (oldText !== text && oldText.length > 0) {
          console.log(`[Whisper.onTranscribe] STRIPPED BRACKETS. Old: "${oldText}" -> New: "${text}"`);
        }

        console.log(`[Whisper.onTranscribe] Final Text Emitted: "${text}" | isCapturing: ${evt.isCapturing}`);
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
