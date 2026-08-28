import { DEMO_LOCATIONS } from '../data/locations';
import { VERIFIED_SCHEMES } from '../data/schemes';
import { TRANSLATIONS } from '../i18n/translations';
import { SupportedLanguage } from '../i18n/types';
import { getRegisteredUsers, getSavedAssessments, updateUserProfileStatus } from './userAuthService';

/* =========================================================================
   POSTGRESQL-READY DATA MODEL ENTITIES
   ========================================================================= */

export type VerificationStatus = 'VERIFIED' | 'ESTIMATED' | 'INCOMPLETE' | 'REQUIRES REVIEW' | 'INACTIVE';

export interface LocationEntity {
  id: string;
  village: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
  areaType: 'Rural' | 'Semi-Urban';
  latitude: number;
  longitude: number;
  population: number;
  households: number;
  nearestDairyCooperativeKm: number;
  nearestApmcMandiKm: number;
  nearestHighwayKm: number;
  dataSource: string;
  status: 'VERIFIED' | 'ESTIMATED' | 'INCOMPLETE';
  confidence: number;
  updatedAt: string;
  verifiedBy: string;
  isArchived?: boolean;
}

export interface BusinessTemplateEntity {
  id: string;
  name: string;
  category: 'dairy' | 'tailoring' | 'retail' | 'poultry' | 'agro';
  description: string;
  typicalScale: string;
  indicativeCapEx: number;
  monthlyOpEx: number;
  workingCapital: number;
  expectedMonthlyRevenue: number;
  promoterMarginPct: number;
  seasonalityNotes: string;
  riskFactors: string[];
  requiredInfrastructure: string[];
  dataSources: string[];
  status: VerificationStatus;
  updatedAt: string;
  verifiedBy: string;
  isArchived?: boolean;
}

export interface SchemeEntity {
  id: string;
  code: string;
  name: string;
  shortName: string;
  nodalAgency: string;
  category: string;
  eligibleActivities: string[];
  minMarginContributionPct: number;
  maxProjectCost: number;
  interestRateRange: string;
  subsidyGeneralRuralPct: number;
  subsidySpecialRuralPct: number;
  maxSubsidyAmount: number;
  maxTenureMonths: number;
  moratoriumMonths: number;
  requiredDocuments: string[];
  officialSourceUrl: string;
  verificationDate: string;
  status: 'VERIFIED' | 'REQUIRES REVIEW' | 'INACTIVE';
  notes: string;
}

export interface EvidenceSourceEntity {
  id: string;
  sourceName: string;
  organization: string;
  datasetName: string;
  url: string;
  geographicLevel: 'Village' | 'Block' | 'District' | 'State' | 'National';
  metric: string;
  value: string;
  unit: string;
  sourceType: 'Census' | 'APMC Mandi' | 'State Dairy Federation' | 'SLBC Guideline' | 'Field Survey';
  status: 'VERIFIED' | 'ESTIMATED' | 'INSUFFICIENT DATA' | 'REQUIRES REVIEW';
  confidence: number;
  retrievedDate: string;
  lastUpdated: string;
  verifiedBy: string;
}

export interface FinancialRuleEntity {
  id: string;
  ruleName: string;
  parameterKey: string;
  value: number;
  unit: '%' | 'Months' | 'Ratio' | '₹';
  description: string;
  effectiveDate: string;
  source: string;
  status: 'VERIFIED' | 'REQUIRES REVIEW';
  updatedAt: string;
  verifiedBy: string;
}

export interface UserEntity {
  id: string;
  maskedName: string;
  maskedPhone: string;
  language: SupportedLanguage;
  location: string;
  preferredBusiness: string;
  createdAt: string;
  lastActive: string;
  assessmentsCount: number;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface AssessmentEntity {
  id: string;
  createdAt: string;
  locationName: string;
  businessName: string;
  ownCapital: number;
  projectCost: number;
  feasibilityScore: number;
  feasibilityCategory: 'HIGH' | 'MODERATE' | 'CONDITIONAL' | 'LOW';
  confidenceScore: number;
  dataQuality: 'VERIFIED' | 'ESTIMATED' | 'INSUFFICIENT DATA';
  matchedScheme: string;
  monthlyEMI: number;
  dscr: number;
  status: 'COMPLETED' | 'FLAGGED' | 'RECALCULATED';
}

export interface AuditLogEntity {
  id: string;
  actor: string;
  actorRole: string;
  action: 'CREATE' | 'UPDATE' | 'ARCHIVE' | 'VERIFY' | 'STATUS_CHANGE' | 'SETTING_CHANGE';
  entityType: 'LOCATION' | 'BUSINESS' | 'SCHEME' | 'EVIDENCE' | 'FINANCIAL_RULE' | 'USER' | 'TRANSLATION' | 'SETTINGS';
  entityId: string;
  entityName: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SystemSettingsEntity {
  defaultLanguage: SupportedLanguage;
  defaultCurrency: string;
  maintenanceMode: boolean;
  demoModeEnabled: boolean;
  requireEvidenceVerification: boolean;
  minConfidenceThreshold: number;
  contactEmail: string;
  contactPhone: string;
  platformVersion: string;
  lastSystemAudit: string;
}

/* =========================================================================
   INITIAL REPOSITORY STATE (PERSISTED IN STORAGE / READY FOR POSTGRES)
   ========================================================================= */

const STORAGE_KEYS = {
  LOCATIONS: 'udyora_admin_locations',
  BUSINESSES: 'udyora_admin_businesses',
  SCHEMES: 'udyora_admin_schemes',
  EVIDENCE: 'udyora_admin_evidence',
  FIN_RULES: 'udyora_admin_fin_rules',
  USERS: 'udyora_registered_users',
  ASSESSMENTS: 'udyora_saved_assessments',
  AUDIT_LOGS: 'udyora_admin_audit_logs',
  SETTINGS: 'udyora_admin_settings',
  TRANSLATIONS: 'udyora_admin_translations'
};

// Initial Seed Locations
const SEED_LOCATIONS: LocationEntity[] = DEMO_LOCATIONS.map((loc) => ({
  id: loc.id,
  village: loc.village,
  block: loc.block,
  district: loc.district,
  state: loc.state,
  pincode: loc.pincode,
  areaType: loc.areaType as any,
  latitude: 18.33,
  longitude: 73.85,
  population: Number(loc.population.value) || 3500,
  households: Number(loc.householdCount.value) || 700,
  nearestDairyCooperativeKm: Number(loc.nearestDairyCooperativeKm?.value) || 4.5,
  nearestApmcMandiKm: Number(loc.nearestApmcMandiKm?.value || loc.nearestMandiDistanceKm?.value) || 22,
  nearestHighwayKm: 3.2,
  dataSource: 'Census 2011 & Mandi Board Gazette',
  status: loc.population.status === 'VERIFIED' ? 'VERIFIED' : 'ESTIMATED',
  confidence: loc.population.confidence || 0.85,
  updatedAt: '2026-08-20T10:00:00Z',
  verifiedBy: 'State Data Coordinator'
}));

// Initial Seed Business Templates
const SEED_BUSINESSES: BusinessTemplateEntity[] = [
  {
    id: 'biz_dairy_01',
    name: 'Commercial Micro Dairy Farming',
    category: 'dairy',
    description: 'Unit of 8-10 high-yield milch cows with hygienic shed and chilling connectivity.',
    typicalScale: '8-10 Cows (80-100 L/day)',
    indicativeCapEx: 700000,
    monthlyOpEx: 35000,
    workingCapital: 250000,
    expectedMonthlyRevenue: 75000,
    promoterMarginPct: 10,
    seasonalityNotes: 'Dry fodder inflation during summer months; peak lactation in monsoon/winter.',
    riskFactors: ['Biosecurity & Foot-and-mouth disease', 'Feed cost fluctuation', 'Milk spoilage'],
    requiredInfrastructure: ['Clean groundwater', '3-phase electricity', 'Cooperative chilling hub access'],
    dataSources: ['NABARD Model Dairy Project Guidelines', 'NDDB Benchmarks'],
    status: 'VERIFIED',
    updatedAt: '2026-08-22T14:30:00Z',
    verifiedBy: 'Senior Veterinary Consultant'
  },
  {
    id: 'biz_tailor_02',
    name: 'Custom Garment & Boutique Tailoring Workshop',
    category: 'tailoring',
    description: 'Boutique garment workshop with 4 industrial sewing & embroidery machines.',
    typicalScale: '4 Sewing Stations + Finishing',
    indicativeCapEx: 350000,
    monthlyOpEx: 18000,
    workingCapital: 120000,
    expectedMonthlyRevenue: 42000,
    promoterMarginPct: 10,
    seasonalityNotes: 'Festival & wedding season surges (Sept–Jan).',
    riskFactors: ['Skilled seamstress attrition', 'Fabric supply delays'],
    requiredInfrastructure: ['Single phase power', 'Commercial road frontage'],
    dataSources: ['MSME Project Profile: Ready-made Garments'],
    status: 'VERIFIED',
    updatedAt: '2026-08-21T11:15:00Z',
    verifiedBy: 'MSME Policy Analyst'
  },
  {
    id: 'biz_retail_03',
    name: 'Rural Kirana & Essential Goods Store',
    category: 'retail',
    description: 'Daily provisions, packaged food, farm inputs and FMCG store with POS billing.',
    typicalScale: '300-400 sq.ft Shop Floor',
    indicativeCapEx: 450000,
    monthlyOpEx: 22000,
    workingCapital: 280000,
    expectedMonthlyRevenue: 58000,
    promoterMarginPct: 10,
    seasonalityNotes: 'Steady year-round demand with harvest liquidity spikes.',
    riskFactors: ['Inventory expiration', 'Informal credit default'],
    requiredInfrastructure: ['Main village road junction', 'Secure shutter store'],
    dataSources: ['CAIT Retail Operating Norms 2025'],
    status: 'VERIFIED',
    updatedAt: '2026-08-19T09:00:00Z',
    verifiedBy: 'Commerce Directorate'
  }
];

// Initial Seed Schemes
const SEED_SCHEMES: SchemeEntity[] = VERIFIED_SCHEMES.map((s) => ({
  id: s.id,
  code: s.code || s.shortName,
  name: s.name,
  shortName: s.shortName,
  nodalAgency: s.nodalAgency,
  category: s.category || 'Central Government Credit Subsidy',
  eligibleActivities: s.eligibleActivities,
  minMarginContributionPct: s.minMarginContributionPct,
  maxProjectCost: s.maxProjectCost,
  interestRateRange: s.interestRateRange,
  subsidyGeneralRuralPct: s.subsidyGeneralRuralPct || 25,
  subsidySpecialRuralPct: s.subsidySpecialRuralPct || 35,
  maxSubsidyAmount: s.maxSubsidyAmount || 875000,
  maxTenureMonths: s.maxTenureMonths || 84,
  moratoriumMonths: s.moratoriumMonths || 6,
  requiredDocuments: s.requiredDocuments.map((d) => (typeof d === 'string' ? d : d.name || 'Document')),
  officialSourceUrl: s.officialSourceUrl,
  verificationDate: s.lastVerifiedDate || '2026-08-01',
  status: (s.status as any) || 'VERIFIED',
  notes: s.notes || 'Official scheme guidelines active under MoMSME / MoA&FW.'
}));

// Initial Seed Evidence Sources
const SEED_EVIDENCE: EvidenceSourceEntity[] = [
  {
    id: 'ev_001',
    sourceName: 'Census of India 2011 Village PCA',
    organization: 'Office of the Registrar General & Census Commissioner',
    datasetName: 'Primary Census Abstract Series 2011',
    url: 'https://censusindia.gov.in',
    geographicLevel: 'Village',
    metric: 'Village Population & Household Count',
    value: '3,500 Population / 700 Households',
    unit: 'Count',
    sourceType: 'Census',
    status: 'VERIFIED',
    confidence: 0.90,
    retrievedDate: '2026-08-01',
    lastUpdated: '2026-08-15',
    verifiedBy: 'Lead Demographer'
  },
  {
    id: 'ev_002',
    sourceName: 'National Agmarknet Mandi Price Portal',
    organization: 'Directorate of Marketing & Inspection (DMI)',
    datasetName: 'Daily Modal Commodity Arrival & Rates',
    url: 'https://agmarknet.gov.in',
    geographicLevel: 'District',
    metric: 'Wholesale Milk & Dairy Commodity Arbitrage',
    value: '₹34 - ₹38 / Litre Base',
    unit: '₹/L',
    sourceType: 'APMC Mandi',
    status: 'VERIFIED',
    confidence: 0.95,
    retrievedDate: '2026-08-25',
    lastUpdated: '2026-08-26',
    verifiedBy: 'Market Intelligence Officer'
  },
  {
    id: 'ev_003',
    sourceName: 'Reserve Bank of India Master Direction - Priority Sector',
    organization: 'Reserve Bank of India',
    datasetName: 'FIDD.MSME.BC.No.08/06.02.031/2025-26',
    url: 'https://rbi.org.in',
    geographicLevel: 'National',
    metric: 'Priority Sector MSME Collateral-Free Limit',
    value: 'Up to ₹10,00,000 without mandatory collateral',
    unit: '₹ Limit',
    sourceType: 'SLBC Guideline',
    status: 'VERIFIED',
    confidence: 1.0,
    retrievedDate: '2026-08-01',
    lastUpdated: '2026-08-20',
    verifiedBy: 'Banking Compliance Officer'
  }
];

// Initial Seed Financial Rules
const SEED_FIN_RULES: FinancialRuleEntity[] = [
  {
    id: 'rule_01',
    ruleName: 'Standard Rural Promoter Margin Floor',
    parameterKey: 'min_margin_contribution_pct',
    value: 10,
    unit: '%',
    description: 'Minimum equity contribution required from entrepreneur under SIH/PMEGP general guidelines.',
    effectiveDate: '2026-04-01',
    source: 'PMEGP Official Operational Guidelines',
    status: 'VERIFIED',
    updatedAt: '2026-08-10',
    verifiedBy: 'Financial Systems Lead'
  },
  {
    id: 'rule_02',
    ruleName: 'Benchmark Commercial Debt Annual Interest Rate',
    parameterKey: 'benchmark_annual_interest_rate_pct',
    value: 9.5,
    unit: '%',
    description: 'Indicative reducing balance commercial rate used for EMI and DSCR projections.',
    effectiveDate: '2026-06-01',
    source: 'SLBC State Average Lending Benchmark',
    status: 'VERIFIED',
    updatedAt: '2026-08-15',
    verifiedBy: 'Financial Systems Lead'
  },
  {
    id: 'rule_03',
    ruleName: 'Minimum Target DSCR for High Feasibility',
    parameterKey: 'min_healthy_dscr_ratio',
    value: 1.5,
    unit: 'Ratio',
    description: 'Minimum Debt Service Coverage Ratio required for green (HIGH) readiness classification.',
    effectiveDate: '2026-01-01',
    source: 'Institutional Credit Appraisal Manual',
    status: 'VERIFIED',
    updatedAt: '2026-08-01',
    verifiedBy: 'Banking Policy Lead'
  },
  {
    id: 'rule_04',
    ruleName: 'Standard Agricultural/Dairy Moratorium Cap',
    parameterKey: 'max_moratorium_months',
    value: 6,
    unit: 'Months',
    description: 'Principal repayment grace period permitted before first EMI installment.',
    effectiveDate: '2026-01-01',
    source: 'NABARD Term Loan Refinance Norms',
    status: 'VERIFIED',
    updatedAt: '2026-08-01',
    verifiedBy: 'Banking Policy Lead'
  }
];

// Seed Users
const SEED_USERS: UserEntity[] = [
  {
    id: 'usr_901',
    maskedName: 'Ramesh K****',
    maskedPhone: '+91 98****3210',
    language: 'mr',
    location: 'Khed Shivapur, Pune (MH)',
    preferredBusiness: 'Commercial Micro Dairy Farming',
    createdAt: '2026-08-18T09:12:00Z',
    lastActive: '2026-08-26T17:40:00Z',
    assessmentsCount: 4,
    status: 'ACTIVE'
  },
  {
    id: 'usr_902',
    maskedName: 'Lakshmi V****',
    maskedPhone: '+91 94****7890',
    language: 'te',
    location: 'Madhurawada, Visakhapatnam (AP)',
    preferredBusiness: 'Custom Garment Tailoring',
    createdAt: '2026-08-20T14:25:00Z',
    lastActive: '2026-08-26T16:15:00Z',
    assessmentsCount: 2,
    status: 'ACTIVE'
  },
  {
    id: 'usr_903',
    maskedName: 'Basavaraj G****',
    maskedPhone: '+91 91****5544',
    language: 'kn',
    location: 'Gejjalagere, Mandya (KA)',
    preferredBusiness: 'Rural Kirana Goods Store',
    createdAt: '2026-08-22T11:00:00Z',
    lastActive: '2026-08-26T14:05:00Z',
    assessmentsCount: 3,
    status: 'ACTIVE'
  }
];

// Seed Historical Assessments
const SEED_ASSESSMENTS: AssessmentEntity[] = [
  {
    id: 'UDY-2026-8891',
    createdAt: '2026-08-26T17:35:00Z',
    locationName: 'Khed Shivapur, Pune (MH)',
    businessName: 'Commercial Micro Dairy Farming (8-10 Cows)',
    ownCapital: 100000,
    projectCost: 1000000,
    feasibilityScore: 84,
    feasibilityCategory: 'HIGH',
    confidenceScore: 0.88,
    dataQuality: 'VERIFIED',
    matchedScheme: 'PMEGP (Rural Dairy Subsidy 35%)',
    monthlyEMI: 19124,
    dscr: 2.3,
    status: 'COMPLETED'
  },
  {
    id: 'UDY-2026-8892',
    createdAt: '2026-08-26T16:10:00Z',
    locationName: 'Madhurawada, Visakhapatnam (AP)',
    businessName: 'Custom Garment & Boutique Tailoring Workshop',
    ownCapital: 50000,
    projectCost: 500000,
    feasibilityScore: 78,
    feasibilityCategory: 'MODERATE',
    confidenceScore: 0.82,
    dataQuality: 'VERIFIED',
    matchedScheme: 'MUDRA Kishore / Stand-Up India',
    monthlyEMI: 9562,
    dscr: 1.9,
    status: 'COMPLETED'
  },
  {
    id: 'UDY-2026-8893',
    createdAt: '2026-08-26T14:00:00Z',
    locationName: 'Gejjalagere, Mandya (KA)',
    businessName: 'Rural Kirana & Essential Goods Retail Store',
    ownCapital: 75000,
    projectCost: 750000,
    feasibilityScore: 81,
    feasibilityCategory: 'HIGH',
    confidenceScore: 0.85,
    dataQuality: 'VERIFIED',
    matchedScheme: 'PMEGP Rural Retail 35%',
    monthlyEMI: 14343,
    dscr: 2.1,
    status: 'COMPLETED'
  }
];

// Seed Audit Logs
const SEED_AUDIT_LOGS: AuditLogEntity[] = [
  {
    id: 'aud_101',
    actor: 'admin@udyora.gov.in',
    actorRole: 'SUPER_ADMIN',
    action: 'VERIFY',
    entityType: 'SCHEME',
    entityId: 'pmegp',
    entityName: 'Prime Minister Employment Generation Programme',
    details: 'Verified FY2026 subsidy rates (35% rural special, 25% general) against MoMSME gazette notification.',
    timestamp: '2026-08-25T14:20:00Z',
    ipAddress: '10.0.4.12'
  },
  {
    id: 'aud_102',
    actor: 'editor@udyora.in',
    actorRole: 'DATA_ADMIN',
    action: 'UPDATE',
    entityType: 'LOCATION',
    entityId: 'loc_khed_shivapur_pune',
    entityName: 'Khed Shivapur, Pune',
    details: 'Updated APMC Mandi proximity distance to 22.0 km after verifying regional transport corridor.',
    timestamp: '2026-08-24T11:15:00Z',
    ipAddress: '10.0.4.18'
  },
  {
    id: 'aud_103',
    actor: 'admin@udyora.gov.in',
    actorRole: 'SUPER_ADMIN',
    action: 'SETTING_CHANGE',
    entityType: 'SETTINGS',
    entityId: 'global',
    entityName: 'System Settings',
    details: 'Enabled strict multi-agent evidence reconciliation verification threshold (0.75 floor).',
    timestamp: '2026-08-23T09:40:00Z',
    ipAddress: '10.0.4.12'
  }
];

const SEED_SETTINGS: SystemSettingsEntity = {
  defaultLanguage: 'en',
  defaultCurrency: 'INR (₹)',
  maintenanceMode: false,
  demoModeEnabled: true,
  requireEvidenceVerification: true,
  minConfidenceThreshold: 0.75,
  contactEmail: 'advisory-support@udyora.gov.in',
  contactPhone: '1800-180-1551 (Kisan / MSME Call Centre)',
  platformVersion: 'v2.4.0-production (SIH26091)',
  lastSystemAudit: '2026-08-26T18:00:00Z'
};

/* =========================================================================
   GENERIC STORAGE REPOSITORY HELPER (READY FOR POSTGRES REST API)
   ========================================================================= */

const inMemoryStorageMap = new Map<string, string>();

function getStorageData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    const raw = inMemoryStorageMap.get(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setStorageData<T>(key: string, data: T): void {
  const serialized = JSON.stringify(data);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, serialized);
    } catch (err) {
      console.warn(`Failed to persist ${key}:`, err);
    }
  } else {
    inMemoryStorageMap.set(key, serialized);
  }
}

function recordAuditLog(
  action: AuditLogEntity['action'],
  entityType: AuditLogEntity['entityType'],
  entityId: string,
  entityName: string,
  details: string,
  actor: string = 'admin@udyora.gov.in'
) {
  const logs = getAuditLogs();
  const newLog: AuditLogEntity = {
    id: `aud_${Date.now()}`,
    actor,
    actorRole: actor.includes('editor') ? 'DATA_ADMIN' : 'SUPER_ADMIN',
    action,
    entityType,
    entityId,
    entityName,
    details,
    timestamp: new Date().toISOString()
  };
  setStorageData(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs]);
}

/* =========================================================================
   EXPOSED REPOSITORY ACCESS FUNCTIONS
   ========================================================================= */

// 1. Locations
export function getLocations(): LocationEntity[] {
  return getStorageData(STORAGE_KEYS.LOCATIONS, SEED_LOCATIONS);
}

export function saveLocation(loc: LocationEntity, actor?: string): void {
  const list = getLocations();
  const idx = list.findIndex((l) => l.id === loc.id);
  const updated = { ...loc, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    list[idx] = updated;
    recordAuditLog('UPDATE', 'LOCATION', loc.id, `${loc.village}, ${loc.district}`, `Updated demographic / infra metrics for ${loc.village}`, actor);
  } else {
    list.unshift(updated);
    recordAuditLog('CREATE', 'LOCATION', loc.id, `${loc.village}, ${loc.district}`, `Added new location entry for ${loc.village}`, actor);
  }
  setStorageData(STORAGE_KEYS.LOCATIONS, list);
}

export function archiveLocation(id: string, actor?: string): void {
  const list = getLocations();
  const target = list.find((l) => l.id === id);
  if (target) {
    target.isArchived = true;
    target.status = 'INCOMPLETE';
    setStorageData(STORAGE_KEYS.LOCATIONS, list);
    recordAuditLog('ARCHIVE', 'LOCATION', id, target.village, `Archived location ${target.village}`, actor);
  }
}

// 2. Business Templates
export function getBusinessTemplates(): BusinessTemplateEntity[] {
  return getStorageData(STORAGE_KEYS.BUSINESSES, SEED_BUSINESSES);
}

export function saveBusinessTemplate(tmpl: BusinessTemplateEntity, actor?: string): void {
  const list = getBusinessTemplates();
  const idx = list.findIndex((b) => b.id === tmpl.id);
  const updated = { ...tmpl, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    list[idx] = updated;
    recordAuditLog('UPDATE', 'BUSINESS', tmpl.id, tmpl.name, `Updated financial assumptions and scale for ${tmpl.name}`, actor);
  } else {
    list.unshift(updated);
    recordAuditLog('CREATE', 'BUSINESS', tmpl.id, tmpl.name, `Added new business template ${tmpl.name}`, actor);
  }
  setStorageData(STORAGE_KEYS.BUSINESSES, list);
}

// 3. Schemes
export function getSchemes(): SchemeEntity[] {
  return getStorageData(STORAGE_KEYS.SCHEMES, SEED_SCHEMES);
}

export function saveScheme(scheme: SchemeEntity, actor?: string): void {
  const list = getSchemes();
  const idx = list.findIndex((s) => s.id === scheme.id);
  const updated = { ...scheme, verificationDate: new Date().toISOString().split('T')[0] };
  if (idx >= 0) {
    list[idx] = updated;
    recordAuditLog('UPDATE', 'SCHEME', scheme.id, scheme.shortName, `Updated rule matching thresholds and subsidy limits for ${scheme.shortName}`, actor);
  } else {
    list.unshift(updated);
    recordAuditLog('CREATE', 'SCHEME', scheme.id, scheme.shortName, `Registered new government scheme ${scheme.shortName}`, actor);
  }
  setStorageData(STORAGE_KEYS.SCHEMES, list);
}

// 4. Evidence Sources
export function getEvidenceSources(): EvidenceSourceEntity[] {
  return getStorageData(STORAGE_KEYS.EVIDENCE, SEED_EVIDENCE);
}

export function saveEvidenceSource(ev: EvidenceSourceEntity, actor?: string): void {
  const list = getEvidenceSources();
  const idx = list.findIndex((e) => e.id === ev.id);
  const updated = { ...ev, lastUpdated: new Date().toISOString().split('T')[0] };
  if (idx >= 0) {
    list[idx] = updated;
    recordAuditLog('UPDATE', 'EVIDENCE', ev.id, ev.sourceName, `Updated dataset benchmark metric for ${ev.sourceName}`, actor);
  } else {
    list.unshift(updated);
    recordAuditLog('CREATE', 'EVIDENCE', ev.id, ev.sourceName, `Indexed new official evidence source ${ev.sourceName}`, actor);
  }
  setStorageData(STORAGE_KEYS.EVIDENCE, list);
}

// 5. Financial Rules
export function getFinancialRules(): FinancialRuleEntity[] {
  return getStorageData(STORAGE_KEYS.FIN_RULES, SEED_FIN_RULES);
}

export function saveFinancialRule(rule: FinancialRuleEntity, actor?: string): void {
  const list = getFinancialRules();
  const idx = list.findIndex((r) => r.id === rule.id);
  const updated = { ...rule, updatedAt: new Date().toISOString().split('T')[0] };
  if (idx >= 0) {
    list[idx] = updated;
    recordAuditLog('UPDATE', 'FINANCIAL_RULE', rule.id, rule.ruleName, `Changed parameter ${rule.parameterKey} to ${rule.value}${rule.unit}`, actor);
  } else {
    list.unshift(updated);
    recordAuditLog('CREATE', 'FINANCIAL_RULE', rule.id, rule.ruleName, `Added financial rule ${rule.ruleName}`, actor);
  }
  setStorageData(STORAGE_KEYS.FIN_RULES, list);
}

// 6. Users
export function getUsers(): UserEntity[] {
  const adminUsers = getStorageData(STORAGE_KEYS.USERS, SEED_USERS);
  const realUsers = getRegisteredUsers();

  const userStatusMap = new Map<string, 'ACTIVE' | 'SUSPENDED'>();
  adminUsers.forEach((u) => userStatusMap.set(u.id, u.status));

  const convertedReal: UserEntity[] = realUsers.map((ru) => ({
    id: ru.userId || (ru as any).id || `usr_${Math.random().toString(36).substr(2, 4)}`,
    maskedName: ru.name || (ru as any).maskedName || 'Participant User',
    maskedPhone: ru.mobile
      ? (ru.mobile.length === 10 ? `${ru.mobile.slice(0, 3)}****${ru.mobile.slice(7)}` : ru.mobile)
      : ((ru as any).maskedPhone || 'N/A'),
    language: ru.preferredLanguage || 'en',
    location: `${ru.mandal || 'Haveli'}, ${ru.district || 'Pune'}, ${ru.state || 'Maharashtra'}`,
    preferredBusiness: 'Micro-Enterprise',
    createdAt: (ru.createdAt || new Date().toISOString()).split('T')[0],
    lastActive: (ru.updatedAt || new Date().toISOString()).split('T')[0],
    assessmentsCount: getSavedAssessments().filter((a) => a.userId === ru.userId).length,
    status: ru.status || userStatusMap.get(ru.userId) || 'ACTIVE'
  }));

  const combined = [...convertedReal];
  adminUsers.forEach((au) => {
    if (!combined.some((c) => c.id === au.id)) {
      combined.push(au);
    }
  });

  return combined;
}

export function updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED', actor?: string): void {
  updateUserProfileStatus(userId, status);
  const rawUsers = getStorageData<any[]>(STORAGE_KEYS.USERS, SEED_USERS);
  const target = rawUsers.find((u) => u.userId === userId || u.id === userId);
  if (target) {
    target.status = status;
    setStorageData(STORAGE_KEYS.USERS, rawUsers);
    recordAuditLog('STATUS_CHANGE', 'USER', userId, target.name || target.maskedName || userId, `Changed user status to ${status}`, actor);
  } else {
    // If not in raw storage, update seed user
    const list = getUsers();
    const u = list.find((user) => user.id === userId || (user as any).userId === userId);
    if (u) {
      u.status = status;
      setStorageData(STORAGE_KEYS.USERS, list);
      recordAuditLog('STATUS_CHANGE', 'USER', userId, u.maskedName, `Changed user status to ${status}`, actor);
    }
  }
}

// 7. Assessments
export function getAssessments(): AssessmentEntity[] {
  const adminAss = getStorageData(STORAGE_KEYS.ASSESSMENTS, SEED_ASSESSMENTS);
  const realAss = getSavedAssessments();

  const convertedReal: AssessmentEntity[] = realAss.map((ra) => ({
    id: ra.assessmentId,
    createdAt: ra.createdAt,
    locationName: `${ra.mandal}, ${ra.district}, ${ra.state}`,
    businessName: ra.businessDescription || ra.businessType,
    ownCapital: ra.availableCapital,
    projectCost: Math.round(ra.availableCapital / 0.10),
    feasibilityScore: ra.feasibilityScore,
    feasibilityCategory: ra.feasibilityScore >= 80 ? 'HIGH' : ra.feasibilityScore >= 60 ? 'MODERATE' : 'CONDITIONAL',
    confidenceScore: ra.dataConfidence / 100,
    dataQuality: 'VERIFIED',
    matchedScheme: 'PMEGP / Mudra Scheme',
    monthlyEMI: Math.round(ra.availableCapital * 0.19),
    dscr: 2.2,
    status: 'COMPLETED'
  }));

  const combined = [...convertedReal];
  adminAss.forEach((aa) => {
    if (!combined.some((c) => c.id === aa.id)) {
      combined.push(aa);
    }
  });

  return combined;
}

export function recordAssessment(report: any): void {
  const list = getAssessments();
  const newAssessment: AssessmentEntity = {
    id: report.id || report.reportId || `UDY-${Date.now()}`,
    createdAt: new Date().toISOString(),
    locationName: `${report.location?.village || 'Village'}, ${report.location?.district || 'District'}`,
    businessName: report.userInput?.businessIdea || 'Rural Business',
    ownCapital: report.financialPlan?.data?.availableOwnCapital || 100000,
    projectCost: report.financialPlan?.data?.indicativeProjectCost || 1000000,
    feasibilityScore: report.feasibilityVerdict?.score || report.finalFeasibility?.score || 80,
    feasibilityCategory: report.feasibilityVerdict?.category || 'HIGH',
    confidenceScore: report.riskProfile?.dataConfidenceScore || 0.85,
    dataQuality: 'VERIFIED',
    matchedScheme: report.schemeMatches?.[0]?.scheme?.shortName || 'PMEGP',
    monthlyEMI: report.financialPlan?.data?.monthlyEMI || 19124,
    dscr: report.financialPlan?.data?.debtServiceCoverageRatio || 2.1,
    status: 'COMPLETED'
  };
  setStorageData(STORAGE_KEYS.ASSESSMENTS, [newAssessment, ...list]);
}

// 8. Audit Logs
export function getAuditLogs(): AuditLogEntity[] {
  return getStorageData(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
}

// 9. System Settings
export function getSystemSettings(): SystemSettingsEntity {
  return getStorageData(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);
}

export function updateSystemSettings(settings: Partial<SystemSettingsEntity>, actor?: string): void {
  const current = getSystemSettings();
  const updated = { ...current, ...settings, lastSystemAudit: new Date().toISOString() };
  setStorageData(STORAGE_KEYS.SETTINGS, updated);
  recordAuditLog('SETTING_CHANGE', 'SETTINGS', 'global', 'System Settings', 'Updated platform configuration settings', actor);
}

// 10. Translation Manager Data
export interface TranslationRow {
  key: string;
  en: string;
  hi: string;
  mr: string;
  te: string;
  kn: string;
  status: 'COMPLETE' | 'MISSING';
}

export function getTranslationsList(): TranslationRow[] {
  const keys = Object.keys(TRANSLATIONS.en) as (keyof typeof TRANSLATIONS.en)[];
  return keys.map((k) => {
    const en = TRANSLATIONS.en[k] || '';
    const hi = TRANSLATIONS.hi?.[k] || '';
    const mr = TRANSLATIONS.mr?.[k] || '';
    const te = TRANSLATIONS.te?.[k] || '';
    const kn = TRANSLATIONS.kn?.[k] || '';

    const isComplete = Boolean(en && hi && mr && te && kn);
    return {
      key: k,
      en,
      hi,
      mr,
      te,
      kn,
      status: isComplete ? 'COMPLETE' : 'MISSING'
    };
  });
}
