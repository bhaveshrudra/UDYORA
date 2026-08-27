import {
  UserContext,
  FinancialPlan,
  RiskFactor
} from '../types';

export const riskAgent = {
  async execute(
    userContext: UserContext,
    financialPlan: FinancialPlan
  ): Promise<{ overallRiskRating: 'LOW' | 'MODERATE' | 'HIGH'; factors: RiskFactor[] }> {
    const { businessProfile } = userContext;
    const cat = businessProfile.businessCategory;

    const factors: RiskFactor[] = [];

    // 1. Sector Specific Operational / Supply Risk
    if (cat === 'Dairy') {
      factors.push({
        id: 'risk_dairy_fodder',
        name: 'Fodder Price Inflation & Dry Season Shortage',
        category: 'SUPPLY',
        severity: 'MEDIUM',
        likelihood: 'MEDIUM',
        reason: 'Dry fodder and concentrate prices spike by 15-25% during summer pre-monsoon months.',
        mitigation: 'Establish contracted silage storage pit and enter seasonal supply agreement with local fodder farmers.'
      });
      factors.push({
        id: 'risk_dairy_health',
        name: 'Livestock Disease & Milk Yield Fluctuation',
        category: 'OPERATIONAL',
        severity: 'HIGH',
        likelihood: 'LOW',
        reason: 'Infections (e.g. Mastitis or Foot & Mouth Disease) can temporarily halt milk production.',
        mitigation: 'Mandatory comprehensive cattle livestock insurance under PM-DEDS and regular vaccination schedule via local Veterinary Dispensary.'
      });
    } else if (cat === 'Retail') {
      factors.push({
        id: 'risk_retail_credit',
        name: 'Unrecovered Local Customer Credit (Udhar)',
        category: 'FINANCIAL',
        severity: 'MEDIUM',
        likelihood: 'HIGH',
        reason: 'Rural customers often seek monthly credit cycles that trap operating cash flow.',
        mitigation: 'Implement digital ledger (Khata app) with strict 15-day credit limits and instant UPI cashback discounts for spot payments.'
      });
      factors.push({
        id: 'risk_retail_expiry',
        name: 'Inventory Expiry & Dead Stock',
        category: 'OPERATIONAL',
        severity: 'LOW',
        likelihood: 'MEDIUM',
        reason: 'Slow-moving FMCG and perishable dairy items can expire on shelves.',
        mitigation: 'Weekly inventory rotation based on fast-moving item analysis; return-to-vendor arrangements with distributors.'
      });
    } else if (cat === 'Tailoring') {
      factors.push({
        id: 'risk_tailor_season',
        name: 'Seasonal Revenue Lulls Post-Festivals',
        category: 'MARKET',
        severity: 'MEDIUM',
        likelihood: 'HIGH',
        reason: 'Demand surges during festival/wedding months (Oct-Feb) but drops during monsoon.',
        mitigation: 'Offer discounted off-season bulk school uniform contracts and readymade garment alterations.'
      });
    } else {
      factors.push({
        id: 'risk_gen_supply',
        name: 'Raw Material Availability Fluctuation',
        category: 'SUPPLY',
        severity: 'MEDIUM',
        likelihood: 'MEDIUM',
        reason: 'Seasonal price fluctuations in agricultural inputs.',
        mitigation: 'Maintain 30-day raw material safety stock and multi-vendor supplier network.'
      });
    }

    // 2. Financial Debt Servicing Risk
    factors.push({
      id: 'risk_fin_emi',
      name: 'Working Capital Tightness during Loan Amortization',
      category: 'FINANCIAL',
      severity: 'LOW',
      likelihood: 'MEDIUM',
      reason: `Fixed monthly debt installment (₹${financialPlan.monthlyEMI.toLocaleString('en-IN')}) requires steady operating cash flow.`,
      mitigation: `DSCR is healthy at ${financialPlan.debtServiceCoverageRatio}x. Maintain 2 months EMI reserve buffer in separate liquid savings account.`
    });

    // 3. Infrastructure & Power Risk
    factors.push({
      id: 'risk_infra_power',
      name: 'Grid Power Interruption for Cold Storage / Machinery',
      category: 'INFRASTRUCTURE',
      severity: 'LOW',
      likelihood: 'LOW',
      reason: 'Periodic rural power cuts during monsoon line maintenance.',
      mitigation: 'Install a dedicated 3kVA solar inverter or backup generator connected to essential cooling/machinery.'
    });

    const highSeverityCount = factors.filter((f) => f.severity === 'HIGH').length;
    const overallRiskRating: 'LOW' | 'MODERATE' | 'HIGH' =
      highSeverityCount >= 2 ? 'HIGH' : highSeverityCount === 1 ? 'MODERATE' : 'LOW';

    return {
      overallRiskRating,
      factors
    };
  }
};
