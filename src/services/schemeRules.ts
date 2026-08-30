import {
  SchemeMatchResult,
  SchemeRule,
  SchemeEligibilityItem,
  SchemeApplicationStep,
  SchemeDocumentItem,
  UserBusinessInput,
  FinancialPlan
} from '../types';
import { VERIFIED_SCHEMES } from '../data/schemes';

/**
 * Deterministic Reducing-Balance EMI Calculator
 */
function calculateStandardEmi(principal: number, annualInterestRatePct: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  const monthlyRate = annualInterestRatePct / 12 / 100;
  if (monthlyRate === 0) return Math.round(principal / tenureMonths);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}

/**
 * Generates 7-step standardized application roadmap for a verified government scheme
 */
function generateSchemeApplicationSteps(scheme: SchemeRule): SchemeApplicationStep[] {
  const portalName = scheme.shortName.includes('PMEGP')
    ? 'e-Portal (kviconline.gov.in/pmegpeportal)'
    : scheme.shortName.includes('Mudra')
    ? 'Udyami Mitra Portal / Jan Samarth Portal'
    : scheme.shortName.includes('KCC')
    ? 'Designated District Bank Branch / CSC'
    : scheme.shortName.includes('PMFME')
    ? 'PMFME National Portal (pmfme.mofpi.gov.in)'
    : 'National Portal / Jan Samarth';

  return [
    {
      stepNumber: 1,
      title: 'Check Eligibility & Activity Fit',
      whatToDo: `Verify that your proposed micro-enterprise activity is eligible and your project cost is within the ₹${(scheme.maxProjectCost / 100000).toFixed(0)} Lakh cap.`,
      whatIsNeeded: 'Basic enterprise details, location category (Rural/Urban), and self-declared social category.',
      whoHandlesIt: 'Applicant / Entrepreneur Self-Check',
      whatComesNext: 'Prepare mandatory identity, address, and project documentation.'
    },
    {
      stepNumber: 2,
      title: 'Prepare Project Report & KYC Documents',
      whatToDo: 'Compile KYC documents, residence proof, bank passbook, and a Detailed Project Report (DPR) with equipment cost estimates.',
      whatIsNeeded: 'Aadhaar, PAN, 6-month bank statement, DPR, and quotes for machinery/livestock.',
      whoHandlesIt: 'Applicant / Local Common Service Centre (CSC)',
      whatComesNext: 'Access official nodal agency application channel.'
    },
    {
      stepNumber: 3,
      title: 'Identify Application Channel',
      whatToDo: `Submit through the official ${portalName} or visit the nodal bank branch.`,
      whatIsNeeded: 'Active mobile number linked to Aadhaar for OTP authentication.',
      whoHandlesIt: `Applicant via ${scheme.nodalAgency}`,
      whatComesNext: 'Online application submission and generation of unique Application ID.'
    },
    {
      stepNumber: 4,
      title: 'Submit Application & Document Upload',
      whatToDo: 'Fill online application form, select financing bank branch, and upload self-attested documents.',
      whatIsNeeded: 'Digital scanned copies of KYC, DPR, and quotation.',
      whoHandlesIt: 'Nodal Agency District Office (e.g. DIC / KVIC / Lead Bank)',
      whatComesNext: 'Initial document scrutiny and physical/field verification.'
    },
    {
      stepNumber: 5,
      title: 'Verification & Field Appraisal',
      whatToDo: 'District Task Force Committee (DTFC) or bank field officer reviews proposal and inspects site location.',
      whatIsNeeded: 'Physical presence of applicant and access to business premises/land proof.',
      whoHandlesIt: 'Bank Field Officer / District Task Force Inspector',
      whatComesNext: 'Recommendation for formal loan sanction.'
    },
    {
      stepNumber: 6,
      title: 'Credit Appraisal & Formal Sanction',
      whatToDo: 'Financing bank conducts credit appraisal, checks CIBIL score, approves loan, and issues In-Principle Sanction Letter.',
      whatIsNeeded: 'Bank account opening, margin money deposit, and loan agreement execution.',
      whoHandlesIt: 'Financing Scheduled Commercial Bank Branch Manager',
      whatComesNext: 'Deposit of promoter own contribution and fund disbursement.'
    },
    {
      stepNumber: 7,
      title: 'Disbursement & Margin Money Lock-in',
      whatToDo: 'Bank releases loan funds directly to equipment/asset suppliers. Government credit-linked subsidy is credited to subsidy reserve fund (3-year lock-in).',
      whatIsNeeded: 'Supplier tax invoices, asset inspection report, and insurance certificate.',
      whoHandlesIt: 'Financing Bank & Nodal Agency Subsidy Cell',
      whatComesNext: 'Commence business operations and prompt monthly EMI repayment.'
    }
  ];
}

/**
 * Builds categorized document list with Required, Optional, and Conditional badges
 */
function buildCategorizedDocuments(scheme: SchemeRule): SchemeDocumentItem[] {
  const docs: SchemeDocumentItem[] = [];

  // Standard Required Documents
  docs.push({
    name: 'Aadhaar Card of Applicant (Identity & Address Proof)',
    type: 'REQUIRED',
    status: 'READY',
    verificationStatus: 'VERIFIED'
  });

  docs.push({
    name: 'PAN Card / Form 60',
    type: 'REQUIRED',
    status: 'READY',
    verificationStatus: 'VERIFIED'
  });

  docs.push({
    name: 'Bank Account Passbook / Statement (Last 6 months)',
    type: 'REQUIRED',
    status: 'READY',
    verificationStatus: 'VERIFIED'
  });

  docs.push({
    name: 'Detailed Project Report (DPR) with Cost Estimates & Quotations',
    type: 'REQUIRED',
    status: 'READY',
    verificationStatus: 'VERIFIED'
  });

  // Conditional Documents
  if (scheme.id === 'scheme_pmegp' || scheme.id === 'scheme_sih_term_loan') {
    docs.push({
      name: 'Special Social Category / Caste Certificate (SC/ST/OBC/Women/Minority)',
      type: 'CONDITIONAL',
      conditionNote: 'Mandatory only if claiming enhanced 35% Special Category Rural Subsidy.',
      status: 'MISSING',
      verificationStatus: 'REQUIRES_VERIFICATION'
    });

    docs.push({
      name: 'Educational Qualification Certificate (8th Pass Certificate)',
      type: 'CONDITIONAL',
      conditionNote: 'Required if total project cost exceeds ₹10 Lakhs in manufacturing or ₹5 Lakhs in service.',
      status: 'READY',
      verificationStatus: 'VERIFIED'
    });
  }

  if (scheme.id === 'scheme_kcc_animal_husbandry') {
    docs.push({
      name: 'Livestock Health & Vaccination Certificate from Veterinary Officer',
      type: 'REQUIRED',
      conditionNote: 'Required for tagging verification of milch animals.',
      status: 'MISSING',
      verificationStatus: 'REQUIRES_VERIFICATION'
    });

    docs.push({
      name: 'Land Record (7/12 extract or village tenant agreement / NOC)',
      type: 'CONDITIONAL',
      conditionNote: 'Required for fodder cultivation proof or cattle shed premises.',
      status: 'READY',
      verificationStatus: 'VERIFIED'
    });
  }

  if (scheme.id === 'scheme_pmfme') {
    docs.push({
      name: 'FSSAI Basic Hygiene Registration / Food Safety Declaration',
      type: 'REQUIRED',
      status: 'MISSING',
      verificationStatus: 'REQUIRES_VERIFICATION'
    });
  }

  // Optional Documents
  docs.push({
    name: 'Udyam MSME Registration Certificate (udyamregistration.gov.in)',
    type: 'OPTIONAL',
    conditionNote: 'Recommended for priority sector lending fast-track processing.',
    status: 'READY',
    verificationStatus: 'VERIFIED'
  });

  docs.push({
    name: 'Gram Panchayat No Objection Certificate (NOC) / Premises Agreement',
    type: 'OPTIONAL',
    conditionNote: 'Helpful for swift field inspection clearance.',
    status: 'READY',
    verificationStatus: 'VERIFIED'
  });

  return docs;
}

/**
 * Deterministic Scheme Eligibility & Rule Engine for UDYORA
 * Strict rule-based evaluation - Zero LLM hallucinated eligibility rules.
 */
export function evaluateSchemeEligibility(
  input: UserBusinessInput,
  financialPlan: FinancialPlan
): SchemeMatchResult[] {
  const category = (input.businessCategoryId || 'dairy').toLowerCase();
  const availableCapital = financialPlan.availableOwnCapital || input.availableCapital || 100000;
  const projectCost = financialPlan.indicativeProjectCost || 1000000;
  const beneficiaryCategory = input.beneficiaryCategory || 'General';
  const areaType = input.locationAreaType || 'Rural';

  const results: SchemeMatchResult[] = [];

  for (const scheme of VERIFIED_SCHEMES) {
    let matchScore = 0;
    const whyItMatches: string[] = [];
    const missingInformation: string[] = [];
    const eligibilityMatrix: SchemeEligibilityItem[] = [];
    let qualificationStatus: SchemeMatchResult['qualificationStatus'] = 'INELIGIBLE';
    let potentialSubsidyAmount = 0;
    let potentialSubsidyPct = 0;
    const minMarginPct = scheme.minMarginContributionPct || 10;
    const minimumOwnCapitalRequired = Math.round(projectCost * (minMarginPct / 100));

    // PS-based Indicative Financing Capacity calculation:
    // Capacity under configured margin contribution rule:
    const theoreticalProjectCapacity = Math.round(availableCapital / (minMarginPct / 100));
    const indicativeFinancingCapacity = Math.min(
      scheme.maxProjectCost,
      Math.max(0, theoreticalProjectCapacity - availableCapital)
    );

    const recommendedProjectCost = projectCost;
    const indicativeFinancingRequirement = Math.max(0, recommendedProjectCost - availableCapital);

    // Deterministic EMI estimation (84 months or scheme max, 9.5% p.a. standard representative rate)
    const tenureMonths = scheme.maxTenureMonths || 60;
    const estimatedEmi = calculateStandardEmi(indicativeFinancingRequirement, 9.5, tenureMonths);

    // 1. Eligibility Check: Activity Fit
    const isExplicitlyIneligible = scheme.ineligibleActivities?.some(
      (act) => act.toLowerCase().includes(category) || category.includes(act.toLowerCase())
    );

    const activityMatches = !isExplicitlyIneligible && scheme.eligibleActivities.some((act) => {
      if (act === category) return true;
      if (category === 'dairy' && (act === 'dairy' || act === 'animal_husbandry' || act === 'agro_processing' || act === 'manufacturing')) return true;
      if (category === 'tailoring' && (act === 'tailoring' || act === 'garment_manufacturing' || act === 'manufacturing' || act === 'services')) return true;
      if (category === 'retail' && (act === 'small_retail' || act === 'kirana_store' || act === 'rural_services' || act === 'services')) return true;
      if (category === 'poultry' && (act === 'poultry' || act === 'animal_husbandry' || act === 'manufacturing')) return true;
      if (category === 'custom') return true;
      return false;
    });

    eligibilityMatrix.push({
      criterion: 'Eligible Enterprise Sector',
      requirement: scheme.eligibleActivities.join(', '),
      userValue: category.toUpperCase(),
      status: activityMatches ? 'ELIGIBLE' : 'NOT_ELIGIBLE',
      note: activityMatches ? 'Activity is covered under scheme guidelines.' : 'Activity excluded under scheme operational scope.'
    });

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
        indicativeFinancingCapacity,
        recommendedProjectCost,
        indicativeFinancingRequirement,
        estimatedEmi,
        financialGuidanceNote: `Activity (${category.toUpperCase()}) is not covered under ${scheme.shortName}.`,
        missingInformation: ['Activity is outside scope.'],
        requiredDocuments: (scheme.requiredDocuments || []).map((doc) => ({ name: String(doc), isMandatory: true })),
        documentItems: buildCategorizedDocuments(scheme),
        eligibilityMatrix,
        applicationSteps: generateSchemeApplicationSteps(scheme),
        verificationNote: scheme.notes || 'Ineligible category.'
      });
      continue;
    }

    // 2. Special check for SIH26091 PS Tier I: Micro Finance (<= ₹1.40 Lakh)
    if (scheme.id === 'scheme_sih_micro_finance') {
      if (projectCost <= 140000) {
        matchScore += 60;
        whyItMatches.push(`Project cost of ₹${projectCost.toLocaleString('en-IN')} is within the official SIH26091 PS Micro Finance threshold (<= ₹1.40 Lakh).`);
        eligibilityMatrix.push({
          criterion: 'Project Cost Ceiling',
          requirement: '<= ₹1.40 Lakh',
          userValue: `₹${(projectCost / 100000).toFixed(2)} Lakh`,
          status: 'ELIGIBLE'
        });
      } else {
        eligibilityMatrix.push({
          criterion: 'Project Cost Ceiling',
          requirement: '<= ₹1.40 Lakh',
          userValue: `₹${(projectCost / 100000).toFixed(2)} Lakh`,
          status: 'NOT_ELIGIBLE',
          note: 'Project size exceeds Micro Finance ceiling. Term Loan tier (> ₹1.40L) is recommended.'
        });

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
          indicativeFinancingCapacity,
          recommendedProjectCost,
          indicativeFinancingRequirement,
          estimatedEmi,
          financialGuidanceNote: 'Project size exceeds Micro Finance ceiling of ₹1.40 Lakh.',
          missingInformation: ['Project exceeds ₹1.40 Lakh micro finance limit.'],
          requiredDocuments: (scheme.requiredDocuments || []).map((doc) => ({ name: String(doc), isMandatory: true })),
          documentItems: buildCategorizedDocuments(scheme),
          eligibilityMatrix,
          applicationSteps: generateSchemeApplicationSteps(scheme),
          verificationNote: 'SIH26091 PS Tier I Micro Finance limit is <= ₹1.40 Lakh.'
        });
        continue;
      }
    }

    // 3. Special check for SIH26091 PS Tier II: Term Loan (> ₹1.40 Lakh and <= ₹50 Lakh)
    if (scheme.id === 'scheme_sih_term_loan') {
      if (projectCost > 140000 && projectCost <= 5000000) {
        matchScore += 60;
        whyItMatches.push(`Project cost of ₹${projectCost.toLocaleString('en-IN')} matches the official SIH26091 PS Term Loan tier (> ₹1.40 Lakh to ₹50 Lakh).`);
        eligibilityMatrix.push({
          criterion: 'Project Cost Ceiling',
          requirement: '> ₹1.40 Lakh to ₹50 Lakh',
          userValue: `₹${(projectCost / 100000).toFixed(2)} Lakh`,
          status: 'ELIGIBLE'
        });
      } else if (projectCost <= 140000) {
        matchScore += 30;
        whyItMatches.push(`Project cost of ₹${projectCost.toLocaleString('en-IN')} is below ₹1.40 Lakh; Micro Finance scheme is preferred.`);
        eligibilityMatrix.push({
          criterion: 'Project Cost Ceiling',
          requirement: '> ₹1.40 Lakh to ₹50 Lakh',
          userValue: `₹${(projectCost / 100000).toFixed(2)} Lakh`,
          status: 'REQUIRES_VERIFICATION',
          note: 'Project is eligible for micro finance tier.'
        });
      }
    }

    // 4. Special check for AHIDF: Not meant for individual micro cow purchases
    if (scheme.id === 'scheme_ahidf_infrastructure') {
      if (category === 'dairy' && projectCost <= 2500000) {
        eligibilityMatrix.push({
          criterion: 'Infrastructure Scale Requirement',
          requirement: 'Commercial dairy processing / cold chain plant (> ₹25 Lakhs)',
          userValue: `₹${(projectCost / 100000).toFixed(2)} Lakh`,
          status: 'NOT_ELIGIBLE',
          note: 'AHIDF is reserved for industrial processing plants and cold chain infrastructure, not micro cow units.'
        });

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
          indicativeFinancingCapacity,
          recommendedProjectCost,
          indicativeFinancingRequirement,
          estimatedEmi,
          financialGuidanceNote: 'AHIDF is exclusively for industrial infrastructure plants.',
          missingInformation: ['Requires TEFR, FPO registration, and industrial processing bank sanction.'],
          requiredDocuments: (scheme.requiredDocuments || []).map((doc) => ({ name: String(doc), isMandatory: true })),
          documentItems: buildCategorizedDocuments(scheme),
          eligibilityMatrix,
          applicationSteps: generateSchemeApplicationSteps(scheme),
          verificationNote: 'Accurately excluded for micro enterprise.'
        });
        continue;
      }
    }

    // 5. Special check for Stand-Up India (SC/ST or Women only)
    if (scheme.id === 'scheme_stand_up_india') {
      const isEligibleBeneficiary = beneficiaryCategory === 'SC/ST' || beneficiaryCategory === 'Women';
      eligibilityMatrix.push({
        criterion: 'Target Beneficiary Reservation',
        requirement: 'SC, ST, or Women Entrepreneur (>51% equity)',
        userValue: beneficiaryCategory,
        status: isEligibleBeneficiary ? 'ELIGIBLE' : 'NOT_ELIGIBLE',
        note: isEligibleBeneficiary ? 'Applicant meets reservation mandate.' : 'Reserved exclusively for SC/ST or Women applicants.'
      });

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
          indicativeFinancingCapacity,
          recommendedProjectCost,
          indicativeFinancingRequirement,
          estimatedEmi,
          financialGuidanceNote: 'Reserved for SC/ST or Women entrepreneurs.',
          missingInformation: ['Requires applicant to be SC/ST or woman enterprise (>51% equity).'],
          requiredDocuments: (scheme.requiredDocuments || []).map((doc) => ({ name: String(doc), isMandatory: true })),
          documentItems: buildCategorizedDocuments(scheme),
          eligibilityMatrix,
          applicationSteps: generateSchemeApplicationSteps(scheme),
          verificationNote: 'Reserved for SC/ST or Women applicants.'
        });
        continue;
      }
    }

    if (activityMatches && scheme.id !== 'scheme_sih_micro_finance' && scheme.id !== 'scheme_sih_term_loan') {
      matchScore += 45;
      whyItMatches.push(`Target sector '${scheme.shortName}' explicitly covers ${category.toUpperCase()} micro-enterprises.`);
    }

    // Check: Project Cost Ceiling
    if (projectCost <= scheme.maxProjectCost) {
      if (scheme.id !== 'scheme_sih_micro_finance' && scheme.id !== 'scheme_sih_term_loan') {
        matchScore += 25;
      }
      whyItMatches.push(`Proposed project cost of ₹${projectCost.toLocaleString('en-IN')} is within maximum ceiling of ₹${scheme.maxProjectCost.toLocaleString('en-IN')}.`);
      eligibilityMatrix.push({
        criterion: 'Project Cost Ceiling',
        requirement: `<= ₹${(scheme.maxProjectCost / 100000).toFixed(0)} Lakhs`,
        userValue: `₹${(projectCost / 100000).toFixed(2)} Lakhs`,
        status: 'ELIGIBLE'
      });
    } else {
      matchScore -= 20;
      missingInformation.push(`Project cost exceeds scheme cap of ₹${scheme.maxProjectCost.toLocaleString('en-IN')}.`);
      eligibilityMatrix.push({
        criterion: 'Project Cost Ceiling',
        requirement: `<= ₹${(scheme.maxProjectCost / 100000).toFixed(0)} Lakhs`,
        userValue: `₹${(projectCost / 100000).toFixed(2)} Lakhs`,
        status: 'NOT_ELIGIBLE',
        note: 'Project cost exceeds maximum eligible loan ceiling.'
      });
    }

    // Check: Margin / Own Contribution Check
    if (availableCapital >= minimumOwnCapitalRequired) {
      matchScore += 20;
      whyItMatches.push(`Available capital of ₹${availableCapital.toLocaleString('en-IN')} meets the minimum required margin of ${minMarginPct}% (₹${minimumOwnCapitalRequired.toLocaleString('en-IN')}).`);
      eligibilityMatrix.push({
        criterion: 'Minimum Own Contribution Margin',
        requirement: `>= ${minMarginPct}% (₹${minimumOwnCapitalRequired.toLocaleString('en-IN')})`,
        userValue: `₹${availableCapital.toLocaleString('en-IN')} (${((availableCapital / Math.max(1, projectCost)) * 100).toFixed(1)}%)`,
        status: 'ELIGIBLE'
      });
    } else {
      matchScore += 5;
      missingInformation.push(`Own contribution of ₹${availableCapital.toLocaleString('en-IN')} is below required ₹${minimumOwnCapitalRequired.toLocaleString('en-IN')} (${minMarginPct}% margin).`);
      eligibilityMatrix.push({
        criterion: 'Minimum Own Contribution Margin',
        requirement: `>= ${minMarginPct}% (₹${minimumOwnCapitalRequired.toLocaleString('en-IN')})`,
        userValue: `₹${availableCapital.toLocaleString('en-IN')} (${((availableCapital / Math.max(1, projectCost)) * 100).toFixed(1)}%)`,
        status: 'REQUIRES_VERIFICATION',
        note: 'Promoter equity shortfall may require bridging through state convergence or family savings.'
      });
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
      eligibilityMatrix.push({
        criterion: 'Location Area Classification',
        requirement: 'Rural / Semi-Urban / Urban',
        userValue: areaType,
        status: 'ELIGIBLE',
        note: `Rural location qualifies for higher ${potentialSubsidyPct}% Margin Money subsidy.`
      });
    } else if (scheme.id === 'scheme_kcc_animal_husbandry') {
      potentialSubsidyPct = 3;
      potentialSubsidyAmount = Math.round(indicativeFinancingRequirement * 0.03);
      whyItMatches.push('3% prompt repayment interest subvention reduces effective loan interest to 4.0% p.a.');
    } else if (scheme.id === 'scheme_pmfme') {
      potentialSubsidyPct = 35;
      potentialSubsidyAmount = Math.min(Math.round(projectCost * 0.35), 1000000);
      whyItMatches.push('35% credit-linked capital subsidy on processing & value-addition machinery.');
    }

    // Final qualification status assignment
    if (!activityMatches) {
      qualificationStatus = 'INELIGIBLE';
      matchScore = Math.min(matchScore, 20);
    } else if (matchScore >= 75) {
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
    const financialGuidanceNote = `Based on your available own capital of ₹${availableCapital.toLocaleString('en-IN')}, your indicative financing capacity under the ${minMarginPct}% contribution rule is ₹${indicativeFinancingCapacity.toLocaleString('en-IN')}. Your business-plan project cost of ₹${projectCost.toLocaleString('en-IN')} should be validated separately against actual local equipment quotes and working-capital cycles.`;

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
      indicativeFinancingCapacity,
      recommendedProjectCost,
      indicativeFinancingRequirement,
      estimatedEmi,
      financialGuidanceNote,
      missingInformation,
      requiredDocuments: documentChecklist,
      documentItems: buildCategorizedDocuments(scheme),
      eligibilityMatrix,
      applicationSteps: generateSchemeApplicationSteps(scheme),
      verificationNote: `Verified with ${scheme.nodalAgency} operational guidelines on ${scheme.lastVerifiedDate}. Portal: ${scheme.officialSourceUrl}`
    });
  }

  // Sort by matchScore descending
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
