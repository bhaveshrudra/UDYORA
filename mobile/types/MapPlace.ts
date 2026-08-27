/**
 * UDYORA Mobile - Map POI & Place Data Model
 */

export type POICategory =
  | 'ALL'
  | 'MARKETS'
  | 'RETAIL'
  | 'BANKS'
  | 'HEALTHCARE'
  | 'GOVERNMENT_SERVICES'
  | 'TRANSPORT'
  | 'AGRICULTURAL_SERVICES'
  | 'DAIRY_SERVICES'
  | 'POULTRY_SERVICES'
  | 'EDUCATION'
  | 'WAREHOUSES'
  | 'WHOLESALE'
  | 'SERVICES';

export type POISourceType = 'MAP_PROVIDER' | 'OFFICIAL' | 'UDYORA_DATASET';

export type POIDataQuality = 'VERIFIED' | 'OBSERVED' | 'ESTIMATED' | 'INSUFFICIENT_DATA';

export interface MapPlace {
  id: string;
  name: string;
  category: POICategory;
  categoryLabel: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  source: string;
  sourceType: POISourceType;
  dataQuality: POIDataQuality;
  retrievedAt: string;
  address?: string;
  businessRelevance?: ('dairy' | 'retail' | 'tailoring' | 'poultry' | 'general')[];
}
