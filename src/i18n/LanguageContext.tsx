import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SupportedLanguage, TranslationDictionary, SUPPORTED_LANGUAGES, LanguageOption } from './types';
import { TRANSLATIONS } from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  hasSelectedLanguage: boolean;
  confirmInitialLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof TranslationDictionary, params?: Record<string, string | number>) => string;
  supportedLanguages: LanguageOption[];
}

const STORAGE_KEY = 'udyora_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return !!(saved && ['en', 'hi', 'mr', 'te', 'kn'].includes(saved));
      } catch {
        return false;
      }
    }
    return false;
  });

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
        if (saved && ['en', 'hi', 'mr', 'te', 'kn'].includes(saved)) {
          return saved;
        }
      } catch {
        return 'en';
      }
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (err) {
        console.warn('Unable to persist language to localStorage:', err);
      }
    }
  };

  const confirmInitialLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setHasSelectedLanguage(true);
  };

  // Translation lookup with fallback and interpolation
  const t = (key: keyof TranslationDictionary, params?: Record<string, string | number>): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    let template = langDict[key];

    if (!template) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[i18n] Missing translation key "${key}" for language "${language}". Using English fallback.`);
      }
      template = TRANSLATIONS.en[key] || (key as string);
    }

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        const regex = new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g');
        template = template.replace(regex, String(paramVal));
      });
    }

    return template;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        hasSelectedLanguage,
        confirmInitialLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
