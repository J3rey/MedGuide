import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import theme from "../styles/theme";

type Tab = "schedule" | "camera" | "chat";

interface DarkBottomNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function DarkBottomNavigation({
  activeTab,
  onTabChange,
}: DarkBottomNavigationProps) {
  const tabs = [
    { id: "schedule" as Tab, label: "Schedule", icon: "⏰" },
    { id: "camera" as Tab, label: "Camera", icon: "📷" },
    { id: "chat" as Tab, label: "Chat", icon: "💬" },
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
              <Text style={[styles.label, isActive && styles.activeLabel]}>
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
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    maxWidth: 500,
    marginHorizontal: "auto",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
  },
  tab: {
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.lg,
  },
  activeTab: {
    backgroundColor: theme.darkColors.accent,
  },
  icon: {
    fontSize: 28,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.darkColors.mutedForeground,
  },
  activeLabel: {
    color: theme.darkColors.primary,
  },
});
