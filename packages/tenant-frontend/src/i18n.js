import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import translationEN from "./locales/en/translation.json";
import translationTA from "./locales/ta/translation.json";
import translationSI from "./locales/si/translation.json";
i18n
  // Detect user language
  // Learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Init i18next
  // For all options read: https://www.i18next.com/overview/configuration-options
  .init({
    // Set to true to see logs in the console, useful during development
    debug: true,

    // The default language to use if a translation is missing for the current language
    fallbackLng: "en",

    // React already does escaping to prevent XSS, so we can disable this
    interpolation: {
      escapeValue: false,
    },

    // This is where our translations will live.
    // We will populate this in the next step.
    resources: {
      // English translations will go here
      en: {
        translation: translationEN,
      },
      ta: {
        translation: translationTA,
      },
      si: {
        translation: translationSI,
      },
      // Spanish translations will go here
      es: {
        translation: {
          welcomeMessage: "Bienvenido a iShopMaster",
        },
      },
    },
  });

export default i18n;
