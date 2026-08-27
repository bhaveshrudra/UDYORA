import {
  AgentPayload,
  EvidenceRecord,
  FinancialPlan,
  UserBusinessInput
} from '../types';
import { generateDeterministicFinancialPlan } from '../services/financialCalculator';

/**
 * FINANCIAL ADVISOR AGENT
 * Pure deterministic execution.
 * Wraps financial calculation engine with zero arithmetic hallucination.
 */
export function runFinanceAgent(
  input: UserBusinessInput
): AgentPayload<FinancialPlan> {
  const startTime = Date.now();

  // Run deterministic calculation engine
  const financialPlan = generateDeterministicFinancialPlan(input);

  const generatedEvidence: EvidenceRecord[] = [
    {
      id: 'ev_fin_proj_cost_calc',
      metricName: 'Indicative Project Cost Benchmark (10% Promoter Contribution)',
      value: `₹${financialPlan.indicativeProjectCost.toLocaleString('en-IN')}`,
      unit: 'INR',
      source: 'Deterministic Financial Model (SIH26091 10% Margin Standard)',
      sourceUrl: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',
      geographicLevel: 'National',
      timestamp: new Date().toISOString(),
      status: 'VERIFIED',
      confidence: 1.0
    },
    {
      id: 'ev_fin_loan_calc',
      metricName: 'Indicative Institutional Financing Requirement',
      value: `₹${financialPlan.indicativeFinancingRequirement.toLocaleString('en-IN')}`,
      unit: 'INR',
      source: 'Deterministic Loan Requirement Calculator',
      geographicLevel: 'National',
      timestamp: new Date().toISOString(),
      status: 'VERIFIED',
      confidence: 1.0
    },
    {
      id: 'ev_fin_monthly_emi',
      metricName: 'Monthly Equated Monthly Installment (EMI)',
      value: `₹${financialPlan.monthlyEMI.toLocaleString('en-IN')}`,
      unit: 'INR/month',
      source: 'Standard Reducing Balance Formula @ 9.5% p.a.',
      geographicLevel: 'National',
      timestamp: new Date().toISOString(),
      status: 'VERIFIED',
      confidence: 1.0
    },
    {
      id: 'ev_fin_dscr_ratio',
      metricName: 'Debt Service Coverage Ratio (DSCR)',
      value: financialPlan.debtServiceCoverageRatio,
      unit: 'Ratio',
      source: 'Operating Cash Flow to Annual Debt Service Ratio Calculation',
      geographicLevel: 'National',
      timestamp: new Date().toISOString(),
      status: 'VERIFIED',
      confidence: 0.95
    }
  ];

  return {
    agentName: 'Financial Advisor Agent',
    status: 'COMPLETED',
    executionTimeMs: Date.now() - startTime,
    dataQuality: 'VERIFIED',
    overallConfidence: 0.98,
    confidence: 0.98,
    summary: `Project Cost: ₹${financialPlan.indicativeProjectCost.toLocaleString('en-IN')} | Own Capital: ₹${financialPlan.availableOwnCapital.toLocaleString('en-IN')} | Financing: ₹${financialPlan.indicativeFinancingRequirement.toLocaleString('en-IN')} | Monthly EMI: ₹${financialPlan.monthlyEMI.toLocaleString('en-IN')} | DSCR: ${financialPlan.debtServiceCoverageRatio}`,
    data: financialPlan,
    evidenceGenerated: generatedEvidence
  };
}
