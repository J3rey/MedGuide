import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme';

export type Tab = 'home' | 'schedule' | 'scan' | 'chat' | 'profile';

interface BottomTabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

interface TabConfig {
  key: Tab;
  label: string;
  icon: string;
  activeIcon: string;
}

const tabs: TabConfig[] = [
  { key: 'home', label: 'Home', icon: '🏠', activeIcon: '🏠' },
  { key: 'schedule', label: 'Schedule', icon: '📅', activeIcon: '📅' },
  { key: 'scan', label: 'Scan', icon: '📷', activeIcon: '📷' },
  { key: 'chat', label: 'Chat', icon: '💬', activeIcon: '💬' },
  { key: 'profile', label: 'Profile', icon: '👤', activeIcon: '👤' },
];

export default function BottomTabNavigation({ activeTab, onTabChange }: BottomTabNavigationProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                <Text style={styles.icon}>{isActive ? tab.activeIcon : tab.icon}</Text>
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
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
    backgroundColor: theme.colors.navBar,
    borderTopWidth: 1,
    borderTopColor: theme.colors.navBarBorder,
    paddingTop: theme.spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    minHeight: theme.touchTargets.minimum,
    justifyContent: 'center',
  },
  tabActive: {},
  iconContainer: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconContainerActive: {
    backgroundColor: theme.colors.navActiveBackground,
    width: 52,
    borderRadius: 16,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.navInactiveText,
    marginTop: 2,
  },
  labelActive: {
    color: theme.colors.navActive,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
