/**
 * UDYORA Coordinate Normalization Layer
 * Provides single source of truth for lat/lng coordinate structures across the application.
 */

export interface MapLocation {
  lat: number;
  lng: number;
}

export function normalizeCoordinates(locationInput: any): MapLocation | null {
  if (!locationInput) return null;

  let lat: number | undefined;
  let lng: number | undefined;

  if (typeof locationInput.lat === 'number' && typeof locationInput.lng === 'number') {
    lat = locationInput.lat;
    lng = locationInput.lng;
  } else if (typeof locationInput.latitude === 'number' && typeof locationInput.longitude === 'number') {
    lat = locationInput.latitude;
    lng = locationInput.longitude;
  } else if (locationInput.coords && typeof locationInput.coords.lat === 'number' && typeof locationInput.coords.lng === 'number') {
    lat = locationInput.coords.lat;
    lng = locationInput.coords.lng;
  } else if (locationInput.center && typeof locationInput.center.lat === 'number' && typeof locationInput.center.lng === 'number') {
    lat = locationInput.center.lat;
    lng = locationInput.center.lng;
  }

  if (lat !== undefined && lng !== undefined && Number.isFinite(lat) && Number.isFinite(lng)) {
    return {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6))
    };
  }

  return null;
}

export function isValidMapLocation(loc: any): loc is MapLocation {
  const norm = normalizeCoordinates(loc);
  return norm !== null;
}
