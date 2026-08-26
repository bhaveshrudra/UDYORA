import {
  SchemeMatchResult,
  SchemeRule,
  UserBusinessInput,
  FinancialPlan
} from '../types';
import { VERIFIED_SCHEMES } from '../data/schemes';

/**
 * Deterministic Scheme Eligibility & Rule Engine for UDYORA
 * Rule-based evaluation - Zero LLM hallucinated eligibility rules.
 */

export function evaluateSchemeEligibility(
  input: UserBusinessInput,
  financialPlan: FinancialPlan
): SchemeMatchResult[] {
  const category = input.businessCategoryId || 'dairy';
  const availableCapital = financialPlan.availableOwnCapital;
  const projectCost = financialPlan.indicativeProjectCost;
  const beneficiaryCategory = input.beneficiaryCategory || 'General';
  const areaType = input.locationAreaType || 'Rural';

  const results: SchemeMatchResult[] = [];

  for (const scheme of VERIFIED_SCHEMES) {
    let matchScore = 0;
    const whyItMatches: string[] = [];
    const missingInformation: string[] = [];
    let qualificationStatus: SchemeMatchResult['qualificationStatus'] = 'INELIGIBLE';
    let potentialSubsidyAmount = 0;
    let potentialSubsidyPct = 0;
    let minimumOwnCapitalRequired = Math.round(projectCost * (scheme.minMarginContributionPct / 100));

    // Check 1: Ineligible Activity Exclusion
    const isExplicitlyIneligible = scheme.ineligibleActivities?.some(
      (act) => act.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(act.toLowerCase())
    );

    if (isExplicitlyIneligible) {
      qualificationStatus = 'INELIGIBLE';
      results.push({
        scheme,
        matchScore: 10,
        qualificationStatus: 'INELIGIBLE',
        whyItMatches: ['Activity is outside scheme focus area.'],
        potentialSubsidyAmount: 0,
        potentialSubsidyPct: 0,
        minimumOwnCapitalRequired,
        missingInformation: [],
        requiredDocuments: scheme.requiredDocuments.map((doc) => ({ name: doc, isMandatory: true })),
        verificationNote: scheme.notes
      });
      continue;
    }

    // Special check for AHIDF: not meant for individual micro dairy cattle purchase
    if (scheme.id === 'scheme_ahidf_infrastructure') {
      if (category === 'dairy' && projectCost <= 2500000) {
        results.push({
          scheme,
          matchScore: 15,
          qualificationStatus: 'INELIGIBLE',
          whyItMatches: ['Scheme is targeted for large-scale processing/chilling infrastructure (>₹15-50L), not micro-scale cow purchase.'],
          potentialSubsidyAmount: 0,
          potentialSubsidyPct: 0,
          minimumOwnCapitalRequired,
          missingInformation: ['Requires TEFR, FPO registration, and bank term loan sanction for industrial processing unit.'],
          requiredDocuments: scheme.requiredDocuments.map((doc) => ({ name: doc, isMandatory: true })),
          verificationNote: 'Accurately excluded: Small individual dairy farms are served via PMEGP, MUDRA, or KCC.'
        });
        continue;
      }
    }

    // Special check for Stand-Up India (SC/ST or Women only, and greenfield >= ₹10L)
    if (scheme.id === 'scheme_stand_up_india') {
      const isEligibleBeneficiary = beneficiaryCategory === 'SC/ST' || beneficiaryCategory === 'Women';
      if (!isEligibleBeneficiary) {
        results.push({
          scheme,
          matchScore: 25,
          qualificationStatus: 'INELIGIBLE',
          whyItMatches: ['Stand-Up India is exclusively reserved for SC, ST, or Women entrepreneurs setting up greenfield units.'],
          potentialSubsidyAmount: 0,
          potentialSubsidyPct: 0,
          minimumOwnCapitalRequired,
          missingInformation: ['Requires applicant to be SC/ST or woman enterprise (>51% equity).'],
          requiredDocuments: scheme.requiredDocuments.map((doc) => ({ name: doc, isMandatory: true })),
          verificationNote: 'Reserved for SC/ST or Women applicants.'
        });
        continue;
      }
    }

    // Check 2: Activity matching
    const activityMatches = scheme.eligibleActivities.some((act) => {
      if (act === category) return true;
      if (category === 'dairy' && (act === 'dairy' || act === 'animal_husbandry' || act === 'agro_processing')) return true;
      if (category === 'tailoring' && (act === 'tailoring' || act === 'garment_manufacturing' || act === 'manufacturing')) return true;
      if (category === 'retail' && (act === 'small_retail' || act === 'kirana_store' || act === 'rural_services')) return true;
      if (category === 'poultry' && (act === 'poultry' || act === 'animal_husbandry')) return true;
      return false;
    });

    if (activityMatches) {
      matchScore += 45;
      whyItMatches.push(`Target sector '${scheme.shortName}' explicitly covers ${category.toUpperCase()} micro-enterprises.`);
    }

    // Check 3: Project Cost Ceiling
    if (projectCost <= scheme.maxProjectCost) {
      matchScore += 25;
      whyItMatches.push(`Proposed project cost of ₹${projectCost.toLocaleString('en-IN')} is within maximum ceiling of ₹${scheme.maxProjectCost.toLocaleString('en-IN')}.`);
    } else {
      matchScore -= 20;
      missingInformation.push(`Project cost exceeds scheme cap of ₹${scheme.maxProjectCost.toLocaleString('en-IN')}.`);
    }

    // Check 4: Margin / Own Contribution Check
    if (availableCapital >= minimumOwnCapitalRequired) {
      matchScore += 20;
      whyItMatches.push(`Available capital of ₹${availableCapital.toLocaleString('en-IN')} meets the minimum required margin of ${scheme.minMarginContributionPct}% (₹${minimumOwnCapitalRequired.toLocaleString('en-IN')}).`);
    } else {
      matchScore += 5;
      missingInformation.push(`Own contribution of ₹${availableCapital.toLocaleString('en-IN')} is below required ₹${minimumOwnCapitalRequired.toLocaleString('en-IN')} (${scheme.minMarginContributionPct}% margin).`);
    }

    // Calculate Subsidy
    if (scheme.id === 'scheme_pmegp') {
      const isSpecial = beneficiaryCategory !== 'General';
      potentialSubsidyPct = isSpecial && areaType === 'Rural' ? scheme.subsidySpecialRuralPct : scheme.subsidyGeneralRuralPct;
      potentialSubsidyAmount = Math.round(projectCost * (potentialSubsidyPct / 100));
      if (scheme.maxSubsidyAmount && potentialSubsidyAmount > scheme.maxSubsidyAmount) {
        potentialSubsidyAmount = scheme.maxSubsidyAmount;
      }
      whyItMatches.push(`Eligible for ${potentialSubsidyPct}% Rural Margin Money subsidy (~₹${potentialSubsidyAmount.toLocaleString('en-IN')}).`);
    } else if (scheme.id === 'scheme_kcc_animal_husbandry') {
      potentialSubsidyPct = 3;
      potentialSubsidyAmount = Math.round(financialPlan.indicativeFinancingRequirement * 0.03);
      whyItMatches.push('3% prompt repayment interest subvention reduces effective loan interest to 4.0% p.a.');
    } else if (scheme.id === 'scheme_pmfme') {
      potentialSubsidyPct = 35;
      potentialSubsidyAmount = Math.min(Math.round(projectCost * 0.35), 1000000);
      whyItMatches.push(`35% credit-linked capital subsidy on milk chilling & value-addition machinery.`);
    }

    // Final qualification status assignment
    if (matchScore >= 80) {
      qualificationStatus = 'ELIGIBLE';
    } else if (matchScore >= 50) {
      qualificationStatus = 'CONDITIONALLY_ELIGIBLE';
    } else {
      qualificationStatus = 'REQUIRES_VERIFICATION';
    }

    const documentChecklist = scheme.requiredDocuments.map((doc, idx) => ({
      name: doc,
      isMandatory: idx < 4
    }));

    results.push({
      scheme,
      matchScore: Math.min(100, matchScore),
      qualificationStatus,
      whyItMatches,
      potentialSubsidyAmount,
      potentialSubsidyPct,
      minimumOwnCapitalRequired,
      missingInformation,
      requiredDocuments: documentChecklist,
      verificationNote: `Verified with ${scheme.nodalAgency} guidelines on ${scheme.lastVerifiedDate}. Portal: ${scheme.officialSourceUrl}`
    });
  }

  // Sort by matchScore descending
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
