import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import he from './locales/he.json';

const LANGUAGE_KEY = '@stempo:language';

export const SUPPORTED_LANGUAGES = ['en', 'he'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const isSupported = (lang: string | null | undefined): lang is SupportedLanguage =>
  !!lang && (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);

/**
 * Best-effort device language detection without an extra native dependency.
 * Falls back to 'en' if the platform locale can't be resolved or isn't supported.
 */
const detectDeviceLanguage = (): SupportedLanguage => {
  try {
    let locale: string | undefined;
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings;
      locale = settings?.AppleLocale || settings?.AppleLanguages?.[0];
    } else if (Platform.OS === 'android') {
      locale = NativeModules.I18nManager?.localeIdentifier;
    }
    const code = locale?.toString().split(/[-_]/)[0]?.toLowerCase();
    return isSupported(code) ? code : 'en';
  } catch {
    return 'en';
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
  },
  lng: detectDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

// Restore user-selected language asynchronously (overrides device default)
AsyncStorage.getItem(LANGUAGE_KEY)
  .then((savedLanguage) => {
    if (isSupported(savedLanguage) && i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  })
  .catch(() => {
    // Ignore storage errors; keep the detected language.
  });

export const changeLanguage = async (language: string) => {
  if (!isSupported(language)) return;
  await i18n.changeLanguage(language);
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Ignore storage errors; in-memory language has already changed.
  }
};

export default i18n;
