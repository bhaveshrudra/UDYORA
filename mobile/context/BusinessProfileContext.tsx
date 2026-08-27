import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BusinessProfile,
  UserContext,
  CanonicalBusinessCategory,
  BusinessIntent,
  BusinessExperience,
  ExpectedScale,
  LocationResolution
} from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from './AuthContext';
import { useLocation } from './LocationContext';
import { SEEDED_LOCALITIES } from '../services/locationService';

export const BUSINESS_PROFILE_STORAGE_KEY = 'udyora_business_profile';

interface BusinessProfileContextType {
  profile: BusinessProfile;
  userContext: UserContext;
  isProfileConfirmed: boolean;
  setProfile: (profile: BusinessProfile) => void;
  updateProfile: (partial: Partial<BusinessProfile>) => void;
  setCategory: (category: CanonicalBusinessCategory) => void;
  setCapital: (capital: number) => void;
  setIntent: (intent: BusinessIntent) => void;
  setExperience: (exp: BusinessExperience) => void;
  setScale: (scale: ExpectedScale) => void;
  confirmProfile: () => Promise<void>;
  resetProfile: () => Promise<void>;
}

const BusinessProfileContext = createContext<BusinessProfileContextType | undefined>(undefined);

export const BusinessProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentLanguage } = useLanguage();
  const { authStatus, user } = useAuth();
  const { selectedLocation } = useLocation();

  const [profile, setProfileState] = useState<BusinessProfile>({
    businessCategory: 'Dairy',
    businessName: 'Dairy Enterprise',
    businessDescription: 'Commercial micro dairy farming with high-yield milch cows.',
    businessIntent: 'START',
    experience: 'SOME_EXPERIENCE',
    existingBusiness: { exists: false },
    expectedScale: 'MICRO',
    availableCapital: 100000,
    location: selectedLocation || SEEDED_LOCALITIES[0],
    language: currentLanguage,
    inputSource: 'FORM',
    confidence: {
      category: 0.95,
      capital: 0.98,
      location: 0.95
    },
    missingFields: [],
    updatedAt: new Date().toISOString()
  });

  const [isProfileConfirmed, setIsProfileConfirmed] = useState<boolean>(false);

  // Sync with Location and Language changes
  useEffect(() => {
    setProfileState((prev) => ({
      ...prev,
      location: selectedLocation || prev.location,
      language: currentLanguage
    }));
  }, [selectedLocation, currentLanguage]);

  // Load stored profile if available
  useEffect(() => {
    const loadStored = async () => {
      try {
        const stored = await AsyncStorage.getItem(BUSINESS_PROFILE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfileState(parsed);
          setIsProfileConfirmed(true);
        }
      } catch (err) {
        console.warn('Failed to load stored business profile:', err);
      }
    };
    loadStored();
  }, []);

  const setProfile = (newProfile: BusinessProfile) => {
    setProfileState(newProfile);
  };

  const updateProfile = (partial: Partial<BusinessProfile>) => {
    setProfileState((prev) => ({
      ...prev,
      ...partial,
      updatedAt: new Date().toISOString()
    }));
  };

  const setCategory = (category: CanonicalBusinessCategory) => {
    updateProfile({
      businessCategory: category,
      businessName: `${category} Enterprise`
    });
  };

  const setCapital = (capital: number) => {
    updateProfile({ availableCapital: capital });
  };

  const setIntent = (intent: BusinessIntent) => {
    updateProfile({ businessIntent: intent });
  };

  const setExperience = (exp: BusinessExperience) => {
    updateProfile({ experience: exp });
  };

  const setScale = (scale: ExpectedScale) => {
    updateProfile({ expectedScale: scale });
  };

  const confirmProfile = async () => {
    setIsProfileConfirmed(true);
    try {
      await AsyncStorage.setItem(BUSINESS_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (err) {
      console.warn('Failed to persist profile:', err);
    }
  };

  const resetProfile = async () => {
    setIsProfileConfirmed(false);
    try {
      await AsyncStorage.removeItem(BUSINESS_PROFILE_STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to reset profile:', err);
    }
  };

  // Compile full canonical UserContext
  const userContext: UserContext = {
    language: currentLanguage,
    authState: {
      isAuthenticated: authStatus === 'authenticated',
      isGuest: authStatus === 'guest',
      user
    },
    locationContext: profile.location,
    businessProfile: profile,
    readyForAnalysis:
      !!profile.businessCategory &&
      profile.availableCapital > 0 &&
      !!profile.location,
    preparedAt: new Date().toISOString()
  };

  return (
    <BusinessProfileContext.Provider
      value={{
        profile,
        userContext,
        isProfileConfirmed,
        setProfile,
        updateProfile,
        setCategory,
        setCapital,
        setIntent,
        setExperience,
        setScale,
        confirmProfile,
        resetProfile
      }}
    >
      {children}
    </BusinessProfileContext.Provider>
  );
};

export const useBusinessProfile = (): BusinessProfileContextType => {
  const context = useContext(BusinessProfileContext);
  if (!context) {
    throw new Error('useBusinessProfile must be used within a BusinessProfileProvider');
  }
  return context;
};
