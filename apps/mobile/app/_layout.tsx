import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { logger } from "@omnia/logger";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CustomDrawer } from "../components/navigation/CustomDrawer";
import { Menu } from "lucide-react-native";
import { Pressable } from "react-native";
import { DrawerToggleButton } from "@react-navigation/drawer";
import "../assets/css/global.css";

const HEADER_BG = "#05050f";
const HEADER_TEXT = "#f8fafc";

// Catch global JS crashes
const originalHandler = global.ErrorUtils?.getGlobalHandler?.();
if (global.ErrorUtils && !global.ErrorUtils.__omnia_hooked) {
  global.ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
    logger.error("AppCrash", "Unhandled JS Exception", error, { isFatal });
    if (originalHandler) originalHandler(error, isFatal);
  });
  global.ErrorUtils.__omnia_hooked = true;
}

export function ErrorBoundary(props: { error: Error; retry: () => void }) {
  useEffect(() => {
    logger.error("ErrorBoundary", "React render error caught", props.error);
  }, [props.error]);
  return null; // Let Expo Router show its default dev overlay, but we still log it.
}

export default function RootLayout() {
  useEffect(() => {
    logger.info("App", "Omnia App Launched (Telemetry Active)");
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: HEADER_BG }}>
      <StatusBar style="light" />
      <Drawer
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: HEADER_BG },
          headerTintColor: HEADER_TEXT,
          headerTitleStyle: { fontWeight: "700", fontSize: 17 },
          headerShadowVisible: false,
          drawerStyle: { width: "80%", backgroundColor: HEADER_BG },
          sceneStyle: { backgroundColor: HEADER_BG },
          headerTitleAlign: "center",
          headerLeft: () => (
            <DrawerToggleButton tintColor={HEADER_TEXT} />
          )
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: "Omnia",
            headerTitle: "Omnia",
          }}
        />
        <Drawer.Screen
          name="chat/[conversationId]"
          options={{
            title: "Chat",
            headerTitle: "Omnia",
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: "Settings",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
