import { LocationData, EvidenceRecord } from '../types';
import { DEMO_LOCATIONS } from '../data/locations';
import { OFFICIAL_LGD_VILLAGES } from '../data/lgdHierarchy';
import { convertLgdToLocationData } from './locationHierarchyService';

export function getLocationById(locationId: string): LocationData {
  // 1. Check if ID matches an LGD village entity
  if (locationId.startsWith('lgd_loc_')) {
    const code = Number(locationId.replace('lgd_loc_', ''));
    const vil = OFFICIAL_LGD_VILLAGES.find((v) => v.lgdCode === code);
    if (vil) return convertLgdToLocationData(vil);
  }

  // 2. Check DEMO_LOCATIONS
  const found = DEMO_LOCATIONS.find((l) => l.id === locationId);
  if (found) return found;

  // 3. Default to Khed Shivapur, Pune baseline
  return convertLgdToLocationData(OFFICIAL_LGD_VILLAGES[0]);
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
    block: 'Unspecified Sub-District',
    district: 'Unspecified District',
    state: 'India',
    pincode: '000000',
    areaType: 'Rural',
    population: {
      id: 'ev_custom_pop',
      metricName: 'Village Total Population (Census 2011)',
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
      metricName: 'Household Count (Census 2011)',
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
      confidence: 0.6
    },
    nearestDairyCooperativeKm: {
      id: 'ev_custom_dairy_dist',
      metricName: 'Distance to Nearest Dairy Cooperative / Milk Route',
      value: 8.0,
      unit: 'km',
      source: 'District Dairy Development Board Directory',
      geographicLevel: 'Block',
      timestamp: now,
      status: 'ESTIMATED',
      confidence: 0.5
    },
    nearestApmcMandiKm: {
      id: 'ev_custom_mandi_dist',
      metricName: 'Distance to Principal APMC Market Yard',
      value: 20.0,
      unit: 'km',
      source: 'State Agricultural Marketing Board Directory',
      geographicLevel: 'District',
      timestamp: now,
      status: 'ESTIMATED',
      confidence: 0.6
    },
    nearestWeeklyHaatKm: {
      id: 'ev_custom_haat_dist',
      metricName: 'Distance to Periodic Weekly Village Market / Haat',
      value: 4.0,
      unit: 'km',
      source: 'Gram Panchayat Commercial Register',
      geographicLevel: 'Village',
      timestamp: now,
      status: 'ESTIMATED',
      confidence: 0.6
    },
    groundwaterDepthMeters: {
      id: 'ev_custom_gw',
      metricName: 'Average Groundwater Table Depth',
      value: 15.0,
      unit: 'meters',
      source: 'Central Ground Water Board Regional Baseline',
      geographicLevel: 'District',
      timestamp: now,
      status: 'ESTIMATED',
      confidence: 0.7
    },
    powerReliabilityHoursPerDay: {
      id: 'ev_custom_power',
      metricName: 'Rural Feeder Commercial Power Reliability',
      value: 18.0,
      unit: 'hours/day',
      source: 'State Electricity Distribution Company Regional Average',
      geographicLevel: 'District',
      timestamp: now,
      status: 'ESTIMATED',
      confidence: 0.7
    },
    transportConnectivity: {
      id: 'ev_custom_transport',
      metricName: 'All-Weather Road / PWD Road Connectivity Status',
      value: 'All-weather single-lane paved approach road to state highway network.',
      source: 'PMGSY Rural Road Network Database',
      geographicLevel: 'Village',
      timestamp: now,
      status: 'ESTIMATED',
      confidence: 0.75
    }
  };
}
