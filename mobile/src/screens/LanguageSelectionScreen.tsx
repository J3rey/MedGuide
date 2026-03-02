import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import theme from '../styles/theme';
import { RootStackParamList } from '../../App';
import Logo from '../components/Logo';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Language'>;

export default function LanguageSelectionScreen({
  navigation,
}: Props): React.JSX.Element {
  const { t, i18n } = useTranslation();

  const handleLanguageSelect = async (code: string) => {
    await i18n.changeLanguage(code);
    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size={80} />
        <Text style={styles.title}>{t('languageSelection.title')}</Text>
        <Text style={styles.subtitle}>{t('languageSelection.subtitle')}</Text>
      </View>

      <ScrollView
        style={styles.languageList}
        contentContainerStyle={styles.languageListContent}
        showsVerticalScrollIndicator={false}
      >
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            onPress={() => handleLanguageSelect(language.code)}
            style={styles.languageButton}
            activeOpacity={0.7}
          >
            <View style={styles.languageInfo}>
              <Text style={styles.languageName}>{language.nativeName}</Text>
              <Text style={styles.languageSubtext}>{language.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing['5xl'],
    paddingBottom: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    lineHeight:
      theme.typography.lineHeight.normal * theme.typography.fontSize.base,
  },
  languageList: {
    flex: 1,
  },
  languageListContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  languageButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  languageInfo: {
    flexDirection: 'column',
    gap: 4,
  },
  languageName: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.foreground,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  languageSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontWeight: theme.typography.fontWeight.normal,
  },
});
