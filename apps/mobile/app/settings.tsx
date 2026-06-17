import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { Input } from "../components/ui/Input";
import { OpenAIProvider, OpenAICompatibleProvider } from "@omnia/providers";
import { CheckCircle2, AlertCircle, Server, Check, KeySquare, Network, Trash2, ChevronRight, Search, X } from "lucide-react-native";
import { openDatabase, createConversationRepo, createMessageRepo } from "@omnia/storage";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useProviderStore } from "../store/provider-store";

import { useTheme, ThemePalette } from "../lib/theme";
import { useTranslation } from "../lib/i18n";
import { useSettingsStore } from "../store/settings-store";

const SUCCESS = "#10b981";
const ERROR = "#ef4444";

type Tab = "openai" | "openai-compatible";

// ─── Model Picker Sheet ────────────────────────────────────────────────────────

interface ModelPickerSheetProps {
  models: string[];
  selected: string;
  onSelect: (m: string) => void;
  onClose: () => void;
  theme: ThemePalette;
  isDark: boolean;
}

function ModelPickerSheet({ models, selected, onSelect, onClose, theme, isDark }: ModelPickerSheetProps) {
  const [search, setSearch] = useState("");

  const filtered = models.filter((m) =>
    m.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Drag handle */}
      <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
        <View style={{
          width: 40, height: 4, borderRadius: 2,
          backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
        }} />
      </View>

      {/* Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}>
        <Text style={{ fontSize: 17, fontWeight: "700", color: theme.textPrimary, letterSpacing: 0.2 }}>
          Select Model
        </Text>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            alignItems: "center", justifyContent: "center",
          }, pressed && { opacity: 0.6 }]}
        >
          <X size={18} color={theme.textSecondary} />
        </Pressable>
      </View>

      {/* Search field */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
        backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.border,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
      }}>
        <Search size={16} color={theme.textSecondary} />
        <TextInput
          placeholder="Search models…"
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1, fontSize: 15, color: theme.textPrimary }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <X size={14} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 60 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 15 }}>No models match "{search}"</Text>
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
                onPress={() => onSelect(item)}
                style={({ pressed }) => [{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  marginVertical: 3,
                  borderRadius: 14,
                  borderLeftWidth: isSelected ? 4 : 0,
                  borderLeftColor: isSelected ? "#6366f1" : "transparent",
                  backgroundColor: isSelected
                    ? (isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.07)")
                    : "transparent",
                }, pressed && { opacity: 0.7 }]}
              >
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
    </View>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const store = useProviderStore();
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const settingsStore = useSettingsStore();

  const [activeTab, setActiveTab] = useState<Tab>((store.activeProviderId as Tab) ?? "openai");
  const [localOpenaiKey, setLocalOpenaiKey] = useState(store.openaiApiKey);
  const [localCompatibleUrl, setLocalCompatibleUrl] = useState(store.compatibleBaseUrl);
  const [localCompatibleKey, setLocalCompatibleKey] = useState(store.compatibleApiKey);
  const [localModel, setLocalModel] = useState(
    activeTab === "openai" ? store.openaiModelId : store.compatibleModelId
  );

  const [isValidating, setIsValidating] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg?: string; models: string[] } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [modelPickerVisible, setModelPickerVisible] = useState(false);

  // Sync testResult when store hydrates asynchronously
  React.useEffect(() => {
    if (store.activeProviderId === activeTab && store.isConnected && !testResult) {
      setTestResult({ ok: true, msg: "Connection Established", models: store.availableModels });
    }
  }, [store.activeProviderId, activeTab, store.isConnected, store.availableModels]);

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = () => {
    try {
      const db = openDatabase();
      createMessageRepo(db).deleteAll();
      createConversationRepo(db).deleteAll();
      setShowClearConfirm(false);
      router.replace("/");
    } catch (err) {
      Alert.alert("Error", "Could not delete history.");
      setShowClearConfirm(false);
    }
  };

  const handleTestConnection = async () => {
    setIsValidating(true);
    setTestResult(null);

    try {
      if (activeTab === "openai") {
        const provider = new OpenAIProvider();
        const ok = await provider.validateConnection({ apiKey: localOpenaiKey });
        if (ok) {
          const models = await provider.listModels({ apiKey: localOpenaiKey });
          setTestResult({ ok: true, models: models.map((m) => m.id) });
          if (!localModel || !models.find((m) => m.id === localModel)) {
            setLocalModel(models[0]?.id || "gpt-4o-mini");
          }
        } else {
          setTestResult({ ok: false, msg: "Invalid API key or network error.", models: [] });
        }
      } else {
        const provider = new OpenAICompatibleProvider();
        const ok = await provider.validateConnection({
          baseUrl: localCompatibleUrl,
          apiKey: localCompatibleKey || undefined,
        });
        if (ok) {
          const models = await provider.listModels({
            baseUrl: localCompatibleUrl,
            apiKey: localCompatibleKey || undefined,
          });
          setTestResult({ ok: true, models: models.map((m) => m.id) });
          if (!localModel || !models.find((m) => m.id === localModel)) {
            setLocalModel(models[0]?.id || "");
          }
        } else {
          setTestResult({ ok: false, msg: "Could not connect. Check the base URL.", models: [] });
        }
      }
    } catch (e: any) {
      setTestResult({ ok: false, msg: e?.message ?? "Unknown error.", models: [] });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    const isSameProvider = store.activeProviderId === activeTab;
    const prevModels = store.availableModels;
    const prevConnected = store.isConnected;

    store.setActiveProvider(activeTab);
    if (activeTab === "openai") {
      store.setOpenaiApiKey(localOpenaiKey);
      store.setOpenaiModelId(localModel);
    } else {
      store.setCompatibleBaseUrl(localCompatibleUrl);
      store.setCompatibleApiKey(localCompatibleKey);
      store.setCompatibleModelId(localModel);
    }

    if (testResult?.ok) {
      store.setConnected(true, testResult.models, undefined);
    } else if (isSameProvider && prevConnected) {
      store.setConnected(true, prevModels, undefined);
    }

    Alert.alert("Success", "Provider settings saved and activated.");
  };

  const handleDisconnect = () => {
    store.setActiveProvider(null);
    store.setConnected(false, [], undefined);
    setTestResult(null);
  };

  const isFormValid = activeTab === "openai" ? !!localOpenaiKey.trim() : !!localCompatibleUrl.trim();

  const isDark = theme.bg === "#05050f";

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>AI Provider</Text>

          {/* Provider Picker */}
          <BlurView intensity={isDark ? 20 : 60} tint={isDark ? "dark" : "light"} style={styles.segmentedControl}>
            {(["openai", "openai-compatible"] as Tab[]).map((tab) => {
              const isActive = activeTab === tab;
              const isConnected = store.activeProviderId === tab && store.isConnected;
              return (
                <Pressable
                  key={tab}
                  onPress={() => {
                    setActiveTab(tab);
                    setTestResult(store.activeProviderId === tab && store.isConnected
                      ? { ok: true, models: store.availableModels }
                      : null
                    );
                    setLocalModel(tab === "openai" ? store.openaiModelId : store.compatibleModelId);
                  }}
                  style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {isConnected && (
                      <View style={styles.connectedDot} />
                    )}
                    <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                      {tab === "openai" ? "OpenAI" : "Local / Custom"}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </BlurView>

          {/* Credentials Card */}
          <Text style={[styles.sectionTitle, { marginTop: 4 }]}>Credentials</Text>
          <BlurView intensity={isDark ? 30 : 80} tint={isDark ? "dark" : "light"} style={styles.glassCard}>
            {activeTab === "openai" ? (
              <>
                <View style={styles.inputHeader}>
                  <KeySquare size={16} color={theme.indigo} style={styles.inputHeaderIcon} />
                  <Text style={styles.inputLabel}>OpenAI API Key</Text>
                </View>
                <Input
                  placeholder="sk-proj-..."
                  value={localOpenaiKey}
                  onChangeText={(txt) => { setLocalOpenaiKey(txt); setTestResult(null); }}
                  secureTextEntry
                  containerStyle={{ marginBottom: 24 }}
                />
              </>
            ) : (
              <>
                <View style={styles.inputHeader}>
                  <Network size={16} color={theme.indigo} style={styles.inputHeaderIcon} />
                  <Text style={styles.inputLabel}>Server Base URL</Text>
                </View>
                <Input
                  placeholder="http://192.168.1.X:1234/v1"
                  value={localCompatibleUrl}
                  onChangeText={(txt) => { setLocalCompatibleUrl(txt); setTestResult(null); }}
                  containerStyle={{ marginBottom: 20 }}
                />
                <View style={styles.inputHeader}>
                  <KeySquare size={16} color={theme.indigo} style={styles.inputHeaderIcon} />
                  <Text style={styles.inputLabel}>API Key (Optional)</Text>
                </View>
                <Input
                  placeholder="sk-..."
                  value={localCompatibleKey}
                  onChangeText={(txt) => { setLocalCompatibleKey(txt); setTestResult(null); }}
                  secureTextEntry
                  containerStyle={{ marginBottom: 24 }}
                />
              </>
            )}

            {/* Test Connection Button */}
            <Pressable
              onPress={handleTestConnection}
              disabled={isValidating || !isFormValid}
              style={({ pressed }) => [
                styles.testButton,
                !isFormValid && styles.testButtonDisabled,
                pressed && { opacity: 0.8 }
              ]}
            >
              {isValidating ? (
                <ActivityIndicator color={theme.indigo} size="small" />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Server size={18} color={!isFormValid ? theme.textSecondary : theme.indigo} style={{ marginRight: 8 }} />
                  <Text style={[styles.testButtonText, !isFormValid && { color: theme.textSecondary }]}>
                    Test Connection
                  </Text>
                </View>
              )}
            </Pressable>
          </BlurView>

          {/* ── Provider Status Card – always visible when connected or tested ── */}
          {(() => {
            const isActiveTab = store.activeProviderId === activeTab;
            const testOk = testResult?.ok === true;
            const isConnected = isActiveTab && store.isConnected;
            const showCard = testOk || isConnected;

            if (!showCard) return null;

            const models = testResult ? testResult.models : store.availableModels;

            return (
              <View style={{ marginTop: 20 }}>
                <Text style={styles.sectionTitle}>Provider Status</Text>

                {/* Status banner */}
                <View style={styles.statusBanner}>
                  <View style={[styles.statusDotLarge, { backgroundColor: isConnected ? "#10b981" : "#f59e0b" }]} />
                  <Text style={[styles.statusBannerText, { color: isConnected ? "#10b981" : "#f59e0b" }]}>
                    {isConnected ? "Connected & Active" : "Tested — tap Set Active to activate"}
                  </Text>
                </View>

                {/* Model Selection — single row picker */}
                {models.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Select Model</Text>
                    <Pressable
                      onPress={() => setModelPickerVisible(true)}
                      style={({ pressed }) => [styles.modelSelectRow, pressed && { opacity: 0.7 }]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modelSelectLabel} numberOfLines={1}>{localModel || "No model selected"}</Text>
                        <Text style={styles.modelSelectSub}>{models.length} models available</Text>
                      </View>
                      <ChevronRight size={18} color={theme.textSecondary} />
                    </Pressable>
                  </>
                )}

                {/* Action Buttons */}
                <View style={{ marginTop: 24, gap: 10 }}>
                  <Pressable
                    onPress={handleSave}
                    style={({ pressed }) => [styles.actionBtnPrimary, pressed && { opacity: 0.8 }]}
                  >
                    <CheckCircle2 size={18} color="#10b981" style={{ marginRight: 8 }} />
                    <Text style={styles.actionBtnPrimaryText}>
                      {isConnected ? "Update Active Provider" : "Set as Active Provider"}
                    </Text>
                  </Pressable>

                  {isConnected && (
                    <Pressable
                      onPress={handleDisconnect}
                      style={({ pressed }) => [styles.dangerButton, pressed && { opacity: 0.7 }]}
                    >
                      <AlertCircle size={16} color={theme.red} style={{ marginRight: 8 }} />
                      <Text style={styles.dangerButtonText}>Disconnect Provider</Text>
                    </Pressable>
                  )}
                </View>

                {/* Model Picker Modal */}
                <Modal
                  visible={modelPickerVisible}
                  animationType="slide"
                  presentationStyle="pageSheet"
                  onRequestClose={() => setModelPickerVisible(false)}
                >
                  <ModelPickerSheet
                    models={models}
                    selected={localModel}
                    onSelect={(m) => { setLocalModel(m); setModelPickerVisible(false); }}
                    onClose={() => setModelPickerVisible(false)}
                    theme={theme}
                    isDark={isDark}
                  />
                </Modal>
              </View>
            );
          })()}

          {/* Appearance Section */}
          <View style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>{t("settings.appearance.title")}</Text>
            <BlurView intensity={isDark ? 30 : 80} tint={isDark ? "dark" : "light"} style={[styles.glassCard, { padding: 16 }]}>
              <View style={styles.segmentedControl}>
                {(["system", "dark", "light"] as const).map((tOpt) => {
                  const isActive = settingsStore.theme === tOpt;
                  return (
                    <Pressable
                      key={tOpt}
                      onPress={() => settingsStore.setTheme(tOpt)}
                      style={[styles.segmentButton, isActive && styles.segmentButtonActive, { paddingVertical: 10 }]}
                    >
                      <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                        {tOpt === "system" ? "System" :
                         tOpt === "dark" ? "Dark" : "Light"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </BlurView>
          </View>

          {/* Language Section */}
          <View style={{ marginTop: 24, marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>{t("settings.appearance.language")}</Text>
            <BlurView intensity={isDark ? 30 : 80} tint={isDark ? "dark" : "light"} style={[styles.glassCard, { padding: 16 }]}>
              <View style={[styles.segmentedControl, { marginBottom: 0 }]}>
                {(["system", "en", "pt", "es"] as const).map((lOpt) => {
                  const isActive = settingsStore.language === lOpt;
                  return (
                    <Pressable
                      key={lOpt}
                      onPress={() => settingsStore.setLanguage(lOpt)}
                      style={[styles.segmentButton, isActive && styles.segmentButtonActive, { paddingVertical: 10 }]}
                    >
                      <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                        {lOpt === "system" ? "OS" : lOpt.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </BlurView>
          </View>

          {/* Danger Zone */}
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <View style={styles.dangerCard}>
              <View style={styles.dangerHeaderRow}>
                <View style={styles.dangerIconBox}>
                  <AlertCircle size={20} color={theme.red} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dangerItemTitle}>Clear All History</Text>
                  <Text style={styles.dangerItemSub}>
                    Permanently delete all conversations and messages. This action cannot be undone.
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={handleClearAll}
                style={({ pressed }) => [styles.dangerButton, pressed && { opacity: 0.7 }]}
              >
                <Trash2 size={16} color={theme.red} style={{ marginRight: 8 }} />
                <Text style={styles.dangerButtonText}>Delete All Data</Text>
              </Pressable>
            </View>
          </View>

        </ScrollView>


      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={showClearConfirm}
        title="Clear All History"
        message="Are you sure you want to permanently delete all conversations and messages? This cannot be undone."
        confirmText="Delete All"
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={confirmClearAll}
      />
    </View>
  );
}

const createStyles = (theme: ThemePalette) => StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: theme.indigo,
  },
  segmentText: {
    color: theme.textSecondary,
    fontWeight: "500",
    fontSize: 14,
  },
  segmentTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  glassCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputHeaderIcon: {
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.textPrimary,
  },
  testButton: {
    backgroundColor: theme.activeBg,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  testButtonDisabled: {
    backgroundColor: theme.activeBg,
    borderColor: "transparent",
  },
  testButtonText: {
    color: theme.indigo,
    fontWeight: "700",
    fontSize: 15,
  },
  resultCard: {
    marginTop: 16,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  modelSelectRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.activeBg,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: theme.border,
    gap: 12,
  },
  modelSelectLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.textPrimary,
    marginBottom: 2,
  },
  modelSelectSub: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.activeBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 10,
  },
  statusDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  connectedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  actionBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.35)",
  },
  actionBtnPrimaryText: {
    color: "#10b981",
    fontWeight: "700",
    fontSize: 16,
  },
  activeProviderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    paddingVertical: 14,
    borderRadius: 16,
  },
  activeProviderText: {
    color: "#10b981",
    fontWeight: "700",
    fontSize: 16,
  },
  dangerZone: {
    marginTop: 40,
    marginBottom: 40,
  },
  dangerTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.red,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  dangerCard: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: 24,
    padding: 20,
  },
  dangerHeaderRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  dangerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  dangerItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.textPrimary,
    marginBottom: 4,
  },
  dangerItemSub: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textSecondary,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  dangerButtonText: {
    color: theme.red,
    fontWeight: "600",
    fontSize: 15,
  },
});
