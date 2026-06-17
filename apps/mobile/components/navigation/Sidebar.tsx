import React, { useState, useCallback, useRef } from "react";
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Animated, Modal, TouchableWithoutFeedback, Platform, StatusBar,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { MessageSquare, Plus, Settings, Sparkles, X } from "lucide-react-native";
import { openDatabase, createConversationRepo } from "@omnia/storage";
import { Conversation } from "@omnia/shared-types";
import { useProviderStore } from "../../store/provider-store";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const BG = "#05050f";
const SURFACE = "#0d0c1d";
const BORDER = "rgba(255,255,255,0.07)";
const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_SECONDARY = "#94a3b8";
const DRAWER_WIDTH = 300;

const db = openDatabase();
const convRepo = createConversationRepo(db);

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export function Sidebar({ visible, onClose }: SidebarProps) {
  const store = useProviderStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

  // Animate open/close
  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Load conversations whenever sidebar opens
  useFocusEffect(
    useCallback(() => {
      if (!visible) return;
      try {
        const data = convRepo.listAll();
        setConversations(data);
      } catch (err) {}
    }, [visible])
  );

  React.useEffect(() => {
    if (visible) {
      try {
        const data = convRepo.listAll();
        setConversations(data);
      } catch (err) {}
    }
  }, [visible]);

  const handleNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => router.replace("/"), 250);
  };

  const handleOpenChat = (id: string) => {
    Haptics.selectionAsync();
    onClose();
    setTimeout(() => router.replace(`/chat/${id}`), 250);
  };

  const handleSettings = () => {
    Haptics.selectionAsync();
    onClose();
    setTimeout(() => router.push("/settings"), 250);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Drawer panel */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Sparkles size={18} color="#a5b4fc" />
            </View>
            <Text style={styles.logoText}>Omnia AI</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <X size={20} color={TEXT_SECONDARY} />
          </Pressable>
        </View>

        {/* New Chat Button */}
        <Pressable
          onPress={handleNewChat}
          style={({ pressed }) => [styles.newChatBtn, pressed && { opacity: 0.85 }]}
        >
          <LinearGradient
            colors={["#4f46e5", "#7c3aed"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.newChatGradient}
          >
            <Plus size={18} color="#fff" />
            <Text style={styles.newChatText}>New chat</Text>
          </LinearGradient>
        </Pressable>

        {/* Recent chats */}
        <Text style={styles.sectionLabel}>Recent</Text>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {conversations.length === 0 ? (
            <Text style={styles.emptyText}>No recent chats yet.</Text>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === conversationId;
              return (
                <Pressable
                  key={conv.id}
                  onPress={() => handleOpenChat(conv.id)}
                  style={({ pressed }) => [
                    styles.convItem,
                    isActive && styles.convItemActive,
                    pressed && !isActive && styles.convItemPressed,
                  ]}
                >
                  <MessageSquare
                    size={15}
                    color={isActive ? "#a5b4fc" : TEXT_SECONDARY}
                    style={{ marginRight: 10, flexShrink: 0 }}
                  />
                  <Text
                    style={[styles.convTitle, isActive && styles.convTitleActive]}
                    numberOfLines={1}
                  >
                    {conv.title}
                  </Text>
                </Pressable>
              );
            })
          )}
        </ScrollView>

        {/* Footer */}
        <Pressable
          onPress={handleSettings}
          style={({ pressed }) => [styles.footer, pressed && { opacity: 0.7 }]}
        >
          <Settings size={19} color={TEXT_SECONDARY} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.footerTitle}>Settings</Text>
            <Text style={styles.footerSub} numberOfLines={1}>
              {store.activeProviderId === "openai"
                ? "OpenAI connected"
                : store.activeProviderId === "openai-compatible"
                ? "Local AI connected"
                : "No provider"}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: SURFACE,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 58 : (StatusBar.currentHeight ?? 0) + 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(99,102,241,0.15)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoText: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  newChatBtn: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 14,
    overflow: "hidden",
  },
  newChatGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  newChatIcon: {
    marginRight: 10,
  },
  newChatText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(148,163,184,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  list: {
    flex: 1,
    paddingHorizontal: 10,
  },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 2,
  },
  convItemActive: {
    backgroundColor: "rgba(99,102,241,0.15)",
  },
  convItemPressed: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  convTitle: {
    color: "#94a3b8",
    fontSize: 14,
    flex: 1,
  },
  convTitleActive: {
    color: "#e0e7ff",
    fontWeight: "600",
  },
  emptyText: {
    color: "rgba(148,163,184,0.35)",
    fontSize: 13,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerTitle: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "600",
  },
  footerSub: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    marginTop: 2,
  },
});
