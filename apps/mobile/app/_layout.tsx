import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable } from "react-native";
import { Settings } from "lucide-react-native";
import { logger } from "@omnia/logger";
import { useEffect } from "react";
import "../assets/css/global.css";

const HEADER_BG = "#0a0918";
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
          headerTitleStyle: { fontWeight: "700", fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: HEADER_BG },
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Omnia",
            headerLargeTitle: true,
            headerLargeTitleStyle: { color: HEADER_TEXT, fontWeight: "700" },
            headerRight: () => (
              <Pressable
                onPress={() => router.push("/settings")}
                style={({ pressed }) => [{ padding: 8, marginRight: 4, opacity: pressed ? 0.7 : 1 }]}
                accessibilityLabel="Open settings"
              >
                <Settings size={26} color={HEADER_TEXT} />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: "Settings" }}
        />
        <Stack.Screen
          name="chat/[conversationId]"
          options={{ title: "Chat", headerBackTitle: "Home" }}
        />
      </Stack>
    </>
  );
}
