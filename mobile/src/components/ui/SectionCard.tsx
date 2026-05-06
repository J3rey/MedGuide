import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import theme from '../../styles/theme';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function SectionCard({
  title,
  subtitle,
  children,
  style,
}: SectionCardProps) {
  return (
    <View style={[styles.card, style]}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    ...theme.shadows.card,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
