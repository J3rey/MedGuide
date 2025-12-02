import React from "react";
import { View, Text, StyleSheet } from "react-native";
import theme from "../styles/theme";

export default function ScheduleScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⏰</Text>
        <Text style={styles.title}>Schedule & Alarms</Text>
        <Text style={styles.description}>Set medication reminders</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.darkColors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  icon: {
    fontSize: 80,
    marginBottom: theme.spacing.base,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.darkColors.foreground,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.darkColors.mutedForeground,
  },
});
