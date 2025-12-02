import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import theme from "../styles/theme";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
];

interface LanguageSelectionScreenProps {
  onLanguageSelect: (code: string) => void;
}

export default function LanguageSelectionScreen({
  onLanguageSelect,
}: LanguageSelectionScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MedGuide</Text>
        <Text style={styles.subtitle}>Select your preferred language</Text>
      </View>

      <ScrollView
        style={styles.languageList}
        contentContainerStyle={styles.languageListContent}
        showsVerticalScrollIndicator={false}
      >
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            onPress={() => onLanguageSelect(language.code)}
            style={styles.languageButton}
            activeOpacity={0.7}
          >
            <Text style={styles.flag}>{language.flag}</Text>
            <Text style={styles.languageName}>{language.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBF4FF",
  },
  header: {
    alignItems: "center",
    paddingTop: theme.spacing["5xl"],
    paddingBottom: theme.spacing["4xl"],
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: "#2563eb",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
  },
  languageList: {
    flex: 1,
  },
  languageListContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.base,
  },
  languageButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.base,
    ...theme.shadows.base,
  },
  flag: {
    fontSize: 32,
  },
  languageName: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.foreground,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
