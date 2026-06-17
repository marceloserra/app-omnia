import React, { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { DrawerContentScrollView, DrawerContentComponentProps } from "@react-navigation/drawer";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { MessageSquare, Plus, Settings, Sparkles } from "lucide-react-native";
import { openDatabase, createConversationRepo } from "@omnia/storage";
import { Conversation } from "@omnia/shared-types";
import { useProviderStore } from "../../store/provider-store";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const BG = "#05050f";
const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_SECONDARY = "#94a3b8";

const db = openDatabase();
const convRepo = createConversationRepo(db);

export function CustomDrawer(props: DrawerContentComponentProps) {
  const store = useProviderStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

  useFocusEffect(
    useCallback(() => {
      try {
        const data = convRepo.listAll();
        setConversations(data);
      } catch (err) {
        console.error("Failed to list conversations", err);
      }
    }, [])
  );

  const handleNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/");
    props.navigation.closeDrawer();
  };

  const handleOpenChat = (id: string) => {
    Haptics.selectionAsync();
    router.push(`/chat/${id}`);
    props.navigation.closeDrawer();
  };

  const handleSettings = () => {
    Haptics.selectionAsync();
    router.push("/settings");
    props.navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      {/* Drawer Header */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Sparkles size={20} color="#fff" />
        </View>
        <Text style={styles.logoText}>Omnia AI</Text>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        
        {/* New Chat Button */}
        <Pressable onPress={handleNewChat} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, styles.newChatBtn]}>
          <LinearGradient
            colors={["#4f46e5", "#6366f1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.newChatGradient}
          >
            <Plus size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.newChatText}>New chat</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.sectionTitle}>Recent</Text>

        {conversations.length === 0 ? (
          <Text style={styles.emptyText}>No recent chats.</Text>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === conversationId;
            return (
              <Pressable
                key={conv.id}
                onPress={() => handleOpenChat(conv.id)}
                style={({ pressed }) => [styles.convItem, (pressed || isActive) && styles.convItemActive]}
              >
                <MessageSquare size={16} color={isActive ? "#fff" : TEXT_SECONDARY} style={{ marginRight: 12 }} />
                <Text style={[styles.convTitle, isActive && styles.convTitleActive]} numberOfLines={1}>{conv.title}</Text>
              </Pressable>
            );
          })
        )}

      </DrawerContentScrollView>

      {/* Footer Settings */}
      <Pressable onPress={handleSettings} style={({ pressed }) => [styles.footer, pressed && { opacity: 0.7 }]}>
        <Settings size={20} color={TEXT_SECONDARY} style={{ marginRight: 12 }} />
        <View>
          <Text style={styles.footerTitle}>Settings</Text>
          <Text style={styles.footerSubtitle}>
            {store.activeProviderId === "openai" ? "OpenAI Connected" : 
             store.activeProviderId === "openai-compatible" ? "Local AI Connected" : 
             "No Provider"}
          </Text>
        </View>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(99,102,241,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoText: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingTop: 0,
    paddingHorizontal: 16,
  },
  newChatBtn: {
    marginBottom: 24,
    borderRadius: 16,
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
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  convItemActive: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  convTitle: {
    color: "#cbd5e1",
    fontSize: 14,
    flex: 1,
  },
  convTitleActive: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 13,
    paddingHorizontal: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  footerTitle: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "600",
  },
  footerSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    marginTop: 2,
  },
});
