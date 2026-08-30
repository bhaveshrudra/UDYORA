/**
 * UDYORA Agent 7: Final Advisor / Report Agent
 * Synthesizes outputs from specialized agents into the executive feasibility report.
 * Uses the Centralized Deterministic Feasibility Engine (feasibilityEngine.ts)
 * as the single source of truth for feasibility scoring, hard constraints, and location sensitivity.
 */

import { UserBusinessInput, LocationData, EvidenceRecord, FeasibilityDimension } from '../types';
import {
  calculateDeterministicFeasibility,
  FeasibilityAssessmentResult
} from '../services/feasibilityEngine';

export interface FinalAdvisorOutput {
  score: number;
  feasibilityScore: number;
  dataConfidenceScore: number;
  category: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'CONDITIONAL' | 'LOW';
  status?: 'RECOMMENDED' | 'CONDITIONAL' | 'NOT RECOMMENDED';
  statusLabel?: string;
  headline: string;
  explanation: string;
  counterfactualRecommendation?: string;
  appliedConstraints?: string[];
  limitingFactors?: string[];
  positiveFactors?: string[];
  dimensions: FeasibilityDimension[];
  readinessFactors: any[];
  criticalCaveat: string;
  disclaimer: string;
}

export function runFinalAdvisorAgent(
  input: UserBusinessInput,
  location: LocationData,
  businessAgentRes: any,
  marketAgentRes: any,
  financeAgentRes: any,
  schemeAgentRes: any,
  riskAgentRes: any,
  evidenceRecords: EvidenceRecord[] = []
): FinalAdvisorOutput {
  const finData = financeAgentRes?.data || {};
  const dscr = finData.debtServiceCoverageRatio ?? 2.29;
  const availableOwnCapital = finData.availableOwnCapital ?? input.availableCapital ?? 100000;
  const indicativeProjectCost = finData.indicativeProjectCost ?? 1000000;
  const risks = riskAgentRes?.data || {};
  const overallRiskLevel = risks.overallRiskLevel || 'MEDIUM';

  // 1. Run Centralized Single Source of Truth Deterministic Feasibility Engine
  const deterministicResult: FeasibilityAssessmentResult = calculateDeterministicFeasibility({
    input,
    location,
    businessCategoryId: input.businessCategoryId || 'dairy',
    dscr,
    availableOwnCapital,
    indicativeProjectCost,
    overallRiskLevel,
    evidenceRecords
  });

  const dimensions = deterministicResult.dimensions;

  const readinessFactors = dimensions.map((d) => ({
    area: d.name,
    score: d.score,
    weight: Math.round(d.weight * 100),
    rating: d.rating,
    summary: d.summary
  }));

  const criticalCaveat = 'Institutional loan sanction is subject to lender credit appraisal, applicant CIBIL score, and document verification.';
  const disclaimer = 'UDYORA provides advisory estimates based on official data sources and mathematical models. This report is for planning and does not constitute a guaranteed commercial contract or bank credit sanction.';

  return {
    score: deterministicResult.score,
    feasibilityScore: deterministicResult.score,
    dataConfidenceScore: deterministicResult.dataConfidenceScore,
    category: deterministicResult.category,
    status: deterministicResult.status,
    statusLabel: deterministicResult.statusLabel,
    headline: deterministicResult.statusLabel,
    explanation: deterministicResult.explanation,
    counterfactualRecommendation: deterministicResult.counterfactualRecommendation,
    appliedConstraints: deterministicResult.appliedConstraints,
    limitingFactors: deterministicResult.limitingFactors,
    positiveFactors: deterministicResult.positiveFactors,
    dimensions,
    readinessFactors,
    criticalCaveat,
    disclaimer
  };
}
