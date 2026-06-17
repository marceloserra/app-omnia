import { useColorScheme, Appearance } from "react-native";
import { useState, useEffect } from "react";
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
  bg: "#f2f2f7",          // iOS system groupedBackground (light gray)
  surface: "#FFFFFF",
  surface2: "#FFFFFF",     // Cards sit white on the gray bg for contrast
  border: "rgba(0, 0, 0, 0.12)",
  indigo: "#4f46e5",
  textPrimary: "#000000",
  textSecondary: "#4B5563",
  textMuted: "#6B7280",
  red: "#EF4444", 
  activeBg: "rgba(0,0,0,0.06)",
  purple: "#AF52DE",
};

export function useTheme(): ThemePalette {
  const storeTheme = useSettingsStore((s) => s.theme);
  const hookTheme = useColorScheme();
  const [activeSystemTheme, setActiveSystemTheme] = useState(hookTheme || Appearance.getColorScheme() || "light");

  useEffect(() => {
    // Actively listen to system theme changes (fixes Expo Go freezing the scheme)
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setActiveSystemTheme(colorScheme || "light");
    });
    // Sync initially just in case it changed before mount
    const current = Appearance.getColorScheme();
    if (current) setActiveSystemTheme(current);
    
    return () => subscription.remove();
  }, []);

  const systemTheme = hookTheme || activeSystemTheme;

  const isDark = 
    storeTheme === "dark" || 
    (storeTheme === "system" && systemTheme === "dark");

  return isDark ? DarkPalette : LightPalette;
}
