import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Keyboard,
  Text,
  Alert,
  ScrollView,
  ActivityIndicator,
  PermissionsAndroid,
  Modal,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withDelay } from 'react-native-reanimated';
import { ArrowUp, Square, Plus, FileText, Mic } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Localization from "expo-localization";
import { getWhisperContext, isModelDownloaded, downloadWhisperModel, startWhisperRealtime } from "../../lib/whisper";

import { useTheme, ThemePalette } from "../../lib/theme";
import { useTranslation } from "../../lib/i18n";
import { useSettingsStore } from "../../store/settings-store";
import { AttachmentPill, Attachment } from "./AttachmentPill";
import { AttachmentMenu } from "./AttachmentMenu";

export interface ChatInputProps {
  onSend: (text: string, attachments?: Attachment[]) => void;
  onStop?: () => void;
  onPressDisabled?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  onFocus?: () => void;
}

function WaveformBar({ delay, isRecording, theme }: { delay: number; isRecording: boolean; theme: ThemePalette }) {
  const height = useSharedValue(4);

  React.useEffect(() => {
    if (isRecording) {
      height.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(14, { duration: 350 }),
            withTiming(4, { duration: 350 })
          ),
          -1,
          true
        )
      );
    } else {
      height.value = withTiming(4, { duration: 200 });
    }
  }, [isRecording, delay, height]);

  const style = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View style={[{ width: 3, backgroundColor: theme.red, borderRadius: 2, marginHorizontal: 1.5 }, style]} />
  );
}

export function ChatInput({
  onSend,
  onStop,
  onPressDisabled,
  isStreaming = false,
  disabled = false,
  onFocus,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isPickingFile, setIsPickingFile] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDownloadingModel, setIsDownloadingModel] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(-1);
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);
  const [whisperSession, setWhisperSession] = useState<{ stop: () => Promise<void> } | null>(null);
  const textBeforeDictation = useRef("");
  const inputRef = useRef<TextInput>(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled;

  // Real-time Whisper Dictation
  const startWhisperDictation = async () => {
    try {
      setIsDownloadingModel(true);
      await getWhisperContext(); // Ensure model is loaded
      setIsDownloadingModel(false);
      
      setIsRecording(true);
      textBeforeDictation.current = text;
      
      const { stop } = await startWhisperRealtime((transcript, isCapturing) => {
        if (transcript) {
          const prefix = textBeforeDictation.current ? textBeforeDictation.current + (textBeforeDictation.current.endsWith(" ") ? "" : " ") : "";
          setText(prefix + transcript.trim());
        }
        if (!isCapturing) {
          setIsRecording(false);
          setWhisperSession(null);
        }
      }, (err) => {
        console.warn("Whisper STT Error:", err);
        setIsRecording(false);
        setWhisperSession(null);
      });
      
      setWhisperSession({ stop });
      
    } catch (err: any) {
      console.warn("Whisper STT Error:", err);
      setIsDownloadingModel(false);
      setIsRecording(false);
      Alert.alert("Dictation Error", err?.message || String(err));
    }
  };

  const handleDictation = async () => {
    if (isRecording && whisperSession) {
      await whisperSession.stop();
      setIsRecording(false);
      setWhisperSession(null);
      return;
    }
    
    // Request Microphone Permission
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(t("chat.input.mic_permission_denied") || "Microphone permission is required.");
        return;
      }
    }

    const downloaded = await isModelDownloaded();
    if (!downloaded) {
      setShowDownloadPrompt(true);
      return;
    }

    startWhisperDictation();
  };

  const confirmDownload = async () => {
    setShowDownloadPrompt(false);
    try {
      setIsDownloadingModel(true);
      setDownloadProgress(0);
      await downloadWhisperModel((p) => setDownloadProgress(p));
      setIsDownloadingModel(false);
      setDownloadProgress(-1);
      startWhisperDictation();
    } catch (e) {
      Alert.alert("Error", "Download failed. Check your connection.");
      setIsDownloadingModel(false);
      setDownloadProgress(-1);
    }
  };

  const handleSendPress = () => {
    if (disabled && onPressDisabled) {
      onPressDisabled();
      return;
    }
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;
    
    if (useSettingsStore.getState().hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onSend(trimmed, attachments);
    setText("");
    setAttachments([]);
    inputRef.current?.clear();
  };

  const handleAttachPress = () => {
    Keyboard.dismiss();
    setMenuVisible(true);
  };

  const handleAttachOption = async (option: 'camera' | 'library' | 'files') => {
    setMenuVisible(false);
    const messages = ["working...", "bubbling...", "omning..."];
    setLoadingText(messages[Math.floor(Math.random() * messages.length)]);
    setIsPickingFile(true);
    
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 50)));
    
    try {
      switch (option) {
        case 'camera': {
        const camPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (!camPerm.granted) return;
        const camResult = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
        if (!camResult.canceled && camResult.assets[0]) {
          const asset = camResult.assets[0];
          setAttachments((prev) => [
            ...prev,
            { uri: asset.uri, name: asset.fileName || "photo.jpg", type: "image", mimeType: asset.mimeType, size: asset.fileSize },
          ]);
        }
        break;
      }
      case 'library': {
        const libResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images', 'videos'],
          quality: 0.8,
          allowsMultipleSelection: true,
        });
        if (!libResult.canceled && libResult.assets) {
          const newAtts = libResult.assets.map((asset) => ({
            uri: asset.uri,
            name: asset.fileName || "photo.jpg",
            type: "image" as const,
            mimeType: asset.mimeType,
            size: asset.fileSize,
          }));
          setAttachments((prev) => [...prev, ...newAtts]);
        }
        break;
      }
      case 'files': {
        try {
          const docResult = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'text/*'],
            copyToCacheDirectory: Platform.OS === 'ios',
            multiple: true,
          });
          if (!docResult.canceled && docResult.assets) {
            const newAtts = docResult.assets.map((asset) => ({
              uri: asset.uri,
              name: asset.name,
              type: "document" as const,
              mimeType: asset.mimeType,
              size: asset.size,
            }));
            setAttachments((prev) => [...prev, ...newAtts]);
          }
        } catch (err) {
          console.error("DocumentPicker error:", err);
          Alert.alert("File Error", "Could not pick the requested file. Make sure it is downloaded to your device.");
        }
          break;
        }
      }
    } finally {
      setIsPickingFile(false);
    }
  };

  const handleStop = () => {
    if (useSettingsStore.getState().hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (onStop) {
      onStop();
    }
  };

  return (
    <View style={styles.outerContainer}>
      
      {/* Premium Download Modal */}
      <Modal visible={showDownloadPrompt} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBg}>
              <Mic size={28} color={theme.indigo} />
            </View>
            <Text style={styles.modalTitle}>Voice Engine Required</Text>
            <Text style={styles.modalText}>
              To use incredibly fast, 100% offline dictation, Omnia needs to download the 75MB Whisper AI Engine.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowDownloadPrompt(false)}
                style={({ pressed }) => [styles.modalBtnCancel, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmDownload}
                style={({ pressed }) => [styles.modalBtnConfirm, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.modalBtnConfirmText}>Download</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <AttachmentMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSelect={handleAttachOption}
      />
      <View style={[styles.inputCard, isFocused && styles.inputCardFocused]}>
        
        {/* Attachments UI (Pills) */}
        {(attachments.length > 0 || isPickingFile) && (
          <View style={styles.attachmentsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {attachments.map((att, idx) => (
                <AttachmentPill key={`${att.uri}-${idx}`} attachment={att} onRemove={() => setAttachments(p => p.filter((_, i) => i !== idx))} />
              ))}
              {isPickingFile && (
                <View style={{ 
                  flexDirection: "row", alignItems: "center", 
                  backgroundColor: theme.activeBg, 
                  paddingHorizontal: 12, paddingVertical: 8, 
                  borderRadius: 14, borderWidth: 1, borderColor: theme.border,
                  marginRight: 8, height: 36, opacity: 0.6
                }}>
                  <FileText size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: "500" }}>
                    {loadingText}
                  </Text>
                  <ActivityIndicator size="small" color={theme.textSecondary} style={{ marginLeft: 8 }} />
                </View>
              )}
            </ScrollView>
          </View>
        )}

        <View style={styles.inputRow}>
          <Pressable 
            onPress={handleAttachPress}
            disabled={isPickingFile}
            style={({ pressed }) => [styles.attachBtn, pressed && { opacity: 0.6 }]}
          >
            {isPickingFile ? (
              <ActivityIndicator size="small" color={theme.textSecondary} />
            ) : (
              <Plus size={24} color={theme.textSecondary} />
            )}
          </Pressable>

            {/* Text field AND Recording UI */}
            <View style={{ flex: 1, position: 'relative' }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', position: 'relative' }}>
                <TextInput
                  ref={inputRef}
                  value={text}
                  onChangeText={setText}
                  placeholder={isDownloadingModel ? "Downloading AI Engine..." : t("chat.input.placeholder")}
                  placeholderTextColor={isDownloadingModel ? theme.indigo : theme.textMuted}
                  multiline
                  maxLength={4000}
                  style={[styles.textInput, { 
                    paddingRight: isRecording ? 100 : 40, 
                    paddingBottom: isDownloadingModel ? 14 : 12 
                  }]}
                  onSubmitEditing={Platform.OS !== "ios" ? handleSendPress : undefined}
                  blurOnSubmit={false}
                  editable={!isDownloadingModel}
                  returnKeyType="send"
                  enablesReturnKeyAutomatically
                  scrollEnabled
                  onFocus={() => {
                    setIsFocused(true);
                    if (onFocus) onFocus();
                  }}
                  onBlur={() => setIsFocused(false)}
                  testID="chat-input"
                />

                {isRecording ? (
                  <View style={{ position: 'absolute', right: 8, bottom: 6, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', height: 16, marginRight: 12 }}>
                      <WaveformBar delay={0} isRecording={isRecording} theme={theme} />
                      <WaveformBar delay={150} isRecording={isRecording} theme={theme} />
                      <WaveformBar delay={300} isRecording={isRecording} theme={theme} />
                      <WaveformBar delay={100} isRecording={isRecording} theme={theme} />
                      <WaveformBar delay={250} isRecording={isRecording} theme={theme} />
                    </View>
                    <Pressable 
                      onPress={handleDictation}
                      style={({ pressed }) => [
                        { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: theme.red + '20' },
                        pressed && { opacity: 0.7 }
                      ]}
                      accessibilityLabel="Stop dictation"
                    >
                      <Square size={14} color={theme.red} fill={theme.red} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable 
                    onPress={handleDictation} 
                    disabled={isDownloadingModel}
                    style={({ pressed }) => [
                      { position: 'absolute', right: 8, bottom: 6, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
                      pressed && { backgroundColor: theme.activeBg },
                      isDownloadingModel && { opacity: 0.5 }
                    ]}
                    accessibilityLabel="Dictate message"
                  >
                    <Mic size={20} color={isDownloadingModel ? theme.indigo : theme.textMuted} />
                  </Pressable>
                )}
              </View>

              {/* Elegant Thin Progress Bar at the bottom of the input */}
              {isDownloadingModel && downloadProgress >= 0 && (
                <View style={{ position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, backgroundColor: 'transparent', overflow: 'hidden', borderRadius: 1 }}>
                  <View style={{ height: '100%', width: `${Math.max(5, downloadProgress * 100)}%`, backgroundColor: theme.indigo }} />
                </View>
              )}
            </View>

          {/* Action button column */}
          <View style={styles.actionCol}>
            {isRecording ? null : isStreaming ? (
              <Pressable
                onPress={handleStop}
                style={({ pressed }) => [styles.sendBtn, styles.stopBtn, pressed && { opacity: 0.75 }]}
                accessibilityLabel="Stop generating"
              >
                <Square size={16} color={theme.textPrimary} />
              </Pressable>
            ) : (
              <Pressable
                onPress={handleSendPress}
                disabled={!canSend}
                style={({ pressed }) => [
                  styles.sendBtn,
                  canSend ? styles.sendBtnActive : styles.sendBtnIdle,
                  pressed && canSend && { opacity: 0.8 },
                ]}
                accessibilityLabel="Send message"
                testID="send-message-button"
              >
                <ArrowUp
                  size={20}
                  color={canSend ? "#ffffff" : theme.textMuted}
                  strokeWidth={3}
                />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Tiny hint */}
      <Text style={styles.hint}>
        {disabled ? t("chat.input.disabled") : t("chat.input.hint")}
      </Text>
    </View>
  );
}

const createStyles = (theme: ThemePalette) => StyleSheet.create({
  outerContainer: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: Platform.select({ ios: 28, android: 16 }),
    backgroundColor: "transparent",
    // Transparent — the pill inputCard provides its own background
  },
  inputCard: {
    flexDirection: "column",
    backgroundColor: theme.surface2,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: theme.border,
    paddingTop: 8,
    paddingLeft: 8,
    paddingRight: 6,
    paddingBottom: 6,
    minHeight: 52,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  attachmentsRow: {
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 4,
    paddingBottom: 12,
  },
  inputCardFocused: {
    borderColor: theme.indigo,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
    marginBottom: 0,
  },
  textInput: {
    flex: 1,
    color: theme.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 140,
    minHeight: 40, // Matches button height perfectly
    paddingTop: 9,
    paddingBottom: 9,
    marginRight: 0,
    textAlignVertical: "top",
  },
  actionCol: {
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnActive: {
    backgroundColor: theme.indigo,
    shadowColor: theme.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  sendBtnIdle: {
    backgroundColor: theme.activeBg,
  },
  stopBtn: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  recordingOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 40,
    backgroundColor: theme.red + '10', // Extremely faint red tint
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.red + '40',
  },
  recordingText: {
    color: theme.red,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  stopDictationBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.red + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    color: theme.textMuted,
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: theme.surface2,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 24,
  },
  modalIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.indigo + '15',
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: theme.activeBg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalBtnCancelText: {
    color: theme.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  modalBtnConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: theme.indigo,
    alignItems: "center",
    shadowColor: theme.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalBtnConfirmText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
