import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform, ScrollView, KeyboardAvoidingView } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronDown, Sparkles, MessageSquare, Zap, Compass, Lightbulb } from "lucide-react-native";
import { useTheme, ThemePalette } from "../../lib/theme";
import { useProviderStore } from "../../store/provider-store";
import { ModelPickerSheet, getModelIcon } from "../../components/chat/ModelPickerSheet";
import { Modal } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "../../lib/i18n";

export default function HomeDashboard() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const store = useProviderStore();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const isDark = theme.bg === "#05050f";
  const [modelPickerVisible, setModelPickerVisible] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const suggestions = [
    { title: t("home.suggestion.quantum.title"), prompt: t("home.suggestion.quantum.prompt"), icon: Zap },
    { title: t("home.suggestion.email.title"), prompt: t("home.suggestion.email.prompt"), icon: MessageSquare },
    { title: t("home.suggestion.trip.title"), prompt: t("home.suggestion.trip.prompt"), icon: Compass },
    { title: t("home.suggestion.app.title"), prompt: t("home.suggestion.app.prompt"), icon: Lightbulb },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Top Floating Island */}
      <View style={[styles.headerFloating, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        {store.activeProviderId ? (
          <Pressable
            onPress={() => setModelPickerVisible(true)}
            style={({ pressed }) => [styles.floatingChipContainer, pressed && { opacity: 0.7 }]}
          >
            <BlurView 
              intensity={isDark ? 60 : 100} 
              tint={isDark ? "dark" : "light"} 
              style={[styles.floatingChipInner, { backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)" }]}
            >
              <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
                {getModelIcon(store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId, 14)}
              </View>
              <Text style={styles.dynamicIslandText} numberOfLines={1}>
                {store.activeProviderId === "openai" ? "OpenAI" : "Local"} · {store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId}
              </Text>
              <ChevronDown size={14} color={theme.textSecondary} />
            </BlurView>
          </Pressable>
        ) : (
          <View style={styles.floatingChipContainer}>
            <BlurView 
              intensity={isDark ? 60 : 100} 
              tint={isDark ? "dark" : "light"} 
              style={[styles.floatingChipInner, { backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)" }]}
            >
              <Sparkles size={14} color={theme.indigo} strokeWidth={2} />
              <Text style={styles.dynamicIslandText} numberOfLines={1}>Omnia</Text>
            </BlurView>
          </View>
        )}
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingBottom: 100 }}>
        <View style={{ alignItems: "center", paddingHorizontal: 24 }}>
          <View style={styles.logoCircle}>
            <Sparkles size={28} color="#fff" />
          </View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          {store.activeProviderId ? (
            <Text style={styles.subtitle}>{t("home.greeting.subtitle")}</Text>
          ) : (
            <Text style={styles.subtitle}>{t("home.empty.subtitle")}</Text>
          )}
        </View>

        {store.activeProviderId ? (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((s, i) => (
              <Pressable 
                key={i} 
                onPress={() => router.push({ pathname: "/chat/new", params: { initialPrompt: s.prompt } })}
                style={({ pressed }) => [styles.suggestionCard, pressed && { opacity: 0.7 }]}
              >
                <View style={styles.suggestionIconWrapper}>
                  <s.icon size={18} color={theme.indigo} />
                </View>
                <Text style={styles.suggestionText}>{s.title}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Pressable 
              onPress={() => router.push("/settings")}
              style={({ pressed }) => [{
                backgroundColor: theme.indigo,
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 100,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: theme.indigo,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
                maxWidth: "90%",
              }, pressed && { opacity: 0.8 }]}
            >
              <Zap size={18} color="#fff" style={{ marginRight: 8, flexShrink: 0 }} />
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600", flexShrink: 1, textAlign: "center" }} numberOfLines={2}>{t("home.empty.cta")}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <ModelPickerSheet
        visible={modelPickerVisible}
        models={store.availableModels}
        selected={store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId}
        theme={theme}
        isDark={isDark}
        onClose={() => setModelPickerVisible(false)}
        onSelect={(m) => {
          if (store.activeProviderId === "openai") store.setOpenaiModelId(m);
          else store.setCompatibleModelId(m);
        }}
      />
    </View>
  );
}

const createStyles = (theme: ThemePalette) => StyleSheet.create({
  headerFloating: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: "center",
  },
  floatingChipContainer: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    maxWidth: 240,
  },
  floatingChipInner: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 12,
    gap: 6,
  },
  dynamicIslandText: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  modelChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.indigo,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: theme.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 40,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
    justifyContent: "center",
  },
  suggestionCard: {
    width: "46%",
    backgroundColor: theme.surface2,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  suggestionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(99,102,241,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  suggestionText: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  }
});
