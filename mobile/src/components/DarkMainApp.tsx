import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
            {/* Header with gradient feel */}
            <View
              style={[
                styles.settingsHeader,
                { paddingTop: Math.max(insets.top, theme.spacing.base) + theme.spacing.sm },
              ]}
            >
              <View style={[styles.headerInner, { paddingHorizontal: containerPadding }]}>
                <Text style={styles.settingsTitle}>{t('settings.title')}</Text>
              </View>
            </View>

            <ScrollView
              style={styles.settingsScroll}
              contentContainerStyle={[
                styles.settingsContent,
                { paddingHorizontal: containerPadding },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* Preferences */}
              <Text style={styles.sectionLabel}>Preferences</Text>
              <View style={styles.settingsCard}>
                <TouchableOpacity style={styles.settingsRow} onPress={onBack}>
                  <View style={styles.settingsRowLeft}>
                    <View style={styles.settingsIconBubble}>
                      <View style={styles.globeIcon}>
                        <View style={styles.globeCircle} />
                        <View style={styles.globeLineH} />
                        <View style={styles.globeLineV} />
                      </View>
                    </View>
                    <View style={styles.settingsRowText}>
                      <Text style={styles.settingsRowTitle}>
                        {t('settings.changeLanguage')}
                      </Text>
                      <Text style={styles.settingsRowSubtitle}>
                        Select your preferred language
                      </Text>
                    </View>
                  </View>
                  <View style={styles.chevron}>
                    <View style={styles.chevronTop} />
                    <View style={styles.chevronBottom} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* About */}
              <Text style={styles.sectionLabel}>About</Text>
              <View style={styles.settingsCard}>
                <View style={styles.aboutRow}>
                  <Text style={styles.aboutLabel}>Application</Text>
                  <Text style={styles.aboutValue}>MedGuide</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.aboutRow}>
                  <Text style={styles.aboutLabel}>Version</Text>
                  <Text style={styles.aboutValue}>2.0.0</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.aboutRow}>
                  <Text style={styles.aboutLabel}>Purpose</Text>
                  <Text style={styles.aboutValue}>Medication Assistant</Text>
                </View>
              </View>

              {/* Disclaimer */}
              <View style={styles.disclaimerCard}>
                <Text style={styles.disclaimerText}>
                  MedGuide is designed to assist with medication information. Always consult your healthcare provider for medical advice.
                </Text>
              </View>
            </ScrollView>
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

  // Settings
  settingsScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  settingsHeader: {
    backgroundColor: theme.colors.card,
    paddingBottom: theme.spacing.lg,
    borderBottomLeftRadius: theme.radius['2xl'],
    borderBottomRightRadius: theme.radius['2xl'],
    ...theme.shadows.card,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
  },
  settingsScroll: {
    flex: 1,
  },
  settingsContent: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: theme.spacing.xs,
  },
  settingsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.base,
  },
  settingsIconBubble: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsRowText: {
    flex: 1,
  },
  settingsRowTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
  },
  settingsRowSubtitle: {
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
  chevronTop: {
    width: 7,
    height: 1.5,
    backgroundColor: theme.colors.mutedForeground,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateY: -1.5 }],
  },
  chevronBottom: {
    width: 7,
    height: 1.5,
    backgroundColor: theme.colors.mutedForeground,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateY: 1.5 }],
  },
  aboutRow: {
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
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  disclaimerCard: {
    marginTop: theme.spacing['2xl'],
    backgroundColor: theme.colors.secondaryLight,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
  },
  disclaimerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    lineHeight:
      theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },

  // Globe icon
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
