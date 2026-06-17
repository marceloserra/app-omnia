import React from "react";
import { Tabs } from "expo-router";
import { TabBar } from "../../components/navigation/TabBar";
import { useTheme } from "../../lib/theme";

export default function TabLayout() {
  const theme = useTheme();
  return (
    <Tabs 
      tabBar={(props) => <TabBar {...props} />} 
      screenOptions={{ 
        headerShown: false,
        sceneStyle: { backgroundColor: theme.bg },
        animation: "fade"
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
