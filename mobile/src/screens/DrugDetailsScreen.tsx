import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
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

  useEffect(() => {
    (async () => {
      try {
        console.log('[DrugDetails] Fetching drug with ID:', drugId);
        // Import supabase client to fetch by ID
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
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!drug) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Drug not found</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          console.log('[DrugDetails] Back button pressed');
          navigation.goBack();
        }}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.brandName}>{drug.drug_name}</Text>

      {drug.indications && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indications</Text>
          <Text style={styles.sectionText}>{drug.indications}</Text>
        </View>
      )}

      {drug.counseling && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Counseling Points</Text>
          <Text style={styles.sectionText}>{drug.counseling}</Text>
        </View>
      )}

      {drug.adverse_effects && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adverse Effects</Text>
          <Text style={styles.sectionText}>{drug.adverse_effects}</Text>
        </View>
      )}

      {drug.precautions_pregnancy && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precautions (Pregnancy)</Text>
          <Text style={styles.sectionText}>{drug.precautions_pregnancy}</Text>
        </View>
      )}

      {drug.precautions_children && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precautions (Children)</Text>
          <Text style={styles.sectionText}>{drug.precautions_children}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.darkColors.background,
    padding: theme.spacing.base,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.darkColors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.darkColors.mutedForeground,
  },
  errorText: {
    color: theme.darkColors.destructive,
    fontSize: theme.typography.fontSize.lg,
    marginBottom: theme.spacing.md,
  },
  backButton: {
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.darkColors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.darkColors.border,
    alignSelf: 'flex-start',
  },
  backText: {
    color: theme.darkColors.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  brandName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.darkColors.foreground,
    marginBottom: theme.spacing.xs,
  },
  section: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.darkColors.border,
    borderRadius: theme.radius.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.darkColors.foreground,
    marginBottom: theme.spacing.sm,
  },
  sectionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.darkColors.mutedForeground,
    lineHeight: 22,
  },
  button: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    borderColor: theme.darkColors.border,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.darkColors.foreground,
  },
});
