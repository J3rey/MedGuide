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
import { searchDrugs } from '../services/drugSearch';
import { useScan } from '../contexts/ScanContext';
import type { Drug } from '../types/drug';
import theme from '../styles/theme';

export default function ManualSearchScreen() {
  const navigation = useNavigation();
  const { setScannedDrug } = useScan();

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
    }, 300); // 300ms debounce

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
      // Navigate back to main app, which will switch to chat tab
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manual Drug Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Type drug name..."
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

      <View style={styles.helperText}>
        <Text style={styles.helperTextContent}>
          💡 Type at least 2 characters. Suggestions will appear as you type to
          help with spelling.
        </Text>
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggestions:</Text>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectDrug(item)}
              >
                <Text style={styles.suggestionName}>{item.drug_name}</Text>
                {item.indications && (
                  <Text style={styles.suggestionSubtext} numberOfLines={1}>
                    {item.indications}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {showSuggestions &&
        !loading &&
        suggestions.length === 0 &&
        searchQuery.trim().length >= 2 && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No drugs found matching "{searchQuery}"
            </Text>
            <Text style={styles.noResultsSubtext}>
              Try checking the spelling or use fewer characters
            </Text>
          </View>
        )}

      {selectedDrug && !showSuggestions && (
        <View style={styles.selectedDrugContainer}>
          <Text style={styles.selectedDrugTitle}>Selected Drug:</Text>
          <View style={styles.drugCard}>
            <Text style={styles.drugName}>{selectedDrug.drug_name}</Text>

            {selectedDrug.indications && (
              <View style={styles.drugSection}>
                <Text style={styles.drugSectionTitle}>Indications:</Text>
                <Text style={styles.drugSectionText}>
                  {selectedDrug.indications}
                </Text>
              </View>
            )}

            {selectedDrug.counseling && (
              <View style={styles.drugSection}>
                <Text style={styles.drugSectionTitle}>Counseling:</Text>
                <Text style={styles.drugSectionText}>
                  {selectedDrug.counseling}
                </Text>
              </View>
            )}

            {selectedDrug.adverse_effects && (
              <View style={styles.drugSection}>
                <Text style={styles.drugSectionTitle}>Adverse Effects:</Text>
                <Text style={styles.drugSectionText}>
                  {selectedDrug.adverse_effects}
                </Text>
              </View>
            )}

            {selectedDrug.precautions_pregnancy && (
              <View style={styles.drugSection}>
                <Text style={styles.drugSectionTitle}>
                  Pregnancy Precautions:
                </Text>
                <Text style={styles.drugSectionText}>
                  {selectedDrug.precautions_pregnancy}
                </Text>
              </View>
            )}

            {selectedDrug.precautions_children && (
              <View style={styles.drugSection}>
                <Text style={styles.drugSectionTitle}>
                  Children Precautions:
                </Text>
                <Text style={styles.drugSectionText}>
                  {selectedDrug.precautions_children}
                </Text>
              </View>
            )}

            {selectedDrug.precautions_breastfeeding && (
              <View style={styles.drugSection}>
                <Text style={styles.drugSectionTitle}>
                  Breastfeeding Precautions:
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
          >
            <Text style={styles.chatButtonText}>
              Ask Chatbot About This Drug
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
    paddingTop: 60,
    paddingHorizontal: theme.spacing.base,
    paddingBottom: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginBottom: theme.spacing.sm,
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.base,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.base,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loadingIndicator: {
    marginLeft: theme.spacing.sm,
  },
  helperText: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.sm,
  },
  helperTextContent: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.base,
  },
  suggestionsTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
  },
  suggestionItem: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.base,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  suggestionName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
  },
  suggestionSubtext: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
    marginTop: 4,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
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
  selectedDrugContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.base,
  },
  selectedDrugTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
  },
  drugCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  drugName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.base,
  },
  drugSection: {
    marginTop: theme.spacing.sm,
  },
  drugSectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  drugSectionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    lineHeight: 20,
  },
  chatButton: {
    backgroundColor: theme.colors.primary,
    minHeight: 48,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.xl,
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
