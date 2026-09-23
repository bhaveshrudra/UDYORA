import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, TranslationDictionary, SUPPORTED_LANGUAGES, LanguageOption } from './types';
import { TRANSLATIONS } from './translations';

export type StartupState = 'hero-entry' | 'select-language' | 'ready';

export interface LanguageContextType {
  language: SupportedLanguage;
  startupState: StartupState;
  setLanguage: (lang: SupportedLanguage) => void;
  selectLanguageAndProceed: (lang: SupportedLanguage) => void;
  completeHeroEntry: () => void;
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
  // Read stored language synchronously
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const normalized = normalizeLanguageCode(saved);
        if (normalized) return normalized;
      } catch (e) { /* fallback */ }
    }
    return 'en';
  });

  // Determine if language is already stored
  const [hasStoredLanguage] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return !!normalizeLanguageCode(saved);
      } catch (e) { /* fallback */ }
    }
    return false;
  });

  // Startup flow:
  //   1. 'hero-entry' → Show the signature letter-by-letter entry animation FIRST on website open
  //   2. 'select-language' → When intro completes, ask language preferences
  //   3. 'ready' → Show the app in the confirmed language
  const [startupState, setStartupState] = useState<StartupState>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        return 'ready';
      }
    }
    return 'hero-entry';
  });

  // Boot log
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const normalized = normalizeLanguageCode(saved);
    console.log('[UDYORA BOOT]', {
      startupState: 'hero-entry',
      hasStoredLanguage: !!normalized,
      storedLanguage: saved || 'none',
    });
  }, []);

  // Called when HeroEntry animation completes
  const completeHeroEntry = () => {
    setStartupState('select-language');
    console.log('[UDYORA BOOT] Hero entry complete → select-language');
  };

  // Update language at any time
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

  // Called when user selects language and clicks Continue
  const selectLanguageAndProceed = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setStartupState('ready');
    console.log('[UDYORA BOOT] Language confirmed:', lang, '→ Ready');
  };

  // Helper to clear language preference and re-trigger language selection
  const resetLanguagePreference = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setStartupState('hero-entry');
    console.log('[UDYORA BOOT] Language preference reset → hero-entry');
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
        completeHeroEntry,
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
