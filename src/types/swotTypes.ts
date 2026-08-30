import { DataQualityStatus } from './index';

export type SwotCategory = 'STRENGTH' | 'WEAKNESS' | 'OPPORTUNITY' | 'THREAT';

export type SwotSourceType = 'BUSINESS' | 'FINANCE' | 'MARKET' | 'LOCATION' | 'RISK' | 'EVIDENCE';

export interface SwotItem {
  id: string;
  category: SwotCategory;
  title: string;
  titleKey?: string;
  explanation: string;
  explanationKey?: string;
  sourceType: SwotSourceType;
  evidenceIds: string[];
  confidence: number; // 0.0 to 1.0
  dataQuality: DataQualityStatus;
  metricReference?: string;
  badgeLabel?: string;
}

export interface SwotAnalysis {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  dataQuality: DataQualityStatus;
  generatedAt: string;
  hasMissingData: boolean;
  summaryExplanation?: string;
}
