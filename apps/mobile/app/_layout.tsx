import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "../assets/css/global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});
  const [themeScheme, setThemeScheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Detect system theme preference on mount
    const colorScheme = require("react-native").Appearance.getColorScheme();
    setThemeScheme(colorScheme ?? "light");
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={themeScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style={themeScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
