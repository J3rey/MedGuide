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
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t('scanResults.scanning')}</Text>
        </View>
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

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {hasMatches ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.matchCard}
              onPress={() => selectMedication(item)}
              activeOpacity={0.7}
            >
              <View style={styles.matchDot} />
              <Text style={styles.matchName}>{item.drug_name}</Text>
              <View style={styles.matchArrow}>
                <View style={styles.arrowLine} />
                <View style={styles.arrowHead} />
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.noMatchCard}>
          <Text style={styles.noMatchText}>
            {t('scanResults.noMatchesMessage')}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>
            {t('scanResults.retryScan')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('ManualSearch')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>
            {t('scanResults.manualSearch')}
          </Text>
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
  loadingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius['2xl'],
    padding: theme.spacing['3xl'],
    alignItems: 'center',
    gap: theme.spacing.lg,
    ...theme.shadows.card,
  },
  loadingText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.fontSize.base,
  },
  headerSection: {
    marginBottom: theme.spacing.lg,
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
  errorCard: {
    backgroundColor: theme.colors.destructive + '15',
    borderRadius: theme.radius.xl,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.typography.fontSize.sm,
  },
  list: {
    paddingTop: theme.spacing.xs,
    gap: theme.spacing.md,
  },
  matchCard: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  matchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  matchName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
    flex: 1,
  },
  matchArrow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  noMatchCard: {
    backgroundColor: theme.colors.secondaryLight,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.sm,
  },
  noMatchText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    lineHeight:
      theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  actions: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  primaryButton: {
    minHeight: 52,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
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
    minHeight: 52,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    ...theme.shadows.surface,
  },
  secondaryButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
  },
});
