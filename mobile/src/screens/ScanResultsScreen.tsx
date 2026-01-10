import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { findDrugMatchesFromImage } from "../services/matchDrugsFromImage";
import type { Drug } from "../types/drug";
import theme from "../styles/theme";

type Props = {
  route: { params: { uri: string } };
  navigation: any;
};

export default function ScanResultsScreen({ route, navigation }: Props) {
  const { uri } = route.params;

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Drug[]>([]);
  const [error, setError] = useState<string | null>(null);

  // debug info (so you can see what Gemini read)
  const [ocrText, setOcrText] = useState("");
  const [candidates, setCandidates] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        setOcrText("");
        setCandidates([]);

        const res = await findDrugMatchesFromImage(uri);

        if (!mounted) return;
        setMatches(res.matches ?? []);
        setOcrText(res.ocrText ?? "");
        setCandidates(res.candidates ?? []);
      } catch (e: any) {
        if (!mounted) return;

        const msg = String(e?.message ?? "Scan failed. Please try again.");

        // Ignore Expo "deprecated expo-file-system" warning
        if (
          msg.toLowerCase().includes("deprecated") &&
          msg.toLowerCase().includes("expo-file-system")
        ) {
          setError(null);
        } else {
          setError(msg);
        }

        setMatches([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [uri]);

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: theme.spacing["2xl"] }}
    >
      <Text style={styles.title}>
        {hasMatches ? "Possible matches" : "No matches found"}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* DEBUG (remove later) */}
      <View style={styles.debugBox}>
        <Text style={styles.debugTitle}>OCR text (debug)</Text>
        <Text style={styles.debugText}>{ocrText || "(empty)"}</Text>

        <Text style={[styles.debugTitle, { marginTop: theme.spacing.sm }]}>
          Candidates (debug)
        </Text>
        <Text style={styles.debugText}>
          {candidates.length ? candidates.join(", ") : "(none)"}
        </Text>
      </View>

      {hasMatches ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate("DrugDetails", { drugId: item.id })}
            >
              <Text style={styles.rowTitle}>{item.brandName}</Text>
              <Text style={styles.rowSubtitle}>{item.genericName}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.bodyText}>
          Try another photo with better lighting or less glare, or search for the
          drug manually.
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Retry scan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("ManualSearch")}
        >
          <Text style={styles.buttonText}>Manual search</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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

  debugBox: {
    borderWidth: 1,
    borderColor: theme.darkColors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  debugTitle: {
    color: theme.darkColors.foreground,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: 6,
  },
  debugText: {
    color: theme.darkColors.mutedForeground,
    fontSize: theme.typography.fontSize.sm,
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
