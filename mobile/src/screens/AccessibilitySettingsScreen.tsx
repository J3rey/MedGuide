import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import { useAccessibility } from '../contexts/AccessibilityContext';
import SectionCard from '../components/ui/SectionCard';
import { TextSizeScale, ButtonSizeScale } from '../styles/theme';

interface AccessibilitySettingsScreenProps {
  onBack?: () => void;
}

export default function AccessibilitySettingsScreen({
  onBack,
}: AccessibilitySettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useAccessibility();

  const textSizeOptions: { label: string; value: TextSizeScale }[] = [
    { label: 'Small', value: 'small' },
    { label: 'Default', value: 'default' },
    { label: 'Large', value: 'large' },
    { label: 'Extra Large', value: 'extraLarge' },
  ];

  const buttonSizeOptions: { label: string; value: ButtonSizeScale }[] = [
    { label: 'Default', value: 'default' },
    { label: 'Large', value: 'large' },
    { label: 'Extra Large', value: 'extraLarge' },
  ];

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
        <Text style={styles.headerTitle}>Accessibility</Text>
        <Text style={styles.headerSubtitle}>
          Adjust settings to make the app easier to use
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* High Contrast */}
        <SectionCard title="Display">
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>High Contrast Mode</Text>
              <Text style={styles.toggleSubtitle}>
                Stronger borders, darker text, clearer buttons
              </Text>
            </View>
            <Switch
              value={settings.high_contrast}
              onValueChange={(value) =>
                updateSettings({ high_contrast: value })
              }
              trackColor={{
                false: theme.colors.switchBackground,
                true: theme.colors.primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Reduce Animations</Text>
              <Text style={styles.toggleSubtitle}>
                Less motion for sensitive users
              </Text>
            </View>
            <Switch
              value={settings.reduce_animations}
              onValueChange={(value) =>
                updateSettings({ reduce_animations: value })
              }
              trackColor={{
                false: theme.colors.switchBackground,
                true: theme.colors.primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Simplified Interface</Text>
              <Text style={styles.toggleSubtitle}>
                Show fewer options, focus on essentials
              </Text>
            </View>
            <Switch
              value={settings.simplified_ui}
              onValueChange={(value) =>
                updateSettings({ simplified_ui: value })
              }
              trackColor={{
                false: theme.colors.switchBackground,
                true: theme.colors.primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </SectionCard>

        {/* Text Size */}
        <SectionCard title="Text Size">
          <Text style={styles.optionDescription}>
            Choose a text size that is comfortable for you
          </Text>
          <View style={styles.optionGrid}>
            {textSizeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  settings.text_size === option.value &&
                    styles.optionButtonActive,
                ]}
                onPress={() => updateSettings({ text_size: option.value })}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    settings.text_size === option.value &&
                      styles.optionButtonTextActive,
                    {
                      fontSize:
                        option.value === 'small'
                          ? 13
                          : option.value === 'large'
                            ? 18
                            : option.value === 'extraLarge'
                              ? 22
                              : 15,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.previewBox}>
            <Text
              style={[
                styles.previewText,
                {
                  fontSize:
                    settings.text_size === 'small'
                      ? 13
                      : settings.text_size === 'large'
                        ? 20
                        : settings.text_size === 'extraLarge'
                          ? 24
                          : 16,
                },
              ]}
            >
              This is how text will appear in the app
            </Text>
          </View>
        </SectionCard>

        {/* Button Size */}
        <SectionCard title="Button Size">
          <Text style={styles.optionDescription}>
            Larger buttons are easier to tap
          </Text>
          <View style={styles.optionGrid}>
            {buttonSizeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  styles.buttonSizeOption,
                  settings.button_size === option.value &&
                    styles.optionButtonActive,
                  {
                    minHeight:
                      option.value === 'large'
                        ? 56
                        : option.value === 'extraLarge'
                          ? 64
                          : 48,
                  },
                ]}
                onPress={() => updateSettings({ button_size: option.value })}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    settings.button_size === option.value &&
                      styles.optionButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {/* Voice Feedback */}
        <SectionCard title="Audio & Voice">
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Voice Feedback</Text>
              <Text style={styles.toggleSubtitle}>
                Read important information aloud
              </Text>
            </View>
            <Switch
              value={settings.voice_feedback}
              onValueChange={(value) =>
                updateSettings({ voice_feedback: value })
              }
              trackColor={{
                false: theme.colors.switchBackground,
                true: theme.colors.primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
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
  optionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  optionButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSizeOption: {
    minWidth: '30%',
    flex: 1,
  },
  optionButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  optionButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  optionButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  previewBox: {
    marginTop: theme.spacing.base,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
  },
  previewText: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
});
