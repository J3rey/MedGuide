import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { searchDrugs } from "../services/drugSearch";
import type { Drug } from "../types/drug";
import theme from "../styles/theme";

type Props = {
  route: { params: { drugId: string } };
  navigation: any;
};

export default function DrugDetailsScreen({ route, navigation }: Props) {
  const { drugId } = route.params;
  const [drug, setDrug] = useState<Drug | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Simple lookup by ID - in real app, you'd have a getDrugById API
        const results = await searchDrugs(drugId.replace(/-/g, " "));
        setDrug(results[0] || null);
      } catch (error) {
        console.error("Failed to load drug details:", error);
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
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.brandName}>{drug.brandName}</Text>
      <Text style={styles.genericName}>{drug.genericName}</Text>

      {drug.precautions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precautions</Text>
          <Text style={styles.sectionText}>{drug.precautions}</Text>
        </View>
      )}

      {drug.adverseEffects && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adverse Effects</Text>
          <Text style={styles.sectionText}>{drug.adverseEffects}</Text>
        </View>
      )}

      {drug.counselling && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Counselling Points</Text>
          <Text style={styles.sectionText}>{drug.counselling}</Text>
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
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: theme.spacing.md,
  },
  backText: {
    color: theme.darkColors.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  brandName: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.darkColors.foreground,
    marginBottom: theme.spacing.xs,
  },
  genericName: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.darkColors.mutedForeground,
    marginBottom: theme.spacing.xl,
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
