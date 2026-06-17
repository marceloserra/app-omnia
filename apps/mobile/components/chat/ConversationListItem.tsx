import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MessageSquare } from "lucide-react-native";

interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
}

interface Props {
  item: Conversation;
  onPress: (id: string) => void;
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ms).toLocaleDateString();
}

export function ConversationListItem({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(item.id)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.iconBox}>
        <MessageSquare size={18} color="#818cf8" strokeWidth={1.5} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title || "New conversation"}
        </Text>
        <Text style={styles.time}>{timeAgo(item.updatedAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowPressed: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(99,102,241,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  title: {
    color: "#f0efff",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.1,
    marginBottom: 3,
  },
  time: {
    color: "rgba(148,163,184,0.6)",
    fontSize: 12,
  },
});
