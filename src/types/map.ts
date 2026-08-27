/**
 * UDYORA Map & Locality Intelligence Types
 * Bridges authoritative LGD administrative data with real-world spatial & POI data.
 */

export type POICategory =
  | 'bank'
  | 'cooperative'
  | 'market'
  | 'veterinary'
  | 'retail'
  | 'transport'
  | 'healthcare'
  | 'feed_supplier'
  | 'warehouse'
  | 'government';

export interface LocationResolution {
  id: string;
  localityName: string;
  villageName: string;
  subDistrictName: string;
  districtName: string;
  stateName: string;
  stateCode: number;
  districtCode: number;
  subDistrictCode: number;
  villageCode?: number;
  pincode: string;
  latitude: number;
  longitude: number;
  administrativeSource: string; // e.g. "Local Government Directory (LGD), MoPR"
  mappingSource: string; // e.g. "OpenStreetMap / Nominatim Spatial Engine"
  confidence: number; // 0.0 to 1.0
  formattedAddress: string;
  areaType: 'Rural' | 'Semi-Urban' | 'Urban';
  isCustomResolution?: boolean;
  regionalGazette?: string;
}

export interface NearbyPlace {
  id: string;
  placeName: string;
  category: POICategory;
  categoryLabel: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  source: string; // e.g. "OpenStreetMap Overpass Engine"
  retrievedAt: string;
  dataQuality: 'OBSERVED' | 'VERIFIED' | 'INSUFFICIENT DATA';
  address?: string;
  businessRelevance: 'HIGH' | 'MODERATE' | 'GENERAL';
  tags?: Record<string, string>;
}

export interface MapSearchResult {
  id: string;
  displayName: string;
  locality: string;
  subDistrict: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  matchScore: number;
  source: 'LGD' | 'OSM' | 'HYBRID';
  lgdVillageCode?: number;
}

export interface MapEvidence {
  radiusKm: number;
  totalPlacesObserved: number;
  categoryCounts: Record<POICategory, number>;
  nearestMarketDistanceKm?: number;
  nearestBankDistanceKm?: number;
  nearestVeterinaryDistanceKm?: number;
  nearestCooperativeDistanceKm?: number;
  nearestTransportDistanceKm?: number;
  observedCompetitorCount?: number;
  retrievedTimestamp: string;
  status: 'OBSERVED' | 'INSUFFICIENT DATA';
  limitationsNote: string;
}

export interface MapConfig {
  defaultRadiusKm: 5 | 10;
  tileProvider: 'osm' | 'carto' | 'satellite';
  enabledCategories: POICategory[];
  showRadiusOverlay: boolean;
  maxPOIsPerCategory: number;
  cacheExpiryHours: number;
}
