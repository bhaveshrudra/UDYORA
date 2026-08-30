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
  accuracy?: number; // In meters (e.g. 35)
  source?: 'LIVE_GPS' | 'MANUAL_SELECTION' | 'DEMO' | string;
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
  dataQuality: 'OBSERVED' | 'VERIFIED' | 'INSUFFICIENT DATA' | 'INSUFFICIENT_DATA';
  address?: string;
  businessRelevance: 'HIGH' | 'MODERATE' | 'GENERAL';
  tags?: Record<string, string>;
}

export interface OpportunityFactor {
  factorName: string;
  weight: number; // e.g. 0.25 (25%)
  score: number; // 0 - 100
  rating: 'HIGH' | 'MODERATE' | 'LOW';
  details: string;
}

export interface OpportunitySpot {
  id: string;
  name?: string;
  spotName: string;
  category: 'SETTLEMENT' | 'MARKET_JUNCTION' | 'HIGHWAY_CORRIDOR' | 'COOPERATIVE_CLUSTER' | 'COMMERCIAL_HUB';
  categoryLabel: string;
  latitude: number;
  longitude: number;
  distanceKm: number; // Haversine distance in km
  distanceFromCenter?: number; // Alias for distanceKm
  opportunityScore: number; // 0 - 100
  dataConfidence: number; // 0 - 100%
  dataQuality: 'VERIFIED' | 'ESTIMATED' | 'INSUFFICIENT_DATA' | 'OBSERVED';
  rank: number; // 1, 2, 3...
  summaryReason: string;
  evidenceIds?: string[];
  factors: {
    populationReach: OpportunityFactor;
    marketAccessibility: OpportunityFactor;
    competitionGap: OpportunityFactor;
    transportAccessibility: OpportunityFactor;
    demandIndicators: OpportunityFactor;
    dataConfidence: OpportunityFactor;
  };
  sources: {
    name: string;
    url?: string;
    quality: string;
  }[];
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
  status: 'OBSERVED' | 'INSUFFICIENT DATA' | 'INSUFFICIENT_DATA';
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
