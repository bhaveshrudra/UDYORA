import {
  UserContext,
  LocationResolution,
  CanonicalBusinessCategory,
  BusinessIntent,
  LanguageTag,
  POIDataQuality
} from './index';

export type AgentExecutionStatus =
  | 'WAITING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'INSUFFICIENT_DATA';

export interface AgentStatusInfo {
  agentName: string;
  displayName: string;
  status: AgentExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
}

export interface BusinessSummary {
  businessCategory: CanonicalBusinessCategory;
  businessName: string;
  businessDescription: string;
  businessIntent: BusinessIntent;
  targetLocality: string;
  scaleAssessment: string;
  operatingRequirements: string[];
  keyOpportunities: string[];
  keyConstraints: string[];
  costDrivers: string[];
  revenueDrivers: string[];
}

export interface FeasibilityBreakdown {
  overallScore: number; // 0-100
  rating: 'HIGHLY FEASIBLE' | 'FEASIBLE WITH CONDITIONS' | 'MODERATE RISK' | 'CHALLENGING';
  isConditional: boolean;
  factors: {
    name: string;
    score: number;
    weight: number;
    weightedScore: number;
    status: POIDataQuality;
    rationale: string;
  }[];
}

export interface FinancialPlan {
  availableEquity: number;
  indicativeProjectCost: number;
  promoterMarginPercentage: number;
  financingRequirement: number;
  termLoanAmount: number;
  workingCapitalLoan: number;
  interestRateAnnual: number;
  tenureYears: number;
  monthlyEMI: number;
  estimatedAnnualRevenue: number;
  estimatedAnnualOperatingCost: number;
  estimatedAnnualNetProfit: number;
  breakEvenMonths: number;
  debtServiceCoverageRatio: number; // DSCR
  repaymentSchedule: {
    year: number;
    openingBalance: number;
    principalPaid: number;
    interestPaid: number;
    closingBalance: number;
  }[];
  assumptions: {
    label: string;
    value: string;
    source: string;
    status: POIDataQuality;
  }[];
}

export interface GovernmentSchemeMatch {
  schemeId: string;
  schemeName: string;
  ministryAgency: string;
  matchStatus: 'MATCHED' | 'POTENTIAL_MATCH' | 'REQUIRES_VERIFICATION' | 'NOT_MATCHED';
  subsidyPercentage: number;
  estimatedSubsidyAmount: number;
  eligibleLoanComponent: number;
  marginRequirement: number;
  keyBenefits: string[];
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  officialPortalUrl: string;
  verificationStatus: string;
}

export interface RiskFactor {
  id: string;
  name: string;
  category: 'MARKET' | 'FINANCIAL' | 'OPERATIONAL' | 'SUPPLY' | 'INFRASTRUCTURE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  mitigation: string;
}

export interface EvidenceRecord {
  id: string;
  metric: string;
  value: string | number;
  unit?: string;
  source: string;
  sourceType: 'LGD' | 'MAP_PROVIDER' | 'CENSUS' | 'RBI' | 'OFFICIAL' | 'UDYORA_DATASET';
  status: POIDataQuality;
  confidence: number;
  timestamp: string;
}

export interface DomainComparisonItem {
  domain: CanonicalBusinessCategory;
  suitabilityScore: number; // 0-100
  promoterCapitalFit: 'EXCELLENT' | 'GOOD' | 'STRETCHED';
  localMarketDemand: 'HIGH' | 'MODERATE' | 'BASIC';
  setupComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  keyAdvantage: string;
  isProposed: boolean;
}

export interface CompleteAdvisoryReport {
  assessmentId: string;
  generatedAt: string;
  language: LanguageTag;
  userContext: UserContext;

  businessSummary: BusinessSummary;
  feasibility: FeasibilityBreakdown;
  market: {
    marketOpportunityText: string;
    observedCompetitorCount: number | 'INSUFFICIENT_DATA';
    accessibilityRating: string;
    infrastructureSummary: string;
    observations: string[];
    limitations: string[];
    dataQuality: POIDataQuality;
  };
  financial: FinancialPlan;
  schemes: GovernmentSchemeMatch[];
  risks: {
    overallRiskRating: 'LOW' | 'MODERATE' | 'HIGH';
    factors: RiskFactor[];
  };
  evidence: EvidenceRecord[];
  domainComparison: DomainComparisonItem[];
  recommendations: {
    executiveSummary: string;
    primaryActionableSteps: string[];
    financingGuidance: string;
    schemeGuidance: string;
    cautionNotice: string;
  };
  agentStatuses: Record<string, AgentStatusInfo>;
  validation: {
    isValid: boolean;
    conflictsDetected: string[];
    warnings: string[];
  };
}
