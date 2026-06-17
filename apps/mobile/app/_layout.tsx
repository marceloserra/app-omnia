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

import { useTheme } from "../lib/theme";

export default function RootLayout() {
  const theme = useTheme();

  useEffect(() => {
    logger.info("App", "Omnia App Launched (Telemetry Active)");
  }, []);

  return (
    <>
      <StatusBar style={theme.bg === "#05050f" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.textPrimary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        {/* Home = new chat screen with custom header */}
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        {/* Existing conversation view */}
        <Stack.Screen
          name="chat/[conversationId]"
          options={{ headerShown: false, animation: "none" }}
        />
        {/* Settings */}
        <Stack.Screen
          name="settings"
          options={{ title: "Settings" }}
        />
      </Stack>
    </>
  );
}
