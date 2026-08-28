/**
 * Local Government Directory (LGD) Administrative Hierarchy Types
 * Primary Source: Ministry of Panchayati Raj, Government of India (https://lgdirectory.gov.in/)
 * Secondary Demographics: Census of India 2011 (Office of the Registrar General & Census Commissioner)
 */

export type LgdEntityType = 'STATE' | 'DISTRICT' | 'SUB_DISTRICT' | 'VILLAGE';

export type LgdAdministrativeTerm =
  | 'Mandal'
  | 'Taluka'
  | 'Taluk'
  | 'Tehsil'
  | 'Sub-Division'
  | 'Development Block'
  | 'Revenue Circle'
  | 'Circle'
  | 'Sub-District';

export interface LgdState {
  id: string;
  lgdCode: number;
  name: string;
  nameMap?: Record<string, string>;
  shortName: string;
  subDistrictTerm: LgdAdministrativeTerm;
  districtsCount: number;
  status: 'VERIFIED';
  source: string;
  sourceVersion: string;
  updatedAt: string;
}

export interface LgdDistrict {
  id: string;
  lgdCode: number;
  stateId: string;
  stateCode: number;
  stateName: string;
  name: string;
  nameMap?: Record<string, string>;
  headquarters: string;
  subDistrictsCount: number;
  status: 'VERIFIED';
  source: string;
  sourceVersion: string;
  updatedAt: string;
}

export interface LgdSubDistrict {
  id: string;
  lgdCode: number;
  districtId: string;
  districtCode: number;
  districtName: string;
  stateId: string;
  stateCode: number;
  stateName: string;
  name: string;
  nameMap?: Record<string, string>;
  displayName: string;
  administrativeTerm: LgdAdministrativeTerm;
  villagesCount: number;
  status: 'VERIFIED';
  source: string;
  sourceVersion: string;
  updatedAt: string;
}

export interface LgdVillage {
  id: string;
  lgdCode: number;
  subDistrictId: string;
  subDistrictCode: number;
  subDistrictName: string;
  administrativeTerm: LgdAdministrativeTerm;
  districtId: string;
  districtCode: number;
  districtName: string;
  stateId: string;
  stateCode: number;
  stateName: string;
  name: string;
  pincode: string;
  areaType: 'Rural' | 'Semi-Urban';
  populationCensus2011: number;
  householdsCensus2011: number;
  nearestDairyCoopKm?: number;
  nearestApmcMandiKm?: number;
  nearestTownKm?: number;
  status: 'VERIFIED' | 'ESTIMATED';
  confidence: number;
  source: string;
  censusSource: string;
  sourceVersion: string;
  lastSynchronized: string;
}

export interface LgdSearchResult {
  village: LgdVillage;
  matchScore: number;
  highlightedName: string;
  fullHierarchyPath: string;
}

export interface LgdIngestionReport {
  sourceOrganization: string;
  sourceUrl: string;
  sourceVersion: string;
  lastSynchronized: string;
  totalStates: number;
  totalDistricts: number;
  totalSubDistricts: number;
  totalVillages: number;
  verifiedCount: number;
  estimatedCount: number;
  invalidRecordsCount: number;
  unmappedParentCount: number;
  validationStatus: 'PASSED' | 'WARNINGS';
}
