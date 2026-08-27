import {
  CostComponent,
  FinancialPlan,
  RepaymentInstallment,
  UserBusinessInput,
  BusinessTemplate
} from '../types';
import { BUSINESS_TEMPLATES } from '../data/businessTemplates';

/**
 * Deterministic Financial Calculation Engine for UDYORA (SIH26091 PS Compliance)
 * Pure functions - Zero LLM arithmetic hallucination.
 */

/**
 * Computes the Indicative Project Cost based on the official SIH26091 PS margin capacity logic:
 * Formula: Indicative Project Cost = Available Own Capital / Margin Ratio (Default 10%)
 * 
 * Test benchmarks:
 * - ₹1,00,000 / 0.10 = ₹10,00,000
 * - ₹50,00,000 / 0.10 = ₹5,00,000
 * - ₹1,05,000 / 0.10 = ₹10,50,000
 */
export function calculateProjectCost(
  availableCapital: number,
  marginRatio: number = 0.10
): number {
  if (typeof availableCapital !== 'number' || isNaN(availableCapital) || availableCapital <= 0) {
    return 0;
  }
  const safeMarginRatio = typeof marginRatio === 'number' && marginRatio > 0 && marginRatio <= 1 ? marginRatio : 0.10;
  return Math.round(availableCapital / safeMarginRatio);
}

/**
 * Computes the Indicative Financing Requirement (Max 90% bank loan capacity)
 * Formula: Financing Requirement = Project Cost - Available Own Capital
 * 
 * Test benchmarks:
 * - ₹10,00,000 - ₹1,00,000 = ₹9,00,000
 * - ₹5,00,000 - ₹50,000 = ₹4,50,000
 * - ₹10,50,000 - ₹1,05,000 = ₹9,45,000
 */
export function calculateLoanAmount(
  projectCost: number,
  ownContribution: number
): number {
  if (typeof projectCost !== 'number' || isNaN(projectCost) || projectCost <= 0) return 0;
  if (typeof ownContribution !== 'number' || isNaN(ownContribution) || ownContribution < 0) ownContribution = 0;
  const loan = projectCost - ownContribution;
  return Math.max(0, Math.round(loan));
}

/**
 * Alias for calculateLoanAmount
 */
export function calculateFinancingRequirement(
  projectCost: number,
  ownContribution: number
): number {
  return calculateLoanAmount(projectCost, ownContribution);
}

/**
 * Calculates Monthly EMI using the standard reducing balance formula:
 * EMI = [P * r * (1+r)^n] / [(1+r)^n - 1]
 * where:
 * P = Principal loan amount
 * r = Monthly interest rate (annual rate / 12 / 100)
 * n = Number of payment periods (tenure in months)
 */
export function calculateEMI(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): number {
  if (typeof principal !== 'number' || isNaN(principal) || principal <= 0) return 0;
  if (typeof tenureMonths !== 'number' || isNaN(tenureMonths) || tenureMonths <= 0) return 0;
  
  if (typeof annualInterestRate !== 'number' || isNaN(annualInterestRate) || annualInterestRate <= 0) {
    return Math.round(principal / tenureMonths);
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  if (!isFinite(factor) || factor <= 1) {
    return Math.round(principal / tenureMonths);
  }

  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}

/**
 * Calculates total interest payable over the amortized loan tenure
 */
export function calculateTotalInterest(
  monthlyEMI: number,
  tenureMonths: number,
  principal: number
): number {
  if (typeof principal !== 'number' || isNaN(principal) || principal <= 0) return 0;
  if (typeof tenureMonths !== 'number' || isNaN(tenureMonths) || tenureMonths <= 0) return 0;
  if (typeof monthlyEMI !== 'number' || isNaN(monthlyEMI) || monthlyEMI <= 0) return 0;

  const totalAmount = monthlyEMI * tenureMonths;
  return Math.max(0, Math.round(totalAmount - principal));
}

/**
 * Generates an exact month-by-month repayment schedule
 * Accurately models moratorium periods (interest servicing without principal amortization)
 */
export function generateRepaymentSchedule(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number,
  moratoriumMonths: number = 0
): RepaymentInstallment[] {
  const schedule: RepaymentInstallment[] = [];
  if (typeof principal !== 'number' || isNaN(principal) || principal <= 0) return schedule;
  if (typeof tenureMonths !== 'number' || isNaN(tenureMonths) || tenureMonths <= 0) return schedule;

  const safeMoratorium = Math.min(Math.max(0, moratoriumMonths || 0), tenureMonths - 1);
  const monthlyRate = (annualInterestRate || 0) / 12 / 100;
  let remainingPrincipal = principal;

  // Active amortization months after moratorium
  const amortizationMonths = Math.max(1, tenureMonths - safeMoratorium);
  const regularEMI = calculateEMI(principal, annualInterestRate, amortizationMonths);

  for (let month = 1; month <= tenureMonths; month++) {
    const isMoratorium = month <= safeMoratorium;
    const interestForMonth = Math.round(remainingPrincipal * monthlyRate);

    let principalPaidForMonth = 0;
    let emiForMonth = interestForMonth;

    if (!isMoratorium) {
      if (month === tenureMonths) {
        // Last month reconciles exact rounding remainder
        principalPaidForMonth = remainingPrincipal;
        emiForMonth = principalPaidForMonth + interestForMonth;
      } else {
        principalPaidForMonth = Math.min(remainingPrincipal, Math.max(0, regularEMI - interestForMonth));
        emiForMonth = principalPaidForMonth + interestForMonth;
      }
    }

    const closingPrincipal = Math.max(0, remainingPrincipal - principalPaidForMonth);

    schedule.push({
      month,
      openingPrincipal: remainingPrincipal,
      principalPaid: principalPaidForMonth,
      interestPaid: interestForMonth,
      emi: emiForMonth,
      closingPrincipal,
      isMoratorium
    });

    remainingPrincipal = closingPrincipal;
    if (remainingPrincipal <= 0 && !isMoratorium) break;
  }

  return schedule;
}

/**
 * Computes Debt Service Coverage Ratio (DSCR)
 * Formula: DSCR = Annual Net Operating Profit / Annual Debt Service (Principal + Interest)
 * Benchmark: >= 1.5 is considered bankable for rural micro-enterprises.
 */
export function calculateDSCR(
  annualNetOperatingProfit: number,
  annualTotalDebtService: number
): number {
  if (typeof annualTotalDebtService !== 'number' || isNaN(annualTotalDebtService) || annualTotalDebtService <= 0) {
    return 3.5; // Healthy baseline when debt service is zero
  }
  if (typeof annualNetOperatingProfit !== 'number' || isNaN(annualNetOperatingProfit) || annualNetOperatingProfit <= 0) {
    return 0.5;
  }
  const ratio = annualNetOperatingProfit / annualTotalDebtService;
  return parseFloat(ratio.toFixed(2));
}

/**
 * Estimates Break-Even Period in months based on capital investment and net operating cashflows
 */
export function calculateBreakEvenMonths(
  initialCapEx: number,
  monthlyNetCashflow: number,
  gestationMonths: number = 1
): number {
  if (typeof initialCapEx !== 'number' || isNaN(initialCapEx) || initialCapEx <= 0) return gestationMonths;
  if (typeof monthlyNetCashflow !== 'number' || isNaN(monthlyNetCashflow) || monthlyNetCashflow <= 0) {
    return 36; // Capped default if cashflow is non-positive
  }
  const months = gestationMonths + initialCapEx / monthlyNetCashflow;
  return Math.max(1, Math.round(months));
}

/**
 * Scales Cost Components proportionally to match total calculated project cost
 */
export function scaleCostComponents(
  template: BusinessTemplate,
  targetProjectCost: number
): { costBreakdown: CostComponent[]; totalCapEx: number; totalWorkingCapital: number } {
  const defaultComponents = template.defaultCostComponents || [];
  const defaultTotal = defaultComponents.reduce((acc, c) => acc + (c.estimatedCost || 0), 0);
  const scaleMultiplier = defaultTotal > 0 ? targetProjectCost / defaultTotal : 1;

  let totalCapEx = 0;
  let totalWorkingCapital = 0;

  const costBreakdown: CostComponent[] = defaultComponents.map((item, index) => {
    let scaledCost = Math.round((item.estimatedCost || 0) * scaleMultiplier);
    
    // Ensure the last item balances exact rounding differences
    if (index === defaultComponents.length - 1) {
      const currentSum = totalCapEx + totalWorkingCapital + scaledCost;
      const diff = targetProjectCost - currentSum;
      scaledCost += diff;
    }

    if (item.category === 'CAPEX') {
      totalCapEx += scaledCost;
    } else {
      totalWorkingCapital += scaledCost;
    }

    return {
      ...item,
      estimatedCost: scaledCost
    };
  });

  return { costBreakdown, totalCapEx, totalWorkingCapital };
}

/**
 * Master Deterministic Financial Plan Builder
 * Consumes strictly validated user input and business template.
 */
export function generateDeterministicFinancialPlan(
  input: UserBusinessInput,
  template?: BusinessTemplate
): FinancialPlan {
  const category = input.businessCategoryId || 'dairy';
  const businessTemplate = template || BUSINESS_TEMPLATES[category] || BUSINESS_TEMPLATES.dairy;

  // Single Source of Truth for available own equity
  const ownCapital = typeof input.availableCapital === 'number' && input.availableCapital > 0
    ? input.availableCapital
    : 100000;

  const marginRatio = businessTemplate.standardMarginRatio || 0.10; // 10% standard

  // Core SIH26091 PS margin capacity calculations
  const indicativeProjectCost = calculateProjectCost(ownCapital, marginRatio);
  const indicativeFinancingRequirement = calculateLoanAmount(indicativeProjectCost, ownCapital);

  // Business-plan recommended project sizing from unit economics benchmarks
  const recommendedBusinessProjectSize = indicativeProjectCost;

  // Scaled Cost Components
  const { costBreakdown, totalCapEx, totalWorkingCapital } = scaleCostComponents(
    businessTemplate,
    indicativeProjectCost
  );

  const annualInterestRate = businessTemplate.benchmarkInterestRate || 9.50;
  const tenureMonths = businessTemplate.standardTenureMonths || 60;
  const moratoriumMonths = businessTemplate.standardMoratoriumMonths || 3;

  // Calculate regular EMI on financing amount
  const amortizationMonths = Math.max(1, tenureMonths - moratoriumMonths);
  const monthlyEMI = calculateEMI(indicativeFinancingRequirement, annualInterestRate, amortizationMonths);
  const totalInterestPayable = calculateTotalInterest(
    monthlyEMI,
    amortizationMonths,
    indicativeFinancingRequirement
  );
  const totalRepaymentAmount = indicativeFinancingRequirement + totalInterestPayable;

  // Revenue & Cashflow Estimates based on benchmark unit economics
  const grossAnnualRevenue = (indicativeProjectCost / 100000) * (businessTemplate.annualRevenuePerLakhCost || 90000);
  const estimatedMonthlyRevenue = Math.round(grossAnnualRevenue / 12);
  const operatingMarginPct = businessTemplate.operatingMarginPct || 35;
  const estimatedMonthlyNetOperatingProfit = Math.round(
    estimatedMonthlyRevenue * (operatingMarginPct / 100)
  );
  const estimatedMonthlyOperatingExpenses = estimatedMonthlyRevenue - estimatedMonthlyNetOperatingProfit;

  // Net Profit after debt service (EMI)
  const estimatedMonthlyNetProfit = estimatedMonthlyNetOperatingProfit - monthlyEMI;

  // DSCR calculation
  const annualOperatingProfit = estimatedMonthlyNetOperatingProfit * 12;
  const annualDebtService = monthlyEMI * 12;
  const debtServiceCoverageRatio = calculateDSCR(annualOperatingProfit, annualDebtService);

  // Break-even
  const estimatedBreakEvenMonths = calculateBreakEvenMonths(
    totalCapEx,
    estimatedMonthlyNetProfit > 0 ? estimatedMonthlyNetProfit : 15000,
    businessTemplate.gestationPeriodMonths || 1
  );

  // Repayment schedule preview (first 12 installments)
  const fullSchedule = generateRepaymentSchedule(
    indicativeFinancingRequirement,
    annualInterestRate,
    tenureMonths,
    moratoriumMonths
  );
  const repaymentSchedulePreview = fullSchedule.slice(0, 12);

  // Subsidy potential estimate (e.g. PMEGP 25% rural general benchmark)
  const isSpecialCategory = input.beneficiaryCategory && input.beneficiaryCategory !== 'General';
  const subsidyPct = isSpecialCategory ? 35 : 25;
  const rawSubsidy = Math.round(indicativeProjectCost * (subsidyPct / 100));
  const eligibleSubsidyEstimate = Math.min(rawSubsidy, 1250000); // PMEGP ceiling
  const netLoanRequirement = Math.max(0, indicativeFinancingRequirement - eligibleSubsidyEstimate);

  return {
    availableOwnCapital: ownCapital,
    marginPercentage: Math.round(marginRatio * 100),
    indicativeProjectCost,
    indicativeFinancingRequirement,
    recommendedBusinessProjectSize,
    capitalExpenditureTotal: totalCapEx,
    workingCapitalTotal: totalWorkingCapital,
    costBreakdown,
    eligibleSubsidyEstimate,
    netLoanRequirement,
    annualInterestRate,
    tenureMonths,
    moratoriumMonths,
    monthlyEMI,
    totalInterestPayable,
    totalRepaymentAmount,
    estimatedMonthlyRevenue,
    estimatedMonthlyOperatingExpenses,
    estimatedMonthlyNetProfit,
    debtServiceCoverageRatio,
    estimatedBreakEvenMonths,
    repaymentSchedulePreview
  };
}
