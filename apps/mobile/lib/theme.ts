import { useColorScheme } from "react-native";
import { useSettingsStore } from "../store/settings-store";

export interface ThemePalette {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  indigo: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  red: string;
  activeBg: string;
  purple: string;
}

export const DarkPalette: ThemePalette = {
  bg: "#05050f",
  surface: "#0d0c1d",
  surface2: "#13122a",
  border: "rgba(255,255,255,0.07)",
  indigo: "#6366f1",
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "rgba(148,163,184,0.6)",
  red: "#ef4444",
  activeBg: "rgba(255,255,255,0.08)",
  purple: "#a855f7",
};

export const LightPalette: ThemePalette = {
  bg: "#FFFFFF", // Pure white for cleaner look
  surface: "#FFFFFF",
  surface2: "#F9FAFB", // Slight off-white for contrast inside cards
  border: "rgba(0, 0, 0, 0.08)",
  indigo: "#4f46e5", // Omnia Brand Indigo
  textPrimary: "#000000",
  textSecondary: "#4B5563", // Darker gray for readability
  textMuted: "#6B7280", // Contrast-safe gray for muted text
  red: "#EF4444", 
  activeBg: "rgba(0,0,0,0.04)",
  purple: "#AF52DE",
};

export function useTheme(): ThemePalette {
  const storeTheme = useSettingsStore((s) => s.theme);
  const systemTheme = useColorScheme();

  const isDark = 
    storeTheme === "dark" || 
    (storeTheme === "system" && systemTheme === "dark");

  return isDark ? DarkPalette : LightPalette;
}
