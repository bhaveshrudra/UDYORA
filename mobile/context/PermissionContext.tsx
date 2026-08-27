import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionStatus, PermissionsState } from '../types';
import { permissionService } from '../services/permissionService';

export const PERMISSIONS_STORAGE_KEY = 'udyora_permissions';

interface PermissionContextType {
  permissions: PermissionsState;
  isLocationGranted: boolean;
  isMicrophoneGranted: boolean;
  requestLocation: () => Promise<PermissionStatus>;
  requestMicrophone: () => Promise<PermissionStatus>;
  checkPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<PermissionsState>({
    location: 'unknown',
    microphone: 'unknown'
  });

  const checkPermissions = async () => {
    try {
      const locStatus = await permissionService.getLocationPermissionStatus();
      const micStatus = await permissionService.getMicrophonePermissionStatus();

      // Check stored preference as well
      const stored = await AsyncStorage.getItem(PERMISSIONS_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};

      const finalState: PermissionsState = {
        location: locStatus !== 'unknown' ? locStatus : parsed.location || 'unknown',
        microphone: micStatus !== 'unknown' ? micStatus : parsed.microphone || 'unknown'
      };

      setPermissions(finalState);
    } catch (err) {
      console.warn('Check permissions error:', err);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const requestLocation = async (): Promise<PermissionStatus> => {
    const status = await permissionService.requestLocationPermission();
    const updated = { ...permissions, location: status };
    setPermissions(updated);
    try {
      await AsyncStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to persist permissions:', err);
    }
    return status;
  };

  const requestMicrophone = async (): Promise<PermissionStatus> => {
    const status = await permissionService.requestMicrophonePermission();
    const updated = { ...permissions, microphone: status };
    setPermissions(updated);
    try {
      await AsyncStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to persist permissions:', err);
    }
    return status;
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        isLocationGranted: permissions.location === 'granted',
        isMicrophoneGranted: permissions.microphone === 'granted',
        requestLocation,
        requestMicrophone,
        checkPermissions
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
