import i18n from '../i18n/config';

export interface Medication {
  id: string;
  name: string;
  localizedName?: string;
}

const medicationDatabase: Record<string, Record<string, string>> = {
  'aspirin': {
    en: 'Aspirin',
    zh: '阿司匹林',
    es: 'Aspirina',
    ko: '아스피린',
    it: 'Aspirina',
  },
  'vitamin-d': {
    en: 'Vitamin D',
    zh: '维生素D',
    es: 'Vitamina D',
    ko: '비타민 D',
    it: 'Vitamina D',
  },
  'blood-pressure-med': {
    en: 'Blood Pressure Medication',
    zh: '降压药',
    es: 'Medicamento para la Presión Arterial',
    ko: '혈압약',
    it: 'Farmaco per la Pressione Sanguigna',
  },
  'metformin': {
    en: 'Metformin',
    zh: '二甲双胍',
    es: 'Metformina',
    ko: '메트포르민',
    it: 'Metformina',
  },
  'ibuprofen': {
    en: 'Ibuprofen',
    zh: '布洛芬',
    es: 'Ibuprofeno',
    ko: '이부프로펜',
    it: 'Ibuprofene',
  },
  'amoxicillin': {
    en: 'Amoxicillin',
    zh: '阿莫西林',
    es: 'Amoxicilina',
    ko: '아목시실린',
    it: 'Amoxicillina',
  },
};

export function getLocalizedMedicationName(medicationId: string, language?: string): string {
  const lang = language || i18n.language;
  const medTranslations = medicationDatabase[medicationId.toLowerCase()];
  
  if (medTranslations && medTranslations[lang]) {
    return medTranslations[lang];
  }
  
  return medTranslations?.en || medicationId;
}

export function searchMedications(query: string, language?: string): Medication[] {
  const lang = language || i18n.language;
  const results: Medication[] = [];
  
  Object.keys(medicationDatabase).forEach((medId) => {
    const translations = medicationDatabase[medId];
    const localizedName = translations[lang] || translations.en;
    
    if (
      localizedName.toLowerCase().includes(query.toLowerCase()) ||
      medId.toLowerCase().includes(query.toLowerCase())
    ) {
      results.push({
        id: medId,
        name: translations.en,
        localizedName: localizedName,
      });
    }
  });
  
  return results;
}

export function addMedicationTranslation(medicationId: string, translations: Record<string, string>): void {
  medicationDatabase[medicationId.toLowerCase()] = translations;
}
