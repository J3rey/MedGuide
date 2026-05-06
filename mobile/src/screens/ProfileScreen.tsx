import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../styles/theme';
import { useProfiles } from '../contexts/ProfileContext';
import SectionCard from '../components/ui/SectionCard';

interface ProfileScreenProps {
  onNavigate?: (screen: string) => void;
  onBack?: () => void;
}

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

function SettingsRow({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  danger,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityLabel={title}
      accessibilityHint={subtitle}
    >
      <View
        style={[
          styles.settingsIcon,
          danger && { backgroundColor: theme.colors.dangerLight },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={
            danger ? theme.colors.danger : iconColor || theme.colors.primary
          }
        />
      </View>
      <View style={styles.settingsInfo}>
        <Text
          style={[
            styles.settingsTitle,
            danger && { color: theme.colors.danger },
          ]}
        >
          {title}
        </Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

export default function ProfileScreen({
  onNavigate,
  onBack,
}: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { activeProfile } = useProfiles();

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  activeProfile?.avatar_color || theme.colors.primary,
              },
            ]}
          >
            <Text style={styles.avatarText}>
              {activeProfile ? getInitial(activeProfile.name) : '?'}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {activeProfile?.name || t('profile.noProfile')}
          </Text>
          <Text style={styles.profileEmail}>user@example.com</Text>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => onNavigate?.('ManageProfiles')}
            activeOpacity={0.7}
          >
            <Text style={styles.editProfileText}>
              {t('profile.manageProfiles')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* People & Access */}
        <Text style={styles.sectionLabel}>{t('profile.peopleAccess')}</Text>
        <SectionCard>
          <SettingsRow
            icon="people"
            title={t('profile.manageProfiles')}
            subtitle={t('profile.manageProfilesSubtitle')}
            onPress={() => onNavigate?.('ManageProfiles')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="heart"
            iconColor="#E11D48"
            title={t('profile.caregiverAccess')}
            subtitle={t('profile.caregiverAccessSubtitle')}
            onPress={() => onNavigate?.('CaregiverDashboard')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="person-add"
            title={t('profile.inviteCaregiver')}
            subtitle={t('profile.inviteCaregiverSubtitle')}
            onPress={() => onNavigate?.('CaregiverInvite')}
          />
        </SectionCard>

        {/* Health & Safety */}
        <Text style={styles.sectionLabel}>{t('profile.healthSafety')}</Text>
        <SectionCard>
          <SettingsRow
            icon="medkit"
            iconColor="#16A34A"
            title={t('profile.myPharmacy')}
            subtitle={t('profile.myPharmacySubtitle')}
            onPress={() => onNavigate?.('PharmacyList')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="call"
            iconColor="#DC2626"
            title={t('profile.emergencyContacts')}
            subtitle={t('profile.emergencyContactsSubtitle')}
            onPress={() => onNavigate?.('EmergencyContacts')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="shield-checkmark"
            iconColor="#B91C1C"
            title={t('profile.emergencyProtocol')}
            subtitle={t('profile.emergencyProtocolSubtitle')}
            danger
            onPress={() => onNavigate?.('EmergencyProtocol')}
          />
        </SectionCard>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>{t('profile.preferences')}</Text>
        <SectionCard>
          <SettingsRow
            icon="accessibility"
            iconColor="#7C3AED"
            title={t('profile.accessibility')}
            subtitle={t('profile.accessibilitySubtitle')}
            onPress={() => onNavigate?.('AccessibilitySettings')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="lock-closed"
            iconColor="#1D4ED8"
            title={t('profile.security')}
            subtitle={t('profile.securitySubtitle')}
            onPress={() => onNavigate?.('SecuritySettings')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="globe"
            iconColor="#0891B2"
            title={t('profile.language')}
            subtitle={activeProfile?.preferred_language || t('profile.english')}
            onPress={() => onBack?.()}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="leaf"
            iconColor="#059669"
            title={t('profile.culturalNotes')}
            subtitle={t('profile.culturalNotesSubtitle')}
            onPress={() => onNavigate?.('CulturalNotes')}
          />
        </SectionCard>

        {/* About */}
        <Text style={styles.sectionLabel}>{t('profile.about')}</Text>
        <SectionCard>
          <SettingsRow
            icon="document-text"
            iconColor="#6B7280"
            title={t('profile.terms')}
            onPress={() => onNavigate?.('TermsAndConditions')}
          />
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>{t('profile.version')}</Text>
            <Text style={styles.aboutValue}>3.0.0</Text>
          </View>
        </SectionCard>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>{t('profile.disclaimer')}</Text>
        </View>
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
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.base,
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius['2xl'],
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  profileName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  profileEmail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  editProfileBtn: {
    marginTop: theme.spacing.base,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radius.full,
  },
  editProfileText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingLeft: theme.spacing.xs,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    minHeight: theme.touchTargets.minimum,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  settingsTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  settingsSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 52,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  aboutLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  aboutValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  disclaimer: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.lg,
  },
  disclaimerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.sm * 1.6,
  },
});
