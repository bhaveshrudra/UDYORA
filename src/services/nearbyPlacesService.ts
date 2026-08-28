/**
 * UDYORA Google Places Nearby Resources Service
 * Performs real geographic Nearby Search queries using Google Places API
 * and calculates exact ground distance from the resolved location center.
 * Uses an off-screen HTMLDivElement container to avoid legacy PlacesService map instance warnings.
 */

import { SupportedLanguage } from '../i18n/types';

export interface NearbyResourceItem {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  distanceKm: number;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  coords: { lat: number; lng: number };
  dataSource: string;
}

export const CATEGORY_SEARCH_PARAMS: Record<
  string,
  { keywords: string[]; types: string[]; categoryLabel: string }
> = {
  dairy: {
    keywords: ['dairy', 'milk collection center', 'dairy farm', 'cattle market', 'amul', 'mother dairy'],
    types: ['store', 'food', 'establishment'],
    categoryLabel: 'Dairy & Milk Collection'
  },
  retail: {
    keywords: ['grocery', 'supermarket', 'kirana store', 'provisions', 'department store', 'bazaar'],
    types: ['grocery_or_supermarket', 'supermarket', 'store'],
    categoryLabel: 'Retail & Grocery Store'
  },
  tailoring: {
    keywords: ['tailor', 'garments', 'fabric store', 'textile shop', 'clothing store', 'boutique'],
    types: ['clothing_store', 'store'],
    categoryLabel: 'Garments & Tailoring'
  },
  poultry: {
    keywords: ['poultry', 'poultry farm', 'agricultural supplier', 'feed store', 'farm supply', 'krishi kendra'],
    types: ['store', 'establishment'],
    categoryLabel: 'Poultry & Farm Supplies'
  },
  agro: {
    keywords: ['krishi kendra', 'fertilizer shop', 'seed store', 'agricultural mandi', 'farm equipment'],
    types: ['store', 'establishment'],
    categoryLabel: 'Agro Supplies & Mandi'
  },
  custom: {
    keywords: ['market', 'commercial center', 'store', 'bazaar'],
    types: ['establishment'],
    categoryLabel: 'Nearby Commercial Hub'
  }
};

/**
 * Calculates exact ground distance between two coordinates in kilometers using Haversine formula.
 */
export function calculateExactDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Executes a real Google Places Nearby Search query.
 * Uses an off-screen DOM element to prevent legacy PlacesService map instance warnings.
 */
export function fetchNearbyResourcesFromGoogle(
  center: { lat: number; lng: number },
  businessCategory: string,
  radiusKm: 5 | 10 = 5
): Promise<NearbyResourceItem[]> {
  return new Promise((resolve) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      if (import.meta.env?.DEV) {
        console.log('[UDYORA Places API] Google Places Library not available.');
      }
      resolve([]);
      return;
    }

    const config = CATEGORY_SEARCH_PARAMS[businessCategory] || CATEGORY_SEARCH_PARAMS.custom;
    const radiusMeters = radiusKm * 1000;

    try {
      // Off-screen container node prevents legacy PlacesService map instance deprecation warning
      const containerNode = typeof document !== 'undefined' ? document.createElement('div') : null;
      if (!containerNode) {
        resolve([]);
        return;
      }

      const service = new google.maps.places.PlacesService(containerNode);
      const request: google.maps.places.PlaceSearchRequest = {
        location: center,
        radius: radiusMeters,
        keyword: config.keywords[0],
        type: config.types[0] as any
      };

      service.nearbySearch(request, (results, status) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !results ||
          results.length === 0
        ) {
          if (import.meta.env?.DEV) {
            console.log(`[UDYORA Places API] Nearby search completed with status: ${status}`);
          }
          resolve([]);
          return;
        }

        const items: NearbyResourceItem[] = [];

        results.forEach((place) => {
          if (!place.geometry || !place.geometry.location) return;

          const pLat = place.geometry.location.lat();
          const pLng = place.geometry.location.lng();
          const distKm = calculateExactDistanceKm(center.lat, center.lng, pLat, pLng);

          // Strict Radius Filter (Exclude places outside active radius)
          if (distKm <= radiusKm) {
            items.push({
              id: place.place_id || `place_${Date.now()}_${Math.random()}`,
              name: place.name || 'Nearby Resource',
              category: businessCategory,
              categoryLabel: config.categoryLabel,
              distanceKm: distKm,
              address: place.vicinity || place.formatted_address || 'Nearby Locality',
              rating: place.rating,
              userRatingsTotal: place.user_ratings_total,
              coords: { lat: pLat, lng: pLng },
              dataSource: 'Google Places API'
            });
          }
        });

        // Sort by closest distance and cap at TOP 8-10 results
        items.sort((a, b) => a.distanceKm - b.distanceKm);
        resolve(items.slice(0, 10));
      });
    } catch (err) {
      if (import.meta.env?.DEV) {
        console.warn('[UDYORA Places API Exception]', err);
      }
      resolve([]);
    }
  });
}
