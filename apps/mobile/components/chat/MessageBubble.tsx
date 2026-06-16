import React from "react";
import { View, Text } from "react-native";
import { Message } from "@omnia/shared-types";

const INDIGO = "#6366f1";
const SURFACE = "#13112a";
const TEXT_PRIMARY = "#f0efff";
const TEXT_SECONDARY = "#9d9bcc";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <View style={{ alignItems: "center", marginVertical: 8, paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 12, color: TEXT_SECONDARY, textAlign: "center", fontStyle: "italic" }}>
          {message.content}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginVertical: 4,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          maxWidth: "80%",
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: isUser ? 18 : 18,
          borderBottomRightRadius: isUser ? 4 : 18,
          borderBottomLeftRadius: isUser ? 18 : 4,
          backgroundColor: isUser ? INDIGO : SURFACE,
          borderWidth: isUser ? 0 : 1,
          borderColor: "rgba(99,102,241,0.2)",
        }}
      >
        <Text style={{ color: TEXT_PRIMARY, fontSize: 15, lineHeight: 22 }}>
          {message.content}
        </Text>
        <Text style={{ color: TEXT_SECONDARY, fontSize: 11, marginTop: 4, textAlign: isUser ? "right" : "left" }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {message.modelId ? ` · ${message.modelId}` : ""}
        </Text>
      </View>
    </View>
  );
}
