import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { Message } from "@omnia/shared-types";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import Markdown, { ASTNode } from "react-native-markdown-display";
import { CheckCircle2, Copy } from "lucide-react-native";

const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_SECONDARY = "#94a3b8";
const CODE_BG = "#0d0c1d";
const CODE_BORDER = "rgba(99,102,241,0.2)";

interface MessageBubbleProps {
  message: Message;
}

// ─── Native code block (no external lib, zero crash risk) ───────────────────
function CodeBlock({ content, language }: { content: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(content);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={codeStyles.wrapper}>
      {/* Header bar */}
      <View style={codeStyles.header}>
        <Text style={codeStyles.lang}>{language || "code"}</Text>
        <Pressable
          onPress={handleCopy}
          style={({ pressed }) => [codeStyles.copyBtn, pressed && { opacity: 0.7 }]}
          hitSlop={8}
        >
          {copied ? (
            <CheckCircle2 size={14} color="#a5b4fc" />
          ) : (
            <Copy size={14} color={TEXT_SECONDARY} />
          )}
          <Text style={[codeStyles.copyLabel, copied && { color: "#a5b4fc" }]}>
            {copied ? " Copied" : " Copy"}
          </Text>
        </Pressable>
      </View>
      {/* Code content */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={codeStyles.scrollContent}
      >
        <Text style={codeStyles.code} selectable>
          {content.trimEnd()}
        </Text>
      </ScrollView>
    </View>
  );
}

const codeStyles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: CODE_BG,
    borderWidth: 1,
    borderColor: CODE_BORDER,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: CODE_BORDER,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  lang: {
    color: "#818cf8",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "lowercase",
    letterSpacing: 0.8,
    fontFamily: "Courier",
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  copyLabel: {
    color: TEXT_SECONDARY,
    fontSize: 12,
  },
  scrollContent: {
    padding: 14,
  },
  code: {
    color: "#e2e8f0",
    fontFamily: "Courier",
    fontSize: 13,
    lineHeight: 20,
  },
});

// ─── Markdown render rules ───────────────────────────────────────────────────
const renderRules = {
  fence: (node: ASTNode) => (
    <CodeBlock
      key={node.key}
      content={String(node.content || "")}
      language={String((node as any).sourceInfo || "")}
    />
  ),
  code_inline: (node: ASTNode, _children: any, _parent: any, styles: any) => (
    <Text key={node.key} style={styles.code_inline}>
      {String(node.content || "")}
    </Text>
  ),
};

// ─── Markdown styles ─────────────────────────────────────────────────────────
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
    backgroundColor: "rgba(99,102,241,0.15)",
    color: "#c084fc",
    fontFamily: "Courier",
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 14,
  },
  fence: {
    // Handled by renderRules above
    margin: 0,
    padding: 0,
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
  heading3: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e2e8f0",
    marginTop: 8,
    marginBottom: 4,
  },
  list_item: {
    marginBottom: 4,
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#6366f1",
    paddingLeft: 12,
    marginVertical: 8,
    opacity: 0.85,
  },
  strong: {
    fontWeight: "700",
    color: "#fff",
  },
  em: {
    fontStyle: "italic",
  },
});

// ─── MessageBubble ───────────────────────────────────────────────────────────
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
        <Text style={styles.systemText}>{message.content}</Text>
      </View>
    );
  }

  const timeString = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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
        <Markdown style={markdownStyles} rules={renderRules}>
          {message.content}
        </Markdown>

        <View style={[styles.metaRow, { justifyContent: "flex-start" }]}>
          {copied && <CheckCircle2 size={12} color={TEXT_SECONDARY} style={{ marginRight: 4 }} />}
          <Text style={styles.metaText}>
            {copied
              ? "Copied"
              : `${timeString}${message.modelId ? ` · ${message.modelId}` : ""}`}
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
    paddingHorizontal: 12,
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  assistantContainer: {
    justifyContent: "flex-start",
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    maxWidth: "88%",
    borderRadius: 20,
    borderBottomRightRadius: 6,
    shadowColor: INDIGO,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  assistantBubble: {
    maxWidth: "96%",
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
