import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, FlatList, Text, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Message } from "@omnia/shared-types";
import { MessageBubble } from "../../components/chat/MessageBubble";
import { ChatInput } from "../../components/chat/ChatInput";
import { useProviderStore } from "../../store/provider-store";
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

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const store = useProviderStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [convTitle, setConvTitle] = useState("Chat");

  // Load messages from SQLite on mount
  useEffect(() => {
    if (!conversationId) return;
    try {
      const conv = convRepo.getById(conversationId);
      if (conv) setConvTitle(conv.title);

      const history = msgRepo.listByConversation(conversationId);
      setMessages(history);
    } catch (err) {
      logger.error("SQLite", "Failed to load chat history", err);
    }
  }, [conversationId]);

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
    if (!conversationId) return;

    const userMessage: Message = {
      id: generateId(),
      conversationId: conversationId,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const assistantId = generateId();
    const assistantMessage: Message = {
      id: assistantId,
      conversationId: conversationId,
      role: "assistant",
      content: "",
      providerId: store.activeProviderId ?? undefined,
      modelId: providerCtx.modelId,
      timestamp: Date.now(),
    };

    // Update UI and SQLite for user message immediately
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    try {
      msgRepo.create(userMessage);
      msgRepo.create(assistantMessage);
      convRepo.update(conversationId, { title: messages.length === 0 ? text.slice(0, 40) : undefined });
      if (messages.length === 0) setConvTitle(text.slice(0, 40));
    } catch (err) {
      logger.error("SQLite", "Failed to save user message", err);
    }

    const chatHistory = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const stream = providerCtx.provider.streamChat(providerCtx.config, {
        messages: chatHistory,
        modelId: providerCtx.modelId,
        stream: true,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        if (chunk.done) break;
        fullContent += chunk.content;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: fullContent } : m
          )
        );
        flatListRef.current?.scrollToEnd({ animated: false });
      }

      // Finalize the assistant message in SQLite
      try {
        msgRepo.updateContent(assistantId, fullContent);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (err) {
        logger.error("SQLite", "Failed to update assistant message content", err);
      }

    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMsg = `Error: ${e?.message ?? "Something went wrong."}`;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: errorMsg } : m
        )
      );
      try {
        msgRepo.updateContent(assistantId, errorMsg);
      } catch (err) {
        logger.error("SQLite", "Failed to log assistant stream error", err);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [messages, conversationId, store, getProvider]);

  const noProvider = !store.activeProviderId || !store.isConnected;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Stack.Screen options={{ title: convTitle }} />

      {/* Ambient Glow */}
      <View style={{ position: "absolute", top: -100, right: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: INDIGO, opacity: 0.1, filter: "blur(100px)", zIndex: -1 }} />

      {noProvider && (
        <BlurView intensity={20} tint="dark" style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }}>
          <Text style={{ color: TEXT_SECONDARY, fontSize: 13, textAlign: "center" }}>
            No provider connected. Go to Settings to configure one.
          </Text>
        </BlurView>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 120 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(99,102,241,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 28, color: "#818cf8" }}>✦</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: "600", color: "#f8fafc", marginBottom: 8, letterSpacing: 0.5 }}>Omnia</Text>
            <Text style={{ fontSize: 15, color: TEXT_SECONDARY, textAlign: "center", paddingHorizontal: 40, lineHeight: 22 }}>
              {noProvider
                ? "Configure a provider in Settings to start chatting."
                : "What would you like to build today?"}
            </Text>
          </View>
        }
      />

      {isStreaming && (
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 6, gap: 8 }}>
          <ActivityIndicator size="small" color="#6366f1" />
          <Text style={{ color: TEXT_SECONDARY, fontSize: 13 }}>Thinking...</Text>
        </View>
      )}

      <ChatInput onSend={handleSend} disabled={isStreaming || noProvider} />
    </KeyboardAvoidingView>
  );
}
