import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Message } from "@omnia/shared-types";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_SECONDARY = "#94a3b8";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <View style={styles.systemContainer}>
        <Text style={styles.systemText}>
          {message.content}
        </Text>
      </View>
    );
  }

  const timeString = new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isUser) {
    return (
      <View style={[styles.container, styles.userContainer]}>
        <LinearGradient
          colors={["#4f46e5", "#6366f1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.userBubble]}
        >
          <Text style={styles.text}>{message.content}</Text>
          <Text style={[styles.metaText, styles.userMetaText]}>
            {timeString}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  // Assistant bubble
  return (
    <View style={[styles.container, styles.assistantContainer]}>
      <BlurView intensity={20} tint="dark" style={[styles.bubble, styles.assistantBubble]}>
        <Text style={styles.text}>{message.content}</Text>
        <Text style={styles.metaText}>
          {timeString} {message.modelId ? ` · ${message.modelId}` : ""}
        </Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  systemContainer: {
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 32,
  },
  systemText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  container: {
    flexDirection: "row",
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  assistantContainer: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    borderRadius: 20,
    borderBottomRightRadius: 6,
    shadowColor: INDIGO,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  assistantBubble: {
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  text: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 24,
  },
  metaText: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    marginTop: 6,
  },
  userMetaText: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
});
