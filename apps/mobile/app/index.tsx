import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, Settings, MessageSquarePlus } from "lucide-react-native";
import { openDatabase, createConversationRepo } from "@omnia/storage";
import * as Haptics from "expo-haptics";
import { ConversationListItem } from "../components/chat/ConversationListItem";

const BG = "#05050f";
const SURFACE = "#0e0e1f";
const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f0efff";
const TEXT_MUTED = "rgba(148,163,184,0.55)";

const db = openDatabase();
const convRepo = createConversationRepo(db);

interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
}

export default function IndexScreen() {
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useFocusEffect(
    useCallback(() => {
      try {
        const all = convRepo.listAll();
        const sorted = [...all].sort((a, b) => b.updatedAt - a.updatedAt);
        setConversations(sorted);
      } catch {
        setConversations([]);
      }
    }, [])
  );

  const handleNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/new-chat");
  };

  const handleOpenChat = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/chat/${id}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ─── Custom Header ─── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Omnia</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push("/settings")}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
            accessibilityLabel="Settings"
          >
            <Settings size={22} color={TEXT_PRIMARY} strokeWidth={1.8} />
          </Pressable>
          <Pressable
            onPress={handleNewChat}
            style={({ pressed }) => [styles.iconBtn, styles.iconBtnLast, pressed && { opacity: 0.5 }]}
            accessibilityLabel="New chat"
          >
            <MessageSquarePlus size={22} color={TEXT_PRIMARY} strokeWidth={1.8} />
          </Pressable>
        </View>
      </View>

      {/* ─── Separator ─── */}
      <View style={styles.separator} />

      {/* ─── List ─── */}
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <ConversationListItem item={item} onPress={handleOpenChat} />
        )}
        contentContainerStyle={
          conversations.length === 0
            ? styles.listEmptyContent
            : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyGlyph}>
              <Text style={styles.emptyGlyphText}>✦</Text>
            </View>
            <Text style={styles.emptyTitle}>Omnia</Text>
            <Text style={styles.emptySubtitle}>
              Your conversations will appear here.{"\n"}Tap below to start.
            </Text>
          </View>
        }
      />

      {/* ─── FAB ─── */}
      <Pressable
        onPress={handleNewChat}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 24 },
          pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
        ]}
        accessibilityLabel="Start new chat"
      >
        <Plus size={20} color="#fff" strokeWidth={2.5} />
        <Text style={styles.fabLabel}>New Chat</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // ── Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  iconBtnLast: {
    marginLeft: 2,
  },

  // ── Separator
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginHorizontal: 0,
  },

  // ── List
  listContent: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  listEmptyContent: {
    flexGrow: 1,
  },

  // ── Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
    paddingHorizontal: 32,
  },
  emptyGlyph: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "rgba(99,102,241,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyGlyphText: {
    fontSize: 34,
    color: "#818cf8",
  },
  emptyTitle: {
    color: TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: TEXT_MUTED,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  // ── FAB
  fab: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: INDIGO,
    paddingLeft: 16,
    paddingRight: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: INDIGO,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  fabLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginLeft: 8,
  },
});
