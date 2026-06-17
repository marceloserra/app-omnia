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
const INDIGO = "#6366f1";

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

  // Reload list whenever this screen regains focus (e.g. coming back from a chat)
  useFocusEffect(
    useCallback(() => {
      try {
        const all = convRepo.listAll();
        // Sort newest first
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Omnia</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push("/settings")}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
            accessibilityLabel="Settings"
          >
            <Settings size={22} color="rgba(240,239,255,0.8)" strokeWidth={1.8} />
          </Pressable>
          <Pressable
            onPress={handleNewChat}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
            accessibilityLabel="New chat"
          >
            <MessageSquarePlus size={22} color="rgba(240,239,255,0.8)" strokeWidth={1.8} />
          </Pressable>
        </View>
      </View>

      {/* Ambient glow */}
      <View style={styles.ambientGlow} />

      {/* Conversation list */}
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <ConversationListItem item={item} onPress={handleOpenChat} />
        )}
        contentContainerStyle={conversations.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyGlyph}>
              <Text style={{ fontSize: 36, color: "#818cf8" }}>✦</Text>
            </View>
            <Text style={styles.emptyTitle}>Omnia</Text>
            <Text style={styles.emptySubtitle}>
              Your conversations will appear here.{"\n"}Tap the button below to start.
            </Text>
          </View>
        }
      />

      {/* Floating "New Chat" button */}
      <Pressable
        onPress={handleNewChat}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 24 },
          pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
        ]}
        accessibilityLabel="Start new chat"
      >
        <Plus size={22} color="#fff" strokeWidth={2.5} />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    color: "#f0efff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: "row",
    gap: 4,
  },
  iconBtn: {
    padding: 10,
    borderRadius: 12,
  },
  ambientGlow: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: INDIGO,
    opacity: 0.08,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
    gap: 12,
  },
  emptyGlyph: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "rgba(99,102,241,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    color: "#f0efff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  emptySubtitle: {
    color: "rgba(148,163,184,0.6)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: INDIGO,
    paddingHorizontal: 20,
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
  },
});
