import React, { useState } from "react";
import { View, TextInput, Pressable } from "react-native";
import { Send } from "lucide-react-native";

const SURFACE = "#13112a";
const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f0efff";
const BORDER = "rgba(99,102,241,0.3)";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#0a0918",
        borderTopWidth: 1,
        borderTopColor: BORDER,
        gap: 10,
      }}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Message Omnia..."
        placeholderTextColor="rgba(157,155,204,0.5)"
        multiline
        maxLength={4000}
        style={{
          flex: 1,
          backgroundColor: SURFACE,
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 10,
          fontSize: 15,
          color: TEXT_PRIMARY,
          borderWidth: 1,
          borderColor: BORDER,
          maxHeight: 120,
        }}
        onSubmitEditing={handleSend}
        editable={!disabled}
      />
      <Pressable
        onPress={handleSend}
        disabled={!text.trim() || disabled}
        style={({ pressed }) => ({
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: text.trim() && !disabled ? INDIGO : "rgba(99,102,241,0.3)",
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Send size={18} color="#fff" />
      </Pressable>
    </View>
  );
}
