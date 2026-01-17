import React, { useState, useEffect, useRef } from "react";
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
import * as Notifications from "expo-notifications";
import DarkBottomNavigation from "./DarkBottomNavigation";
import ScheduleScreen from "../screens/ScheduleScreen";
import CameraScreen from "../screens/CameraScreen";
import ChatScreen from "../screens/ChatScreen";
import AlarmScreen from "../screens/AlarmScreen";
import { snoozeAlarm, dismissAlarm } from "../services/notificationService";
import theme from "../styles/theme";

type Tab = "schedule" | "camera" | "chat";

interface DarkMainAppProps {
  onBack: () => void;
}

interface AlarmData {
  medicationName: string;
  notificationId: string;
}

export default function DarkMainApp({ onBack }: DarkMainAppProps) {
  const [activeTab, setActiveTab] = useState<Tab>("camera");
  const [showAlarm, setShowAlarm] = useState(false);
  const [currentAlarm, setCurrentAlarm] = useState<AlarmData | null>(null);
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const notificationListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );
  const responseListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );

  useEffect(() => {
    // Listen for notifications when app is in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data;
        if (data.isAlarm) {
          setCurrentAlarm({
            medicationName: data.medicationName as string,
            notificationId: notification.request.identifier,
          });
          setShowAlarm(true);
        }
      });

    // Listen for user interactions with notifications
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          const data = response.notification.request.content.data;
          const actionId = response.actionIdentifier;

          if (data.isAlarm) {
            if (actionId === "SNOOZE_5") {
              await handleSnooze(data.medicationName as string, 5);
            } else if (actionId === "SNOOZE_10") {
              await handleSnooze(data.medicationName as string, 10);
            } else if (
              actionId === "DISMISS" ||
              actionId === Notifications.DEFAULT_ACTION_IDENTIFIER
            ) {
              await dismissAlarm(response.notification.request.identifier);
            }
          }
        }
      );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const handleDismiss = async (): Promise<void> => {
    if (currentAlarm) {
      await dismissAlarm(currentAlarm.notificationId);
    }
    setShowAlarm(false);
    setCurrentAlarm(null);
  };

  const handleSnooze = async (
    medicationName: string,
    minutes: number
  ): Promise<void> => {
    if (currentAlarm) {
      await dismissAlarm(currentAlarm.notificationId);
      await snoozeAlarm(medicationName, minutes);
    }
    setShowAlarm(false);
    setCurrentAlarm(null);
  };

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
          <Text style={styles.settingsIcon}>SETTINGS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{renderContent()}</View>

      <DarkBottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {currentAlarm && (
        <AlarmScreen
          visible={showAlarm}
          medicationName={currentAlarm.medicationName}
          onDismiss={handleDismiss}
          onSnooze={(minutes) =>
            handleSnooze(currentAlarm.medicationName, minutes)
          }
        />
      )}
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
