import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import { EmptyState } from '../components/ui/StateViews';

interface CaregiverDashboardScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string) => void;
}

interface CaregiverStatusCardProps {
  name: string;
  relationship: string;
  medicationsTaken: number;
  medicationsTotal: number;
  missedCount: number;
  lastCheckIn: string;
  hasEmergencyAlert: boolean;
  phone?: string;
}

function CaregiverStatusCard({
  name,
  relationship,
  medicationsTaken,
  medicationsTotal,
  missedCount,
  lastCheckIn,
  hasEmergencyAlert,
  phone,
}: CaregiverStatusCardProps) {
  const completionPercent = medicationsTotal > 0 ? Math.round((medicationsTaken / medicationsTotal) * 100) : 0;

  return (
    <View style={[styles.statusCard, hasEmergencyAlert && styles.emergencyCard]}>
      {hasEmergencyAlert && (
        <View style={styles.emergencyBanner}>
          <Ionicons name="warning" size={16} color={theme.colors.emergency} />
          <Text style={styles.emergencyBannerText}>Emergency Alert Active</Text>
        </View>
      )}

      <View style={styles.statusHeader}>
        <View style={styles.statusAvatar}>
          <Text style={styles.statusAvatarText}>{name.charAt(0)}</Text>
        </View>
        <View style={styles.statusInfo}>
          <Text style={styles.statusName}>{name}</Text>
          <Text style={styles.statusRelationship}>{relationship}</Text>
        </View>
      </View>

      {/* Completion Status */}
      <View style={styles.completionRow}>
        <View style={styles.completionBar}>
          <View style={[styles.completionFill, { width: `${completionPercent}%` }]} />
        </View>
        <Text style={styles.completionText}>
          {medicationsTaken}/{medicationsTotal} taken today ({completionPercent}%)
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {missedCount > 0 && (
          <View style={styles.statBadge}>
            <Ionicons name="close-circle" size={14} color={theme.colors.danger} />
            <Text style={styles.statBadgeText}>{missedCount} missed</Text>
          </View>
        )}
        <Text style={styles.lastCheckIn}>Last check-in: {lastCheckIn}</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => phone && Linking.openURL(`tel:${phone}`)}
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={20} color={theme.colors.primary} />
          <Text style={styles.quickActionLabel}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => phone && Linking.openURL(`sms:${phone}`)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble" size={20} color={theme.colors.primary} />
          <Text style={styles.quickActionLabel}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.7}>
          <Ionicons name="document-text" size={20} color={theme.colors.primary} />
          <Text style={styles.quickActionLabel}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CaregiverDashboardScreen({ onBack, onNavigate }: CaregiverDashboardScreenProps) {
  const insets = useSafeAreaInsets();

  // Demo data - in production this would come from the caregiver service
  const caregiverProfiles = [
    {
      name: 'Mum',
      relationship: 'Parent',
      medicationsTaken: 3,
      medicationsTotal: 5,
      missedCount: 1,
      lastCheckIn: '2 hours ago',
      hasEmergencyAlert: false,
      phone: '+61400000000',
    },
  ];

  const hasCaregiverAccess = caregiverProfiles.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Caregiver Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Monitor medication status for people you care for
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {hasCaregiverAccess ? (
          <>
            {caregiverProfiles.map((profile, index) => (
              <CaregiverStatusCard key={index} {...profile} />
            ))}

            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => onNavigate?.('CaregiverPermissions')}
              activeOpacity={0.7}
            >
              <Ionicons name="settings" size={18} color={theme.colors.primary} />
              <Text style={styles.manageButtonText}>Manage Permissions</Text>
            </TouchableOpacity>
          </>
        ) : (
          <EmptyState
            title="No Caregiver Access"
            message="You haven't been added as a caregiver for anyone yet. Ask a family member to invite you."
            actionLabel="Learn More"
            onAction={() => {}}
          />
        )}
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
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
  },
  statusCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    ...theme.shadows.card,
  },
  emergencyCard: {
    borderWidth: 2,
    borderColor: theme.colors.emergency,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.emergencyLight,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  emergencyBannerText: {
    color: theme.colors.emergency,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  statusAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusAvatarText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  statusInfo: {
    marginLeft: theme.spacing.md,
  },
  statusName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  statusRelationship: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  completionRow: {
    marginBottom: theme.spacing.md,
  },
  completionBar: {
    height: 8,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: 4,
    marginBottom: theme.spacing.xs,
  },
  completionFill: {
    height: 8,
    backgroundColor: theme.colors.success,
    borderRadius: 4,
  },
  completionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
    gap: theme.spacing.md,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.dangerLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    gap: theme.spacing.xs,
  },
  statBadgeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.danger,
    fontWeight: theme.typography.fontWeight.medium,
  },
  lastCheckIn: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.xs,
  },
  quickActionLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: theme.spacing.base,
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  manageButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
