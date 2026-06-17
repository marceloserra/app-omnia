import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { logger } from "@omnia/logger";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../assets/css/global.css";

const HEADER_BG = "#05050f";

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

export default function RootLayout() {
  useEffect(() => {
    logger.info("App", "Omnia App Launched (Telemetry Active)");
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: HEADER_BG }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: HEADER_BG },
        }}
      >
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            presentation: "modal",
            title: "Settings",
            headerStyle: { backgroundColor: "#13112a" },
            headerTintColor: "#f8fafc",
            headerTitleStyle: { fontWeight: "700" },
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
