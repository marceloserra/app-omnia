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
} from "react-native";
import { ArrowUp, Square, Plus, FileText } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

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
  const inputRef = useRef<TextInput>(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled;

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
    
    // ── PRINCIPAL FAANG FIX ──
    // `InteractionManager` was deprecated in RN 0.76+. The modern standard for yielding 
    // to animations before launching heavyweight Intents without arbitrary long delays
    // is combining requestAnimationFrame (waits for next layout/paint) with a tiny setTimeout
    // (pushes execution to the back of the JS task queue).
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
            copyToCacheDirectory: Platform.OS === 'ios', // REQUIRED on iOS for security-scoped URLs. On Android, false prevents silent cancel bugs with Drive files.
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

          {/* Text field */}
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder={t("chat.input.placeholder")}
          placeholderTextColor={theme.textMuted}
          multiline
          maxLength={4000}
          style={styles.textInput}
          onSubmitEditing={Platform.OS !== "ios" ? handleSendPress : undefined}
          blurOnSubmit={false}
          editable={true}
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

          {/* Action button column */}
          <View style={styles.actionCol}>
            {isStreaming ? (
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
    marginRight: 12,
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
  hint: {
    color: theme.textMuted,
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 0.2,
  },
});
