import {
  SchemeMatchResult,
  SchemeRule,
  UserBusinessInput,
  FinancialPlan
} from '../types';
import { VERIFIED_SCHEMES } from '../data/schemes';

/**
 * Deterministic Scheme Eligibility & Rule Engine for UDYORA
 * Strict rule-based evaluation - Zero LLM hallucinated eligibility rules.
 */

export function evaluateSchemeEligibility(
  input: UserBusinessInput,
  financialPlan: FinancialPlan
): SchemeMatchResult[] {
  const category = input.businessCategoryId || 'dairy';
  const availableCapital = financialPlan.availableOwnCapital || 100000;
  const projectCost = financialPlan.indicativeProjectCost || 1000000;
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
    const minMarginPct = scheme.minMarginContributionPct || 10;
    const minimumOwnCapitalRequired = Math.round(projectCost * (minMarginPct / 100));

    // Check 1: Ineligible Activity Exclusion
    const isExplicitlyIneligible = scheme.ineligibleActivities?.some(
      (act) => act.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(act.toLowerCase())
    );

    if (isExplicitlyIneligible) {
      results.push({
        scheme,
        matchScore: 10,
        qualificationStatus: 'INELIGIBLE',
        status: 'INELIGIBLE',
        whyItMatches: ['Proposed enterprise activity is outside the scheme mandate.'],
        qualificationReason: 'Activity is excluded under scheme operational guidelines.',
        potentialSubsidyAmount: 0,
        potentialSubsidyPct: 0,
        minimumOwnCapitalRequired,
        missingInformation: ['Activity is outside scope.'],
        requiredDocuments: (scheme.requiredDocuments || []).map((doc) => ({ name: String(doc), isMandatory: true })),
        verificationNote: scheme.notes || 'Ineligible category.'
      });
      continue;
    }

    // Special check for SIH26091 PS Tier I: Micro Finance (<= ₹1.40 Lakh)
    if (scheme.id === 'scheme_sih_micro_finance') {
      if (projectCost <= 140000) {
        matchScore += 60;
        whyItMatches.push(`Project cost of ₹${projectCost.toLocaleString('en-IN')} is within the official SIH26091 PS Micro Finance threshold (<= ₹1.40 Lakh).`);
      } else {
        results.push({
          scheme,
          matchScore: 20,
          qualificationStatus: 'INELIGIBLE',
          status: 'INELIGIBLE',
          whyItMatches: [`Project cost (₹${projectCost.toLocaleString('en-IN')}) exceeds the Micro Finance tier ceiling of ₹1.40 Lakh.`],
          qualificationReason: 'Project size exceeds Micro Finance ceiling. Term Loan facility is recommended.',
          potentialSubsidyAmount: 0,
          potentialSubsidyPct: 0,
          minimumOwnCapitalRequired,
          missingInformation: ['Project exceeds ₹1.40 Lakh micro finance limit.'],
          requiredDocuments: (scheme.requiredDocuments || []).map((doc) => ({ name: String(doc), isMandatory: true })),
          verificationNote: 'SIH26091 PS Tier I Micro Finance limit is <= ₹1.40 Lakh.'
        });
        continue;
      }
    }

    // Special check for SIH26091 PS Tier II: Term Loan (> ₹1.40 Lakh and <= ₹50 Lakh)
    if (scheme.id === 'scheme_sih_term_loan') {
      if (projectCost > 140000 && projectCost <= 5000000) {
        matchScore += 60;
        whyItMatches.push(`Project cost of ₹${projectCost.toLocaleString('en-IN')} matches the official SIH26091 PS Term Loan tier (> ₹1.40 Lakh to ₹50 Lakh).`);
      } else if (projectCost <= 140000) {
        matchScore += 30;
        whyItMatches.push(`Project cost of ₹${projectCost.toLocaleString('en-IN')} is below ₹1.40 Lakh; Micro Finance scheme is preferred.`);
      }
    }

    // Special check for AHIDF: Not meant for individual micro cow purchases
    if (scheme.id === 'scheme_ahidf_infrastructure') {
      if (category === 'dairy' && projectCost <= 2500000) {
        results.push({
          scheme,
          matchScore: 15,
          qualificationStatus: 'INELIGIBLE',
          status: 'INELIGIBLE',
          whyItMatches: ['AHIDF is targeted for industrial processing and chilling infrastructure (>₹15-50L), not micro-scale unit establishment.'],
          qualificationReason: 'Exclusively for commercial processing infrastructure; micro-enterprises are served via PMEGP, MUDRA, or KCC.',
          potentialSubsidyAmount: 0,
          potentialSubsidyPct: 0,
          minimumOwnCapitalRequired,
          missingInformation: ['Requires TEFR, FPO registration, and industrial processing bank sanction.'],
          requiredDocuments: (scheme.requiredDocuments || []).map((doc) => ({ name: String(doc), isMandatory: true })),
          verificationNote: 'Accurately excluded for micro enterprise.'
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
          status: 'INELIGIBLE',
          whyItMatches: ['Stand-Up India is exclusively reserved for SC, ST, or Women entrepreneurs setting up greenfield units.'],
          qualificationReason: 'Reserved for SC/ST or Women applicants.',
          potentialSubsidyAmount: 0,
          potentialSubsidyPct: 0,
          minimumOwnCapitalRequired,
          missingInformation: ['Requires applicant to be SC/ST or woman enterprise (>51% equity).'],
          requiredDocuments: (scheme.requiredDocuments || []).map((doc) => ({ name: String(doc), isMandatory: true })),
          verificationNote: 'Reserved for SC/ST or Women applicants.'
        });
        continue;
      }
    }

    // Check 2: Activity matching
    const activityMatches = scheme.eligibleActivities.some((act) => {
      if (act === category) return true;
      if (category === 'dairy' && (act === 'dairy' || act === 'animal_husbandry' || act === 'agro_processing' || act === 'manufacturing')) return true;
      if (category === 'tailoring' && (act === 'tailoring' || act === 'garment_manufacturing' || act === 'manufacturing' || act === 'services')) return true;
      if (category === 'retail' && (act === 'small_retail' || act === 'kirana_store' || act === 'rural_services' || act === 'services')) return true;
      if (category === 'poultry' && (act === 'poultry' || act === 'animal_husbandry' || act === 'manufacturing')) return true;
      if (category === 'custom') return true;
      return false;
    });

    if (activityMatches && scheme.id !== 'scheme_sih_micro_finance' && scheme.id !== 'scheme_sih_term_loan') {
      matchScore += 45;
      whyItMatches.push(`Target sector '${scheme.shortName}' explicitly covers ${category.toUpperCase()} micro-enterprises.`);
    }

    // Check 3: Project Cost Ceiling
    if (projectCost <= scheme.maxProjectCost) {
      if (scheme.id !== 'scheme_sih_micro_finance' && scheme.id !== 'scheme_sih_term_loan') {
        matchScore += 25;
      }
      whyItMatches.push(`Proposed project cost of ₹${projectCost.toLocaleString('en-IN')} is within maximum ceiling of ₹${scheme.maxProjectCost.toLocaleString('en-IN')}.`);
    } else {
      matchScore -= 20;
      missingInformation.push(`Project cost exceeds scheme cap of ₹${scheme.maxProjectCost.toLocaleString('en-IN')}.`);
    }

    // Check 4: Margin / Own Contribution Check
    if (availableCapital >= minimumOwnCapitalRequired) {
      matchScore += 20;
      whyItMatches.push(`Available capital of ₹${availableCapital.toLocaleString('en-IN')} meets the minimum required margin of ${minMarginPct}% (₹${minimumOwnCapitalRequired.toLocaleString('en-IN')}).`);
    } else {
      matchScore += 5;
      missingInformation.push(`Own contribution of ₹${availableCapital.toLocaleString('en-IN')} is below required ₹${minimumOwnCapitalRequired.toLocaleString('en-IN')} (${minMarginPct}% margin).`);
    }

    // Calculate Subsidy
    if (scheme.id === 'scheme_pmegp' || scheme.id === 'scheme_sih_term_loan') {
      const isSpecial = beneficiaryCategory !== 'General';
      potentialSubsidyPct = isSpecial && areaType === 'Rural' ? (scheme.subsidySpecialRuralPct || 35) : (scheme.subsidyGeneralRuralPct || 25);
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
      whyItMatches.push(`35% credit-linked capital subsidy on processing & value-addition machinery.`);
    }

    // Final qualification status assignment
    if (matchScore >= 75) {
      qualificationStatus = 'ELIGIBLE';
    } else if (matchScore >= 45) {
      qualificationStatus = 'CONDITIONALLY_ELIGIBLE';
    } else {
      qualificationStatus = 'REQUIRES_VERIFICATION';
    }

    const documentChecklist = (scheme.requiredDocuments || []).map((doc, idx) => ({
      name: String(doc),
      isMandatory: idx < 4
    }));

    const qualificationReason = whyItMatches.join(' ');

    results.push({
      scheme,
      matchScore: Math.min(100, Math.max(0, matchScore)),
      qualificationStatus,
      status: qualificationStatus,
      whyItMatches,
      qualificationReason,
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
