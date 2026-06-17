import { Drawer } from "expo-router/drawer";
import { CustomDrawer } from "../../components/navigation/CustomDrawer";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { BlurView } from "expo-blur";
import { Platform, View, StyleSheet } from "react-native";

const HEADER_BG = "#05050f";
const HEADER_TEXT = "#f8fafc";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...(props as any)} />}
      screenOptions={{
        headerTransparent: true,
        headerTitle: "",
        headerLeft: () => (
          <View style={styles.headerLeftContainer}>
            <BlurView intensity={20} tint="dark" style={styles.headerGlass}>
              <DrawerToggleButton tintColor={HEADER_TEXT} />
            </BlurView>
          </View>
        ),
        drawerStyle: { width: "80%", backgroundColor: HEADER_BG },
        sceneStyle: { backgroundColor: HEADER_BG },
      }}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="chat/[conversationId]" />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  headerLeftContainer: {
    marginLeft: 16,
    marginTop: Platform.OS === "android" ? 36 : 0,
    borderRadius: 24,
    overflow: "hidden",
  },
  headerGlass: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
});
