/**
 * UDYORA Demo Benchmark Locations Dataset
 * NOTE: Explicitly marked as DEMO DATA / ESTIMATED for prototype simulation.
 * Real production data is sourced from LGD (lgdirectory.gov.in) and Census 2011.
 */

export interface DemoLocationBenchmark {
  id: string;
  village: string;
  subDistrict: string;
  administrativeTerm: string;
  district: string;
  state: string;
  pincode: string;
  sourceType: 'DEMO';
  dataQuality: 'ESTIMATED';
  populationCensus2011: number;
  households: number;
  nearestDairyCooperativeKm: number;
  nearestApmcMandiKm: number;
  nearestHighwayKm: number;
  marketReachScore: number;
  notes: string;
}

export const DEMO_LOCATION_BENCHMARKS: DemoLocationBenchmark[] = [
  {
    id: 'demo_loc_khed_shivapur',
    village: 'Khed Shivapur',
    subDistrict: 'Haveli',
    administrativeTerm: 'Taluka',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '412205',
    sourceType: 'DEMO',
    dataQuality: 'ESTIMATED',
    populationCensus2011: 4210,
    households: 840,
    nearestDairyCooperativeKm: 2.5,
    nearestApmcMandiKm: 18.0,
    nearestHighwayKm: 0.8,
    marketReachScore: 84,
    notes: 'Demo Benchmark: High peri-urban dairy and logistics corridor access.'
  },
  {
    id: 'demo_loc_madhurawada',
    village: 'Madhurawada',
    subDistrict: 'Visakhapatnam Rural',
    administrativeTerm: 'Mandal',
    district: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    pincode: '530048',
    sourceType: 'DEMO',
    dataQuality: 'ESTIMATED',
    populationCensus2011: 6850,
    households: 1420,
    nearestDairyCooperativeKm: 4.2,
    nearestApmcMandiKm: 12.5,
    nearestHighwayKm: 1.2,
    marketReachScore: 78,
    notes: 'Demo Benchmark: Growing coastal semi-urban demand cluster.'
  },
  {
    id: 'demo_loc_gejjalagere',
    village: 'Gejjalagere',
    subDistrict: 'Maddur',
    administrativeTerm: 'Taluk',
    district: 'Mandya',
    state: 'Karnataka',
    pincode: '571428',
    sourceType: 'DEMO',
    dataQuality: 'ESTIMATED',
    populationCensus2011: 3480,
    households: 710,
    nearestDairyCooperativeKm: 1.8,
    nearestApmcMandiKm: 9.0,
    nearestHighwayKm: 2.1,
    marketReachScore: 81,
    notes: 'Demo Benchmark: Strong cooperative milk union catchment area.'
  }
];
