import React, { useState } from "react";
import { View, Text, Pressable, FlatList, TextInput, KeyboardAvoidingView, Platform, Image, PanResponder, Animated, Modal, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, X, Check, Cpu } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { ThemePalette } from "../../lib/theme";
import { useTranslation } from "../../lib/i18n";
import { useSettingsStore } from "../../store/settings-store";

interface ModelPickerSheetProps {
  models: string[];
  selected: string;
  onSelect: (m: string) => void;
  visible: boolean;
  onClose: () => void;
  theme: ThemePalette;
  isDark: boolean;
}

export const getModelIcon = (name: string, overrideSize?: number) => {
  const n = name.toLowerCase();
  const size = overrideSize || 18;
  if (n.includes("gpt") || n.includes("openai")) return <Image source={require("../../assets/models/openai.png")} style={{ width: size, height: size }} resizeMode="contain" />;
  if (n.includes("claude") || n.includes("anthropic")) return <Image source={require("../../assets/models/anthropic.png")} style={{ width: size, height: size, borderRadius: size/4 }} resizeMode="contain" />;
  if (n.includes("llama") || n.includes("meta")) return <Image source={require("../../assets/models/meta.png")} style={{ width: size, height: size }} resizeMode="contain" />;
  if (n.includes("gemma") || n.includes("gemini") || n.includes("google")) return <Image source={require("../../assets/models/google.png")} style={{ width: size, height: size }} resizeMode="contain" />;
  if (n.includes("mistral") || n.includes("mixtral")) return <Image source={require("../../assets/models/mistral.png")} style={{ width: size, height: size, borderRadius: size/4 }} resizeMode="contain" />;
  if (n.includes("qwen")) return <Image source={require("../../assets/models/qwen.png")} style={{ width: size, height: size, borderRadius: size/2 }} resizeMode="contain" />;
  return <Cpu size={size} color="#64748b" />;
};

export function ModelPickerSheet({ models, selected, onSelect, onClose, visible, theme, isDark }: ModelPickerSheetProps) {
  const [search, setSearch] = useState("");
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const filtered = models.filter((m) => m.toLowerCase().includes(search.toLowerCase()));
  
  const panY = React.useRef(new Animated.Value(0)).current;

  // Reset position when opened
  React.useEffect(() => {
    if (visible) {
      panY.setValue(0);
    }
  }, [visible]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          Animated.timing(panY, {
            toValue: 800,
            duration: 250,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          Animated.spring(panY, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: theme.overlay, justifyContent: "flex-end" }}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <Animated.View style={{ 
            width: "100%", height: "65%", 
            backgroundColor: theme.bg, 
            borderTopLeftRadius: 24, borderTopRightRadius: 24, 
            overflow: "hidden", 
            shadowColor: "#000", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, 
            paddingBottom: insets.bottom,
            transform: [{ translateY: panY }]
          }}>
            <View 
              style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}
              {...panResponder.panHandlers}
            >
              <View style={{ width: 40, height: 4, backgroundColor: theme.border, borderRadius: 2, alignSelf: "center", marginBottom: 16 }} />
              <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: "700" }}>{t("settings.model.select")}</Text>
            </View>
      {filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 60 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 15 }}>{t("settings.model.nomatch")}</Text>
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
                onPress={() => { 
                  if (useSettingsStore.getState().hapticsEnabled) {
                    Haptics.selectionAsync();
                  }
                  onSelect(item); 
                  onClose(); 
                }}
                style={({ pressed }) => [{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  marginVertical: 3,
                  borderRadius: 14,
                  backgroundColor: isSelected ? theme.activeBg : "transparent",
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
          backgroundColor: theme.activeBg,
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
      </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
