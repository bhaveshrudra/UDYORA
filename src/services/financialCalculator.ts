import {
  CostComponent,
  FinancialPlan,
  RepaymentInstallment,
  UserBusinessInput,
  BusinessTemplate
} from '../types';
import { BUSINESS_TEMPLATES } from '../data/businessTemplates';

/**
 * Deterministic Financial Calculation Engine for UDYORA
 * Pure functions - Zero LLM arithmetic hallucination.
 */

/**
 * Computes the Indicative Project Cost based on standard 10% promoter contribution / margin logic.
 * Formula: Project Cost = Available Own Capital / Margin Ratio
 * Example: ₹1,00,000 / 0.10 = ₹10,00,000
 */
export function calculateProjectCost(
  availableCapital: number,
  marginRatio: number = 0.10
): number {
  if (availableCapital <= 0) return 0;
  if (marginRatio <= 0 || marginRatio > 1) {
    marginRatio = 0.10;
  }
  return Math.round(availableCapital / marginRatio);
}

/**
 * Computes the Indicative Financing Requirement (Bank Term Loan / Working Capital Loan)
 * Formula: Financing Requirement = Project Cost - Available Own Capital
 * Example: ₹10,00,000 - ₹1,00,000 = ₹9,00,000
 */
export function calculateLoanAmount(
  projectCost: number,
  ownContribution: number
): number {
  const loan = projectCost - ownContribution;
  return Math.max(0, Math.round(loan));
}

/**
 * Calculates Monthly EMI using the standard reducing balance formula:
 * EMI = [P * r * (1+r)^n] / [(1+r)^n - 1]
 * where:
 * P = Principal loan amount
 * r = Monthly interest rate (annual rate / 12 / 100)
 * n = Tenure in months
 */
export function calculateEMI(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualInterestRate <= 0) {
    return Math.round(principal / tenureMonths);
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}

/**
 * Calculates total interest payable over the loan tenure
 */
export function calculateTotalInterest(
  monthlyEMI: number,
  tenureMonths: number,
  principal: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  const totalAmount = monthlyEMI * tenureMonths;
  return Math.max(0, Math.round(totalAmount - principal));
}

/**
 * Generates an exact month-by-month repayment schedule
 */
export function generateRepaymentSchedule(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number,
  moratoriumMonths: number = 0
): RepaymentInstallment[] {
  const schedule: RepaymentInstallment[] = [];
  if (principal <= 0 || tenureMonths <= 0) return schedule;

  const monthlyRate = annualInterestRate / 12 / 100;
  let remainingPrincipal = principal;

  // Active amortization months after moratorium
  const amortizationMonths = Math.max(1, tenureMonths - moratoriumMonths);
  const regularEMI = calculateEMI(principal, annualInterestRate, amortizationMonths);

  for (let month = 1; month <= tenureMonths; month++) {
    const isMoratorium = month <= moratoriumMonths;
    const interestForMonth = Math.round(remainingPrincipal * monthlyRate);

    let principalPaidForMonth = 0;
    let emiForMonth = interestForMonth;

    if (!isMoratorium) {
      if (month === tenureMonths) {
        // Last month handles rounding remainder
        principalPaidForMonth = remainingPrincipal;
        emiForMonth = principalPaidForMonth + interestForMonth;
      } else {
        principalPaidForMonth = Math.min(remainingPrincipal, regularEMI - interestForMonth);
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
 * Formula: DSCR = Net Operating Cashflow / Annual Debt Service (Principal + Interest)
 * Benchmark: > 1.5 is healthy for rural micro-enterprises
 */
export function calculateDSCR(
  annualNetOperatingProfit: number,
  annualTotalDebtService: number
): number {
  if (annualTotalDebtService <= 0) return 3.5;
  const ratio = annualNetOperatingProfit / annualTotalDebtService;
  return parseFloat(ratio.toFixed(2));
}

/**
 * Estimates Break-Even Period in months
 */
export function calculateBreakEvenMonths(
  initialCapEx: number,
  monthlyNetCashflow: number,
  gestationMonths: number = 1
): number {
  if (monthlyNetCashflow <= 0) return 36; // Capped default if cashflow is non-positive
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
  const defaultTotal = template.defaultCostComponents.reduce((acc, c) => acc + c.estimatedCost, 0);
  const scaleMultiplier = defaultTotal > 0 ? targetProjectCost / defaultTotal : 1;

  let totalCapEx = 0;
  let totalWorkingCapital = 0;

  const costBreakdown: CostComponent[] = template.defaultCostComponents.map((item, index) => {
    let scaledCost = Math.round(item.estimatedCost * scaleMultiplier);
    // Ensure last item balances rounding discrepancies
    if (index === template.defaultCostComponents.length - 1) {
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
 * Master Financial Plan Builder combining all deterministic functions
 */
export function generateDeterministicFinancialPlan(
  input: UserBusinessInput,
  template?: BusinessTemplate
): FinancialPlan {
  const category = input.businessCategoryId || 'dairy';
  const businessTemplate = template || BUSINESS_TEMPLATES[category] || BUSINESS_TEMPLATES.dairy;

  const ownCapital = input.availableCapital > 0 ? input.availableCapital : 100000;
  const marginRatio = businessTemplate.standardMarginRatio || 0.10; // 10% standard

  // Core Project Figures (SIH26091 standard: ₹1L margin -> ₹10L project cost -> ₹9L loan)
  const indicativeProjectCost = calculateProjectCost(ownCapital, marginRatio);
  const indicativeFinancingRequirement = calculateLoanAmount(indicativeProjectCost, ownCapital);

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
  const grossAnnualRevenue = (indicativeProjectCost / 100000) * businessTemplate.annualRevenuePerLakhCost;
  const estimatedMonthlyRevenue = Math.round(grossAnnualRevenue / 12);
  const estimatedMonthlyNetOperatingProfit = Math.round(
    estimatedMonthlyRevenue * (businessTemplate.operatingMarginPct / 100)
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
    businessTemplate.gestationPeriodMonths
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
    marginPercentage: marginRatio * 100,
    indicativeProjectCost,
    capitalExpenditureTotal: totalCapEx,
    workingCapitalTotal: totalWorkingCapital,
    costBreakdown,
    indicativeFinancingRequirement,
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
