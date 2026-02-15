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

export default function DarkBottomNavigation({
  activeTab,
  onTabChange,
}: DarkBottomNavigationProps): React.JSX.Element {
  const { t } = useTranslation();

  const tabs = [
    { id: 'schedule' as Tab, label: t('navigation.schedule'), icon: '⏰' },
    { id: 'camera' as Tab, label: t('navigation.camera'), icon: '📷' },
    { id: 'chat' as Tab, label: t('navigation.chat'), icon: '💬' },
    { id: 'settings' as Tab, label: t('navigation.settings'), icon: '⚙️' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>{tab.icon}</Text>
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
    backgroundColor: theme.darkColors.card,
    borderTopWidth: 1,
    borderTopColor: theme.darkColors.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: theme.spacing.base,
    width: '100%',
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: 4,
    borderRadius: theme.radius.lg,
    maxWidth: 100,
  },
  activeTab: {
    backgroundColor: theme.darkColors.accent,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: 11,
    color: theme.darkColors.mutedForeground,
    textAlign: 'center',
    width: '100%',
  },
  activeLabel: {
    color: theme.darkColors.primary,
  },
});
