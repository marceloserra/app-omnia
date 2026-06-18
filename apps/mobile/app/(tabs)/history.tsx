import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  View, Text, SectionList, Pressable, StyleSheet, TextInput, Modal, 
  Platform, KeyboardAvoidingView, Animated
} from "react-native";
import { MessageSquare, Pin, Pencil, Trash2, Search, X } from "lucide-react-native";
import { useTheme, ThemePalette } from "../../lib/theme";
import { useTranslation } from "../../lib/i18n";
import { Conversation } from "@omnia/shared-types";
import { useHistory } from "../../hooks/useHistory";
import { router, useFocusEffect } from "expo-router";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Swipeable } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useSettingsStore } from "../../store/settings-store";

// HistoryScreen manages the UI representation of past conversations

export default function HistoryScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  
  const { conversations, pinConversation, deleteConversation, renameConversation, refreshHistory } = useHistory();
  const [searchQuery, setSearchQuery] = useState("");
  
  const [renameConv, setRenameConv] = useState<Conversation | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [deleteConv, setDeleteConv] = useState<Conversation | null>(null);
  
  const rowRefs = useRef<Map<string, Swipeable>>(new Map());
  
  useFocusEffect(
    useCallback(() => {
      refreshHistory();
    }, [refreshHistory])
  );

  const togglePin = (conv: Conversation) => {
    pinConversation(conv.id, !conv.isPinned);
  };

  const handleRename = () => {
    if (renameConv && renameTitle.trim()) {
      renameConversation(renameConv.id, renameTitle.trim());
    }
    setRenameConv(null);
  };

  const handleDelete = () => {
    if (deleteConv) {
      deleteConversation(deleteConv.id);
    }
    setDeleteConv(null);
  };

  const filtered = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // We don't need to manually sort because SQLite already returns ORDER BY is_pinned DESC, updated_at DESC
  // But we might need to resort after filtering if we wanted, however filtered retains array order.
  const pinned = filtered.filter(c => c.isPinned);
  const unpinned = filtered.filter(c => !c.isPinned);

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

    if (date >= today) return t("history.buckets.today");
    if (date >= yesterday) return t("history.buckets.yesterday");
    if (date >= last7) return t("history.buckets.previous7");
    if (date >= last30) return t("history.buckets.previous30");
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const sections: { title: string, data: Conversation[] }[] = [];
  
  if (pinned.length > 0) {
    sections.push({ title: t("history.buckets.pinned"), data: pinned });
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
        contentContainerStyle={{ paddingBottom: 120 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.groupTitle}>{title}</Text>
        )}
        renderItem={({ item }) => {
          const conv = item as Conversation;
          
          const renderLeftActions = (progress: any, dragX: any) => {
            const trans = dragX.interpolate({
              inputRange: [0, 80],
              outputRange: [-80, 0],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View style={{ justifyContent: "center", width: 80, transform: [{ translateX: trans }] }}>
                <Pressable
                  style={{ flex: 1, backgroundColor: conv.isPinned ? "#64748b" : "#f59e0b", justifyContent: "center", alignItems: "center" }}
                  onPress={() => {
                    if (useSettingsStore.getState().hapticsEnabled) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                    togglePin(conv);
                  }}
                >
                  <View style={{ transform: conv.isPinned ? [{ rotate: "45deg" }] : undefined }}>
                    <Pin size={20} color="#fff" />
                  </View>
                </Pressable>
              </Animated.View>
            );
          };

          const renderRightActions = (progress: any, dragX: any) => {
            const trans = dragX.interpolate({
              inputRange: [-140, 0],
              outputRange: [0, 140],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View style={{ flexDirection: "row", width: 140, justifyContent: "flex-end", transform: [{ translateX: trans }] }}>
                <Pressable
                  style={{ flex: 1, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center" }}
                  onPress={() => { 
                    if (useSettingsStore.getState().hapticsEnabled) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                    rowRefs.current.get(conv.id)?.close(); 
                    setRenameTitle(conv.title); 
                    setRenameConv(conv); 
                  }}
                >
                  <Pencil size={20} color="#fff" />
                </Pressable>
                <Pressable
                  style={{ flex: 1, backgroundColor: "#ef4444", justifyContent: "center", alignItems: "center" }}
                  onPress={() => { 
                    if (useSettingsStore.getState().hapticsEnabled) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                    rowRefs.current.get(conv.id)?.close(); 
                    setDeleteConv(conv); 
                  }}
                >
                  <Trash2 size={20} color="#fff" />
                </Pressable>
              </Animated.View>
            );
          };
          
          return (
            <Swipeable
              ref={ref => {
                if (ref) rowRefs.current.set(conv.id, ref);
                else rowRefs.current.delete(conv.id);
              }}
              renderLeftActions={renderLeftActions}
              renderRightActions={renderRightActions}
              overshootLeft={false}
              overshootRight={false}
              friction={2}
              leftThreshold={40}
              rightThreshold={40}
              onSwipeableWillOpen={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              containerStyle={{
                marginHorizontal: 20,
                marginBottom: 8,
                borderRadius: 16,
                overflow: "hidden", // strictly contains actions inside the pill shape
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Pressable
                onPress={() => router.push(`/chat/${conv.id}`)}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  rowRefs.current.get(conv.id)?.openRight();
                }}
                delayLongPress={200}
                style={styles.convItem}
                android_ripple={{ color: theme.activeBg }}
              >
                {conv.isPinned ? (
                  <Pin size={16} color={theme.indigo} style={{ marginRight: 12 }} />
                ) : (
                  <MessageSquare size={16} color={theme.textSecondary} style={{ marginRight: 12 }} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.convTitle} numberOfLines={1}>{conv.title}</Text>
                  <Text style={styles.convDate}>{new Date(conv.updatedAt).toLocaleDateString()}</Text>
                </View>
              </Pressable>
            </Swipeable>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No chats found.</Text>}
      />

      <Modal visible={!!renameConv} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 }}>
            <View style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 20 }}>
              <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 16 }}>Rename Chat</Text>
              <TextInput
                style={{ backgroundColor: theme.surface2, color: theme.textPrimary, padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 24 }}
                value={renameTitle}
                onChangeText={setRenameTitle}
                autoFocus
              />
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
                <Pressable onPress={() => setRenameConv(null)} style={{ padding: 10 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 16, fontWeight: "600" }}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleRename} style={{ padding: 10 }}>
                  <Text style={{ color: theme.indigo, fontSize: 16, fontWeight: "600" }}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmDialog
        visible={!!deleteConv}
        title="Delete Chat"
        message="Are you sure you want to delete this conversation? This cannot be undone."
        confirmText="Delete"
        onCancel={() => setDeleteConv(null)}
        onConfirm={handleDelete}
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
    paddingHorizontal: 24,
  },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    padding: 16,
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
