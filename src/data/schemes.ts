import { SchemeRule } from '../types';

export const VERIFIED_SCHEMES: SchemeRule[] = [
  {
    id: 'scheme_pmegp',
    code: 'PMEGP',
    name: "Prime Minister's Employment Generation Programme",
    shortName: 'PMEGP Scheme',
    nodalAgency: 'Khadi and Village Industries Commission (KVIC) / Ministry of MSME',
    category: 'Central',
    targetBeneficiaries: ['General', 'SC/ST', 'OBC', 'Women', 'Minority', 'Ex-Servicemen', 'Differently-Abled'],
    eligibleActivities: [
      'dairy',
      'agro_processing',
      'tailoring',
      'garment_manufacturing',
      'small_retail',
      'rural_service_centres',
      'poultry_processing',
      'food_products'
    ],
    ineligibleActivities: ['speculative_trade', 'direct_crop_farming_land_purchase'],
    minMarginContributionPct: 10, // 10% for General; 5% for Special Categories in Rural Areas
    maxProjectCost: 5000000, // ₹50 Lakhs for Manufacturing; ₹20 Lakhs for Service/Business
    interestRateRange: '8.50% - 10.75% per annum (linked to Bank Repo/MCLR)',
    subsidyGeneralRuralPct: 25, // 25% subsidy in rural areas for General Category
    subsidySpecialRuralPct: 35, // 35% subsidy in rural areas for SC/ST/OBC/Women/Minority
    maxSubsidyAmount: 1250000,
    maxTenureMonths: 84, // 3 to 7 years
    moratoriumMonths: 6,
    requiredDocuments: [
      'Aadhaar Card of Applicant',
      'PAN Card / Form 60',
      'Rural Area Certificate / Gram Panchayat Residence Certificate',
      'Detailed Project Report (DPR) with Cost Estimates',
      'Educational Qualification Certificate (8th Pass certificate if project cost > ₹10 Lakhs in manufacturing or > ₹5 Lakhs in service)',
      'Bank Account Passbook / Statement (Last 6 months)',
      'Caste / Category Certificate (if claiming 35% special category subsidy)',
      'Land/Premises Lease Agreement or Proof of Ownership'
    ],
    officialSourceUrl: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',
    lastVerifiedDate: '2026-01-15',
    verificationStatus: 'VERIFIED',
    notes: 'Credit-linked subsidy programme. Lock-in period of 3 years on subsidy before adjustment against term loan.'
  },
  {
    id: 'scheme_mudra_tarun_kishore',
    code: 'PMMY_MUDRA',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY) - Kishore & Tarun Categories',
    shortName: 'Mudra Loan (Kishore / Tarun)',
    nodalAgency: 'Micro Units Development & Refinance Agency (MUDRA) / Department of Financial Services',
    category: 'Central',
    targetBeneficiaries: ['General', 'SC/ST', 'OBC', 'Women', 'Minority', 'Micro-Entrepreneurs'],
    eligibleActivities: [
      'dairy',
      'animal_husbandry',
      'tailoring',
      'small_retail',
      'kirana_store',
      'poultry',
      'rural_services',
      'transport_vehicles'
    ],
    minMarginContributionPct: 10, // Standard 10%-15% margin for loans above ₹50,000
    maxProjectCost: 2000000, // Tarun enhanced up to ₹20 Lakhs (Union Budget enhancement)
    interestRateRange: '8.75% - 11.50% per annum (No collateral required under CGFMU)',
    subsidyGeneralRuralPct: 0, // Direct interest subsidy depends on state; collateral-free credit guarantee
    subsidySpecialRuralPct: 0,
    maxSubsidyAmount: 0,
    maxTenureMonths: 60, // 5 years
    moratoriumMonths: 3,
    requiredDocuments: [
      'Proof of Identity (Aadhaar / Voter ID / Driving Licence)',
      'Proof of Residence (Electricity Bill / Gram Panchayat Certificate)',
      'Business Proposal / Project Quotations for machinery or livestock',
      'Last 6 Months Bank Statement',
      '2 Passport Size Photographs',
      'Udyam Registration Certificate (free online registration on udyamregistration.gov.in)'
    ],
    officialSourceUrl: 'https://www.mudra.org.in',
    lastVerifiedDate: '2026-01-10',
    verificationStatus: 'VERIFIED',
    notes: 'No collateral security required. Credit Guarantee for Micro Units (CGFMU) covers lender risk.'
  },
  {
    id: 'scheme_kcc_animal_husbandry',
    code: 'KCC_AH',
    name: 'Kisan Credit Card (KCC) for Animal Husbandry & Dairying',
    shortName: 'KCC Dairy Working Capital',
    nodalAgency: 'Department of Animal Husbandry & Dairying (DAHD) / RBI / NABARD',
    category: 'Central',
    targetBeneficiaries: ['Individual Dairy Farmers', 'Dairy SHGs', 'Joint Liability Groups (JLGs)'],
    eligibleActivities: ['dairy', 'poultry', 'sheep_goat_rearing'],
    minMarginContributionPct: 0, // No margin for KCC working capital limit up to ₹1.60 Lakhs; 10% above
    maxProjectCost: 300000, // Concessional interest limit up to ₹2-3 Lakhs for Animal Husbandry
    interestRateRange: '7.00% base rate (Effective 4.00% with prompt repayment 3% interest subvention)',
    subsidyGeneralRuralPct: 3, // 3% Interest Subvention on timely repayment
    subsidySpecialRuralPct: 3,
    maxSubsidyAmount: 18000,
    maxTenureMonths: 36, // Revolving 3-year limit with annual review
    moratoriumMonths: 0,
    requiredDocuments: [
      'Application Form with Livestock Holding Declaration',
      'Aadhaar Card and Land Record (7/12 extract or village tenant proof / NOC)',
      'Vaccination and Tagging Certificate of Milking Animals from Veterinary Officer',
      'Bank Account Passbook'
    ],
    officialSourceUrl: 'https://dahd.nic.in/schemes/programmes/kisan-credit-card-kcc',
    lastVerifiedDate: '2026-01-20',
    verificationStatus: 'VERIFIED',
    notes: 'Provides revolving operational cash for green fodder, dry cattle feed, veterinary care, and recurring working capital.'
  },
  {
    id: 'scheme_pmfme',
    code: 'PMFME',
    name: 'PM Formalisation of Micro Food Processing Enterprises Scheme',
    shortName: 'PMFME Scheme',
    nodalAgency: 'Ministry of Food Processing Industries (MoFPI)',
    category: 'Central',
    targetBeneficiaries: ['Individual Micro-units', 'FPOs', 'SHGs', 'Cooperatives'],
    eligibleActivities: [
      'dairy_value_addition', // Ghee, paneer, curd, butter manufacturing (Value added)
      'agro_processing',
      'food_packaging',
      'spice_grinding',
      'bakery_confectionery'
    ],
    ineligibleActivities: ['raw_unprocessed_milk_sale_only', 'non_food_trade'],
    minMarginContributionPct: 10,
    maxProjectCost: 3000000,
    interestRateRange: '9.00% - 11.25% per annum',
    subsidyGeneralRuralPct: 35, // 35% Credit-linked capital subsidy
    subsidySpecialRuralPct: 35,
    maxSubsidyAmount: 1000000, // Maximum ceiling ₹10 Lakhs
    maxTenureMonths: 84,
    moratoriumMonths: 6,
    requiredDocuments: [
      'Aadhaar & PAN Card',
      'FSSAI Registration / Basic Food Hygiene Declaration',
      'Quotation for Processing Machinery (Chilling, Paneer Press, Cream Separator)',
      'Electricity Connection Bill for Work Unit',
      'Detailed Project Report (DPR)',
      'Udyam Registration'
    ],
    officialSourceUrl: 'https://pmfme.mofpi.gov.in',
    lastVerifiedDate: '2026-01-12',
    verificationStatus: 'VERIFIED',
    notes: 'Requires value-addition component (e.g. converting liquid milk into curd/paneer/sweets or localized value add).'
  },
  {
    id: 'scheme_stand_up_india',
    code: 'STANDUP_INDIA',
    name: 'Stand-Up India Scheme for Greenfield Enterprises',
    shortName: 'Stand-Up India',
    nodalAgency: 'Department of Financial Services / SIDBI',
    category: 'Central',
    targetBeneficiaries: ['SC/ST', 'Women Entrepreneurs'],
    eligibleActivities: ['manufacturing', 'services', 'agri_allied_services', 'dairy_farming', 'tailoring_apparel'],
    minMarginContributionPct: 15, // Can be reduced to 10% if converged with state subsidy
    maxProjectCost: 10000000, // ₹10 Lakhs to ₹1 Crore
    interestRateRange: 'Lowest applicable rate of bank for that category (MCLR + 3% + Tenor Premium)',
    subsidyGeneralRuralPct: 0,
    subsidySpecialRuralPct: 0,
    maxSubsidyAmount: 0,
    maxTenureMonths: 84, // 7 years
    moratoriumMonths: 18,
    requiredDocuments: [
      'Caste Certificate (SC/ST) or Proof of Women Enterprise ownership (>51% shareholding)',
      'Greenfield Enterprise Declaration (First time venture)',
      'Detailed Project Report with Financial Projections',
      'Bank Statement for 6 months',
      'Premises Ownership or Registered Lease Agreement'
    ],
    officialSourceUrl: 'https://www.standupmitra.in',
    lastVerifiedDate: '2026-01-18',
    verificationStatus: 'VERIFIED',
    notes: 'Dedicated to SC/ST and Women entrepreneurs for greenfield ventures.'
  },
  {
    id: 'scheme_ahidf_infrastructure',
    code: 'AHIDF',
    name: 'Animal Husbandry Infrastructure Development Fund (AHIDF)',
    shortName: 'AHIDF Infrastructure Fund',
    nodalAgency: 'Department of Animal Husbandry & Dairying (DAHD)',
    category: 'Central',
    targetBeneficiaries: ['Farmer Producer Organisations (FPOs)', 'MSMEs', 'Private Companies', 'Section 8 Companies'],
    eligibleActivities: [
      'commercial_dairy_processing_plant',
      'bulk_milk_chiller_grid',
      'cattle_feed_manufacturing_plant',
      'meat_processing_infrastructure'
    ],
    ineligibleActivities: ['micro_individual_cow_purchase', 'subsistence_dairy_farming'],
    minMarginContributionPct: 10, // 10% for Micro & Small enterprises; 15-25% for Medium
    maxProjectCost: 500000000, // Large infrastructure projects up to ₹50+ Crores
    interestRateRange: '3% Interest Subvention provided on bank lending rate',
    subsidyGeneralRuralPct: 3, // 3% Interest Subvention
    subsidySpecialRuralPct: 3,
    maxSubsidyAmount: 5000000,
    maxTenureMonths: 96, // 8 years
    moratoriumMonths: 24, // 2-year moratorium on principal
    requiredDocuments: [
      'Audited Financial Statements (Last 2 years where applicable)',
      'FPO / MSME Certificate & Board Resolution',
      'Techno-Economic Feasibility Report (TEFR)',
      'Pollution Control Board Clearance / Environmental Consent',
      'Sanction Letter from Scheduled Commercial Bank'
    ],
    officialSourceUrl: 'https://ahidf.udyamimitra.in',
    lastVerifiedDate: '2026-01-14',
    verificationStatus: 'VERIFIED',
    notes: 'NOTE: Not applicable for micro-level individual cow purchase. Restricted to processing and cold chain infrastructure.'
  }
];
