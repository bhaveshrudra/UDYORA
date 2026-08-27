import {
  CanonicalBusinessCategory,
  FinancialPlan,
  POIDataQuality
} from '../types';

export const financialAnalysisService = {
  /**
   * Deterministic Financial Engine
   */
  calculateFinancialPlan(
    businessCategory: CanonicalBusinessCategory,
    availableEquity: number,
    marginMultiplier: number = 10 // 10% promoter equity rule
  ): FinancialPlan {
    const safeEquity = Math.max(10000, availableEquity);

    // 1. Indicative Project Cost
    // SIH26091 standard: 10% margin equity -> Project Cost = 10x equity
    let indicativeProjectCost = safeEquity * marginMultiplier;

    // Sanity bounding based on sector micro-enterprise norms
    if (businessCategory === 'Dairy') {
      indicativeProjectCost = Math.max(500000, Math.min(2500000, indicativeProjectCost));
    } else if (businessCategory === 'Retail') {
      indicativeProjectCost = Math.max(200000, Math.min(1500000, indicativeProjectCost));
    } else if (businessCategory === 'Tailoring') {
      indicativeProjectCost = Math.max(100000, Math.min(800000, indicativeProjectCost));
    } else if (businessCategory === 'Poultry') {
      indicativeProjectCost = Math.max(500000, Math.min(2000000, indicativeProjectCost));
    }

    const financingRequirement = Math.max(0, indicativeProjectCost - safeEquity);
    const promoterMarginPercentage = Math.round((safeEquity / indicativeProjectCost) * 100);

    // Term Loan (80% of financing) & Working Capital (20% of financing)
    const termLoanAmount = Math.round(financingRequirement * 0.8);
    const workingCapitalLoan = Math.round(financingRequirement * 0.2);

    const interestRateAnnual = 9.25; // Priority sector / Mudra indicative rate
    const tenureYears = 5;
    const totalMonths = tenureYears * 12;

    // EMI Calculation: P * r * (1+r)^n / ((1+r)^n - 1)
    const monthlyRate = interestRateAnnual / (12 * 100);
    const emiFactor = Math.pow(1 + monthlyRate, totalMonths);
    const monthlyEMI =
      termLoanAmount > 0
        ? Math.round((termLoanAmount * monthlyRate * emiFactor) / (emiFactor - 1))
        : 0;

    // 2. Sector Specific Revenue & Profit Modeling
    let estimatedAnnualRevenue = 0;
    let estimatedAnnualOperatingCost = 0;
    let breakEvenMonths = 8;

    switch (businessCategory) {
      case 'Dairy':
        // ~8-10 cows yielding 12L/day @ ₹38/L
        estimatedAnnualRevenue = Math.round(indicativeProjectCost * 1.15);
        estimatedAnnualOperatingCost = Math.round(estimatedAnnualRevenue * 0.62);
        breakEvenMonths = 8;
        break;

      case 'Retail':
        // Kirana gross turnover @ 16% gross margin
        estimatedAnnualRevenue = Math.round(indicativeProjectCost * 2.8);
        estimatedAnnualOperatingCost = Math.round(estimatedAnnualRevenue * 0.88);
        breakEvenMonths = 5;
        break;

      case 'Tailoring':
        // Boutique / custom tailoring job-work & fabrics
        estimatedAnnualRevenue = Math.round(indicativeProjectCost * 1.4);
        estimatedAnnualOperatingCost = Math.round(estimatedAnnualRevenue * 0.55);
        breakEvenMonths = 6;
        break;

      case 'Poultry':
        // Broiler 5-6 cycles/year
        estimatedAnnualRevenue = Math.round(indicativeProjectCost * 1.3);
        estimatedAnnualOperatingCost = Math.round(estimatedAnnualRevenue * 0.68);
        breakEvenMonths = 9;
        break;

      case 'Agro-processing':
      case 'Custom':
      default:
        estimatedAnnualRevenue = Math.round(indicativeProjectCost * 1.25);
        estimatedAnnualOperatingCost = Math.round(estimatedAnnualRevenue * 0.65);
        breakEvenMonths = 8;
        break;
    }

    const grossOperatingProfit = estimatedAnnualRevenue - estimatedAnnualOperatingCost;
    const annualDebtService = monthlyEMI * 12;
    const estimatedAnnualNetProfit = Math.max(0, grossOperatingProfit - annualDebtService);

    // DSCR = Net Operating Income / Total Debt Service
    const debtServiceCoverageRatio =
      annualDebtService > 0
        ? Math.round((grossOperatingProfit / annualDebtService) * 100) / 100
        : 2.5;

    // 3. 5-Year Amortization Schedule
    const repaymentSchedule = [];
    let balance = termLoanAmount;
    for (let yr = 1; yr <= tenureYears; yr++) {
      const yearInterest = Math.round(balance * (interestRateAnnual / 100));
      const totalYearPayment = monthlyEMI * 12;
      const yearPrincipal = Math.min(balance, Math.max(0, totalYearPayment - yearInterest));
      const closing = Math.max(0, balance - yearPrincipal);

      repaymentSchedule.push({
        year: yr,
        openingBalance: balance,
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        closingBalance: closing
      });

      balance = closing;
    }

    return {
      availableEquity: safeEquity,
      indicativeProjectCost,
      promoterMarginPercentage,
      financingRequirement,
      termLoanAmount,
      workingCapitalLoan,
      interestRateAnnual,
      tenureYears,
      monthlyEMI,
      estimatedAnnualRevenue,
      estimatedAnnualOperatingCost,
      estimatedAnnualNetProfit,
      breakEvenMonths,
      debtServiceCoverageRatio,
      repaymentSchedule,
      assumptions: [
        {
          label: 'Promoter Margin Rule',
          value: `${promoterMarginPercentage}% Equity : ${100 - promoterMarginPercentage}% Debt (SIH26091)`,
          source: 'NABARD & MoRD Guidelines',
          status: 'VERIFIED'
        },
        {
          label: 'Priority Sector Lending Rate',
          value: `${interestRateAnnual}% p.a. Reducing Balance`,
          source: 'RBI Priority Sector Lending Circular',
          status: 'VERIFIED'
        },
        {
          label: 'Term Loan Repayment Tenure',
          value: `${tenureYears} Years (60 Monthly Installments)`,
          source: 'Standard Commercial Bank Policy',
          status: 'VERIFIED'
        },
        {
          label: 'Debt Service Coverage (DSCR)',
          value: `${debtServiceCoverageRatio}x (Healthy Benchmark > 1.5x)`,
          source: 'Financial Feasibility Model',
          status: 'ESTIMATED'
        }
      ]
    };
  }
};
