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
import { useProviderStore } from "../store/provider-store";
import { Input } from "../components/ui/Input";
import { OpenAIProvider, OpenAICompatibleProvider } from "@omnia/providers";
import { CheckCircle2, AlertCircle, Server } from "lucide-react-native";

const BG = "#0a0918";
const SURFACE = "#13112a";
const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f0efff";
const TEXT_SECONDARY = "#9d9bcc";
const BORDER = "rgba(99,102,241,0.15)";
const SUCCESS = "#10b981";
const ERROR = "#ef4444";

type Tab = "openai" | "openai-compatible";

export default function SettingsScreen() {
  const store = useProviderStore();
  const [activeTab, setActiveTab] = useState<Tab>(
    (store.activeProviderId as Tab) ?? "openai"
  );

  const handleSaveAndTest = async () => {
    store.setValidating(true);
    store.setConnected(false, [], undefined);

    try {
      if (activeTab === "openai") {
        const provider = new OpenAIProvider();
        const ok = await provider.validateConnection({ apiKey: store.openaiApiKey });
        if (ok) {
          const models = await provider.listModels({ apiKey: store.openaiApiKey });
          store.setConnected(true, models.map((m) => m.id));
          store.setActiveProvider("openai");
        } else {
          store.setConnected(false, [], "Invalid API key or network error.");
        }
      } else {
        const provider = new OpenAICompatibleProvider();
        const ok = await provider.validateConnection({
          baseUrl: store.compatibleBaseUrl,
          apiKey: store.compatibleApiKey || undefined,
        });
        if (ok) {
          const models = await provider.listModels({
            baseUrl: store.compatibleBaseUrl,
            apiKey: store.compatibleApiKey || undefined,
          });
          store.setConnected(true, models.map((m) => m.id));
          store.setActiveProvider("openai-compatible");
        } else {
          store.setConnected(false, [], "Could not connect. Check the base URL.");
        }
      }
    } catch (e: any) {
      store.setConnected(false, [], e?.message ?? "Unknown error.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Elegant Segmented Control */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "rgba(255,255,255,0.03)",
            borderRadius: 16,
            padding: 4,
            marginBottom: 32,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          {(["openai", "openai-compatible"] as Tab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  backgroundColor: isActive ? "rgba(99,102,241,0.2)" : "transparent",
                  borderWidth: 1,
                  borderColor: isActive ? "rgba(99,102,241,0.3)" : "transparent",
                }}
              >
                <Text
                  style={{
                    color: isActive ? "#fff" : TEXT_SECONDARY,
                    fontWeight: isActive ? "600" : "500",
                    fontSize: 14,
                  }}
                >
                  {tab === "openai" ? "OpenAI" : "Local AI"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Configuration Card */}
        <View
          style={{
            backgroundColor: SURFACE,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: BORDER,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Server size={18} color={INDIGO} />
            <Text style={{ fontSize: 17, fontWeight: "600", color: TEXT_PRIMARY }}>
              API Configuration
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: TEXT_SECONDARY, marginBottom: 24, lineHeight: 18 }}>
            {activeTab === "openai"
              ? "Connects securely to api.openai.com. Your key is stored only on this device."
              : "Works with LM Studio, Ollama, vLLM or any OpenAI-compatible server on your local network."}
          </Text>

          {activeTab === "openai" ? (
            <>
              <Input
                label="API Key"
                placeholder="sk-..."
                value={store.openaiApiKey}
                onChangeText={store.setOpenaiApiKey}
                secureTextEntry
                containerStyle={{ marginBottom: 20 }}
              />
              <Input
                label="Default Model"
                placeholder="gpt-4o-mini"
                value={store.openaiModelId}
                onChangeText={store.setOpenaiModelId}
              />
            </>
          ) : (
            <>
              <Input
                label="Base URL"
                placeholder="http://192.168.1.X:1234/v1"
                value={store.compatibleBaseUrl}
                onChangeText={store.setCompatibleBaseUrl}
                containerStyle={{ marginBottom: 20 }}
              />
              <Input
                label="API Key (optional)"
                placeholder="Leave blank if local"
                value={store.compatibleApiKey}
                onChangeText={store.setCompatibleApiKey}
                secureTextEntry
              />
            </>
          )}
        </View>

        {/* Connection Status Section */}
        {store.isConnected && (
          <View style={{ marginTop: 24, padding: 16, backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.2)" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <CheckCircle2 size={18} color={SUCCESS} />
              <Text style={{ color: SUCCESS, fontWeight: "600", fontSize: 15 }}>Connection Verified</Text>
            </View>
            <Text style={{ color: TEXT_SECONDARY, fontSize: 13, marginBottom: 12 }}>
              {store.availableModels.length} models available. Tap to select:
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {store.availableModels.slice(0, 10).map((m) => {
                const selected = (activeTab === "openai" ? store.openaiModelId : store.compatibleModelId) === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      if (activeTab === "openai") store.setOpenaiModelId(m);
                      else store.setCompatibleModelId(m);
                    }}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      backgroundColor: selected ? INDIGO : "rgba(255,255,255,0.05)",
                      borderWidth: 1,
                      borderColor: selected ? INDIGO : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text style={{ color: selected ? "#fff" : TEXT_PRIMARY, fontSize: 12, fontWeight: selected ? "600" : "400" }}>
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {store.connectionError && (
          <View style={{ marginTop: 24, padding: 16, backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.2)" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <AlertCircle size={18} color={ERROR} />
              <Text style={{ color: ERROR, fontWeight: "600", fontSize: 14 }}>{store.connectionError}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
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
          borderTopColor: "rgba(255,255,255,0.05)",
        }}
      >
        <Pressable
          onPress={handleSaveAndTest}
          disabled={store.isValidating}
          style={({ pressed }) => ({
            backgroundColor: INDIGO,
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            opacity: pressed || store.isValidating ? 0.7 : 1,
            shadowColor: INDIGO,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          })}
        >
          {store.isValidating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              Save & Connect
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
