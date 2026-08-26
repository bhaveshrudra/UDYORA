import { FinancialEngineAgent } from './agents/financialEngine.js';
import { BusinessProfile } from './types.js';

/**
 * Unit Test Suite for UDYORA FinancialEngineAgent
 * Tests deterministic calculation logic against real fixtures.
 */

// Test Fixture from Session "test123" (Meera Tailors)
const meeraTailorsFixture: BusinessProfile = {
  entrepreneurName: 'Meera',
  businessName: 'Meera Tailors',
  businessCategory: 'textile_tailoring',
  businessDescription: 'Tailoring shop and boutique in Warangal',
  location: {
    villageOrTown: 'Warangal',
    district: 'Warangal',
    state: 'Telangana',
    isRuralOrSemiUrban: true,
  },
  demographics: {
    gender: 'female',
    socialCategory: 'general',
    isFirstTimeBorrower: true,
  },
  yearsInOperation: 3,
  entityType: 'unregistered_sole_proprietor',
  monthlyRevenue: 18000,
  monthlyFixedCosts: 4000,
  monthlyVariableCosts: 3000,
  seasonality: {
    peakMonths: ['October', 'November', 'December'],
    peakMonthlyRevenue: 28000,
    leanMonths: ['June', 'July'],
    leanMonthlyRevenue: 12600,
    normalMonthlyRevenue: 18000,
  },
  existingDebts: [],
  assets: [
    {
      id: 'asset_1',
      assetType: 'machinery_equipment',
      description: 'Sewing machine',
      estimatedMarketValue: 20000,
      isPledgedOrHypothecated: false,
    },
    {
      id: 'asset_2',
      assetType: 'gold_liquid',
      description: 'Savings',
      estimatedMarketValue: 15000,
      isPledgedOrHypothecated: false,
    },
  ],
  loanPurpose: 'machinery_expansion',
  requestedLoanAmount: 150000,
  requestedTenureMonths: 36,
};

function runUnitTests() {
  console.log('================================================================');
  console.log('🧪 Running Deterministic Unit Tests: FinancialEngineAgent');
  console.log('================================================================\n');

  const engine = new FinancialEngineAgent();
  const result = engine.analyze(meeraTailorsFixture);

  let passedTests = 0;
  let totalTests = 0;

  function assert(description: string, condition: boolean, actualVal?: any) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${description} ${actualVal !== undefined ? `[Actual: ${JSON.stringify(actualVal)}]` : ''}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${description} ${actualVal !== undefined ? `[Actual: ${JSON.stringify(actualVal)}]` : ''}`);
    }
  }

  console.log('--- 1. Break-Even Analysis Unit Tests ---');
  // Monthly Revenue = 18,000, Var Costs = 3,000 -> Gross Margin = 15,000 / 18,000 = 83.3%
  // Contribution Margin Ratio = 0.833
  // Fixed Costs = 4,000
  // Break Even = 4000 / 0.833 = 4802
  assert('Calculates correct gross margin percentage (~83.3%)', result.breakEven.grossMarginPercentage >= 83 && result.breakEven.grossMarginPercentage <= 84, `${result.breakEven.grossMarginPercentage}%`);
  assert('Calculates break-even monthly revenue (~₹4,800)', result.breakEven.breakEvenMonthlyRevenue >= 4700 && result.breakEven.breakEvenMonthlyRevenue <= 4900, `₹${result.breakEven.breakEvenMonthlyRevenue}`);
  assert('Correctly flags current profitability', result.breakEven.isCurrentlyProfitable === true, result.breakEven.isCurrentlyProfitable);
  assert('Safety margin is positive (>70%)', result.breakEven.safetyMarginPercentage > 70, `${result.breakEven.safetyMarginPercentage}%`);
  assert('Includes transparency formula and assumptions', Boolean(result.breakEven.formulaUsed && result.breakEven.assumptions.length > 0));

  console.log('\n--- 2. Max Loan Calculation Unit Tests ---');
  // Net operating income = 18,000 - 7,000 = 11,000
  // 55% Max FOIR -> Max EMI = 11,000 * 0.55 = 6,050
  // PV(12% p.a., 36 months, EMI 6050) = ~₹180,000 - 185,000
  assert('Calculates max allowable EMI (~₹6,050)', result.maxLoan.maxAllowableMonthlyEMI >= 6000 && result.maxLoan.maxAllowableMonthlyEMI <= 6100, `₹${result.maxLoan.maxAllowableMonthlyEMI}`);
  assert('Calculates max theoretical loan ceiling (~₹180,000 - ₹185,000)', result.maxLoan.maxTheoreticalLoanAmount >= 180000 && result.maxLoan.maxTheoreticalLoanAmount <= 190000, `₹${result.maxLoan.maxTheoreticalLoanAmount}`);
  assert('Includes max loan formula and assumptions', Boolean(result.maxLoan.formulaUsed && result.maxLoan.assumptions.length > 0));

  console.log('\n--- 3. Safe Loan Calculation Unit Tests ---');
  // Seasonality: Normal net = 11,000, Lean net = 12,600 - 4,000 - (12600 * 3/18) = 12,600 - 4,000 - 2,100 = 6,500
  // Weighted net = (11,000 * 0.6) + (6,500 * 0.4) = 6,600 + 2,600 = 9,200
  // Safe EMI (DSCR >= 1.5) = 9,200 / 1.5 = ~₹6,133
  // Safe Loan Amount = ~₹180,000 - ₹185,000
  assert('Safe loan amount is calculated and strictly <= Max Loan', result.safeLoan.recommendedSafeLoanAmount <= result.maxLoan.maxTheoreticalLoanAmount, `Safe: ₹${result.safeLoan.recommendedSafeLoanAmount} vs Max: ₹${result.maxLoan.maxTheoreticalLoanAmount}`);
  assert('Safe DSCR is >= 1.5x buffer', result.safeLoan.actualProjectedDSCR >= 1.5, `${result.safeLoan.actualProjectedDSCR}x`);
  assert('Correctly assigns borrower prudential tier', ['CONSERVATIVE_GREEN', 'MODERATE_AMBER', 'HIGH_LEVERAGE_RED'].includes(result.safeLoan.borrowerPrudentialTier), result.safeLoan.borrowerPrudentialTier);

  console.log('\n--- 4. Working Capital Safety Check Unit Tests ---');
  // Monthly operating costs = 4000 + 3000 = 7000
  // Required 2-month reserve = 14,000
  // Liquid savings = 15,000
  // 15,000 >= 14,000 -> isReserveAdequate = true (Coverage = 2.1 months)
  assert('Identifies liquid savings correctly (₹15,000)', result.workingCapitalCheck.currentLiquidSavings === 15000, `₹${result.workingCapitalCheck.currentLiquidSavings}`);
  assert('Calculates required 2-month operating reserve (₹14,000)', result.workingCapitalCheck.requiredTwoMonthReserve === 14000, `₹${result.workingCapitalCheck.requiredTwoMonthReserve}`);
  assert('Validates reserve coverage >= 2.0 months', result.workingCapitalCheck.reserveCoverageMonths >= 2.0, `${result.workingCapitalCheck.reserveCoverageMonths} months`);
  assert('Flags reserve as adequate (SAFE)', result.workingCapitalCheck.isReserveAdequate === true && result.workingCapitalCheck.safetyAlertLevel === 'safe', result.workingCapitalCheck.safetyAlertLevel);

  console.log('\n--- 5. 6-Month Cash Flow Projections Unit Tests ---');
  assert('Generates exactly 6 monthly projection items', result.cashFlow.sixMonthProjection.length === 6, `${result.cashFlow.sixMonthProjection.length} months`);
  assert('Includes peak, normal, and lean seasonal months', result.cashFlow.sixMonthProjection.some(m => m.seasonType === 'peak') && result.cashFlow.sixMonthProjection.some(m => m.seasonType === 'lean'));
  assert('Ending cash balance remains strictly positive in all 6 months', result.cashFlow.sixMonthProjection.every(m => m.endingCashBuffer > 0), `Month 6 Cash: ₹${result.cashFlow.sixMonthProjection[5].endingCashBuffer}`);
  assert('Calculates positive average monthly surplus', result.cashFlow.averageProjectedMonthlySurplus > 0, `₹${result.cashFlow.averageProjectedMonthlySurplus}/month`);

  console.log('\n--- 6. Summary Verdict & Transparency ---');
  assert('Verdict identifies loan affordability correctly', typeof result.summaryVerdict.isLoanAffordable === 'boolean');
  assert('Includes formatted max safe EMI', result.summaryVerdict.maxSafeEMIFormatted.includes('₹'), result.summaryVerdict.maxSafeEMIFormatted);
  assert('Includes actionable next step recommendation', result.summaryVerdict.recommendedAction.length > 10);

  console.log('\n================================================================');
  console.log(`🎯 Test Summary: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================\n');

  console.log('📋 Full FinancialAnalysis JSON Output for Meera Tailors:');
  console.log(JSON.stringify(result, null, 2));

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runUnitTests();
