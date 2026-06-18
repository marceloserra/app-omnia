import * as FileSystem from 'expo-file-system';
// @ts-ignore
import { initWhisper } from 'whisper.rn';

const MODEL_URL = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin';
const MODEL_FILE_PATH = `${(FileSystem as any).documentDirectory}ggml-tiny.bin`;

let globalWhisperContext: any = null;

export async function getWhisperContext(): Promise<any> {
  if (globalWhisperContext) {
    return globalWhisperContext;
  }

  const fileInfo = await FileSystem.getInfoAsync(MODEL_FILE_PATH);
  
  if (!fileInfo.exists) {
    console.log("[Whisper] Downloading ggml-tiny.bin model (~75MB)...");
    const downloadRes = await FileSystem.downloadAsync(MODEL_URL, MODEL_FILE_PATH);
    console.log("[Whisper] Download complete at:", downloadRes.uri);
  } else {
    console.log("[Whisper] Model already exists locally.");
  }
  
  console.log("[Whisper] Initializing Context...");
  globalWhisperContext = await initWhisper({
    filePath: MODEL_FILE_PATH,
  });
  
  return globalWhisperContext;
}
