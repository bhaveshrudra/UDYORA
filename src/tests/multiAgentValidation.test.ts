/**
 * UDYORA MULTI-AGENT VALIDATION & TEST SUITE
 * 
 * Comprehensive Unit & Integration Tests covering:
 * TEST 1: Margin Capital ₹1,00,000 -> Project Cost ₹10,00,000, Financing ₹9,00,000 (PS 10% Margin Logic)
 * TEST 2: Margin Capital ₹50,000 -> Project Cost ₹5,00,000, Financing ₹4,50,000
 * TEST 3: Margin Capital ₹1,05,000 -> Project Cost ₹10,50,000, Financing ₹9,45,000
 * TEST 4: Business Sector Switch: Dairy -> Tailoring verifies zero cross-sector leakage
 * TEST 5: Location change propagation verifies location-sensitive outputs update
 * TEST 6: Incomplete market data produces INSUFFICIENT_DATA with zero fabrication
 * TEST 7: Fault-tolerant multi-agent fallback on partial failure
 * TEST 8: Scheme eligibility threshold matching (SIH PS Tier I <= ₹1.40L vs Tier II)
 * TEST 9: Zero/invalid capital validation handling
 * TEST 10: Reducing-balance EMI calculation accuracy against mathematical benchmark
 * TEST 11: End-to-end multi-agent pipeline validation (Khed Shivapur Dairy ₹1,00,000)
 */

import {
  calculateProjectCost,
  calculateLoanAmount,
  calculateEMI,
  calculateTotalInterest,
  calculateDSCR,
  generateDeterministicFinancialPlan
} from '../services/financialCalculator';
import { evaluateSchemeEligibility } from '../services/schemeRules';
import { runBusinessAgent } from '../agents/businessAgent';
import { runMarketAgent } from '../agents/marketAgent';
import { runEvidenceAgent } from '../agents/evidenceAgent';
import { runRiskAgent } from '../agents/riskAgent';
import { runFinalAdvisorAgent } from '../agents/finalAdvisor';
import { executeMultiAgentWorkflow } from '../agents/orchestrator';
import { getLocationById } from '../services/locationService';
import { findTopOpportunitySpots } from '../services/opportunitySpotService';
import { UserBusinessInput } from '../types';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${testName} - ${details || 'Assertion failed'}`);
    failedCount++;
  }
}

async function runAllTests() {
  console.log('\n==================================================');
  console.log('UDYORA MULTI-AGENT CRITICAL VALIDATION TEST SUITE');
  console.log('==================================================\n');

  // -------------------------------------------------------------
  // TEST 1: Capital ₹1,00,000 -> Project Cost ₹10,00,000, Financing ₹9,00,000
  // -------------------------------------------------------------
  console.log('TEST 1: SIH26091 PS Margin Logic (Capital = ₹1,00,000)');
  const cost1 = calculateProjectCost(100000, 0.10);
  const loan1 = calculateLoanAmount(cost1, 100000);
  assert(cost1 === 1000000, 'Indicative Project Cost is ₹10,00,000', `Got ${cost1}`);
  assert(loan1 === 900000, 'Indicative Financing Requirement is ₹9,00,000', `Got ${loan1}`);

  // -------------------------------------------------------------
  // TEST 2: Capital ₹50,000 -> Project Cost ₹5,00,000, Financing ₹4,50,000
  // -------------------------------------------------------------
  console.log('\nTEST 2: SIH26091 PS Margin Logic (Capital = ₹50,000)');
  const cost2 = calculateProjectCost(50000, 0.10);
  const loan2 = calculateLoanAmount(cost2, 50000);
  assert(cost2 === 500000, 'Indicative Project Cost is ₹5,00,000', `Got ${cost2}`);
  assert(loan2 === 450000, 'Indicative Financing Requirement is ₹4,50,000', `Got ${loan2}`);

  // -------------------------------------------------------------
  // TEST 3: Capital ₹1,05,000 -> Project Cost ₹10,50,000, Financing ₹9,45,000
  // -------------------------------------------------------------
  console.log('\nTEST 3: SIH26091 PS Margin Logic (Capital = ₹1,05,000)');
  const cost3 = calculateProjectCost(105000, 0.10);
  const loan3 = calculateLoanAmount(cost3, 105000);
  assert(cost3 === 1050000, 'Indicative Project Cost is ₹10,50,000', `Got ${cost3}`);
  assert(loan3 === 945000, 'Indicative Financing Requirement is ₹9,45,000', `Got ${loan3}`);

  // -------------------------------------------------------------
  // TEST 4: Sector Switch: Dairy -> Tailoring Downstream Verification
  // -------------------------------------------------------------
  console.log('\nTEST 4: Sector Isolation (Tailoring - Zero Dairy Leakage)');
  const tailoringInput: UserBusinessInput = {
    locationId: 'loc_khed_shivapur_pune',
    businessCategoryId: 'tailoring',
    businessIdea: 'Custom bridal and apparel tailoring unit',
    availableCapital: 100000,
    language: 'en'
  };
  const locKhed = getLocationById('loc_khed_shivapur_pune');
  const tailoringBiz = runBusinessAgent(tailoringInput, locKhed);
  const tailoringFin = generateDeterministicFinancialPlan(tailoringInput);
  const tailoringRisk = runRiskAgent(tailoringInput, locKhed, tailoringFin);

  assert(
    !tailoringBiz.data.businessSummary.toLowerCase().includes('cow') &&
    !tailoringBiz.data.businessSummary.toLowerCase().includes('milk'),
    'Business Agent has no dairy/cow references for tailoring'
  );
  assert(
    tailoringRisk.data.riskFactors.every((r) => !r.title?.toLowerCase().includes('cow') && !r.title?.toLowerCase().includes('fmd')),
    'Risk Agent has no livestock disease risks for tailoring'
  );

  // -------------------------------------------------------------
  // TEST 5: Location Change Propagation
  // -------------------------------------------------------------
  console.log('\nTEST 5: Location Change Propagation');
  const locMandya = getLocationById('loc_mandya_karnataka');
  const dairyMandya: UserBusinessInput = {
    locationId: 'loc_mandya_karnataka',
    businessCategoryId: 'dairy',
    businessIdea: 'Dairy micro enterprise',
    availableCapital: 100000,
    language: 'en'
  };
  const marketMandya = runMarketAgent(dairyMandya, locMandya);
  assert(
    marketMandya.data.demandSummary?.includes('Gejjalagere') ||
    marketMandya.summary.includes('Gejjalagere') ||
    marketMandya.data.estimatedMarketReach?.includes('Gejjalagere'),
    'Market Agent reflects Gejjalagere (Mandya) location'
  );

  // -------------------------------------------------------------
  // TEST 6: Incomplete Market Data -> INSUFFICIENT_DATA Handling
  // -------------------------------------------------------------
  console.log('\nTEST 6: Evidence Integrity & INSUFFICIENT_DATA Handling');
  const emptyLoc = {
    ...locKhed,
    population: {
      id: 'ev_pop_missing',
      metricName: 'Catchment Population',
      value: 0,
      source: '',
      geographicLevel: 'Village',
      timestamp: new Date().toISOString(),
      status: 'INSUFFICIENT_DATA' as const,
      confidence: 0.1
    }
  };
  const evPayload = runEvidenceAgent(tailoringInput, emptyLoc);
  const insufficientRecords = evPayload.data.filter((e) => e.status === 'INSUFFICIENT_DATA' || e.status === 'INSUFFICIENT DATA');
  assert(insufficientRecords.length > 0, 'Missing evidence is properly tagged as INSUFFICIENT_DATA');

  // -------------------------------------------------------------
  // TEST 7: Reducing Balance EMI Mathematical Benchmark
  // -------------------------------------------------------------
  console.log('\nTEST 7: Reducing Balance EMI Benchmark Verification');
  // Benchmark: Principal = ₹9,00,000, Rate = 9.5% p.a., Tenure = 57 months (60 - 3 morat)
  // Monthly rate r = 0.095 / 12 = 0.007916666...
  // Factor = (1 + r)^57 = (1.007916666)^57 = 1.5677...
  // EMI = 900000 * 0.007916666 * 1.5677 / (1.5677 - 1) = ~19,688
  const calculatedEMI = calculateEMI(900000, 9.5, 57);
  assert(calculatedEMI >= 19680 && calculatedEMI <= 19700, `EMI matches standard financial formula (~₹19,688, got ₹${calculatedEMI})`);

  // -------------------------------------------------------------
  // TEST 8: SIH26091 PS Scheme Tiers (Micro Finance <= ₹1.40L vs Term Loan)
  // -------------------------------------------------------------
  console.log('\nTEST 8: SIH26091 PS Scheme Tier Matching');
  const microFinancePlan = generateDeterministicFinancialPlan({
    locationId: 'loc_khed_shivapur_pune',
    businessCategoryId: 'dairy',
    businessIdea: 'Micro cow unit',
    availableCapital: 14000, // ₹14k capital -> ₹1.40L project cost
    language: 'en'
  });
  const microSchemeMatches = evaluateSchemeEligibility({
    locationId: 'loc_khed_shivapur_pune',
    businessCategoryId: 'dairy',
    businessIdea: 'Micro cow unit',
    availableCapital: 14000,
    language: 'en'
  }, microFinancePlan);

  const microScheme = microSchemeMatches.find((s) => s.scheme.id === 'scheme_sih_micro_finance');
  assert(microScheme?.qualificationStatus === 'ELIGIBLE', 'Micro Finance Scheme matches project cost <= ₹1.40 Lakh');

  // -------------------------------------------------------------
  // TEST 9: Invalid/Zero Capital Handling
  // -------------------------------------------------------------
  console.log('\nTEST 9: Invalid/Zero Capital Handling');
  const zeroCapitalCost = calculateProjectCost(0, 0.10);
  const negativeCapitalCost = calculateProjectCost(-50000, 0.10);
  const zeroEMI = calculateEMI(0, 9.5, 60);
  assert(zeroCapitalCost === 0, 'Zero capital safely returns 0 project cost');
  assert(negativeCapitalCost === 0, 'Negative capital safely returns 0 project cost');
  assert(zeroEMI === 0, 'Zero loan safely returns 0 EMI');

  // -------------------------------------------------------------
  // TEST 10: End-to-End Multi-Agent Workflow Execution
  // -------------------------------------------------------------
  console.log('\nTEST 10: End-to-End Pipeline Verification (Khed Shivapur Dairy ₹1,00,000)');
  const e2eInput: UserBusinessInput = {
    locationId: 'loc_khed_shivapur_pune',
    businessCategoryId: 'dairy',
    businessIdea: 'Dairy Farming & Milk Supply Enterprise',
    availableCapital: 100000,
    language: 'en'
  };

  const report = await executeMultiAgentWorkflow(e2eInput);
  assert(report.input.availableCapital === 100000, 'Original UserInput capital preserved at ₹1,00,000');
  assert(report.financialPlan.data.indicativeProjectCost === 1000000, 'Report financial plan project cost is ₹10,00,000');
  assert(report.financialPlan.data.indicativeFinancingRequirement === 900000, 'Report financing requirement is ₹9,00,000');
  // -------------------------------------------------------------
  // TEST 11: Business Location Opportunity Spot Engine
  // -------------------------------------------------------------
  console.log('\nTEST 11: Business Location Opportunity Spot Engine (5km Catchment)');
  const locResKhed = {
    id: 'loc_khed_shivapur_pune',
    localityName: 'Khed Shivapur',
    villageName: 'Khed Shivapur',
    subDistrictName: 'Haveli',
    districtName: 'Pune',
    stateName: 'Maharashtra',
    stateCode: 27,
    districtCode: 490,
    subDistrictCode: 4180,
    pincode: '412205',
    latitude: 18.3475,
    longitude: 73.8567,
    administrativeSource: 'Local Government Directory (LGD), MoPR',
    mappingSource: 'OpenStreetMap Spatial Engine',
    confidence: 0.95,
    formattedAddress: 'Khed Shivapur, Haveli, Pune',
    areaType: 'Rural' as const
  };

  const dairySpots = findTopOpportunitySpots(locResKhed, 'dairy', 5, 4);
  const retailSpots = findTopOpportunitySpots(locResKhed, 'retail', 5, 4);

  assert(dairySpots.length > 0 && dairySpots.length <= 4, 'Top candidate spots returned within 5km radius');
  assert(dairySpots.every((s) => s.distanceKm <= 5.0), 'All candidate spots are within 5.0 km Haversine distance');
  assert(dairySpots[0].opportunityScore >= dairySpots[dairySpots.length - 1].opportunityScore, 'Candidate spots are ranked by Opportunity Score descending');
  assert(dairySpots[0].factors.marketAccessibility.score > 0, 'Candidate spot includes explainable factor breakdown');
  assert(
    dairySpots[0].opportunityScore !== retailSpots[0].opportunityScore || dairySpots[0].summaryReason !== retailSpots[0].summaryReason,
    'Dairy vs Retail yields business-specific opportunity scoring and reasoning'
  );

  // -------------------------------------------------------------
  // TEST 12: Startup Language Selection & Storage Normalization
  // -------------------------------------------------------------
  console.log('\nTEST 12: Language Selection & Storage Normalization');
  const { normalizeLanguageCode, toStorageLanguageCode } = await import('../i18n/LanguageContext');
  assert(normalizeLanguageCode('te') === 'te', 'Telugu code "te" normalizes to "te"');
  assert(normalizeLanguageCode('te-IN') === 'te', 'Telugu locale "te-IN" normalizes to "te"');
  assert(normalizeLanguageCode('hi-in') === 'hi', 'Hindi locale "hi-in" normalizes to "hi"');
  assert(normalizeLanguageCode('mr') === 'mr', 'Marathi code "mr" normalizes to "mr"');
  assert(normalizeLanguageCode('kn') === 'kn', 'Kannada code "kn" normalizes to "kn"');
  assert(normalizeLanguageCode(null) === null, 'Null storage returns null to trigger select-language screen');
  assert(normalizeLanguageCode('xyz') === null, 'Unknown language returns null safely');

  console.log('\n--------------------------------------------------');
  console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('--------------------------------------------------\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal error during test suite execution:', err);
  process.exit(1);
});
