import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStatus, UserProfile } from '../types';
import { authService } from '../services/authService';
import { LANGUAGE_STORAGE_KEY } from '../i18n/LanguageContext';

export const AUTH_STORAGE_KEY = 'udyora_auth_session';

interface AuthContextType {
  authStatus: AuthStatus;
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, phoneOrEmail: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  resetAllState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unauthenticated');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as UserProfile;
          setUser(parsed);
          setAuthStatus(parsed.isGuest ? 'guest' : 'authenticated');
        } else {
          setAuthStatus('unauthenticated');
        }
      } catch (err) {
        console.warn('Failed to load stored auth session:', err);
        setAuthStatus('unauthenticated');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await authService.signIn(email, pass);
      if (res.success && res.user) {
        setUser(res.user);
        setAuthStatus('authenticated');
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: res.error || 'Authentication failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to service' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, phoneOrEmail: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await authService.register(name, phoneOrEmail, pass);
      if (res.success && res.user) {
        setUser(res.user);
        setAuthStatus('authenticated');
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: res.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to create account' };
    } finally {
      setIsLoading(false);
    }
  };

  const continueAsGuest = async () => {
    setIsLoading(true);
    try {
      const guestProfile = await authService.loginAsGuest();
      setUser(guestProfile);
      setAuthStatus('guest');
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(guestProfile));
    } catch (err) {
      console.warn('Guest login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setAuthStatus('unauthenticated');
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (err) {
      console.warn('Sign out failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAllState = async () => {
    try {
      await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setAuthStatus('unauthenticated');
    } catch (err) {
      console.warn('Reset all state failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        user,
        isLoading,
        signIn,
        register,
        continueAsGuest,
        signOut,
        resetAllState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
