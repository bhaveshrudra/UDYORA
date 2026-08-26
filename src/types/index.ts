export type DataQualityStatus = 'VERIFIED' | 'ESTIMATED' | 'INSUFFICIENT DATA';

export type GeographicLevel = string;

export type FeasibilityCategory = 'HIGH' | 'MODERATE' | 'CONDITIONAL' | 'LOW';

export interface EvidenceRecord {
  id: string;
  metricName: string;
  value: string | number;
  source: string;
  sourceUrl?: string;
  geographicLevel: GeographicLevel;
  timestamp: string;
  status: DataQualityStatus;
  confidence: number; // 0.0 to 1.0
  dataLimitationNote?: string;
  unit?: string;
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
  beneficiaryCategory?: 'General' | 'SC/ST' | 'OBC' | 'Women' | 'Minority' | 'Ex-Servicemen' | string;
  locationAreaType?: 'Rural' | 'Semi-Urban' | 'Urban' | string;
  language?: 'en' | 'hi' | 'mr' | 'te' | 'ta' | 'kn' | 'bn' | 'gu' | string;
}

export interface LocationData {
  id: string;
  village: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
  areaType: 'Rural' | 'Semi-Urban' | 'Urban' | string;
  population: EvidenceRecord;
  householdCount: EvidenceRecord;
  nearestTownDistanceKm: EvidenceRecord;
  nearestDairyCooperativeKm?: EvidenceRecord;
  nearestApmcMandiKm?: EvidenceRecord;
  nearestWeeklyHaatKm?: EvidenceRecord;
  groundwaterDepthMeters?: EvidenceRecord;
  powerReliabilityHoursPerDay?: EvidenceRecord;
  transportConnectivity?: EvidenceRecord;
  veterinaryCenterDistanceKm?: EvidenceRecord;
  majorCompetitorsCountEstimate?: EvidenceRecord;
  groundwaterStatus?: EvidenceRecord;
  powerAvailabilityHours?: EvidenceRecord;
  nearestMandiDistanceKm?: EvidenceRecord;
  weeklyHaatFrequency?: EvidenceRecord;
  localCompetitorsCount?: EvidenceRecord;
  averageHouseholdIncomeBand?: EvidenceRecord;
}

export interface CostComponent {
  id?: string;
  name: string;
  category: 'CAPEX' | 'OPEX' | 'WORKING_CAPITAL';
  estimatedCost: number;
  unitCount?: number;
  unitPrice?: number;
  isEssential: boolean;
  description: string;
  evidenceRefId?: string;
}

export type CostItem = CostComponent;

export interface RepaymentInstallment {
  month: number;
  openingPrincipal: number;
  emi: number;
  interestPaid: number;
  principalPaid: number;
  closingPrincipal: number;
  isMoratorium?: boolean;
}

export interface FinancialPlan {
  availableOwnCapital: number;
  marginPercentage: number; // e.g. 10%
  indicativeProjectCost: number;
  capitalExpenditureTotal?: number;
  workingCapitalTotal?: number;
  costBreakdown: CostComponent[];
  indicativeFinancingRequirement: number;
  eligibleSubsidyEstimate?: number;
  netLoanRequirement?: number;
  annualInterestRate: number; // in %
  tenureMonths: number;
  moratoriumMonths: number;
  monthlyEMI: number;
  totalInterestPayable: number;
  totalRepaymentAmount?: number;
  estimatedMonthlyRevenue: number;
  estimatedMonthlyOperatingExpenses: number;
  estimatedMonthlyNetProfit: number;
  debtServiceCoverageRatio: number;
  breakEvenPeriodMonths?: number;
  estimatedBreakEvenMonths?: number;
  repaymentSchedulePreview?: RepaymentInstallment[];
}

export interface GovernmentScheme {
  id: string;
  code?: string;
  name: string;
  shortName: string;
  nodalAgency: string;
  category?: string;
  targetSectors?: string[];
  targetBeneficiaries?: string[];
  eligibleActivities: string[];
  ineligibleActivities?: string[];
  minMarginContributionPct: number;
  maxProjectCost: number;
  interestRateRange: string;
  subsidyPercentageGeneral?: number;
  subsidyPercentageSpecialCategory?: number;
  subsidyPercentageRural?: number;
  subsidyGeneralRuralPct?: number;
  subsidySpecialRuralPct?: number;
  maxSubsidyAmount?: number;
  maxTenureMonths?: number;
  moratoriumMonthsMax?: number;
  moratoriumMonths?: number;
  tenureYearsMax?: number;
  collateralRequirement?: string;
  requiredDocuments: any[];
  officialSourceUrl: string;
  lastVerifiedDate: string;
  notes?: string;
  status?: DataQualityStatus;
  verificationStatus?: DataQualityStatus;
}

export type SchemeRule = GovernmentScheme;

export interface SchemeMatchResult {
  scheme: GovernmentScheme;
  matchScore: number; // 0 to 100
  qualificationStatus: 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'REQUIRES_VERIFICATION' | 'INELIGIBLE';
  whyItMatches: string[];
  potentialSubsidyPct: number;
  potentialSubsidyAmount: number;
  minimumOwnCapitalRequired?: number;
  missingInformation?: string[];
  requiredDocuments: { name: string; mandatory?: boolean; isMandatory?: boolean; ready?: boolean; description?: string }[];
  verificationNote: string;
}

export interface BusinessTemplate {
  id?: string;
  sector?: string;
  name?: string;
  categoryId: string;
  categoryName: string;
  typicalName: string;
  description?: string;
  typicalUnitSize?: string;
  standardMarginRatio: number;
  baseCapExRatio: number;
  baseWorkingCapitalRatio: number;
  benchmarkCapexMultiplier?: number;
  defaultCostComponents: any[];
  annualRevenuePerLakhCost: number;
  operatingMarginPct: number;
  gestationPeriodMonths: number;
  standardTenureMonths: number;
  benchmarkInterestRate: number;
  standardMoratoriumMonths: number;
  costItems?: any[];
  riskFactors?: any[];
}

export interface RiskFactor {
  id?: string;
  title?: string;
  dimension?: 'OPERATIONAL' | 'FINANCIAL' | 'SEASONAL' | 'MARKET' | 'BIOLOGICAL' | 'DATA_QUALITY' | string;
  category: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  mitigation?: string;
  mitigationSuggestion?: string;
  potentialImpact?: string;
  confidence?: number;
  evidenceRefId?: string;
}

export interface RiskProfile {
  overallRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  riskFactors: RiskFactor[];
  dataConfidenceScore?: number; // 0.0 to 1.0
  insufficientDataFields?: string[];
  highRiskCount?: number;
  mediumRiskCount?: number;
  lowRiskCount?: number;
  summary?: string;
  dataConfidenceLimitation?: string;
}

export interface AgentPayload<T> {
  agentName: string;
  version?: string;
  timestamp?: string;
  confidenceScore?: number;
  status?: string;
  summary?: string;
  dataQuality?: string;
  overallConfidence?: number;
  executionTimeMs?: number;
  evidenceGenerated?: EvidenceRecord[];
  data: T;
  auditTrail?: string[];
}

export interface BusinessAgentData {
  businessSummary: string;
  operationalScale?: string;
  assumedCapacityUnits?: number;
  unitMeasurement?: string;
  keyAssumptions?: string[];
  requiredEquipment?: string[];
  laborRequirement?: string;
  businessModelType?: string;
  operatingConsiderations?: string[];
  keyOpportunities?: string[];
  possibleConstraints?: string[];
  suggestedScale?: string;
}

export interface MarketAgentData {
  demandSummary?: string;
  catchmentDemographics?: {
    targetVillagePopulation: number;
    households: number;
  };
  competitionLevel?: 'HIGH' | 'MODERATE' | 'LOW' | 'UNKNOWN' | string;
  competitionDensity?: 'HIGH' | 'MODERATE' | 'LOW' | 'UNKNOWN' | string;
  competitionSummary?: string;
  demandDrivers?: string[];
  infrastructureProximity?: {
    facilityName: string;
    distanceKm: number;
    facilityType: string;
  }[];
  potentialDemandIndicators?: {
    indicator: string;
    level: 'HIGH' | 'MODERATE' | 'LOW' | 'UNKNOWN' | string;
    details: string;
    evidenceId: string;
  }[];
  nearbyFacilities?: { name: string; distanceKm: number; type: string }[];
  dataLimitations?: string[];
  marketOpportunitySummary?: string;
  estimatedMarketReach?: string;
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
  id?: string;
  generatedAt: string;
  input: UserBusinessInput;
  userInput?: UserBusinessInput;
  location: LocationData;
  feasibilityVerdict: FinalFeasibilityVerdict;
  finalFeasibility?: FinalFeasibilityVerdict;
  businessAnalysis: AgentPayload<BusinessAgentData>;
  marketIntelligence: AgentPayload<MarketAgentData>;
  marketAnalysis?: MarketAgentData;
  financialPlan: AgentPayload<FinancialPlan>;
  schemeGuidance: AgentPayload<SchemeMatchResult[]>;
  schemeMatches?: SchemeMatchResult[];
  riskAnalysis: AgentPayload<RiskProfile>;
  riskProfile?: RiskProfile;
  evidenceAuditLog: EvidenceRecord[];
  evidenceRecords?: EvidenceRecord[];
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
