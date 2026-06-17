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
  bg: "#f8fafc",
  surface: "#ffffff",
  surface2: "#f1f5f9",
  border: "rgba(0,0,0,0.07)",
  indigo: "#4f46e5",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "rgba(15,23,42,0.5)",
  red: "#dc2626",
  activeBg: "rgba(0,0,0,0.05)",
  purple: "#9333ea",
};

export function useTheme(): ThemePalette {
  const storeTheme = useSettingsStore((s) => s.theme);
  const systemTheme = useColorScheme();

  const isDark = 
    storeTheme === "dark" || 
    (storeTheme === "system" && systemTheme === "dark");

  return isDark ? DarkPalette : LightPalette;
}
