import { StatusBar } from "expo-status-bar";
import { Platform, Text, View } from "react-native";
import "../assets/css/global.css";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <StatusBar style={Platform.OS === "ios" ? "dark" : "light"} />
      <Text className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        Omnia
      </Text>
      <Text className="text-lg text-gray-500 dark:text-gray-400">
        One app. Every model.
      </Text>
    </View>
  );
}
