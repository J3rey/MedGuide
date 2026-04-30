import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import DarkBottomNavigation from './DarkBottomNavigation';
import ScheduleScreen from '../screens/ScheduleScreen';
import CameraScreen from '../screens/CameraScreen';
import ChatScreen from '../screens/ChatScreen';
import ScanResultsScreen from '../screens/ScanResultsScreen';
import ManualSearchScreen from '../screens/ManualSearchScreen';
import AlarmScreen from '../screens/AlarmScreen';
import { snoozeAlarm, dismissAlarm } from '../services/notificationService';
import { ScanProvider, useScan } from '../contexts/ScanContext';
import theme from '../styles/theme';
import { useTranslation } from 'react-i18next';
import { CameraStackParamList } from '../types/navigation';

type Tab = 'schedule' | 'camera' | 'chat' | 'settings';

interface DarkMainAppProps {
  onBack: () => void;
}

interface AlarmData {
  medicationName: string;
  notificationId: string;
}

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

function DarkMainAppContent({ onBack }: DarkMainAppProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('camera');
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
      setActiveTab('chat');
      setTimeout(() => setScannedDrug(null), 1000);
    }
  }, [scannedDrug, setScannedDrug]);

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

          if (data.isAlarm) {
            if (actionId === 'SNOOZE_5') {
              await handleSnooze(data.medicationName as string, 5);
            } else if (actionId === 'SNOOZE_10') {
              await handleSnooze(data.medicationName as string, 10);
            } else if (
              actionId === 'DISMISS' ||
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
      case 'schedule':
        return <ScheduleScreen />;
      case 'camera':
        return (
          <NavigationContainer independent={true}>
            <CameraStackScreen />
          </NavigationContainer>
        );
      case 'chat':
        return <ChatScreen initialDrugName={scannedDrug || undefined} />;
      case 'settings': {
        const containerPadding = screenWidth > 768 ? 48 : 24;
        return (
          <View style={styles.settingsScreen}>
            <View
              style={[
                styles.settingsHeader,
                { paddingTop: Math.max(insets.top, theme.spacing.base) },
              ]}
            >
              <View
                style={[
                  styles.headerContent,
                  { paddingHorizontal: containerPadding },
                ]}
              >
                <Text style={styles.settingsTitle}>
                  {t('settings.title')}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.settingsContent,
                { paddingHorizontal: containerPadding },
              ]}
            >
              {/* Preferences Section */}
              <Text style={styles.sectionLabel}>Preferences</Text>
              <View style={styles.settingsGroup}>
                <TouchableOpacity style={styles.settingsOption} onPress={onBack}>
                  <View style={styles.settingsOptionContent}>
                    <View style={styles.settingsIconContainer}>
                      <View style={styles.globeIcon}>
                        <View style={styles.globeCircle} />
                        <View style={styles.globeLineH} />
                        <View style={styles.globeLineV} />
                      </View>
                    </View>
                    <View style={styles.settingsTextContainer}>
                      <Text style={styles.settingsOptionText}>
                        {t('settings.changeLanguage')}
                      </Text>
                      <Text style={styles.settingsOptionSubtext}>
                        Select your preferred language
                      </Text>
                    </View>
                  </View>
                  <View style={styles.chevron}>
                    <View style={styles.chevronLine1} />
                    <View style={styles.chevronLine2} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* About Section */}
              <Text style={styles.sectionLabel}>About</Text>
              <View style={styles.settingsGroup}>
                <View style={styles.aboutItem}>
                  <Text style={styles.aboutLabel}>Application</Text>
                  <Text style={styles.aboutValue}>MedGuide</Text>
                </View>
                <View style={styles.aboutDivider} />
                <View style={styles.aboutItem}>
                  <Text style={styles.aboutLabel}>Version</Text>
                  <Text style={styles.aboutValue}>2.0.0</Text>
                </View>
                <View style={styles.aboutDivider} />
                <View style={styles.aboutItem}>
                  <Text style={styles.aboutLabel}>Purpose</Text>
                  <Text style={styles.aboutValue}>Medication Assistant</Text>
                </View>
              </View>

              {/* Disclaimer */}
              <View style={styles.disclaimerContainer}>
                <Text style={styles.disclaimerText}>
                  MedGuide is designed to assist with medication information. Always consult your healthcare provider for medical advice.
                </Text>
              </View>
            </View>
          </View>
        );
      }
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
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  settingsScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  settingsHeader: {
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
  },
  settingsContent: {
    flex: 1,
    paddingTop: theme.spacing.base,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.base,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsGroup: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.surface,
  },
  settingsOption: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.base,
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsOptionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  settingsOptionSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.xs,
  },
  chevron: {
    width: 10,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronLine1: {
    width: 7,
    height: 1.5,
    backgroundColor: theme.colors.mutedForeground,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateY: -1.5 }],
  },
  chevronLine2: {
    width: 7,
    height: 1.5,
    backgroundColor: theme.colors.mutedForeground,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateY: 1.5 }],
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.lg,
  },
  aboutLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    fontWeight: theme.typography.fontWeight.medium,
  },
  aboutValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
  },
  aboutDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  disclaimerContainer: {
    marginTop: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.base,
  },
  disclaimerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    lineHeight:
      theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  // Globe icon for language
  globeIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  globeCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  globeLineH: {
    position: 'absolute',
    width: 16,
    height: 1.5,
    backgroundColor: theme.colors.primary,
    borderRadius: 1,
  },
  globeLineV: {
    position: 'absolute',
    width: 1.5,
    height: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: 1,
  },
});

export default function DarkMainApp(props: DarkMainAppProps) {
  return (
    <ScanProvider>
      <DarkMainAppContent {...props} />
    </ScanProvider>
  );
}
