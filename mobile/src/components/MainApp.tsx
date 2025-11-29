import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import BottomNavigation from "../components/BottomNavigation";
import HomeScreen from "../screens/HomeScreen";
import ScanScreen from "../screens/ScanScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";

interface MainAppProps {
  onLogout: () => void;
}

export default function MainApp({ onLogout }: MainAppProps) {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "scan":
        return <ScanScreen />;
      case "history":
        return <HistoryScreen />;
      case "profile":
        return <ProfileScreen onLogout={onLogout} />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>{renderContent()}</ScrollView>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
  },
});
