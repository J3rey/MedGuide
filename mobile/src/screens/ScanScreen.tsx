import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import theme from "../styles/theme";

export default function ScanScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Scan Prescription</Text>
        <Text style={styles.subtitle}>
          Take a photo or upload an image of your prescription
        </Text>
      </View>

      <TouchableOpacity style={styles.scanArea} activeOpacity={0.7}>
        <View style={styles.scanCircle}>
          <Text style={styles.scanIcon}>📷</Text>
        </View>
        <Text style={styles.scanText}>Tap to scan</Text>
        <Text style={styles.scanHint}>or drag and drop an image</Text>
      </TouchableOpacity>

      <View style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipTitle}>Tips for better scanning</Text>
        </View>
        <View style={styles.tipList}>
          <Text style={styles.tipItem}>• Ensure good lighting</Text>
          <Text style={styles.tipItem}>• Keep prescription flat</Text>
          <Text style={styles.tipItem}>• Avoid shadows and glare</Text>
          <Text style={styles.tipItem}>• Include all medication details</Text>
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
  screenTitle: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    lineHeight:
      theme.typography.fontSize.base * theme.typography.lineHeight.normal,
  },
  scanArea: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing["4xl"],
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    ...theme.shadows.base,
  },
  scanCircle: {
    width: 120,
    height: 120,
    backgroundColor: theme.colors.muted,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  scanIcon: {
    fontSize: 56,
  },
  scanText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  scanHint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  tipCard: {
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    marginTop: theme.spacing.xl,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  tipTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
  },
  tipList: {
    gap: theme.spacing.sm,
  },
  tipItem: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    lineHeight:
      theme.typography.fontSize.base * theme.typography.lineHeight.normal,
  },
});
