import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import ConfirmActionModal from '../components/ui/ConfirmActionModal';

interface EmergencyProtocolScreenProps {
  onBack?: () => void;
}

interface EmergencyType {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
  steps: string[];
}

const emergencyTypes: EmergencyType[] = [
  {
    id: 'overdose',
    icon: 'medical',
    iconColor: '#DC2626',
    title: 'Medication Overdose',
    description: 'Took too much medication or wrong medication',
    steps: [
      'Do NOT induce vomiting unless instructed by poison control',
      'Call Poison Control (13 11 26) or Emergency (000)',
      'Note the medication name, amount taken, and time',
      'Keep the medication container for reference',
      'Stay calm and monitor breathing',
      'If unconscious, place in recovery position',
    ],
  },
  {
    id: 'allergic',
    icon: 'alert-circle',
    iconColor: '#EA580C',
    title: 'Allergic Reaction',
    description: 'Swelling, rash, difficulty breathing after medication',
    steps: [
      'Stop taking the medication immediately',
      'If prescribed, use epinephrine auto-injector (EpiPen)',
      'Call Emergency (000) if breathing is difficult',
      'Loosen tight clothing and remove constrictive items',
      'If available, take antihistamine (e.g., Benadryl)',
      'Lie down with legs elevated unless breathing is difficult',
    ],
  },
  {
    id: 'chest_pain',
    icon: 'heart-dislike',
    iconColor: '#DC2626',
    title: 'Chest Pain',
    description: 'Sudden chest pain, pressure, or discomfort',
    steps: [
      'Call Emergency (000) immediately',
      'Chew aspirin (300mg) if not allergic and available',
      'Sit upright in a comfortable position',
      'Loosen any tight clothing',
      'Do NOT drive yourself to hospital',
      'If prescribed, use GTN spray under tongue',
    ],
  },
  {
    id: 'breathing',
    icon: 'fitness',
    iconColor: '#7C3AED',
    title: 'Breathing Difficulty',
    description: 'Shortness of breath, wheezing, or choking',
    steps: [
      'Sit upright, lean slightly forward',
      'If asthmatic, use reliever inhaler (blue puffer)',
      'Call Emergency (000) if not improving',
      'Loosen tight clothing around chest and neck',
      'Try to breathe slowly through pursed lips',
      'Do NOT lie flat',
    ],
  },
  {
    id: 'fall',
    icon: 'body',
    iconColor: '#0891B2',
    title: 'Fall or Injury',
    description: 'Fallen and unable to get up, or visible injury',
    steps: [
      'Do NOT move if you suspect a spinal injury',
      'Check for bleeding and apply pressure if needed',
      'Call Emergency (000) if unable to get up',
      'If able, slowly roll to side and push up',
      'Apply ice to swollen areas',
      'Note any medications that may have caused dizziness',
    ],
  },
  {
    id: 'confusion',
    icon: 'help-circle',
    iconColor: '#6B7280',
    title: 'Confusion / Disorientation',
    description: 'Sudden confusion, memory loss, or strange behaviour',
    steps: [
      'Ensure the person is in a safe environment',
      'Speak calmly and reassuringly',
      'Check blood sugar if diabetic',
      'Review recent medication changes',
      'Call Emergency (000) if symptoms are sudden',
      'Note the time symptoms started',
    ],
  },
];

export default function EmergencyProtocolScreen({ onBack }: EmergencyProtocolScreenProps) {
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCallConfirm, setShowCallConfirm] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<string>('');

  const handleCallEmergency = (context?: string) => {
    setSelectedEmergency(context || 'General Emergency');
    setShowCallConfirm(true);
  };

  const confirmCall = () => {
    setShowCallConfirm(false);
    Linking.openURL('tel:000').catch(() => {
      Alert.alert('Unable to Call', 'Please dial 000 manually from your phone app.');
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Emergency Help</Text>
          <Text style={styles.headerSubtitle}>
            Choose what is happening and follow the steps
          </Text>
        </View>
      </View>

      {/* Emergency Call Button - Always Visible */}
      <TouchableOpacity
        style={styles.emergencyCallButton}
        onPress={() => handleCallEmergency()}
        activeOpacity={0.8}
        accessibilityLabel="Call Emergency Services"
        accessibilityHint="Calls 000 for immediate emergency assistance"
      >
        <View style={styles.emergencyCallIconContainer}>
          <Ionicons name="call" size={26} color="#FFFFFF" />
        </View>
        <View style={styles.emergencyCallInfo}>
          <Text style={styles.emergencyCallTitle}>Call Emergency Services</Text>
          <Text style={styles.emergencyCallSubtitle}>Call 000 for immediate help</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>What is happening?</Text>

        {emergencyTypes.map((emergency) => {
          const isExpanded = expandedId === emergency.id;
          return (
            <View key={emergency.id} style={styles.emergencyCard}>
              <TouchableOpacity
                style={styles.emergencyHeader}
                onPress={() => toggleExpand(emergency.id)}
                activeOpacity={0.7}
                accessibilityLabel={emergency.title}
                accessibilityHint="Tap to expand steps"
              >
                <View style={[styles.emergencyIconContainer, { backgroundColor: emergency.iconColor + '15' }]}>
                  <Ionicons name={emergency.icon} size={22} color={emergency.iconColor} />
                </View>
                <View style={styles.emergencyInfo}>
                  <Text style={styles.emergencyTitle}>{emergency.title}</Text>
                  <Text style={styles.emergencyDescription}>{emergency.description}</Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>

              {isExpanded && (
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

                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCallEmergency(emergency.title)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call" size={18} color="#FFFFFF" />
                    <Text style={styles.callButtonText}>Call Emergency (000)</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {/* Important Notice */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons name="information-circle" size={20} color={theme.colors.warning} />
            <Text style={styles.noticeTitle}>Important</Text>
          </View>
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
        message={`You are about to call 000 for: ${selectedEmergency}. This will connect you directly to emergency services.`}
        confirmLabel="Call 000"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmCall}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
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
  emergencyCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.emergency,
    marginHorizontal: theme.spacing.xl,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing.base,
    ...theme.shadows.md,
  },
  emergencyCallIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  emergencyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  emergencyTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  emergencyDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  stepsContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.base,
  },
  stepsLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.emergency,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  callButtonText: {
    color: '#FFFFFF',
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
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  noticeTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  noticeText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.fontSize.base * 1.6,
  },
});
