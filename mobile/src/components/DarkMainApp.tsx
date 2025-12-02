import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DarkBottomNavigation from "./DarkBottomNavigation";
import ScheduleScreen from "../screens/ScheduleScreen";
import CameraScreen from "../screens/CameraScreen";
import ChatScreen from "../screens/ChatScreen";
import theme from "../styles/theme";

type Tab = "schedule" | "camera" | "chat";

interface DarkMainAppProps {
  onBack: () => void;
}

export default function DarkMainApp({ onBack }: DarkMainAppProps) {
  const [activeTab, setActiveTab] = useState<Tab>("camera");

  const renderContent = (): React.JSX.Element => {
    switch (activeTab) {
      case "schedule":
        return <ScheduleScreen />;
      case "camera":
        return <CameraScreen />;
      case "chat":
        return <ChatScreen />;
      default:
        return <CameraScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{renderContent()}</View>

      <DarkBottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.darkColors.background,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingHorizontal: 24,
  },
  settingsButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIcon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
});
