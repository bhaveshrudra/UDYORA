/**
 * UDYORA Mobile - Core Application Types (Phase 4)
 */

export * from './MapPlace';
export * from './LocalityIntelligence';
export * from './BusinessProfile';
export * from './CompleteAdvisoryReport';

export type LanguageTag = 'en-IN' | 'hi-IN' | 'mr-IN' | 'te-IN' | 'kn-IN';
export type LanguageCode = 'EN' | 'HI' | 'MR' | 'TE' | 'KN';
export type SupportedLanguage = LanguageTag;

export interface SupportedLanguageInfo {
  tag: LanguageTag;
  code: LanguageCode;
  name: string;
  nativeName: string;
  regionalScript: string;
}

export type LanguageInfo = SupportedLanguageInfo;

export type AuthStatus = 'unauthenticated' | 'authenticated' | 'guest';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'guest' | 'admin' | 'editorial';
  isGuest: boolean;
  token?: string;
  createdAt: string;
}

export type StartupState = 'checking' | 'splash' | 'language' | 'authentication' | 'ready';

export type PermissionStatus = 'unknown' | 'granted' | 'denied';

export interface PermissionsState {
  location: PermissionStatus;
  microphone: PermissionStatus;
}

export type LocationDataQuality = 'VERIFIED' | 'ESTIMATED' | 'INSUFFICIENT DATA' | 'OBSERVED';

export interface LocationResolution {
  id: string;
  localityName: string;
  villageName: string;
  subDistrictName: string;
  subDistrictType: 'Mandal' | 'Taluka' | 'Tehsil' | 'Block' | 'Sub-District';
  districtName: string;
  stateName: string;
  pincode: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  areaType?: 'Rural' | 'Semi-Urban' | 'Urban';
  administrativeSource: string;
  mappingSource: string;
  dataQuality: LocationDataQuality;
  confidence: number;
  selectedRadiusKm?: number;
}

export interface GPSLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export type BusinessCategory = 'dairy' | 'tailoring' | 'retail' | 'poultry' | 'custom';

export interface BusinessInputData {
  categoryId: BusinessCategory;
  categoryLabel: string;
  businessIdea: string;
  availableCapital: number;
  experienceYears: number;
  beneficiaryCategory: string;
  locationAreaType: string;
}

export interface AnalysisReportSummary {
  reportId: string;
  feasibilityScore: number;
  feasibilityRating: 'HIGH' | 'MODERATE' | 'CONDITIONAL' | 'LOW';
  businessIdea: string;
  location: string;
  capital: number;
  projectCost: number;
  loanAmount: number;
  monthlyEMI: number;
  dscr: number;
  topSchemeName: string;
  topSchemeSubsidy: string;
  riskSummary: string;
  timestamp: string;
}
