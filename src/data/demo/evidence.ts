/**
 * UDYORA Demo Evidence Registry Dataset
 * NOTE: Distinguishes VERIFIED OFFICIAL SOURCES from ESTIMATED / STATISTICAL MODELS.
 */

export interface DemoEvidenceRecord {
  id: string;
  metric: string;
  value: string | number;
  source: string;
  sourceType: 'OFFICIAL_GOVERNMENT' | 'DEMO' | 'STATISTICAL_MODEL';
  status: 'VERIFIED' | 'ESTIMATED' | 'INSUFFICIENT DATA';
  confidence: number;
  timestamp: string;
  verificationNotes: string;
}

export const DEMO_EVIDENCE_REGISTRY: DemoEvidenceRecord[] = [
  {
    id: 'ev_census_pop_khed',
    metric: 'Khed Shivapur Population',
    value: 4210,
    source: 'Census India 2011 (PCA Series)',
    sourceType: 'OFFICIAL_GOVERNMENT',
    status: 'VERIFIED',
    confidence: 0.95,
    timestamp: '2026-08-20T00:00:00Z',
    verificationNotes: 'Official historical demographic data from Census of India 2011 Primary Census Abstract.'
  },
  {
    id: 'ev_apmc_distance_pune',
    metric: 'Nearest APMC Mandi Distance (Pune Gultekdi)',
    value: '18.0 km',
    source: 'Maharashtra State Agricultural Marketing Board (MSAMB)',
    sourceType: 'OFFICIAL_GOVERNMENT',
    status: 'VERIFIED',
    confidence: 0.92,
    timestamp: '2026-08-20T00:00:00Z',
    verificationNotes: 'Geospatial road network distance to closest functional regulated agricultural mandi.'
  },
  {
    id: 'ev_dairy_market_reach_demo',
    metric: 'Peri-Urban Milk Demand Catchment Index',
    value: 84,
    source: 'UDYORA Demo Statistical Model',
    sourceType: 'STATISTICAL_MODEL',
    status: 'ESTIMATED',
    confidence: 0.72,
    timestamp: '2026-08-26T00:00:00Z',
    verificationNotes: 'Synthetic market model estimate combining household density and road connectivity.'
  }
];
