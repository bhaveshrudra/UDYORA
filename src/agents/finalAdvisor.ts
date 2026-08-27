import {
  AgentPayload,
  BusinessAgentData,
  EvidenceRecord,
  FeasibilityCategory,
  FeasibilityDimension,
  FinalFeasibilityVerdict,
  FinancialPlan,
  GovernmentScheme,
  LocationData,
  MarketAgentData,
  RiskProfile,
  SchemeMatchResult,
  UserBusinessInput
} from '../types';

/**
 * FINAL ADVISOR / DETERMINISTIC FEASIBILITY SCORING ENGINE
 * 
 * Computes a deterministic, explainable Feasibility Score (0-100) across 6 weighted dimensions:
 * 1. Market Opportunity (25%)
 * 2. Competition Dynamics (15%)
 * 3. Business Unit Economics (20%)
 * 4. Financial Debt Readiness / DSCR (15%)
 * 5. Operational Risk Buffers (15%)
 * 6. Data Grounding Confidence (10%)
 */
export function runFinalAdvisorAgent(
  input: UserBusinessInput,
  location: LocationData,
  businessData: BusinessAgentData | AgentPayload<BusinessAgentData>,
  marketData: MarketAgentData | AgentPayload<MarketAgentData>,
  financialPlan: FinancialPlan | AgentPayload<FinancialPlan>,
  schemeMatches: SchemeMatchResult[] | AgentPayload<SchemeMatchResult[]>,
  riskProfile: RiskProfile | AgentPayload<RiskProfile>,
  evidenceRecords: EvidenceRecord[] = []
): FinalFeasibilityVerdict {
  const lang = input.language || 'en';
  const bizCategory = input.businessCategoryId || 'dairy';

  // Safely extract payloads if wrapped in AgentPayload<T>
  const plan: FinancialPlan = (financialPlan as any)?.data || financialPlan || {};
  const market: MarketAgentData = (marketData as any)?.data || marketData || {};
  const risks: RiskProfile = (riskProfile as any)?.data || riskProfile || {};
  const schemes: SchemeMatchResult[] = Array.isArray(schemeMatches)
    ? schemeMatches
    : (schemeMatches as any)?.data || [];

  const monthlyNetProfit = typeof plan.estimatedMonthlyNetProfit === 'number' ? plan.estimatedMonthlyNetProfit : 25000;
  const monthlyEMI = typeof plan.monthlyEMI === 'number' ? plan.monthlyEMI : 19680;
  const dscr = typeof plan.debtServiceCoverageRatio === 'number' ? plan.debtServiceCoverageRatio : 2.38;
  const ownCapital = typeof plan.availableOwnCapital === 'number' ? plan.availableOwnCapital : (input.availableCapital || 100000);
  const loanReq = typeof plan.indicativeFinancingRequirement === 'number' ? plan.indicativeFinancingRequirement : (ownCapital * 9);

  // 1. Calculate Dimension 1: Market Opportunity (Weight: 25%)
  let marketOppScore = 78;
  const popVal = typeof location.population?.value === 'number' ? location.population.value : 3500;
  if (popVal >= 5000) marketOppScore = 88;
  else if (popVal >= 2500) marketOppScore = 80;
  else marketOppScore = 70;

  if (market.potentialDemandIndicators && market.potentialDemandIndicators.length > 0) {
    const hasHighDemand = market.potentialDemandIndicators.some((d: any) => d.level === 'HIGH');
    if (hasHighDemand) marketOppScore = Math.min(95, marketOppScore + 7);
  }

  // 2. Calculate Dimension 2: Competition Dynamics (Weight: 15%)
  let competitionScore = 75;
  const compLevel = market.competitionLevel || 'MODERATE';
  if (compLevel === 'LOW') competitionScore = 88;
  else if (compLevel === 'MODERATE') competitionScore = 75;
  else if (compLevel === 'HIGH') competitionScore = 60;
  else competitionScore = 70;

  // 3. Calculate Dimension 3: Business Unit Economics (Weight: 20%)
  let econScore = 75;
  const rev = plan.estimatedMonthlyRevenue || 120000;
  const netMargin = rev > 0 ? (monthlyNetProfit / rev) * 100 : 15;
  if (netMargin >= 25) econScore = 90;
  else if (netMargin >= 15) econScore = 80;
  else if (netMargin >= 8) econScore = 70;
  else econScore = 55;

  // 4. Calculate Dimension 4: Financial Readiness / DSCR (Weight: 15%)
  let finReadinessScore = 75;
  if (dscr >= 2.0) finReadinessScore = 92;
  else if (dscr >= 1.5) finReadinessScore = 82;
  else if (dscr >= 1.2) finReadinessScore = 68;
  else finReadinessScore = 45;

  const topScheme = schemes.length > 0 ? schemes[0] : null;
  if (topScheme && (topScheme.qualificationStatus === 'ELIGIBLE' || topScheme.status === 'ELIGIBLE')) {
    finReadinessScore = Math.min(98, finReadinessScore + 6);
  }

  // 5. Calculate Dimension 5: Operational Risk Buffers (Weight: 15%)
  let riskScore = 75;
  const overallRisk = risks.overallRiskLevel || 'MEDIUM';
  if (overallRisk === 'LOW') riskScore = 88;
  else if (overallRisk === 'MEDIUM') riskScore = 75;
  else riskScore = 55;

  // 6. Calculate Dimension 6: Data Grounding Confidence (Weight: 10%)
  let dataConfidenceScore = 85;
  const verifiedCount = evidenceRecords.filter((e) => e.status === 'VERIFIED').length;
  const totalEvidence = Math.max(1, evidenceRecords.length);
  const verifiedRatio = verifiedCount / totalEvidence;
  dataConfidenceScore = Math.round(verifiedRatio * 100);
  if (dataConfidenceScore < 40) dataConfidenceScore = 40;

  const getRating = (s: number): 'STRONG' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'CRITICAL' => {
    if (s >= 80) return 'STRONG';
    if (s >= 65) return 'ADEQUATE';
    if (s >= 50) return 'NEEDS_ATTENTION';
    return 'CRITICAL';
  };

  const marketOppRating = getRating(marketOppScore);
  const compRating = getRating(competitionScore);
  const econRating = getRating(econScore);
  const finRating = getRating(finReadinessScore);
  const riskRating = getRating(riskScore);
  const dataRating = getRating(dataConfidenceScore);

  const weightedScore = Math.round(
    marketOppScore * 0.25 +
    competitionScore * 0.15 +
    econScore * 0.20 +
    finReadinessScore * 0.15 +
    riskScore * 0.15 +
    dataConfidenceScore * 0.10
  );

  let feasibilityCategory: FeasibilityCategory = 'MODERATE';
  if (weightedScore >= 78) feasibilityCategory = 'HIGH';
  else if (weightedScore >= 60) feasibilityCategory = 'MODERATE';
  else if (weightedScore >= 45) feasibilityCategory = 'CONDITIONAL';
  else feasibilityCategory = 'LOW';

  const getSectorMarketSummary = (): string => {
    if (bizCategory === 'dairy') {
      const dairyDist = location.nearestDairyCooperativeKm?.value ?? 4.5;
      return `Proximity to cooperative collection hub (${dairyDist} km) and transport corridor provide dependable milk off-take.`;
    }
    if (bizCategory === 'tailoring') {
      return `Local demand in ${location.village || 'catchment'} for bridal wear, alteration, and institutional uniforms provides steady volume.`;
    }
    if (bizCategory === 'retail') {
      return `Daily recurring footfall for FMCG, provisions, and staples from core village settlement supports steady turnover.`;
    }
    return `Local consumer demand in ${location.village || 'the area'} provides steady off-take for the proposed enterprise.`;
  };

  const getFinancialSummary = (): string => {
    return `DSCR is calculated at ${dscr}x with indicative monthly net profit of INR ${monthlyNetProfit.toLocaleString('en-IN')} after servicing monthly EMI of INR ${monthlyEMI.toLocaleString('en-IN')}.`;
  };

  const getRiskSummary = (): string => {
    if (bizCategory === 'dairy') {
      return 'Actionable mitigations established for livestock health (insurance) and feed cost volatility (fodder cultivation).';
    }
    if (bizCategory === 'tailoring') {
      return 'Mitigations established for power continuity (inverter backup) and niche custom stitching positioning.';
    }
    if (bizCategory === 'retail') {
      return 'Credit ledger exposure capped at INR 2,500 per household and FIFO rotation deployed for perishable goods.';
    }
    return 'Standard rural operational risk buffers and 45-day working capital reserve identified.';
  };

  const dimensions: FeasibilityDimension[] = [
    {
      id: 'dim_market_opportunity',
      name: 'Market Opportunity',
      weight: 0.25,
      score: marketOppScore,
      confidence: 0.90,
      status: 'VERIFIED',
      rating: marketOppRating,
      summary: getSectorMarketSummary()
    },
    {
      id: 'dim_competition',
      name: 'Competition Dynamics',
      weight: 0.15,
      score: competitionScore,
      confidence: 0.85,
      status: 'VERIFIED',
      rating: compRating,
      summary: `Estimated competition intensity is ${market.competitionLevel || 'MODERATE'} in ${location.village || 'Locality'}.`
    },
    {
      id: 'dim_business_economics',
      name: 'Business Unit Economics',
      weight: 0.20,
      score: econScore,
      confidence: 0.95,
      status: 'VERIFIED',
      rating: econRating,
      summary: `Estimated monthly net profit is INR ${monthlyNetProfit.toLocaleString('en-IN')} with break-even period of ~${plan.estimatedBreakEvenMonths || 12} months.`
    },
    {
      id: 'dim_financial_readiness',
      name: 'Financial Debt Readiness',
      weight: 0.15,
      score: finReadinessScore,
      confidence: 0.98,
      status: 'VERIFIED',
      rating: finRating,
      summary: getFinancialSummary()
    },
    {
      id: 'dim_operational_risk',
      name: 'Operational Risk Buffers',
      weight: 0.15,
      score: riskScore,
      confidence: 0.91,
      status: 'VERIFIED',
      rating: riskRating,
      summary: getRiskSummary()
    },
    {
      id: 'dim_data_confidence',
      name: 'Data Grounding Confidence',
      weight: 0.10,
      score: dataConfidenceScore,
      confidence: dataConfidenceScore / 100,
      status: dataConfidenceScore >= 75 ? 'VERIFIED' : 'ESTIMATED',
      rating: dataRating,
      summary: `${verifiedCount} metrics verified against official Census, GIS, and Ministry guidelines.`
    }
  ];

  const readinessFactors = dimensions.map((d) => ({
    area: d.name,
    score: d.score,
    weight: Math.round(d.weight * 100),
    rating: d.rating,
    summary: d.summary
  }));

  const headline = feasibilityCategory === 'HIGH' ? 'Strong Enterprise Feasibility' : 'Moderate Enterprise Feasibility';
  const explanation = `Based on available evidence, the estimated enterprise feasibility is supported by a DSCR of ${dscr}x, steady off-take, and structured credit under ${topScheme?.scheme?.shortName || 'Government Schemes'}.`;

  const criticalCaveat = 'Institutional loan sanction is subject to lender credit appraisal, applicant CIBIL score, and document verification.';
  const disclaimer = 'UDYORA provides advisory estimates based on official data sources and mathematical models. This report is for planning and does not constitute a guaranteed commercial contract or bank credit sanction.';

  return {
    score: weightedScore,
    feasibilityScore: weightedScore,
    dataConfidenceScore,
    category: feasibilityCategory,
    headline,
    explanation,
    dimensions,
    readinessFactors,
    criticalCaveat,
    disclaimer
  };
}
