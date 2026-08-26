import { LocationData, EvidenceRecord } from '../types';
import { DEMO_LOCATIONS } from '../data/locations';

export function getLocationById(locationId: string): LocationData {
  const found = DEMO_LOCATIONS.find((l) => l.id === locationId);
  if (found) return found;
  return DEMO_LOCATIONS[0]; // Default to Khed Shivapur, Pune baseline
}

export function searchLocations(query: string): LocationData[] {
  if (!query || query.trim() === '') return DEMO_LOCATIONS;
  const q = query.toLowerCase().trim();
  return DEMO_LOCATIONS.filter(
    (loc) =>
      loc.village.toLowerCase().includes(q) ||
      loc.block.toLowerCase().includes(q) ||
      loc.district.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      loc.pincode.includes(q)
  );
}

export function createCustomLocationData(customName: string): LocationData {
  const now = new Date().toISOString();
  return {
    id: `custom_${Date.now()}`,
    village: customName,
    block: 'Unspecified Block',
    district: 'Unspecified District',
    state: 'India',
    pincode: '000000',
    areaType: 'Rural',
    population: {
      id: 'ev_custom_pop',
      metricName: 'Village Total Population',
      value: 'INSUFFICIENT DATA',
      source: 'Local Census survey records pending ground verification',
      geographicLevel: 'Village',
      timestamp: now,
      status: 'INSUFFICIENT DATA',
      confidence: 0.0,
      dataLimitationNote: 'Custom unindexed location requires physical Gram Panchayat registry lookup.'
    },
    householdCount: {
      id: 'ev_custom_hh',
      metricName: 'Household Count',
      value: 'INSUFFICIENT DATA',
      source: 'Local Gram Panchayat records unverified',
      geographicLevel: 'Village',
      timestamp: now,
      status: 'INSUFFICIENT DATA',
      confidence: 0.0
    },
    nearestTownDistanceKm: {
      id: 'ev_custom_town_dist',
      metricName: 'Distance to Nearest Urban Growth Centre',
      value: 15.0,
      unit: 'km',
      source: 'Heuristic regional block estimate',
      geographicLevel: 'Block',
      timestamp: now,
      status: 'ESTIMATED',
      confidence: 0.5
    },
    nearestMandiDistanceKm: {
      id: 'ev_custom_mandi_dist',
      metricName: 'Distance to Principal Agriculture Mandi',
      value: 20.0,
      unit: 'km',
      source: 'State APMC GIS baseline estimate',
      geographicLevel: 'District',
      timestamp: now,
      status: 'ESTIMATED',
      confidence: 0.5
    },
    nearestDairyCooperativeKm: {
      id: 'ev_custom_dairy_dist',
      metricName: 'Distance to Nearest Milk Collection Point',
      value: 5.0,
      unit: 'km',
      source: 'District cooperative routing estimate',
      geographicLevel: 'Village',
      timestamp: now,
      status: 'ESTIMATED',
      confidence: 0.4
    },
    weeklyHaatFrequency: {
      id: 'ev_custom_haat',
      metricName: 'Weekly Rural Market Frequency',
      value: 'Weekly Haat (Estimated)',
      source: 'Typical regional pattern',
      geographicLevel: 'Block',
      timestamp: now,
      status: 'ESTIMATED',
      confidence: 0.5
    },
    powerAvailabilityHours: {
      id: 'ev_custom_power',
      metricName: 'Daily Grid Power Availability',
      value: 16.0,
      unit: 'hours/day',
      source: 'State rural feeder average benchmark',
      geographicLevel: 'State',
      timestamp: now,
      status: 'ESTIMATED',
      confidence: 0.6
    },
    groundwaterStatus: {
      id: 'ev_custom_water',
      metricName: 'Groundwater Assessment',
      value: 'INSUFFICIENT DATA',
      source: 'CGWB block map lookup pending',
      geographicLevel: 'Block',
      timestamp: now,
      status: 'INSUFFICIENT DATA',
      confidence: 0.0
    },
    transportConnectivity: {
      id: 'ev_custom_road',
      metricName: 'Road Connectivity',
      value: 'Paved rural road (PMGSY benchmark)',
      source: 'Pradhan Mantri Gram Sadak Yojana GIS baseline',
      geographicLevel: 'Village',
      timestamp: now,
      status: 'ESTIMATED',
      confidence: 0.6
    },
    localCompetitorsCount: {
      id: 'ev_custom_comp',
      metricName: 'Estimated Local Micro-Units in 5km Radius',
      value: 'INSUFFICIENT DATA',
      source: 'No field survey data recorded for custom location',
      geographicLevel: 'Village',
      timestamp: now,
      status: 'INSUFFICIENT DATA',
      confidence: 0.0,
      dataLimitationNote: 'Requires local field enumerator inspection.'
    },
    averageHouseholdIncomeBand: {
      id: 'ev_custom_income',
      metricName: 'Estimated Rural Household Income Band',
      value: '₹12,000 - ₹18,000',
      source: 'State rural average tabulation',
      geographicLevel: 'State',
      timestamp: now,
      status: 'ESTIMATED',
      confidence: 0.5
    }
  };
}
