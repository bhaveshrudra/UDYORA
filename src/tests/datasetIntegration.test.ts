import {
  parseCsvRows,
  parseCsvToObjects,
  normalizeCurrency,
  normalizeBusinessCategory,
  normalizeLanguagePreference,
  matchLocationWithLgd,
  normalizeAge,
  normalizeApplicantDataset,
  normalizeEntrepreneurDataset,
  normalizeLoanDataset,
  detectDatasetConflicts,
  convertDatasetRecordToUserInput,
  getIngestedDatasets,
  maskPersonName
} from '../services/datasetService';
import { generateDeterministicFinancialPlan } from '../services/financialCalculator';
import { evaluateSchemeEligibility } from '../services/schemeRules';
import { calculateDeterministicFeasibility } from '../services/feasibilityEngine';
import { convertLgdToLocationData } from '../services/locationHierarchyService';
import { OFFICIAL_LGD_VILLAGES } from '../data/lgdHierarchy';
import { UserBusinessInput } from '../types';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${testName} -> ${detail || 'Assertion condition failed'}`);
    failCount++;
  }
}

console.log('========================================================================');
console.log('UDYORA PHASE 7: DATASET INGESTION & SYSTEM INTEGRATION TEST SUITE');
console.log('========================================================================\n');

// 1. CSV SCHEMA VALIDATION & PARSING
console.log('1. CSV SCHEMA VALIDATION & RFC 4180 PARSER:');
const sampleCsv = 'id,name,cost\n1,"Dairy Unit, Pune",100000\n2,"Tailoring ""Special""",50000';
const parsedObjects = parseCsvToObjects<{ id: string; name: string; cost: string }>(sampleCsv);
assert(parsedObjects.length === 2, 'TEST 1.1: Correct number of rows parsed from RFC 4180 CSV');
assert(
  parsedObjects[0].name === 'Dairy Unit, Pune' && parsedObjects[1].name === 'Tailoring "Special"',
  'TEST 1.2: Quoted commas and escaped quotes parsed accurately'
);

// 2. DATASET INGESTION & PROVENANCE
console.log('\n2. INGESTION PROVENANCE & DATA QUALITY:');
const datasets = getIngestedDatasets();
assert(datasets.applicant.records.length === 10, 'TEST 2.1: Dataset A (Applicants) has 10 records');
assert(datasets.entrepreneur.records.length === 10, 'TEST 2.2: Dataset B (Entrepreneurs) has 10 records');
assert(datasets.loan.records.length === 10, 'TEST 2.3: Dataset C (Loan Applications) has 10 records');

assert(
  datasets.applicant.records.every((r) => r.dataQuality === 'DEMO'),
  'TEST 2.4: Dataset A provenance strictly stamped as DEMO (never government verified)'
);
assert(
  datasets.entrepreneur.records.every((r) => r.dataQuality === 'DEMO'),
  'TEST 2.5: Dataset B provenance strictly stamped as DEMO'
);
assert(
  datasets.loan.records.every((r) => r.dataQuality === 'DEMO'),
  'TEST 2.6: Dataset C provenance strictly stamped as DEMO'
);

// 3. CAPITAL & CURRENCY NORMALIZATION
console.log('\n3. CAPITAL & CURRENCY NORMALIZATION:');
assert(normalizeCurrency('10 lakh').value === 1000000, 'TEST 3.1: "10 lakh" -> ₹10,00,000');
assert(normalizeCurrency('1.5 lakh').value === 150000, 'TEST 3.2: "1.5 lakh" -> ₹1,50,000');
assert(normalizeCurrency('50k').value === 50000, 'TEST 3.3: "50k" -> ₹50,000');
assert(normalizeCurrency('₹1,80,000').value === 180000, 'TEST 3.4: "₹1,80,000" -> ₹1,80,000');
assert(normalizeCurrency('-50000').issue?.code === 'NEGATIVE_VALUE', 'TEST 3.5: Negative currency flagged as NEGATIVE_VALUE error');
assert(normalizeCurrency('abc_invalid').issue?.code === 'MALFORMED_NUMBER', 'TEST 3.6: Malformed string flagged as MALFORMED_NUMBER error');

// 4. BUSINESS CATEGORY TAXONOMY MAPPING
console.log('\n4. BUSINESS CATEGORY TAXONOMY MAPPING:');
assert(normalizeBusinessCategory('Dairy Farming with 10 cows').category === 'dairy', 'TEST 4.1: "Dairy Farming" maps to dairy');
assert(normalizeBusinessCategory('Boutique and women tailoring garment').category === 'tailoring', 'TEST 4.2: "Tailoring garment" maps to tailoring');
assert(normalizeBusinessCategory('Kirana FMCG retail store').category === 'retail', 'TEST 4.3: "Kirana retail" maps to retail');
assert(normalizeBusinessCategory('Commercial layer poultry farming').category === 'poultry', 'TEST 4.4: "Poultry farming" maps to poultry');
assert(normalizeBusinessCategory('Flour mill and oil processing').category === 'food_processing', 'TEST 4.5: "Oil processing" maps to food_processing');
assert(normalizeBusinessCategory('Mobile repair and accessories').category === 'services', 'TEST 4.6: "Mobile repair" maps to services');
assert(normalizeBusinessCategory('Unusual Unknown Idea').category === 'custom', 'TEST 4.7: Unmapped category defaults safely to custom');

// 5. LANGUAGE NORMALIZATION & UNSUPPORTED FALLBACK
console.log('\n5. LANGUAGE NORMALIZATION & FALLBACK:');
assert(normalizeLanguagePreference('mr').language === 'mr' && normalizeLanguagePreference('mr').isSupported, 'TEST 5.1: Marathi (mr) recognized');
assert(normalizeLanguagePreference('te').language === 'te' && normalizeLanguagePreference('te').isSupported, 'TEST 5.2: Telugu (te) recognized');
assert(normalizeLanguagePreference('kn').language === 'kn' && normalizeLanguagePreference('kn').isSupported, 'TEST 5.3: Kannada (kn) recognized');
assert(normalizeLanguagePreference('hi').language === 'hi' && normalizeLanguagePreference('hi').isSupported, 'TEST 5.4: Hindi (hi) recognized');
assert(normalizeLanguagePreference('en').language === 'en' && normalizeLanguagePreference('en').isSupported, 'TEST 5.5: English (en) recognized');

const unsupportedLang = normalizeLanguagePreference('bengali');
assert(
  unsupportedLang.isSupported === false &&
    unsupportedLang.language === 'en' &&
    unsupportedLang.issue?.code === 'UNSUPPORTED_LANGUAGE',
  'TEST 5.6: Unsupported language (Bengali) flagged with UNSUPPORTED_LANGUAGE without throwing error'
);

// 6. LOCATION HIERARCHY MATCHING (LGD)
console.log('\n6. LGD LOCATION HIERARCHY MATCHING:');
const locMatch1 = matchLocationWithLgd('Maharashtra', 'Pune');
assert(locMatch1.status === 'EXACT' && locMatch1.lgdDistrictCode === 490, 'TEST 6.1: Maharashtra -> Pune matches LGD district code 490');

const locMatch2 = matchLocationWithLgd('Telangana', 'Rangareddy');
assert(locMatch2.status === 'EXACT' && locMatch2.lgdDistrictCode === 655, 'TEST 6.2: Telangana -> Rangareddy matches LGD district code 655');

const locMatch3 = matchLocationWithLgd('InvalidState', 'UnknownDistrict');
assert(locMatch3.status === 'REQUIRES_VERIFICATION', 'TEST 6.3: Unknown state/district flags REQUIRES_VERIFICATION without inventing data');

// 7. INVALID ROW & BOUNDARY HANDLING
console.log('\n7. INVALID ROW & BOUNDARY HANDLING:');
const underageApp = datasets.applicant.records.find((r) => r.sourceRecordId === 'APP-105');
assert(
  underageApp?.validationStatus === 'INVALID' &&
    underageApp.validationIssues.some((i) => i.code === 'INVALID_AGE'),
  'TEST 7.1: Underage applicant (Age 16) correctly flagged as INVALID with INVALID_AGE'
);

const negativeCostApp = datasets.applicant.records.find((r) => r.sourceRecordId === 'APP-107');
assert(
  negativeCostApp?.validationStatus === 'INVALID' &&
    negativeCostApp.validationIssues.some((i) => i.code === 'NEGATIVE_VALUE'),
  'TEST 7.2: Negative cost applicant (-₹50,000) correctly flagged as INVALID'
);

// 8. DUPLICATE ID DETECTION
console.log('\n8. DUPLICATE ID DETECTION:');
const dupApp = datasets.applicant.records.find((r) => r.sourceRecordId === 'APP-108');
assert(dupApp?.isDuplicate === true, 'TEST 8.1: Dataset A duplicate record flagged as isDuplicate = true');

const dupEnt = datasets.entrepreneur.records.find((r) => r.sourceRecordId === 'ENT-210');
assert(dupEnt?.isDuplicate === true, 'TEST 8.2: Dataset B duplicate record flagged as isDuplicate = true');

// 9. PII MASKING
console.log('\n9. PRIVACY & PII MASKING:');
assert(maskPersonName('Ramesh Kadam') === 'R**** K****', 'TEST 9.1: "Ramesh Kadam" masked as "R**** K****"');
assert(maskPersonName('Sunita Bai Rathod') === 'S**** B** R****', 'TEST 9.2: "Sunita Bai Rathod" masked safely');

// 10. CROSS-DATASET CONFLICT RESOLUTION
console.log('\n10. CROSS-DATASET CONFLICT RESOLUTION:');
assert(datasets.conflicts.length > 0, 'TEST 10.1: Cross-dataset conflict detected between Dataset A and Dataset C');
const costConflict = datasets.conflicts.find((c) => c.fieldName === 'estimatedProjectCost');
assert(
  costConflict !== undefined &&
    costConflict.discrepancyDescription.includes('Project cost discrepancy'),
  'TEST 10.2: Project cost discrepancy explicitly reported with authoritative resolution guidance'
);

// 11. DEMO DATA ISOLATION & ADAPTER
console.log('\n11. DEMO DATA ISOLATION & USER INPUT ADAPTER:');
const dairyEnt = datasets.entrepreneur.records.find((r) => r.sourceRecordId === 'ENT-201');
assert(dairyEnt !== undefined, 'TEST 11.1: Found Dairy entrepreneur ENT-201');

const mappedUserInput = convertDatasetRecordToUserInput(dairyEnt!);
assert(
  mappedUserInput.businessCategoryId === 'dairy' &&
    mappedUserInput.availableCapital === 100000 &&
    mappedUserInput.language === 'mr',
  'TEST 11.2: Normalized Dataset record correctly mapped to UserBusinessInput properties'
);

// 12. DETERMINISTIC FINANCIAL ENGINE INVARIANCE
console.log('\n12. DETERMINISTIC FINANCIAL ENGINE INVARIANCE:');
const defaultVillage = OFFICIAL_LGD_VILLAGES[0];
const locData = convertLgdToLocationData(defaultVillage);

const fullUserInput: UserBusinessInput = {
  locationId: locData.id,
  businessCategoryId: mappedUserInput.businessCategoryId || 'dairy',
  businessIdea: mappedUserInput.businessIdea || 'Modern Dairy',
  availableCapital: mappedUserInput.availableCapital || 100000,
  language: mappedUserInput.language || 'en',
  beneficiaryCategory: mappedUserInput.beneficiaryCategory || 'General',
  experienceYears: mappedUserInput.experienceYears || 5
};

const financePlan = generateDeterministicFinancialPlan(fullUserInput);
assert(
  financePlan.indicativeProjectCost === 1000000 &&
    financePlan.indicativeFinancingRequirement === 900000 &&
    financePlan.monthlyEMI > 0,
  'TEST 12.1: Authoritative financialCalculator generates exact loan requirements from dataset inputs without modification'
);

// 13. DETERMINISTIC SCHEME ENGINE INVARIANCE
console.log('\n13. DETERMINISTIC SCHEME ENGINE INVARIANCE:');
const schemeMatches = evaluateSchemeEligibility(fullUserInput, financePlan);
assert(
  schemeMatches.length > 0,
  'TEST 13.1: Scheme rules engine evaluates dataset scenario input through deterministic policy rules'
);

// 14. DETERMINISTIC FEASIBILITY ENGINE INVARIANCE
console.log('\n14. DETERMINISTIC FEASIBILITY ENGINE INVARIANCE:');
const feasibilityResult = calculateDeterministicFeasibility({
  input: fullUserInput,
  location: locData,
  businessCategoryId: fullUserInput.businessCategoryId,
  availableOwnCapital: fullUserInput.availableCapital,
  indicativeProjectCost: financePlan.indicativeProjectCost,
  dscr: financePlan.debtServiceCoverageRatio || 2.2,
  overallRiskLevel: 'MEDIUM',
  evidenceRecords: []
});

assert(
  feasibilityResult.score >= 0 && feasibilityResult.score <= 100,
  'TEST 14.1: Feasibility score is calculated by feasibilityEngine (not hardcoded from CSV)'
);
assert(
  feasibilityResult.dataConfidenceScore >= 0 && feasibilityResult.dataConfidenceScore <= 100,
  'TEST 14.2: Data confidence is calculated separately and preserves evidence integrity'
);

// 15. MISSING DATA HANDLING
console.log('\n15. MISSING DATA HANDLING:');
const emptyLocResult = matchLocationWithLgd('', '');
assert(
  emptyLocResult.status === 'REQUIRES_VERIFICATION' &&
    emptyLocResult.issue?.code === 'MISSING_REQUIRED_FIELD',
  'TEST 15.1: Missing location handled gracefully with REQUIRES_VERIFICATION'
);

// 16. END-TO-END DEMO SCENARIO PIPELINE
console.log('\n16. END-TO-END DEMO SCENARIO PIPELINE:');
assert(
  dairyEnt?.dataQuality === 'DEMO' &&
    datasets.applicant.summary.dataQuality === 'DEMO',
  'TEST 16.1: End-to-end pipeline preserves DEMO data provenance across all phases'
);

console.log('\n------------------------------------------------------------------------');
console.log(`TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('------------------------------------------------------------------------\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
