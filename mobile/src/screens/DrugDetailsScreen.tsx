import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Drug } from '../types/drug';
import theme from '../styles/theme';

type RootStackParamList = {
  DrugDetails: { drugId: string };
};

type Props = {
  route: { params: { drugId: string } };
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function DrugDetailsScreen({ route, navigation }: Props) {
  const { drugId } = route.params;
  const [drug, setDrug] = useState<Drug | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      try {
        console.log('[DrugDetails] Fetching drug with ID:', drugId);
        const { createClient } = await import('@supabase/supabase-js');
        const Constants = await import('expo-constants');

        const supabaseUrl =
          Constants.default.expoConfig?.extra?.supabaseUrl ||
          process.env.EXPO_PUBLIC_SUPABASE_URL ||
          'https://kzqqeodwdpqlsgvydqyb.supabase.co';
        const supabaseKey =
          Constants.default.expoConfig?.extra?.supabaseAnonKey ||
          process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cXFlb2R3ZHBxbHNndnlkcXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3Mzk0NjEsImV4cCI6MjA1MzMxNTQ2MX0.3rRRlp-0cOTPJX_xAKzA0YWgS1qAy8x1EiOMb8gI1AI';

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from('drugs')
          .select('*')
          .eq('id', Number(drugId))
          .single();

        if (error) {
          console.error('[DrugDetails] Error:', error);
          setDrug(null);
        } else {
          console.log('[DrugDetails] Loaded drug:', data);
          setDrug(data);
        }
      } catch (error) {
        console.error('[DrugDetails] Failed to load drug details:', error);
        setDrug(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [drugId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('drugDetails.loading')}</Text>
      </View>
    );
  }

  if (!drug) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t('drugDetails.notFound')}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>{t('drugDetails.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: Math.max(insets.top, theme.spacing.base) }}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          console.log('[DrugDetails] Back button pressed');
          navigation.goBack();
        }}
      >
        <Text style={styles.backText}>{t('common.back')}</Text>
      </TouchableOpacity>

      <Text style={styles.brandName}>{drug.drug_name}</Text>

      {drug.indications && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('drugDetails.indications')}
          </Text>
          <Text style={styles.sectionText}>{drug.indications}</Text>
        </View>
      )}

      {drug.counseling && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('drugDetails.counselingPoints')}
          </Text>
          <Text style={styles.sectionText}>{drug.counseling}</Text>
        </View>
      )}

      {drug.adverse_effects && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('drugDetails.adverseEffects')}
          </Text>
          <Text style={styles.sectionText}>{drug.adverse_effects}</Text>
        </View>
      )}

      {drug.precautions_pregnancy && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('drugDetails.precautionsPregnancy')}
          </Text>
          <Text style={styles.sectionText}>{drug.precautions_pregnancy}</Text>
        </View>
      )}

      {drug.precautions_children && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('drugDetails.precautionsChildren')}
          </Text>
          <Text style={styles.sectionText}>{drug.precautions_children}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.fontSize.base,
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.typography.fontSize.lg,
    marginBottom: theme.spacing.md,
  },
  backButton: {
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignSelf: 'flex-start',
  },
  backText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  brandName: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.base,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.card,
    ...theme.shadows.surface,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  sectionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    lineHeight:
      theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  button: {
    marginTop: theme.spacing.md,
    minHeight: 48,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    ...theme.shadows.interactive,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primaryForeground,
  },
});
