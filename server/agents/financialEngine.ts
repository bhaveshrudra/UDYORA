import {
  BusinessProfile,
  FinancialAnalysis,
  FinancialEngineOutput,
  BreakEvenAnalysis,
  CashFlowProjection,
  MaxLoanCalculation,
  SafeLoanCalculation,
  WorkingCapitalSafetyCheck,
  LoanCapacityMetrics,
  MonthlyCashFlowItem,
  AgentOutput,
} from '../types.js';

/**
 * FinancialEngineAgent
 * 
 * Deterministic financial calculator for rural micro-enterprises.
 * Contains pure, transparent mathematical logic without any LLM calls.
 * 
 * Computes:
 * 1. Break-even analysis (fixed + variable + debt servicing)
 * 2. Max theoretical loan (standard FOIR lending ceiling)
 * 3. Safe loan capacity (volatility-adjusted, DSCR >= 1.5x buffer)
 * 4. Working capital safety check (2-month operating reserve threshold)
 * 5. 6-month seasonal cash flow projections with loan servicing
 */
export class FinancialEngineAgent {
  private readonly defaultInterestRate = 0.12; // 12% p.a. standard MSME benchmark
  private readonly defaultTenureMonths = 36; // 3 years standard

  /**
   * Primary execution method returning the full FinancialAnalysis
   */
  public analyze(profile: BusinessProfile): FinancialAnalysis {
    // 1. Break-Even Analysis
    const breakEven = this.calculateBreakEven(profile);

    // 2. Max Loan Calculation
    const maxLoan = this.calculateMaxLoan(profile);

    // 3. Safe Loan Calculation
    const safeLoan = this.calculateSafeLoan(profile);

    // 4. Working Capital Safety Check
    const workingCapitalCheck = this.checkWorkingCapitalSafety(profile, safeLoan);

    // 5. 6-Month Cash Flow Projection
    const cashFlow = this.projectSixMonthCashFlow(profile, safeLoan);

    // 6. Summary Verdict
    const requestedAmount = profile.requestedLoanAmount || safeLoan.recommendedSafeLoanAmount;
    const isLoanAffordable = requestedAmount <= safeLoan.recommendedSafeLoanAmount;

    let requestedVsSafeComparison = `Requested loan of ₹${requestedAmount.toLocaleString('en-IN')} is within the prudential safe limit of ₹${safeLoan.recommendedSafeLoanAmount.toLocaleString('en-IN')}.`;
    if (requestedAmount > maxLoan.maxTheoreticalLoanAmount) {
      requestedVsSafeComparison = `CRITICAL: Requested loan of ₹${requestedAmount.toLocaleString('en-IN')} exceeds the maximum theoretical borrowing ceiling of ₹${maxLoan.maxTheoreticalLoanAmount.toLocaleString('en-IN')} and would cause severe debt distress.`;
    } else if (requestedAmount > safeLoan.recommendedSafeLoanAmount) {
      requestedVsSafeComparison = `CAUTION: Requested loan of ₹${requestedAmount.toLocaleString('en-IN')} exceeds the safe capacity of ₹${safeLoan.recommendedSafeLoanAmount.toLocaleString('en-IN')}. Consider restructuring or downsizing.`;
    }

    let recommendedAction = 'Proceed with loan application under collateral-free MUDRA or priority sector lending.';
    if (requestedAmount > safeLoan.recommendedSafeLoanAmount) {
      recommendedAction = `Cap loan borrowing at ₹${safeLoan.recommendedSafeLoanAmount.toLocaleString('en-IN')} with monthly EMI <= ₹${safeLoan.recommendedSafeMonthlyEMI.toLocaleString('en-IN')} to safeguard lean season solvency.`;
    }

    return {
      entrepreneurName: profile.entrepreneurName,
      businessName: profile.businessName,
      businessCategory: profile.businessCategory,
      requestedLoanAmount: profile.requestedLoanAmount,
      requestedTenureMonths: profile.requestedTenureMonths,
      breakEven,
      maxLoan,
      safeLoan,
      workingCapitalCheck,
      cashFlow,
      summaryVerdict: {
        isLoanAffordable,
        requestedVsSafeComparison,
        maxSafeEMIFormatted: `₹${safeLoan.recommendedSafeMonthlyEMI.toLocaleString('en-IN')}/month`,
        recommendedAction,
      },
    };
  }

  /**
   * Compatibility wrapper for multi-agent pipeline
   */
  public async runFinancialEngine(
    profile: BusinessProfile
  ): Promise<AgentOutput<FinancialEngineOutput>> {
    const startTime = Date.now();
    try {
      const detailedAnalysis = this.analyze(profile);

      const loanCapacity: LoanCapacityMetrics = {
        maxTheoreticalLoan: detailedAnalysis.maxLoan.maxTheoreticalLoanAmount,
        recommendedSafeLoanAmount: detailedAnalysis.safeLoan.recommendedSafeLoanAmount,
        recommendedMaxMonthlyEMI: detailedAnalysis.safeLoan.recommendedSafeMonthlyEMI,
        optimalTenureMonths: detailedAnalysis.safeLoan.tenureMonths,
        estimatedInterestRateBenchmark: detailedAnalysis.safeLoan.interestRateBenchmark,
        debtServiceCoverageRatio: detailedAnalysis.safeLoan.actualProjectedDSCR,
        fixedObligationToIncomeRatio: detailedAnalysis.safeLoan.safeFOIRPercentage,
        workingCapitalHealth: detailedAnalysis.workingCapitalCheck.safetyAlertLevel === 'safe'
          ? 'healthy'
          : detailedAnalysis.workingCapitalCheck.safetyAlertLevel === 'caution'
          ? 'tight'
          : 'critical',
        informalDebtBurdenRatio: this.calculateInformalDebtRatio(profile),
      };

      const output: FinancialEngineOutput = {
        breakEven: detailedAnalysis.breakEven,
        cashFlow: detailedAnalysis.cashFlow,
        loanCapacity,
        workingCapitalAssessment: {
          recommendedBufferMonths: 2,
          estimatedWorkingCapitalGap: detailedAnalysis.workingCapitalCheck.workingCapitalDeficitOrSurplus < 0
            ? Math.abs(detailedAnalysis.workingCapitalCheck.workingCapitalDeficitOrSurplus)
            : 0,
          urgencyLevel: detailedAnalysis.workingCapitalCheck.safetyAlertLevel === 'critical'
            ? 'high'
            : detailedAnalysis.workingCapitalCheck.safetyAlertLevel === 'caution'
            ? 'medium'
            : 'low',
        },
        detailedAnalysis,
      };

      return {
        agentName: 'FinancialEngineAgent',
        success: true,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
        data: output,
        agentNotes: [
          `Break-even Monthly Revenue: ₹${detailedAnalysis.breakEven.breakEvenMonthlyRevenue.toLocaleString('en-IN')}`,
          `Safe Loan Limit: ₹${detailedAnalysis.safeLoan.recommendedSafeLoanAmount.toLocaleString('en-IN')} (EMI: ₹${detailedAnalysis.safeLoan.recommendedSafeMonthlyEMI.toLocaleString('en-IN')})`,
          `Working Capital Alert: ${detailedAnalysis.workingCapitalCheck.safetyAlertLevel.toUpperCase()}`,
        ],
      };
    } catch (error: any) {
      return {
        agentName: 'FinancialEngineAgent',
        success: false,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
        data: {} as FinancialEngineOutput,
        errors: [error.message || 'Financial analysis error'],
      };
    }
  }

  // ==========================================
  // 1. Break-Even Analysis
  // ==========================================
  public calculateBreakEven(profile: BusinessProfile): BreakEvenAnalysis {
    const revenue = Math.max(profile.monthlyRevenue, 1);
    const fixedCosts = profile.monthlyFixedCosts || 0;
    const variableCosts = profile.monthlyVariableCosts || 0;

    const existingDebtService = (profile.existingDebts || []).reduce(
      (sum, d) => sum + (d.monthlyEMI || 0),
      0
    );

    const totalMonthlyFixedObligations = fixedCosts + existingDebtService;

    // Gross Margin & Contribution Margin Ratio
    const grossMargin = Math.max(0, revenue - variableCosts);
    const grossMarginPercentage = Math.round(((grossMargin / revenue) * 100) * 10) / 10;
    const contributionMarginRatio = Math.max(0.05, Math.round((grossMargin / revenue) * 1000) / 1000);

    // Break-even monthly revenue = Total Fixed Obligations / Contribution Margin Ratio
    const breakEvenMonthlyRevenue = Math.round(totalMonthlyFixedObligations / contributionMarginRatio);
    const estimatedDailyBreakEvenSales = Math.round(breakEvenMonthlyRevenue / 30);

    const isCurrentlyProfitable = revenue > (fixedCosts + variableCosts + existingDebtService);
    const safetyMarginPercentage = isCurrentlyProfitable
      ? Math.round(((revenue - breakEvenMonthlyRevenue) / revenue) * 100)
      : 0;

    return {
      fixedMonthlyCosts: fixedCosts,
      existingDebtService,
      totalMonthlyFixedObligations,
      grossMarginPercentage,
      contributionMarginRatio,
      breakEvenMonthlyRevenue,
      estimatedDailyBreakEvenSales,
      isCurrentlyProfitable,
      safetyMarginPercentage,
      formulaUsed: 'BreakEvenRevenue = (FixedMonthlyCosts + ExistingDebtEMI) / ContributionMarginRatio',
      assumptions: [
        'Variable costs scale proportionally with sales volume.',
        'Assumes 30 operating days per calendar month.',
        'Includes mandatory existing debt service as fixed monthly obligation.',
      ],
    };
  }

  // ==========================================
  // 2. Max Loan Calculation (Theoretical Ceiling)
  // ==========================================
  public calculateMaxLoan(profile: BusinessProfile): MaxLoanCalculation {
    const revenue = profile.monthlyRevenue;
    const fixedCosts = profile.monthlyFixedCosts || 0;
    const variableCosts = profile.monthlyVariableCosts || 0;
    const netOperatingIncome = Math.max(0, revenue - fixedCosts - variableCosts);

    const existingDebtService = (profile.existingDebts || []).reduce(
      (sum, d) => sum + (d.monthlyEMI || 0),
      0
    );

    // Standard lending ceiling: 55% maximum FOIR (Fixed Obligation to Income Ratio)
    const maxFOIRPercentage = 55;
    const maxTotalDebtCapacity = netOperatingIncome * (maxFOIRPercentage / 100);
    const maxAllowableMonthlyEMI = Math.max(0, Math.round(maxTotalDebtCapacity - existingDebtService));

    const annualInterestRate = this.defaultInterestRate;
    const monthlyRate = annualInterestRate / 12;
    const tenureMonths = profile.requestedTenureMonths || this.defaultTenureMonths;

    // Present Value calculation: PV = EMI * [(1 - (1+r)^-n) / r]
    let maxTheoreticalLoanAmount = 0;
    if (maxAllowableMonthlyEMI > 0) {
      const pvFactor = (1 - Math.pow(1 + monthlyRate, -tenureMonths)) / monthlyRate;
      maxTheoreticalLoanAmount = Math.round((maxAllowableMonthlyEMI * pvFactor) / 5000) * 5000;
    }

    const incomeMultipleUsed = netOperatingIncome > 0
      ? Math.round((maxTheoreticalLoanAmount / (netOperatingIncome * 12)) * 10) / 10
      : 0;

    return {
      maxTheoreticalLoanAmount,
      maxAllowableMonthlyEMI,
      maxFOIRPercentage,
      incomeMultipleUsed,
      interestRateBenchmark: annualInterestRate * 100,
      tenureMonths,
      formulaUsed: 'MaxLoanPrincipal = MaxIncrementalEMI * [(1 - (1 + r)^-n) / r], where MaxTotalEMI = NetOperatingIncome * 55%',
      assumptions: [
        `Interest rate benchmark set at ${(annualInterestRate * 100).toFixed(1)}% p.a. for MSME priority sector lending.`,
        `Maximum allowable Fixed Obligation to Income Ratio (FOIR) capped at ${maxFOIRPercentage}%.`,
        `Tenure calculated for ${tenureMonths} monthly repayment cycles.`,
      ],
    };
  }

  // ==========================================
  // 3. Safe Loan Calculation (Prudential Buffer)
  // ==========================================
  public calculateSafeLoan(profile: BusinessProfile): SafeLoanCalculation {
    const normalRevenue = profile.monthlyRevenue;
    const fixedCosts = profile.monthlyFixedCosts || 0;
    const variableCosts = profile.monthlyVariableCosts || 0;
    const normalNetIncome = Math.max(0, normalRevenue - fixedCosts - variableCosts);

    // Seasonality adjustment
    const leanRevenue = profile.seasonality?.leanMonthlyRevenue || (normalRevenue * 0.7);
    const variableRatio = normalRevenue > 0 ? (variableCosts / normalRevenue) : 0.6;
    const leanVariableCosts = leanRevenue * variableRatio;
    const leanNetIncome = Math.max(0, leanRevenue - fixedCosts - leanVariableCosts);

    // Volatility discount factor based on seasonal drop
    const volatilityDiscountFactor = normalRevenue > 0
      ? Math.min(1.0, Math.max(0.5, Math.round((leanRevenue / normalRevenue) * 100) / 100))
      : 0.8;

    // Conservative weighted monthly net income (60% normal + 40% lean)
    const weightedNetIncome = Math.round((normalNetIncome * 0.6) + (leanNetIncome * 0.4));

    const existingDebtService = (profile.existingDebts || []).reduce(
      (sum, d) => sum + (d.monthlyEMI || 0),
      0
    );

    // Prudential requirement:
    // 1. Safe EMI must not exceed 45% of normal net income
    // 2. Safe EMI must not exceed 65% of lean month net income (guaranteeing survival during lean season)
    // 3. Minimum DSCR >= 1.5x on weighted earnings
    const requiredDSCR = 1.5;
    const maxSafeFoirCapacity = normalNetIncome * 0.45;
    const maxLeanSeasonCapacity = Math.max(0, leanNetIncome * 0.65);
    const dscrBoundedCapacity = weightedNetIncome / requiredDSCR;

    const safeTotalDebtCapacity = Math.min(maxSafeFoirCapacity, maxLeanSeasonCapacity, dscrBoundedCapacity);
    const recommendedSafeMonthlyEMI = Math.max(0, Math.round(safeTotalDebtCapacity - existingDebtService));

    const annualInterestRate = this.defaultInterestRate;
    const monthlyRate = annualInterestRate / 12;
    const tenureMonths = profile.requestedTenureMonths || this.defaultTenureMonths;

    let recommendedSafeLoanAmount = 0;
    if (recommendedSafeMonthlyEMI > 0) {
      const pvFactor = (1 - Math.pow(1 + monthlyRate, -tenureMonths)) / monthlyRate;
      recommendedSafeLoanAmount = Math.round((recommendedSafeMonthlyEMI * pvFactor) / 5000) * 5000;
    }

    // Actual DSCR under normal conditions
    const totalProjectedDebt = existingDebtService + recommendedSafeMonthlyEMI;
    const actualProjectedDSCR = totalProjectedDebt > 0
      ? Math.round((normalNetIncome / totalProjectedDebt) * 100) / 100
      : 3.0;

    const safeFOIRPercentage = normalNetIncome > 0
      ? Math.round((totalProjectedDebt / normalNetIncome) * 100)
      : 40;

    const requestedAmount = profile.requestedLoanAmount || recommendedSafeLoanAmount;
    let borrowerPrudentialTier: 'CONSERVATIVE_GREEN' | 'MODERATE_AMBER' | 'HIGH_LEVERAGE_RED' = 'CONSERVATIVE_GREEN';
    if (requestedAmount <= recommendedSafeLoanAmount) {
      borrowerPrudentialTier = 'CONSERVATIVE_GREEN';
    } else if (requestedAmount <= (recommendedSafeLoanAmount * 1.4)) {
      borrowerPrudentialTier = 'MODERATE_AMBER';
    } else {
      borrowerPrudentialTier = 'HIGH_LEVERAGE_RED';
    }

    return {
      recommendedSafeLoanAmount,
      recommendedSafeMonthlyEMI,
      safeFOIRPercentage,
      requiredDSCR,
      actualProjectedDSCR,
      volatilityDiscountFactor,
      interestRateBenchmark: annualInterestRate * 100,
      tenureMonths,
      borrowerPrudentialTier,
      formulaUsed: 'SafeLoanPrincipal = SafeIncrementalEMI * [(1 - (1 + r)^-n) / r], where SafeTotalEMI <= WeightedSeasonalityNetIncome / 1.5 (DSCR >= 1.5x)',
      assumptions: [
        'Discounts normal earnings by 40% lean season weighting to survive off-peak months.',
        'Requires minimum Debt-Service Coverage Ratio (DSCR) of 1.5x.',
        'Guarantees positive cash flow even during the worst seasonal month.',
      ],
    };
  }

  // ==========================================
  // 4. Working Capital Safety Check
  // ==========================================
  public checkWorkingCapitalSafety(
    profile: BusinessProfile,
    safeLoan: SafeLoanCalculation
  ): WorkingCapitalSafetyCheck {
    // Liquid savings from assets
    const liquidAssets = (profile.assets || [])
      .filter((a) => a.assetType === 'gold_liquid' || a.description?.toLowerCase().includes('saving') || a.description?.toLowerCase().includes('cash'))
      .reduce((sum, a) => sum + a.estimatedMarketValue, 0);

    const monthlyOperatingExpenses = (profile.monthlyFixedCosts || 0) + (profile.monthlyVariableCosts || 0);
    const requiredTwoMonthReserve = monthlyOperatingExpenses * 2;

    const proposedLoanEMI = safeLoan.recommendedSafeMonthlyEMI;
    const existingDebtEMI = (profile.existingDebts || []).reduce((sum, d) => sum + (d.monthlyEMI || 0), 0);

    const availableBufferAfterLoanServicing = Math.max(0, liquidAssets - proposedLoanEMI);
    const reserveCoverageMonths = monthlyOperatingExpenses > 0
      ? Math.round((liquidAssets / monthlyOperatingExpenses) * 10) / 10
      : 1.0;

    const workingCapitalDeficitOrSurplus = liquidAssets - requiredTwoMonthReserve;
    const isReserveAdequate = liquidAssets >= requiredTwoMonthReserve;

    let safetyAlertLevel: 'safe' | 'caution' | 'critical' = 'safe';
    let recommendation = 'Working capital reserve is healthy and covers over 2 months of operational overheads.';

    if (reserveCoverageMonths < 0.8) {
      safetyAlertLevel = 'critical';
      recommendation = `CRITICAL: Liquid reserves (₹${liquidAssets.toLocaleString('en-IN')}) cover only ${reserveCoverageMonths} months of expenses. Require upfront working capital cushion before debt expansion.`;
    } else if (reserveCoverageMonths < 2.0) {
      safetyAlertLevel = 'caution';
      recommendation = `CAUTION: Liquid reserves (₹${liquidAssets.toLocaleString('en-IN')}) cover ${reserveCoverageMonths} months. Allocate ₹${Math.abs(workingCapitalDeficitOrSurplus).toLocaleString('en-IN')} from peak earnings to build a full 2-month reserve.`;
    }

    return {
      currentLiquidSavings: liquidAssets,
      monthlyOperatingExpenses,
      requiredTwoMonthReserve,
      availableBufferAfterLoanServicing,
      reserveCoverageMonths,
      isReserveAdequate,
      workingCapitalDeficitOrSurplus,
      safetyAlertLevel,
      recommendation,
      formulaUsed: 'RequiredReserve = 2 * (FixedCosts + VariableCosts); CoverageMonths = CurrentLiquidSavings / MonthlyOperatingExpenses',
      assumptions: [
        'Prudential standard recommends minimum 2 months of fixed + variable operational costs held in liquid reserve.',
        'Gold and liquid savings are counted as immediate emergency backstop.',
      ],
    };
  }

  // ==========================================
  // 5. 6-Month Cash Flow Projections
  // ==========================================
  public projectSixMonthCashFlow(
    profile: BusinessProfile,
    safeLoan: SafeLoanCalculation
  ): CashFlowProjection {
    const normalRevenue = profile.monthlyRevenue;
    const fixedCosts = profile.monthlyFixedCosts || 0;
    const normalVariableCosts = profile.monthlyVariableCosts || 0;
    const variableRatio = normalRevenue > 0 ? (normalVariableCosts / normalRevenue) : 0.6;

    const peakRevenue = profile.seasonality?.peakMonthlyRevenue || Math.round(normalRevenue * 1.4);
    const leanRevenue = profile.seasonality?.leanMonthlyRevenue || Math.round(normalRevenue * 0.7);

    const existingDebtEMI = (profile.existingDebts || []).reduce((sum, d) => sum + (d.monthlyEMI || 0), 0);
    const proposedLoanEMI = safeLoan.recommendedSafeMonthlyEMI;

    const liquidSavings = (profile.assets || [])
      .filter((a) => a.assetType === 'gold_liquid' || a.description?.toLowerCase().includes('saving'))
      .reduce((sum, a) => sum + a.estimatedMarketValue, 0);

    // 6-Month pattern mapping (incorporates peak, normal, lean cycles)
    const monthPatterns: Array<{ name: string; type: 'normal' | 'peak' | 'lean'; revenue: number }> = [
      { name: 'Month 1', type: 'normal', revenue: normalRevenue },
      { name: 'Month 2', type: 'normal', revenue: normalRevenue },
      { name: 'Month 3', type: 'peak', revenue: peakRevenue },
      { name: 'Month 4', type: 'peak', revenue: peakRevenue },
      { name: 'Month 5', type: 'lean', revenue: leanRevenue },
      { name: 'Month 6', type: 'normal', revenue: normalRevenue },
    ];

    let runningCashBuffer = liquidSavings;
    let hasDeficitMonths = false;
    const sixMonthProjection: MonthlyCashFlowItem[] = [];

    for (let i = 0; i < monthPatterns.length; i++) {
      const p = monthPatterns[i];
      const monthlyVarCosts = Math.round(p.revenue * variableRatio);
      const totalOutflows = fixedCosts + monthlyVarCosts + existingDebtEMI + proposedLoanEMI;
      const netMonthlyCashFlow = p.revenue - totalOutflows;

      runningCashBuffer += netMonthlyCashFlow;
      const isDeficit = netMonthlyCashFlow < 0 || runningCashBuffer < 0;
      if (isDeficit) hasDeficitMonths = true;

      sixMonthProjection.push({
        monthIndex: i + 1,
        monthName: p.name,
        seasonType: p.type,
        projectedGrossRevenue: p.revenue,
        fixedCosts,
        variableCosts: monthlyVarCosts,
        existingDebtEMI,
        proposedLoanEMI,
        totalOutflows,
        netMonthlyCashFlow,
        endingCashBuffer: runningCashBuffer,
        isDeficit,
      });
    }

    const netOperatingCashFlow = normalRevenue - (fixedCosts + normalVariableCosts);
    const leanMonthNetCashFlow = leanRevenue - (fixedCosts + Math.round(leanRevenue * variableRatio));
    const peakMonthNetCashFlow = peakRevenue - (fixedCosts + Math.round(peakRevenue * variableRatio));
    const freeCashFlowBeforeNewDebt = Math.max(0, netOperatingCashFlow - existingDebtEMI);

    const totalSurplus = sixMonthProjection.reduce((acc, m) => acc + m.netMonthlyCashFlow, 0);
    const averageProjectedMonthlySurplus = Math.round(totalSurplus / 6);

    return {
      grossMonthlyRevenue: normalRevenue,
      totalMonthlyExpenses: fixedCosts + normalVariableCosts,
      netOperatingCashFlow,
      leanMonthNetCashFlow,
      peakMonthNetCashFlow,
      minimumEmergencyBufferNeeded: (fixedCosts + normalVariableCosts) * 2,
      existingMonthlyDebtServicing: existingDebtEMI,
      freeCashFlowBeforeNewDebt,
      sixMonthProjection,
      averageProjectedMonthlySurplus,
      hasDeficitMonths,
      formulaUsed: 'MonthlyNetCashFlow = ProjectedGrossRevenue - (FixedCosts + VariableCosts + ExistingEMI + ProposedLoanEMI)',
      assumptions: [
        'Simulates 6-month cycle including 2 festival peak months and 1 lean weather month.',
        'Variable stock costs adjust dynamically with revenue fluctuations.',
        'Assumes timely disbursement and fixed EMI amortization.',
      ],
    };
  }

  /**
   * Helper to calculate informal debt burden percentage
   */
  private calculateInformalDebtRatio(profile: BusinessProfile): number {
    const totalPrincipal = (profile.existingDebts || []).reduce((acc, d) => acc + d.outstandingPrincipal, 0);
    const informalPrincipal = (profile.existingDebts || [])
      .filter((d) => d.sourceType === 'informal_moneylender')
      .reduce((acc, d) => acc + d.outstandingPrincipal, 0);

    return totalPrincipal > 0 ? Math.round((informalPrincipal / totalPrincipal) * 100) : 0;
  }
}
