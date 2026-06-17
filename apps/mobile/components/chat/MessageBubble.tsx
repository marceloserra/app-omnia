import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { Message } from "@omnia/shared-types";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import Markdown, { ASTNode } from "react-native-markdown-display";
import { CheckCircle2, Copy } from "lucide-react-native";
import { TypingIndicator } from "../ui/TypingIndicator";
import { useTheme, ThemePalette } from "../../lib/theme";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

function CodeBlock({ content, language, theme }: { content: string; language?: string; theme: ThemePalette }) {
  const codeStyles = React.useMemo(() => createCodeStyles(theme), [theme]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={codeStyles.wrapper}>
      <View style={codeStyles.header}>
        <Text style={codeStyles.lang}>{language || "code"}</Text>
        <Pressable
          onPress={handleCopy}
          style={({ pressed }) => [codeStyles.copyBtn, pressed && { opacity: 0.7 }]}
          hitSlop={8}
        >
          {copied ? (
            <CheckCircle2 size={14} color={theme.indigo} />
          ) : (
            <Copy size={14} color={theme.textSecondary} />
          )}
          <Text style={[codeStyles.copyLabel, copied && { color: theme.indigo }]}>
            {copied ? " Copied" : " Copy"}
          </Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={codeStyles.scroll} contentContainerStyle={{ padding: 16 }}>
        <Text style={codeStyles.content} selectable>
          {content.trimEnd()}
        </Text>
      </ScrollView>
    </View>
  );
}

const createCodeStyles = (theme: ThemePalette) => StyleSheet.create({
  wrapper: {
    marginVertical: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.surface2,
    borderWidth: 1,
    borderColor: theme.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.activeBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  lang: {
    color: theme.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  copyLabel: {
    color: theme.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
  },
  scroll: {
    maxHeight: 400,
  },
  content: {
    color: theme.textPrimary,
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    lineHeight: 20,
  },
});

const renderRules = (theme: ThemePalette, tableStyles: any) => ({
  fence: (node: ASTNode) => (
    <CodeBlock
      key={node.key}
      content={String(node.content || "")}
      language={String((node as any).sourceInfo || "")}
      theme={theme}
    />
  ),
  code_inline: (node: ASTNode, _children: any, _parent: any, styles: any) => (
    <Text key={node.key} style={styles.code_inline}>
      {String(node.content || "")}
    </Text>
  ),
  table: (node: ASTNode, children: any) => (
    <ScrollView key={node.key} horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled={true} style={tableStyles.tableScroll} contentContainerStyle={{ flexGrow: 1, minWidth: "100%", paddingBottom: 8 }}>
      <View style={tableStyles.table}>{children}</View>
    </ScrollView>
  ),
  thead: (node: ASTNode, children: any) => (
    <View key={node.key} style={tableStyles.thead}>{children}</View>
  ),
  tbody: (node: ASTNode, children: any) => (
    <View key={node.key}>{children}</View>
  ),
  tr: (node: ASTNode, children: any, parent: any) => {
    const isHeader = parent && parent[0]?.type === "thead";
    return (
      <View key={node.key} style={[tableStyles.tr, isHeader && tableStyles.trHeader]}>
        {children}
      </View>
    );
  },
  th: (node: ASTNode, children: any) => (
    <View key={node.key} style={[tableStyles.cell, tableStyles.th]}>
      <Text style={tableStyles.thText}>{children}</Text>
    </View>
  ),
  td: (node: ASTNode, children: any) => (
    <View key={node.key} style={tableStyles.cell}>
      <Text style={tableStyles.tdText}>{children}</Text>
    </View>
  ),
});

const createTableStyles = (theme: ThemePalette) => StyleSheet.create({
  tableScroll: {
    marginVertical: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    overflow: "hidden",
  },
  thead: {
    backgroundColor: theme.activeBg,
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  trHeader: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  cell: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    minWidth: 80,
    justifyContent: "center",
  },
  th: {},
  thText: {
    color: theme.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  tdText: {
    color: theme.textSecondary,
    fontSize: 13,
  },
});

const createMarkdownStyles = (theme: ThemePalette) => StyleSheet.create({
  body: {
    color: theme.textPrimary,
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: -0.1,
  },
  paragraph: { marginTop: 0, marginBottom: 12 },
  code_inline: {
    backgroundColor: theme.activeBg,
    color: theme.indigo,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 14,
  },
  fence: { margin: 0, padding: 0 },
  link: { color: theme.indigo, textDecorationLine: "underline" },
  heading1: { fontSize: 20, fontWeight: "700", color: theme.textPrimary, marginTop: 12, marginBottom: 8 },
  heading2: { fontSize: 18, fontWeight: "600", color: theme.textPrimary, marginTop: 10, marginBottom: 6 },
  heading3: { fontSize: 16, fontWeight: "600", color: theme.textPrimary, marginTop: 8, marginBottom: 4 },
  list_item: { marginBottom: 4 },
  bullet_list: { marginBottom: 8 },
  ordered_list: { marginBottom: 12 },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: theme.indigo,
    paddingLeft: 14,
    marginVertical: 10,
    opacity: 0.9,
  },
  strong: { fontWeight: "700", color: theme.textPrimary },
  em: { fontStyle: "italic" },
});

export const MessageBubble = React.memo(({ message, isStreaming = false }: MessageBubbleProps) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const markdownStyles = React.useMemo(() => createMarkdownStyles(theme), [theme]);
  const tableStyles = React.useMemo(() => createTableStyles(theme), [theme]);
  
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const isEmpty = !message.content && !isUser;
  const isDark = theme.bg === "#05050f";

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.content);
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
      <Pressable style={[styles.container, styles.userContainer]} onLongPress={handleCopy} delayLongPress={300}>
        <LinearGradient
          colors={[theme.indigo, theme.indigo]}
          style={[styles.bubble, styles.userBubble]}
        >
          <Text style={[styles.text, { color: "#ffffff" }]}>{message.content}</Text>
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

  return (
    <Pressable style={[styles.container, styles.assistantContainer]} onLongPress={handleCopy} delayLongPress={300}>
      <BlurView intensity={isDark ? 20 : 60} tint={isDark ? "dark" : "light"} style={[styles.bubble, styles.assistantBubble]}>
        {isEmpty ? (
          <TypingIndicator />
        ) : (
          <Markdown style={markdownStyles} rules={renderRules(theme, tableStyles)} scrollEnabled={false}>
            {message.content}
          </Markdown>
        )}
        {!isEmpty && (
          <View style={[styles.metaRow, { justifyContent: "flex-start" }]}>
            {copied && <CheckCircle2 size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />}
            <Text style={styles.metaText}>
              {copied ? "Copied" : `${timeString}${message.modelId ? ` · ${message.modelId}` : ""}`}
            </Text>
          </View>
        )}
      </BlurView>
    </Pressable>
  );
});

const createStyles = (theme: ThemePalette) => StyleSheet.create({
  systemContainer: {
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 32,
  },
  systemText: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  container: {
    flexDirection: "row",
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  assistantContainer: {
    justifyContent: "flex-start",
  },
  bubble: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  userBubble: {
    maxWidth: "88%",
    flexShrink: 1,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    shadowColor: theme.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  assistantBubble: {
    maxWidth: "96%",
    flexShrink: 1,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  text: {
    color: theme.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  metaText: {
    color: theme.textSecondary,
    fontSize: 11,
  },
  userMetaText: {
    color: "rgba(255,255,255,0.7)",
  },
});
