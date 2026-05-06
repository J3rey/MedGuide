import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../styles/theme';
import SectionCard from '../components/ui/SectionCard';
import LargeActionButton from '../components/ui/LargeActionButton';
import { useProfiles } from '../contexts/ProfileContext';

interface CulturalNotesScreenProps {
  onBack?: () => void;
}

type FamilyInvolvementPreference = 'full' | 'limited' | 'none';

const familyInvolvementOptions: Array<{
  value: FamilyInvolvementPreference;
  labelKey: string;
  descKey: string;
}> = [
  {
    value: 'full',
    labelKey: 'culturalNotes.familyFull',
    descKey: 'culturalNotes.familyFullDesc',
  },
  {
    value: 'limited',
    labelKey: 'culturalNotes.familyLimited',
    descKey: 'culturalNotes.familyLimitedDesc',
  },
  {
    value: 'none',
    labelKey: 'culturalNotes.familyNone',
    descKey: 'culturalNotes.familyNoneDesc',
  },
];

export default function CulturalNotesScreen({
  onBack,
}: CulturalNotesScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { activeProfile, updateProfile } = useProfiles();

  const [culturalNotes, setCulturalNotes] = useState(
    activeProfile?.cultural_notes || ''
  );
  const [dietaryNotes, setDietaryNotes] = useState(
    activeProfile?.dietary_notes || ''
  );
  const [familyInvolvement, setFamilyInvolvement] =
    useState<FamilyInvolvementPreference>(
      activeProfile?.family_involvement_preference || 'full'
    );

  const handleSave = async () => {
    if (activeProfile) {
      try {
        await updateProfile(activeProfile.id, {
          cultural_notes: culturalNotes || undefined,
          dietary_notes: dietaryNotes || undefined,
          family_involvement_preference: familyInvolvement,
        });
      } catch (error) {
        console.warn('Failed to save cultural notes:', error);
        Alert.alert(t('culturalNotes.saveErrorTitle'), t('common.tryAgain'));
        return;
      }
    }
    Alert.alert(
      t('culturalNotes.savedTitle'),
      t('culturalNotes.savedMessage'),
      [{ text: 'OK', onPress: () => onBack?.() }]
    );
  };

  const handleFieldChange =
    (setter: (v: string) => void) => (value: string) => {
      setter(value);
    };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('culturalNotes.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('culturalNotes.subtitle')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cultural Notes */}
        <SectionCard title={t('culturalNotes.culturalPreferences')}>
          <Text style={styles.fieldDescription}>
            {t('culturalNotes.culturalDescription')}
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder={t('culturalNotes.culturalPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={culturalNotes}
            onChangeText={handleFieldChange(setCulturalNotes)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </SectionCard>

        {/* Dietary Notes */}
        <SectionCard title={t('culturalNotes.dietaryTitle')}>
          <Text style={styles.fieldDescription}>
            {t('culturalNotes.dietaryDescription')}
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder={t('culturalNotes.dietaryPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={dietaryNotes}
            onChangeText={handleFieldChange(setDietaryNotes)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </SectionCard>

        {/* Family Involvement */}
        <SectionCard title={t('culturalNotes.familyTitle')}>
          <Text style={styles.fieldDescription}>
            {t('culturalNotes.familyDescription')}
          </Text>
          <View style={styles.optionGrid}>
            {familyInvolvementOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  familyInvolvement === option.value && styles.optionCardActive,
                ]}
                onPress={() => setFamilyInvolvement(option.value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.radio,
                    familyInvolvement === option.value && styles.radioActive,
                  ]}
                >
                  {familyInvolvement === option.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <View style={styles.optionInfo}>
                  <Text
                    style={[
                      styles.optionLabel,
                      familyInvolvement === option.value &&
                        styles.optionLabelActive,
                    ]}
                  >
                    {t(option.labelKey)}
                  </Text>
                  <Text style={styles.optionDesc}>{t(option.descKey)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>
            {t('culturalNotes.important')}
          </Text>
          <Text style={styles.disclaimerText}>
            {t('culturalNotes.disclaimer')}
          </Text>
        </View>

        <LargeActionButton
          title={t('culturalNotes.saveChanges')}
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
