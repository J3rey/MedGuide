import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme';
import { useProfiles } from '../contexts/ProfileContext';
import SectionCard from '../components/ui/SectionCard';

interface ProfileScreenProps {
  onNavigate?: (screen: string) => void;
  onBack?: () => void;
}

interface SettingsRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

function SettingsRow({ icon, title, subtitle, onPress, danger }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingsIcon, danger && { backgroundColor: theme.colors.dangerLight }]}>
        <Text style={styles.settingsIconText}>{icon}</Text>
      </View>
      <View style={styles.settingsInfo}>
        <Text style={[styles.settingsTitle, danger && { color: theme.colors.danger }]}>{title}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ onNavigate, onBack }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const { activeProfile } = useProfiles();

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: activeProfile?.avatar_color || theme.colors.primary }]}>
            <Text style={styles.avatarText}>
              {activeProfile ? getInitial(activeProfile.name) : '?'}
            </Text>
          </View>
          <Text style={styles.profileName}>{activeProfile?.name || 'No Profile'}</Text>
          <Text style={styles.profileEmail}>user@example.com</Text>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => onNavigate?.('ManageProfiles')}
            activeOpacity={0.7}
          >
            <Text style={styles.editProfileText}>Manage Profiles</Text>
          </TouchableOpacity>
        </View>

        {/* People & Access */}
        <Text style={styles.sectionLabel}>People & Access</Text>
        <SectionCard>
          <SettingsRow
            icon="👥"
            title="Manage Profiles"
            subtitle="Add or switch between profiles"
            onPress={() => onNavigate?.('ManageProfiles')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="🤝"
            title="Caregiver Access"
            subtitle="Manage caregivers and permissions"
            onPress={() => onNavigate?.('CaregiverDashboard')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="📨"
            title="Invite Caregiver"
            subtitle="Share medication status with family"
            onPress={() => onNavigate?.('CaregiverInvite')}
          />
        </SectionCard>

        {/* Health & Safety */}
        <Text style={styles.sectionLabel}>Health & Safety</Text>
        <SectionCard>
          <SettingsRow
            icon="🏥"
            title="My Pharmacy"
            subtitle="Store pharmacy details"
            onPress={() => onNavigate?.('PharmacyList')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="🚨"
            title="Emergency Contacts"
            subtitle="People to contact in emergencies"
            onPress={() => onNavigate?.('EmergencyContacts')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="⚠️"
            title="Emergency Protocol"
            subtitle="What to do in an emergency"
            onPress={() => onNavigate?.('EmergencyProtocol')}
          />
        </SectionCard>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <SectionCard>
          <SettingsRow
            icon="♿"
            title="Accessibility"
            subtitle="Text size, contrast, button size"
            onPress={() => onNavigate?.('AccessibilitySettings')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="🔒"
            title="Security"
            subtitle="Biometric login, PIN"
            onPress={() => onNavigate?.('SecuritySettings')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="🌐"
            title="Language"
            subtitle={activeProfile?.preferred_language || 'English'}
            onPress={() => onBack?.()}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="🌸"
            title="Cultural Notes"
            subtitle="Dietary and cultural preferences"
            onPress={() => onNavigate?.('CulturalNotes')}
          />
        </SectionCard>

        {/* About */}
        <Text style={styles.sectionLabel}>About</Text>
        <SectionCard>
          <SettingsRow
            icon="📄"
            title="Terms & Conditions"
            onPress={() => onNavigate?.('TermsAndConditions')}
          />
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>3.0.0</Text>
          </View>
        </SectionCard>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            MedGuide is designed to assist with medication information.
            Always consult your healthcare provider for medical advice.
          </Text>
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
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIconText: {
    fontSize: 18,
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
  chevron: {
    fontSize: 22,
    color: theme.colors.textSecondary,
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
