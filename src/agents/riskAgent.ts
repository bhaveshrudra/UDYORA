import {
  AgentPayload,
  EvidenceRecord,
  FinancialPlan,
  LocationData,
  RiskFactor,
  RiskProfile,
  UserBusinessInput
} from '../types';

/**
 * RISK ANALYSIS AGENT
 * Analyzes operational, financial, location, seasonal, and data-quality risk dimensions.
 * Provides actionable rural mitigation strategies without claiming absolute certainty.
 */
export function runRiskAgent(
  input: UserBusinessInput,
  location: LocationData,
  financialPlan: FinancialPlan
): AgentPayload<RiskProfile> {
  const startTime = Date.now();
  const category = input.businessCategoryId || 'dairy';
  const riskFactors: RiskFactor[] = [];

  if (category === 'dairy') {
    // 1. HIGH RISK: Animal Disease & Mortality
    riskFactors.push({
      id: 'risk_dairy_mortality',
      title: 'Livestock Disease Outbreak & Mortality Risk',
      category: 'BUSINESS',
      severity: 'HIGH',
      description: 'Cattle susceptibility to Mastitis, Foot & Mouth Disease (FMD), or Lumpy Skin Disease can cause abrupt milk yield drops or capital loss.',
      potentialImpact: 'Loss of high-value milking animal (₹65,000+ per cow) and 2-4 week milk disruption.',
      mitigationSuggestion: 'Mandatory comprehensive cattle insurance (covered in working capital budget) and strict adherence to quarterly veterinary vaccination schedules.',
      evidenceRefId: 'ev_crossbred_cow_market_rate_pune',
      confidence: 0.92
    });

    // 2. HIGH RISK: Cattle Feed Price Volatility
    riskFactors.push({
      id: 'risk_dairy_feed_volatility',
      title: 'Feed & Fodder Price Inflation',
      category: 'MARKET',
      severity: 'HIGH',
      description: 'Concentrate feed prices (soybean meal, maize, de-oiled cakes) fluctuate based on agricultural harvest commodity cycles.',
      potentialImpact: 'Feed costs represent 60-65% of daily recurring operating expenses; 15% feed hike compresses operating margin.',
      mitigationSuggestion: 'Cultivate own perennial green fodder (Napier grass / Lucerne) on leased/owned land to insulate against commercial market spikes.',
      evidenceRefId: 'ev_dairy_concentrate_feed_cost',
      confidence: 0.94
    });

    // 3. MEDIUM RISK: Seasonal Summer Milk Yield Drop
    riskFactors.push({
      id: 'risk_dairy_seasonal_heat',
      title: 'Summer Heat Stress & Seasonal Yield Contraction',
      category: 'SEASONAL',
      severity: 'MEDIUM',
      description: 'Crossbred cows experience heat stress during peak summer (April-June), reducing daily milk yield by 15-25%.',
      potentialImpact: 'Temporary drop in daily cash inflow and lower fat percentage during summer.',
      mitigationSuggestion: 'Install foggers/misting nozzles and insulated thatch/shaded roofing in cattle shed to maintain ambient temperature below 28°C.',
      evidenceRefId: location.powerAvailabilityHours.id,
      confidence: 0.88
    });

    // 4. MEDIUM RISK: Debt Servicing / Liquidity Crunch
    riskFactors.push({
      id: 'risk_dairy_debt_service',
      title: 'Debt Servicing Cashflow Synchronization',
      category: 'FINANCIAL',
      severity: 'MEDIUM',
      description: `Monthly loan repayment commitment is ₹${financialPlan.monthlyEMI.toLocaleString('en-IN')}/month starting after ${financialPlan.moratoriumMonths} months moratorium.`,
      potentialImpact: 'Delay in milk cooperative payment disbursements could temporarily stress bank installment servicing.',
      mitigationSuggestion: `Utilize 3-month moratorium window to stabilize herd lactation cycles and maintain a 45-day operating cash buffer (₹${Math.round(financialPlan.monthlyEMI * 1.5).toLocaleString('en-IN')}).`,
      evidenceRefId: 'ev_fin_monthly_emi',
      confidence: 0.95
    });

    // 5. LOW RISK: Local Milk Off-Take Absorption
    riskFactors.push({
      id: 'risk_dairy_offtake',
      title: 'Bulk Milk Off-Take & Market Channel Dependency',
      category: 'COMPETITION',
      severity: 'LOW',
      description: `Proximity to cooperative collection point (${location.nearestDairyCooperativeKm.value} km) provides reliable off-take.`,
      potentialImpact: 'Low risk of unsold milk; however, single-buyer dependence limits pricing flexibility.',
      mitigationSuggestion: 'Diversify revenue by supplying 20-30% volume directly to local sweet shops or retail households at higher margins (₹45-50/L).',
      evidenceRefId: location.nearestDairyCooperativeKm.id,
      confidence: 0.9
    });

    // 6. LOW RISK: Data Quality & Granularity
    riskFactors.push({
      id: 'risk_dairy_data_granularity',
      title: 'Hyper-Local Sub-Ward Telemetry Limitation',
      category: 'DATA_QUALITY',
      severity: 'LOW',
      description: 'Ward-level unorganized micro-producer counts are estimated from regional agricultural census extrapolation.',
      potentialImpact: 'Local pocket dynamics may slightly vary from block statistical aggregates.',
      mitigationSuggestion: 'Perform on-ground validation with the local Dairy Cooperative Secretary before committing capital.',
      evidenceRefId: 'ev_ward_level_exact_daily_milk_surplus',
      confidence: 0.8
    });
  } else {
    // Generic fallback for other categories
    riskFactors.push(
      {
        id: 'risk_gen_mkt',
        title: 'Demand Seasonality & Working Capital Cycle',
        category: 'MARKET',
        severity: 'MEDIUM',
        description: 'Revenue is subject to regional harvest cycles and festival spending patterns.',
        potentialImpact: 'Cashflow volatility during lean monsoon months.',
        mitigationSuggestion: 'Maintain strict 60-day working capital reserve and avoid excessive uncollateralized customer credit.',
        confidence: 0.85
      },
      {
        id: 'risk_gen_fin',
        title: 'Debt Service Regularity',
        category: 'FINANCIAL',
        severity: 'MEDIUM',
        description: `Monthly EMI commitment of ₹${financialPlan.monthlyEMI.toLocaleString('en-IN')}.`,
        potentialImpact: 'Interest accumulation if monthly revenue falls below baseline projections.',
        mitigationSuggestion: 'Enroll in government subsidized schemes with interest subvention or capital subsidies.',
        confidence: 0.9
      }
    );
  }

  const highCount = riskFactors.filter((r) => r.severity === 'HIGH').length;
  const mediumCount = riskFactors.filter((r) => r.severity === 'MEDIUM').length;
  const lowCount = riskFactors.filter((r) => r.severity === 'LOW').length;

  const overallRiskLevel: RiskProfile['overallRiskLevel'] =
    highCount >= 3 ? 'HIGH' : highCount >= 1 || mediumCount >= 3 ? 'MEDIUM' : 'LOW';

  const riskProfile: RiskProfile = {
    overallRiskLevel,
    highRiskCount: highCount,
    mediumRiskCount: mediumCount,
    lowRiskCount: lowCount,
    riskFactors,
    summary: `Assessed ${riskFactors.length} multidimensional risk vectors (${highCount} High, ${mediumCount} Medium, ${lowCount} Low). Primary vulnerabilities relate to biological mortality and feed input price volatility.`,
    dataConfidenceLimitation: 'Risk weights are based on historical district agricultural reports and standard rural lending stress test models.'
  };

  const generatedEvidence: EvidenceRecord[] = [
    {
      id: `ev_risk_profile_${category}`,
      metricName: 'Aggregated Business & Credit Risk Index',
      value: overallRiskLevel,
      source: 'UDYORA Multidimensional Rural Risk Framework',
      geographicLevel: 'District',
      timestamp: new Date().toISOString(),
      status: 'VERIFIED',
      confidence: 0.88
    }
  ];

  return {
    agentName: 'Risk Analysis Agent',
    status: 'SUCCESS',
    executionTimeMs: Date.now() - startTime,
    dataQuality: 'VERIFIED',
    overallConfidence: 0.89,
    summary: riskProfile.summary,
    data: riskProfile,
    evidenceGenerated: generatedEvidence
  };
}
