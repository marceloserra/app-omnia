import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useProviderStore } from "../store/provider-store";
import { MessageSquare, Plus, ArrowRight } from "lucide-react-native";
import { openDatabase, createConversationRepo } from "@omnia/storage";
import { Conversation } from "@omnia/shared-types";
import { logger } from "@omnia/logger";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const BG = "#05050f";
const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_SECONDARY = "#94a3b8";

const db = openDatabase();
const convRepo = createConversationRepo(db);

export default function ConversationsScreen() {
  const store = useProviderStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useFocusEffect(
    useCallback(() => {
      try {
        const data = convRepo.listAll();
        setConversations(data);
      } catch (err) {
        logger.error("SQLite", "Failed to list conversations", err);
      }
    }, [])
  );

  const startNewChat = () => {
    try {
      const newId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const newConv: Conversation = {
        id: newId,
        title: "New Conversation",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      convRepo.create(newConv);
      router.push(`/chat/${newId}`);
    } catch (err) {
      logger.error("SQLite", "Failed to create conversation", err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background ambient glow */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      {/* Provider status bar */}
      {store.activeProviderId && store.isConnected && (
        <BlurView intensity={20} tint="dark" style={styles.statusBar}>
          <Text style={styles.statusText}>
            ✦ {store.activeProviderId === "openai" ? "OpenAI" : "Local AI"} · {store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId}
          </Text>
        </BlurView>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* New conversation button */}
        <Pressable onPress={startNewChat} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, styles.newChatWrapper]}>
          <LinearGradient
            colors={["#4f46e5", "#6366f1", "#818cf8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.newChatGradient}
          >
            <View style={styles.newChatContent}>
              <View style={styles.newChatIcon}>
                <Plus size={20} color={INDIGO} />
              </View>
              <Text style={styles.newChatText}>Start New Conversation</Text>
            </View>
          </LinearGradient>
        </Pressable>

        {!store.isConnected && (
          <BlurView intensity={30} tint="dark" style={styles.glassCard}>
            <Text style={styles.emptyText}>
              No provider connected yet.
            </Text>
            <Pressable onPress={() => router.push("/settings")} style={styles.linkButton}>
              <Text style={styles.linkText}>Open Settings to configure</Text>
              <ArrowRight size={14} color={INDIGO} />
            </Pressable>
          </BlurView>
        )}

        {/* Conversation list */}
        {conversations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Chats</Text>
            {conversations.map((conv) => (
              <Pressable
                key={conv.id}
                onPress={() => router.push(`/chat/${conv.id}`)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, styles.convWrapper]}
              >
                <BlurView intensity={20} tint="dark" style={styles.convCard}>
                  <View style={styles.convIcon}>
                    <MessageSquare size={16} color="#818cf8" />
                  </View>
                  <View style={styles.convTextContainer}>
                    <Text style={styles.convTitle} numberOfLines={1}>
                      {conv.title}
                    </Text>
                    {conv.systemPrompt && (
                      <Text style={styles.convPreview} numberOfLines={1}>
                        System: {conv.systemPrompt}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.convTime}>
                    {new Date(conv.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </BlurView>
              </Pressable>
            ))}
          </>
        )}

        {conversations.length === 0 && store.isConnected && (
          <View style={styles.emptyState}>
            <MessageSquare size={48} color="rgba(255,255,255,0.05)" />
            <Text style={styles.emptyStateText}>Your conversations will appear here.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  glowTop: {
    position: "absolute",
    top: -150,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: INDIGO,
    opacity: 0.15,
    filter: "blur(100px)",
  },
  glowBottom: {
    position: "absolute",
    bottom: 0,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#c084fc",
    opacity: 0.1,
    filter: "blur(100px)",
  },
  statusBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  statusText: {
    fontSize: 12,
    color: "#818cf8",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  newChatWrapper: {
    marginBottom: 32,
    borderRadius: 20,
    shadowColor: INDIGO,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  newChatGradient: {
    borderRadius: 20,
    padding: 2,
  },
  newChatContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 18,
    padding: 16,
  },
  newChatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  newChatText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  glassCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    overflow: "hidden",
  },
  emptyText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 12,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(99,102,241,0.1)",
    borderRadius: 20,
  },
  linkText: {
    color: "#818cf8",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 16,
    marginLeft: 4,
  },
  convWrapper: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  convCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 14,
  },
  convIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(99,102,241,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  convTextContainer: {
    flex: 1,
  },
  convTitle: {
    color: TEXT_PRIMARY,
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 4,
  },
  convPreview: {
    color: TEXT_SECONDARY,
    fontSize: 13,
  },
  convTime: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyStateText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 14,
    marginTop: 16,
  },
});
