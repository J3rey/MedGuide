import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

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
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingHorizontal: screenWidth > 768 ? 48 : 24,
          },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
    zIndex: 999,
    backgroundColor: "transparent",
    elevation: 10,
  },
  settingsButton: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(42, 42, 42, 0.9)",
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  settingsIcon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
  },
});
