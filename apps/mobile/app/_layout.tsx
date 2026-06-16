import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable } from "react-native";
import { Settings } from "lucide-react-native";
import "../assets/css/global.css";

const HEADER_BG = "#0a0918";
const HEADER_TEXT = "#f0efff";

export default function RootLayout() {
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
                style={{ padding: 6 }}
                accessibilityLabel="Open settings"
              >
                <Settings size={20} color={HEADER_TEXT} />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: "Settings" }}
        />
      </Stack>
    </>
  );
}
