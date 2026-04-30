import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { searchDrugs } from '../services/drugSearch';
import { useScan } from '../contexts/ScanContext';
import type { Drug } from '../types/drug';
import theme from '../styles/theme';

export default function ManualSearchScreen() {
  const navigation = useNavigation();
  const { setScannedDrug } = useScan();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Drug[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search for suggestions
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setLoading(true);
        setShowSuggestions(true);
        try {
          const results = await searchDrugs(searchQuery.trim());
          setSuggestions(results);
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectDrug = (drug: Drug) => {
    setSelectedDrug(drug);
    setSearchQuery(drug.drug_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAskChatbot = () => {
    if (selectedDrug) {
      setScannedDrug(selectedDrug.drug_name);
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop:
              Math.max(insets.top, theme.spacing.base) + theme.spacing.sm,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('manualSearch.title')}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('manualSearch.searchPlaceholder')}
            placeholderTextColor={theme.colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus={true}
          />
          {loading && (
            <ActivityIndicator
              style={styles.loadingIndicator}
              size="small"
              color={theme.colors.primary}
            />
          )}
        </View>
        <Text style={styles.helperText}>{t('manualSearch.helperText')}</Text>
      </View>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>
            {t('manualSearch.suggestions')}
          </Text>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionCard}
                onPress={() => handleSelectDrug(item)}
                activeOpacity={0.7}
              >
                <View style={styles.suggestionDot} />
                <View style={styles.suggestionInfo}>
                  <Text style={styles.suggestionName}>{item.drug_name}</Text>
                  {item.indications && (
                    <Text style={styles.suggestionSubtext} numberOfLines={1}>
                      {item.indications}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* No Results */}
      {showSuggestions &&
        !loading &&
        suggestions.length === 0 &&
        searchQuery.trim().length >= 2 && (
          <View style={styles.noResultsContainer}>
            <View style={styles.noResultsCard}>
              <Text style={styles.noResultsText}>
                {t('manualSearch.noResults')} "{searchQuery}"
              </Text>
              <Text style={styles.noResultsSubtext}>
                {t('manualSearch.tryAgain')}
              </Text>
            </View>
          </View>
        )}

      {/* Selected Drug */}
      {selectedDrug && !showSuggestions && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedLabel}>
            {t('manualSearch.selectedDrug')}
          </Text>
          <View style={styles.drugCard}>
            <Text style={styles.drugName}>{selectedDrug.drug_name}</Text>

            {selectedDrug.indications && (
              <View style={styles.drugSection}>
                <Text style={styles.drugSectionTitle}>
                  {t('drugDetails.indications')}
                </Text>
                <Text style={styles.drugSectionText}>
                  {selectedDrug.indications}
                </Text>
              </View>
            )}

            {selectedDrug.counseling && (
              <View style={styles.drugSection}>
                <Text style={styles.drugSectionTitle}>
                  {t('drugDetails.counseling')}
                </Text>
                <Text style={styles.drugSectionText}>
                  {selectedDrug.counseling}
                </Text>
              </View>
            )}

            {selectedDrug.adverse_effects && (
              <View style={styles.drugSection}>
                <Text style={styles.drugSectionTitle}>
                  {t('drugDetails.adverseEffects')}
                </Text>
                <Text style={styles.drugSectionText}>
                  {selectedDrug.adverse_effects}
                </Text>
              </View>
            )}

            {selectedDrug.precautions_pregnancy && (
              <View style={styles.drugSection}>
                <Text style={styles.drugSectionTitle}>
                  {t('drugDetails.pregnancyPrecautions')}
                </Text>
                <Text style={styles.drugSectionText}>
                  {selectedDrug.precautions_pregnancy}
                </Text>
              </View>
            )}

            {selectedDrug.precautions_children && (
              <View style={styles.drugSection}>
                <Text style={styles.drugSectionTitle}>
                  {t('drugDetails.childrenPrecautions')}
                </Text>
                <Text style={styles.drugSectionText}>
                  {selectedDrug.precautions_children}
                </Text>
              </View>
            )}

            {selectedDrug.precautions_breastfeeding && (
              <View style={styles.drugSection}>
                <Text style={styles.drugSectionTitle}>
                  {t('drugDetails.breastfeedingPrecautions')}
                </Text>
                <Text style={styles.drugSectionText}>
                  {selectedDrug.precautions_breastfeeding}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleAskChatbot}
            activeOpacity={0.7}
          >
            <Text style={styles.chatButtonText}>
              {t('manualSearch.askChatbot')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: theme.radius['2xl'],
    borderBottomRightRadius: theme.radius['2xl'],
    ...theme.shadows.card,
  },
  backButton: {
    marginBottom: theme.spacing.sm,
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.base,
    ...theme.shadows.surface,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
  },
  loadingIndicator: {
    marginLeft: theme.spacing.sm,
  },
  helperText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  suggestionsTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  suggestionCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.base,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.surface,
  },
  suggestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
  },
  suggestionSubtext: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.xs,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  noResultsCard: {
    backgroundColor: theme.colors.secondaryLight,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  noResultsSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
  },
  selectedContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  selectedLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  drugCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius['2xl'],
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  drugName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.base,
  },
  drugSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  drugSectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  drugSectionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    lineHeight:
      theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  chatButton: {
    backgroundColor: theme.colors.primary,
    minHeight: 52,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.interactive,
  },
  chatButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primaryForeground,
  },
});
