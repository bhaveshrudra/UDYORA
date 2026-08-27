import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageTag, LanguageCode, SupportedLanguageInfo } from '../types';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from './translations';

export const LANGUAGE_STORAGE_KEY = 'udyora_language';

interface LanguageContextType {
  currentLanguage: LanguageTag;
  languageCode: LanguageCode;
  supportedLanguages: SupportedLanguageInfo[];
  isLanguageInitialized: boolean;
  hasStoredLanguage: boolean;
  setLanguage: (tag: LanguageTag) => Promise<void>;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageTag>('en-IN');
  const [isLanguageInitialized, setIsLanguageInitialized] = useState<boolean>(false);
  const [hasStoredLanguage, setHasStoredLanguage] = useState<boolean>(false);

  useEffect(() => {
    const loadStoredLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored && ['en-IN', 'hi-IN', 'mr-IN', 'te-IN', 'kn-IN'].includes(stored)) {
          setCurrentLanguageState(stored as LanguageTag);
          setHasStoredLanguage(true);
        } else {
          setHasStoredLanguage(false);
        }
      } catch (err) {
        console.warn('Failed to load stored language from AsyncStorage:', err);
        setHasStoredLanguage(false);
      } finally {
        setIsLanguageInitialized(true);
      }
    };

    loadStoredLanguage();
  }, []);

  const setLanguage = async (tag: LanguageTag) => {
    setCurrentLanguageState(tag);
    setHasStoredLanguage(true);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, tag);
    } catch (err) {
      console.warn('Failed to persist language in AsyncStorage:', err);
    }
  };

  const getLanguageCode = (tag: LanguageTag): LanguageCode => {
    const match = SUPPORTED_LANGUAGES.find((l) => l.tag === tag);
    return match ? match.code : 'EN';
  };

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS['en-IN'];
    if (dict && dict[key]) {
      return dict[key];
    }
    const fallbackDict = TRANSLATIONS['en-IN'];
    if (fallbackDict && fallbackDict[key]) {
      return fallbackDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        languageCode: getLanguageCode(currentLanguage),
        supportedLanguages: SUPPORTED_LANGUAGES,
        isLanguageInitialized,
        hasStoredLanguage,
        setLanguage,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
