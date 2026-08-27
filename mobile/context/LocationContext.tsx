import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationResolution } from '../types';
import { locationService, SEEDED_LOCALITIES } from '../services/locationService';

export const LOCATION_STORAGE_KEY = 'udyora_confirmed_location';

interface LocationContextType {
  selectedLocation: LocationResolution;
  isLocationConfirmed: boolean;
  selectedRadiusKm: number;
  isDetecting: boolean;
  detectionError: string | null;
  setSelectedLocation: (loc: LocationResolution) => void;
  setSelectedRadiusKm: (radius: number) => void;
  confirmLocation: () => Promise<void>;
  detectCurrentLocation: () => Promise<{ success: boolean; data?: LocationResolution; error?: string }>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocationState] = useState<LocationResolution>(SEEDED_LOCALITIES[0]);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState<boolean>(false);
  const [selectedRadiusKm, setSelectedRadiusKmState] = useState<number>(5);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  useEffect(() => {
    const loadStoredLocation = async () => {
      try {
        const stored = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as LocationResolution;
          setSelectedLocationState(parsed);
          setSelectedRadiusKmState(parsed.selectedRadiusKm || 5);
          setIsLocationConfirmed(true);
        }
      } catch (err) {
        console.warn('Failed to load stored location:', err);
      }
    };

    loadStoredLocation();
  }, []);

  const setSelectedLocation = (loc: LocationResolution) => {
    setSelectedLocationState(loc);
    setDetectionError(null);
  };

  const setSelectedRadiusKm = (radius: number) => {
    setSelectedRadiusKmState(radius);
    setSelectedLocationState((prev) => ({ ...prev, selectedRadiusKm: radius }));
  };

  const confirmLocation = async () => {
    setIsLocationConfirmed(true);
    try {
      const payload = { ...selectedLocation, selectedRadiusKm };
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to persist confirmed location:', err);
    }
  };

  const detectCurrentLocation = async (): Promise<{
    success: boolean;
    data?: LocationResolution;
    error?: string;
  }> => {
    setIsDetecting(true);
    setDetectionError(null);

    const gpsRes = await locationService.getCurrentGPSLocation();
    if (!gpsRes.success || !gpsRes.data) {
      setIsDetecting(false);
      const errMsg = gpsRes.error || 'Unable to detect GPS coordinates. Please check location permissions.';
      setDetectionError(errMsg);
      return { success: false, error: errMsg };
    }

    const { latitude, longitude, accuracy } = gpsRes.data;
    const resolved = await locationService.resolveCoordinates(latitude, longitude, accuracy);

    setSelectedLocationState(resolved);
    setIsDetecting(false);
    return { success: true, data: resolved };
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        isLocationConfirmed,
        selectedRadiusKm,
        isDetecting,
        detectionError,
        setSelectedLocation,
        setSelectedRadiusKm,
        confirmLocation,
        detectCurrentLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
