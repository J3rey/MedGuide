import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { findDrugMatchesFromImage } from "../services/matchDrugsFromImage";
import { useScan } from "../contexts/ScanContext";
import type { Drug } from "../types/drug";
import theme from "../styles/theme";

type Props = {
  route: { params: { uri: string } };
  navigation: any;
};

export default function ScanResultsScreen({ route, navigation }: Props) {
  const { uri } = route.params;
  const { setScannedDrug } = useScan();

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Drug[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await findDrugMatchesFromImage(uri);

        if (!mounted) return;
        
        setMatches(res.matches);
        setLoading(false);
        
        // If we found matches, set the drug and go back
        if (res.matches && res.matches.length > 0) {
          const firstMatch = res.matches[0];
          setTimeout(() => {
            if (mounted) {
              setScannedDrug(firstMatch.drug_name);
              navigation.goBack();
            }
          }, 2000);
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "Scan failed. Please try again.");
        setMatches([]);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [uri, navigation, setScannedDrug]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.subtleText}>Scanning...</Text>
      </View>
    );
  }

  const hasMatches = matches.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {hasMatches ? "Possible matches" : "No matches found"}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {hasMatches ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{item.drug_name}</Text>
              {item.indications && (
                <Text style={styles.rowSubtitle} numberOfLines={2}>
                  {item.indications}
                </Text>
              )}
            </View>
          )}
        />
      ) : (
        <Text style={styles.bodyText}>
          Try another photo with better lighting or less glare, or search for the
          drug manually.
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
          onPress={() => navigation.navigate("ManualSearch")}
        >
          <Text style={styles.buttonText}>Manual search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.base,
    backgroundColor: theme.darkColors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.base,
    backgroundColor: theme.darkColors.background,
  },

  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.darkColors.foreground,
    marginBottom: theme.spacing.md,
  },
  bodyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.darkColors.mutedForeground,
    marginTop: theme.spacing.sm,
  },
  subtleText: {
    marginTop: theme.spacing.md,
    color: theme.darkColors.mutedForeground,
  },

  error: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    color: theme.darkColors.destructive,
  },

  list: { paddingTop: theme.spacing.sm },

  row: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.darkColors.border,
  },
  rowTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.darkColors.foreground,
  },
  rowSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.darkColors.mutedForeground,
    marginTop: 3,
  },

  actions: { marginTop: theme.spacing.lg },
  button: {
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    borderColor: theme.darkColors.border,
    alignItems: "center",
  },
  buttonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.darkColors.foreground,
  },
});
