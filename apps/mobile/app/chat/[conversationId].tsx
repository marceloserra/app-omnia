import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, FlatList, Text, KeyboardAvoidingView, Platform, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
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
import { ArrowDown } from "lucide-react-native";

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
  const [convTitle, setConvTitle] = useState("Chat");
  
  // UX States
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isAbortedRef = useRef(false);

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

    isAbortedRef.current = false;
    setIsScrolledUp(false);

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
        if (isAbortedRef.current) break; // User pressed Stop Generating
        if (chunk.done) break;
        
        fullContent += chunk.content;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: fullContent } : m
          )
        );
        
        // Smart scroll: only auto-scroll if the user hasn't scrolled up
        if (!isScrolledUp) {
          flatListRef.current?.scrollToEnd({ animated: false });
        }
      }

      // Finalize the assistant message in SQLite
      try {
        msgRepo.updateContent(assistantId, fullContent);
        if (!isAbortedRef.current) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (err) {
        logger.error("SQLite", "Failed to update assistant message content", err);
      }

    } catch (e: any) {
      if (isAbortedRef.current) return;
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
      isAbortedRef.current = false;
    }
  }, [messages, conversationId, store, getProvider, isScrolledUp]);

  const handleStop = () => {
    isAbortedRef.current = true;
    setIsStreaming(false);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setIsScrolledUp(false);
  };

  const noProvider = !store.activeProviderId || !store.isConnected;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Stack.Screen options={{ title: convTitle }} />

      {/* Ambient Glow */}
      <View style={styles.ambientGlow} />

      {noProvider && messages.length > 0 && (
        <View style={styles.noProviderInline}>
          <Text style={{ color: "#f8fafc", fontSize: 13, fontWeight: "500" }}>Provider Disconnected</Text>
          <Pressable onPress={() => router.push("/settings")}>
            <Text style={{ color: "#a5b4fc", fontSize: 13, fontWeight: "600" }}>Settings</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
        onContentSizeChange={() => {
          if (!isScrolledUp) flatListRef.current?.scrollToEnd({ animated: true });
        }}
        onScroll={(e) => {
          const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
          // Threshold of 100px to consider "scrolled up"
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
          setIsScrolledUp(!isCloseToBottom);
        }}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Text style={{ fontSize: 28, color: "#818cf8" }}>✦</Text>
            </View>
            <Text style={styles.emptyTitle}>Omnia</Text>
            
            {noProvider ? (
              <View style={{ alignItems: "center", marginTop: 8 }}>
                <Text style={[styles.emptySubtitle, { marginBottom: 20 }]}>
                  You need an AI provider to continue chatting.
                </Text>
                <Pressable
                  onPress={() => router.push("/settings")}
                  style={({ pressed }) => [
                    styles.providerConfigBtn,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                  ]}
                >
                  <Text style={styles.providerConfigText}>Configure Provider</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.emptySubtitle}>
                Loading conversation...
              </Text>
            )}
          </View>
        }
      />

      {/* Scroll to bottom FAB */}
      {isScrolledUp && (
        <View style={styles.fabContainer}>
          <Pressable onPress={scrollToBottom} style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}>
            <ArrowDown size={20} color="#fff" />
          </Pressable>
        </View>
      )}

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
    filter: "blur(100px)",
    zIndex: -1,
  },
  noProviderInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(239,68,68,0.2)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
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
  providerConfigBtn: {
    backgroundColor: "rgba(99,102,241,0.15)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
  },
  providerConfigText: {
    color: "#a5b4fc",
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  streamingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 10,
    backgroundColor: "transparent",
  },
  fabContainer: {
    position: "absolute",
    bottom: 90, // Above the input
    right: 20,
    zIndex: 10,
  },
  fab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(30, 27, 75, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
