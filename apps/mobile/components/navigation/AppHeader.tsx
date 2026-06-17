import React, { useState } from "react";
import { View, Pressable, Text, StyleSheet, Platform, StatusBar } from "react-native";
import { router } from "expo-router";
import { Menu, PenSquare } from "lucide-react-native";
import { Sidebar } from "./Sidebar";

const BG = "#05050f";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_SECONDARY = "#64748b";

interface Props {
  title?: string;
  showNewChat?: boolean;
}

export function AppHeader({ title = "Omnia", showNewChat = true }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <View style={styles.header}>
        <Pressable
          onPress={() => setSidebarOpen(true)}
          hitSlop={10}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
        >
          <Menu size={22} color={TEXT_PRIMARY} />
        </Pressable>

        <Text style={styles.title}>{title}</Text>

        {showNewChat ? (
          <Pressable
            onPress={() => router.replace("/")}
            hitSlop={10}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          >
            <PenSquare size={20} color={TEXT_PRIMARY} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 58 : (StatusBar.currentHeight ?? 0) + 16,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: "#05050f",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  title: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  iconBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
});
