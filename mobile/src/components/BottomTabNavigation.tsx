import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../styles/theme';

export type Tab = 'home' | 'schedule' | 'scan' | 'chat' | 'profile';

interface BottomTabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

interface TabConfig {
  key: Tab;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const tabs: TabConfig[] = [
  {
    key: 'home',
    labelKey: 'navigation.home',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    key: 'schedule',
    labelKey: 'navigation.schedule',
    icon: 'calendar-outline',
    activeIcon: 'calendar',
  },
  {
    key: 'scan',
    labelKey: 'navigation.scan',
    icon: 'scan-outline',
    activeIcon: 'scan',
  },
  {
    key: 'chat',
    labelKey: 'navigation.chat',
    icon: 'chatbubble-ellipses-outline',
    activeIcon: 'chatbubble-ellipses',
  },
  {
    key: 'profile',
    labelKey: 'navigation.profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
];

export default function BottomTabNavigation({
  activeTab,
  onTabChange,
}: BottomTabNavigationProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const label = t(tab.labelKey);
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={label}
            >
              <View
                style={[
                  styles.iconContainer,
                  isActive && styles.iconContainerActive,
                ]}
              >
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={22}
                  color={
                    isActive
                      ? theme.colors.navActive
                      : theme.colors.navInactiveText
                  }
                />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {label}
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
