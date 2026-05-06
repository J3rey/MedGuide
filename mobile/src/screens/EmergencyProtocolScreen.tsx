import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme';
import ConfirmActionModal from '../components/ui/ConfirmActionModal';

interface EmergencyProtocolScreenProps {
  onBack?: () => void;
}

export default function EmergencyProtocolScreen({ onBack }: EmergencyProtocolScreenProps) {
  const insets = useSafeAreaInsets();
  const [showCallConfirm, setShowCallConfirm] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<string>('');

  const emergencyTypes = [
    {
      id: 'overdose',
      icon: '💊',
      title: 'Medication Overdose',
      description: 'Took too much medication or wrong medication',
      steps: [
        'Do not panic',
        'Do not make yourself vomit unless told to',
        'Call emergency services (000) immediately',
        'Have the medication packaging ready',
        'Tell them what was taken and when',
      ],
    },
    {
      id: 'allergic',
      icon: '🫁',
      title: 'Allergic Reaction',
      description: 'Swelling, rash, difficulty breathing after medication',
      steps: [
        'Stop taking the medication',
        'If you have an EpiPen, use it',
        'Call emergency services (000)',
        'Sit upright to help breathing',
        'Do not eat or drink anything',
      ],
    },
    {
      id: 'chest_pain',
      icon: '❤️',
      title: 'Chest Pain',
      description: 'Chest tightness, pain, or pressure',
      steps: [
        'Stop what you are doing and rest',
        'Call emergency services (000) immediately',
        'Chew an aspirin if available and not allergic',
        'Loosen tight clothing',
        'Stay calm and wait for help',
      ],
    },
    {
      id: 'breathing',
      icon: '😮‍💨',
      title: 'Breathing Difficulty',
      description: 'Cannot breathe properly, wheezing, gasping',
      steps: [
        'Sit upright, do not lie down',
        'Use your inhaler if you have one',
        'Call emergency services (000)',
        'Open a window for fresh air',
        'Stay calm, breathe slowly',
      ],
    },
    {
      id: 'fall',
      icon: '🤕',
      title: 'Fall or Injury',
      description: 'Fell down, hit head, cannot get up',
      steps: [
        'Do not try to move if in pain',
        'Call for help or press emergency button',
        'If head was hit, do not sleep',
        'Apply pressure to any bleeding',
        'Call emergency services if needed',
      ],
    },
    {
      id: 'confusion',
      icon: '😵',
      title: 'Confusion or Disorientation',
      description: 'Feeling confused, lost, or unable to think clearly',
      steps: [
        'Sit down in a safe place',
        'Call a caregiver or family member',
        'Do not drive or operate machinery',
        'Check blood sugar if diabetic',
        'Call emergency services if it gets worse',
      ],
    },
  ];

  const handleCallEmergency = () => {
    Linking.openURL('tel:000');
    setShowCallConfirm(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Help</Text>
        <Text style={styles.headerSubtitle}>
          Choose what is happening and follow the steps
        </Text>
      </View>

      {/* Emergency Call Button - Always Visible */}
      <TouchableOpacity
        style={styles.emergencyCallButton}
        onPress={() => {
          setSelectedEmergency('general');
          setShowCallConfirm(true);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.emergencyCallIcon}>🚨</Text>
        <View style={styles.emergencyCallInfo}>
          <Text style={styles.emergencyCallTitle}>Call Emergency Services</Text>
          <Text style={styles.emergencyCallSubtitle}>Call 000 for immediate help</Text>
        </View>
        <Text style={styles.emergencyCallArrow}>→</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>What is happening?</Text>

        {emergencyTypes.map((emergency) => (
          <View key={emergency.id} style={styles.emergencyCard}>
            <View style={styles.emergencyHeader}>
              <Text style={styles.emergencyIcon}>{emergency.icon}</Text>
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyTitle}>{emergency.title}</Text>
                <Text style={styles.emergencyDescription}>{emergency.description}</Text>
              </View>
            </View>

            <View style={styles.stepsContainer}>
              <Text style={styles.stepsLabel}>What to do:</Text>
              {emergency.steps.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => {
                setSelectedEmergency(emergency.title);
                setShowCallConfirm(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.callButtonText}>📞 Call Emergency (000)</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Important Notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Important</Text>
          <Text style={styles.noticeText}>
            This app does not replace professional medical advice.
            If you are unsure, always call emergency services.
            It is better to call and not need help than to not call and need it.
          </Text>
        </View>
      </ScrollView>

      {/* Confirm Call Modal */}
      <ConfirmActionModal
        visible={showCallConfirm}
        title="Call Emergency Services?"
        message="This will call 000 (emergency services). Only call if you need immediate medical help."
        confirmLabel="Call 000"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleCallEmergency}
        onCancel={() => setShowCallConfirm(false)}
      />
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
    paddingBottom: theme.spacing.md,
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
  emergencyCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.emergency,
    marginHorizontal: theme.spacing.xl,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing.base,
  },
  emergencyCallIcon: {
    fontSize: 28,
  },
  emergencyCallInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  emergencyCallTitle: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  emergencyCallSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: theme.typography.fontSize.sm,
    marginTop: 2,
  },
  emergencyCallArrow: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.base,
  },
  emergencyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    ...theme.shadows.card,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  emergencyIcon: {
    fontSize: 28,
  },
  emergencyInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  emergencyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  emergencyDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  stepsContainer: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.base,
  },
  stepsLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
    marginTop: 1,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: theme.typography.fontWeight.bold,
  },
  stepText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.fontSize.base * 1.5,
  },
  callButton: {
    backgroundColor: theme.colors.dangerLight,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  callButtonText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  noticeCard: {
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noticeTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  noticeText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.fontSize.base * 1.6,
  },
});
