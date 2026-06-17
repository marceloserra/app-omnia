import React, { useState, useCallback, useRef } from "react";
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Animated, Modal, TouchableWithoutFeedback, Platform,
  StatusBar, TextInput, Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  MessageSquare, Plus, Settings, Sparkles, X,
  Pin, Pencil, Trash2, Search
} from "lucide-react-native";
import { openDatabase, createConversationRepo, createMessageRepo } from "@omnia/storage";
import { Conversation } from "@omnia/shared-types";
import { useProviderStore } from "../../store/provider-store";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ConfirmDialog } from "../ui/ConfirmDialog";

const BG = "#05050f";
const SURFACE = "#0d0c1d";
const SURFACE_2 = "#13122a";
const BORDER = "rgba(255,255,255,0.07)";
const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_SECONDARY = "#94a3b8";
const DRAWER_WIDTH = 300;
const RED = "#ef4444";

const db = openDatabase();
const convRepo = createConversationRepo(db);
const msgRepo = createMessageRepo(db);

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

interface ContextMenuState {
  visible: boolean;
  conversation: Conversation | null;
}

interface RenameState {
  active: boolean;
  conversationId: string | null;
  value: string;
}

export function Sidebar({ visible, onClose }: SidebarProps) {
  const store = useProviderStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, conversation: null });
  const [rename, setRename] = useState<RenameState>({ active: false, conversationId: null, value: "" });
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Conversation | null>(null);

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sheetSlideAnim = useRef(new Animated.Value(400)).current;
  const sheetFadeAnim = useRef(new Animated.Value(0)).current;
  const renameRefs = useRef<Record<string, TextInput | null>>({});

  // Animate drawer open/close
  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  // Animate bottom sheet open
  React.useEffect(() => {
    if (contextMenu.visible) {
      Animated.parallel([
        Animated.spring(sheetSlideAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 10 }),
        Animated.timing(sheetFadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(sheetSlideAnim, { toValue: 400, duration: 200, useNativeDriver: true }).start();
      Animated.timing(sheetFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [contextMenu.visible]);

  const refreshConversations = useCallback(() => {
    try {
      const data = convRepo.listAll();
      setConversations(data);
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => {
    if (visible) refreshConversations();
  }, [visible, refreshConversations]));

  React.useEffect(() => {
    if (visible) refreshConversations();
  }, [visible]);

  // ─── Navigation helpers ───────────────────────────────────────────────────
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

  // ─── Context menu ────────────────────────────────────────────────────────
  const openContextMenu = (conv: Conversation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setContextMenu({ visible: true, conversation: conv });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, conversation: null });
  };

  // ─── Pin ──────────────────────────────────────────────────────────────────
  const handlePin = () => {
    if (!contextMenu.conversation) return;
    const id = contextMenu.conversation.id;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    closeContextMenu();
  };

  // ─── Rename ───────────────────────────────────────────────────────────────
  const handleRenameStart = () => {
    if (!contextMenu.conversation) return;
    const conv = contextMenu.conversation;
    closeContextMenu();
    // Small delay so modal closes before rename activates
    setTimeout(() => {
      setRename({ active: true, conversationId: conv.id, value: conv.title });
      setTimeout(() => renameRefs.current[conv.id]?.focus(), 120);
    }, 300);
  };

  const handleRenameConfirm = (id: string) => {
    const trimmed = rename.value.trim().slice(0, 60);
    if (trimmed) {
      try {
        convRepo.update(id, { title: trimmed });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
    setRename({ active: false, conversationId: null, value: "" });
    refreshConversations();
  };

  const handleRenameCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRename({ active: false, conversationId: null, value: "" });
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (!contextMenu.conversation) return;
    const conv = contextMenu.conversation;
    closeContextMenu();
    setTimeout(() => {
      setDeleteConfirmTarget(conv);
    }, 300);
  };

  const confirmDelete = () => {
    if (!deleteConfirmTarget) return;
    try {
      msgRepo.deleteByConversation(deleteConfirmTarget.id);
      convRepo.delete(deleteConfirmTarget.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    setDeleteConfirmTarget(null);
    refreshConversations();
  };

  // Filter by search query
  const filtered = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: pinned first, then by updatedAt desc
  const sorted = [...filtered].sort((a, b) => {
    const aPinned = pinnedIds.has(a.id) ? 1 : 0;
    const bPinned = pinnedIds.has(b.id) ? 1 : 0;
    if (bPinned !== aPinned) return bPinned - aPinned;
    return b.updatedAt - a.updatedAt;
  });

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
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>

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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={16} color={TEXT_SECONDARY} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            placeholderTextColor="rgba(148,163,184,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8} style={styles.clearSearchBtn}>
              <X size={14} color={TEXT_SECONDARY} />
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionLabel}>
          {searchQuery ? "Search Results" : "Recent"}
        </Text>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {sorted.length === 0 ? (
            <Text style={styles.emptyText}>No recent chats yet.</Text>
          ) : (
            sorted.map((conv) => {
              const isPinned = pinnedIds.has(conv.id);
              const isRenaming = rename.active && rename.conversationId === conv.id;

              return (
                <Pressable
                  key={conv.id}
                  onPress={() => !isRenaming && handleOpenChat(conv.id)}
                  onLongPress={() => !isRenaming && openContextMenu(conv)}
                  delayLongPress={400}
                  style={({ pressed }) => [
                    styles.convItem,
                    isPinned && styles.convItemPinned,
                    pressed && !isRenaming && styles.convItemPressed,
                  ]}
                >
                  {isPinned ? (
                    <Pin size={14} color="#a5b4fc" style={{ marginRight: 10, flexShrink: 0 }} />
                  ) : (
                    <MessageSquare size={14} color={TEXT_SECONDARY} style={{ marginRight: 10, flexShrink: 0 }} />
                  )}

                  {isRenaming ? (
                    <View style={styles.renameRow}>
                      <TextInput
                        ref={ref => { renameRefs.current[conv.id] = ref; }}
                        value={rename.value}
                        onChangeText={val => setRename(r => ({ ...r, value: val }))}
                        style={styles.renameInput}
                        maxLength={60}
                        returnKeyType="done"
                        onSubmitEditing={() => handleRenameConfirm(conv.id)}
                        autoFocus
                      />
                      <Pressable onPress={() => handleRenameConfirm(conv.id)} hitSlop={8} style={styles.renameConfirmBtn}>
                        <Text style={styles.renameConfirmText}>✓</Text>
                      </Pressable>
                      <Pressable onPress={handleRenameCancel} hitSlop={8} style={{ paddingLeft: 6 }}>
                        <X size={14} color={TEXT_SECONDARY} />
                      </Pressable>
                    </View>
                  ) : (
                    <Text style={[styles.convTitle, isPinned && styles.convTitlePinned]} numberOfLines={1}>
                      {conv.title}
                    </Text>
                  )}
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

      {/* ─── Context Menu ─── */}
      <Modal
        visible={contextMenu.visible}
        transparent
        animationType="none"
        onRequestClose={closeContextMenu}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={closeContextMenu}>
          <Animated.View style={[styles.menuBackdrop, { opacity: sheetFadeAnim }]} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetContainer} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: sheetSlideAnim }] },
            ]}
          >
            {/* Handle Pill */}
            <View style={styles.sheetHandleContainer}>
              <View style={styles.sheetHandle} />
            </View>

            {/* Title chip */}
            <View style={styles.menuHeader}>
              <MessageSquare size={16} color="#a5b4fc" style={{ marginRight: 10 }} />
              <Text style={styles.menuTitle} numberOfLines={1}>
                {contextMenu.conversation?.title}
              </Text>
            </View>

            <View style={styles.menuDivider} />

            {/* Pin */}
            <Pressable
              onPress={handlePin}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            >
              <Pin size={20} color={TEXT_PRIMARY} style={{ marginRight: 16 }} />
              <Text style={styles.menuItemText}>
                {contextMenu.conversation && pinnedIds.has(contextMenu.conversation.id)
                  ? "Unpin from top"
                  : "Pin to top"}
              </Text>
            </Pressable>

            <View style={styles.menuDivider} />

            {/* Rename */}
            <Pressable
              onPress={handleRenameStart}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            >
              <Pencil size={20} color={TEXT_PRIMARY} style={{ marginRight: 16 }} />
              <Text style={styles.menuItemText}>Rename conversation</Text>
            </Pressable>

            <View style={styles.menuDivider} />

            {/* Delete */}
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [styles.menuItem, styles.menuItemDanger, pressed && styles.menuItemPressed]}
            >
              <Trash2 size={20} color={RED} style={{ marginRight: 16 }} />
              <Text style={[styles.menuItemText, { color: RED }]}>Delete conversation</Text>
            </Pressable>
            
            {/* Bottom Padding for SafeArea */}
            <View style={{ height: Platform.OS === "ios" ? 34 : 20 }} />
          </Animated.View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={!!deleteConfirmTarget}
        title="Delete Chat"
        message={`"${deleteConfirmTarget?.title}" will be permanently deleted. This cannot be undone.`}
        confirmText="Delete"
        onCancel={() => setDeleteConfirmTarget(null)}
        onConfirm={confirmDelete}
      />
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
  newChatText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginLeft: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(148,163,184,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 8,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: TEXT_PRIMARY,
    fontSize: 14,
  },
  clearSearchBtn: {
    padding: 4,
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
  convItemPinned: {
    backgroundColor: "rgba(99,102,241,0.08)",
  },
  convItemPressed: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  convTitle: {
    color: "#94a3b8",
    fontSize: 14,
    flex: 1,
  },
  convTitlePinned: {
    color: "#c7d2fe",
    fontWeight: "500",
  },
  renameRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  renameInput: {
    flex: 1,
    color: TEXT_PRIMARY,
    fontSize: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.4)",
  },
  renameConfirmBtn: {
    paddingLeft: 8,
  },
  renameConfirmText: {
    color: "#a5b4fc",
    fontSize: 16,
    fontWeight: "700",
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

  // ─── Context Menu ──────────────────────────────────────────────────────────
  menuBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheetContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: SURFACE_2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 24,
  },
  sheetHandleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  menuTitle: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
    flex: 1,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  menuItemDanger: {
    // highlight handled by text/icon color
  },
  menuItemPressed: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  menuItemText: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: "500",
  },
});
