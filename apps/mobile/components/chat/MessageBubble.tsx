import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Message } from "@omnia/shared-types";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import Markdown from "react-native-markdown-display";
import { CheckCircle2 } from "lucide-react-native";

const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_SECONDARY = "#94a3b8";

interface MessageBubbleProps {
  message: Message;
}

// Markdown theme to match the FAANG dark aesthetic
const markdownStyles = StyleSheet.create({
  body: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 24,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
  code_inline: {
    backgroundColor: "rgba(0,0,0,0.3)",
    color: "#c084fc", // violet highlight for inline code
    fontFamily: "Courier",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  fence: {
    backgroundColor: "rgba(0,0,0,0.4)",
    color: "#a78bfa", // softer purple for large code blocks
    fontFamily: "Courier",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginVertical: 8,
    overflow: "hidden",
  },
  link: {
    color: "#818cf8",
    textDecorationLine: "underline",
  },
  heading1: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginTop: 12,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginTop: 10,
    marginBottom: 6,
  },
  list_item: {
    marginBottom: 4,
  },
  bullet_list: {
    marginBottom: 8,
  },
});

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.content);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      <Pressable 
        style={[styles.container, styles.userContainer]}
        onLongPress={handleCopy}
        delayLongPress={300}
      >
        <LinearGradient
          colors={["#4f46e5", "#6366f1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.userBubble]}
        >
          <Text style={styles.text}>{message.content}</Text>
          <View style={styles.metaRow}>
            {copied && <CheckCircle2 size={12} color="#fff" style={{ marginRight: 4 }} />}
            <Text style={[styles.metaText, styles.userMetaText]}>
              {copied ? "Copied" : timeString}
            </Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  // Assistant bubble
  return (
    <Pressable 
      style={[styles.container, styles.assistantContainer]}
      onLongPress={handleCopy}
      delayLongPress={300}
    >
      <BlurView intensity={20} tint="dark" style={[styles.bubble, styles.assistantBubble]}>
        
        {/* Render Rich Markdown for AI responses */}
        <Markdown style={markdownStyles}>
          {message.content}
        </Markdown>

        <View style={[styles.metaRow, { justifyContent: "flex-start" }]}>
          {copied && <CheckCircle2 size={12} color={TEXT_SECONDARY} style={{ marginRight: 4 }} />}
          <Text style={styles.metaText}>
            {copied ? "Copied" : `${timeString} ${message.modelId ? ` · ${message.modelId}` : ""}`}
          </Text>
        </View>
      </BlurView>
    </Pressable>
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
    maxWidth: "90%",
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
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  metaText: {
    color: TEXT_SECONDARY,
    fontSize: 11,
  },
  userMetaText: {
    color: "rgba(255,255,255,0.7)",
  },
});
