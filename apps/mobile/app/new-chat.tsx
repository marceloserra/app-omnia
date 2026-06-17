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
import { router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Message } from "@omnia/shared-types";
import { MessageBubble } from "../components/chat/MessageBubble";
import { ChatInput } from "../components/chat/ChatInput";
import { useProviderStore } from "../store/provider-store";
import { OpenAIProvider } from "@omnia/providers";
import { OpenAICompatibleProvider } from "@omnia/providers";
import { openDatabase, createMessageRepo, createConversationRepo } from "@omnia/storage";
import { logger } from "@omnia/logger";
import * as Haptics from "expo-haptics";

const BG = "#05050f";
const INDIGO = "#6366f1";
const TEXT_SECONDARY = "#94a3b8";

const db = openDatabase();
const msgRepo = createMessageRepo(db);
const convRepo = createConversationRepo(db);

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function NewChatScreen() {
  const store = useProviderStore();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 44;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
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
      <Stack.Screen options={{ title: "" }} />

      <View style={styles.ambientGlow} />

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
            <Text style={styles.emptyTitle}>New Chat</Text>
            {noProvider ? (
              <View style={{ alignItems: "center", gap: 16 }}>
                <Text style={styles.emptySubtitle}>
                  You need an AI provider to start chatting.
                </Text>
                <Pressable
                  onPress={() => router.push("/settings")}
                  style={({ pressed }) => [
                    styles.providerBtn,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={styles.providerBtnText}>Configure Provider</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.emptySubtitle}>What would you like to explore today?</Text>
            )}
          </View>
        }
      />

      {isStreaming && (
        <View style={styles.streamingIndicator}>
          <ActivityIndicator size="small" color="#818cf8" />
          <Text style={{ color: TEXT_SECONDARY, fontSize: 13, fontWeight: "500" }}>
            Omnia is thinking…
          </Text>
        </View>
      )}

      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        isStreaming={isStreaming}
        disabled={noProvider}
        onPressDisabled={() => router.push("/settings")}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ambientGlow: {
    position: "absolute",
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: INDIGO,
    opacity: 0.1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
    gap: 12,
  },
  emptyGlyph: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "rgba(99,102,241,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    color: "#f0efff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  emptySubtitle: {
    color: "rgba(148,163,184,0.6)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
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
    gap: 8,
    paddingVertical: 8,
  },
});
