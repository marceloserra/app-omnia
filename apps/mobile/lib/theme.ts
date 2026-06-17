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
  bg: "#F2F2F7",
  surface: "#FFFFFF",
  surface2: "#FFFFFF",
  border: "rgba(60, 60, 67, 0.12)",
  indigo: "#4f46e5", // Omnia Brand Indigo (not iOS blue)
  textPrimary: "#000000",
  textSecondary: "#8E8E93", // iOS Gray
  textMuted: "#C7C7CC",
  red: "#FF3B30", // iOS Red
  activeBg: "rgba(0,0,0,0.04)",
  purple: "#AF52DE", // iOS Purple
};

export function useTheme(): ThemePalette {
  const storeTheme = useSettingsStore((s) => s.theme);
  const systemTheme = useColorScheme();

  const isDark = 
    storeTheme === "dark" || 
    (storeTheme === "system" && systemTheme === "dark");

  return isDark ? DarkPalette : LightPalette;
}
