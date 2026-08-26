/**
 * UDYORA - Multi-Agent AI System for Rural Micro-Entrepreneurs
 * Shared Types & Interfaces for Agent Pipeline
 */

// ==========================================
// 1. Business Profile Domain Models
// ==========================================

export type BusinessCategory =
  | 'retail_kirana'
  | 'agriculture_allied'
  | 'dairy_livestock'
  | 'handicrafts_artisan'
  | 'food_processing_stall'
  | 'textile_tailoring'
  | 'repair_services'
  | 'transport_logistics'
  | 'other';

export type EntityType =
  | 'unregistered_sole_proprietor'
  | 'registered_proprietorship'
  | 'partnership'
  | 'shg_member' // Self-Help Group
  | 'fpo_member' // Farmer Producer Org
  | 'pvt_ltd';

export interface SeasonalVariation {
  peakMonths: string[]; // e.g. ["October", "November", "December"] (festive/harvest)
  peakMonthlyRevenue: number;
  leanMonths: string[]; // e.g. ["May", "June", "July"] (monsoon/drought)
  leanMonthlyRevenue: number;
  normalMonthlyRevenue: number;
}

export interface DebtObligation {
  id: string;
  sourceType: 'informal_moneylender' | 'bank_mfi' | 'friends_family' | 'shg_loan' | 'supplier_credit';
  lenderName?: string;
  outstandingPrincipal: number;
  monthlyEMI: number;
  estimatedAnnualInterestRate?: number; // e.g., 36% for moneylender vs 12% for bank
  tenureMonthsRemaining?: number;
}

export interface BusinessAsset {
  id: string;
  assetType: 'machinery_equipment' | 'vehicle' | 'inventory_stock' | 'land_building' | 'gold_liquid';
  description: string;
  estimatedMarketValue: number;
  isPledgedOrHypothecated: boolean;
}

export interface BusinessProfile {
  id?: string;
  entrepreneurName: string;
  businessName: string;
  businessCategory: BusinessCategory;
  businessDescription?: string;
  location: {
    villageOrTown: string;
    district: string;
    state: string;
    pincode?: string;
    isRuralOrSemiUrban: boolean;
  };
  demographics?: {
    gender?: 'female' | 'male' | 'other';
    socialCategory?: 'general' | 'obc' | 'sc' | 'st' | 'minority';
    isDifferentlyAbled?: boolean;
    isFirstTimeBorrower?: boolean;
  };
  yearsInOperation: number;
  entityType: EntityType;
  
  // Financial specifics
  monthlyRevenue: number;
  monthlyFixedCosts: number; // rent, electricity, fixed salaries
  monthlyVariableCosts: number; // raw materials, daily transport, stock refills
  seasonality: SeasonalVariation;
  
  // Debts & Assets
  existingDebts: DebtObligation[];
  assets: BusinessAsset[];
  
  // Loan request intent (if specified by entrepreneur)
  loanPurpose?: 'working_capital' | 'machinery_expansion' | 'inventory_bulk' | 'debt_refinancing' | 'new_outlet';
  requestedLoanAmount?: number;
  requestedTenureMonths?: number;
}

// ==========================================
// 2. Intake Agent Interfaces
// ==========================================

export interface ChatMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
}

export interface IntakeState {
  sessionId: string;
  conversationHistory: ChatMessage[];
  currentExtractedProfile: Partial<BusinessProfile>;
  completedFields: (keyof BusinessProfile)[];
  missingRequiredFields: (keyof BusinessProfile)[];
  completionPercentage: number;
  currentStep: string;
  isReadyForAnalysis: boolean;
}

export interface IntakeAgentResponse {
  message: string;
  extractedUpdates: Partial<BusinessProfile>;
  missingFields: string[];
  isComplete: boolean;
  nextSuggestedPrompt?: string;
}

// ==========================================
// 3. Financial Engine Interfaces (Deterministic)
// ==========================================

export interface BreakEvenAnalysis {
  fixedMonthlyCosts: number;
  existingDebtService: number;
  totalMonthlyFixedObligations: number;
  grossMarginPercentage: number; // (Revenue - Variable Costs) / Revenue
  contributionMarginRatio: number;
  breakEvenMonthlyRevenue: number;
  estimatedDailyBreakEvenSales: number;
  isCurrentlyProfitable: boolean;
  safetyMarginPercentage: number; // (Current Revenue - BreakEven) / Current Revenue
  formulaUsed: string;
  assumptions: string[];
}

export interface MonthlyCashFlowItem {
  monthIndex: number; // 1 to 6
  monthName: string;
  seasonType: 'normal' | 'peak' | 'lean';
  projectedGrossRevenue: number;
  fixedCosts: number;
  variableCosts: number;
  existingDebtEMI: number;
  proposedLoanEMI: number;
  totalOutflows: number;
  netMonthlyCashFlow: number;
  endingCashBuffer: number;
  isDeficit: boolean;
}

export interface CashFlowProjection {
  grossMonthlyRevenue: number;
  totalMonthlyExpenses: number;
  netOperatingCashFlow: number;
  leanMonthNetCashFlow: number;
  peakMonthNetCashFlow: number;
  minimumEmergencyBufferNeeded: number;
  existingMonthlyDebtServicing: number;
  freeCashFlowBeforeNewDebt: number;
  sixMonthProjection: MonthlyCashFlowItem[];
  averageProjectedMonthlySurplus: number;
  hasDeficitMonths: boolean;
  formulaUsed: string;
  assumptions: string[];
}

export interface MaxLoanCalculation {
  maxTheoreticalLoanAmount: number;
  maxAllowableMonthlyEMI: number;
  maxFOIRPercentage: number; // e.g. 55%
  incomeMultipleUsed: number;
  interestRateBenchmark: number; // e.g. 12% p.a.
  tenureMonths: number;
  formulaUsed: string;
  assumptions: string[];
}

export interface SafeLoanCalculation {
  recommendedSafeLoanAmount: number;
  recommendedSafeMonthlyEMI: number;
  safeFOIRPercentage: number; // e.g. 35-40%
  requiredDSCR: number; // e.g. >= 1.5x
  actualProjectedDSCR: number;
  volatilityDiscountFactor: number; // e.g. 0.8 based on lean season
  interestRateBenchmark: number;
  tenureMonths: number;
  borrowerPrudentialTier: 'CONSERVATIVE_GREEN' | 'MODERATE_AMBER' | 'HIGH_LEVERAGE_RED';
  formulaUsed: string;
  assumptions: string[];
}

export interface WorkingCapitalSafetyCheck {
  currentLiquidSavings: number;
  monthlyOperatingExpenses: number; // Fixed + Variable
  requiredTwoMonthReserve: number; // 2 * (Fixed + Variable)
  availableBufferAfterLoanServicing: number;
  reserveCoverageMonths: number;
  isReserveAdequate: boolean;
  workingCapitalDeficitOrSurplus: number;
  safetyAlertLevel: 'safe' | 'caution' | 'critical';
  recommendation: string;
  formulaUsed: string;
  assumptions: string[];
}

export interface LoanCapacityMetrics {
  maxTheoreticalLoan: number;
  recommendedSafeLoanAmount: number;
  recommendedMaxMonthlyEMI: number;
  optimalTenureMonths: number;
  estimatedInterestRateBenchmark: number;
  debtServiceCoverageRatio: number;
  fixedObligationToIncomeRatio: number;
  workingCapitalHealth: 'healthy' | 'tight' | 'critical';
  informalDebtBurdenRatio: number;
}

export interface FinancialAnalysis {
  entrepreneurName: string;
  businessName: string;
  businessCategory: BusinessCategory;
  requestedLoanAmount?: number;
  requestedTenureMonths?: number;
  breakEven: BreakEvenAnalysis;
  maxLoan: MaxLoanCalculation;
  safeLoan: SafeLoanCalculation;
  workingCapitalCheck: WorkingCapitalSafetyCheck;
  cashFlow: CashFlowProjection;
  summaryVerdict: {
    isLoanAffordable: boolean;
    requestedVsSafeComparison: string;
    maxSafeEMIFormatted: string;
    recommendedAction: string;
  };
}

export interface FinancialEngineOutput {
  breakEven: BreakEvenAnalysis;
  cashFlow: CashFlowProjection;
  loanCapacity: LoanCapacityMetrics;
  workingCapitalAssessment: {
    recommendedBufferMonths: number;
    estimatedWorkingCapitalGap: number;
    urgencyLevel: 'low' | 'medium' | 'high';
  };
  detailedAnalysis?: FinancialAnalysis;
}

// ==========================================
// 4. Risk Assessment Interfaces
// ==========================================

export type ViabilityTier = 'HIGH_VIABILITY' | 'MODERATE_VIABILITY' | 'VULNERABLE' | 'HIGH_RISK';

export interface StressTestScenario {
  scenarioName: 'normal' | 'moderate_downturn' | 'severe_lean_season' | 'cost_inflation_shock';
  description: string;
  revenueImpactPercentage: number; // e.g. -20% or -40%
  projectedMonthlyRevenue: number;
  projectedNetCashFlow: number;
  canServiceProposedEMI: boolean;
  cashDeficitOrSurplus: number;
}

export interface RiskWarning {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'informal_debt_trap' | 'seasonality_drought' | 'thin_margins' | 'low_asset_backing' | 'high_leverage';
  title: string;
  explanation: string;
  mitigationSuggestion: string;
}

export interface RiskAssessmentOutput {
  viabilityScore: number; // 0 - 100
  viabilityTier: ViabilityTier;
  confidenceScore: number; // 0.0 - 1.0 based on data completeness
  stressTestScenarios: StressTestScenario[];
  riskWarnings: RiskWarning[];
  strengths: string[];
  weaknesses: string[];
  repaymentProbabilityScore: number; // 0 - 100
}

// ==========================================
// 5. Scheme Matching Interfaces
// ==========================================

export type GovernmentSchemeCategory =
  | 'central_subsidy'
  | 'collateral_free_bank_loan'
  | 'women_entrepreneur'
  | 'rural_artisan'
  | 'micro_working_capital'
  | 'state_specific';

export interface SchemeMatch {
  schemeId: string;
  schemeName: string;
  nodalAgency: string; // e.g., "Ministry of MSME", "NABARD", "SIDBI"
  category: GovernmentSchemeCategory;
  eligibilityPercentage: number; // 0 - 100%
  eligibilityStatus: 'highly_eligible' | 'conditionally_eligible' | 'ineligible';
  maxLoanAmountAvailable: number;
  subsidyOrGrantPercentage?: number;
  interestSubventionPercentage?: number;
  collateralRequired: boolean;
  matchReasoning: string[];
  missingPrerequisites: string[];
  requiredDocuments: string[];
  applicationPortalUrl?: string;
}

export interface SchemeMatchingOutput {
  totalSchemesEvaluated: number;
  matchedSchemes: SchemeMatch[];
  topRecommendedScheme: SchemeMatch | null;
  subsidyOptimizationOpportunity: string;
}

// ==========================================
// 6. Generic Agent Output & Synthesis Pipeline
// ==========================================

export interface AgentOutput<T> {
  agentName: 'IntakeAgent' | 'FinancialEngineAgent' | 'RiskAssessmentAgent' | 'SchemeMatchingAgent' | 'OrchestratorAgent';
  success: boolean;
  timestamp: string;
  executionTimeMs: number;
  data: T;
  agentNotes?: string[];
  errors?: string[];
}

export interface ExecutiveSummary {
  headline: string;
  businessHealthVerdict: 'EXCELLENT' | 'STABLE_GROWTH' | 'PROCEED_WITH_CAUTION' | 'HIGH_RISK_RESTRUCTURE_NEEDED';
  safeLoanLimitFormatted: string;
  topSchemeRecommendation: string;
  keyActionItem: string;
}

export interface ActionableStep {
  stepNumber: number;
  title: string;
  description: string;
  priority: 'immediate' | 'short_term' | 'long_term';
  targetEntity: 'Bank' | 'CSC_Center' | 'Local_Gram_Panchayat' | 'Self';
}

export interface FinalSynthesisReport {
  reportId: string;
  generatedAt: string;
  entrepreneur: {
    name: string;
    businessName: string;
    category: BusinessCategory;
    location: string;
  };
  executiveSummary: ExecutiveSummary;
  businessProfileSnapshot: BusinessProfile;
  financialMetrics: FinancialEngineOutput;
  riskAssessment: RiskAssessmentOutput;
  matchedSchemes: SchemeMatchingOutput;
  actionableRoadmap: ActionableStep[];
  counselorExplanationHindiEnglish: string; // Plain-speak bilingual explanation for field workers / micro-entrepreneurs
}

export interface PipelineContext {
  sessionId?: string;
  profile?: BusinessProfile;
  intakeState?: IntakeState;
  financialOutput?: FinancialEngineOutput;
  riskOutput?: RiskAssessmentOutput;
  schemeOutput?: SchemeMatchingOutput;
  finalReport?: FinalSynthesisReport;
}
