// src/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Optional: if you installed expo-localization
// import * as Localization from "expo-localization";

const resources = {
  en: {
    translation: {
      languageSelection: {
        title: "Choose your language",
        subtitle: "Select a language to continue",
      },
    },
  },
  zh: {
    translation: {
      languageSelection: {
        title: "选择语言",
        subtitle: "选择一种语言以继续",
      },
    },
  },
  ko: {
    translation: {
      languageSelection: {
        title: "언어 선택",
        subtitle: "계속하려면 언어를 선택하세요",
      },
    },
  },
  es: {
    translation: {
      languageSelection: {
        title: "Elige tu idioma",
        subtitle: "Selecciona un idioma para continuar",
      },
    },
  },
  it: {
    translation: {
      languageSelection: {
        title: "Scegli la lingua",
        subtitle: "Seleziona una lingua per continuare",
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // or: Localization.locale.split("-")[0]
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // IMPORTANT for React
    },
  });

export default i18n;
