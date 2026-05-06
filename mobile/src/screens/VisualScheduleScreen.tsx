import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme';
import ProfileSwitcher from '../components/ProfileSwitcher';
import StatusChip from '../components/ui/StatusChip';
import LargeActionButton from '../components/ui/LargeActionButton';
import { MedicationStatus } from '../types/models';

type ViewMode = 'today' | 'weekly' | 'timeline';

interface ScheduleItemData {
  id: string;
  medicationName: string;
  dose: string;
  time: string;
  timeLabel: string;
  status: MedicationStatus;
  profileName: string;
  color: string;
  notes?: string;
}

// Demo data
const demoSchedule: ScheduleItemData[] = [
  {
    id: '1',
    medicationName: 'Aspirin',
    dose: '100mg',
    time: '08:00',
    timeLabel: '8:00 AM',
    status: 'missed',
    profileName: 'Me',
    color: theme.colors.danger,
  },
  {
    id: '2',
    medicationName: 'Metformin',
    dose: '500mg',
    time: '12:00',
    timeLabel: '12:00 PM',
    status: 'taken',
    profileName: 'Me',
    color: theme.colors.success,
  },
  {
    id: '3',
    medicationName: 'Lisinopril',
    dose: '10mg',
    time: '14:00',
    timeLabel: '2:00 PM',
    status: 'due_now',
    profileName: 'Me',
    color: theme.colors.warning,
  },
  {
    id: '4',
    medicationName: 'Vitamin D',
    dose: '1000 IU',
    time: '18:00',
    timeLabel: '6:00 PM',
    status: 'upcoming',
    profileName: 'Me',
    color: theme.colors.primary,
  },
  {
    id: '5',
    medicationName: 'Atorvastatin',
    dose: '20mg',
    time: '21:00',
    timeLabel: '9:00 PM',
    status: 'upcoming',
    profileName: 'Me',
    color: theme.colors.primary,
  },
];

const timeGroups = [
  { label: 'Morning', icon: '🌅', range: ['06:00', '12:00'] },
  { label: 'Afternoon', icon: '☀️', range: ['12:00', '18:00'] },
  { label: 'Evening', icon: '🌙', range: ['18:00', '24:00'] },
];

export default function VisualScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<ViewMode>('today');

  const getStatusBorderColor = (status: MedicationStatus) => {
    switch (status) {
      case 'taken': return theme.colors.success;
      case 'missed': return theme.colors.danger;
      case 'due_now': return theme.colors.warning;
      case 'taken_late': return theme.colors.warning;
      case 'skipped': return theme.colors.statusSkipped;
      default: return theme.colors.primary;
    }
  };

  const groupedSchedule = timeGroups.map((group) => ({
    ...group,
    items: demoSchedule.filter(
      (item) => item.time >= group.range[0] && item.time < group.range[1]
    ),
  }));

  const renderScheduleCard = (item: ScheduleItemData) => {
    const borderColor = getStatusBorderColor(item.status);
    const isDueNow = item.status === 'due_now';

    return (
      <View
        key={item.id}
        style={[
          styles.scheduleCard,
          { borderLeftColor: borderColor, borderLeftWidth: 4 },
          isDueNow && styles.dueNowCard,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={[styles.medName, isDueNow && styles.dueNowText]}>
              {item.medicationName}
            </Text>
            <Text style={styles.medDose}>{item.dose}</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.medTime}>{item.timeLabel}</Text>
            <StatusChip status={item.status} />
          </View>
        </View>

        {/* Action buttons for actionable states */}
        {(item.status === 'due_now' || item.status === 'missed' || item.status === 'upcoming') && (
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <Text style={styles.actionBtnTextGreen}>✓ Taken</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <Text style={styles.actionBtnTextOrange}>⏰ Snooze</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <Text style={styles.actionBtnTextGray}>⊘ Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <Text style={styles.actionBtnTextBlue}>ℹ Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Schedule</Text>
          <ProfileSwitcher />
        </View>

        {/* View Mode Tabs */}
        <View style={styles.viewTabs}>
          {(['today', 'weekly', 'timeline'] as ViewMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.viewTab, viewMode === mode && styles.viewTabActive]}
              onPress={() => setViewMode(mode)}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewTabText, viewMode === mode && styles.viewTabTextActive]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Schedule Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Bar */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryCount, { color: theme.colors.success }]}>2</Text>
            <Text style={styles.summaryLabel}>Taken</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryCount, { color: theme.colors.danger }]}>1</Text>
            <Text style={styles.summaryLabel}>Missed</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryCount, { color: theme.colors.primary }]}>2</Text>
            <Text style={styles.summaryLabel}>Upcoming</Text>
          </View>
        </View>

        {/* Grouped by time of day */}
        {groupedSchedule.map((group) => {
          if (group.items.length === 0) return null;
          return (
            <View key={group.label} style={styles.timeGroup}>
              <View style={styles.timeGroupHeader}>
                <Text style={styles.timeGroupIcon}>{group.icon}</Text>
                <Text style={styles.timeGroupLabel}>{group.label}</Text>
                <Text style={styles.timeGroupCount}>{group.items.length} medications</Text>
              </View>
              {group.items.map(renderScheduleCard)}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.base,
    paddingBottom: theme.spacing.md,
    borderBottomLeftRadius: theme.radius['2xl'],
    borderBottomRightRadius: theme.radius['2xl'],
    ...theme.shadows.card,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  viewTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.lg,
    padding: 4,
  },
  viewTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm + 2,
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
  viewTabActive: {
    backgroundColor: theme.colors.primary,
  },
  viewTabText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  viewTabTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.semibold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  timeGroup: {
    marginBottom: theme.spacing.xl,
  },
  timeGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  timeGroupIcon: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  timeGroupLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  timeGroupCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  scheduleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
  },
  dueNowCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
  },
  medName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  dueNowText: {
    color: theme.colors.warning,
  },
  medDose: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  medTime: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
  },
  actionBtnTextGreen: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.success,
  },
  actionBtnTextOrange: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.warning,
  },
  actionBtnTextGray: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  actionBtnTextBlue: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
});
