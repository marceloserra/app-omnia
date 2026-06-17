import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable } from "react-native";
import { Settings } from "lucide-react-native";
import { logger } from "@omnia/logger";
import { useEffect } from "react";
import "../assets/css/global.css";

const HEADER_BG = "#05050f";
const HEADER_TEXT = "#f0efff";

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
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: HEADER_BG },
          headerTintColor: HEADER_TEXT,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: HEADER_BG },
          headerTitle: "", // Clear out titles to make it super clean
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="new-chat"
          options={{ headerBackTitle: "Chats", title: "" }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: "Settings" }}
        />
        <Stack.Screen
          name="chat/[conversationId]"
          options={{ headerBackTitle: "Chats" }}
        />
      </Stack>
    </>
  );
}
