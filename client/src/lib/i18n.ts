import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import de from "@/locales/de.json";
import fr from "@/locales/fr.json";
import en from "@/locales/en.json";
import lb from "@/locales/lb.json";

const resources = { de: { translation: de }, fr: { translation: fr }, en: { translation: en }, lb: { translation: lb } };

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "de",
    supportedLngs: ["de", "fr", "en", "lb"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "m75_lang",
    },
  });

export default i18n;
