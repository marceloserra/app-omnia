import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useProviderStore } from "../store/provider-store";
import { MessageSquare, Plus } from "lucide-react-native";
import { openDatabase, createConversationRepo } from "@omnia/storage";
import { Conversation } from "@omnia/shared-types";
import { logger } from "@omnia/logger";

const BG = "#0a0918";
const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f0efff";
const TEXT_SECONDARY = "#9d9bcc";

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
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Provider status bar */}
      {store.activeProviderId && store.isConnected && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "rgba(99,102,241,0.08)", borderBottomWidth: 1, borderBottomColor: "rgba(99,102,241,0.15)" }}>
          <Text style={{ fontSize: 12, color: INDIGO, fontWeight: "600" }}>
            ✦ {store.activeProviderId === "openai" ? "OpenAI" : "Local AI"} · {store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* New conversation button */}
        <Button variant="default" size="lg" onPress={startNewChat} style={{ marginBottom: 24 }}>
          <Plus size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>New Conversation</Text>
        </Button>

        {!store.isConnected && (
          <Card padding="md" style={{ marginBottom: 20 }}>
            <Text style={{ color: TEXT_SECONDARY, fontSize: 14, textAlign: "center" }}>
              No provider connected.{"\n"}
              <Text
                style={{ color: INDIGO, fontWeight: "600" }}
                onPress={() => router.push("/settings")}
              >
                Open Settings →
              </Text>
            </Text>
          </Card>
        )}

        {/* Conversation list */}
        {conversations.length > 0 && (
          <>
            <Text style={{ fontSize: 13, fontWeight: "600", color: TEXT_SECONDARY, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
              Recent
            </Text>
            {conversations.map((conv) => (
              <Pressable
                key={conv.id}
                onPress={() => router.push(`/chat/${conv.id}`)}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, marginBottom: 10 })}
              >
                <Card padding="md">
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(99,102,241,0.2)", alignItems: "center", justifyContent: "center" }}>
                      <MessageSquare size={16} color={INDIGO} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: TEXT_PRIMARY, fontWeight: "600", fontSize: 14, marginBottom: 2 }}>
                        {conv.title}
                      </Text>
                      {conv.systemPrompt && (
                        <Text style={{ color: TEXT_SECONDARY, fontSize: 13 }} numberOfLines={1}>
                          System: {conv.systemPrompt}
                        </Text>
                      )}
                    </View>
                    <Text style={{ color: TEXT_SECONDARY, fontSize: 11 }}>
                      {new Date(conv.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                </Card>
              </Pressable>
            ))}
          </>
        )}

      </ScrollView>
    </View>
  );
}
