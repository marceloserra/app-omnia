import React, { useState, useRef, useCallback } from "react";
import { View, FlatList, Text, KeyboardAvoidingView, Platform, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Message } from "@omnia/shared-types";
import { MessageBubble } from "../components/chat/MessageBubble";
import { ChatInput } from "../components/chat/ChatInput";
import { useProviderStore } from "../store/provider-store";
import { OpenAIProvider } from "@omnia/providers";
import { OpenAICompatibleProvider } from "@omnia/providers";
import { openDatabase, createMessageRepo, createConversationRepo } from "@omnia/storage";
import { logger } from "@omnia/logger";
import { BlurView } from "expo-blur";
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

export default function IndexChatScreen() {
  const store = useProviderStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const isAbortedRef = useRef(false);

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
    
    // Create new conversation
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
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: fullContent } : m
          )
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
      setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: errorMsg } : m));
      try {
        msgRepo.updateContent(assistantId, errorMsg);
      } catch (err) {}
    } finally {
      setIsStreaming(false);
      // Seamlessly transfer context to the chat route
      router.replace(`/chat/${newConvId}`);
    }
  }, [store, getProvider]);

  const handleStop = () => {
    isAbortedRef.current = true;
    setIsStreaming(false);
  };

  const noProvider = !store.activeProviderId || !store.isConnected;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.ambientGlow} />

      {noProvider && (
        <BlurView intensity={20} tint="dark" style={styles.noProviderBanner}>
          <Text style={{ color: TEXT_SECONDARY, fontSize: 13, textAlign: "center" }}>
            No provider connected. Go to Settings to configure one.
          </Text>
        </BlurView>
      )}

      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Text style={{ fontSize: 28, color: "#818cf8" }}>✦</Text>
            </View>
            <Text style={styles.emptyTitle}>Omnia</Text>
            <Text style={styles.emptySubtitle}>
              {noProvider
                ? "Configure a provider in Settings to start chatting."
                : "What would you like to build today?"}
            </Text>
          </View>
        }
      />

      {isStreaming && (
        <View style={styles.streamingIndicator}>
          <ActivityIndicator size="small" color="#818cf8" />
          <Text style={{ color: TEXT_SECONDARY, fontSize: 13, fontWeight: "500" }}>Omnia is thinking...</Text>
        </View>
      )}

      <ChatInput 
        onSend={handleSend} 
        onStop={handleStop}
        isStreaming={isStreaming}
        disabled={noProvider} 
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
    filter: "blur(100px)",
    zIndex: -1,
  },
  noProviderBanner: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(99,102,241,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  emptySubtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  streamingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 10,
    backgroundColor: "transparent",
  },
});
