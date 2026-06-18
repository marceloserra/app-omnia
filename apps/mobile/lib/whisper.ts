import * as FileSystem from 'expo-file-system/legacy';
// @ts-ignore
import { initWhisper } from 'whisper.rn';
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
  const context = await getWhisperContext();

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
  else if (language === 'es') promptHint = "El usuario está hablando en español. Aquí está la transcripción precisa y natural:";

  const audioStream = new AudioPcmStreamAdapter();
  globalTranscriber = new RealtimeTranscriber(
    {
      whisperContext: context,
      audioStream,
    },
    {
      audioSliceSec: 60,
      realtimeProcessingPauseMs: 200,
      initRealtimeAfterMs: 200,
      initialPrompt: promptHint,
      transcribeOptions: {
        language: 'auto',
      }
    },
    {
      onTranscribe: (evt: any) => {
        let text = (evt.data?.result || "").trim();
        
        // Anti-hallucination filter for common Whisper artifacts during silence
        const lowerText = text.toLowerCase().replace(/[^a-z]/g, '');
        const hallucinations = ["thankyou", "thanksforwatching", "pleasesubscribe", "obrigado", "gracias", "silence", "music"];
        if (hallucinations.includes(lowerText)) {
          text = "";
        }
        
        // Also strip text inside brackets like [Música] or (silêncio)
        text = text.replace(/\[.*?\]|\(.*?\)/g, '').trim();

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
