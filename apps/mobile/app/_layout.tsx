import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { logger } from "@omnia/logger";
import { useEffect } from "react";

// Catch global JS crashes
const g = global as any;
const originalHandler = g.ErrorUtils?.getGlobalHandler?.();
if (g.ErrorUtils && !g.ErrorUtils.__omnia_hooked) {
  g.ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
    logger.error("AppCrash", "Unhandled JS Exception", error, { isFatal });
    if (originalHandler) originalHandler(error, isFatal);
  });
  g.ErrorUtils.__omnia_hooked = true;
}

export function ErrorBoundary(props: { error: Error; retry: () => void }) {
  useEffect(() => {
    logger.error("ErrorBoundary", "React render error caught", props.error);
  }, [props.error]);
  return null;
}

import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import * as SystemUI from "expo-system-ui";
import { useTheme } from "../lib/theme";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const theme = useTheme();

  useEffect(() => {
    logger.info("App", "Omnia App Launched (Telemetry Active)");
  }, []);

  useEffect(() => {
    // Sync the native Android/iOS root view background with the current theme.
    // This physically eliminates the "white flash" when navigating or opening the keyboard.
    SystemUI.setBackgroundColorAsync(theme.bg);
  }, [theme.bg]);

  const isDark = theme.bg === "#05050f";
  const navTheme = isDark ? DarkTheme : DefaultTheme;
  const customNavTheme = {
    ...navTheme,
    colors: { ...navTheme.colors, background: theme.bg },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={customNavTheme}>
        {/* @ts-expect-error expo-status-bar backgroundColor is valid on android but types might complain */}
        <StatusBar style={theme.bg === "#05050f" ? "light" : "dark"} backgroundColor={theme.bg} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.bg },
            headerTintColor: theme.textPrimary,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: theme.bg },
          }}
        >
          {/* Tab Navigator (Home, History, Settings) */}
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          {/* New chat screen */}
          <Stack.Screen
            name="chat/new"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          {/* Existing conversation view */}
          <Stack.Screen
            name="chat/[conversationId]"
            options={{ headerShown: false, animation: "none" }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
