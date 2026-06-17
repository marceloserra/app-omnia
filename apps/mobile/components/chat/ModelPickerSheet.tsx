import React, { useState } from "react";
import { View, Text, Pressable, FlatList, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Search, X, Check, Cpu, Brain, Bot, Sparkles, Zap, Wind, Globe } from "lucide-react-native";
import { ThemePalette } from "../../lib/theme";

interface ModelPickerSheetProps {
  models: string[];
  selected: string;
  onSelect: (m: string) => void;
  onClose: () => void;
  theme: ThemePalette;
  isDark: boolean;
}

const getModelIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("gpt") || n.includes("openai")) return <Brain size={18} color="#10b981" />;
  if (n.includes("claude") || n.includes("anthropic")) return <Sparkles size={18} color="#f59e0b" />;
  if (n.includes("llama") || n.includes("meta")) return <Bot size={18} color="#3b82f6" />;
  if (n.includes("gemma") || n.includes("gemini") || n.includes("google")) return <Zap size={18} color="#8b5cf6" />;
  if (n.includes("mistral") || n.includes("mixtral")) return <Wind size={18} color="#0ea5e9" />;
  if (n.includes("qwen")) return <Globe size={18} color="#ec4899" />;
  return <Cpu size={18} color="#64748b" />;
};

export function ModelPickerSheet({ models, selected, onSelect, onClose, theme, isDark }: ModelPickerSheetProps) {
  const [search, setSearch] = useState("");
  const filtered = models.filter((m) => m.toLowerCase().includes(search.toLowerCase()));

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
        <View style={{ width: 40, height: 4, backgroundColor: theme.border, borderRadius: 2, alignSelf: "center", marginBottom: 16 }} />
        <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: "700" }}>Select Model</Text>
      </View>
      {filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 60 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 15 }}>No models match</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const isSelected = item === selected;
            return (
              <Pressable
                onPress={() => { onSelect(item); onClose(); }}
                style={({ pressed }) => [{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  marginVertical: 3,
                  borderRadius: 14,
                  backgroundColor: isSelected
                    ? (isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.07)")
                    : "transparent",
                }, pressed && { opacity: 0.7 }]}
              >
                <View style={{ 
                  width: 32, height: 32, borderRadius: 16, backgroundColor: "#ffffff", 
                  alignItems: "center", justifyContent: "center", marginRight: 12,
                  shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2
                }}>
                  {getModelIcon(item)}
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: isSelected ? "#6366f1" : theme.textPrimary,
                    fontWeight: isSelected ? "700" : "400",
                  }}
                  numberOfLines={2}
                >
                  {item}
                </Text>
                {isSelected && (
                  <View style={{
                    width: 22, height: 22, borderRadius: 11,
                    backgroundColor: "#6366f1",
                    alignItems: "center", justifyContent: "center", marginLeft: 12,
                  }}>
                    <Check size={13} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      )}

      {/* Bottom Search Bar (Ergonomic for large screens) */}
      <View style={{
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Platform.OS === "ios" ? 32 : 20,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        backgroundColor: theme.bg,
      }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          borderRadius: 16,
          paddingHorizontal: 16,
          height: 48,
        }}>
          <Search size={18} color={theme.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search models..."
            placeholderTextColor={theme.textSecondary}
            style={{
              flex: 1,
              color: theme.textPrimary,
              fontSize: 16,
            }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
