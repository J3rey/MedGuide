import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import ko from './locales/ko.json';
import it from './locales/it.json';
import id from './locales/id.json';
import hi from './locales/hi.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
    es: { translation: es },
    ko: { translation: ko },
    it: { translation: it },
    id: { translation: id },
    hi: { translation: hi },
  },
  lng: 'en',
  fallbackLng: 'en',
  compatibilityJSON: 'v3', // Use v3 format for better compatibility with polyfill
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
