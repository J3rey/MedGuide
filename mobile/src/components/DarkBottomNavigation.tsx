import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme';
import { ScheduleIcon, CameraIcon, ChatIcon, SettingsIcon } from './TabIcons';

type Tab = 'schedule' | 'camera' | 'chat' | 'settings';

interface DarkBottomNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

interface TabItemProps {
  id: Tab;
  label: string;
  Icon: React.ComponentType<{
    active: boolean;
  }>;
  isActive: boolean;
  onPress: () => void;
}

function TabItem({ label, Icon, isActive, onPress }: TabItemProps) {
  return (
    <TouchableOpacity
      style={[styles.tab, isActive && styles.activeTab]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={label}
    >
      <Icon active={isActive} />
      {isActive ? (
        <Text style={styles.activeLabelText}>{label}</Text>
      ) : (
        <Text style={styles.inactiveLabel}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function DarkBottomNavigation({
  activeTab,
  onTabChange,
}: DarkBottomNavigationProps): React.JSX.Element {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const tabs = [
    {
      id: 'schedule' as Tab,
      label: t('navigation.schedule'),
      Icon: ScheduleIcon,
    },
    { id: 'camera' as Tab, label: t('navigation.camera'), Icon: CameraIcon },
    { id: 'chat' as Tab, label: t('navigation.chat'), Icon: ChatIcon },
    {
      id: 'settings' as Tab,
      label: t('navigation.settings'),
      Icon: SettingsIcon,
    },
  ];

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, theme.spacing.sm) },
      ]}
    >
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            id={tab.id}
            label={tab.label}
            Icon={tab.Icon}
            isActive={activeTab === tab.id}
            onPress={() => onTabChange(tab.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.navBar,
    borderTopWidth: 1,
    borderTopColor: theme.colors.navBarBorder,
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.elevated,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 52,
  },
  tab: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    gap: theme.spacing.xs,
    minWidth: 56,
  },
  activeTab: {
    flexDirection: 'row',
    backgroundColor: theme.colors.navPill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  activeLabelText: {
    color: theme.colors.navPillText,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  inactiveLabel: {
    color: theme.colors.navInactiveText,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
});
