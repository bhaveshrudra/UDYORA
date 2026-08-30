import { UserBusinessInput } from './index';
import { SupportedLanguage } from '../i18n/types';

export type BusinessCategory =
  | 'dairy'
  | 'tailoring'
  | 'retail'
  | 'poultry'
  | 'food_processing'
  | 'manufacturing'
  | 'services'
  | 'custom'
  | string;

export type DatasetSourceType = 'APPLICANT' | 'ENTREPRENEUR' | 'LOAN';

export type DatasetDataQuality = 'DEMO';

export type ValidationStatus = 'VALID' | 'INVALID' | 'WARNING';

export type LocationMatchStatus = 'EXACT' | 'FUZZY' | 'REQUIRES_VERIFICATION' | 'UNMATCHED';

export interface NormalizationIssue {
  field: string;
  code:
    | 'MALFORMED_NUMBER'
    | 'NEGATIVE_VALUE'
    | 'INVALID_AGE'
    | 'UNSUPPORTED_LANGUAGE'
    | 'UNMAPPED_CATEGORY'
    | 'UNMATCHED_LOCATION'
    | 'MISSING_REQUIRED_FIELD'
    | 'DUPLICATE_ID';
  message: string;
  rawValue?: any;
  severity: 'ERROR' | 'WARNING';
}

export interface RawApplicantRecord {
  applicant_id: string;
  full_name?: string;
  gender?: string;
  age?: string | number;
  state?: string;
  district?: string;
  annual_family_income?: string | number;
  estimated_project_cost?: string | number;
  education_level?: string;
  social_category?: string;
  special_category?: string;
  prior_experience_years?: string | number;
  eligibility_status?: string;
}

export interface RawEntrepreneurRecord {
  entrepreneur_id: string;
  name?: string;
  gender?: string;
  age?: string | number;
  state?: string;
  district?: string;
  business_idea?: string;
  business_category?: string;
  available_own_capital?: string | number;
  years_of_experience?: string | number;
  location_type?: string;
  preferred_language?: string;
}

export interface RawLoanRecord {
  application_id: string;
  applicant_name?: string;
  annual_income?: string | number;
  project_type?: string;
  estimated_project_cost?: string | number;
  requested_loan_amount?: string | number;
  education_status?: string;
  bank_account_status?: string;
  preferred_language?: string;
  state?: string;
  district?: string;
}

export interface CanonicalDatasetRecord {
  id: string;
  sourceDataset: string;
  sourceRecordId: string;
  datasetType: DatasetSourceType;
  dataQuality: DatasetDataQuality;
  importedAt: string;

  // Identity & Demographics (Masked in public/UI views)
  name?: string;
  maskedName?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  educationStatus?: string;
  socialCategory?: string;
  specialCategory?: string;

  // Geography & LGD Hierarchy Match
  state?: string;
  district?: string;
  locationType?: 'rural' | 'urban' | 'semi-urban';
  lgdStateCode?: number;
  lgdDistrictCode?: number;
  locationMatchStatus: LocationMatchStatus;

  // Financial Information (Normalized to standard INR integer amounts)
  annualFamilyIncome?: number;
  availableOwnCapital?: number;
  estimatedProjectCost?: number;
  requestedLoanAmount?: number;

  // Business & Experience
  businessIdea?: string;
  businessCategory: BusinessCategory;
  rawBusinessCategory?: string;
  yearsOfExperience?: number;

  // Banking & Application Status
  bankAccountStatus?: 'ACTIVE' | 'INACTIVE' | 'NONE' | 'UNKNOWN';
  rawBankAccountStatus?: string;

  // Language Preferences
  preferredLanguage: SupportedLanguage;
  rawLanguage?: string;
  isLanguageSupported: boolean;

  // Validation Metadata
  validationStatus: ValidationStatus;
  validationIssues: NormalizationIssue[];
  isDuplicate: boolean;
  duplicateOfId?: string;
}

export interface DatasetSummary {
  datasetName: string;
  datasetType: DatasetSourceType;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  warningRecords: number;
  categoryBreakdown: Record<string, number>;
  languageBreakdown: Record<string, number>;
  locationMatchRate: number;
  dataQuality: DatasetDataQuality;
  importedAt: string;
}

export interface DatasetConflictRecord {
  entityId: string;
  fieldName: string;
  datasetAValue?: any;
  datasetCValue?: any;
  discrepancyDescription: string;
  resolvedAuthoritativeField: string;
}

export interface IngestionResult<T = CanonicalDatasetRecord> {
  datasetName: string;
  datasetType: DatasetSourceType;
  records: T[];
  summary: DatasetSummary;
  rawCount: number;
}
