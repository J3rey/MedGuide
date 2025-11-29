import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import theme from "../styles/theme";

// Mock data for demonstration
const mockHistory = [
  {
    id: 1,
    date: "Nov 28, 2025",
    medications: ["Aspirin 100mg", "Lisinopril 10mg"],
    status: "safe",
  },
  {
    id: 2,
    date: "Nov 25, 2025",
    medications: ["Metformin 500mg"],
    status: "safe",
  },
  {
    id: 3,
    date: "Nov 20, 2025",
    medications: ["Warfarin 5mg", "Aspirin 100mg"],
    status: "warning",
  },
];

export default function HistoryScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>History</Text>
        <Text style={styles.subtitle}>Your medication scan history</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {mockHistory.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No scan history yet</Text>
            <Text style={styles.emptyDescription}>
              Your scanned prescriptions will appear here
            </Text>
          </View>
        ) : (
          mockHistory.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyCard}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.statusIndicator,
                    item.status === "safe"
                      ? styles.statusSafe
                      : styles.statusWarning,
                  ]}
                />
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              <View style={styles.medicationList}>
                {item.medications.map((med, index) => (
                  <View key={index} style={styles.medicationItem}>
                    <Text style={styles.medicationBullet}>•</Text>
                    <Text style={styles.medicationText}>{med}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <Text
                  style={[
                    styles.statusText,
                    item.status === "safe"
                      ? styles.statusTextSafe
                      : styles.statusTextWarning,
                  ]}
                >
                  {item.status === "safe"
                    ? "✓ No interactions"
                    : "⚠ Potential interaction"}
                </Text>
                <Text style={styles.viewDetails}>View details →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  screenTitle: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  emptyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing["3xl"],
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  historyCard: {
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
    marginBottom: theme.spacing.md,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  statusSafe: {
    backgroundColor: "#10b981",
  },
  statusWarning: {
    backgroundColor: "#f59e0b",
  },
  dateText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontWeight: theme.typography.fontWeight.medium,
  },
  medicationList: {
    marginBottom: theme.spacing.md,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.xs,
  },
  medicationBullet: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    marginRight: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  medicationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.foreground,
    fontWeight: theme.typography.fontWeight.medium,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  statusTextSafe: {
    color: "#10b981",
  },
  statusTextWarning: {
    color: "#f59e0b",
  },
  viewDetails: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
