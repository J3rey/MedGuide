import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import BottomTabNavigation, { Tab } from './BottomTabNavigation';
import HomeScreen from '../screens/HomeScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import CameraScreen from '../screens/CameraScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanResultsScreen from '../screens/ScanResultsScreen';
import ManualSearchScreen from '../screens/ManualSearchScreen';
import AlarmScreen from '../screens/AlarmScreen';
import AccessibilitySettingsScreen from '../screens/AccessibilitySettingsScreen';
import SecuritySettingsScreen from '../screens/SecuritySettingsScreen';
import CaregiverDashboardScreen from '../screens/CaregiverDashboardScreen';
import CaregiverInviteScreen from '../screens/CaregiverInviteScreen';
import EmergencyProtocolScreen from '../screens/EmergencyProtocolScreen';
import EmergencyContactsScreen from '../screens/EmergencyContactsScreen';
import PharmacyScreen from '../screens/PharmacyScreen';
import ManageProfilesScreen from '../screens/ManageProfilesScreen';
import CulturalNotesScreen from '../screens/CulturalNotesScreen';
import { snoozeAlarm, dismissAlarm } from '../services/notificationService';
import { useScan } from '../contexts/ScanContext';
import theme from '../styles/theme';
import { CameraStackParamList } from '../types/navigation';

interface MainAppContainerProps {
  onBack: () => void;
}

interface AlarmData {
  medicationName: string;
  notificationId: string;
}

// Sub-screen type for profile stack navigation
type SubScreen =
  | null
  | 'AccessibilitySettings'
  | 'SecuritySettings'
  | 'CaregiverDashboard'
  | 'CaregiverInvite'
  | 'EmergencyProtocol'
  | 'EmergencyContacts'
  | 'PharmacyList'
  | 'ManageProfiles'
  | 'CulturalNotes';

const profileSubScreens: Exclude<SubScreen, null>[] = [
  'AccessibilitySettings',
  'SecuritySettings',
  'CaregiverDashboard',
  'CaregiverInvite',
  'EmergencyProtocol',
  'EmergencyContacts',
  'PharmacyList',
  'ManageProfiles',
  'CulturalNotes',
];

const CameraStack = createNativeStackNavigator<CameraStackParamList>();

function CameraStackScreen() {
  return (
    <CameraStack.Navigator screenOptions={{ headerShown: false }}>
      <CameraStack.Screen name="CameraMain" component={CameraScreen} />
      <CameraStack.Screen name="ScanResults" component={ScanResultsScreen} />
      <CameraStack.Screen name="ManualSearch" component={ManualSearchScreen} />
    </CameraStack.Navigator>
  );
}

export default function MainAppContainer({ onBack }: MainAppContainerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [subScreen, setSubScreen] = useState<SubScreen>(null);
  const [showAlarm, setShowAlarm] = useState(false);
  const [currentAlarm, setCurrentAlarm] = useState<AlarmData | null>(null);
  const [chatDrugName, setChatDrugName] = useState<string | null>(null);
  const { scannedDrug, setScannedDrug } = useScan();
  const notificationListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );
  const responseListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );

  // Listen for scan completion
  useEffect(() => {
    if (scannedDrug) {
      setChatDrugName(scannedDrug);
      setActiveTab('chat');
      setTimeout(() => setScannedDrug(null), 1000);
    }
  }, [scannedDrug, setScannedDrug]);

  // Notification listeners
  useEffect(() => {
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

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          const data = response.notification.request.content.data;
          const actionId = response.actionIdentifier;
          const notificationId = response.notification.request.identifier;
          const medicationName = data.medicationName as string;

          if (data.isAlarm) {
            if (actionId === 'SNOOZE_5') {
              await dismissAlarm(notificationId);
              await snoozeAlarm(medicationName, 5);
              setShowAlarm(false);
              setCurrentAlarm(null);
            } else if (actionId === 'SNOOZE_10') {
              await dismissAlarm(notificationId);
              await snoozeAlarm(medicationName, 10);
              setShowAlarm(false);
              setCurrentAlarm(null);
            } else if (
              actionId === 'DISMISS' ||
              actionId === Notifications.DEFAULT_ACTION_IDENTIFIER
            ) {
              await dismissAlarm(notificationId);
            }
          }
        }
      );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const handleDismiss = async () => {
    if (currentAlarm) {
      await dismissAlarm(currentAlarm.notificationId);
    }
    setShowAlarm(false);
    setCurrentAlarm(null);
  };

  const handleSnooze = async (medicationName: string, minutes: number) => {
    if (currentAlarm) {
      await dismissAlarm(currentAlarm.notificationId);
      await snoozeAlarm(medicationName, minutes);
    }
    setShowAlarm(false);
    setCurrentAlarm(null);
  };

  const handleNavigate = (screen: string) => {
    // Handle navigation from Home screen quick actions
    if (screen === 'Scan') {
      setActiveTab('scan');
      return;
    }
    if (screen === 'Schedule') {
      setActiveTab('schedule');
      return;
    }
    if (screen === 'Chat') {
      setActiveTab('chat');
      return;
    }
    if (!profileSubScreens.includes(screen as Exclude<SubScreen, null>)) {
      console.warn(`Unknown profile sub-screen: ${screen}`);
      return;
    }
    // Profile sub-screens
    setSubScreen(screen as SubScreen);
    if (activeTab !== 'profile') {
      setActiveTab('profile');
    }
  };

  const handleSubScreenBack = () => {
    setSubScreen(null);
  };

  const renderContent = () => {
    // If a sub-screen is active in profile tab
    if (subScreen) {
      switch (subScreen) {
        case 'AccessibilitySettings':
          return <AccessibilitySettingsScreen onBack={handleSubScreenBack} />;
        case 'SecuritySettings':
          return <SecuritySettingsScreen onBack={handleSubScreenBack} />;
        case 'CaregiverDashboard':
          return <CaregiverDashboardScreen onBack={handleSubScreenBack} />;
        case 'CaregiverInvite':
          return <CaregiverInviteScreen onBack={handleSubScreenBack} />;
        case 'EmergencyProtocol':
          return <EmergencyProtocolScreen onBack={handleSubScreenBack} />;
        case 'EmergencyContacts':
          return <EmergencyContactsScreen onBack={handleSubScreenBack} />;
        case 'PharmacyList':
          return <PharmacyScreen onBack={handleSubScreenBack} />;
        case 'ManageProfiles':
          return <ManageProfilesScreen onBack={handleSubScreenBack} />;
        case 'CulturalNotes':
          return <CulturalNotesScreen onBack={handleSubScreenBack} />;
        default:
          return <ProfileScreen onNavigate={handleNavigate} onBack={onBack} />;
      }
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'schedule':
        return <ScheduleScreen />;
      case 'scan':
        return (
          <NavigationContainer independent={true}>
            <CameraStackScreen />
          </NavigationContainer>
        );
      case 'chat':
        return <ChatScreen initialDrugName={chatDrugName || undefined} />;
      case 'profile':
        return <ProfileScreen onNavigate={handleNavigate} onBack={onBack} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  const handleTabChange = (tab: Tab) => {
    setSubScreen(null);
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderContent()}</View>

      {!subScreen && (
        <BottomTabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}

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
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
});
