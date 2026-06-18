import * as FileSystem from 'expo-file-system';
// @ts-ignore
import { initWhisper } from 'whisper.rn';

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
