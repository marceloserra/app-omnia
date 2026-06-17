import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Keyboard,
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
import { AlignLeft, Settings, Sparkles, ChevronDown } from "lucide-react-native";
import { BlurView } from "expo-blur";

import { useTheme, ThemePalette } from "../lib/theme";
import { useTranslation } from "../lib/i18n";

const db = openDatabase();
const msgRepo = createMessageRepo(db);
const convRepo = createConversationRepo(db);

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function HomeScreen() {
  const store = useProviderStore();
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 44;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAbortedRef = useRef(false);
  const flatListRef = useRef<FlatList>(null);

  const noProvider = !store.activeProviderId;
  const isDark = theme.bg === "#05050f";

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

  const handleSend = useCallback((text: string) => {
    const providerCtx = getProvider();
    if (!providerCtx) return;

    const newConvId = generateId();
    const now = Date.now();

    // Pre-save conversation and user message to SQLite BEFORE navigating.
    // This way the chat screen loads with existing content and never shows empty.
    convRepo.create({
      id: newConvId,
      title: text.slice(0, 40),
      createdAt: now,
      updatedAt: now,
    });
    const userMsgId = generateId();
    msgRepo.create({
      id: userMsgId,
      conversationId: newConvId,
      role: "user",
      content: text,
      timestamp: now,
    });

    // Navigate with no animation — the chat screen will load pre-populated.
    router.replace({
      pathname: `/chat/[conversationId]`,
      params: { conversationId: newConvId, initialPrompt: text }
    });
  }, [getProvider]);

  const handleStop = () => {
    isAbortedRef.current = true;
    setIsStreaming(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
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

          {store.activeProviderId ? (
            <Pressable
              onPress={() => router.push("/settings")}
              accessibilityLabel="Change model"
              style={({ pressed }) => [styles.floatingChipContainer, pressed && { opacity: 0.7 }]}
            >
              <BlurView intensity={isDark ? 40 : 80} tint={isDark ? "dark" : "light"} style={styles.floatingChipInner}>
                <View style={styles.modelChipDot} />
                <Text style={styles.dynamicIslandText} numberOfLines={1}>
                  {store.activeProviderId === "openai" ? "OpenAI" : "Local"} · {store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId}
                </Text>
                <ChevronDown size={14} color={theme.textSecondary} />
              </BlurView>
            </Pressable>
          ) : (
            <View style={styles.floatingChipContainer}>
              <BlurView intensity={isDark ? 40 : 80} tint={isDark ? "dark" : "light"} style={styles.floatingChipInner}>
                <Sparkles size={14} color={theme.indigo} strokeWidth={2} />
                <Text style={styles.dynamicIslandText} numberOfLines={1}>Omnia</Text>
              </BlurView>
            </View>
          )}

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

        {/* ─── Divider Removed ─── */}

        {/* ─── Message list + Empty State (scoped wrapper) ─── */}
        <View style={{ flex: 1, zIndex: -1 }}>
          <FlatList
            ref={flatListRef}
            data={[...messages].reverse()}
            inverted
            keyExtractor={(m) => m.id}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={{ paddingVertical: 16, paddingBottom: insets.top + 80, flexGrow: 1 }}
          />
        </View>

        {/* Empty State: absolute within the list area only, not the whole screen */}
        {messages.length === 0 && (
          <View style={styles.emptyOverlay} pointerEvents="box-none">
            <View style={styles.emptyGlyph}>
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
                  style={({ pressed }) => [styles.providerBtn, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.providerBtnText}>{t("settings.connect")}</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.emptySubtitle}>
                Ask me anything. I'll think through it with you.
              </Text>
            )}
          </View>
        )}
      </View>

      {/* ─── Streaming indicator ─── */}
      {isStreaming && (
        <View style={styles.streamingIndicator}>
          <ActivityIndicator size="small" color={theme.indigo} />
          <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: "500", marginLeft: 8 }}>
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
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  modelChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    flexShrink: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.border,
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFill as any,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
    paddingHorizontal: 32,
  },
  emptyGlyph: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: theme.activeBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: theme.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    color: theme.textMuted,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  providerBtn: {
    backgroundColor: theme.activeBg,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  providerBtnText: {
    color: theme.indigo,
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
