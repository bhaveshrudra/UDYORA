import { CompleteAdvisoryReport } from '../types';

export interface BarChartItem {
  label: string;
  value: number;
  max: number;
  displayValue: string;
  color?: string;
  subText?: string;
}

export interface DonutSegment {
  label: string;
  value: number;
  percentage: number;
  color: string;
  formattedAmount?: string;
}

export interface ScoreContributionFactor {
  name: string;
  rawScore: number;
  weight: number;
  contributionPoints: number;
  rationale: string;
}

export const chartDataTransformers = {
  /**
   * Prepares Feasibility Factor horizontal bars
   */
  prepareFeasibilityChartData(report: CompleteAdvisoryReport): BarChartItem[] {
    return report.feasibility.factors.map((f) => {
      let color = '#2563EB'; // default blue
      if (f.score >= 80) color = '#059669'; // green
      else if (f.score >= 65) color = '#0284C7'; // sky
      else if (f.score >= 50) color = '#D97706'; // amber
      else color = '#DC2626'; // red

      return {
        label: f.name,
        value: f.score,
        max: 100,
        displayValue: `${f.score}/100`,
        color,
        subText: f.rationale
      };
    });
  },

  /**
   * Prepares Capital Structure Donut Segments
   */
  prepareFinancialCapitalStructure(report: CompleteAdvisoryReport): DonutSegment[] {
    const total = report.financial.indicativeProjectCost;
    if (!total || total <= 0) return [];

    const equity = report.financial.availableEquity;
    const loan = report.financial.termLoanAmount;
    const topScheme = report.schemes.find((s) => s.matchStatus === 'MATCHED' && s.estimatedSubsidyAmount > 0);
    const subsidy = topScheme ? Math.min(topScheme.estimatedSubsidyAmount, total - equity) : 0;
    const adjustedLoan = Math.max(0, loan - subsidy);

    const segments: DonutSegment[] = [
      {
        label: 'Promoter Equity',
        value: equity,
        percentage: Math.round((equity / total) * 100),
        color: '#059669',
        formattedAmount: `₹${equity.toLocaleString('en-IN')}`
      },
      {
        label: 'Bank Debt / Term Loan',
        value: adjustedLoan,
        percentage: Math.round((adjustedLoan / total) * 100),
        color: '#1D4ED8',
        formattedAmount: `₹${adjustedLoan.toLocaleString('en-IN')}`
      }
    ];

    if (subsidy > 0) {
      segments.push({
        label: 'Government Subsidy Grant',
        value: subsidy,
        percentage: Math.round((subsidy / total) * 100),
        color: '#D97706',
        formattedAmount: `₹${subsidy.toLocaleString('en-IN')}`
      });
    }

    return segments;
  },

  /**
   * Prepares Cost Breakdown horizontal bars
   */
  prepareCostBreakdown(report: CompleteAdvisoryReport): BarChartItem[] {
    const total = report.financial.indicativeProjectCost;
    const capex = Math.round(total * 0.70);
    const initialWorkingCapital = Math.round(total * 0.30);
    const operatingCostAnnual = report.financial.estimatedAnnualOperatingCost;

    return [
      {
        label: 'Capital Expenditure (Machinery/Shed/Assets)',
        value: capex,
        max: total,
        displayValue: `₹${capex.toLocaleString('en-IN')}`,
        color: '#1D4ED8',
        subText: 'One-time setup investment'
      },
      {
        label: 'Initial Working Capital & Buffer',
        value: initialWorkingCapital,
        max: total,
        displayValue: `₹${initialWorkingCapital.toLocaleString('en-IN')}`,
        color: '#0284C7',
        subText: 'Initial raw materials / inventory buffer'
      },
      {
        label: 'Estimated Annual Operating Cost',
        value: operatingCostAnnual,
        max: report.financial.estimatedAnnualRevenue || operatingCostAnnual * 1.5,
        displayValue: `₹${operatingCostAnnual.toLocaleString('en-IN')}/yr`,
        color: '#7C3AED',
        subText: 'Recurring feed, utilities, labor & transport'
      }
    ];
  },

  /**
   * Prepares Risk Distribution Segments
   */
  prepareRiskDistribution(report: CompleteAdvisoryReport): DonutSegment[] {
    const factors = report.risks.factors;
    const high = factors.filter((f) => f.severity === 'HIGH').length;
    const med = factors.filter((f) => f.severity === 'MEDIUM').length;
    const low = factors.filter((f) => f.severity === 'LOW').length;
    const total = factors.length || 1;

    return [
      {
        label: 'High Severity',
        value: high,
        percentage: Math.round((high / total) * 100),
        color: '#DC2626',
        formattedAmount: `${high} risks`
      },
      {
        label: 'Medium Severity',
        value: med,
        percentage: Math.round((med / total) * 100),
        color: '#D97706',
        formattedAmount: `${med} risks`
      },
      {
        label: 'Low Severity',
        value: low,
        percentage: Math.round((low / total) * 100),
        color: '#059669',
        formattedAmount: `${low} risks`
      }
    ].filter((s) => s.value > 0);
  },

  /**
   * Prepares Evidence Data Quality Distribution
   */
  prepareEvidenceDistribution(report: CompleteAdvisoryReport): DonutSegment[] {
    const evidence = report.evidence;
    const verified = evidence.filter((e) => e.status === 'VERIFIED').length;
    const observed = evidence.filter((e) => e.status === 'OBSERVED').length;
    const estimated = evidence.filter((e) => e.status === 'ESTIMATED').length;
    const missing = evidence.filter((e) => e.status === 'INSUFFICIENT_DATA').length;
    const total = evidence.length || 1;

    return [
      {
        label: 'Verified Official Data (LGD / RBI / Schemes)',
        value: verified,
        percentage: Math.round((verified / total) * 100),
        color: '#059669',
        formattedAmount: `${verified} records`
      },
      {
        label: 'Observed Spatial Data (OpenStreetMap / Map POIs)',
        value: observed,
        percentage: Math.round((observed / total) * 100),
        color: '#0284C7',
        formattedAmount: `${observed} records`
      },
      {
        label: 'Estimated Feasibility Projections',
        value: estimated,
        percentage: Math.round((estimated / total) * 100),
        color: '#D97706',
        formattedAmount: `${estimated} records`
      },
      {
        label: 'Insufficient Data Parameters',
        value: missing,
        percentage: Math.round((missing / total) * 100),
        color: '#94A3B8',
        formattedAmount: `${missing} records`
      }
    ].filter((s) => s.value > 0);
  },

  /**
   * Prepares Business Domain Comparison Bars
   */
  prepareComparisonChartData(report: CompleteAdvisoryReport): BarChartItem[] {
    return report.domainComparison.map((item) => ({
      label: item.domain,
      value: item.suitabilityScore,
      max: 100,
      displayValue: `${item.suitabilityScore}/100`,
      color: item.isProposed ? '#1D4ED8' : '#64748B',
      subText: `${item.keyAdvantage} (Capital Fit: ${item.promoterCapitalFit})`
    }));
  },

  /**
   * Prepares "WHY THIS SCORE?" Mathematical Rationale
   */
  prepareScoreExplanation(report: CompleteAdvisoryReport): ScoreContributionFactor[] {
    return report.feasibility.factors.map((f) => ({
      name: f.name,
      rawScore: f.score,
      weight: Math.round(f.weight * 100),
      contributionPoints: f.weightedScore,
      rationale: f.rationale
    }));
  },

  /**
   * Identifies transparent Information Gaps
   */
  prepareInformationGaps(report: CompleteAdvisoryReport): string[] {
    const gaps: string[] = [];

    if (report.market.observedCompetitorCount === 'INSUFFICIENT_DATA') {
      gaps.push('Specific competitor density could not be confirmed via map provider.');
    }
    gaps.push('Informal unorganized village micro-enterprises are not registered in digital directories.');
    gaps.push('Official loan sanction and interest subvention are subject to final bank scrutiny.');
    gaps.push('Exact fodder / commodity pricing varies with seasonal weather conditions.');

    return gaps;
  }
};
