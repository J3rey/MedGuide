import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import theme from "../styles/theme";

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning</Text>
        <Text style={styles.screenTitle}>Dashboard</Text>
      </View>

      <View style={styles.statsContainer}>
        <View
          style={[styles.statCard, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </View>
        <View
          style={[styles.statCard, { backgroundColor: theme.colors.chart1 }]}
        >
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>💊</Text>
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>Welcome to MedGuide</Text>
            <Text style={styles.cardDescription}>
              Scan prescriptions and check medication compatibility instantly
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No recent scans</Text>
          <Text style={styles.emptyDescription}>
            Start by scanning your first prescription
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.base,
  },
  header: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.sm,
  },
  greeting: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  screenTitle: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    letterSpacing: -0.5,
  },
  statsContainer: {
    flexDirection: "row",
    gap: theme.spacing.base,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    ...theme.shadows.base,
  },
  statNumber: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: "#ffffff",
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: theme.typography.fontWeight.medium,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  cardDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    lineHeight:
      theme.typography.fontSize.base * theme.typography.lineHeight.normal,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.base,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
  },
  seeAll: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontWeight: theme.typography.fontWeight.medium,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  emptyDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    textAlign: "center",
  },
});
