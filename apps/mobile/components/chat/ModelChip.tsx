/**
 * ModelChip — shared floating header pill used on Home, New Chat, and Chat screens.
 *
 * Connected state:   🤖  Local · llama3.2:1b  ⌄
 * Disconnected state: ✦  Omnia
 */
import React from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronDown, Sparkles } from "lucide-react-native";
import { ThemePalette } from "../../lib/theme";
import { getModelIcon } from "./ModelPickerSheet";

interface ModelChipProps {
  providerId: string | null;
  modelId: string;
  isDark: boolean;
  theme: ThemePalette;
  onPress?: () => void;
}

export function ModelChip({ providerId, modelId, isDark, theme, onPress }: ModelChipProps) {
  const providerLabel = providerId === "openai" ? "OpenAI" : "Local";
  const chipBg = theme.surface;
  const chipBorder = theme.border;

  if (!providerId) {
    return (
      <View style={{
        borderRadius: 18,
        backgroundColor: chipBg,
        borderWidth: 1,
        borderColor: chipBorder,
        flexDirection: "row",
        alignItems: "center",
        height: 36,
        paddingHorizontal: 12,
        gap: 6,
      }}>
        <Sparkles size={14} color={theme.indigo} strokeWidth={2} />
        <Text style={{
          color: theme.textPrimary,
          fontSize: 13,
          fontWeight: "600",
          letterSpacing: 0.3,
        }}>
          Omnia
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Change model"
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={{
        borderRadius: 18,
        backgroundColor: chipBg,
        borderWidth: 1,
        borderColor: chipBorder,
        flexDirection: "row",
        alignItems: "center",
        height: 36,
        paddingHorizontal: 12,
        gap: 6,
        maxWidth: 220,
      }}>
        {/* Model icon */}
        <View style={{ width: 18, height: 18, alignItems: "center", justifyContent: "center" }}>
          {getModelIcon(modelId || "", 16)}
        </View>

        {/* Label: "Local · model-name" */}
        <Text
          style={{
            color: theme.textPrimary,
            fontSize: 13,
            fontWeight: "600",
            letterSpacing: 0.3,
            flexShrink: 1,
            maxWidth: 140,
          }}
          numberOfLines={1}
        >
          {providerLabel} · {modelId}
        </Text>

        <ChevronDown size={14} color={theme.textSecondary} />
      </View>
    </Pressable>
  );
}
