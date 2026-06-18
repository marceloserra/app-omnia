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
  Switch,
} from "react-native";
import { router } from "expo-router";
import { ModelPickerSheet } from "../../components/chat/ModelPickerSheet";
import { Input } from "../../components/ui/Input";
import { OpenAIProvider, OpenAICompatibleProvider } from "@omnia/providers";
import { CheckCircle2, AlertCircle, Server, Check, KeySquare, Network, Trash2, ChevronRight, Search, X, Box, Monitor, Moon, Sun, Globe, Vibrate, Mic } from "lucide-react-native";
import { openDatabase, createConversationRepo, createMessageRepo } from "@omnia/storage";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProviderStore } from "../../store/provider-store";
import Constants from "expo-constants";
import { isModelDownloaded, downloadWhisperModel, deleteWhisperModel } from "../../lib/whisper";

import { useTheme, ThemePalette } from "../../lib/theme";
import { useTranslation } from "../../lib/i18n";
import { useSettingsStore } from "../../store/settings-store";

const SUCCESS = "#10b981";
const ERROR = "#ef4444";

type Tab = "openai" | "openai-compatible";

// ─── Settings Screen ──────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const store = useProviderStore();
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isDark = theme.bg === "#05050f";
  const styles = React.useMemo(() => createStyles(theme, isDark), [theme, isDark]);
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
  const [showWhisperDeleteConfirm, setShowWhisperDeleteConfirm] = useState(false);
  const [modelPickerVisible, setModelPickerVisible] = useState(false);
  
  const [isWhisperReady, setIsWhisperReady] = useState(false);
  const [whisperProgress, setWhisperProgress] = useState(-1);

  React.useEffect(() => {
    isModelDownloaded().then(setIsWhisperReady);
  }, []);

  const handleDownloadWhisper = async () => {
    if (useSettingsStore.getState().hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      setWhisperProgress(0);
      await downloadWhisperModel((p) => setWhisperProgress(p));
      setIsWhisperReady(true);
    } catch (e) {
      Alert.alert("Download Error", "Could not download the Voice Engine. Check your connection.");
    } finally {
      setWhisperProgress(-1);
    }
  };

  const handleDeleteWhisper = () => {
    setShowWhisperDeleteConfirm(true);
  };

  const confirmDeleteWhisper = async () => {
    await deleteWhisperModel();
    setIsWhisperReady(false);
    setShowWhisperDeleteConfirm(false);
  };

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
            store.setOpenaiModelId(models[0]?.id || "gpt-4o-mini");
          }
          
          store.setActiveProvider("openai");
          store.setOpenaiApiKey(localOpenaiKey);
          store.setConnected(true, models.map((m) => m.id), undefined);
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
            store.setCompatibleModelId(models[0]?.id || "");
          }
          
          store.setActiveProvider("openai-compatible");
          store.setCompatibleBaseUrl(localCompatibleUrl);
          store.setCompatibleApiKey(localCompatibleKey);
          store.setConnected(true, models.map((m) => m.id), undefined);
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

  const handleDisconnect = () => {
    store.setActiveProvider(null);
    store.setConnected(false, [], undefined);
    setTestResult(null);
  };

  const isFormValid = activeTab === "openai" ? !!localOpenaiKey.trim() : !!localCompatibleUrl.trim();


  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.largeTitle}>{t("settings.title") || "Settings"}</Text>
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

          <Text style={[styles.sectionTitle, { marginTop: 4 }]}>Credentials</Text>
          <View style={styles.iosGroup}>
            {activeTab === "openai" ? (
              <View style={styles.iosRow}>
                <View style={[styles.iosIconContainer, { backgroundColor: "#3b82f6" }]}>
                  <KeySquare size={18} color="#fff" />
                </View>
                <Text style={[styles.iosRowLabel, { flex: 0, width: 90, fontSize: 16 }]}>API Key</Text>
                <TextInput
                  placeholder="sk-proj-..."
                  placeholderTextColor={theme.textSecondary}
                  value={localOpenaiKey}
                  onChangeText={(txt) => { setLocalOpenaiKey(txt); setTestResult(null); }}
                  secureTextEntry
                  style={{ flex: 1, fontSize: 16, color: theme.textSecondary, textAlign: "left" }}
                  testID="openai-api-key-input"
                />
              </View>
            ) : (
              <>
                <View style={styles.iosRow}>
                  <View style={[styles.iosIconContainer, { backgroundColor: "#8b5cf6" }]}>
                    <Network size={18} color="#fff" />
                  </View>
                  <Text style={[styles.iosRowLabel, { flex: 0, width: 90, fontSize: 16 }]}>Base URL</Text>
                  <TextInput
                    placeholder="http://192.168.1.X:1234/v1"
                    placeholderTextColor={theme.textSecondary}
                    value={localCompatibleUrl}
                    onChangeText={(txt) => { setLocalCompatibleUrl(txt); setTestResult(null); }}
                    style={{ flex: 1, fontSize: 16, color: theme.textSecondary, textAlign: "left" }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <View style={styles.iosRowBorder} />
                <View style={styles.iosRow}>
                  <View style={[styles.iosIconContainer, { backgroundColor: "#3b82f6" }]}>
                    <KeySquare size={18} color="#fff" />
                  </View>
                  <Text style={[styles.iosRowLabel, { flex: 0, width: 90, fontSize: 16 }]}>API Key</Text>
                  <TextInput
                    placeholder="sk-..."
                    placeholderTextColor={theme.textSecondary}
                    value={localCompatibleKey}
                    onChangeText={(txt) => { setLocalCompatibleKey(txt); setTestResult(null); }}
                    secureTextEntry
                    style={{ flex: 1, fontSize: 16, color: theme.textSecondary, textAlign: "left" }}
                  />
                </View>
              </>
            )}
            
            <View style={styles.iosRowBorder} />
            
            <Pressable
              onPress={handleTestConnection}
              disabled={isValidating || !isFormValid}
              style={({ pressed }) => [styles.iosRow, pressed && { opacity: 0.7 }]}
              testID="connect-provider-button"
            >
              <Text style={{ flex: 1, textAlign: "center", fontSize: 17, fontWeight: "600", color: !isFormValid ? theme.textSecondary : theme.indigo }}>
                {isValidating ? "Connecting..." : "Connect"}
              </Text>
            </Pressable>
          </View>

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

                <View style={styles.iosGroup}>
                  <View style={styles.iosRow}>
                    <View style={[styles.iosIconContainer, { backgroundColor: isConnected ? "#10b981" : "#f59e0b" }]}>
                      <Server size={18} color="#fff" />
                    </View>
                    <Text style={[styles.iosRowLabel, { color: isConnected ? "#10b981" : "#f59e0b" }]}>
                      {isConnected ? "Connected & Active" : "Tested — Tap to activate"}
                    </Text>
                  </View>
                  <View style={styles.iosRowBorder} />

                  {/* Model Selection */}
                  <Pressable
                    onPress={() => setModelPickerVisible(true)}
                    style={({ pressed }) => [styles.iosRow, pressed && { opacity: 0.7 }]}
                  >
                    <View style={[styles.iosIconContainer, { backgroundColor: "#f59e0b" }]}>
                      <Box size={18} color="#fff" />
                    </View>
                    <Text style={styles.iosRowLabel}>{t("settings.model.select")}</Text>
                    <Text style={styles.iosRowValue} numberOfLines={1} ellipsizeMode="tail">{localModel || t("settings.model.none")}</Text>
                    <ChevronRight size={18} color={theme.textSecondary} style={{ marginLeft: 6 }} />
                  </Pressable>
                  
                  {isConnected && (
                    <>
                      <View style={styles.iosRowBorder} />
                      <Pressable
                        onPress={handleDisconnect}
                        style={({ pressed }) => [styles.iosRow, pressed && { opacity: 0.8 }]}
                      >
                        <Text style={{ flex: 1, textAlign: "center", fontSize: 17, color: "#ef4444" }}>
                          {t("settings.provider.disconnect")}
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            );
          })()}

          {/* Appearance Section */}
          <View style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>{t("settings.appearance.title")}</Text>
            <View style={styles.iosGroup}>
              {(["system", "dark", "light"] as const).map((tOpt, idx) => {
                const isActive = settingsStore.theme === tOpt;
                return (
                  <Pressable
                    key={tOpt}
                    onPress={() => {
                      if (useSettingsStore.getState().hapticsEnabled) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      settingsStore.setTheme(tOpt);
                    }}
                    style={({ pressed }) => [
                      styles.iosRow, 
                      pressed && { opacity: 0.7 }
                    ]}
                  >
                    <View style={[styles.iosIconContainer, { backgroundColor: "#ec4899" }]}>
                      {tOpt === "system" ? <Monitor size={18} color="#fff" /> : tOpt === "dark" ? <Moon size={18} color="#fff" /> : <Sun size={18} color="#fff" />}
                    </View>
                    <Text style={styles.iosRowLabel}>
                      {tOpt === "system" ? "System" : tOpt === "dark" ? "Dark" : "Light"}
                    </Text>
                    {isActive && <Check size={18} color={theme.indigo} />}
                  </Pressable>
                );
              }).reduce((acc, curr, idx, arr) => {
                if (idx < arr.length - 1) {
                  return [...acc, curr, <View key={`div-${idx}`} style={styles.iosRowBorder} />] as any;
                }
                return [...acc, curr] as any;
              }, [])}
            </View>
          </View>

          {/* Language Section */}
          <View style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>{t("settings.appearance.language")}</Text>
            <View style={styles.iosGroup}>
              {(["system", "en", "pt", "es"] as const).map((lOpt, idx) => {
                const isActive = settingsStore.language === lOpt;
                return (
                  <Pressable
                    key={lOpt}
                    onPress={() => {
                      if (useSettingsStore.getState().hapticsEnabled) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      settingsStore.setLanguage(lOpt);
                    }}
                    style={({ pressed }) => [
                      styles.iosRow, 
                      pressed && { opacity: 0.7 }
                    ]}
                  >
                    <View style={[styles.iosIconContainer, { backgroundColor: "#0ea5e9" }]}>
                      <Globe size={18} color="#fff" />
                    </View>
                    <Text style={styles.iosRowLabel}>
                      {lOpt === "system" ? "System Default" : lOpt === "en" ? "English" : lOpt === "pt" ? "Português" : "Español"}
                    </Text>
                    {isActive && <Check size={18} color={theme.indigo} />}
                  </Pressable>
                );
              }).reduce((acc, curr, idx, arr) => {
                if (idx < arr.length - 1) {
                  return [...acc, curr, <View key={`div-${idx}`} style={styles.iosRowBorder} />] as any;
                }
                return [...acc, curr] as any;
              }, [])}
            </View>
          </View>

          {/* Capabilities Section */}
          <View style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>Capabilities</Text>
            <View style={styles.iosGroup}>
              <View style={[styles.iosRow, { paddingVertical: 14 }]}>
                <View style={[styles.iosIconContainer, { backgroundColor: isWhisperReady ? "#10b981" : theme.textMuted }]}>
                  <Mic size={18} color="#fff" />
                </View>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={styles.iosRowLabel}>Voice Dictation</Text>
                  <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>Powered by OpenAI Whisper (On-Device)</Text>
                  
                  {whisperProgress >= 0 && (
                    <View style={{ marginTop: 8 }}>
                      <View style={{ height: 4, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' }}>
                        <View style={{ height: '100%', width: `${Math.max(5, whisperProgress * 100)}%`, backgroundColor: theme.indigo }} />
                      </View>
                      <Text style={{ fontSize: 11, color: theme.indigo, marginTop: 4 }}>
                        Downloading Engine: {Math.round(whisperProgress * 100)}%
                      </Text>
                    </View>
                  )}
                </View>
                
                {isWhisperReady ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ color: "#10b981", fontSize: 14, fontWeight: "600" }}>Enabled</Text>
                    <Pressable
                      onPress={handleDeleteWhisper}
                      style={({ pressed }) => [
                        { padding: 8, backgroundColor: theme.red + '15', borderRadius: 12 },
                        pressed && { opacity: 0.7 }
                      ]}
                      accessibilityLabel="Delete voice engine"
                    >
                      <Trash2 size={16} color={theme.red} />
                    </Pressable>
                  </View>
                ) : whisperProgress >= 0 ? (
                  <ActivityIndicator size="small" color={theme.indigo} />
                ) : (
                  <Pressable
                    onPress={handleDownloadWhisper}
                    style={({ pressed }) => [
                      { backgroundColor: theme.activeBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
                      pressed && { opacity: 0.7 }
                    ]}
                  >
                    <Text style={{ color: theme.indigo, fontSize: 13, fontWeight: "600" }}>Get (142MB)</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          {/* Chat Behavior */}
          <View style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>Chat Behavior</Text>
            <View style={styles.iosGroup}>
              <View style={styles.iosRow}>
                <View style={[styles.iosIconContainer, { backgroundColor: "#f59e0b" }]}>
                  <Vibrate size={18} color="#fff" />
                </View>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={styles.iosRowLabel}>{t("settings.appearance.haptics")}</Text>
                  <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>{t("settings.appearance.haptics.desc")}</Text>
                </View>
                <Switch
                  value={settingsStore.hapticsEnabled}
                  onValueChange={(val) => {
                    if (val || useSettingsStore.getState().hapticsEnabled) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    settingsStore.setHapticsEnabled(val);
                  }}
                  trackColor={{ false: theme.border, true: theme.indigo }}
                  thumbColor={Platform.OS === "android" ? "#fff" : undefined}
                />
              </View>
            </View>
          </View>

          {/* Data Management */}
          <View style={{ marginTop: 32, marginBottom: 40 }}>
            <Text style={styles.sectionTitle}>{t("settings.data.title")}</Text>
            <View style={styles.iosGroup}>
              <Pressable
                onPress={handleClearAll}
                style={({ pressed }) => [styles.iosRow, pressed && { opacity: 0.7 }]}
              >
                <View style={[styles.iosIconContainer, { backgroundColor: "#ef4444" }]}>
                  <Trash2 size={18} color="#fff" />
                </View>
                <Text style={[styles.iosRowLabel, { color: "#ef4444", flex: 1 }]}>{t("settings.data.deleteall")}</Text>
              </Pressable>
            </View>
          </View>

          {/* Version Info (FAANG style footer) */}
          <View style={{ marginTop: 16, marginBottom: 40, alignItems: "center", opacity: 0.6 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: theme.textPrimary, marginBottom: 4 }}>Omnia AI</Text>
            <Text style={{ fontSize: 13, color: theme.textSecondary }}>v{Constants.expoConfig?.version || "1.0.0"}</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={showClearConfirm}
        title={t("settings.data.confirm.title")}
        message={t("settings.data.confirm.msg")}
        confirmText={t("chat.delete.confirm")}
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={confirmClearAll}
      />

      <ConfirmDialog
        visible={showWhisperDeleteConfirm}
        title="Remove Voice Engine"
        message="Are you sure you want to delete the offline dictation engine? You will need to download the ~142MB file again to use dictation."
        confirmText="Remove"
        onCancel={() => setShowWhisperDeleteConfirm(false)}
        onConfirm={confirmDeleteWhisper}
      />

      <ModelPickerSheet
        visible={modelPickerVisible}
        models={testResult ? testResult.models : store.availableModels}
        selected={localModel}
        theme={theme}
        isDark={isDark}
        onClose={() => setModelPickerVisible(false)}
        onSelect={(m) => {
          setLocalModel(m);
          if (activeTab === "openai") store.setOpenaiModelId(m);
          else store.setCompatibleModelId(m);
          setModelPickerVisible(false);
        }}
      />
    </View>
  );
}

const createStyles = (theme: ThemePalette, isDark: boolean) => StyleSheet.create({
  largeTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 32,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
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
    paddingVertical: 12,
  },
  modelSelectLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.textPrimary,
    marginBottom: 4,
  },
  modelSelectSub: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 4,
    marginLeft: 32,
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
  deleteActionBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    marginTop: 8,
  },
  deleteActionBtnText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "700",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
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
  iosGroup: {
    borderRadius: 12,
    backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
    overflow: "hidden",
  },
  iosRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
  },
  iosRowBorder: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.border,
    marginLeft: 58,
  },
  iosIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iosRowLabel: {
    flex: 1,
    fontSize: 16,
    color: theme.textPrimary,
  },
  iosRowValue: {
    flexShrink: 1,
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: "right",
  },
});
