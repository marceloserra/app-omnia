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
} from "react-native";
import { router } from "expo-router";
import { Input } from "../components/ui/Input";
import { OpenAIProvider, OpenAICompatibleProvider } from "@omnia/providers";
import { CheckCircle2, AlertCircle, Server, Check, KeySquare, Network, Trash2 } from "lucide-react-native";
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
    store.setActiveProvider(activeTab);
    if (activeTab === "openai") {
      store.setOpenaiApiKey(localOpenaiKey);
      store.setOpenaiModelId(localModel);
    } else {
      store.setCompatibleBaseUrl(localCompatibleUrl);
      store.setCompatibleApiKey(localCompatibleKey);
      store.setCompatibleModelId(localModel);
    }
    if (testResult?.ok) store.setConnected(true, testResult.models, undefined);
    router.back();
  };

  const handleDisconnect = () => {
    store.setActiveProvider(null);
    store.setConnected(false, [], undefined);
    router.back();
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
          contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Select Provider</Text>
          
          {/* Segmented Control */}
          <BlurView intensity={isDark ? 20 : 60} tint={isDark ? "dark" : "light"} style={styles.segmentedControl}>
            {(["openai", "openai-compatible"] as Tab[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => {
                    setActiveTab(tab);
                    setTestResult(null);
                    setLocalModel(tab === "openai" ? store.openaiModelId : store.compatibleModelId);
                  }}
                  style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {store.activeProviderId === tab && (
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#10b981", marginRight: 6 }} />
                    )}
                    <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                      {tab === "openai" ? "OpenAI" : "Local Network"}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </BlurView>

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Connection Settings</Text>

          {/* Configuration Box (Glassmorphism) */}
          <BlurView intensity={isDark ? 30 : 80} tint={isDark ? "dark" : "light"} style={styles.glassCard}>
            {activeTab === "openai" ? (
              <>
                <View style={styles.inputHeader}>
                  <KeySquare size={16} color={theme.indigo} />
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
                  <Network size={16} color={theme.indigo} />
                  <Text style={styles.inputLabel}>Server Base URL</Text>
                </View>
                <Input
                  placeholder="http://192.168.1.X:1234/v1"
                  value={localCompatibleUrl}
                  onChangeText={(txt) => { setLocalCompatibleUrl(txt); setTestResult(null); }}
                  containerStyle={{ marginBottom: 20 }}
                />
                
                <View style={styles.inputHeader}>
                  <KeySquare size={16} color={theme.indigo} />
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
                (!isFormValid) && styles.testButtonDisabled,
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

          {/* Test Results & Model Selection */}
          {testResult && (
            <BlurView
              intensity={isDark ? 40 : 80}
              tint={isDark ? "dark" : "light"}
              style={[
                styles.resultCard,
                { borderColor: testResult.ok ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)" }
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: testResult.ok ? 16 : 0 }}>
                <View style={{ marginRight: 10 }}>
                  {testResult.ok ? (
                    <CheckCircle2 size={20} color="#10b981" />
                  ) : (
                    <AlertCircle size={20} color="#ef4444" />
                  )}
                </View>
                <Text style={{ color: testResult.ok ? "#10b981" : "#ef4444", fontWeight: "600", fontSize: 15, flex: 1 }}>
                  {testResult.ok ? "Connection Established" : testResult.msg}
                </Text>
              </View>

              {testResult.ok && testResult.models.length > 0 && (
                <>
                  <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 12 }}>
                    Available models ({testResult.models.length}). Tap to select default:
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 }}>
                    {testResult.models.slice(0, 8).map((m) => {
                      const isSelected = localModel === m;
                      return (
                        <Pressable
                          key={m}
                          onPress={() => setLocalModel(m)}
                          style={[
                            styles.modelChip,
                            { 
                              borderColor: isSelected ? theme.indigo : theme.border,
                              backgroundColor: isSelected ? theme.indigo : "transparent"
                            },
                            { margin: 4 }
                          ]}
                        >
                          {isSelected && <Check size={14} color="#fff" style={{ marginRight: 6 }} />}
                          <Text style={{ color: isSelected ? "#fff" : theme.textSecondary, fontSize: 13, fontWeight: "500" }}>
                            {m}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}
            </BlurView>
          )}
          
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

        {/* Floating Actions - Premium Gradient */}
        <BlurView intensity={isDark ? 80 : 100} tint={isDark ? "dark" : "light"} style={styles.floatingBar}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {store.activeProviderId === activeTab && (
              <Pressable
                onPress={handleDisconnect}
                style={({ pressed }) => [
                  { 
                    flex: 1, 
                    backgroundColor: "rgba(239, 68, 68, 0.1)", 
                    borderRadius: 20, 
                    borderWidth: 1, 
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  pressed && { opacity: 0.7 }
                ]}
              >
                <Text style={{ color: "#fca5a5", fontWeight: "600", fontSize: 16 }}>Disconnect</Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleSave}
              disabled={!testResult?.ok}
              style={({ pressed }) => ({ flex: store.activeProviderId === activeTab ? 1.5 : 1, opacity: pressed ? 0.85 : 1 })}
            >
              <LinearGradient
                colors={testResult?.ok ? ["#4f46e5", "#6366f1"] : ["rgba(99,102,241,0.2)", "rgba(99,102,241,0.1)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.saveButton,
                  !testResult?.ok && { borderWidth: 1, borderColor: "rgba(99,102,241,0.3)" }
                ]}
              >
                <Text style={[styles.saveButtonText, !testResult?.ok && { color: theme.textSecondary }]}>
                  {store.activeProviderId === activeTab ? "Update Provider" : "Set Active"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </BlurView>
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
  modelChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  floatingBar: {
    position: "absolute",
    bottom: 32,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
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
