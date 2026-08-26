export type DataQualityStatus = 'VERIFIED' | 'ESTIMATED' | 'INSUFFICIENT DATA';

export type GeographicLevel = 'Village' | 'Block' | 'District' | 'State' | 'National';

export type FeasibilityCategory = 'HIGH' | 'MODERATE' | 'CONDITIONAL' | 'LOW';

export interface EvidenceRecord {
  id: string;
  metricName: string;
  value: string | number | boolean;
  unit?: string;
  source: string;
  sourceUrl?: string;
  geographicLevel: GeographicLevel;
  timestamp: string;
  status: DataQualityStatus;
  confidence: number; // 0.0 to 1.0
  dataLimitationNote?: string;
}

export interface UserBusinessInput {
  locationId: string;
  customLocationText?: string;
  businessCategoryId: 'dairy' | 'tailoring' | 'retail' | 'poultry' | 'custom';
  businessIdea: string;
  availableCapital: number; // in INR (e.g. 100000)
  experienceYears?: number;
  existingBusiness?: boolean;
  expectedScale?: 'Micro' | 'Small' | 'Medium';
  beneficiaryCategory?: 'General' | 'SC/ST' | 'OBC' | 'Women' | 'Minority' | 'Ex-Servicemen';
  locationAreaType?: 'Rural' | 'Semi-Urban' | 'Urban';
  language?: 'en' | 'hi' | 'mr' | 'te' | 'ta' | 'kn' | 'bn' | 'gu';
}

export interface LocationData {
  id: string;
  village: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
  areaType: 'Rural' | 'Semi-Urban' | 'Urban';
  population: EvidenceRecord;
  householdCount: EvidenceRecord;
  nearestTownDistanceKm: EvidenceRecord;
  nearestMandiDistanceKm: EvidenceRecord;
  nearestDairyCooperativeKm: EvidenceRecord;
  weeklyHaatFrequency: EvidenceRecord;
  powerAvailabilityHours: EvidenceRecord;
  groundwaterStatus: EvidenceRecord;
  transportConnectivity: EvidenceRecord;
  localCompetitorsCount: EvidenceRecord;
  averageHouseholdIncomeBand: EvidenceRecord;
}

export interface CostComponent {
  name: string;
  category: 'CAPEX' | 'WORKING_CAPITAL';
  estimatedCost: number;
  unitCount?: number;
  unitPrice?: number;
  description: string;
  isEssential: boolean;
}

export interface BusinessTemplate {
  categoryId: string;
  categoryName: string;
  typicalName: string;
  standardMarginRatio: number; // e.g. 0.10 for 10%
  baseCapExRatio: number; // e.g. 0.75
  baseWorkingCapitalRatio: number; // e.g. 0.25
  defaultCostComponents: CostComponent[];
  annualRevenuePerLakhCost: number; // Benchmark gross annual revenue
  operatingMarginPct: number; // Benchmark operating profit margin %
  gestationPeriodMonths: number;
  standardTenureMonths: number;
  benchmarkInterestRate: number; // e.g. 9.5%
  standardMoratoriumMonths: number;
}

export interface RepaymentInstallment {
  month: number;
  openingPrincipal: number;
  principalPaid: number;
  interestPaid: number;
  emi: number;
  closingPrincipal: number;
  isMoratorium: boolean;
}

export interface FinancialPlan {
  availableOwnCapital: number;
  marginPercentage: number;
  indicativeProjectCost: number;
  capitalExpenditureTotal: number;
  workingCapitalTotal: number;
  costBreakdown: CostComponent[];
  indicativeFinancingRequirement: number;
  eligibleSubsidyEstimate: number;
  netLoanRequirement: number;
  annualInterestRate: number;
  tenureMonths: number;
  moratoriumMonths: number;
  monthlyEMI: number;
  totalInterestPayable: number;
  totalRepaymentAmount: number;
  estimatedMonthlyRevenue: number;
  estimatedMonthlyOperatingExpenses: number;
  estimatedMonthlyNetProfit: number;
  debtServiceCoverageRatio: number; // DSCR
  estimatedBreakEvenMonths: number;
  repaymentSchedulePreview: RepaymentInstallment[]; // First 12 months preview
}

export interface SchemeRule {
  id: string;
  code: string;
  name: string;
  shortName: string;
  nodalAgency: string;
  category: 'Central' | 'State' | 'Institutional';
  targetBeneficiaries: string[];
  eligibleActivities: string[];
  ineligibleActivities?: string[];
  minMarginContributionPct: number;
  maxProjectCost: number;
  interestRateRange: string;
  subsidyGeneralRuralPct: number;
  subsidySpecialRuralPct: number;
  maxSubsidyAmount?: number;
  maxTenureMonths: number;
  moratoriumMonths: number;
  requiredDocuments: string[];
  officialSourceUrl: string;
  lastVerifiedDate: string;
  verificationStatus: DataQualityStatus;
  notes: string;
}

export interface SchemeMatchResult {
  scheme: SchemeRule;
  matchScore: number; // 0 to 100
  qualificationStatus: 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'REQUIRES_VERIFICATION' | 'INELIGIBLE';
  whyItMatches: string[];
  potentialSubsidyAmount: number;
  potentialSubsidyPct: number;
  minimumOwnCapitalRequired: number;
  missingInformation: string[];
  requiredDocuments: { name: string; isMandatory: boolean }[];
  verificationNote: string;
}

export interface RiskFactor {
  id: string;
  title: string;
  category: 'BUSINESS' | 'FINANCIAL' | 'MARKET' | 'COMPETITION' | 'LOCATION_INFRA' | 'SEASONAL' | 'DATA_QUALITY';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  potentialImpact: string;
  mitigationSuggestion: string;
  evidenceRefId?: string;
  confidence: number;
}

export interface RiskProfile {
  overallRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  riskFactors: RiskFactor[];
  summary: string;
  dataConfidenceLimitation: string;
}

export interface AgentPayload<T> {
  agentName: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INSUFFICIENT_DATA';
  executionTimeMs: number;
  dataQuality: DataQualityStatus;
  overallConfidence: number;
  summary: string;
  data: T;
  evidenceGenerated: EvidenceRecord[];
}

export interface BusinessAgentData {
  businessSummary: string;
  businessModelType: string;
  operatingConsiderations: string[];
  keyOpportunities: string[];
  possibleConstraints: string[];
  suggestedScale: string;
}

export interface MarketAgentData {
  marketOpportunitySummary: string;
  estimatedMarketReach: string;
  competitionLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'UNVERIFIED';
  potentialDemandIndicators: {
    indicator: string;
    level: 'HIGH' | 'MODERATE' | 'LOW' | 'UNKNOWN';
    details: string;
    evidenceId: string;
  }[];
  nearbyFacilities: { name: string; distanceKm: number; type: string }[];
  dataLimitations: string[];
}

export interface FinalFeasibilityVerdict {
  score: number; // 0 - 100
  category: FeasibilityCategory;
  headline: string;
  explanation: string;
  readinessFactors: {
    area: string;
    score: number;
    weight: number;
    rating: 'STRONG' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'CRITICAL';
    summary: string;
  }[];
  criticalCaveat: string;
  disclaimer: string;
}

export interface CompleteAnalysisReport {
  reportId: string;
  generatedAt: string;
  input: UserBusinessInput;
  location: LocationData;
  feasibilityVerdict: FinalFeasibilityVerdict;
  businessAnalysis: AgentPayload<BusinessAgentData>;
  marketIntelligence: AgentPayload<MarketAgentData>;
  financialPlan: AgentPayload<FinancialPlan>;
  schemeGuidance: AgentPayload<SchemeMatchResult[]>;
  riskAnalysis: AgentPayload<RiskProfile>;
  evidenceAuditLog: EvidenceRecord[];
  aggregatorValidation: {
    isValid: boolean;
    inconsistenciesResolved: string[];
    warnings: string[];
    validationTimestamp: string;
  };
}

export interface AgentStepStatus {
  id: string;
  name: string;
  role: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  progressPct: number;
  message: string;
  durationMs?: number;
}
