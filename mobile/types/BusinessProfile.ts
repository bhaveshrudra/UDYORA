import { LocationResolution, LanguageTag } from './index';

export type CanonicalBusinessCategory =
  | 'Dairy'
  | 'Tailoring'
  | 'Retail'
  | 'Poultry'
  | 'Agro-processing'
  | 'Custom';

export type BusinessIntent = 'START' | 'EXPAND' | 'IMPROVE' | 'RESTART';

export type BusinessExperience = 'NEW' | 'SOME_EXPERIENCE' | 'EXPERIENCED';

export type ExpectedScale = 'MICRO' | 'SMALL' | 'MEDIUM';

export type BusinessInputSource = 'FORM' | 'VOICE' | 'TEXT' | 'MIXED';

export interface BusinessProfile {
  businessCategory: CanonicalBusinessCategory;
  businessName: string;
  businessDescription: string;
  businessIntent: BusinessIntent;
  experience: BusinessExperience;
  existingBusiness: {
    exists: boolean;
    type?: string;
    scale?: string;
  };
  expectedScale: ExpectedScale;
  availableCapital: number;
  location: LocationResolution;
  language: LanguageTag;
  inputSource: BusinessInputSource;
  confidence?: {
    category?: number;
    capital?: number;
    location?: number;
  };
  missingFields?: string[];
  rawTranscript?: string;
  updatedAt: string;
}

export interface UserContext {
  language: LanguageTag;
  authState: {
    isAuthenticated: boolean;
    isGuest: boolean;
    user: any;
  };
  locationContext: LocationResolution;
  businessProfile: BusinessProfile;
  readyForAnalysis: boolean;
  preparedAt: string;
}
