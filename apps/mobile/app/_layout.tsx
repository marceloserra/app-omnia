import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../assets/css/global.css";

const HEADER_BG = "#0a0918";
const HEADER_TEXT = "#f0efff";
const HEADER_BORDER = "#1e1b4b";

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
