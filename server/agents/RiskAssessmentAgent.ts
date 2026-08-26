import { ai, DEFAULT_GEMINI_MODEL } from '../config/gemini.js';
import {
  BusinessProfile,
  FinancialEngineOutput,
  RiskAssessmentOutput,
  StressTestScenario,
  RiskWarning,
  ViabilityTier,
  AgentOutput,
} from '../types.js';

/**
 * RiskAssessmentAgent
 * 
 * Evaluates business viability for rural micro-entrepreneurs:
 * 1. Computes Business Viability Score (0-100) and risk tier
 * 2. Runs deterministic repayment stress tests under varied market shocks
 * 3. Identifies structural vulnerabilities (informal debt traps, extreme seasonality, thin margins)
 * 4. Leverages Gemini AI to generate contextual risk explanations and mitigations
 */
export class RiskAssessmentAgent {
  private modelName: string;

  constructor(modelName = DEFAULT_GEMINI_MODEL) {
    this.modelName = modelName;
  }

  /**
   * Primary execution method for Risk Assessment.
   */
  public async assessRisk(
    profile: BusinessProfile,
    financialMetrics: FinancialEngineOutput
  ): Promise<AgentOutput<RiskAssessmentOutput>> {
    const startTime = Date.now();

    try {
      // 1. Deterministic Stress Testing Scenarios
      const stressTestScenarios = this.runStressTests(profile, financialMetrics);

      // 2. Viability Score Computation
      const { viabilityScore, viabilityTier, repaymentProbabilityScore } =
        this.computeViabilityScore(profile, financialMetrics, stressTestScenarios);

      // 3. Rule-Based Risk Warnings
      const baseWarnings = this.identifyRuleBasedWarnings(profile, financialMetrics, stressTestScenarios);

      // 4. AI-Enhanced Qualitative Strengths & Weaknesses
      const qualitativeInsights = await this.generateAIQualitativeInsights(
        profile,
        financialMetrics,
        viabilityScore,
        baseWarnings
      );

      const output: RiskAssessmentOutput = {
        viabilityScore,
        viabilityTier,
        confidenceScore: 0.88,
        stressTestScenarios,
        riskWarnings: [...baseWarnings, ...qualitativeInsights.additionalWarnings],
        strengths: qualitativeInsights.strengths,
        weaknesses: qualitativeInsights.weaknesses,
        repaymentProbabilityScore,
      };

      return {
        agentName: 'RiskAssessmentAgent',
        success: true,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
        data: output,
        agentNotes: [
          `Viability Tier: ${viabilityTier} (Score: ${viabilityScore}/100)`,
          `Stress Test: Can survive lean season? ${stressTestScenarios.find(s => s.scenarioName === 'severe_lean_season')?.canServiceProposedEMI ? 'YES' : 'NO'}`,
          `Identified ${output.riskWarnings.length} risk flags.`,
        ],
      };
    } catch (error: any) {
      return {
        agentName: 'RiskAssessmentAgent',
        success: false,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
        data: {} as RiskAssessmentOutput,
        errors: [error.message || 'Error executing RiskAssessmentAgent'],
      };
    }
  }

  /**
   * Runs multi-scenario repayment stress testing:
   * - Normal conditions (100% revenue)
   * - Moderate downturn (-20% revenue)
   * - Severe lean / monsoon season (-40% revenue)
   * - Cost inflation shock (+15% input costs)
   */
  public runStressTests(
    profile: BusinessProfile,
    financial: FinancialEngineOutput
  ): StressTestScenario[] {
    const normalRevenue = profile.monthlyRevenue;
    const fixedCosts = profile.monthlyFixedCosts || 0;
    const variableRatio = normalRevenue > 0 ? (profile.monthlyVariableCosts / normalRevenue) : 0.6;
    const proposedEMI = financial.loanCapacity.recommendedMaxMonthlyEMI;
    const existingEMI = financial.cashFlow.existingMonthlyDebtServicing;
    const totalDebtService = proposedEMI + existingEMI;

    const scenarios: StressTestScenario[] = [
      {
        scenarioName: 'normal',
        description: 'Standard operating month with full expected sales',
        revenueImpactPercentage: 0,
        projectedMonthlyRevenue: normalRevenue,
        projectedNetCashFlow: financial.cashFlow.netOperatingCashFlow,
        canServiceProposedEMI: financial.cashFlow.netOperatingCashFlow >= totalDebtService,
        cashDeficitOrSurplus: Math.round(financial.cashFlow.netOperatingCashFlow - totalDebtService),
      },
      {
        scenarioName: 'moderate_downturn',
        description: 'Temporary dip in local footfall or demand (-20% revenue)',
        revenueImpactPercentage: -20,
        projectedMonthlyRevenue: Math.round(normalRevenue * 0.8),
        projectedNetCashFlow: Math.round((normalRevenue * 0.8) - (fixedCosts + (normalRevenue * 0.8 * variableRatio))),
        canServiceProposedEMI: false,
        cashDeficitOrSurplus: 0,
      },
      {
        scenarioName: 'severe_lean_season',
        description: 'Off-season or climate/agricultural dry spell (-40% revenue)',
        revenueImpactPercentage: -40,
        projectedMonthlyRevenue: Math.round(normalRevenue * 0.6),
        projectedNetCashFlow: Math.round((normalRevenue * 0.6) - (fixedCosts + (normalRevenue * 0.6 * variableRatio))),
        canServiceProposedEMI: false,
        cashDeficitOrSurplus: 0,
      },
      {
        scenarioName: 'cost_inflation_shock',
        description: 'Wholesale / raw material price escalation (+15% variable costs)',
        revenueImpactPercentage: 0,
        projectedMonthlyRevenue: normalRevenue,
        projectedNetCashFlow: Math.round(normalRevenue - (fixedCosts + (profile.monthlyVariableCosts * 1.15))),
        canServiceProposedEMI: false,
        cashDeficitOrSurplus: 0,
      },
    ];

    // Compute feasibility for each stress scenario
    return scenarios.map((scenario) => {
      const netCash = scenario.projectedNetCashFlow;
      const surplusOrDeficit = Math.round(netCash - totalDebtService);
      return {
        ...scenario,
        canServiceProposedEMI: surplusOrDeficit >= 0,
        cashDeficitOrSurplus: surplusOrDeficit,
      };
    });
  }

  /**
   * Computes weighted Business Viability Score (0-100)
   */
  public computeViabilityScore(
    profile: BusinessProfile,
    financial: FinancialEngineOutput,
    scenarios: StressTestScenario[]
  ): {
    viabilityScore: number;
    viabilityTier: ViabilityTier;
    repaymentProbabilityScore: number;
  } {
    let score = 50; // baseline

    // 1. Operating Profitability & Margin (max +20)
    if (financial.breakEven.safetyMarginPercentage > 40) score += 20;
    else if (financial.breakEven.safetyMarginPercentage > 20) score += 12;
    else if (financial.breakEven.safetyMarginPercentage > 0) score += 5;
    else score -= 15;

    // 2. DSCR & Debt Capacity (max +20)
    if (financial.loanCapacity.debtServiceCoverageRatio >= 2.0) score += 20;
    else if (financial.loanCapacity.debtServiceCoverageRatio >= 1.5) score += 14;
    else if (financial.loanCapacity.debtServiceCoverageRatio >= 1.2) score += 6;
    else score -= 15;

    // 3. Vintage / Stability (max +15)
    if (profile.yearsInOperation >= 5) score += 15;
    else if (profile.yearsInOperation >= 2) score += 10;
    else if (profile.yearsInOperation >= 1) score += 5;

    // 4. Stress Test Resilience (max +15)
    const severeLeanScenario = scenarios.find((s) => s.scenarioName === 'severe_lean_season');
    if (severeLeanScenario && severeLeanScenario.canServiceProposedEMI) {
      score += 15;
    } else {
      score -= 5;
    }

    // 5. Informal Debt Penalty (up to -20)
    if (financial.loanCapacity.informalDebtBurdenRatio > 50) {
      score -= 20;
    } else if (financial.loanCapacity.informalDebtBurdenRatio > 20) {
      score -= 10;
    }

    // Clamp score 0 - 100
    const finalScore = Math.max(5, Math.min(95, Math.round(score)));

    let viabilityTier: ViabilityTier = 'MODERATE_VIABILITY';
    if (finalScore >= 75) viabilityTier = 'HIGH_VIABILITY';
    else if (finalScore >= 55) viabilityTier = 'MODERATE_VIABILITY';
    else if (finalScore >= 35) viabilityTier = 'VULNERABLE';
    else viabilityTier = 'HIGH_RISK';

    const repaymentProbabilityScore = Math.max(10, Math.min(98, Math.round(finalScore * 0.95 + 2)));

    // TODO: Include alternate data indicators (e.g. UPI transaction consistency, electricity bill track)

    return {
      viabilityScore: finalScore,
      viabilityTier,
      repaymentProbabilityScore,
    };
  }

  /**
   * Generates deterministic risk warning flags based on threshold triggers
   */
  public identifyRuleBasedWarnings(
    profile: BusinessProfile,
    financial: FinancialEngineOutput,
    scenarios: StressTestScenario[]
  ): RiskWarning[] {
    const warnings: RiskWarning[] = [];

    // 1. Informal moneylender high-interest trap
    const informalDebt = (profile.existingDebts || []).find((d) => d.sourceType === 'informal_moneylender');
    if (informalDebt) {
      warnings.push({
        severity: 'high',
        category: 'informal_debt_trap',
        title: 'High-Cost Informal Debt Detected',
        explanation: `Existing loan of ₹${informalDebt.outstandingPrincipal.toLocaleString('en-IN')} from moneylender carries high interest, eroding net business surplus.`,
        mitigationSuggestion: 'Prioritize refinancing this debt via a low-interest formal MUDRA / PM SVANidhi institutional loan.',
      });
    }

    // 2. Severe lean season cash deficit
    const leanScenario = scenarios.find((s) => s.scenarioName === 'severe_lean_season');
    if (leanScenario && !leanScenario.canServiceProposedEMI) {
      warnings.push({
        severity: 'medium',
        category: 'seasonality_drought',
        title: 'Vulnerable to Off-Season Cash Shortfall',
        explanation: `During lean months, net cash flow drops to ₹${leanScenario.projectedNetCashFlow.toLocaleString('en-IN')}, causing a potential repayment deficit of ₹${Math.abs(leanScenario.cashDeficitOrSurplus).toLocaleString('en-IN')}.`,
        mitigationSuggestion: 'Build a 2-month EMI reserve during festival peak months or opt for a flexi-bullet repayment schedule.',
      });
    }

    // 3. Thin profit margin
    if (financial.breakEven.grossMarginPercentage < 18) {
      warnings.push({
        severity: 'medium',
        category: 'thin_margins',
        title: 'Slim Gross Operating Margins',
        explanation: `Gross margin is currently ${financial.breakEven.grossMarginPercentage}%, making the business sensitive to wholesale price spikes.`,
        mitigationSuggestion: 'Explore bulk purchasing through local trader clusters or FPO/SHG linkages to reduce input costs by 4-6%.',
      });
    }

    return warnings;
  }

  /**
   * Calls Gemini to provide qualitative contextual SWOT analysis for rural micro-entrepreneurs.
   */
  private async generateAIQualitativeInsights(
    profile: BusinessProfile,
    financial: FinancialEngineOutput,
    viabilityScore: number,
    existingWarnings: RiskWarning[]
  ): Promise<{
    strengths: string[];
    weaknesses: string[];
    additionalWarnings: RiskWarning[];
  }> {
    // TODO: 1. Send profile + financial summary to Gemini model
    // TODO: 2. Request structured strengths, weaknesses, and local context insights
    // Scaffolding default response:

    return {
      strengths: [
        `Proven track record with ${profile.yearsInOperation} years of continuous local market presence.`,
        `Healthy gross margin buffer of ${financial.breakEven.grossMarginPercentage}% above fixed overheads.`,
        `Strong festival/harvest season peak revenue multiplier (up to ₹${profile.seasonality?.peakMonthlyRevenue?.toLocaleString('en-IN') || 'N/A'}).`,
      ],
      weaknesses: [
        `Lack of formal accounting books or GST registration may limit Tier-1 commercial bank appetite.`,
        `Reliance on local cash receivables during agricultural sowing cycles.`,
      ],
      additionalWarnings: [],
    };
  }
}
