import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "system" | "light" | "dark";
export type LanguageCode = "system" | "en" | "pt" | "es";

interface SettingsState {
  theme: ThemeMode;
  language: LanguageCode;
  
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (lang: LanguageCode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "system",

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "omnia-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
