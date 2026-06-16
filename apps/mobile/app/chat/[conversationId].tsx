import React, { useState, useRef, useCallback } from "react";
import { View, FlatList, Text, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Message } from "@omnia/shared-types";
import { MessageBubble } from "../../components/chat/MessageBubble";
import { ChatInput } from "../../components/chat/ChatInput";
import { useProviderStore } from "../../store/provider-store";
import { OpenAIProvider } from "@omnia/providers";
import { OpenAICompatibleProvider } from "@omnia/providers";

const BG = "#0a0918";
const TEXT_SECONDARY = "#9d9bcc";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const store = useProviderStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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

    const userMessage: Message = {
      id: generateId(),
      conversationId: conversationId ?? "ephemeral",
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const assistantId = generateId();
    const assistantMessage: Message = {
      id: assistantId,
      conversationId: conversationId ?? "ephemeral",
      role: "assistant",
      content: "",
      providerId: store.activeProviderId ?? undefined,
      modelId: providerCtx.modelId,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

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
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Error: ${e?.message ?? "Something went wrong."}` }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [messages, conversationId, store, getProvider]);

  const noProvider = !store.activeProviderId || !store.isConnected;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ title: "Chat" }} />

      {noProvider && (
        <View style={{ padding: 16, backgroundColor: "rgba(99,102,241,0.1)", borderBottomWidth: 1, borderBottomColor: "rgba(99,102,241,0.2)" }}>
          <Text style={{ color: TEXT_SECONDARY, fontSize: 13, textAlign: "center" }}>
            No provider connected. Go to Settings to configure one.
          </Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>✦</Text>
            <Text style={{ fontSize: 17, fontWeight: "600", color: "#f0efff", marginBottom: 6 }}>Omnia</Text>
            <Text style={{ fontSize: 14, color: TEXT_SECONDARY, textAlign: "center", paddingHorizontal: 40 }}>
              {noProvider
                ? "Configure a provider in Settings to start chatting."
                : "Start a conversation below."}
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
