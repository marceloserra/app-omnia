import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Keyboard,
  Text,
} from "react-native";
import { ArrowUp, Square } from "lucide-react-native";
import * as Haptics from "expo-haptics";

const BG = "#05050f";
const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_MUTED = "rgba(148, 163, 184, 0.4)";
const INPUT_BG = "#131320"; // clean surface color without borders

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const canSend = text.trim().length > 0 && !disabled;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(trimmed);
    setText("");
    inputRef.current?.clear();
  };

  const handleStop = () => {
    if (onStop) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onStop();
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* The pill-shaped input card */}
      <View style={styles.inputCard}>
        {/* Text field */}
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder={disabled ? "Connect a provider in Settings…" : "Message Omnia…"}
          placeholderTextColor={TEXT_MUTED}
          multiline
          maxLength={4000}
          style={styles.textInput}
          onSubmitEditing={Platform.OS !== "ios" ? handleSend : undefined}
          blurOnSubmit={false}
          editable={!disabled}
          returnKeyType="send"
          enablesReturnKeyAutomatically
          scrollEnabled
        />

        {/* Action button row */}
        <View style={styles.actionRow}>
          {isStreaming ? (
            // Stop button
            <Pressable
              onPress={handleStop}
              style={({ pressed }) => [styles.sendBtn, styles.stopBtn, pressed && { opacity: 0.75 }]}
              accessibilityLabel="Stop generating"
            >
              <Square size={16} color="#fff" fill="#fff" />
            </Pressable>
          ) : (
            // Send button — lights up when there's text
            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              style={({ pressed }) => [
                styles.sendBtn,
                canSend ? styles.sendBtnActive : styles.sendBtnIdle,
                pressed && canSend && { opacity: 0.8 },
              ]}
              accessibilityLabel="Send message"
            >
              <ArrowUp
                size={18}
                color={canSend ? "#fff" : "rgba(255,255,255,0.25)"}
                strokeWidth={2.5}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Tiny hint */}
      <Text style={styles.hint}>
        {disabled ? "No provider connected" : "Omnia can make mistakes. Check important info."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    backgroundColor: "transparent",
  },
  inputCard: {
    backgroundColor: INPUT_BG,
    borderRadius: 26,
    paddingTop: 12,
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
  },
  textInput: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 140,
    minHeight: 26,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: "top",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 2,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnActive: {
    backgroundColor: INDIGO,
    shadowColor: INDIGO,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnIdle: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  stopBtn: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  hint: {
    color: "rgba(148,163,184,0.35)",
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 0.2,
  },
});
