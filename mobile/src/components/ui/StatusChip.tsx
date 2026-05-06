import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../styles/theme';
import { MedicationStatus } from '../../types/models';

interface StatusChipProps {
  status: MedicationStatus;
  label?: string;
}

const statusConfig: Record<
  MedicationStatus,
  { bg: string; text: string; label: string }
> = {
  upcoming: {
    bg: theme.colors.primaryLight,
    text: theme.colors.primary,
    label: 'Upcoming',
  },
  due_now: {
    bg: theme.colors.warningLight,
    text: theme.colors.warning,
    label: 'Due Now',
  },
  taken: {
    bg: theme.colors.successLight,
    text: theme.colors.success,
    label: 'Taken',
  },
  taken_late: {
    bg: theme.colors.warningLight,
    text: theme.colors.warning,
    label: 'Taken Late',
  },
  missed: {
    bg: theme.colors.dangerLight,
    text: theme.colors.danger,
    label: 'Missed',
  },
  skipped: {
    bg: '#F3F4F6',
    text: theme.colors.statusSkipped,
    label: 'Skipped',
  },
  snoozed: {
    bg: theme.colors.primaryLight,
    text: theme.colors.primary,
    label: 'Snoozed',
  },
};

export default function StatusChip({ status, label }: StatusChipProps) {
  const config = statusConfig[status];

  return (
    <View style={[styles.chip, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.label, { color: config.text }]}>
        {label || config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.radius.full,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs + 2,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
