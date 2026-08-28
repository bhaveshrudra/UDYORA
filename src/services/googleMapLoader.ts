/**
 * UDYORA Google Maps API Async Loader (@googlemaps/js-api-loader)
 * Implements Google's functional async loading pattern with importLibrary(),
 * AdvancedMarkerElement support, and BillingNotEnabledMapError detection.
 */

import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

let isOptionsSet = false;
let loadPromise: Promise<boolean> | null = null;
let isBillingError = false;

// Global map authentication failure handler (Google Maps API invokes window.gm_authFailure on billing/key failure)
if (typeof window !== 'undefined') {
  (window as any).gm_authFailure = () => {
    isBillingError = true;
    if (import.meta.env?.DEV) {
      console.warn('[UDYORA MAP] Billing is not enabled for the configured Google Cloud project.');
    }
    const event = new CustomEvent('udyora_map_billing_error');
    window.dispatchEvent(event);
  };
}

export function getGoogleMapsApiKey(): string | undefined {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key || key.trim() === '' || key.includes('your_google_maps_api_key')) {
    return undefined;
  }
  return key.trim();
}

export function isApiKeyConfigured(): boolean {
  return getGoogleMapsApiKey() !== undefined;
}

export function isMapBillingError(): boolean {
  return isBillingError;
}

export function loadGoogleMapsScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.google && window.google.maps && window.google.maps.marker) return Promise.resolve(true);

  if (loadPromise) return loadPromise;

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    if (import.meta.env?.DEV) {
      console.warn('[UDYORA MAP] Google Maps API key is not configured.');
    }
    return Promise.resolve(false);
  }

  try {
    if (!isOptionsSet) {
      setOptions({
        key: apiKey,
        v: 'weekly'
      });
      isOptionsSet = true;
    }

    loadPromise = importLibrary('maps')
      .then(async () => {
        try {
          await importLibrary('marker');
          await importLibrary('places');
          await importLibrary('geometry');
        } catch (mErr) {
          console.warn('[UDYORA MAP] Could not pre-load auxiliary libraries:', mErr);
        }
        return true;
      })
      .catch((err) => {
        if (import.meta.env?.DEV) {
          console.warn('[UDYORA MAP] Failed to load Google Maps JS API:', err);
        }
        return false;
      });

    return loadPromise;
  } catch (err) {
    console.warn('[UDYORA MAP] Exception during map loader initialization:', err);
    return Promise.resolve(false);
  }
}
