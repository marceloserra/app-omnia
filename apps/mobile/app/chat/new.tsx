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
  Modal,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Message } from "@omnia/shared-types";
import { MessageBubble } from "../../components/chat/MessageBubble";
import { ChatInput } from "../../components/chat/ChatInput";
import { ModelPickerSheet, getModelIcon } from "../../components/chat/ModelPickerSheet";
import { useProviderStore } from "../../store/provider-store";
import { OpenAIProvider, OpenAICompatibleProvider } from "@omnia/providers";
import { openDatabase, createMessageRepo, createConversationRepo } from "@omnia/storage";
import { AlignLeft, Settings, Sparkles, ChevronDown, ChevronLeft } from "lucide-react-native";
import { BlurView } from "expo-blur";

import { useTheme, ThemePalette } from "../../lib/theme";
import { useTranslation } from "../../lib/i18n";

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

export default function HomeScreen() {
  const store = useProviderStore();
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 44;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [modelPickerVisible, setModelPickerVisible] = useState(false);
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

    const { convRepo, msgRepo } = getDb();
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

          {store.activeProviderId ? (
            <Pressable
              onPress={() => setModelPickerVisible(true)}
              accessibilityLabel="Change model"
              style={({ pressed }) => [styles.floatingChipContainer, pressed && { opacity: 0.7 }]}
            >
              <BlurView 
                intensity={isDark ? 60 : 100} 
                tint={isDark ? "dark" : "light"} 
                style={[styles.floatingChipInner, { backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)" }]}
              >
                <View style={styles.modelChipDot} />
                <Text style={styles.dynamicIslandText} numberOfLines={1}>
                  {store.activeProviderId === "openai" ? "OpenAI" : "Local"} · {store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId}
                </Text>
                <ChevronDown size={14} color={theme.textSecondary} />
              </BlurView>
            </Pressable>
          ) : (
            <View style={styles.floatingChipContainer}>
              <BlurView 
                intensity={isDark ? 60 : 100} 
                tint={isDark ? "dark" : "light"} 
                style={[styles.floatingChipInner, { backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)" }]}
              >
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
            <BlurView 
              intensity={isDark ? 60 : 100} 
              tint={isDark ? "dark" : "light"} 
              style={[styles.floatingBtnInner, { backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)" }]}
            >
              <Settings size={18} color={theme.textPrimary} strokeWidth={2} />
            </BlurView>
          </Pressable>
        </View>

        {/* ─── Divider Removed ─── */}

        {/* ─── Message list + Empty State (scoped wrapper) ─── */}
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={[...messages].reverse()}
            inverted
            keyExtractor={(m) => m.id}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={{ paddingBottom: 16, paddingTop: insets.top + 80, paddingHorizontal: 0, flexGrow: 1 }}
          />
        </View>

        {/* Empty State: absolute within the list area only, not the whole screen */}
        {messages.length === 0 && (
          <View style={styles.emptyOverlay} pointerEvents="box-none">
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                {getModelIcon(store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId, 48)}
              </View>
              <Text style={styles.emptyTitle}>Omnia · {store.activeProviderId === "openai" ? "OpenAI" : "Local"}</Text>
              <Text style={styles.emptySubtitle}>{t("chat.empty.connected").replace("{model}", store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId)}</Text>

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



      {/* ─── Model Picker Modal ─── */}
      <ModelPickerSheet
        visible={modelPickerVisible}
        models={store.availableModels}
        selected={store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId}
        theme={theme}
        isDark={isDark}
        onClose={() => setModelPickerVisible(false)}
        onSelect={(m) => {
          if (store.activeProviderId === "openai") store.setOpenaiModelId(m);
          else store.setCompatibleModelId(m);
        }}
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
  },
  providerConfigBtn: {
    marginTop: 16,
    backgroundColor: theme.indigo,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: theme.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  providerConfigText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  providerBtnText: {
    color: theme.indigo,
    fontWeight: "600",
    fontSize: 15,
  },
  streamingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
});
