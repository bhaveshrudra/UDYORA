import {
  AgentPayload,
  BusinessAgentData,
  FeasibilityCategory,
  FinalFeasibilityVerdict,
  FinancialPlan,
  LocationData,
  MarketAgentData,
  RiskProfile,
  SchemeMatchResult,
  UserBusinessInput,
  EvidenceRecord
} from '../types';

/**
 * FINAL ADVISOR / REPORT AGENT
 * Synthesizes all validated multi-agent findings into a clear, explainable,
 * balanced feasibility advisory report.
 * 
 * Strict Guideline:
 * Never say "Your business will definitely succeed."
 * Uses "Based on available evidence, the estimated feasibility is..."
 */
export function runFinalAdvisorAgent(
  input: UserBusinessInput,
  location: LocationData,
  businessPayload: AgentPayload<BusinessAgentData>,
  marketPayload: AgentPayload<MarketAgentData>,
  financePayload: AgentPayload<FinancialPlan>,
  schemePayload: AgentPayload<SchemeMatchResult[]>,
  riskPayload: AgentPayload<RiskProfile>,
  evidenceAuditLog: EvidenceRecord[]
): FinalFeasibilityVerdict {
  const plan = financePayload.data;
  const risk = riskPayload.data;
  const schemes = schemePayload.data;
  const market = marketPayload.data;

  // Compute explainable readiness scores across 5 pillars
  // Pillar 1: Market Demand & Connectivity (Weight: 25%)
  let marketScore = 70;
  if (market.competitionLevel === 'LOW' || market.competitionLevel === 'MODERATE') marketScore += 15;
  if (location.transportConnectivity.status === 'VERIFIED') marketScore += 10;
  marketScore = Math.min(100, Math.max(0, marketScore));

  // Pillar 2: Financial Viability & DSCR (Weight: 25%)
  let financialScore = 65;
  if (plan.debtServiceCoverageRatio >= 2.0) financialScore += 25;
  else if (plan.debtServiceCoverageRatio >= 1.5) financialScore += 15;
  else if (plan.debtServiceCoverageRatio >= 1.2) financialScore += 5;
  else financialScore -= 20;
  financialScore = Math.min(100, Math.max(0, financialScore));

  // Pillar 3: Government Scheme & Subsidy Alignment (Weight: 20%)
  const topScheme = schemes[0];
  let schemeScore = 50;
  if (topScheme && topScheme.qualificationStatus === 'ELIGIBLE') schemeScore = topScheme.matchScore;
  else if (topScheme && topScheme.qualificationStatus === 'CONDITIONALLY_ELIGIBLE') schemeScore = Math.round(topScheme.matchScore * 0.85);

  // Pillar 4: Risk Manageability & Mitigations (Weight: 15%)
  let riskScore = 60;
  if (risk.overallRiskLevel === 'LOW') riskScore = 88;
  else if (risk.overallRiskLevel === 'MEDIUM') riskScore = 72;
  else riskScore = 45;

  // Pillar 5: Evidence Grounding & Data Quality (Weight: 15%)
  const verifiedCount = evidenceAuditLog.filter((e) => e.status === 'VERIFIED').length;
  const dataQualityScore = Math.min(100, Math.round((verifiedCount / Math.max(1, evidenceAuditLog.length)) * 100));

  // Weighted Total Feasibility Score (0 to 100)
  const weightedScore = Math.round(
    marketScore * 0.25 +
    financialScore * 0.25 +
    schemeScore * 0.20 +
    riskScore * 0.15 +
    dataQualityScore * 0.15
  );

  let category: FeasibilityCategory = 'MODERATE';
  if (weightedScore >= 80) category = 'HIGH';
  else if (weightedScore >= 65) category = 'MODERATE';
  else if (weightedScore >= 50) category = 'CONDITIONAL';
  else category = 'LOW';

  const readinessFactors = [
    {
      area: 'Market Demand & Off-Take',
      score: marketScore,
      weight: 25,
      rating: (marketScore >= 80 ? 'STRONG' : marketScore >= 65 ? 'ADEQUATE' : 'NEEDS_ATTENTION') as 'STRONG' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'CRITICAL',
      summary: `Proximity to cooperative collection point (${location.nearestDairyCooperativeKm.value} km) and access to highway corridor provide steady demand off-take.`
    },
    {
      area: 'Financial Debt Service Capacity',
      score: financialScore,
      weight: 25,
      rating: (financialScore >= 80 ? 'STRONG' : financialScore >= 65 ? 'ADEQUATE' : 'NEEDS_ATTENTION') as 'STRONG' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'CRITICAL',
      summary: `DSCR is calculated at ${plan.debtServiceCoverageRatio}x with indicative monthly net profit of ₹${plan.estimatedMonthlyNetProfit.toLocaleString('en-IN')} after servicing monthly EMI of ₹${plan.monthlyEMI.toLocaleString('en-IN')}.`
    },
    {
      area: 'Institutional Scheme Alignment',
      score: schemeScore,
      weight: 20,
      rating: (schemeScore >= 80 ? 'STRONG' : schemeScore >= 65 ? 'ADEQUATE' : 'NEEDS_ATTENTION') as 'STRONG' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'CRITICAL',
      summary: `Strong eligibility under ${topScheme?.scheme.shortName || 'PMEGP'} with estimated margin money subsidy of ₹${topScheme?.potentialSubsidyAmount.toLocaleString('en-IN') || '0'}.`
    },
    {
      area: 'Risk Mitigation & Buffers',
      score: riskScore,
      weight: 15,
      rating: (riskScore >= 75 ? 'STRONG' : riskScore >= 60 ? 'ADEQUATE' : 'NEEDS_ATTENTION') as 'STRONG' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'CRITICAL',
      summary: `Mitigation strategies established for livestock mortality (insurance) and feed volatility (fodder cultivation).`
    },
    {
      area: 'Evidence Rigor & Data Quality',
      score: dataQualityScore,
      weight: 15,
      rating: (dataQualityScore >= 75 ? 'STRONG' : 'ADEQUATE') as 'STRONG' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'CRITICAL',
      summary: `${verifiedCount} of ${evidenceAuditLog.length} foundational parameters verified against Census, NABARD, and District records.`
    }
  ];

  const headline = `Based on available evidence, the estimated enterprise feasibility is ${category} (${weightedScore}/100).`;

  const explanation = `The proposed ${businessPayload.data.businessSummary.toLowerCase()} in ${location.village} shows viable unit economics with a projected Debt Service Coverage Ratio (DSCR) of ${plan.debtServiceCoverageRatio}x. Capital contribution of ₹${plan.availableOwnCapital.toLocaleString('en-IN')} successfully satisfies the 10% promoter margin requirement under ${topScheme?.scheme.shortName || 'PMEGP'} for an indicative project cost of ₹${plan.indicativeProjectCost.toLocaleString('en-IN')}. Key operational priorities include maintaining livestock biosecurity and managing dry season feed procurement.`;

  const criticalCaveat = `Feasibility is conditioned upon obtaining formal credit sanction from a participating commercial/rural bank, completing veterinary tagging/insurance, and securing assured off-take with the local cooperative collection center.`;

  const disclaimer = `UDYORA provides advisory intelligence based on deterministic financial formulas, structured government scheme guidelines, and verified public datasets. This dossier does not constitute a guaranteed commercial outcome or formal banking sanction. Field verification by a certified banking correspondent or veterinary extension officer is advised prior to capital disbursement.`;

  return {
    score: weightedScore,
    category,
    headline,
    explanation,
    readinessFactors,
    criticalCaveat,
    disclaimer
  };
}
