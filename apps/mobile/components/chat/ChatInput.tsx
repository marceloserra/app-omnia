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
  onPressDisabled?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onStop,
  onPressDisabled,
  isStreaming = false,
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const canSend = text.trim().length > 0 && !disabled;

  const handleSendPress = () => {
    if (disabled && onPressDisabled) {
      onPressDisabled();
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;
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
          placeholder="Message Omnia…"
          placeholderTextColor={TEXT_MUTED}
          multiline
          maxLength={4000}
          style={styles.textInput}
          onSubmitEditing={Platform.OS !== "ios" ? handleSendPress : undefined}
          blurOnSubmit={false}
          editable={true}
          returnKeyType="send"
          enablesReturnKeyAutomatically
          scrollEnabled
        />

        {/* Action button column */}
        <View style={styles.actionCol}>
          {isStreaming ? (
            <Pressable
              onPress={handleStop}
              style={({ pressed }) => [styles.sendBtn, styles.stopBtn, pressed && { opacity: 0.75 }]}
              accessibilityLabel="Stop generating"
            >
              <Square size={16} color="#f8fafc" fill="#f8fafc" />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSendPress}
              disabled={text.trim().length === 0}
              style={({ pressed }) => [
                styles.sendBtn,
                text.trim().length > 0 ? styles.sendBtnActive : styles.sendBtnIdle,
                pressed && text.trim().length > 0 && { opacity: 0.8 },
              ]}
              accessibilityLabel="Send message"
            >
              <ArrowUp
                size={20}
                color={text.trim().length > 0 ? "#ffffff" : "rgba(255,255,255,0.4)"}
                strokeWidth={3}
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
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: INPUT_BG,
    borderRadius: 26,
    paddingTop: 8,
    paddingLeft: 18,
    paddingRight: 6,
    paddingBottom: 6,
    minHeight: 52,
  },
  textInput: {
    flex: 1,
    color: TEXT_PRIMARY,
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
    backgroundColor: INDIGO, // #6366f1
    shadowColor: INDIGO,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  sendBtnIdle: {
    backgroundColor: "rgba(255,255,255,0.12)", // Now it has a visible, solid grey background even when empty
  },
  stopBtn: {
    backgroundColor: "#1e1e2e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
