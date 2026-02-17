import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import theme from '../styles/theme';

type Tab = 'schedule' | 'camera' | 'chat' | 'settings';

interface DarkBottomNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

// Simple icon components using unicode symbols (non-emoji)
const ScheduleIcon = ({ active }: { active: boolean }) => (
  <View style={styles.iconShape}>
    <View style={[styles.iconCircle, active && styles.iconCircleActive]} />
  </View>
);

const CameraIcon = ({ active }: { active: boolean }) => (
  <View style={styles.iconShape}>
    <View style={[styles.iconSquare, active && styles.iconSquareActive]} />
  </View>
);

const ChatIcon = ({ active }: { active: boolean }) => (
  <View style={styles.iconShape}>
    <View style={[styles.iconBubble, active && styles.iconBubbleActive]} />
  </View>
);

const SettingsIcon = ({ active }: { active: boolean }) => (
  <View style={styles.iconShape}>
    <View style={[styles.iconGear, active && styles.iconGearActive]} />
  </View>
);

export default function DarkBottomNavigation({
  activeTab,
  onTabChange,
}: DarkBottomNavigationProps): React.JSX.Element {
  const { t } = useTranslation();

  const tabs = [
    { id: 'schedule' as Tab, label: t('navigation.schedule'), Icon: ScheduleIcon },
    { id: 'camera' as Tab, label: t('navigation.camera'), Icon: CameraIcon },
    { id: 'chat' as Tab, label: t('navigation.chat'), Icon: ChatIcon },
    { id: 'settings' as Tab, label: t('navigation.settings'), Icon: SettingsIcon },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab]}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
            >
              <View style={isActive ? styles.activeIconContainer : styles.iconContainer}>
                <tab.Icon active={isActive} />
              </View>
              <Text
                style={[styles.label, isActive && styles.activeLabel]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    width: '100%',
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: theme.spacing.xs,
    maxWidth: 100,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconShape: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.mutedForeground,
  },
  iconCircleActive: {
    borderColor: theme.colors.primaryForeground,
  },
  iconSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.mutedForeground,
  },
  iconSquareActive: {
    borderColor: theme.colors.primaryForeground,
  },
  iconBubble: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.mutedForeground,
  },
  iconBubbleActive: {
    borderColor: theme.colors.primaryForeground,
  },
  iconGear: {
    width: 18,
    height: 18,
    borderRadius: 3,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.mutedForeground,
  },
  iconGearActive: {
    borderColor: theme.colors.primaryForeground,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    width: '100%',
    fontWeight: theme.typography.fontWeight.medium,
  },
  activeLabel: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
