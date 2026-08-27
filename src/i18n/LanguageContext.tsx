import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, TranslationDictionary, SUPPORTED_LANGUAGES, LanguageOption } from './types';
import { TRANSLATIONS } from './translations';

export type StartupState = 'checking' | 'select-language' | 'ready';

export interface LanguageContextType {
  language: SupportedLanguage;
  startupState: StartupState;
  setLanguage: (lang: SupportedLanguage) => void;
  selectLanguageAndProceed: (lang: SupportedLanguage) => void;
  completeIntro: () => void;
  resetLanguagePreference: () => void;
  t: (key: keyof TranslationDictionary, params?: Record<string, string | number>) => string;
  supportedLanguages: LanguageOption[];
}

export const STORAGE_KEY = 'udyora_language';

export function normalizeLanguageCode(code: string | null | undefined): SupportedLanguage | null {
  if (!code) return null;
  const clean = code.trim().toLowerCase();
  if (clean === 'en' || clean === 'en-in') return 'en';
  if (clean === 'hi' || clean === 'hi-in') return 'hi';
  if (clean === 'mr' || clean === 'mr-in') return 'mr';
  if (clean === 'te' || clean === 'te-in') return 'te';
  if (clean === 'kn' || clean === 'kn-in') return 'kn';
  return null;
}

export function toStorageLanguageCode(lang: SupportedLanguage): string {
  return lang;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Synchronous initial state reading from localStorage (zero flash of wrong language on load)
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const normalized = normalizeLanguageCode(saved);
        if (normalized) return normalized;
      } catch (e) {
        // Fallback to English if localStorage is unavailable
      }
    }
    return 'en';
  });

  const [startupState, setStartupState] = useState<StartupState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const normalized = normalizeLanguageCode(saved);
        if (normalized) {
          return 'ready'; // Returning user: Home page directly in saved language
        }
      } catch (e) {
        // Fallback
      }
      return 'select-language'; // First-time user: Language Selection screen first
    }
    return 'checking';
  });

  // Verify storage on mount (handling cross-tab changes)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const normalized = normalizeLanguageCode(saved);

      if (normalized) {
        setLanguageState(normalized);
        setStartupState('ready');
      } else {
        setStartupState('select-language');
      }
    } catch (err) {
      setStartupState('select-language');
    }
  }, []);

  // Update language at any time (e.g. from header selector)
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

  // Called when first-time user selects language and clicks Continue
  const selectLanguageAndProceed = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setStartupState('ready'); // Navigate straight to UDYORA Home in chosen language
  };

  const completeIntro = () => {
    setStartupState('ready');
  };

  // Helper to clear language preference (triggers language screen on next load)
  const resetLanguagePreference = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setStartupState('select-language');
  };

  // Translation lookup with fallback and parameter interpolation
  const t = (key: keyof TranslationDictionary, params?: Record<string, string | number>): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    let template = langDict[key];

    if (!template) {
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
        startupState,
        setLanguage,
        selectLanguageAndProceed,
        completeIntro,
        resetLanguagePreference,
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
