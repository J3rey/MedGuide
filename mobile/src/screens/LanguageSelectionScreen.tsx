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
import { useLanguage } from '../contexts/LanguageContext';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '\u4e2d\u6587' },
  { code: 'ko', name: 'Korean', nativeName: '\ud55c\uad6d\uc5b4' },
  { code: 'es', name: 'Spanish', nativeName: 'Espa\u00f1ol' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'hi', name: 'Hindi', nativeName: '\u0939\u093f\u0928\u094d\u0926\u0940' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Language'>;

export default function LanguageSelectionScreen({
  navigation,
}: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { changeLanguage } = useLanguage();

  const handleLanguageSelect = async (code: string) => {
    await changeLanguage(code);
    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      {/* Decorative gradient blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <View style={styles.header}>
        <Logo size={72} />
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
            <View style={styles.arrow}>
              <View style={styles.arrowLine} />
              <View style={styles.arrowHead} />
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
    overflow: 'hidden',
  },
  // Decorative blobs for warmth
  blobTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.gradientEnd,
    opacity: 0.6,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: theme.colors.gradientStart,
    opacity: 0.5,
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing['5xl'],
    paddingBottom: theme.spacing['2xl'],
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
    paddingBottom: theme.spacing['3xl'],
    gap: theme.spacing.md,
  },
  languageButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.card,
  },
  languageInfo: {
    flexDirection: 'column',
    gap: theme.spacing.xs,
    flex: 1,
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
  arrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowLine: {
    width: 10,
    height: 1.5,
    backgroundColor: theme.colors.primary,
    borderRadius: 1,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 5,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: theme.colors.primary,
  },
});
