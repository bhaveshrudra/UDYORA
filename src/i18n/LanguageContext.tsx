import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, TranslationDictionary, SUPPORTED_LANGUAGES, LanguageOption } from './types';
import { TRANSLATIONS } from './translations';

export type StartupState = 'checking' | 'select-language' | 'intro' | 'ready';

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
  switch (lang) {
    case 'en': return 'en-IN';
    case 'hi': return 'hi-IN';
    case 'mr': return 'mr-IN';
    case 'te': return 'te-IN';
    case 'kn': return 'kn-IN';
    default: return 'en-IN';
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [startupState, setStartupState] = useState<StartupState>('checking');
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  // Initial startup verification
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const normalized = normalizeLanguageCode(saved);

      if (process.env.NODE_ENV !== 'production') {
        console.log('[UDYORA STARTUP]', {
          savedLanguage: saved,
          normalized,
          startupState: normalized ? 'intro' : 'select-language'
        });
      }

      if (normalized) {
        setLanguageState(normalized);
        setStartupState('intro');
      } else {
        setStartupState('select-language');
      }
    } catch (err) {
      console.warn('[UDYORA STARTUP] localStorage check failed:', err);
      setStartupState('select-language');
    }
  }, []);

  // Update language at any time (e.g. from header dropdown)
  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        const storageVal = toStorageLanguageCode(lang);
        localStorage.setItem(STORAGE_KEY, storageVal);
      } catch (err) {
        console.warn('Unable to persist language to localStorage:', err);
      }
    }
  };

  // Called when user selects language from startup language screen and clicks Continue
  const selectLanguageAndProceed = (lang: SupportedLanguage) => {
    setLanguage(lang);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[UDYORA STARTUP] Selected language confirmed:', {
        selectedLanguage: lang,
        storageValue: toStorageLanguageCode(lang),
        nextState: 'intro'
      });
    }
    setStartupState('intro');
  };

  // Called when letter-by-letter intro splash finishes
  const completeIntro = () => {
    setStartupState('ready');
  };

  // Dev helper to clear language preference
  const resetLanguagePreference = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setStartupState('select-language');
    if (process.env.NODE_ENV !== 'production') {
      console.log('[UDYORA STARTUP] Language preference reset to select-language.');
    }
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
