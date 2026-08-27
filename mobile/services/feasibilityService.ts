import {
  CanonicalBusinessCategory,
  LocationResolution,
  FeasibilityBreakdown,
  DomainComparisonItem,
  POIDataQuality
} from '../types';

export const feasibilityService = {
  /**
   * Deterministic Feasibility Score Calculation
   */
  calculateFeasibility(
    businessCategory: CanonicalBusinessCategory,
    availableCapital: number,
    location: LocationResolution,
    observedPoiCount: number = 5
  ): FeasibilityBreakdown {
    // 1. Market Opportunity (Weight: 20%)
    let marketScore = 80;
    if (businessCategory === 'Dairy') {
      marketScore = location.areaType === 'Rural' ? 88 : 82;
    } else if (businessCategory === 'Retail') {
      marketScore = location.areaType === 'Urban' ? 85 : 78;
    } else if (businessCategory === 'Tailoring') {
      marketScore = 75;
    } else if (businessCategory === 'Poultry') {
      marketScore = location.areaType === 'Rural' ? 84 : 70;
    }

    // 2. Capital Fit (Weight: 20%)
    let capitalScore = 70;
    if (availableCapital >= 200000) capitalScore = 92;
    else if (availableCapital >= 100000) capitalScore = 86;
    else if (availableCapital >= 50000) capitalScore = 78;
    else capitalScore = 65;

    // 3. Revenue Potential (Weight: 15%)
    const revenueScore = businessCategory === 'Dairy' ? 85 : businessCategory === 'Retail' ? 80 : 76;

    // 4. Competition Density (Weight: 10%)
    // Fewer observed POIs -> higher unserved demand score
    const competitionScore = Math.max(60, Math.min(90, 88 - observedPoiCount * 2));

    // 5. Operational Risk (Weight: 15%)
    const opRiskScore = businessCategory === 'Tailoring' ? 86 : businessCategory === 'Retail' ? 82 : 78;

    // 6. Infrastructure Access (Weight: 10%)
    const infraScore = location.dataQuality === 'VERIFIED' ? 88 : 80;

    // 7. Scheme & Financing Fit (Weight: 10%)
    const schemeScore = 90;

    const factors = [
      {
        name: 'Market Opportunity',
        score: marketScore,
        weight: 0.2,
        weightedScore: Math.round(marketScore * 0.2 * 10) / 10,
        status: 'OBSERVED' as POIDataQuality,
        rationale: `Strong local demand observed across ${location.subDistrictName} ${location.subDistrictType}.`
      },
      {
        name: 'Capital & Equity Fit',
        score: capitalScore,
        weight: 0.2,
        weightedScore: Math.round(capitalScore * 0.2 * 10) / 10,
        status: 'VERIFIED' as POIDataQuality,
        rationale: `Promoter equity of ₹${availableCapital.toLocaleString('en-IN')} satisfies 10% margin requirements.`
      },
      {
        name: 'Revenue Potential',
        score: revenueScore,
        weight: 0.15,
        weightedScore: Math.round(revenueScore * 0.15 * 10) / 10,
        status: 'ESTIMATED' as POIDataQuality,
        rationale: 'Positive recurring cash flow based on state rural market price benchmarks.'
      },
      {
        name: 'Competition Density',
        score: competitionScore,
        weight: 0.1,
        weightedScore: Math.round(competitionScore * 0.1 * 10) / 10,
        status: 'OBSERVED' as POIDataQuality,
        rationale: 'Moderate cluster density within 5km radius zone.'
      },
      {
        name: 'Operational Feasibility',
        score: opRiskScore,
        weight: 0.15,
        weightedScore: Math.round(opRiskScore * 0.15 * 10) / 10,
        status: 'ESTIMATED' as POIDataQuality,
        rationale: 'Standard input availability and established supply chains.'
      },
      {
        name: 'Local Infrastructure',
        score: infraScore,
        weight: 0.1,
        weightedScore: Math.round(infraScore * 0.1 * 10) / 10,
        status: 'VERIFIED' as POIDataQuality,
        rationale: 'Direct highway connectivity and banking touchpoints in catchment.'
      },
      {
        name: 'Scheme / Subsidy Fit',
        score: schemeScore,
        weight: 0.1,
        weightedScore: Math.round(schemeScore * 0.1 * 10) / 10,
        status: 'VERIFIED' as POIDataQuality,
        rationale: 'High alignment with PMEGP, Mudra, and state animal husbandry subsidies.'
      }
    ];

    const overallScore = Math.round(factors.reduce((sum, f) => sum + f.weightedScore, 0));

    let rating: FeasibilityBreakdown['rating'] = 'FEASIBLE WITH CONDITIONS';
    if (overallScore >= 80) rating = 'HIGHLY FEASIBLE';
    else if (overallScore >= 70) rating = 'FEASIBLE WITH CONDITIONS';
    else if (overallScore >= 55) rating = 'MODERATE RISK';
    else rating = 'CHALLENGING';

    return {
      overallScore,
      rating,
      isConditional: overallScore < 75,
      factors
    };
  },

  /**
   * Business Domain Comparison Engine
   */
  compareDomains(
    proposedCategory: CanonicalBusinessCategory,
    availableCapital: number,
    location: LocationResolution
  ): DomainComparisonItem[] {
    const isRural = location.areaType === 'Rural';

    const rawList: DomainComparisonItem[] = [
      {
        domain: 'Dairy',
        suitabilityScore: isRural ? (availableCapital >= 100000 ? 84 : 76) : 74,
        promoterCapitalFit: availableCapital >= 100000 ? 'EXCELLENT' : 'STRETCHED',
        localMarketDemand: 'HIGH',
        setupComplexity: 'MEDIUM',
        keyAdvantage: 'Daily milk cooperative off-take & chilling infrastructure',
        isProposed: proposedCategory === 'Dairy'
      },
      {
        domain: 'Retail',
        suitabilityScore: availableCapital >= 150000 ? 80 : 72,
        promoterCapitalFit: availableCapital >= 100000 ? 'GOOD' : 'STRETCHED',
        localMarketDemand: 'HIGH',
        setupComplexity: 'LOW',
        keyAdvantage: 'Immediate recurring cash-flow & low capital barrier',
        isProposed: proposedCategory === 'Retail'
      },
      {
        domain: 'Tailoring',
        suitabilityScore: availableCapital >= 50000 ? 76 : 68,
        promoterCapitalFit: 'EXCELLENT',
        localMarketDemand: 'MODERATE',
        setupComplexity: 'LOW',
        keyAdvantage: 'Very low operational overhead and high service margins',
        isProposed: proposedCategory === 'Tailoring'
      },
      {
        domain: 'Poultry',
        suitabilityScore: isRural ? 78 : 65,
        promoterCapitalFit: availableCapital >= 150000 ? 'GOOD' : 'STRETCHED',
        localMarketDemand: 'HIGH',
        setupComplexity: 'HIGH',
        keyAdvantage: 'Rapid batch cycles (45 days) & bulk off-take contracts',
        isProposed: proposedCategory === 'Poultry'
      },
      {
        domain: 'Agro-processing',
        suitabilityScore: 71,
        promoterCapitalFit: availableCapital >= 200000 ? 'GOOD' : 'STRETCHED',
        localMarketDemand: 'MODERATE',
        setupComplexity: 'HIGH',
        keyAdvantage: 'High value addition on local farm produce (millet/flour/oil)',
        isProposed: proposedCategory === 'Agro-processing'
      }
    ];

    // Sort by Suitability Score descending
    return rawList.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }
};
