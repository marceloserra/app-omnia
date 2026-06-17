import React, { useState, useRef, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Message } from "@omnia/shared-types";
import { MessageBubble } from "../components/chat/MessageBubble";
import { ChatInput } from "../components/chat/ChatInput";
import { Sidebar } from "../components/navigation/Sidebar";
import { useProviderStore } from "../store/provider-store";
import { OpenAIProvider, OpenAICompatibleProvider } from "@omnia/providers";
import { openDatabase, createMessageRepo, createConversationRepo } from "@omnia/storage";
import { logger } from "@omnia/logger";
import { AlignLeft, Settings, Sparkles } from "lucide-react-native";
import * as Haptics from "expo-haptics";

const BG = "#05050f";
const INDIGO = "#6366f1";
const SURFACE = "#0e0e1f";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT_PRIMARY = "#f0efff";
const TEXT_SECONDARY = "#94a3b8";

const db = openDatabase();
const msgRepo = createMessageRepo(db);
const convRepo = createConversationRepo(db);

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function HomeScreen() {
  const store = useProviderStore();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 44;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAbortedRef = useRef(false);
  const flatListRef = useRef<FlatList>(null);

  const noProvider = !store.activeProviderId || !store.isConnected;

  const getProvider = useCallback(() => {
    if (store.activeProviderId === "openai") {
      return {
        provider: new OpenAIProvider(),
        config: { apiKey: store.openaiApiKey },
        modelId: store.openaiModelId,
      };
    } else if (store.activeProviderId === "openai-compatible") {
      return {
        provider: new OpenAICompatibleProvider(),
        config: { baseUrl: store.compatibleBaseUrl, apiKey: store.compatibleApiKey || undefined },
        modelId: store.compatibleModelId,
      };
    }
    return null;
  }, [store]);

  const handleSend = useCallback(async (text: string) => {
    const providerCtx = getProvider();
    if (!providerCtx) return;

    isAbortedRef.current = false;

    const newConvId = generateId();
    convRepo.create({
      id: newConvId,
      title: text.slice(0, 40),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const userMessage: Message = {
      id: generateId(),
      conversationId: newConvId,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const assistantId = generateId();
    const assistantMessage: Message = {
      id: assistantId,
      conversationId: newConvId,
      role: "assistant",
      content: "",
      providerId: store.activeProviderId ?? undefined,
      modelId: providerCtx.modelId,
      timestamp: Date.now(),
    };

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessages([userMessage, assistantMessage]);
    setIsStreaming(true);

    try {
      msgRepo.create(userMessage);
      msgRepo.create(assistantMessage);
    } catch (err) {
      logger.error("SQLite", "Failed to save user message", err);
    }

    try {
      const stream = providerCtx.provider.streamChat(providerCtx.config, {
        messages: [{ role: "user", content: text }],
        modelId: providerCtx.modelId,
        stream: true,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        if (isAbortedRef.current) break;
        if (chunk.done) break;
        fullContent += chunk.content;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m))
        );
        flatListRef.current?.scrollToEnd({ animated: true });
      }

      try {
        msgRepo.updateContent(assistantId, fullContent);
        if (!isAbortedRef.current) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (err) {
        logger.error("SQLite", "Failed to update assistant message", err);
      }
    } catch (e: any) {
      if (isAbortedRef.current) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMsg = `Error: ${e?.message ?? "Something went wrong."}`;
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: errorMsg } : m))
      );
      try {
        msgRepo.updateContent(assistantId, errorMsg);
      } catch {}
    } finally {
      setIsStreaming(false);
      router.replace(`/chat/${newConvId}`);
    }
  }, [store, getProvider]);

  const handleStop = () => {
    isAbortedRef.current = true;
    setIsStreaming(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
    >
      {/* ─── Custom Header ─── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {/* Hamburger */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSidebarOpen(true);
          }}
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
          accessibilityLabel="Open menu"
        >
          <AlignLeft size={21} color={TEXT_PRIMARY} strokeWidth={1.8} />
        </Pressable>

        {/* Logo / Title */}
        <View style={styles.headerCenter}>
          <Sparkles size={14} color="#818cf8" strokeWidth={2} style={{ marginRight: 6 }} />
          <Text style={styles.headerTitle}>Omnia</Text>
        </View>

        {/* Settings */}
        <Pressable
          onPress={() => router.push("/settings")}
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
          accessibilityLabel="Settings"
        >
          <Settings size={21} color={TEXT_PRIMARY} strokeWidth={1.8} />
        </Pressable>
      </View>

      {/* ─── Divider ─── */}
      <View style={styles.divider} />

      {/* ─── Message list ─── */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyGlyph}>
              <Text style={{ fontSize: 32, color: "#818cf8" }}>✦</Text>
            </View>
            <Text style={styles.emptyTitle}>What can I help with?</Text>
            {noProvider ? (
              <View style={{ alignItems: "center" }}>
                <Text style={styles.emptySubtitle}>
                  You need an AI provider to start chatting.
                </Text>
                <Pressable
                  onPress={() => router.push("/settings")}
                  style={({ pressed }) => [styles.providerBtn, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.providerBtnText}>Configure Provider</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.emptySubtitle}>
                Ask me anything. I'll think through it with you.
              </Text>
            )}
          </View>
        }
      />

      {/* ─── Streaming indicator ─── */}
      {isStreaming && (
        <View style={styles.streamingIndicator}>
          <ActivityIndicator size="small" color="#818cf8" />
          <Text style={{ color: TEXT_SECONDARY, fontSize: 13, fontWeight: "500", marginLeft: 8 }}>
            Omnia is thinking…
          </Text>
        </View>
      )}

      {/* ─── Chat Input ─── */}
      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        isStreaming={isStreaming}
        disabled={noProvider}
        onPressDisabled={() => router.push("/settings")}
      />

      {/* ─── Drawer Sidebar ─── */}
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: BG,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
    paddingHorizontal: 32,
  },
  emptyGlyph: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "rgba(99,102,241,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    color: "rgba(148,163,184,0.6)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  providerBtn: {
    backgroundColor: "rgba(99,102,241,0.15)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
  },
  providerBtnText: {
    color: "#a5b4fc",
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  streamingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
});
