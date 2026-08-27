import {
  UserContext,
  FinancialPlan,
  GovernmentSchemeMatch
} from '../types';

export const schemeAgent = {
  async execute(
    userContext: UserContext,
    financialPlan: FinancialPlan
  ): Promise<GovernmentSchemeMatch[]> {
    const { businessProfile, locationContext } = userContext;
    const cat = businessProfile.businessCategory;
    const projectCost = financialPlan.indicativeProjectCost;
    const isRural = locationContext.areaType === 'Rural';

    const matches: GovernmentSchemeMatch[] = [];

    // 1. PMEGP (Prime Minister's Employment Generation Programme)
    const pmegpSubsidyPct = isRural ? 35 : 25; // 35% rural special / 25% urban
    const pmegpSubsidyAmt = Math.round(projectCost * (pmegpSubsidyPct / 100));

    matches.push({
      schemeId: 'pmegp_mord',
      schemeName: "Prime Minister's Employment Generation Programme (PMEGP)",
      ministryAgency: 'Ministry of Micro, Small and Medium Enterprises (MSME) & KVIC',
      matchStatus: 'MATCHED',
      subsidyPercentage: pmegpSubsidyPct,
      estimatedSubsidyAmount: Math.min(1000000, pmegpSubsidyAmt),
      eligibleLoanComponent: Math.round(projectCost * 0.95),
      marginRequirement: 5,
      keyBenefits: [
        `${pmegpSubsidyPct}% back-ended capital subsidy on project cost in rural areas`,
        'No collateral security required for projects up to ₹10 Lakhs (CGTMSE coverage)',
        '3-year lock-in period after which subsidy adjusts against term loan'
      ],
      eligibilityCriteria: [
        'Individual above 18 years of age',
        'Minimum 8th standard pass for manufacturing projects above ₹10L / service above ₹5L',
        'New micro enterprise creation'
      ],
      requiredDocuments: [
        'Aadhaar Card & PAN Card',
        'Detailed Project Report (DPR)',
        'Educational qualification certificate (8th/10th mark sheet)',
        'Rural Area Certificate from Gram Panchayat / Mandal Revenue Officer (MRO)',
        'Bank Account passbook & passport size photograph'
      ],
      officialPortalUrl: 'https://www.kviconline.gov.in/pmegpeportal',
      verificationStatus: 'VERIFIED OFFICIAL SCHEME'
    });

    // 2. Pradhan Mantri MUDRA Yojana (PMMY)
    const mudraCategory = projectCost <= 500000 ? 'Kishore' : 'Tarun';
    matches.push({
      schemeId: 'pmmy_mudra',
      schemeName: `Pradhan Mantri MUDRA Yojana (PMMY) - ${mudraCategory} Loan`,
      ministryAgency: 'Department of Financial Services, Ministry of Finance',
      matchStatus: 'MATCHED',
      subsidyPercentage: 0,
      estimatedSubsidyAmount: 0,
      eligibleLoanComponent: Math.min(1000000, financialPlan.termLoanAmount),
      marginRequirement: 10,
      keyBenefits: [
        'Collateral-free institutional loan from Public Sector Banks, RRBs, and Small Finance Banks',
        'Competitive interest rate (8.5% - 10.5% p.a.) under priority sector lending',
        'MUDRA Debit Card provided for immediate working capital withdrawals'
      ],
      eligibilityCriteria: [
        'Indian citizen with viable non-farm business idea',
        'No past loan defaults in credit bureau (CIBIL / Experian)'
      ],
      requiredDocuments: [
        'MUDRA Application Form with 2 passport photos',
        'KYC Documents (Voter ID / Aadhaar / PAN)',
        'Proof of Business Address / Locality registration',
        'Quotations for machinery / livestock / store inventory'
      ],
      officialPortalUrl: 'https://www.mudra.org.in',
      verificationStatus: 'VERIFIED OFFICIAL SCHEME'
    });

    // 3. Sector Specific Schemes (Dairy / Agro / Retail)
    if (cat === 'Dairy') {
      matches.push({
        schemeId: 'ahidf_dairy',
        schemeName: 'Animal Husbandry Infrastructure Development Fund (AHIDF) & NABARD DEDS',
        ministryAgency: 'Ministry of Fisheries, Animal Husbandry and Dairying',
        matchStatus: 'MATCHED',
        subsidyPercentage: 25,
        estimatedSubsidyAmount: Math.round(projectCost * 0.25),
        eligibleLoanComponent: Math.round(projectCost * 0.75),
        marginRequirement: 10,
        keyBenefits: [
          '3% interest subvention for scheduled commercial bank loans',
          'Credit guarantee cover up to 25% of the total loan amount via NABSanrakshan',
          'Subsidy for milch animal purchase, cattle shed construction, and mini chilling units'
        ],
        eligibilityCriteria: [
          'Individual dairy farmers, SHGs, and Micro Dairy Entrepreneurs',
          'Availability of minimum 0.5 acre land for fodder / cattle shed'
        ],
        requiredDocuments: [
          'Land possession certificate / lease agreement',
          'Veterinary health fitness certificate for animals',
          'Milk cooperative society tie-up letter / passbook'
        ],
        officialPortalUrl: 'https://ahidf.udyamimitra.in',
        verificationStatus: 'VERIFIED OFFICIAL SCHEME'
      });
    } else if (cat === 'Agro-processing') {
      matches.push({
        schemeId: 'pmfme_scheme',
        schemeName: 'PM Formalisation of Micro food processing Enterprises (PMFME)',
        ministryAgency: 'Ministry of Food Processing Industries (MoFPI)',
        matchStatus: 'MATCHED',
        subsidyPercentage: 35,
        estimatedSubsidyAmount: Math.min(1000000, Math.round(projectCost * 0.35)),
        eligibleLoanComponent: Math.round(projectCost * 0.9),
        marginRequirement: 10,
        keyBenefits: [
          '35% credit-linked capital subsidy up to maximum of ₹10 Lakhs',
          'Handholding support for FSSAI food safety license and branding',
          'Technical training support via NIFTEM'
        ],
        eligibilityCriteria: [
          'Existing or new individual micro food processing enterprise'
        ],
        requiredDocuments: [
          'Project DPR for food processing machinery',
          'FSSAI registration application',
          'Bank statement of past 6 months'
        ],
        officialPortalUrl: 'https://pmfme.mofpi.gov.in',
        verificationStatus: 'VERIFIED OFFICIAL SCHEME'
      });
    }

    return matches;
  }
};
