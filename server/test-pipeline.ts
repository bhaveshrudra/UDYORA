import { runUdyoraPipeline, BusinessProfile } from './orchestrator.js';

const sampleProfile: BusinessProfile = {
  entrepreneurName: 'Ramesh Kumar',
  businessName: 'Ramesh Kirana & General Store',
  businessCategory: 'retail_kirana',
  location: {
    villageOrTown: 'Chandauli',
    district: 'Varanasi Rural',
    state: 'Uttar Pradesh',
    pincode: '232104',
    isRuralOrSemiUrban: true,
  },
  demographics: {
    gender: 'male',
    socialCategory: 'obc',
    isFirstTimeBorrower: false,
  },
  yearsInOperation: 4,
  entityType: 'unregistered_sole_proprietor',
  monthlyRevenue: 85000,
  monthlyFixedCosts: 6500,
  monthlyVariableCosts: 55000,
  seasonality: {
    peakMonths: ['October', 'November', 'December'],
    peakMonthlyRevenue: 130000,
    leanMonths: ['June', 'July'],
    leanMonthlyRevenue: 50000,
    normalMonthlyRevenue: 85000,
  },
  existingDebts: [
    {
      id: 'debt-1',
      sourceType: 'informal_moneylender',
      lenderName: 'Local Mahajan',
      outstandingPrincipal: 30000,
      monthlyEMI: 3500,
      estimatedAnnualInterestRate: 36,
      tenureMonthsRemaining: 10,
    },
  ],
  assets: [
    {
      id: 'asset-1',
      assetType: 'inventory_stock',
      description: 'Packaged groceries and FMCG goods',
      estimatedMarketValue: 80000,
      isPledgedOrHypothecated: false,
    },
  ],
  loanPurpose: 'working_capital',
  requestedLoanAmount: 100000,
  requestedTenureMonths: 36,
};

async function testPipeline() {
  console.log('--- Testing UDYORA Multi-Agent Pipeline ---');
  const result = await runUdyoraPipeline(sampleProfile);
  console.log('Pipeline Success:', result.success);
  console.log('Execution Time:', result.executionTimeMs, 'ms');
  console.log('Pipeline Notes:', result.agentNotes);
  console.log('Executive Summary:', result.data.executiveSummary);
  console.log('Financial Safe Loan:', result.data.financialMetrics.loanCapacity.recommendedSafeLoanAmount);
  console.log('Viability Score:', result.data.riskAssessment.viabilityScore);
  console.log('Top Scheme:', result.data.matchedSchemes.topRecommendedScheme?.schemeName);
}

testPipeline().catch(console.error);
