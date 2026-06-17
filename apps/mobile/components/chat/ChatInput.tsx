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
} from "react-native";
import { ArrowUp, Square, Plus } from "lucide-react-native";

import { useTheme, ThemePalette } from "../../lib/theme";
import { useTranslation } from "../../lib/i18n";

export interface ChatInputProps {
  onSend: (text: string) => void;
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
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const canSend = text.trim().length > 0 && !disabled;

  const handleSendPress = () => {
    if (disabled && onPressDisabled) {
      onPressDisabled();
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    inputRef.current?.clear();
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* The pill-shaped input card */}
      <View style={[styles.inputCard, isFocused && styles.inputCardFocused]}>
        <Pressable 
          onPress={() => Alert.alert(t("chat.input.attach.title"), t("chat.input.attach.msg"))}
          style={({ pressed }) => [styles.attachBtn, pressed && { opacity: 0.6 }]}
        >
          <Plus size={24} color={theme.textSecondary} />
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

      {/* Tiny hint */}
      <Text style={styles.hint}>
        {disabled ? t("chat.input.disabled") : t("chat.input.hint")}
      </Text>
    </View>
  );
}

const createStyles = (theme: ThemePalette) => StyleSheet.create({
  outerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: Platform.select({ ios: 32, android: 20 }),
    // Transparent — the inputCard provides its own pill background
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "flex-end",
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
