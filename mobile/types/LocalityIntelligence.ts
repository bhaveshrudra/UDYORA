import { MapPlace, POIDataQuality } from './MapPlace';

export interface EvidenceItem {
  metric: string;
  value: number | string;
  unit: string;
  source: string;
  sourceType: 'MAP_PROVIDER' | 'LGD' | 'CENSUS' | 'UDYORA_DATASET' | 'OFFICIAL';
  status: POIDataQuality;
  confidence: number;
  timestamp: string;
}

export interface MarketIndicator {
  title: string;
  value: string | number;
  unit?: string;
  category: string;
  status: POIDataQuality;
  source: string;
  note?: string;
}

export interface InfrastructureIndicator {
  title: string;
  statusText: string;
  category: 'TRANSPORT' | 'BANKING' | 'HEALTHCARE' | 'POWER_TELECOM' | 'MARKET_YARD' | 'SERVICES';
  availability: 'HIGH' | 'MODERATE' | 'BASIC' | 'INSUFFICIENT_DATA';
  source: string;
  dataQuality: POIDataQuality;
}

export interface LocalityIntelligence {
  locality: string;
  village: string;
  subDistrict: string;
  subDistrictType: string;
  district: string;
  state: string;
  pincode: string;

  coordinates: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  };

  radiusKm: number;

  nearbyPlaces: MapPlace[];

  marketIndicators: MarketIndicator[];

  infrastructureIndicators: InfrastructureIndicator[];

  businessIndicators: EvidenceItem[];

  evidence: EvidenceItem[];

  dataQuality: POIDataQuality;
  sources: {
    administrative: string;
    geospatial: string;
    demographic: string;
  };
  retrievedAt: string;
}
