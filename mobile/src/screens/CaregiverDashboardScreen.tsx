import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StateViews';
import SectionCard from '../components/ui/SectionCard';
import LargeActionButton from '../components/ui/LargeActionButton';
import { CaregiverPatient, caregiverApi } from '../services/api';

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
  const [patients, setPatients] = useState<CaregiverPatient[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAcceptingInvite, setIsAcceptingInvite] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const nextPatients = await caregiverApi.listMyPatients();
      setPatients(nextPatients);
    } catch (error) {
      console.warn('Failed to load caregiver patients:', error);
      setLoadError('Could not load caregiver dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleAcceptInvite = async () => {
    if (!inviteCode.trim()) return;

    setIsAcceptingInvite(true);

    try {
      await caregiverApi.acceptInvite(inviteCode.trim().toUpperCase());
      setInviteCode('');
      await loadPatients();
      Alert.alert('Invite accepted', 'This profile is now visible in your caregiver dashboard.');
    } catch (error) {
      console.warn('Failed to accept caregiver invite:', error);
      Alert.alert('Could not accept invite', 'Check the invite code and try again.');
    } finally {
      setIsAcceptingInvite(false);
    }
  };

  const hasCaregiverAccess = patients.length > 0;

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
        {isLoading ? (
          <LoadingState message="Loading caregiver dashboard..." />
        ) : loadError ? (
          <ErrorState message={loadError} onRetry={loadPatients} />
        ) : hasCaregiverAccess ? (
          <>
            {patients.map((patient) => (
              <CaregiverStatusCard
                key={patient.id}
                name={patient.profiles.name}
                relationship={patient.profiles.relationship}
                medicationsTaken={patient.status?.medicationsTaken || 0}
                medicationsTotal={patient.status?.medicationsTotal || 0}
                missedCount={patient.status?.missedCount || 0}
                lastCheckIn={patient.status?.lastCheckIn || 'No logs today'}
                hasEmergencyAlert={patient.status?.hasEmergencyAlert || false}
                phone={patient.status?.phone}
              />
            ))}

            <SectionCard title="Accept Another Invite">
              <TextInput
                style={styles.input}
                placeholder="MG-ABC123"
                placeholderTextColor={theme.colors.textSecondary}
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
              />
              <LargeActionButton
                title={isAcceptingInvite ? 'Accepting...' : 'Accept Invite'}
                onPress={handleAcceptInvite}
                variant="primary"
                fullWidth
                disabled={!inviteCode.trim() || isAcceptingInvite}
                style={styles.acceptInviteButton}
              />
            </SectionCard>

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
          <>
            <EmptyState
              title="No Caregiver Access"
              message="Ask a family member to invite you, then enter the invite code below."
            />
            <SectionCard title="Accept Invite Code">
              <TextInput
                style={styles.input}
                placeholder="MG-ABC123"
                placeholderTextColor={theme.colors.textSecondary}
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
              />
              <LargeActionButton
                title={isAcceptingInvite ? 'Accepting...' : 'Accept Invite'}
                onPress={handleAcceptInvite}
                variant="primary"
                fullWidth
                disabled={!inviteCode.trim() || isAcceptingInvite}
                style={styles.acceptInviteButton}
              />
            </SectionCard>
          </>
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
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    minHeight: theme.touchTargets.comfortable,
  },
  acceptInviteButton: {
    marginTop: theme.spacing.md,
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
