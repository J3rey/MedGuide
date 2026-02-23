import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
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
    animatedValue?: Animated.Value;
  }>;
  isActive: boolean;
  onPress: () => void;
}

function TabItem({ label, Icon, isActive, onPress }: TabItemProps) {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1 : 0,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [isActive, scaleAnim]);

  const handlePress = () => {
    // Bounce animation on press
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 0,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const bounceScale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.85],
  });

  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={label}
    >
      <Animated.View
        style={[
          isActive ? styles.activeIconContainer : styles.iconContainer,
          { transform: [{ scale: bounceScale }] },
        ]}
      >
        <Icon active={isActive} animatedValue={scaleAnim} />
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          isActive && styles.activeLabel,
          {
            opacity: scaleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.6, 1],
            }),
          },
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

export default function DarkBottomNavigation({
  activeTab,
  onTabChange,
}: DarkBottomNavigationProps): React.JSX.Element {
  const { t } = useTranslation();

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
    <View style={styles.container}>
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
