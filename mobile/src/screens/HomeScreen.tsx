import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import ProfileSwitcher from '../components/ProfileSwitcher';
import { useProfiles } from '../contexts/ProfileContext';
import StatusChip from '../components/ui/StatusChip';
import SectionCard from '../components/ui/SectionCard';

interface HomeScreenProps {
  onNavigate?: (screen: string) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { activeProfile } = useProfiles();

  // Demo data - in production this would come from API/context
  const [todayProgress, setTodayProgress] = useState({
    total: 4,
    taken: 2,
    missed: 1,
    upcoming: 1,
  });

  const [missedMedications, setMissedMedications] = useState([
    { id: '1', name: 'Aspirin 100mg', time: '8:00 AM' },
  ]);

  const nextMedication = {
    name: 'Metformin 500mg',
    time: '2:00 PM',
    status: 'upcoming' as const,
  };

  const handleTakeNow = useCallback((medId: string, medName: string) => {
    Alert.alert(
      'Confirm',
      `Mark "${medName}" as taken now?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Taken',
          onPress: () => {
            setMissedMedications((prev) => prev.filter((m) => m.id !== medId));
            setTodayProgress((prev) => ({
              ...prev,
              taken: prev.taken + 1,
              missed: Math.max(0, prev.missed - 1),
            }));
          },
        },
      ]
    );
  }, []);

  const progressPercent = todayProgress.total > 0
    ? Math.round((todayProgress.taken / todayProgress.total) * 100)
    : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <ProfileSwitcher />
        </View>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => onNavigate?.('EmergencyProtocol')}
          activeOpacity={0.7}
          accessibilityLabel="Emergency"
          accessibilityHint="Opens emergency protocols"
        >
          <Ionicons name="warning" size={20} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Progress */}
        <SectionCard title="Today's Medications">
          <View style={styles.progressRow}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressNumber}>
                {todayProgress.taken}/{todayProgress.total}
              </Text>
              <Text style={styles.progressLabel}>{progressPercent}%</Text>
            </View>
            <View style={styles.progressStats}>
              <View style={styles.statRow}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <Text style={styles.statText}>{todayProgress.taken} taken</Text>
              </View>
              <View style={styles.statRow}>
                <Ionicons name="close-circle" size={16} color={theme.colors.danger} />
                <Text style={styles.statText}>{todayProgress.missed} missed</Text>
              </View>
              <View style={styles.statRow}>
                <Ionicons name="time" size={16} color={theme.colors.primary} />
                <Text style={styles.statText}>{todayProgress.upcoming} upcoming</Text>
              </View>
            </View>
          </View>
        </SectionCard>

        {/* Missed Medication Warning */}
        {missedMedications.length > 0 && (
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="alert-circle" size={20} color={theme.colors.danger} />
              <Text style={styles.warningTitle}>Missed Medication</Text>
            </View>
            {missedMedications.map((med) => (
              <View key={med.id} style={styles.missedItem}>
                <View>
                  <Text style={styles.missedName}>{med.name}</Text>
                  <Text style={styles.missedTime}>Scheduled at {med.time}</Text>
                </View>
                <TouchableOpacity
                  style={styles.takeNowButton}
                  activeOpacity={0.7}
                  onPress={() => handleTakeNow(med.id, med.name)}
                >
                  <Text style={styles.takeNowText}>Take Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Next Medication */}
        <SectionCard title="Coming Up Next">
          <View style={styles.nextMedRow}>
            <View style={styles.nextMedInfo}>
              <Text style={styles.nextMedName}>{nextMedication.name}</Text>
              <Text style={styles.nextMedTime}>{nextMedication.time}</Text>
            </View>
            <StatusChip status={nextMedication.status} />
          </View>
        </SectionCard>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => onNavigate?.('Scan')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="scan" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Scan Prescription</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => onNavigate?.('Schedule')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.successLight }]}>
              <Ionicons name="calendar" size={24} color={theme.colors.success} />
            </View>
            <Text style={styles.quickActionLabel}>View Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => onNavigate?.('Chat')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.warningLight }]}>
              <Ionicons name="chatbubble-ellipses" size={24} color={theme.colors.warning} />
            </View>
            <Text style={styles.quickActionLabel}>Ask MedGuide</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => onNavigate?.('PharmacyList')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="medkit" size={24} color="#16A34A" />
            </View>
            <Text style={styles.quickActionLabel}>My Pharmacy</Text>
          </TouchableOpacity>
        </View>

        {/* Caregiver Status */}
        <SectionCard title="Caregiver Access">
          <View style={styles.caregiverRow}>
            <View style={styles.caregiverInfo}>
              <Text style={styles.caregiverName}>No caregivers added</Text>
              <Text style={styles.caregiverSubtext}>
                Add a caregiver to share your medication status
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onNavigate?.('CaregiverInvite')}
              activeOpacity={0.7}
            >
              <Ionicons name="person-add" size={16} color={theme.colors.primary} />
              <Text style={styles.addButtonText}> Add</Text>
            </TouchableOpacity>
          </View>
        </SectionCard>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.base,
    paddingBottom: theme.spacing.md,
  },
  greeting: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  emergencyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  progressNumber: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  progressLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  progressStats: {
    marginLeft: theme.spacing.xl,
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  statText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  warningCard: {
    backgroundColor: theme.colors.dangerLight,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  warningTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.danger,
  },
  missedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missedName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  missedTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  takeNowButton: {
    backgroundColor: theme.colors.danger,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  takeNowText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  nextMedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextMedInfo: {
    flex: 1,
  },
  nextMedName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  nextMedTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  quickAction: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.card,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickActionLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  caregiverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caregiverInfo: {
    flex: 1,
  },
  caregiverName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  caregiverSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  addButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
