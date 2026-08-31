import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'udyora_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme: ThemeMode = 'light';

  // Ensure document root classes are strictly light
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
    if (body) {
      body.classList.remove('dark');
      body.setAttribute('data-theme', 'light');
    }

    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleTheme = () => {};
  const setTheme = (_newTheme: ThemeMode) => {};

  const value = useMemo(
    () => ({
      theme,
      isDark: false,
      toggleTheme,
      setTheme
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return safe default fallback if accessed outside ThemeProvider
    return {
      theme: 'light',
      isDark: false,
      toggleTheme: () => {},
      setTheme: () => {}
    };
  }
  return context;
}
