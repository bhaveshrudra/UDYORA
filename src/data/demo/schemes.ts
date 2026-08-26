/**
 * UDYORA Demo Schemes Benchmark Dataset
 * NOTE: Standard Government of India schemes with official guideline references.
 */

export interface DemoSchemeBenchmark {
  id: string;
  name: string;
  shortCode: string;
  ministry: string;
  maxProjectCost: number;
  subsidyPctGeneral: number;
  subsidyPctSpecial: number;
  promoterContributionPct: number;
  tenureYears: number;
  interestSubventionPct?: number;
  source: string;
  sourceUrl: string;
  status: 'VERIFIED_OFFICIAL_GUIDELINE';
  requiredDocuments: string[];
  eligibilityCriteria: string[];
}

export const DEMO_SCHEMES_BENCHMARK: DemoSchemeBenchmark[] = [
  {
    id: 'pmegp_scheme',
    name: 'Prime Minister Employment Generation Programme',
    shortCode: 'PMEGP',
    ministry: 'Ministry of Micro, Small and Medium Enterprises (MSME)',
    maxProjectCost: 5000000,
    subsidyPctGeneral: 25,
    subsidyPctSpecial: 35,
    promoterContributionPct: 10,
    tenureYears: 5,
    source: 'KVIC PMEGP Portal Guidelines',
    sourceUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
    status: 'VERIFIED_OFFICIAL_GUIDELINE',
    requiredDocuments: [
      'Aadhaar Card & PAN Card',
      'Detailed Project Report (DPR)',
      'Educational Qualification Certificate (8th pass for > ₹10L manufacturing)',
      'Rural Area Certificate from Gram Panchayat / Tehsildar',
      'Bank Account Statement (Last 6 months)'
    ],
    eligibilityCriteria: [
      'Any individual above 18 years of age',
      'No income ceiling for setting up projects',
      'Assistance available only for new projects',
      'Self Help Groups not registered under other schemes'
    ]
  },
  {
    id: 'mudra_kishore_scheme',
    name: 'Pradhan Mantri MUDRA Yojana (Kishore Category)',
    shortCode: 'MUDRA_KISHORE',
    ministry: 'Department of Financial Services, Ministry of Finance',
    maxProjectCost: 500000,
    subsidyPctGeneral: 0,
    subsidyPctSpecial: 0,
    promoterContributionPct: 10,
    tenureYears: 5,
    source: 'MUDRA Official Policy Portal',
    sourceUrl: 'https://www.mudra.org.in/',
    status: 'VERIFIED_OFFICIAL_GUIDELINE',
    requiredDocuments: [
      'Identity Proof (Aadhaar / Voter ID)',
      'Proof of Business Address & Electricity Bill',
      'Quotation of Machinery / Equipment to be purchased',
      'Proof of Caste / Category (if applicable)'
    ],
    eligibilityCriteria: [
      'Non-corporate small business segment',
      'Non-farm micro enterprise',
      'No collateral security required up to ₹10 Lakhs'
    ]
  },
  {
    id: 'ahidf_scheme',
    name: 'Animal Husbandry Infrastructure Development Fund',
    shortCode: 'AHIDF',
    ministry: 'Department of Animal Husbandry and Dairying',
    maxProjectCost: 200000000,
    subsidyPctGeneral: 0,
    subsidyPctSpecial: 0,
    promoterContributionPct: 10,
    tenureYears: 8,
    interestSubventionPct: 3.0,
    source: 'DAHD AHIDF Portal',
    sourceUrl: 'https://ahidf.udyamimitra.in/',
    status: 'VERIFIED_OFFICIAL_GUIDELINE',
    requiredDocuments: [
      'Bankable DPR with Financial Feasibility',
      'Land Ownership or Registered Lease Agreement (>10 years)',
      'Environmental Clearance (where applicable)',
      'Sanction Letter from Scheduled Bank'
    ],
    eligibilityCriteria: [
      'Dairy processing and value addition infrastructure',
      'Meat processing units',
      'Animal feed manufacturing plants'
    ]
  }
];
