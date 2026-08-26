import { ai, DEFAULT_GEMINI_MODEL } from '../config/gemini.js';
import {
  BusinessProfile,
  FinancialEngineOutput,
  RiskAssessmentOutput,
  SchemeMatchingOutput,
  SchemeMatch,
  GovernmentSchemeCategory,
  AgentOutput,
} from '../types.js';

interface SchemeRuleDefinition {
  schemeId: string;
  schemeName: string;
  nodalAgency: string;
  category: GovernmentSchemeCategory;
  maxLoanAmount: number;
  subsidyOrGrantPercentage?: number;
  interestSubventionPercentage?: number;
  collateralRequired: boolean;
  minYearsOperation?: number;
  eligibleCategories?: string[];
  eligibleGenders?: string[];
  requiredDocs: string[];
  portalUrl: string;
}

/**
 * Built-in catalog of central & rural schemes for micro-enterprises
 */
const GOVERNMENT_SCHEMES_CATALOG: SchemeRuleDefinition[] = [
  {
    schemeId: 'mudra-kishor',
    schemeName: 'Pradhan Mantri MUDRA Yojana (Kishor Category)',
    nodalAgency: 'MUDRA / Department of Financial Services (DFS)',
    category: 'collateral_free_bank_loan',
    maxLoanAmount: 500000,
    interestSubventionPercentage: 0,
    collateralRequired: false,
    minYearsOperation: 1,
    requiredDocs: [
      'Aadhaar Card & PAN',
      'Proof of Business Address (Electricity Bill or Shop Act)',
      'Last 6 months Bank Account Statement',
      'Quotation for Machinery / Stock to be purchased',
    ],
    portalUrl: 'https://www.mudra.org.in',
  },
  {
    schemeId: 'pm-svanidhi',
    schemeName: 'PM SVANidhi (Micro-Credit for Small Vendors & Traders)',
    nodalAgency: 'Ministry of Housing and Urban Affairs (MoHUA)',
    category: 'micro_working_capital',
    maxLoanAmount: 50000,
    interestSubventionPercentage: 7, // 7% interest subsidy on timely repayment
    collateralRequired: false,
    minYearsOperation: 0,
    requiredDocs: [
      'Aadhaar Card',
      'Vending Certificate / Urban Local Body Recommendation Letter',
      'Bank Account passbook copy',
    ],
    portalUrl: 'https://pmsvanidhi.mohua.gov.in',
  },
  {
    schemeId: 'pmegp-subsidy',
    schemeName: 'Prime Minister Employment Generation Programme (PMEGP)',
    nodalAgency: 'Khadi & Village Industries Commission (KVIC) / MSME',
    category: 'central_subsidy',
    maxLoanAmount: 2500000,
    subsidyOrGrantPercentage: 25, // Up to 25% for rural general, 35% for rural special/women
    collateralRequired: false,
    minYearsOperation: 0,
    requiredDocs: [
      'Detailed Project Report (DPR)',
      'Educational Qualification (8th pass for >10L project)',
      'Caste/Special Category Certificate (if applicable)',
      'Rural Area Certificate from Gram Panchayat',
    ],
    portalUrl: 'https://www.kviconline.gov.in/pmegpeportal',
  },
  {
    schemeId: 'standup-india',
    schemeName: 'Stand-Up India Scheme (Women & SC/ST Entrepreneurs)',
    nodalAgency: 'SIDBI / Department of Financial Services',
    category: 'women_entrepreneur',
    maxLoanAmount: 10000000,
    collateralRequired: false,
    minYearsOperation: 0,
    eligibleGenders: ['female'],
    requiredDocs: [
      'Identity & Address Proof',
      'Category / Caste certificate',
      'Project Profile and estimated cash flow',
      'Proof of non-defaulter status',
    ],
    portalUrl: 'https://www.standupmitra.in',
  },
  {
    schemeId: 'nrlm-shg-linkage',
    schemeName: 'NRLM Aajeevika - SHG Enterprise Bank Credit Linkage',
    nodalAgency: 'Ministry of Rural Development (MoRD)',
    category: 'rural_artisan',
    maxLoanAmount: 1000000,
    interestSubventionPercentage: 3,
    collateralRequired: false,
    minYearsOperation: 1,
    requiredDocs: [
      'SHG Resolution Letter for enterprise loan',
      'SHG Panchasutra compliance record',
      'Individual Business plan summary',
    ],
    portalUrl: 'https://aajeevika.gov.in',
  },
];

/**
 * SchemeMatchingAgent
 * 
 * Matches business profiles with relevant government schemes, subsidies, and credit guarantee programs.
 * Computes eligibility percentage (0-100%) and actionable reasoning.
 */
export class SchemeMatchingAgent {
  private modelName: string;

  constructor(modelName = DEFAULT_GEMINI_MODEL) {
    this.modelName = modelName;
  }

  /**
   * Primary execution method for Scheme Matching.
   */
  public async matchSchemes(
    profile: BusinessProfile,
    financial: FinancialEngineOutput,
    risk: RiskAssessmentOutput
  ): Promise<AgentOutput<SchemeMatchingOutput>> {
    const startTime = Date.now();

    try {
      // 1. Evaluate deterministic eligibility against scheme catalog
      const matchedSchemes: SchemeMatch[] = GOVERNMENT_SCHEMES_CATALOG.map((scheme) =>
        this.evaluateSchemeEligibility(scheme, profile, financial, risk)
      );

      // Sort by highest eligibility percentage first
      matchedSchemes.sort((a, b) => b.eligibilityPercentage - a.eligibilityPercentage);

      const topRecommendedScheme = matchedSchemes.length > 0 ? matchedSchemes[0] : null;

      // 2. Identify subsidy optimization opportunities
      const subsidyOpportunity = this.identifySubsidyAdvantage(profile, matchedSchemes);

      const output: SchemeMatchingOutput = {
        totalSchemesEvaluated: GOVERNMENT_SCHEMES_CATALOG.length,
        matchedSchemes,
        topRecommendedScheme,
        subsidyOptimizationOpportunity: subsidyOpportunity,
      };

      // TODO: Enrich reasoning using Gemini to generate customized, localized application advice in local language

      return {
        agentName: 'SchemeMatchingAgent',
        success: true,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
        data: output,
        agentNotes: [
          `Top Scheme: ${topRecommendedScheme?.schemeName || 'None'} (${topRecommendedScheme?.eligibilityPercentage}% match)`,
          `Total schemes matched: ${matchedSchemes.filter((m) => m.eligibilityPercentage >= 60).length}`,
        ],
      };
    } catch (error: any) {
      return {
        agentName: 'SchemeMatchingAgent',
        success: false,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
        data: {} as SchemeMatchingOutput,
        errors: [error.message || 'Error executing SchemeMatchingAgent'],
      };
    }
  }

  /**
   * Evaluates eligibility criteria for a single scheme
   */
  public evaluateSchemeEligibility(
    scheme: SchemeRuleDefinition,
    profile: BusinessProfile,
    financial: FinancialEngineOutput,
    risk: RiskAssessmentOutput
  ): SchemeMatch {
    let score = 100;
    const matchReasoning: string[] = [];
    const missingPrerequisites: string[] = [];

    // 1. Requested Loan Amount check
    const requestedAmount = profile.requestedLoanAmount || financial.loanCapacity.recommendedSafeLoanAmount;
    if (requestedAmount > scheme.maxLoanAmount) {
      score -= 35;
      missingPrerequisites.push(`Requested amount (₹${requestedAmount.toLocaleString('en-IN')}) exceeds scheme ceiling of ₹${scheme.maxLoanAmount.toLocaleString('en-IN')}.`);
    } else {
      matchReasoning.push(`Loan requirement falls comfortably within the ₹${scheme.maxLoanAmount.toLocaleString('en-IN')} limit.`);
    }

    // 2. Vintage check
    if (scheme.minYearsOperation && profile.yearsInOperation < scheme.minYearsOperation) {
      score -= 25;
      missingPrerequisites.push(`Requires at least ${scheme.minYearsOperation} year(s) of operations.`);
    } else {
      matchReasoning.push(`Business vintage (${profile.yearsInOperation} years) fulfills criteria.`);
    }

    // 3. Demographic & Gender targeting
    if (scheme.eligibleGenders && profile.demographics?.gender) {
      if (!scheme.eligibleGenders.includes(profile.demographics.gender)) {
        score -= 40;
        missingPrerequisites.push(`Scheme is exclusively reserved for ${scheme.eligibleGenders.join('/')} entrepreneurs.`);
      } else {
        matchReasoning.push(`Eligible for priority women entrepreneur terms and lower interest subvention.`);
      }
    }

    // 4. Rural Area Bonus
    if (profile.location?.isRuralOrSemiUrban) {
      matchReasoning.push('Rural location qualifies for higher capital subsidy under MSME guidelines.');
    }

    // 5. Viability / Risk alignment
    if (risk.viabilityScore >= 60) {
      matchReasoning.push(`Strong viability score (${risk.viabilityScore}/100) enhances bank appraisal approval odds.`);
    } else {
      score -= 15;
      missingPrerequisites.push('Moderate viability score may require SHG co-guarantor or additional documentation.');
    }

    // Clamp score
    const eligibilityPercentage = Math.max(10, Math.min(100, score));
    let eligibilityStatus: 'highly_eligible' | 'conditionally_eligible' | 'ineligible' = 'conditionally_eligible';

    if (eligibilityPercentage >= 75) eligibilityStatus = 'highly_eligible';
    else if (eligibilityPercentage >= 50) eligibilityStatus = 'conditionally_eligible';
    else eligibilityStatus = 'ineligible';

    return {
      schemeId: scheme.schemeId,
      schemeName: scheme.schemeName,
      nodalAgency: scheme.nodalAgency,
      category: scheme.category,
      eligibilityPercentage,
      eligibilityStatus,
      maxLoanAmountAvailable: scheme.maxLoanAmount,
      subsidyOrGrantPercentage: scheme.subsidyOrGrantPercentage,
      interestSubventionPercentage: scheme.interestSubventionPercentage,
      collateralRequired: scheme.collateralRequired,
      matchReasoning,
      missingPrerequisites,
      requiredDocuments: scheme.requiredDocs,
      applicationPortalUrl: scheme.portalUrl,
    };
  }

  /**
   * Helper to summarize subsidy advantage
   */
  private identifySubsidyAdvantage(
    profile: BusinessProfile,
    matches: SchemeMatch[]
  ): string {
    const subsidyScheme = matches.find((m) => m.subsidyOrGrantPercentage && m.subsidyOrGrantPercentage > 0);
    if (subsidyScheme && subsidyScheme.subsidyOrGrantPercentage) {
      return `Potential to claim ${subsidyScheme.subsidyOrGrantPercentage}% upfront capital subsidy under ${subsidyScheme.schemeName}, reducing effective repayment principal.`;
    }
    return 'Consider MUDRA Kishor for 100% collateral-free processing with zero processing charges under ₹5 Lakhs.';
  }
}
