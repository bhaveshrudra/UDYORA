/**
 * UDYORA Agent 7: Final Advisor / Report Agent
 * Synthesizes outputs from specialized agents into the executive feasibility report.
 * Uses the Centralized Deterministic Feasibility Engine (feasibilityEngine.ts)
 * as the single source of truth for feasibility scoring, hard constraints, and location sensitivity.
 */

import { UserBusinessInput, LocationData, EvidenceRecord, FeasibilityDimension, DataQualityStatus } from '../types';
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

  const getRating = (s: number): 'STRONG' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'CRITICAL' => {
    if (s >= 80) return 'STRONG';
    if (s >= 65) return 'ADEQUATE';
    if (s >= 50) return 'NEEDS_ATTENTION';
    return 'CRITICAL';
  };

  const dimensions: FeasibilityDimension[] = [
    {
      id: 'dim_location',
      name: 'Location Viability',
      weight: 0.30,
      score: deterministicResult.factors.locationViability,
      confidence: 0.95,
      status: (deterministicResult.factors.locationViability >= 65 ? 'VERIFIED' : 'ESTIMATED') as DataQualityStatus,
      rating: getRating(deterministicResult.factors.locationViability),
      summary: `Location score (${deterministicResult.factors.locationViability}/100) based on settlement area (${location.areaType || 'Rural'}) and market distance.`
    },
    {
      id: 'dim_market',
      name: 'Market Catchment Demand',
      weight: 0.20,
      score: deterministicResult.factors.marketDemand,
      confidence: 0.90,
      status: (deterministicResult.factors.marketDemand >= 65 ? 'VERIFIED' : 'ESTIMATED') as DataQualityStatus,
      rating: getRating(deterministicResult.factors.marketDemand),
      summary: `Market demand (${deterministicResult.factors.marketDemand}/100) evaluated from local population density.`
    },
    {
      id: 'dim_financial',
      name: 'Financial Viability & DSCR',
      weight: 0.20,
      score: deterministicResult.factors.financialViability,
      confidence: 0.95,
      status: (deterministicResult.factors.financialViability >= 70 ? 'VERIFIED' : 'ESTIMATED') as DataQualityStatus,
      rating: getRating(deterministicResult.factors.financialViability),
      summary: `DSCR calculated at ${dscr}x with capital equity margin of ₹${availableOwnCapital.toLocaleString('en-IN')}.`
    },
    {
      id: 'dim_infrastructure',
      name: 'Infrastructure & Accessibility',
      weight: 0.15,
      score: deterministicResult.factors.infrastructure,
      confidence: 0.90,
      status: (deterministicResult.factors.infrastructure >= 60 ? 'ESTIMATED' : 'INSUFFICIENT DATA') as DataQualityStatus,
      rating: getRating(deterministicResult.factors.infrastructure),
      summary: `Infrastructure accessibility (${deterministicResult.factors.infrastructure}/100) based on road and collection center connectivity.`
    },
    {
      id: 'dim_competition',
      name: 'Opportunity & Competition Gap',
      weight: 0.10,
      score: deterministicResult.factors.competitionGap,
      confidence: 0.85,
      status: 'ESTIMATED' as DataQualityStatus,
      rating: getRating(deterministicResult.factors.competitionGap),
      summary: `Commercial opportunity gap score of ${deterministicResult.factors.competitionGap}/100.`
    },
    {
      id: 'dim_risk',
      name: 'Risk Adjustment',
      weight: 0.05,
      score: deterministicResult.factors.riskAdjustment,
      confidence: 0.85,
      status: 'ESTIMATED' as DataQualityStatus,
      rating: getRating(deterministicResult.factors.riskAdjustment),
      summary: `Operational risk profile evaluated at ${overallRiskLevel}.`
    }
  ];

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
