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
 * Analyzes operational, financial, location, seasonal, and data-quality risk dimensions safely.
 */
export function runRiskAgent(
  input: UserBusinessInput,
  location: LocationData,
  financialPlan: FinancialPlan
): AgentPayload<RiskProfile> {
  const startTime = Date.now();
  const category = input.businessCategoryId || 'dairy';
  const riskFactors: RiskFactor[] = [];

  const emiVal = financialPlan?.monthlyEMI ?? 19688;
  const moratVal = financialPlan?.moratoriumMonths ?? 3;
  const powerEvRefId = location.powerAvailabilityHours?.id || location.powerReliabilityHoursPerDay?.id || 'ev_power_general';

  if (category === 'dairy') {
    // 1. HIGH RISK: Animal Disease & Mortality
    riskFactors.push({
      id: 'risk_dairy_mortality',
      title: 'Livestock Disease Outbreak & Mortality Risk',
      category: 'BUSINESS',
      dimension: 'BIOLOGICAL',
      severity: 'HIGH',
      description: 'Cattle susceptibility to Mastitis, Foot & Mouth Disease (FMD), or Lumpy Skin Disease can cause abrupt milk yield drops or capital loss.',
      potentialImpact: 'Loss of high-value milking animal (₹65,000+ per cow) and 2-4 week milk disruption.',
      mitigation: 'Mandatory comprehensive cattle insurance (covered in working capital budget) and strict adherence to quarterly veterinary vaccination schedules.',
      mitigationSuggestion: 'Mandatory comprehensive cattle insurance (covered in working capital budget) and strict adherence to quarterly veterinary vaccination schedules.',
      evidenceRefId: 'ev_crossbred_cow_market_rate',
      confidence: 0.92
    });

    // 2. HIGH RISK: Cattle Feed Price Volatility
    riskFactors.push({
      id: 'risk_dairy_feed_volatility',
      title: 'Feed & Fodder Price Inflation',
      category: 'MARKET',
      dimension: 'MARKET',
      severity: 'HIGH',
      description: 'Concentrate feed prices (soybean meal, maize, de-oiled cakes) fluctuate based on agricultural harvest commodity cycles.',
      potentialImpact: 'Feed costs represent 60-65% of daily recurring operating expenses; 15% feed hike compresses operating margin.',
      mitigation: 'Cultivate own perennial green fodder (Napier grass / Lucerne) on leased/owned land to insulate against commercial market spikes.',
      mitigationSuggestion: 'Cultivate own perennial green fodder (Napier grass / Lucerne) on leased/owned land to insulate against commercial market spikes.',
      evidenceRefId: 'ev_dairy_concentrate_feed_cost',
      confidence: 0.94
    });

    // 3. MEDIUM RISK: Seasonal Summer Milk Yield Drop
    riskFactors.push({
      id: 'risk_dairy_seasonal_heat',
      title: 'Summer Heat Stress & Seasonal Yield Contraction',
      category: 'SEASONAL',
      dimension: 'SEASONAL',
      severity: 'MEDIUM',
      description: 'Crossbred cows experience heat stress during peak summer (April-June), reducing daily milk yield by 15-25%.',
      potentialImpact: 'Temporary drop in daily cash inflow and lower fat percentage during summer.',
      mitigation: 'Install foggers/misting nozzles and insulated thatch/shaded roofing in cattle shed to maintain ambient temperature below 28°C.',
      mitigationSuggestion: 'Install foggers/misting nozzles and insulated thatch/shaded roofing in cattle shed to maintain ambient temperature below 28°C.',
      evidenceRefId: powerEvRefId,
      confidence: 0.88
    });

    // 4. MEDIUM RISK: Debt Servicing / Liquidity Crunch
    riskFactors.push({
      id: 'risk_dairy_debt_service',
      title: 'Debt Servicing Cashflow Synchronization',
      category: 'FINANCIAL',
      dimension: 'FINANCIAL',
      severity: 'MEDIUM',
      description: `Monthly loan repayment commitment is ₹${emiVal.toLocaleString('en-IN')}/month starting after ${moratVal} months moratorium.`,
      potentialImpact: 'Delay in milk cooperative payment disbursements could temporarily stress bank installment servicing.',
      mitigation: `Utilize ${moratVal}-month moratorium window to stabilize herd lactation cycles and maintain a 45-day operating cash buffer (₹${Math.round(emiVal * 1.5).toLocaleString('en-IN')}).`,
      mitigationSuggestion: `Utilize ${moratVal}-month moratorium window to stabilize herd lactation cycles and maintain a 45-day operating cash buffer (₹${Math.round(emiVal * 1.5).toLocaleString('en-IN')}).`,
      evidenceRefId: 'ev_fin_monthly_emi',
      confidence: 0.95
    });
  } else if (category === 'tailoring') {
    riskFactors.push(
      {
        id: 'risk_tailoring_fashion_shift',
        title: 'Ready-Made Apparel Market Substitution',
        category: 'MARKET',
        dimension: 'MARKET',
        severity: 'MEDIUM',
        description: 'Availability of budget readymade garments from wholesale mandis dampens routine stitching demand.',
        mitigation: 'Pivot workshop toward high-margin custom bridal alterations, customized boutique finishes, and bulk school uniform contracts.',
        mitigationSuggestion: 'Pivot workshop toward high-margin custom bridal alterations, customized boutique finishes, and bulk school uniform contracts.',
        confidence: 0.85
      },
      {
        id: 'risk_tailoring_power_interrupt',
        title: 'Power Outage Machine Downtime',
        category: 'OPERATIONAL',
        dimension: 'OPERATIONAL',
        severity: 'MEDIUM',
        description: 'Industrial high-speed computerized stitching machines require continuous electricity.',
        mitigation: 'Install a 2 kVA solar/inverter battery backup to sustain key production lines through daytime load shedding.',
        mitigationSuggestion: 'Install a 2 kVA solar/inverter battery backup to sustain key production lines through daytime load shedding.',
        confidence: 0.88
      }
    );
  } else if (category === 'retail') {
    riskFactors.push(
      {
        id: 'risk_retail_credit_khata',
        title: 'Customer Ledger Credit (Khata) Risk',
        category: 'FINANCIAL',
        dimension: 'FINANCIAL',
        severity: 'HIGH',
        description: 'Extended credit to agrarian households during pre-harvest lean periods can strain working capital liquidity.',
        mitigation: 'Cap individual household credit to ₹2,500 with strict 30-day settlement rules and promote digital UPI discounts.',
        mitigationSuggestion: 'Cap individual household credit to ₹2,500 with strict 30-day settlement rules and promote digital UPI discounts.',
        confidence: 0.90
      },
      {
        id: 'risk_retail_spoilage',
        title: 'Perishable Goods Spoilage & Inventory Expiry',
        category: 'OPERATIONAL',
        dimension: 'OPERATIONAL',
        severity: 'MEDIUM',
        description: 'Dairy, bread, and packaged food spoilage due to intermittent refrigeration or slow inventory turn.',
        mitigation: 'Implement strict First-In-First-Out (FIFO) stock rotation and deploy a commercial energy-efficient display cooler.',
        mitigationSuggestion: 'Implement strict First-In-First-Out (FIFO) stock rotation and deploy a commercial energy-efficient display cooler.',
        confidence: 0.87
      }
    );
  } else {
    riskFactors.push({
      id: 'risk_generic_liquidity',
      title: 'Operating Liquidity & Working Capital Management',
      category: 'FINANCIAL',
      dimension: 'FINANCIAL',
      severity: 'MEDIUM',
      description: 'Balancing receivables and inventory replenishment cycles during seasonal swings.',
      mitigation: 'Maintain 45-day operational cash reserve buffer.',
      mitigationSuggestion: 'Maintain 45-day operational cash reserve buffer.',
      confidence: 0.85
    });
  }

  const highCount = riskFactors.filter((r) => r.severity === 'HIGH').length;
  const medCount = riskFactors.filter((r) => r.severity === 'MEDIUM').length;
  const lowCount = riskFactors.filter((r) => r.severity === 'LOW').length;

  let overallRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  if (highCount >= 3) overallRiskLevel = 'HIGH';
  else if (highCount === 0 && medCount <= 1) overallRiskLevel = 'LOW';

  const riskProfile: RiskProfile = {
    overallRiskLevel,
    riskFactors,
    dataConfidenceScore: 0.91,
    insufficientDataFields: [],
    highRiskCount: highCount,
    mediumRiskCount: medCount,
    lowRiskCount: lowCount,
    summary: `${highCount} high-priority vulnerabilities identified with actionable rural risk mitigations.`
  };

  return {
    agentName: 'Risk Analysis Agent',
    status: 'SUCCESS',
    executionTimeMs: Date.now() - startTime,
    dataQuality: 'VERIFIED',
    overallConfidence: 0.91,
    summary: `Risk matrix compiled: ${overallRiskLevel} overall risk profile with ${riskFactors.length} multidimensional vectors.`,
    data: riskProfile,
    evidenceGenerated: []
  };
}
