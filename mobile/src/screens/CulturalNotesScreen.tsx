import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme';
import SectionCard from '../components/ui/SectionCard';
import LargeActionButton from '../components/ui/LargeActionButton';
import { useProfiles } from '../contexts/ProfileContext';

interface CulturalNotesScreenProps {
  onBack?: () => void;
}

export default function CulturalNotesScreen({ onBack }: CulturalNotesScreenProps) {
  const insets = useSafeAreaInsets();
  const { activeProfile, updateProfile } = useProfiles();

  const [culturalNotes, setCulturalNotes] = useState(activeProfile?.cultural_notes || '');
  const [dietaryNotes, setDietaryNotes] = useState(activeProfile?.dietary_notes || '');
  const [familyInvolvement, setFamilyInvolvement] = useState(
    activeProfile?.family_involvement_preference || 'full'
  );

  const handleSave = () => {
    if (activeProfile) {
      updateProfile(activeProfile.id, {
        cultural_notes: culturalNotes || undefined,
        dietary_notes: dietaryNotes || undefined,
        family_involvement_preference: familyInvolvement as any,
      });
    }
    onBack?.();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cultural & Care Notes</Text>
        <Text style={styles.headerSubtitle}>
          Add preferences to help caregivers understand your needs
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cultural Notes */}
        <SectionCard title="Cultural Preferences">
          <Text style={styles.fieldDescription}>
            Add any cultural considerations that may affect medication timing or care
            (e.g., fasting periods, prayer times, cultural practices)
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g., Fasting during Ramadan - medication timing may need adjustment"
            placeholderTextColor={theme.colors.textSecondary}
            value={culturalNotes}
            onChangeText={setCulturalNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </SectionCard>

        {/* Dietary Notes */}
        <SectionCard title="Dietary & Religious Considerations">
          <Text style={styles.fieldDescription}>
            Note any dietary restrictions that may affect medication choices
            (e.g., gelatin-free capsules, halal, kosher, vegetarian)
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g., Requires gelatin-free medication capsules"
            placeholderTextColor={theme.colors.textSecondary}
            value={dietaryNotes}
            onChangeText={setDietaryNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </SectionCard>

        {/* Family Involvement */}
        <SectionCard title="Family Involvement Preference">
          <Text style={styles.fieldDescription}>
            How much should family members be involved in your care?
          </Text>
          <View style={styles.optionGrid}>
            {[
              { value: 'full', label: 'Full Involvement', desc: 'Family can see all details' },
              { value: 'limited', label: 'Limited', desc: 'Basic status only' },
              { value: 'none', label: 'Minimal', desc: 'Emergency only' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  familyInvolvement === option.value && styles.optionCardActive,
                ]}
                onPress={() => setFamilyInvolvement(option.value)}
                activeOpacity={0.7}
              >
                <View style={[styles.radio, familyInvolvement === option.value && styles.radioActive]}>
                  {familyInvolvement === option.value && <View style={styles.radioInner} />}
                </View>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionLabel, familyInvolvement === option.value && styles.optionLabelActive]}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionDesc}>{option.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Important</Text>
          <Text style={styles.disclaimerText}>
            These notes are for informational purposes only. Always confirm medication
            decisions with your pharmacist or doctor. MedGuide does not make medical
            or cultural assumptions based on language or background.
          </Text>
        </View>

        <LargeActionButton
          title="Save Changes"
          onPress={handleSave}
          variant="primary"
          fullWidth
          style={{ marginTop: theme.spacing.lg }}
        />
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
  fieldDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.fontSize.sm * 1.6,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    minHeight: 100,
  },
  optionGrid: {
    gap: theme.spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.base,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  optionCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  optionInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  optionLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  optionLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  optionDesc: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  disclaimer: {
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  disclaimerTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  disclaimerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.fontSize.sm * 1.6,
  },
});
