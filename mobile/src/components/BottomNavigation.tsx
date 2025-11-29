import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import theme from "../styles/theme";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({
  activeTab,
  onTabChange,
}: BottomNavigationProps) {
  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "scan", label: "Scan", icon: "📷" },
    { id: "history", label: "History", icon: "📋" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                isActive && styles.activeIconContainer,
              ]}
            >
              <Text style={styles.icon}>{tab.icon}</Text>
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingBottom: Platform.OS === "ios" ? theme.spacing.xl : theme.spacing.sm,
    ...theme.shadows.md,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
  activeTab: {
    // Additional styling for active tab if needed
  },
  iconContainer: {
    width: 48,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xs,
  },
  activeIconContainer: {
    backgroundColor: theme.colors.muted,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
    fontWeight: theme.typography.fontWeight.medium,
  },
  activeLabel: {
    color: theme.colors.foreground,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
