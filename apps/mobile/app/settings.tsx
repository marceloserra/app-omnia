import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useProviderStore } from "../store/provider-store";
import { Input } from "../components/ui/Input";
import { OpenAIProvider, OpenAICompatibleProvider } from "@omnia/providers";
import { CheckCircle2, AlertCircle, Server, Check } from "lucide-react-native";

const BG = "#0a0918";
const SURFACE = "#13112a";
const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f0efff";
const TEXT_SECONDARY = "#9d9bcc";
const BORDER = "rgba(255,255,255,0.08)";
const SUCCESS = "#10b981";
const ERROR = "#ef4444";

type Tab = "openai" | "openai-compatible";

export default function SettingsScreen() {
  const store = useProviderStore();
  
  // Local state for the form so we don't save until "Save" is pressed
  const [activeTab, setActiveTab] = useState<Tab>((store.activeProviderId as Tab) ?? "openai");
  const [localOpenaiKey, setLocalOpenaiKey] = useState(store.openaiApiKey);
  const [localCompatibleUrl, setLocalCompatibleUrl] = useState(store.compatibleBaseUrl);
  const [localCompatibleKey, setLocalCompatibleKey] = useState(store.compatibleApiKey);
  const [localModel, setLocalModel] = useState(
    activeTab === "openai" ? store.openaiModelId : store.compatibleModelId
  );

  const [isValidating, setIsValidating] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg?: string; models: string[] } | null>(null);

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
    // Only save to global store when user explicitly presses Save
    store.setActiveProvider(activeTab);
    if (activeTab === "openai") {
      store.setOpenaiApiKey(localOpenaiKey);
      store.setOpenaiModelId(localModel);
    } else {
      store.setCompatibleBaseUrl(localCompatibleUrl);
      store.setCompatibleApiKey(localCompatibleKey);
      store.setCompatibleModelId(localModel);
    }
    
    // Mark globally as connected if they tested it successfully
    if (testResult?.ok) {
      store.setConnected(true, testResult.models, undefined);
    }
    
    router.back(); // Return to previous screen
  };

  const isFormValid = activeTab === "openai" ? !!localOpenaiKey.trim() : !!localCompatibleUrl.trim();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Segmented Control */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            padding: 4,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: BORDER,
          }}
        >
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
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor: isActive ? "rgba(99,102,241,0.15)" : "transparent",
                }}
              >
                <Text
                  style={{
                    color: isActive ? "#fff" : TEXT_SECONDARY,
                    fontWeight: isActive ? "600" : "500",
                    fontSize: 14,
                  }}
                >
                  {tab === "openai" ? "OpenAI" : "Local Network"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Configuration Box */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Server size={18} color={INDIGO} />
            <Text style={{ fontSize: 16, fontWeight: "600", color: TEXT_PRIMARY }}>
              Connection Details
            </Text>
          </View>

          {activeTab === "openai" ? (
            <Input
              label="Secret API Key"
              placeholder="sk-proj-..."
              value={localOpenaiKey}
              onChangeText={(txt) => { setLocalOpenaiKey(txt); setTestResult(null); }}
              secureTextEntry
              containerStyle={{ marginBottom: 16 }}
            />
          ) : (
            <>
              <Input
                label="Server URL"
                placeholder="http://192.168.1.X:1234/v1"
                value={localCompatibleUrl}
                onChangeText={(txt) => { setLocalCompatibleUrl(txt); setTestResult(null); }}
                containerStyle={{ marginBottom: 16 }}
              />
              <Input
                label="API Key (Optional)"
                placeholder="sk-..."
                value={localCompatibleKey}
                onChangeText={(txt) => { setLocalCompatibleKey(txt); setTestResult(null); }}
                secureTextEntry
                containerStyle={{ marginBottom: 16 }}
              />
            </>
          )}

          {/* Secondary Button: Test Connection */}
          <Pressable
            onPress={handleTestConnection}
            disabled={isValidating || !isFormValid}
            style={({ pressed }) => ({
              backgroundColor: isValidating || !isFormValid ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.15)",
              borderWidth: 1,
              borderColor: isValidating || !isFormValid ? "transparent" : "rgba(99,102,241,0.3)",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            {isValidating ? (
              <ActivityIndicator color={INDIGO} size="small" />
            ) : (
              <Text style={{ color: !isFormValid ? TEXT_SECONDARY : INDIGO, fontWeight: "600", fontSize: 15 }}>
                Test Connection
              </Text>
            )}
          </Pressable>
        </View>

        {/* Test Results & Model Selection */}
        {testResult && (
          <View
            style={{
              padding: 16,
              backgroundColor: testResult.ok ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: testResult.ok ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: testResult.ok ? 16 : 0 }}>
              {testResult.ok ? (
                <CheckCircle2 size={18} color={SUCCESS} />
              ) : (
                <AlertCircle size={18} color={ERROR} />
              )}
              <Text style={{ color: testResult.ok ? SUCCESS : ERROR, fontWeight: "600", fontSize: 14 }}>
                {testResult.ok ? "Connection Successful" : testResult.msg}
              </Text>
            </View>

            {testResult.ok && testResult.models.length > 0 && (
              <>
                <Text style={{ color: TEXT_SECONDARY, fontSize: 13, marginBottom: 12 }}>
                  Select the default model to use for chats:
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {testResult.models.slice(0, 8).map((m) => {
                    const isSelected = localModel === m;
                    return (
                      <Pressable
                        key={m}
                        onPress={() => setLocalModel(m)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: isSelected ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
                          borderWidth: 1,
                          borderColor: isSelected ? "rgba(255,255,255,0.2)" : "transparent",
                        }}
                      >
                        {isSelected && <Check size={12} color="#fff" />}
                        <Text style={{ color: isSelected ? "#fff" : TEXT_SECONDARY, fontSize: 13, fontWeight: isSelected ? "500" : "400" }}>
                          {m}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Save Button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          paddingBottom: Platform.OS === "ios" ? 40 : 20,
          backgroundColor: BG,
          borderTopWidth: 1,
          borderTopColor: BORDER,
        }}
      >
        <Pressable
          onPress={handleSave}
          disabled={!testResult?.ok}
          style={({ pressed }) => ({
            backgroundColor: testResult?.ok ? INDIGO : SURFACE,
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.8 : 1,
            shadowColor: INDIGO,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: testResult?.ok ? 0.3 : 0,
            shadowRadius: 8,
            elevation: testResult?.ok ? 4 : 0,
          })}
        >
          <Text style={{ color: testResult?.ok ? "#fff" : TEXT_SECONDARY, fontWeight: "700", fontSize: 16 }}>
            Save Configuration
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
