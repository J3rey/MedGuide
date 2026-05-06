import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme';
import SectionCard from '../components/ui/SectionCard';

interface SecuritySettingsScreenProps {
  onBack?: () => void;
}

export default function SecuritySettingsScreen({ onBack }: SecuritySettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricForApp, setBiometricForApp] = useState(false);
  const [biometricForMeds, setBiometricForMeds] = useState(false);
  const [biometricForCaregiver, setBiometricForCaregiver] = useState(false);
  const [biometricForEmergency, setBiometricForEmergency] = useState(false);

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // In production, check biometric availability using expo-local-authentication
      Alert.alert(
        'Enable Biometric Login',
        'Use Face ID or fingerprint to secure your app. This does not store biometric data.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => setBiometricEnabled(true),
          },
        ]
      );
    } else {
      setBiometricEnabled(false);
      setBiometricForApp(false);
      setBiometricForMeds(false);
      setBiometricForCaregiver(false);
      setBiometricForEmergency(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
        <Text style={styles.headerSubtitle}>
          Protect your health information
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Biometric Authentication */}
        <SectionCard title="Biometric Authentication">
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Enable Face ID / Fingerprint</Text>
              <Text style={styles.toggleSubtitle}>
                Use biometrics to unlock the app
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: theme.colors.switchBackground, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {biometricEnabled && (
            <>
              <View style={styles.divider} />
              <Text style={styles.subSectionTitle}>Require biometrics for:</Text>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Opening the app</Text>
                </View>
                <Switch
                  value={biometricForApp}
                  onValueChange={setBiometricForApp}
                  trackColor={{ false: theme.colors.switchBackground, true: theme.colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Viewing medication notes</Text>
                </View>
                <Switch
                  value={biometricForMeds}
                  onValueChange={setBiometricForMeds}
                  trackColor={{ false: theme.colors.switchBackground, true: theme.colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Managing caregiver access</Text>
                </View>
                <Switch
                  value={biometricForCaregiver}
                  onValueChange={setBiometricForCaregiver}
                  trackColor={{ false: theme.colors.switchBackground, true: theme.colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Changing emergency contacts</Text>
                </View>
                <Switch
                  value={biometricForEmergency}
                  onValueChange={setBiometricForEmergency}
                  trackColor={{ false: theme.colors.switchBackground, true: theme.colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </>
          )}
        </SectionCard>

        {/* Security Info */}
        <SectionCard title="Security Information">
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🔐</Text>
            <Text style={styles.infoText}>
              Biometric data is never stored by MedGuide. We only store a secure token on your device.
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📱</Text>
            <Text style={styles.infoText}>
              If biometrics are unavailable, you can always use your device PIN or password.
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⚡</Text>
            <Text style={styles.infoText}>
              Emergency features are always accessible, even when biometrics are enabled.
            </Text>
          </View>
        </SectionCard>

        {/* PIN Fallback */}
        <SectionCard title="PIN Backup">
          <TouchableOpacity style={styles.pinButton} activeOpacity={0.7}>
            <Text style={styles.pinButtonText}>Set Up PIN</Text>
            <Text style={styles.pinButtonSubtext}>
              Use as a backup when biometrics are unavailable
            </Text>
          </TouchableOpacity>
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  toggleInfo: {
    flex: 1,
    marginRight: theme.spacing.base,
  },
  toggleTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  subSectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.md,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.fontSize.base * 1.5,
  },
  pinButton: {
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  pinButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  pinButtonSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
