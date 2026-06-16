import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useProviderStore } from "../store/provider-store";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Divider } from "../components/ui/Divider";
import { OpenAIProvider } from "@omnia/providers";
import { OpenAICompatibleProvider } from "@omnia/providers";

const BG = "#0a0918";
const SURFACE = "#13112a";
const INDIGO = "#6366f1";
const TEXT_PRIMARY = "#f0efff";
const TEXT_SECONDARY = "#9d9bcc";
const SUCCESS = "#22c55e";
const ERROR = "#ef4444";

type Tab = "openai" | "openai-compatible";

export default function SettingsScreen() {
  const store = useProviderStore();
  const [activeTab, setActiveTab] = useState<Tab>(
    (store.activeProviderId as Tab) ?? "openai"
  );

  const handleValidate = async () => {
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
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Provider Tabs */}
      <Text style={{ fontSize: 13, fontWeight: "600", color: TEXT_SECONDARY, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
        Provider
      </Text>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
        {(["openai", "openai-compatible"] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              alignItems: "center",
              backgroundColor: activeTab === tab ? INDIGO : SURFACE,
              borderWidth: 1,
              borderColor: activeTab === tab ? INDIGO : "rgba(99,102,241,0.2)",
            }}
          >
            <Text style={{ color: activeTab === tab ? "#fff" : TEXT_SECONDARY, fontWeight: "600", fontSize: 13 }}>
              {tab === "openai" ? "OpenAI" : "Local AI"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* OpenAI config */}
      {activeTab === "openai" && (
        <Card padding="lg" style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: TEXT_PRIMARY, marginBottom: 4 }}>
            OpenAI
          </Text>
          <Text style={{ fontSize: 13, color: TEXT_SECONDARY, marginBottom: 16 }}>
            Connects to api.openai.com using your API key.
          </Text>
          <Divider style={{ marginBottom: 16 }} />
          <Input
            label="API Key"
            placeholder="sk-..."
            value={store.openaiApiKey}
            onChangeText={store.setOpenaiApiKey}
            containerStyle={{ marginBottom: 14 }}
          />
          <Input
            label="Default Model"
            placeholder="gpt-4o-mini"
            value={store.openaiModelId}
            onChangeText={store.setOpenaiModelId}
          />
        </Card>
      )}

      {/* OpenAI-compatible config */}
      {activeTab === "openai-compatible" && (
        <Card padding="lg" style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: TEXT_PRIMARY, marginBottom: 4 }}>
            Local AI
          </Text>
          <Text style={{ fontSize: 13, color: TEXT_SECONDARY, marginBottom: 16 }}>
            Works with LM Studio, Ollama, vLLM and any OpenAI-compatible server.
          </Text>
          <Divider style={{ marginBottom: 16 }} />
          <Input
            label="Base URL"
            placeholder="http://localhost:1234/v1"
            value={store.compatibleBaseUrl}
            onChangeText={store.setCompatibleBaseUrl}
            containerStyle={{ marginBottom: 14 }}
          />
          <Input
            label="API Key (optional)"
            placeholder="Leave blank if not required"
            value={store.compatibleApiKey}
            onChangeText={store.setCompatibleApiKey}
          />
        </Card>
      )}

      {/* Validate button */}
      <Button
        variant={store.isValidating ? "secondary" : "default"}
        size="lg"
        onPress={handleValidate}
        disabled={store.isValidating}
        style={{ marginBottom: 16 }}
      >
        {store.isValidating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            Test Connection
          </Text>
        )}
      </Button>

      {/* Connection status */}
      {(store.isConnected || store.connectionError) && (
        <Card padding="md" style={{ marginBottom: 20, borderColor: store.isConnected ? SUCCESS : ERROR }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: store.isConnected ? SUCCESS : ERROR, marginBottom: store.isConnected && store.availableModels.length > 0 ? 10 : 0 }}>
            {store.isConnected ? "✓ Connected" : `✗ ${store.connectionError}`}
          </Text>

          {store.isConnected && store.availableModels.length > 0 && (
            <>
              <Text style={{ fontSize: 12, color: TEXT_SECONDARY, marginBottom: 8 }}>
                Available models ({store.availableModels.length}) — tap to select:
              </Text>
              {store.availableModels.slice(0, 8).map((m) => {
                const selected = (activeTab === "openai" ? store.openaiModelId : store.compatibleModelId) === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      if (activeTab === "openai") store.setOpenaiModelId(m);
                      else store.setCompatibleModelId(m);
                    }}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      marginBottom: 6,
                      backgroundColor: selected ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.04)",
                      borderWidth: 1,
                      borderColor: selected ? INDIGO : "transparent",
                    }}
                  >
                    <Text style={{ color: TEXT_PRIMARY, fontSize: 13 }}>{m}</Text>
                  </Pressable>
                );
              })}
              {store.availableModels.length > 8 && (
                <Text style={{ fontSize: 12, color: TEXT_SECONDARY, marginTop: 4 }}>
                  +{store.availableModels.length - 8} more
                </Text>
              )}
            </>
          )}
        </Card>
      )}

      {/* Active provider summary */}
      {store.activeProviderId && store.isConnected && (
        <View style={{ padding: 14, borderRadius: 12, backgroundColor: "rgba(99,102,241,0.1)", borderWidth: 1, borderColor: "rgba(99,102,241,0.3)" }}>
          <Text style={{ fontSize: 13, color: INDIGO, fontWeight: "600" }}>
            ✦ Active: {store.activeProviderId === "openai" ? "OpenAI" : "Local AI"}
            {" · "}
            {store.activeProviderId === "openai" ? store.openaiModelId : store.compatibleModelId}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
