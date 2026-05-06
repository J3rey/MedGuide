import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Share, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import LargeActionButton from '../components/ui/LargeActionButton';
import SectionCard from '../components/ui/SectionCard';
import { CaregiverRole } from '../types/models';

interface CaregiverInviteScreenProps {
  onBack?: () => void;
}

export default function CaregiverInviteScreen({ onBack }: CaregiverInviteScreenProps) {
  const insets = useSafeAreaInsets();
  const [inviteMethod, setInviteMethod] = useState<'email' | 'phone' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<CaregiverRole>('caregiver');
  const [inviteCode] = useState('MG-' + Math.random().toString(36).substring(2, 8).toUpperCase());

  const roles: { value: CaregiverRole; label: string; description: string }[] = [
    { value: 'caregiver', label: 'Caregiver', description: 'Can view status and receive alerts' },
    { value: 'family_member', label: 'Family Member', description: 'Can view status only' },
    { value: 'emergency_contact', label: 'Emergency Contact', description: 'Receives emergency alerts' },
  ];

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join me on MedGuide as my ${role}. Use invite code: ${inviteCode}`,
      });
    } catch (error) {
      // Handle error
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Caregiver</Text>
        <Text style={styles.headerSubtitle}>
          Add someone to help monitor your medications
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Role Selection */}
        <SectionCard title="Choose Role">
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
                  {r.label}
                </Text>
                <Text style={styles.roleDescription}>{r.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </SectionCard>

        {/* Invite Method */}
        <SectionCard title="How to Invite">
          <View style={styles.methodTabs}>
            {(['email', 'phone', 'code'] as const).map((method) => (
              <TouchableOpacity
                key={method}
                style={[styles.methodTab, inviteMethod === method && styles.methodTabActive]}
                onPress={() => setInviteMethod(method)}
                activeOpacity={0.7}
              >
                <Text style={[styles.methodTabText, inviteMethod === method && styles.methodTabTextActive]}>
                  {method === 'code' ? 'Invite Code' : method.charAt(0).toUpperCase() + method.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {inviteMethod === 'email' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
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
              <Text style={styles.inputLabel}>Phone Number</Text>
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
              <Text style={styles.codeLabel}>Share this invite code:</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{inviteCode}</Text>
              </View>
              <TouchableOpacity style={styles.shareButton} onPress={handleShareCode} activeOpacity={0.7}>
                <Ionicons name="share-outline" size={18} color="#FFFFFF" />
              <Text style={styles.shareButtonText}> Share Code</Text>
              </TouchableOpacity>
            </View>
          )}
        </SectionCard>

        {/* Permissions Preview */}
        <SectionCard title="Default Permissions">
          <Text style={styles.permNote}>
            You can change these after the invite is accepted.
          </Text>
          <View style={styles.permList}>
            <View style={styles.permItem}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
              <Text style={styles.permText}>View medication status</Text>
            </View>
            <View style={styles.permItem}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
              <Text style={styles.permText}>Receive missed-dose alerts</Text>
            </View>
            <View style={styles.permItem}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
              <Text style={styles.permText}>View visual schedule</Text>
            </View>
            <View style={styles.permItem}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.permText}>Manage medications</Text>
            </View>
            <View style={styles.permItem}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.permText}>Manage emergency contacts</Text>
            </View>
          </View>
        </SectionCard>

        {/* Send Button */}
        {inviteMethod !== 'code' && (
          <LargeActionButton
            title="Send Invitation"
            onPress={() => {
              const target = inviteMethod === 'email' ? email : phone;
              Alert.alert(
                'Invitation Sent',
                `An invitation has been sent to ${target} as a ${role}.`,
                [{ text: 'OK', onPress: () => onBack?.() }]
              );
            }}
            variant="primary"
            fullWidth
            disabled={inviteMethod === 'email' ? !email : !phone}
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
