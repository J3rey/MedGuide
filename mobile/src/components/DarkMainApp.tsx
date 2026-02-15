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
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import DarkBottomNavigation from "./DarkBottomNavigation";
import ScheduleScreen from "../screens/ScheduleScreen";
import CameraScreen from "../screens/CameraScreen";
import ChatScreen from "../screens/ChatScreen";
import ScanResultsScreen from "../screens/ScanResultsScreen";
import ManualSearchScreen from "../screens/ManualSearchScreen";
import AlarmScreen from "../screens/AlarmScreen";
import { snoozeAlarm, dismissAlarm } from "../services/notificationService";
import { ScanProvider, useScan } from "../contexts/ScanContext";
import theme from "../styles/theme";

type Tab = "schedule" | "camera" | "chat" | "settings";

interface DarkMainAppProps {
  onBack: () => void;
}

interface AlarmData {
  medicationName: string;
  notificationId: string;
}

const CameraStack = createNativeStackNavigator();

function CameraStackScreen() {
  return (
    <CameraStack.Navigator screenOptions={{ headerShown: false }}>
      <CameraStack.Screen name="CameraMain" component={CameraScreen} />
      <CameraStack.Screen name="ScanResults" component={ScanResultsScreen} />
      <CameraStack.Screen name="ManualSearch" component={ManualSearchScreen} />
    </CameraStack.Navigator>
  );
}

function DarkMainAppContent({ onBack }: DarkMainAppProps) {
  const [activeTab, setActiveTab] = useState<Tab>("camera");
  const [showAlarm, setShowAlarm] = useState(false);
  const [currentAlarm, setCurrentAlarm] = useState<AlarmData | null>(null);
  const { scannedDrug, setScannedDrug } = useScan();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const notificationListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );
  const responseListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );

  // Listen for scan completion event
  useEffect(() => {
    if (scannedDrug) {
      // Switch to chat tab with the scanned drug
      setActiveTab("chat");
      // Clear the scanned drug after a delay so chat can use it
      setTimeout(() => setScannedDrug(null), 1000);
    }
  }, [scannedDrug, setScannedDrug]);

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
        return (
          <NavigationContainer independent={true}>
            <CameraStackScreen />
          </NavigationContainer>
        );
      case "chat":
        return <ChatScreen initialDrugName={scannedDrug || undefined} />;
      case "settings":
        const containerPadding = screenWidth > 768 ? 48 : 24;
        return (
          <View style={styles.settingsScreen}>
            <View style={[styles.settingsHeader, { paddingTop: Math.max(insets.top, 16) }]}>
              <View style={[styles.headerContent, { paddingHorizontal: containerPadding }]}>
                <View style={styles.headerLeft}>
                  <Text style={styles.settingsIcon}>⚙️</Text>
                  <Text style={styles.settingsTitle}>Settings</Text>
                </View>
              </View>
            </View>
            <View style={[styles.settingsContent, { paddingHorizontal: containerPadding }]}>
              <TouchableOpacity style={styles.settingsOption} onPress={onBack}>
                <Text style={styles.settingsOptionText}>🌐 Change Language</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return (
          <NavigationContainer independent={true}>
            <CameraStackScreen />
          </NavigationContainer>
        );
    }
  };

  return (
    <View style={styles.container}>
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
  settingsScreen: {
    flex: 1,
  },
  settingsHeader: {
    paddingVertical: theme.spacing.base,
    marginBottom: theme.spacing.base,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  settingsIcon: {
    fontSize: 32,
  },
  settingsTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.darkColors.foreground,
  },
  settingsContent: {
    flex: 1,
  },
  settingsOption: {
    padding: theme.spacing.lg,
    backgroundColor: theme.darkColors.card,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
  },
  settingsOptionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.darkColors.foreground,
  },
  content: {
    flex: 1,
  },
});

export default function DarkMainApp(props: DarkMainAppProps) {
  return (
    <ScanProvider>
      <DarkMainAppContent {...props} />
    </ScanProvider>
  );
}
