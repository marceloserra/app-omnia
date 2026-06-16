import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View, StyleSheet } from "react-native";
import "../assets/css/global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <View style={[styles.root, isDark ? styles.darkRoot : styles.lightRoot]}>
        <Drawer>
          {/* Drawer content will be defined in individual screens */}
          <Drawer.Screen 
            name="index" 
            options={{ 
              drawerLabel: "Conversations",
              title: "Chat",
            }} 
          />
          <Drawer.Screen 
            name="settings" 
            options={{ 
              drawerLabel: "Settings",
              title: "Settings",
            }} 
          />
        </Drawer>
        <StatusBar style={isDark ? "light" : "dark"} />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  darkRoot: {
    backgroundColor: 'var(--color-background)',
  },
  lightRoot: {
    backgroundColor: 'var(--color-background)',
  },
});
