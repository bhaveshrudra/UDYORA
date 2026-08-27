import { useApp } from './useApp';

export const usePermissions = () => {
  const { permissions, requestLocationPermission, requestMicrophonePermission } = useApp();

  return {
    isLocationGranted: permissions.location === 'granted',
    isMicrophoneGranted: permissions.microphone === 'granted',
    locationStatus: permissions.location,
    microphoneStatus: permissions.microphone,
    requestLocation: requestLocationPermission,
    requestMicrophone: requestMicrophonePermission
  };
};
