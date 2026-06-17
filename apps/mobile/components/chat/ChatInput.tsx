import React, { useState } from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Send, Square } from "lucide-react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

const SURFACE = "rgba(0,0,0,0.4)";
const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f8fafc";
const BORDER = "rgba(255,255,255,0.08)";

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming = false, disabled = false }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setText("");
  };

  const handleStop = () => {
    if (onStop) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onStop();
    }
  };

  return (
    <BlurView intensity={30} tint="dark" style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Message Omnia..."
        placeholderTextColor="rgba(148, 163, 184, 0.5)"
        multiline
        maxLength={4000}
        style={styles.input}
        editable={!disabled && !isStreaming}
      />
      {isStreaming ? (
        <Pressable
          onPress={handleStop}
          style={({ pressed }) => [
            styles.button,
            styles.stopButton,
            pressed && { opacity: 0.7 }
          ]}
        >
          <Square size={14} color="#f8fafc" fill="#f8fafc" />
        </Pressable>
      ) : (
        <Pressable
          onPress={handleSend}
          disabled={!text.trim() || disabled}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: text.trim() && !disabled ? INDIGO : "rgba(255,255,255,0.05)" },
            pressed && { opacity: 0.8 }
          ]}
        >
          <Send size={16} color={text.trim() && !disabled ? "#fff" : "rgba(255,255,255,0.3)"} style={{ marginLeft: 2 }} />
        </Pressable>
      )}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: BORDER,
    maxHeight: 120,
    minHeight: 44,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  stopButton: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
