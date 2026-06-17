import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, FlatList, Text, KeyboardAvoidingView, Platform, ActivityIndicator, Pressable, StyleSheet, Modal, TextInput } from "react-native";
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
import { ArrowDown, AlignLeft, Settings, ChevronDown, Search, X, Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme, ThemePalette } from "../../lib/theme";
import { useTranslation } from "../../lib/i18n";

const db = openDatabase();
const msgRepo = createMessageRepo(db);
const convRepo = createConversationRepo(db);

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Chat Model Picker ────────────────────────────────────────────────────────

interface ChatModelPickerProps {
  models: string[];
  selectedModel: string;
  activeProviderId: string | null;
  onSelect: (m: string) => void;
  theme: ThemePalette;
  onClose: () => void;
}

function ChatModelPicker({ models, selectedModel, activeProviderId, onSelect, theme, onClose }: ChatModelPickerProps) {
  const [search, setSearch] = useState("");
  const isDark = theme.bg === "#05050f";

  const filtered = models.filter((m) =>
    m.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (m: string) => {
    onSelect(m);
    onClose();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Drag handle */}
      <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
        <View style={{
          width: 40, height: 4, borderRadius: 2,
          backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
        }} />
      </View>

      {/* Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}>
        <Text style={{ fontSize: 17, fontWeight: "700", color: theme.textPrimary, letterSpacing: 0.2 }}>
          Select Model
        </Text>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            alignItems: "center", justifyContent: "center",
          }, pressed && { opacity: 0.6 }]}
        >
          <X size={18} color={theme.textSecondary} />
        </Pressable>
      </View>

      {/* Search field */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
        backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.border,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
      }}>
        <Search size={16} color={theme.textSecondary} />
        <TextInput
          placeholder="Search models…"
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1, fontSize: 15, color: theme.textPrimary }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <X size={14} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* List */}
      {models.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 60, paddingHorizontal: 32 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 15, textAlign: "center", lineHeight: 22 }}>
            No models available. Connect a provider in Settings.
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 60 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 15 }}>No models match "{search}"</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const isSelected = item === selectedModel;
            return (
              <Pressable
                onPress={() => handleSelect(item)}
                style={({ pressed }) => [{
                  flexDirection: "row" as const,
                  alignItems: "center" as const,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  marginVertical: 3,
                  borderRadius: 14,
                  backgroundColor: isSelected
                    ? (isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.07)")
                    : "transparent",
                }, pressed && { opacity: 0.7 }]}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: isSelected ? "#6366f1" : theme.textPrimary,
                    fontWeight: isSelected ? "700" : "400",
                  }}
                  numberOfLines={2}
                >
                  {item}
                </Text>
                {isSelected && (
                  <View style={{
                    width: 22, height: 22, borderRadius: 11,
                    backgroundColor: "#6366f1",
                    alignItems: "center", justifyContent: "center", marginLeft: 12,
                  }}>
                    <Check size={13} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
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
      return msgRepo.listByConversation(conversationId);
    } catch {
      return [];
    }
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [convTitle, setConvTitle] = useState(() => {
    if (!conversationId) return "Chat";
    try {
      const conv = convRepo.getById(conversationId);
      return conv?.title || "Chat";
    } catch {
      return "Chat";
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modelPickerVisible, setModelPickerVisible] = useState(false);
  const isDark = theme.bg === "#05050f";

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
              cur.map((m) => m.id === assistantId ? { ...m, content: fullContent } : m)
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
            cur.map((m) => m.id === assistantId ? { ...m, content: errorMsg } : m)
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

      const nextMessages = isInitialPrompt ? [...prev, assistantMessage] : [...prev, userMessage!, assistantMessage];
      return nextMessages;
    });

    setIsStreaming(true);
  }, [conversationId, store, getProvider]);

  // Load messages from SQLite on conversationId change.
  // No setMessages([]) here — keep previous messages visible during transition.
  useEffect(() => {
    if (!conversationId) return;
    try {
      const conv = convRepo.getById(conversationId);
      if (conv) setConvTitle(conv.title);
      const history = msgRepo.listByConversation(conversationId);
      setMessages(history);
      if (initialPrompt && !hasTriggeredPrompt.current) {
        hasTriggeredPrompt.current = true;
        setTimeout(() => { handleSend(initialPrompt, true); }, 300);
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
  const activeModelId = store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={{ flex: 1 }}>
        {/* Floating Header (Dynamic Island vibe) */}
        <View style={[styles.headerFloating, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
          <Pressable
            onPress={() => setSidebarOpen(true)}
            accessibilityLabel="Open menu"
            style={({ pressed }) => [styles.floatingBtnContainer, pressed && { opacity: 0.7 }]}
          >
            <BlurView intensity={isDark ? 40 : 80} tint={isDark ? "dark" : "light"} style={styles.floatingBtnInner}>
              <AlignLeft size={18} color={theme.textPrimary} strokeWidth={2} />
            </BlurView>
          </Pressable>

          {store.activeProviderId && (
            <Pressable
              onPress={() => setModelPickerVisible(true)}
              accessibilityLabel="Change model"
              style={({ pressed }) => [styles.floatingChipContainer, pressed && { opacity: 0.7 }]}
            >
              <BlurView intensity={isDark ? 40 : 80} tint={isDark ? "dark" : "light"} style={styles.floatingChipInner}>
                <View style={styles.modelChipDot} />
                <Text style={styles.dynamicIslandText} numberOfLines={1}>
                  {store.activeProviderId === "openai" ? "OpenAI" : "Local"} · {activeModelId}
                </Text>
                <ChevronDown size={14} color={theme.textSecondary} />
              </BlurView>
            </Pressable>
          )}
          {!store.activeProviderId && <View style={{ flex: 1 }} pointerEvents="none" />}

          <Pressable
            onPress={() => router.push("/settings")}
            accessibilityLabel="Settings"
            style={({ pressed }) => [styles.floatingBtnContainer, pressed && { opacity: 0.7 }]}
          >
            <BlurView intensity={isDark ? 40 : 80} tint={isDark ? "dark" : "light"} style={styles.floatingBtnInner}>
              <Settings size={18} color={theme.textPrimary} strokeWidth={2} />
            </BlurView>
          </Pressable>
        </View>

        {noProvider && messages.length > 0 && (
          <View style={[styles.noProviderInline, { marginTop: insets.top + 60 }]}>
            <Text style={{ color: "#f8fafc", fontSize: 13, fontWeight: "500" }}>Provider Disconnected</Text>
            <Pressable onPress={() => router.push("/settings")}>
              <Text style={{ color: "#a5b4fc", fontSize: 13, fontWeight: "600" }}>Settings</Text>
            </Pressable>
          </View>
        )}

        <View style={{ flex: 1, zIndex: -1 }}>
          <FlatList
            ref={flatListRef}
            data={[...messages].reverse()}
            inverted
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            keyExtractor={(m) => m.id}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={{ paddingVertical: 16, paddingBottom: insets.top + 80, flexGrow: 1 }}
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
                <ArrowDown size={20} color="#ffffff" strokeWidth={2.5} />
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

      <Modal
        visible={modelPickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModelPickerVisible(false)}
      >
        <ChatModelPicker
          models={store.availableModels}
          selectedModel={store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId}
          activeProviderId={store.activeProviderId}
          onSelect={(m) => {
            if (store.activeProviderId === "openai") {
              store.setOpenaiModelId(m);
            } else {
              store.setCompatibleModelId(m);
            }
          }}
          theme={theme}
          onClose={() => setModelPickerVisible(false)}
        />
      </Modal>
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
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
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
    bottom: 16,
    right: 20,
    zIndex: 10,
  },
  fab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.indigo,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
