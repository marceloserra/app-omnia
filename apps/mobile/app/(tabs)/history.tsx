import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  View, Text, SectionList, Pressable, StyleSheet, TextInput, Modal, 
  TouchableWithoutFeedback, Animated, Platform, KeyboardAvoidingView 
} from "react-native";
import { MessageSquare, Pin, Pencil, Trash2, Search, X } from "lucide-react-native";
import { useTheme, ThemePalette } from "../../lib/theme";
import { openDatabase, createConversationRepo } from "@omnia/storage";
import { Conversation } from "@omnia/shared-types";
import { router } from "expo-router";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const db = openDatabase();
const convRepo = createConversationRepo(db);

export default function HistoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  
  // Refresh on focus logic can be added, for now fetch on mount
  useEffect(() => {
    loadConvs();
  }, []);

  const loadConvs = () => {
    try {
      setConversations(convRepo.listAll());
    } catch (e) {}
  };

  const filtered = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);
  const pinned = sorted.filter(c => pinnedIds.has(c.id));
  const unpinned = sorted.filter(c => !pinnedIds.has(c.id));

  const getBucket = (dateMs: number) => {
    const date = new Date(dateMs);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7 = new Date(today);
    last7.setDate(last7.getDate() - 7);
    const last30 = new Date(today);
    last30.setDate(last30.getDate() - 30);

    if (date >= today) return "Today";
    if (date >= yesterday) return "Yesterday";
    if (date >= last7) return "Previous 7 Days";
    if (date >= last30) return "Previous 30 Days";
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const sections: { title: string, data: Conversation[] }[] = [];
  
  if (pinned.length > 0) {
    sections.push({ title: "Pinned", data: pinned });
  }

  const buckets: Record<string, Conversation[]> = {};
  unpinned.forEach(c => {
    const bucket = getBucket(c.updatedAt);
    if (!buckets[bucket]) buckets[bucket] = [];
    buckets[bucket].push(c);
  });

  const bucketOrder = ["Today", "Yesterday", "Previous 7 Days", "Previous 30 Days"];
  bucketOrder.forEach(b => {
    if (buckets[b]) {
      sections.push({ title: b, data: buckets[b] });
      delete buckets[b];
    }
  });

  Object.keys(buckets).forEach(b => {
    sections.push({ title: b, data: buckets[b] });
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.headerTitle}>Chat History</Text>
      
      <View style={styles.searchContainer}>
        <Search size={16} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor="rgba(148,163,184,0.5)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")} style={styles.clearSearchBtn}>
            <X size={14} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.groupTitle}>{title}</Text>
        )}
        renderItem={({ item }) => {
          const conv = item as Conversation;
          const isPinned = pinnedIds.has(conv.id);
          
          return (
            <Pressable
              onPress={() => router.push(`/chat/${conv.id}`)}
              style={({ pressed }) => [styles.convItem, pressed && styles.convItemPressed]}
            >
              {isPinned ? (
                <Pin size={16} color={theme.indigo} style={{ marginRight: 12 }} />
              ) : (
                <MessageSquare size={16} color={theme.textSecondary} style={{ marginRight: 12 }} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.convTitle} numberOfLines={1}>{conv.title}</Text>
                <Text style={styles.convDate}>{new Date(conv.updatedAt).toLocaleDateString()}</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No chats found.</Text>}
      />
    </View>
  );
}

const createStyles = (theme: ThemePalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: theme.textPrimary,
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 32,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface2,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.textPrimary,
    fontSize: 15,
    height: "100%",
  },
  clearSearchBtn: {
    padding: 4,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  convItemPressed: {
    backgroundColor: theme.activeBg,
  },
  convTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.textPrimary,
    marginBottom: 4,
  },
  convDate: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  emptyText: {
    textAlign: "center",
    color: theme.textSecondary,
    marginTop: 40,
    fontSize: 15,
  }
});
