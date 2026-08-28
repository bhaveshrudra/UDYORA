import * as Location from 'expo-location';
import {
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
  PermissionStatus as AudioPermissionStatus
} from 'expo-audio';
import { PermissionStatus } from '../types';

export const permissionService = {
  /**
   * Request Foreground Location Permission
   */
  async requestLocationPermission(): Promise<PermissionStatus> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === Location.PermissionStatus.GRANTED) {
        return 'granted';
      }
      return 'denied';
    } catch (err) {
      console.warn('Location permission request failed:', err);
      return 'denied';
    }
  },

  /**
   * Get Current Location Permission Status
   */
  async getLocationPermissionStatus(): Promise<PermissionStatus> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === Location.PermissionStatus.GRANTED) {
        return 'granted';
      } else if (status === Location.PermissionStatus.DENIED) {
        return 'denied';
      }
      return 'unknown';
    } catch (err) {
      console.warn('Get location permission failed:', err);
      return 'unknown';
    }
  },

  /**
   * Request Microphone Audio Permission via expo-audio
   */
  async requestMicrophonePermission(): Promise<PermissionStatus> {
    try {
      const res = await requestRecordingPermissionsAsync();
      if (res.granted || res.status === AudioPermissionStatus.GRANTED) {
        return 'granted';
      }
      return 'denied';
    } catch (err) {
      console.warn('Microphone permission request failed:', err);
      return 'denied';
    }
  },

  /**
   * Get Current Microphone Permission Status via expo-audio
   */
  async getMicrophonePermissionStatus(): Promise<PermissionStatus> {
    try {
      const res = await getRecordingPermissionsAsync();
      if (res.granted || res.status === AudioPermissionStatus.GRANTED) {
        return 'granted';
      } else if (res.status === AudioPermissionStatus.DENIED) {
        return 'denied';
      }
      return 'unknown';
    } catch (err) {
      console.warn('Get microphone permission failed:', err);
      return 'unknown';
    }
  }
};


