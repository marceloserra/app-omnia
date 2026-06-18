import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, FlatList, Text, KeyboardAvoidingView, Platform, ActivityIndicator, Pressable, StyleSheet, Modal, TextInput } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { Message } from "@omnia/shared-types";
import { MessageBubble } from "../../components/chat/MessageBubble";
import { ChatInput } from "../../components/chat/ChatInput";
import { Attachment } from "../../components/chat/AttachmentPill";
import { ModelPickerSheet, getModelIcon } from "../../components/chat/ModelPickerSheet";
import { ModelChip } from "../../components/chat/ModelChip";
import { useProviderStore } from "../../store/provider-store";
import { OpenAIProvider } from "@omnia/providers";
import { OpenAICompatibleProvider } from "@omnia/providers";
import { openDatabase, createMessageRepo, createConversationRepo } from "@omnia/storage";
import { logger } from "@omnia/logger";
import { BlurView } from "expo-blur";
import { ArrowDown, ChevronLeft, Settings, ChevronDown, Search, X, Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme, ThemePalette } from "../../lib/theme";
import { useTranslation } from "../../lib/i18n";
import { useSettingsStore } from "../../store/settings-store";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";

let _db: any;
let _msgRepo: any;
let _convRepo: any;

function getDb() {
  if (!_db) {
    _db = openDatabase();
    _msgRepo = createMessageRepo(_db);
    _convRepo = createConversationRepo(_db);
  }
  return { db: _db, msgRepo: _msgRepo, convRepo: _convRepo };
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
// ─── Chat Screen ──────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const { conversationId, initialPrompt } = useLocalSearchParams<{ conversationId: string; initialPrompt?: string }>();
  const hasTriggeredPrompt = useRef(false);
  const store = useProviderStore();
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 44;
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!conversationId) return [];
    try {
      return getDb().msgRepo.listByConversation(conversationId);
    } catch {
      return [];
    }
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [convTitle, setConvTitle] = useState(() => {
    if (!conversationId) return "Chat";
    try {
      const conv = getDb().convRepo.getById(conversationId);
      return conv?.title || "Chat";
    } catch {
      return "Chat";
    }
  });
  const [modelPickerVisible, setModelPickerVisible] = useState(false);
  const isDark = theme.bg === "#05050f";

  // UX States
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;
  const isAbortedRef = useRef(false);
  const scrollOffsetRef = useRef(0); // track position to restore after keyboard hides

  // Circuit Breaker State
  const consecutiveFailuresRef = useRef(0);
  const CIRCUIT_BREAKER_THRESHOLD = 2;

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

  const handleSend = useCallback(async (text: string, attachments?: Attachment[], isInitialPrompt: boolean = false) => {
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

    const processedAttachments: Attachment[] = [];
    if (attachments && attachments.length > 0) {
      const attachmentDir = (FileSystem.documentDirectory || "file:///tmp/") + 'omnia_attachments/';
      try {
        const dirInfo = await FileSystem.getInfoAsync(attachmentDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(attachmentDir, { intermediates: true });
        }
        for (const att of attachments) {
          const ext = att.uri.split('.').pop() || 'tmp';
          const newFileName = `${generateId()}.${ext}`;
          const destUri = attachmentDir + newFileName;
          await FileSystem.copyAsync({ from: att.uri, to: destUri });
          processedAttachments.push({ ...att, uri: destUri });
        }
      } catch (err) {
        logger.error("FileSystem", "Failed to persist attachments", err);
      }
    }

    const userMessage: Message | null = isInitialPrompt ? null : {
      id: generateId(),
      conversationId: conversationId,
      role: "user",
      content: text,
      timestamp: Date.now(),
      attachments: processedAttachments.length > 0 ? processedAttachments : undefined,
    };

    const prev = messagesRef.current;
    const snapshotForApi = isInitialPrompt ? [...prev] : [...prev, userMessage!];
    const chatHistory = snapshotForApi.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));
    const isFirstMessage = prev.length === 0 && userMessage;

    setMessages((currentPrev) => {
      return isInitialPrompt ? [...currentPrev, assistantMessage] : [...currentPrev, userMessage!, assistantMessage];
    });

    // Fire and forget the stream OUTSIDE the state updater to prevent React StrictMode duplicate side-effects
    (async () => {
      try {
        const { convRepo, msgRepo } = getDb();
        if (isInitialPrompt && !convRepo.getById(conversationId)) {
          convRepo.create({
            id: conversationId,
            title: "New Chat", // Will be updated by AI later
            createdAt: Date.now(),
          });
        }
        if (userMessage) msgRepo.create(userMessage);
        msgRepo.create(assistantMessage);
        if (isFirstMessage) {
          convRepo.update(conversationId, { title: text.slice(0, 40) });
          setConvTitle(text.slice(0, 40));
        }
      } catch (err) {
        logger.error("SQLite", "Failed to save message", err);
      }

      let fullContent = "";
      try {
        const stream = providerCtx.provider.streamChat(providerCtx.config, {
          messages: chatHistory,
          modelId: providerCtx.modelId,
          stream: true,
        });

        let lastHapticTime = Date.now();
        let lastSqliteTime = Date.now();
        
        for await (const chunk of stream) {
          if (isAbortedRef.current) break;
          if (chunk.done) break;
          fullContent += chunk.content;
          
          const now = Date.now();

          if (useSettingsStore.getState().hapticsEnabled) {
            if (now - lastHapticTime > 80) {
              Haptics.selectionAsync();
              lastHapticTime = now;
            }
          }

          if (now - lastSqliteTime > 500) {
            try {
              getDb().msgRepo.updateContent(assistantId, fullContent);
            } catch (err) {}
            lastSqliteTime = now;
          }

          setMessages((cur) =>
            cur.map((m) => m.id === assistantId ? { ...m, content: fullContent } : m)
          );
        }

        try {
          getDb().msgRepo.updateContent(assistantId, fullContent);
        } catch (err) {
          logger.error("SQLite", "Failed to update assistant message content", err);
        }
      } catch (e: any) {
        if (isAbortedRef.current) {
          // If aborted, the network request might throw. Save whatever partial content we have.
          try {
            getDb().msgRepo.updateContent(assistantId, fullContent);
          } catch (err) {}
          return;
        }

        // Circuit Breaker Logic
        consecutiveFailuresRef.current += 1;
        if (store.activeProviderId === "openai" && consecutiveFailuresRef.current >= CIRCUIT_BREAKER_THRESHOLD) {
          consecutiveFailuresRef.current = 0; // Reset breaker
          
          // Show graceful fallback message
          const fallbackMsg = `Network unstable. Switched to Local AI. Please resend your message.`;
          setMessages((cur) =>
            cur.map((m) => m.id === assistantId ? { ...m, content: fallbackMsg } : m)
          );
          try { getDb().msgRepo.updateContent(assistantId, fallbackMsg); } catch (err) {}
          
          // Haptic feedback for circuit trip
          if (useSettingsStore.getState().hapticsEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
          
          // Auto-switch to local model
          store.setActiveProvider("openai-compatible");
        } else {
          const errorMsg = `Error: ${e?.message ?? "Something went wrong."}`;
          setMessages((cur) =>
            cur.map((m) => m.id === assistantId ? { ...m, content: errorMsg } : m)
          );
          try {
            getDb().msgRepo.updateContent(assistantId, errorMsg);
          } catch (err) {
            logger.error("SQLite", "Failed to log assistant stream error", err);
          }
        }
      } finally {
        // Reset failures on success if we reached the end of the loop without entering catch
        if (!isAbortedRef.current && fullContent.length > 0) {
          consecutiveFailuresRef.current = 0;
        }
        setIsStreaming(false);
        isAbortedRef.current = false;
      }
    })();

    setIsStreaming(true);
  }, [conversationId, store, getProvider]);

  // Load messages from SQLite on conversationId change.
  // No setMessages([]) here — keep previous messages visible during transition.
  useEffect(() => {
    if (!conversationId) return;
    try {
      const { convRepo, msgRepo } = getDb();
      const conv = convRepo.getById(conversationId);
      if (conv) setConvTitle(conv.title);
      const history = msgRepo.listByConversation(conversationId);
      setMessages(history);
      if (initialPrompt && !hasTriggeredPrompt.current) {
        hasTriggeredPrompt.current = true;
        setTimeout(() => { handleSend(initialPrompt, undefined, true); }, 300);
      }
    } catch (err) {
      logger.error("SQLite", "Failed to load chat history", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, initialPrompt]); // handleSend intentionally omitted — guarded by hasTriggeredPrompt ref

  // Abort stream if the component unmounts (e.g., user hits back button)
  useEffect(() => {
    return () => {
      isAbortedRef.current = true;
    };
  }, []);

  const handleStop = () => {
    isAbortedRef.current = true;
    setIsStreaming(false);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setIsScrolledUp(false);
  };

  const noProvider = !store.activeProviderId || !store.isConnected;
  const activeModelId = store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={{ flex: 1 }}>
        {/* Floating Header (Dynamic Island vibe) */}
        <View style={[styles.headerFloating, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.floatingBtnContainer, pressed && { opacity: 0.7 }]}
          >
            <BlurView 
              intensity={isDark ? 60 : 100} 
              tint={isDark ? "dark" : "light"} 
              style={[styles.floatingBtnInner, { backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)" }]}
            >
              <ChevronLeft size={20} color={theme.textPrimary} strokeWidth={2.5} />
            </BlurView>
          </Pressable>

          <ModelChip
            providerId={store.activeProviderId}
            modelId={activeModelId}
            isDark={isDark}
            theme={theme}
            onPress={() => setModelPickerVisible(true)}
          />

          <Pressable
            onPress={() => router.push("/settings")}
            accessibilityLabel="Settings"
            style={({ pressed }) => [styles.floatingBtnContainer, pressed && { opacity: 0.7 }]}
          >
            <BlurView 
              intensity={isDark ? 60 : 100} 
              tint={isDark ? "dark" : "light"} 
              style={[styles.floatingBtnInner, { backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)" }]}
            >
              <Settings size={18} color={theme.textPrimary} strokeWidth={2} />
            </BlurView>
          </Pressable>
        </View>

        {noProvider && messages.length > 0 && (
          <View style={{ position: 'absolute', top: insets.top + 60, left: 16, right: 16, alignItems: 'center', zIndex: 5 }} pointerEvents="box-none">
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: theme.red, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, shadowColor: theme.red, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4, maxWidth: "100%" }}>
              <Text style={{ color: "#ffffff", fontSize: 13, fontWeight: "600", marginRight: 12, flexShrink: 1 }} numberOfLines={2}>{t("chat.error.disconnected")}</Text>
              <Pressable onPress={() => router.push("/settings")} style={({ pressed }) => [{ backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexShrink: 0 }, pressed && { opacity: 0.7 }]}>
                <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "700" }}>{t("chat.error.reconnect")}</Text>
              </Pressable>
            </View>
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
            contentContainerStyle={{ paddingBottom: 16, paddingTop: insets.top + 80, paddingHorizontal: 0, flexGrow: 1 }}
            onScroll={(e) => {
              const { contentOffset } = e.nativeEvent;
              setIsScrolledUp(contentOffset.y > 100);
            }}
            scrollEventThrottle={16}
            ListFooterComponent={
              messages.length > 0 ? (
                <View style={{ alignItems: "center", marginTop: 40, marginBottom: 20, paddingHorizontal: 32 }}>
                  <Text style={{ fontSize: 26, fontWeight: "800", color: theme.textPrimary, textAlign: "center", letterSpacing: -0.5 }}>
                    {convTitle}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 8, fontWeight: "600" }}>
                    {store.activeProviderId === "openai" ? "OpenAI" : "Local"} · {activeModelId}
                  </Text>
                </View>
              ) : null
            }
          />

          {messages.length === 0 && (
            <View style={styles.emptyOverlay} pointerEvents="box-none">
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrapper}>
                  {getModelIcon(activeModelId, 48)}
                </View>
                <Text style={styles.emptyTitle}>Omnia · {store.activeProviderId === "openai" ? "OpenAI" : "Local"}</Text>
                <Text style={styles.emptySubtitle}>{t("chat.empty.connected").replace("{model}", activeModelId)}</Text>

                {noProvider && (
                  <View style={{ alignItems: "center", marginTop: 24 }}>
                    <Text style={[styles.emptySubtitle, { maxWidth: "80%" }]}>
                      {t("chat.empty.noprovider")}
                    </Text>
                    <Pressable
                      onPress={() => router.push("/settings")}
                      style={({ pressed }) => [styles.providerConfigBtn, pressed && { opacity: 0.8 }, { maxWidth: "90%" }]}
                    >
                      <Text style={[styles.providerConfigText, { textAlign: "center" }]} numberOfLines={2}>{t("chat.empty.cta")}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          )}

          {isScrolledUp && (
            <View style={styles.fabContainer} pointerEvents="box-none">
              <Pressable onPress={scrollToBottom} style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}>
                <BlurView intensity={isDark ? 40 : 80} tint={isDark ? "dark" : "light"} style={styles.fabInner}>
                  <ArrowDown size={18} color={theme.textPrimary} strokeWidth={2.5} />
                </BlurView>
              </Pressable>
            </View>
          )}
        </View>

      </View>

      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        isStreaming={isStreaming}
        disabled={noProvider}
        onPressDisabled={() => { if (noProvider) router.push("/settings"); }}
      />

      <ModelPickerSheet
        visible={modelPickerVisible}
        models={store.availableModels}
        selected={store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId}
        onSelect={(m) => {
          if (store.activeProviderId === "openai") {
            store.setOpenaiModelId(m);
          } else {
            store.setCompatibleModelId(m);
          }
        }}
        theme={theme}
        isDark={isDark}
        onClose={() => setModelPickerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: ThemePalette) => StyleSheet.create({
  headerFloating: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
  },
  floatingBtnContainer: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  floatingBtnInner: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingChipContainer: {
    borderRadius: 18,
    overflow: "visible",
    maxWidth: 200,
  },
  floatingChipInner: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 12,
    gap: 6,
  },
  dynamicIslandText: {
    color: theme.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
  modelChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    flexShrink: 0,
  },
  modelChipHeaderText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },

  noProviderInline: {
    // Removed
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
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  fab: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fabInner: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
