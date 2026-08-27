import React, { createContext, useState, useContext, ReactNode } from 'react';
import {
  LanguageTag,
  LocationResolution,
  BusinessInputData,
  BusinessCategory,
  PermissionsState,
  PermissionStatus
} from '../types';
import { BUSINESS_CATEGORIES } from '../utils/constants';
import { SEEDED_LOCALITIES } from '../services/locationService';

interface AppContextType {
  // Permissions State
  permissions: PermissionsState;
  requestLocationPermission: () => Promise<PermissionStatus>;
  requestMicrophonePermission: () => Promise<PermissionStatus>;

  // Location State
  location: LocationResolution;
  setLocation: (loc: LocationResolution) => void;

  // Business Input State
  businessInput: BusinessInputData;
  setBusinessInput: (data: Partial<BusinessInputData>) => void;
  setBusinessCategory: (category: BusinessCategory) => void;
  setAvailableCapital: (capital: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permissions, setPermissionsState] = useState<PermissionsState>({
    location: 'unknown',
    microphone: 'unknown'
  });

  const [location, setLocation] = useState<LocationResolution>(SEEDED_LOCALITIES[0]);

  const defaultCategory = BUSINESS_CATEGORIES[0];
  const [businessInput, setBusinessInputState] = useState<BusinessInputData>({
    categoryId: defaultCategory.id,
    categoryLabel: defaultCategory.label,
    businessIdea: defaultCategory.defaultIdea,
    availableCapital: 100000,
    experienceYears: 2,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural'
  });

  const requestLocationPermission = async (): Promise<PermissionStatus> => {
    const status: PermissionStatus = 'granted';
    setPermissionsState((prev) => ({ ...prev, location: status }));
    return status;
  };

  const requestMicrophonePermission = async (): Promise<PermissionStatus> => {
    const status: PermissionStatus = 'granted';
    setPermissionsState((prev) => ({ ...prev, microphone: status }));
    return status;
  };

  const setBusinessInput = (data: Partial<BusinessInputData>) => {
    setBusinessInputState((prev) => ({ ...prev, ...data }));
  };

  const setBusinessCategory = (category: BusinessCategory) => {
    const match = BUSINESS_CATEGORIES.find((c) => c.id === category) || BUSINESS_CATEGORIES[0];
    setBusinessInputState((prev) => ({
      ...prev,
      categoryId: match.id,
      categoryLabel: match.label,
      businessIdea: match.defaultIdea
    }));
  };

  const setAvailableCapital = (capital: number) => {
    setBusinessInputState((prev) => ({ ...prev, availableCapital: capital }));
  };

  return (
    <AppContext.Provider
      value={{
        permissions,
        requestLocationPermission,
        requestMicrophonePermission,
        location,
        setLocation,
        businessInput,
        setBusinessInput,
        setBusinessCategory,
        setAvailableCapital
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
