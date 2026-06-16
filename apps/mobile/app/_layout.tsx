import "react-native-gesture-handler";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import "../assets/css/global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Slot />
    </ThemeProvider>
  );
}
