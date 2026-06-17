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

const BG = "#05050f";
const INDIGO = "#6366f1";
const INDIGO_GLOW = "#818cf8";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_SECONDARY = "#94a3b8";
const SUCCESS = "#10b981";
const ERROR = "#ef4444";

type Tab = "openai" | "openai-compatible";

export default function SettingsScreen() {
  const store = useProviderStore();

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

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Background ambient glow */}
      <View style={{ position: "absolute", top: -100, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: INDIGO, opacity: 0.1, filter: "blur(100px)" }} />
      <View style={{ position: "absolute", top: 200, right: -100, width: 250, height: 250, borderRadius: 125, backgroundColor: "#c084fc", opacity: 0.08, filter: "blur(80px)" }} />

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
          <BlurView intensity={20} tint="dark" style={styles.segmentedControl}>
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
          <BlurView intensity={30} tint="dark" style={styles.glassCard}>
            {activeTab === "openai" ? (
              <>
                <View style={styles.inputHeader}>
                  <KeySquare size={16} color={INDIGO_GLOW} />
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
                  <Network size={16} color={INDIGO_GLOW} />
                  <Text style={styles.inputLabel}>Server Base URL</Text>
                </View>
                <Input
                  placeholder="http://192.168.1.X:1234/v1"
                  value={localCompatibleUrl}
                  onChangeText={(txt) => { setLocalCompatibleUrl(txt); setTestResult(null); }}
                  containerStyle={{ marginBottom: 20 }}
                />
                
                <View style={styles.inputHeader}>
                  <KeySquare size={16} color={INDIGO_GLOW} />
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
                <ActivityIndicator color={INDIGO_GLOW} size="small" />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Server size={18} color={!isFormValid ? TEXT_SECONDARY : INDIGO_GLOW} style={{ marginRight: 8 }} />
                  <Text style={[styles.testButtonText, !isFormValid && { color: TEXT_SECONDARY }]}>
                    Test Connection
                  </Text>
                </View>
              )}
            </Pressable>
          </BlurView>

          {/* Test Results & Model Selection */}
          {testResult && (
            <BlurView
              intensity={40}
              tint="dark"
              style={[
                styles.resultCard,
                { borderColor: testResult.ok ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)" }
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: testResult.ok ? 16 : 0 }}>
                <View style={{ marginRight: 10 }}>
                  {testResult.ok ? (
                    <CheckCircle2 size={20} color={SUCCESS} />
                  ) : (
                    <AlertCircle size={20} color={ERROR} />
                  )}
                </View>
                <Text style={{ color: testResult.ok ? SUCCESS : ERROR, fontWeight: "600", fontSize: 15, flex: 1 }}>
                  {testResult.ok ? "Connection Established" : testResult.msg}
                </Text>
              </View>

              {testResult.ok && testResult.models.length > 0 && (
                <>
                  <Text style={{ color: TEXT_SECONDARY, fontSize: 13, marginBottom: 12 }}>
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
                            { borderColor: isSelected ? INDIGO_GLOW : "rgba(255,255,255,0.08)" },
                            { margin: 4 }
                          ]}
                        >
                          {isSelected && <Check size={14} color="#fff" style={{ marginRight: 6 }} />}
                          <Text style={{ color: isSelected ? "#fff" : TEXT_SECONDARY, fontSize: 13, fontWeight: "500" }}>
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

          {/* Danger Zone */}
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <View style={styles.dangerCard}>
              <View style={styles.dangerHeaderRow}>
                <View style={styles.dangerIconBox}>
                  <AlertCircle size={20} color={ERROR} />
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
                <Trash2 size={16} color={ERROR} style={{ marginRight: 8 }} />
                <Text style={styles.dangerButtonText}>Delete All Data</Text>
              </Pressable>
            </View>
          </View>

        </ScrollView>

        {/* Floating Actions - Premium Gradient */}
        <BlurView intensity={80} tint="dark" style={styles.floatingBar}>
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
                <Text style={[styles.saveButtonText, !testResult?.ok && { color: TEXT_SECONDARY }]}>
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

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_SECONDARY,
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
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: "rgba(99,102,241,0.25)",
  },
  segmentText: {
    color: TEXT_SECONDARY,
    fontWeight: "500",
    fontSize: 14,
  },
  segmentTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  glassCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
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
    color: TEXT_PRIMARY,
  },
  testButton: {
    backgroundColor: "rgba(99,102,241,0.15)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  testButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "transparent",
  },
  testButtonText: {
    color: INDIGO_GLOW,
    fontWeight: "600",
    fontSize: 15,
  },
  resultCard: {
    marginTop: 24,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  modelChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  modelChipSelected: {
    backgroundColor: "rgba(99,102,241,0.25)",
    borderColor: INDIGO,
  },
  modelChipText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: "500",
  },
  modelChipTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  floatingBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  dangerZone: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: "rgba(239, 68, 68, 0.2)",
    paddingTop: 24,
  },
  dangerTitle: {
    color: ERROR,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  dangerCard: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
    borderRadius: 16,
    padding: 16,
  },
  dangerHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  dangerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dangerItemTitle: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  dangerItemSub: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
    paddingVertical: 14,
    borderRadius: 12,
  },
  dangerButtonText: {
    color: ERROR,
    fontSize: 15,
    fontWeight: "600",
  },
});
