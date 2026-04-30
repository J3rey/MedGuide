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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
          e instanceof Error ? e.message : t('scanResults.scanFailed');
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.subtleText}>{t('scanResults.scanning')}</Text>
      </SafeAreaView>
    );
  }

  const hasMatches = matches.length > 0;

  const selectMedication = (drug: Drug) => {
    setScannedDrug(drug.drug_name);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>
          {hasMatches
            ? t('scanResults.possibleMatches')
            : t('scanResults.noMatchesFound')}
        </Text>

        {hasMatches && (
          <Text style={styles.subtitle}>{t('scanResults.tapToLearnMore')}</Text>
        )}
      </View>

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
              <View style={styles.rowArrow}>
                <View style={styles.arrowLine} />
                <View style={styles.arrowHead} />
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.bodyText}>{t('scanResults.noMatchesMessage')}</Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.primaryButtonText}>{t('scanResults.retryScan')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('ManualSearch')}
        >
          <Text style={styles.secondaryButtonText}>{t('scanResults.manualSearch')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  headerSection: {
    marginBottom: theme.spacing.base,
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
  },
  bodyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.sm,
    lineHeight:
      theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  subtleText: {
    marginTop: theme.spacing.md,
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.fontSize.base,
  },
  error: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    color: theme.colors.destructive,
    fontSize: theme.typography.fontSize.sm,
  },
  list: {
    paddingTop: theme.spacing.sm,
  },
  row: {
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.surface,
  },
  rowTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
    flex: 1,
  },
  rowArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  arrowLine: {
    width: 8,
    height: 1.5,
    backgroundColor: theme.colors.mutedForeground,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 5,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: theme.colors.mutedForeground,
  },
  actions: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  primaryButton: {
    minHeight: 48,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    ...theme.shadows.interactive,
  },
  primaryButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primaryForeground,
  },
  secondaryButton: {
    minHeight: 48,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderRadius: theme.radius.xl,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
  },
  secondaryButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
  },
});
