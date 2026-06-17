import React from "react";
import { View, Pressable, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Home, MessageSquare, Settings, SquarePen } from "lucide-react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { useTheme } from "../../lib/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = theme.bg === "#05050f";

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]} pointerEvents="box-none">
      <BlurView intensity={isDark ? 60 : 100} tint={isDark ? "dark" : "light"} style={[styles.blur, { backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)" }]}>
        
        {/* Home Tab */}
        <Pressable 
          onPress={() => navigation.navigate("index")} 
          style={styles.tabItem}
        >
          <Home size={22} color={state.index === 0 ? theme.indigo : theme.textSecondary} strokeWidth={state.index === 0 ? 2.5 : 2} />
        </Pressable>

        {/* History Tab */}
        <Pressable 
          onPress={() => navigation.navigate("history")} 
          style={styles.tabItem}
        >
          <MessageSquare size={22} color={state.index === 1 ? theme.indigo : theme.textSecondary} strokeWidth={state.index === 1 ? 2.5 : 2} />
        </Pressable>

        {/* Action Button: New Chat */}
        <Pressable 
          onPress={() => router.push("/chat/new")}
          style={({ pressed }) => [styles.tabItem, pressed && { opacity: 0.5 }]}
        >
          <SquarePen size={22} color={theme.textPrimary} strokeWidth={2} />
        </Pressable>

        {/* Settings Tab */}
        <Pressable 
          onPress={() => navigation.navigate("settings")} 
          style={styles.tabItem}
        >
          <Settings size={22} color={state.index === 2 ? theme.indigo : theme.textSecondary} strokeWidth={state.index === 2 ? 2.5 : 2} />
        </Pressable>

      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  blur: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
