import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Share, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../styles/theme';
import LargeActionButton from '../components/ui/LargeActionButton';
import SectionCard from '../components/ui/SectionCard';
import {
  CaregiverRole,
  defaultCaregiverPermissions,
} from '../types/models';
import { caregiverApi } from '../services/api';
import { useProfiles } from '../contexts/ProfileContext';

interface CaregiverInviteScreenProps {
  onBack?: () => void;
}

export default function CaregiverInviteScreen({ onBack }: CaregiverInviteScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { activeProfile } = useProfiles();
  const [inviteMethod, setInviteMethod] = useState<'email' | 'phone' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<CaregiverRole>('caregiver');
  const [inviteCode, setInviteCode] = useState('');
  const [isSending, setIsSending] = useState(false);

  const roles: { value: CaregiverRole; labelKey: string; descriptionKey: string }[] = [
    { value: 'caregiver', labelKey: 'caregiverInvite.roleCaregiver', descriptionKey: 'caregiverInvite.roleCaregiverDesc' },
    { value: 'family_member', labelKey: 'caregiverInvite.roleFamily', descriptionKey: 'caregiverInvite.roleFamilyDesc' },
    { value: 'emergency_contact', labelKey: 'caregiverInvite.roleEmergency', descriptionKey: 'caregiverInvite.roleEmergencyDesc' },
  ];

  const createInvite = async () => {
    if (!activeProfile) {
      Alert.alert(t('caregiverInvite.noActiveProfileTitle'), t('caregiverInvite.noActiveProfile'));
      return null;
    }

    setIsSending(true);

    try {
      const targetEmail = inviteMethod === 'email' ? email : undefined;
      const response = await caregiverApi.inviteCaregiver(activeProfile.id, {
        role,
        email: targetEmail || undefined,
        permissions: defaultCaregiverPermissions,
      });

      setInviteCode(response.invite_code);
      return response.invite_code;
    } catch (error) {
      console.warn('Failed to create caregiver invite:', error);
      Alert.alert(t('caregiverInvite.createErrorTitle'), t('common.tryAgain'));
      return null;
    } finally {
      setIsSending(false);
    }
  };

  const shareInviteCode = async (code: string) => {
    try {
      await Share.share({
        message: t('caregiverInvite.shareMessage', {
          role: t(`caregiverInvite.roleValue.${role}`),
          code,
        }),
      });
    } catch (error) {
      console.warn('Failed to share invite:', error);
    }
  };

  const handleShareCode = async () => {
    const code = inviteCode || (await createInvite());
    if (code) await shareInviteCode(code);
  };

  const handleSendInvitation = async () => {
    const target = inviteMethod === 'email' ? email : phone;
    const code = await createInvite();

    if (!code) return;

    Alert.alert(
      t('caregiverInvite.createdTitle'),
      t('caregiverInvite.createdMessage', {
        code,
        target,
        role: t(`caregiverInvite.roleValue.${role}`),
      }),
      [{ text: 'OK', onPress: () => onBack?.() }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('caregiverInvite.title')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('caregiverInvite.subtitle')}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Role Selection */}
        <SectionCard title={t('caregiverInvite.chooseRole')}>
          {roles.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[styles.roleOption, role === r.value && styles.roleOptionActive]}
              onPress={() => setRole(r.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.radioOuter, role === r.value && styles.radioOuterActive]}>
                {role === r.value && <View style={styles.radioInner} />}
              </View>
              <View style={styles.roleInfo}>
                <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>
                  {t(r.labelKey)}
                </Text>
                <Text style={styles.roleDescription}>{t(r.descriptionKey)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </SectionCard>

        {/* Invite Method */}
        <SectionCard title={t('caregiverInvite.howToInvite')}>
          <View style={styles.methodTabs}>
            {(['email', 'phone', 'code'] as const).map((method) => (
              <TouchableOpacity
                key={method}
                style={[styles.methodTab, inviteMethod === method && styles.methodTabActive]}
                onPress={() => setInviteMethod(method)}
                activeOpacity={0.7}
              >
                <Text style={[styles.methodTabText, inviteMethod === method && styles.methodTabTextActive]}>
                  {t(`caregiverInvite.method.${method}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {inviteMethod === 'email' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('caregiverInvite.email')}</Text>
              <TextInput
                style={styles.input}
                placeholder="caregiver@example.com"
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {inviteMethod === 'phone' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('caregiverInvite.phone')}</Text>
              <TextInput
                style={styles.input}
                placeholder="+61 400 000 000"
                placeholderTextColor={theme.colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          )}

          {inviteMethod === 'code' && (
            <View style={styles.codeSection}>
              <Text style={styles.codeLabel}>{t('caregiverInvite.shareCodeLabel')}</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>
                  {inviteCode || t('caregiverInvite.generate')}
                </Text>
              </View>
              <TouchableOpacity style={styles.shareButton} onPress={handleShareCode} activeOpacity={0.7}>
                <Ionicons name="share-outline" size={18} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>
                {isSending ? t('caregiverInvite.creating') : t('caregiverInvite.shareCode')}
              </Text>
              </TouchableOpacity>
            </View>
          )}
        </SectionCard>

        {/* Permissions Preview */}
        <SectionCard title={t('caregiverInvite.defaultPermissions')}>
          <Text style={styles.permNote}>
            {t('caregiverInvite.permissionsNote')}
          </Text>
          <View style={styles.permList}>
            <View style={styles.permItem}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
              <Text style={styles.permText}>{t('caregiverInvite.permViewStatus')}</Text>
            </View>
            <View style={styles.permItem}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
              <Text style={styles.permText}>{t('caregiverInvite.permMissedAlerts')}</Text>
            </View>
            <View style={styles.permItem}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
              <Text style={styles.permText}>{t('caregiverInvite.permVisualSchedule')}</Text>
            </View>
            <View style={styles.permItem}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.permText}>{t('caregiverInvite.permManageMedications')}</Text>
            </View>
            <View style={styles.permItem}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.permText}>{t('caregiverInvite.permManageContacts')}</Text>
            </View>
          </View>
        </SectionCard>

        {/* Send Button */}
        {inviteMethod !== 'code' && (
          <LargeActionButton
            title={
              isSending
                ? t('caregiverInvite.creatingInvitation')
                : t('caregiverInvite.createInvitation')
            }
            onPress={handleSendInvitation}
            variant="primary"
            fullWidth
            disabled={
              isSending ||
              !activeProfile ||
              (inviteMethod === 'email' ? !email : !phone)
            }
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
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  backText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  roleOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  roleInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  roleLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  roleLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  roleDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  methodTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.lg,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  methodTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm + 2,
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
  methodTabActive: {
    backgroundColor: theme.colors.primary,
  },
  methodTabText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  methodTabTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.semibold,
  },
  inputGroup: {
    marginBottom: theme.spacing.base,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
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
  codeSection: {
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  codeBox: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  codeText: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  shareButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  permNote: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  permList: {
    gap: theme.spacing.sm,
  },
  permItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permCheck: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.success,
    width: 24,
    fontWeight: theme.typography.fontWeight.bold,
  },
  permCross: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    width: 24,
    fontWeight: theme.typography.fontWeight.bold,
  },
  permText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
  },
});
