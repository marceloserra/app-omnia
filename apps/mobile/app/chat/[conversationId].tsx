import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, FlatList, Text, KeyboardAvoidingView, Keyboard, Platform, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { Message } from "@omnia/shared-types";
import { MessageBubble } from "../../components/chat/MessageBubble";
import { ChatInput } from "../../components/chat/ChatInput";
import { Sidebar } from "../../components/navigation/Sidebar";
import { useProviderStore } from "../../store/provider-store";
import { OpenAIProvider } from "@omnia/providers";
import { OpenAICompatibleProvider } from "@omnia/providers";
import { openDatabase, createMessageRepo, createConversationRepo } from "@omnia/storage";
import { logger } from "@omnia/logger";
import { BlurView } from "expo-blur";
import { ArrowDown, AlignLeft, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme, ThemePalette } from "../../lib/theme";
import { useTranslation } from "../../lib/i18n";

const db = openDatabase();
const msgRepo = createMessageRepo(db);
const convRepo = createConversationRepo(db);

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatScreen() {
  const { conversationId, initialPrompt } = useLocalSearchParams<{ conversationId: string; initialPrompt?: string }>();
  const hasTriggeredPrompt = useRef(false);
  const store = useProviderStore();
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 44;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [convTitle, setConvTitle] = useState("Chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // UX States
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isAbortedRef = useRef(false);
  const scrollOffsetRef = useRef(0); // track position to restore after keyboard hides

  // No manual keyboard scroll listeners needed when using inverted FlatList

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

  const handleSend = useCallback(async (text: string, isInitialPrompt: boolean = false) => {
    const providerCtx = getProvider();
    if (!providerCtx) return;
    if (!conversationId) return;

    isAbortedRef.current = false;
    setIsScrolledUp(false);

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

    // Use functional update — no dependency on `messages` state
    setMessages((prev) => {
      // If it's the initial prompt from index.tsx, the user message was already
      // saved to SQLite and loaded into `prev`. We don't want to duplicate it.
      const userMessage: Message | null = isInitialPrompt ? null : {
        id: generateId(),
        conversationId: conversationId,
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      // Build chat history for the API from the current snapshot
      const snapshotForApi = isInitialPrompt ? [...prev] : [...prev, userMessage!];
      const chatHistory = snapshotForApi.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Fire and forget the stream after we have the snapshot
      (async () => {
        try {
          if (userMessage) msgRepo.create(userMessage);
          msgRepo.create(assistantMessage);
          if (prev.length === 0 && userMessage) {
            convRepo.update(conversationId, { title: text.slice(0, 40) });
            setConvTitle(text.slice(0, 40));
          }
        } catch (err) {
          logger.error("SQLite", "Failed to save message", err);
        }

        try {
          const stream = providerCtx.provider.streamChat(providerCtx.config, {
            messages: chatHistory,
            modelId: providerCtx.modelId,
            stream: true,
          });

          let fullContent = "";
          for await (const chunk of stream) {
            if (isAbortedRef.current) break;
            if (chunk.done) break;
            fullContent += chunk.content;
            setMessages((cur) =>
              cur.map((m) =>
                m.id === assistantId ? { ...m, content: fullContent } : m
              )
            );
          }

          try {
            msgRepo.updateContent(assistantId, fullContent);
          } catch (err) {
            logger.error("SQLite", "Failed to update assistant message content", err);
          }
        } catch (e: any) {
          if (isAbortedRef.current) return;
          const errorMsg = `Error: ${e?.message ?? "Something went wrong."}`;
          setMessages((cur) =>
            cur.map((m) =>
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
      })();

      return isInitialPrompt ? [...prev, assistantMessage] : [...prev, userMessage!, assistantMessage];
    });

    setIsStreaming(true);
  }, [conversationId, store, getProvider]);

  // Load messages from SQLite on mount — deps intentionally exclude handleSend
  // to prevent re-running when handleSend identity changes during streaming.
  useEffect(() => {
    if (!conversationId) return;
    try {
      const conv = convRepo.getById(conversationId);
      if (conv) setConvTitle(conv.title);

      const history = msgRepo.listByConversation(conversationId);
      setMessages(history);

      if (initialPrompt && !hasTriggeredPrompt.current) {
        hasTriggeredPrompt.current = true;
        // Delay to let the screen fully mount before firing the first message
        setTimeout(() => {
          handleSend(initialPrompt, true);
        }, 300);
      }
    } catch (err) {
      logger.error("SQLite", "Failed to load chat history", err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, initialPrompt]); // handleSend intentionally omitted — guarded by hasTriggeredPrompt ref

  const handleStop = () => {
    isAbortedRef.current = true;
    setIsStreaming(false);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setIsScrolledUp(false);
  };

  const noProvider = !store.activeProviderId;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={{ flex: 1 }}>
        <BlurView style={StyleSheet.absoluteFill as any} intensity={80} tint={theme.bg === "#05050f" ? "dark" : "light"} />
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => setSidebarOpen(true)}
            style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
            accessibilityLabel="Open menu"
          >
            <AlignLeft size={24} color={theme.textPrimary} strokeWidth={1.8} />
          </Pressable>

          <Text style={styles.headerTitle} numberOfLines={1}>{convTitle}</Text>

          <Pressable
            onPress={() => router.push("/settings")}
            style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
            accessibilityLabel="Settings"
          >
            <Settings size={24} color={theme.textPrimary} strokeWidth={1.8} />
          </Pressable>
        </View>
        <View style={styles.headerDivider} />

        {noProvider && messages.length > 0 && (
          <View style={styles.noProviderInline}>
            <Text style={{ color: "#f8fafc", fontSize: 13, fontWeight: "500" }}>Provider Disconnected</Text>
            <Pressable onPress={() => router.push("/settings")}>
              <Text style={{ color: "#a5b4fc", fontSize: 13, fontWeight: "600" }}>Settings</Text>
            </Pressable>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={[...messages].reverse()}
            inverted
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            keyExtractor={(m) => m.id}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
            onScroll={(e) => {
              const { contentOffset } = e.nativeEvent;
              setIsScrolledUp(contentOffset.y > 100);
            }}
            scrollEventThrottle={16}
          />

          {messages.length === 0 && (
            <View style={styles.emptyOverlay} pointerEvents="box-none">
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrapper}>
                  <Text style={{ fontSize: 32, color: theme.indigo }}>✦</Text>
                </View>
                <Text style={styles.emptyTitle}>{t("chat.empty.title")}</Text>
                
                {noProvider ? (
                  <View style={{ alignItems: "center" }}>
                    <Text style={styles.emptySubtitle}>
                      You need an AI provider to start chatting.
                    </Text>
                    <Pressable
                      onPress={() => router.push("/settings")}
                      style={({ pressed }) => [styles.providerConfigBtn, pressed && { opacity: 0.8 }]}
                    >
                      <Text style={styles.providerConfigText}>{t("settings.connect")}</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.emptySubtitle}>
                    Ask me anything. I'll think through it with you.
                  </Text>
                )}
              </View>
            </View>
          )}

          {isScrolledUp && (
            <View style={styles.fabContainer}>
              <Pressable onPress={scrollToBottom} style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}>
                <ArrowDown size={20} color={theme.textPrimary} strokeWidth={2.5} />
              </Pressable>
            </View>
          )}
        </View>

        <ChatInput 
          onSend={handleSend} 
          onStop={handleStop}
          isStreaming={isStreaming}
          disabled={noProvider}
          onPressDisabled={() => { if (noProvider) router.push("/settings"); }}
        />
      </View>

      <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: ThemePalette) => StyleSheet.create({
  blurHeader: {
    ...StyleSheet.absoluteFill as any,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: theme.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.border,
  },

  noProviderInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(239, 68, 68, 0.2)",
  },
  emptyOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
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
    backgroundColor: theme.activeBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  providerConfigBtn: {
    backgroundColor: theme.activeBg,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  providerConfigText: {
    color: theme.indigo,
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.3,
  },

  fabContainer: {
    position: "absolute",
    bottom: 16, // Tied to the bottom of the list area, above the input
    right: 20,
    zIndex: 10,
  },
  fab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
