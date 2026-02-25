import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { findDrugMatchesFromImage } from '../services/matchDrugsFromImage';
import { useScan } from '../contexts/ScanContext';
import type { Drug } from '../types/drug';
import theme from '../styles/theme';
import { ScanResultsScreenProps } from '../types/navigation';

export default function ScanResultsScreen({
  route,
  navigation,
}: ScanResultsScreenProps) {
  const { uri } = route.params;
  const { setScannedDrug } = useScan();

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Drug[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        console.log(
          '[ScanResults] Starting scan with URI:',
          uri.substring(0, 50)
        );
        setLoading(true);
        setError(null);

        const res = await findDrugMatchesFromImage(uri);
        console.log(
          '[ScanResults] Scan complete, matches:',
          res.matches.length
        );

        if (!mounted) return;

        setMatches(res.matches);
        setLoading(false);
      } catch (e: unknown) {
        console.error('[ScanResults] Scan error:', e);
        if (!mounted) return;
        const message =
          e instanceof Error ? e.message : 'Scan failed. Please try again.';
        setError(message);
        setMatches([]);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [uri]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <ActivityIndicator />
        <Text style={styles.subtleText}>Scanning...</Text>
      </SafeAreaView>
    );
  }

  const hasMatches = matches.length > 0;

  const selectMedication = (drug: Drug) => {
    // Setting scanned drug will trigger tab switch to chat in DarkMainApp
    setScannedDrug(drug.drug_name);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>
        {hasMatches ? 'Possible matches' : 'No matches found'}
      </Text>

      {hasMatches && (
        <Text style={styles.subtitle}>Tap a medication to learn more</Text>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {hasMatches ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => selectMedication(item)}
            >
              <Text style={styles.rowTitle}>{item.drug_name}</Text>
              {item.indications && (
                <Text style={styles.rowSubtitle} numberOfLines={2}>
                  {item.indications}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.bodyText}>
          Try another photo with better lighting or less glare, or search for
          the drug manually.
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Retry scan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ManualSearch')}
        >
          <Text style={styles.buttonText}>Manual search</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.base,
    backgroundColor: theme.colors.background,
  },

  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.md,
  },
  bodyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.sm,
  },
  subtleText: {
    marginTop: theme.spacing.md,
    color: theme.colors.mutedForeground,
  },

  error: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    color: theme.colors.destructive,
  },

  list: { paddingTop: theme.spacing.sm },

  row: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    marginVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
  },
  rowTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
  },
  rowSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    marginTop: 3,
  },

  actions: { marginTop: theme.spacing.lg },
  button: {
    marginTop: theme.spacing.sm,
    minHeight: 48,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderRadius: theme.radius.xl,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
  },
});
