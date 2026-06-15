import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import "../assets/css/global.css";

export default function Home() {
  return (
    <div className="flex-1 items-center justify-center p-6">
      <StatusBar style={Platform.OS === "ios" ? "dark" : "light"} />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Omnia</h1>
      <p className="text-lg text-gray-500 dark:text-gray-400">One app. Every model.</p>
    </div>
  );
}
