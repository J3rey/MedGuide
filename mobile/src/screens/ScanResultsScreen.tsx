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
import { testSupabaseConnection } from "../services/testSupabase";
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

        // Test Supabase connection first
        console.log("[ScanResults] Testing Supabase connection...");
        await testSupabaseConnection();

        console.log("[ScanResults] Starting scan with URI:", uri);
        const res = await findDrugMatchesFromImage(uri);

        if (!mounted) return;
        
        console.log("[ScanResults] Scan complete. OCR text:", res.ocrText);
        console.log("[ScanResults] Candidates:", res.candidates);
        console.log("[ScanResults] Matches:", res.matches.length);
        
        setMatches(res.matches ?? []);
        setOcrText(res.ocrText ?? "");
        setCandidates(res.candidates ?? []);
      } catch (e: any) {
        if (!mounted) return;

        const msg = String(e?.message ?? "Scan failed. Please try again.");
        
        console.error("[ScanResults] Error:", msg);
        console.error("[ScanResults] Full error:", e);

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
      contentContainerStyle={{ paddingBottom: theme.spacing["2xl"], alignItems: "center" }}
    >
      <Text style={styles.title}>
        {hasMatches ? "Possible matches" : "No matches found"}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Only show recognized text when there are matches */}
      {hasMatches && ocrText && (
        <View style={styles.ocrCard}>
          <Text style={styles.ocrLabel}>OCR text (debug)</Text>
          <Text style={styles.ocrText}>{ocrText}</Text>
        </View>
      )}

      {hasMatches && candidates.length > 0 && (
        <View style={styles.ocrCard}>
          <Text style={styles.ocrLabel}>Candidates (debug)</Text>
          <Text style={styles.ocrText}>{candidates.join(", ")}</Text>
        </View>
      )}

      {hasMatches ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate("DrugDetails", { drugId: item.id })}
            >
              <Text style={styles.rowTitle}>{item.drug_name}</Text>
              <Text style={styles.rowSubtitle}>{item.indications || "No indication info"}</Text>
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
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.darkColors.foreground,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    textAlign: "center",
  },
  bodyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.darkColors.mutedForeground,
    marginTop: theme.spacing.sm,
    textAlign: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  subtleText: {
    marginTop: theme.spacing.md,
    color: theme.darkColors.mutedForeground,
  },

  error: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    color: theme.darkColors.destructive,
    textAlign: "center",
  },

  ocrCard: {
    width: "90%",
    backgroundColor: theme.darkColors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.darkColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ocrLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.darkColors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  ocrText: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.darkColors.primary,
    textAlign: "center",
  },

  list: { 
    paddingTop: theme.spacing.sm,
    width: "100%",
    paddingHorizontal: theme.spacing.base,
  },

  row: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.darkColors.border,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.darkColors.card,
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

  actions: { 
    marginTop: theme.spacing.lg,
    width: "90%",
    alignSelf: "center",
  },
  button: {
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    borderWidth: 1,
    borderRadius: theme.radius.xl,
    borderColor: theme.darkColors.border,
    alignItems: "center",
    backgroundColor: theme.darkColors.card,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.darkColors.foreground,
  },
});
