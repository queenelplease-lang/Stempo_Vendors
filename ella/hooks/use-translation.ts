import { useTranslation as useI18nTranslation } from 'react-i18next';
import { changeLanguage } from '@/lib/i18n';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const setLanguage = async (language: string) => {
    await changeLanguage(language);
  };

  return {
    t,
    currentLanguage: i18n.language,
    setLanguage,
  };
};
