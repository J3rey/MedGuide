import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

export type Tab = 'home' | 'schedule' | 'scan' | 'chat' | 'profile';

interface BottomTabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

interface TabConfig {
  key: Tab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const tabs: TabConfig[] = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'schedule', label: 'Schedule', icon: 'calendar-outline', activeIcon: 'calendar' },
  { key: 'scan', label: 'Scan', icon: 'scan-outline', activeIcon: 'scan' },
  { key: 'chat', label: 'Chat', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
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
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={22}
                  color={isActive ? theme.colors.navActive : theme.colors.navInactiveText}
                />
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
