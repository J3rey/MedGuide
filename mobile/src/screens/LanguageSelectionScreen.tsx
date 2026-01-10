import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import theme from "../styles/theme";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

export default function LanguageSelectionScreen(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();

  const handleSelect = async (code: string) => {
    await i18n.changeLanguage(code);
    navigation.replace("Camera"); // go to camera screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("languageSelection.title")}</Text>
        <Text style={styles.subtitle}>{t("languageSelection.subtitle")}</Text>
      </View>

      <ScrollView
        style={styles.languageList}
        contentContainerStyle={styles.languageListContent}
        showsVerticalScrollIndicator={false}
      >
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            onPress={() => handleSelect(language.code)}
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
  container: { flex: 1, backgroundColor: "#EBF4FF" },
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
  languageList: { flex: 1 },
  languageListContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    // NOTE: gap can cause issues on some RN setups; remove if needed
    gap: theme.spacing.base,
  },
  languageButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    // NOTE: remove gap if it causes red squiggles / runtime issues
    gap: theme.spacing.base,
    ...theme.shadows.base,
  },
  flag: { fontSize: 32 },
  languageName: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.foreground,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
