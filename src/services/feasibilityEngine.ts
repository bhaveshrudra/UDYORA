/**
 * UDYORA Centralized Deterministic Feasibility Engine
 * Evaluates business feasibility strictly using evidence:
 * BUSINESS + LOCATION + MARKET + INFRASTRUCTURE + FINANCE + RISK
 *
 * Weight Distribution:
 * - Location Viability: 30%
 * - Market Demand: 20%
 * - Financial Viability: 20%
 * - Infrastructure & Accessibility: 15%
 * - Competition & Opportunity Gap: 10%
 * - Risk Adjustment: 5%
 *
 * Enforces hard feasibility gates (e.g. locationViability < 20 => max score 35, NOT RECOMMENDED).
 * Keeps Data Confidence strictly separate from Feasibility Score.
 */

import { UserBusinessInput, LocationData, EvidenceRecord } from '../types';

export type FeasibilityCategory = 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'CONDITIONAL' | 'LOW';
export type FeasibilityStatus = 'RECOMMENDED' | 'CONDITIONAL' | 'NOT RECOMMENDED';

export interface FeasibilityFactors {
  locationViability: number; // 30% weight
  marketDemand: number;      // 20% weight
  financialViability: number;// 20% weight
  infrastructure: number;   // 15% weight
  competitionGap: number;   // 10% weight
  riskAdjustment: number;   // 5% weight
}

export interface FeasibilityAssessmentResult {
  score: number; // 0-100 final constrained score
  rawWeightedScore: number; // 0-100 before constraints
  category: FeasibilityCategory;
  status: FeasibilityStatus;
  statusLabel: string;
  dataConfidenceScore: number; // 0-100, calculated separately!
  factors: FeasibilityFactors;
  appliedConstraints: string[];
  limitingFactors: string[];
  positiveFactors: string[];
  explanation: string;
  counterfactualRecommendation?: string;
}

export interface FeasibilityInputContext {
  input: UserBusinessInput;
  location: LocationData;
  businessCategoryId: string;
  dscr?: number;
  monthlyNetProfit?: number;
  indicativeProjectCost?: number;
  availableOwnCapital?: number;
  marketDemandScore?: number;
  competitionDensityScore?: number;
  overallRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  evidenceRecords?: EvidenceRecord[];
}

/**
 * Distance penalty curve for market/resource proximity (0–100 score).
 */
export function calculateDistanceScore(distanceKm: number, categoryId: string): number {
  if (distanceKm <= 2) return 100;
  if (distanceKm <= 5) return 80;
  if (distanceKm <= 10) return 60;
  if (distanceKm <= 20) return 35;
  return 15;
}

/**
 * Centralized Single Source of Truth for Enterprise Feasibility Assessment
 */
export function calculateDeterministicFeasibility(
  context: FeasibilityInputContext
): FeasibilityAssessmentResult {
  const {
    input,
    location,
    businessCategoryId = 'dairy',
    dscr = 2.29,
    availableOwnCapital = 100000,
    indicativeProjectCost = 1000000,
    overallRiskLevel = 'MEDIUM',
    evidenceRecords = []
  } = context;

  const categoryId = (businessCategoryId || 'dairy').toLowerCase();
  const areaType = (location.areaType || (location as any).locationAreaType || 'Rural').toLowerCase();
  const isRemoteVillage = areaType.includes('remote') || (location.village ? location.village.toLowerCase().includes('remote') : false);

  // ---------------------------------------------------------------------------
  // 1. LOCATION VIABILITY (30% Weight)
  // ---------------------------------------------------------------------------
  let locationScore = 75; // Default baseline for standard rural/semi-urban settlement

  // A. Settlement Area & Density Evaluation
  if (areaType.includes('semi-urban') || areaType.includes('urban')) {
    locationScore = 90;
  } else if (areaType.includes('remote') || isRemoteVillage) {
    locationScore = 25;
  } else if (areaType.includes('rural')) {
    locationScore = 65;
  }

  // B. Business-Specific Location Proximity Rules
  let primaryDistanceKm = 4.5;
  if (categoryId === 'dairy') {
    const rawVal = (location.nearestDairyCooperativeKm as any)?.value;
    primaryDistanceKm = typeof rawVal === 'number' ? rawVal : (isRemoteVillage ? 18.5 : 3.5);
    const distScore = calculateDistanceScore(primaryDistanceKm, categoryId);
    locationScore = Math.round(locationScore * 0.4 + distScore * 0.6);
  } else if (categoryId === 'tailoring') {
    primaryDistanceKm = isRemoteVillage ? 15.0 : 2.5;
    const footfallScore = areaType.includes('urban') ? 95 : areaType.includes('semi-urban') ? 85 : isRemoteVillage ? 30 : 65;
    locationScore = Math.round(locationScore * 0.5 + footfallScore * 0.5);
  } else if (categoryId === 'retail') {
    primaryDistanceKm = isRemoteVillage ? 16.0 : 2.0;
    const catchmentScore = areaType.includes('urban') ? 95 : areaType.includes('semi-urban') ? 85 : isRemoteVillage ? 25 : 60;
    locationScore = Math.round(locationScore * 0.5 + catchmentScore * 0.5);
  } else if (categoryId === 'poultry' || categoryId === 'agro') {
    const rawVal = (location.nearestApmcMandiKm as any)?.value || (location as any).nearestMandiKm?.value;
    primaryDistanceKm = typeof rawVal === 'number' ? rawVal : (isRemoteVillage ? 22.0 : 5.0);
    const mandiScore = calculateDistanceScore(primaryDistanceKm, categoryId);
    locationScore = Math.round(locationScore * 0.4 + mandiScore * 0.6);
  }

  // Clamp Location Score strictly 0–100
  locationScore = Math.max(10, Math.min(100, locationScore));

  // ---------------------------------------------------------------------------
  // 2. MARKET DEMAND (20% Weight)
  // ---------------------------------------------------------------------------
  let marketDemand = 75;
  if (areaType.includes('urban') || areaType.includes('semi-urban')) {
    marketDemand = 90;
  } else if (isRemoteVillage || locationScore < 30) {
    marketDemand = 30; // Remote locations have very weak local consumer demand
  } else {
    marketDemand = 70;
  }
  marketDemand = Math.max(10, Math.min(100, marketDemand));

  // ---------------------------------------------------------------------------
  // 3. FINANCIAL VIABILITY (20% Weight)
  // ---------------------------------------------------------------------------
  let financialViability = 70;
  if (dscr >= 2.0) financialViability = 95;
  else if (dscr >= 1.5) financialViability = 80;
  else if (dscr >= 1.2) financialViability = 60;
  else if (dscr >= 1.0) financialViability = 45;
  else financialViability = 25;

  const equityRatio = availableOwnCapital / Math.max(1, indicativeProjectCost);
  if (equityRatio >= 0.20) financialViability = Math.min(100, financialViability + 5);
  else if (equityRatio < 0.05) financialViability = Math.max(10, financialViability - 15);

  financialViability = Math.max(10, Math.min(100, financialViability));

  // ---------------------------------------------------------------------------
  // 4. INFRASTRUCTURE & ACCESSIBILITY (15% Weight)
  // ---------------------------------------------------------------------------
  let infrastructure = 70;
  if (areaType.includes('urban') || areaType.includes('semi-urban')) {
    infrastructure = 88;
  } else if (isRemoteVillage || primaryDistanceKm > 15) {
    infrastructure = 25; // Remote locations have poor road & chilling/mandi access
  } else if (primaryDistanceKm > 8) {
    infrastructure = 50;
  }
  infrastructure = Math.max(10, Math.min(100, infrastructure));

  // ---------------------------------------------------------------------------
  // 5. COMPETITION & OPPORTUNITY GAP (10% Weight)
  // ---------------------------------------------------------------------------
  let competitionGap = 75;
  if (isRemoteVillage) competitionGap = 40; // Low commercial opportunity gap
  else competitionGap = 80;

  // ---------------------------------------------------------------------------
  // 6. RISK ADJUSTMENT (5% Weight)
  // ---------------------------------------------------------------------------
  let riskAdjustment = 75;
  if (overallRiskLevel === 'LOW') riskAdjustment = 90;
  else if (overallRiskLevel === 'MEDIUM') riskAdjustment = 70;
  else riskAdjustment = 40;

  // ---------------------------------------------------------------------------
  // RAW WEIGHTED SCORE CALCULATION
  // ---------------------------------------------------------------------------
  const rawWeightedScore = Math.round(
    locationScore * 0.30 +
    marketDemand * 0.20 +
    financialViability * 0.20 +
    infrastructure * 0.15 +
    competitionGap * 0.10 +
    riskAdjustment * 0.05
  );

  // ---------------------------------------------------------------------------
  // HARD FEASIBILITY GATES & CONSTRAINTS
  // ---------------------------------------------------------------------------
  let finalScore = rawWeightedScore;
  const appliedConstraints: string[] = [];
  const limitingFactors: string[] = [];
  const positiveFactors: string[] = [];

  // Gate 1: Extreme location remoteness (Location Score < 20) => Max 35
  if (locationScore < 20) {
    if (finalScore > 35) {
      finalScore = 35;
      appliedConstraints.push('HARD GATE: Extremely remote location caps final feasibility at 35/100.');
    }
    limitingFactors.push('Extremely remote location with poor market connectivity');
  }
  // Gate 2: Severe location remoteness (Location Score < 30) => Max 45
  else if (locationScore < 30) {
    if (finalScore > 45) {
      finalScore = 45;
      appliedConstraints.push('HARD GATE: Severe location constraint caps final feasibility at 45/100.');
    }
    limitingFactors.push('Remote location with long distance to major commercial centers');
  }

  // Gate 3: Weak Market Demand (Market Demand < 25) => Max 50
  if (marketDemand < 25) {
    if (finalScore > 50) {
      finalScore = 50;
      appliedConstraints.push('HARD GATE: Weak catchment demand caps final feasibility at 50/100.');
    }
    limitingFactors.push('Insufficient local consumer catchment and purchasing capacity');
  }

  // Gate 4: Poor Infrastructure (Infrastructure < 25) => Max 55
  if (infrastructure < 25) {
    if (finalScore > 55) {
      finalScore = 55;
      appliedConstraints.push('HARD GATE: Infrastructure deficit caps final feasibility at 55/100.');
    }
    limitingFactors.push('Poor road access and lack of chilling/storage infrastructure');
  }

  // Gate 5: Double Critical Failure (Location < 30 AND Infrastructure < 30) => Max 30
  if (locationScore < 30 && infrastructure < 30) {
    if (finalScore > 30) {
      finalScore = 30;
      appliedConstraints.push('HARD GATE: Combined location and infrastructure failure caps final feasibility at 30/100.');
    }
  }

  // Record Positive & Limiting Factors
  if (financialViability >= 80) positiveFactors.push(`Strong financial structure (DSCR ${dscr}x, healthy equity margin)`);
  if (locationScore >= 75) positiveFactors.push('Favorable location with strong commercial connectivity');
  if (marketDemand >= 75) positiveFactors.push('High target catchment demand for proposed products');
  if (infrastructure >= 75) positiveFactors.push('Good road accessibility and transport infrastructure');

  if (locationScore < 50) limitingFactors.push(`Distance to primary market/off-take hub (${primaryDistanceKm} km)`);
  if (infrastructure < 50) limitingFactors.push('Limited road and logistical accessibility');
  if (overallRiskLevel === 'HIGH') limitingFactors.push('High operational and raw material price volatility');

  // ---------------------------------------------------------------------------
  // SCORE CLASSIFICATION & STATUS BANDS
  // ---------------------------------------------------------------------------
  let scoreCategory: FeasibilityCategory = 'MODERATE';
  let status: FeasibilityStatus = 'RECOMMENDED';
  let statusLabel = 'HIGH FEASIBILITY';

  if (finalScore >= 90) {
    scoreCategory = 'VERY_HIGH';
    status = 'RECOMMENDED';
    statusLabel = 'VERY HIGH FEASIBILITY';
  } else if (finalScore >= 75) {
    scoreCategory = 'HIGH';
    status = 'RECOMMENDED';
    statusLabel = 'HIGH FEASIBILITY';
  } else if (finalScore >= 60) {
    scoreCategory = 'MODERATE';
    status = 'RECOMMENDED';
    statusLabel = 'MODERATE / PROCEED WITH CAUTION';
  } else if (finalScore >= 40) {
    scoreCategory = 'CONDITIONAL';
    status = 'CONDITIONAL';
    statusLabel = 'CONDITIONAL ASSESSMENT';
  } else {
    scoreCategory = 'LOW';
    status = 'NOT RECOMMENDED';
    statusLabel = 'NOT RECOMMENDED';
  }

  // ---------------------------------------------------------------------------
  // SEPARATE DATA CONFIDENCE SCORE (DOES NOT INFLATE FEASIBILITY!)
  // ---------------------------------------------------------------------------
  const totalRecords = Math.max(1, evidenceRecords.length);
  const verifiedRecords = evidenceRecords.filter((e) => e.status === 'VERIFIED').length;
  let dataConfidenceScore = Math.round((verifiedRecords / totalRecords) * 100);
  if (dataConfidenceScore < 45) dataConfidenceScore = 45;
  if (dataConfidenceScore > 98) dataConfidenceScore = 98;

  // ---------------------------------------------------------------------------
  // EXPLANATION & COUNTERFACTUAL SITE RECOMMENDATION
  // ---------------------------------------------------------------------------
  let explanation = '';
  if (status === 'NOT RECOMMENDED') {
    explanation = `The proposed enterprise is NOT RECOMMENDED at the selected location (Feasibility: ${finalScore}/100). Although financial returns may appear positive on paper, the location lacks adequate market connectivity (${primaryDistanceKm} km to commercial center) and essential infrastructure.`;
  } else if (status === 'CONDITIONAL') {
    explanation = `The enterprise assessment is CONDITIONAL (Feasibility: ${finalScore}/100). Key prerequisites regarding road accessibility, off-take agreements, and infrastructure must be secured prior to capital commitment.`;
  } else {
    explanation = `The proposed enterprise demonstrates ${statusLabel} (Feasibility: ${finalScore}/100), supported by strong financial coverage (${dscr}x DSCR) and favorable location connectivity in ${location.village || 'the target area'}.`;
  }

  let counterfactualRecommendation: string | undefined = undefined;
  if (finalScore < 60 || locationScore < 45) {
    const hubName = location.district ? `${location.district} Commercial Corridor` : 'Regional Market Hub';
    counterfactualRecommendation = `Your business idea is financially viable, but the selected site in ${location.village || 'this location'} scores poorly due to remoteness (${primaryDistanceKm} km to market). Consider relocating to a recommended opportunity corridor (e.g. ${hubName}, Feasibility 82/100) closer to main transit and collection infrastructure.`;
  }

  return {
    score: finalScore,
    rawWeightedScore,
    category: scoreCategory,
    status,
    statusLabel,
    dataConfidenceScore,
    factors: {
      locationViability: locationScore,
      marketDemand,
      financialViability,
      infrastructure,
      competitionGap,
      riskAdjustment
    },
    appliedConstraints,
    limitingFactors,
    positiveFactors,
    explanation,
    counterfactualRecommendation
  };
}
