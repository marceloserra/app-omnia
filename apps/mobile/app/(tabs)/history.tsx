import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  View, Text, FlatList, Pressable, StyleSheet, TextInput, Modal, 
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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

      <FlatList
        data={[
          ...(pinned.length > 0 ? [{ id: 'header-pinned', isHeader: true, title: "Pinned" }] : []),
          ...pinned,
          ...(unpinned.length > 0 ? [{ id: 'header-recent', isHeader: true, title: "Recent" }] : []),
          ...unpinned
        ]}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        renderItem={({ item }) => {
          if ('isHeader' in item) {
            return <Text style={styles.groupTitle}>{item.title}</Text>;
          }
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
    fontSize: 28,
    fontWeight: "700",
    color: theme.textPrimary,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface2,
    marginHorizontal: 16,
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
