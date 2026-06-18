import { useState, useRef, useEffect } from "react";
import { Platform, Alert } from "react-native";
import { PermissionsAndroid } from "react-native";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { logger } from "@omnia/logger";
import { getWhisperContext, isModelDownloaded, startWhisperRealtime } from "../lib/whisper";
import { useTranslation } from "../lib/i18n";

export type DictationState = {
  isRecording: boolean;
  transcript: string;
  usingCloudFallback: boolean;
  isDownloadingModel: boolean;
};

export function useDictation() {
  const { t, language } = useTranslation();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isDownloadingModel, setIsDownloadingModel] = useState(false);
  const [usingCloudFallback, setUsingCloudFallback] = useState(false);
  
  const partialDictationText = useRef("");
  const isStartingDictation = useRef(false);
  const whisperSession = useRef<{ stop: () => Promise<void> } | null>(null);

  // Used to stream the partial text out to the component
  const [liveTranscript, setLiveTranscript] = useState("");

  const commitDictationText = () => {
    const final = partialDictationText.current;
    setIsRecording(false);
    whisperSession.current = null;
    setUsingCloudFallback(false);
    setLiveTranscript("");
    return final;
  };

  // --- Cloud STT Strategy ---
  useSpeechRecognitionEvent("result", (event) => {
    if (!usingCloudFallback) return;
    const transcript = event.results[0]?.transcript || "";
    partialDictationText.current = transcript.trim();
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (!usingCloudFallback) return;
    logger.error("Dictation", "Cloud STT Error", event);
    setIsRecording(false);
    setUsingCloudFallback(false);
  });

  const startCloudStrategy = async () => {
    try {
      const perms = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perms.granted) {
        Alert.alert(t("chat.input.mic_permission_denied") || "Microphone permission is required.");
        return;
      }
      
      setIsRecording(true);
      partialDictationText.current = "";
      setUsingCloudFallback(true);
      
      await ExpoSpeechRecognitionModule.start({
        lang: language === 'auto' ? 'en-US' : language,
        interimResults: true,
      });
      
    } catch (err: any) {
      logger.error("Dictation", "Cloud Setup Error", err);
      setIsRecording(false);
      setUsingCloudFallback(false);
      Alert.alert("Dictation Error", err?.message || String(err));
    }
  };

  // --- Whisper STT Strategy ---
  const startWhisperStrategy = async () => {
    try {
      await getWhisperContext();
      setIsDownloadingModel(false);
      
      setIsRecording(true);
      partialDictationText.current = "";
      
      const { stop } = await startWhisperRealtime(language, (transcript, isCapturing) => {
        if (transcript) {
          partialDictationText.current = transcript.trim();
        }
      }, (err) => {
        logger.error("Dictation", "Whisper STT Error", err);
        setIsRecording(false);
        whisperSession.current = null;
      });
      
      whisperSession.current = { stop };
      
    } catch (err: any) {
      logger.error("Dictation", "Whisper Setup Error", err);
      setIsDownloadingModel(false);
      setIsRecording(false);
      Alert.alert("Dictation Error", err?.message || String(err));
    }
  };

  // --- Public API ---
  const startDictation = async () => {
    if (isStartingDictation.current) return;
    isStartingDictation.current = true;
    
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(t("chat.input.mic_permission_denied") || "Microphone permission is required.");
        isStartingDictation.current = false;
        return;
      }
    }

    try {
      const downloaded = await isModelDownloaded();
      if (!downloaded) {
        await startCloudStrategy();
      } else {
        await startWhisperStrategy();
      }
    } finally {
      isStartingDictation.current = false;
    }
  };

  const stopDictation = async (): Promise<string> => {
    if (!isRecording) return "";
    
    if (usingCloudFallback) {
      await ExpoSpeechRecognitionModule.stop();
    } else if (whisperSession.current) {
      try {
        await whisperSession.current.stop();
      } catch (e) {
        logger.error("Dictation", "Error stopping whisper", e);
      }
    }
    
    return commitDictationText();
  };

  return {
    startDictation,
    stopDictation,
    state: {
      isRecording,
      usingCloudFallback,
      isDownloadingModel,
    }
  };
}
