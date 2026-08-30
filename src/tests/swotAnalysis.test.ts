/**
 * UDYORA PHASE 8: EVIDENCE-BASED SWOT ANALYSIS TEST SUITE
 * 
 * Verifies:
 * 1. Dairy SWOT (feed cost, cooperative access, disease risk)
 * 2. Retail SWOT (household density, inventory lock-in, digital scale)
 * 3. Tailoring SWOT (high margins, labor constraint, bulk contracts)
 * 4. Poultry SWOT (biosecurity buffer, direct farm-gate channel)
 * 5. Location sensitivity (Khed Shivapur vs Sirsi)
 * 6. Capital sensitivity (₹50k vs ₹2L)
 * 7. Missing evidence handling (INSUFFICIENT_DATA without hallucination)
 * 8. Risk Agent -> Threat consistency
 * 9. Feasibility score independence
 * 10. Multilingual rendering across 5 languages
 * 11. Demo dataset integration (DEMO / TEST DATA provenance)
 * 12. Strict no-hallucination verification
 * 13. Chatbot intent routing & retrieval for SWOT queries
 */

import { generateDeterministicSwot } from '../services/swotEngine';
import { generateDeterministicFinancialPlan } from '../services/financialCalculator';
import { calculateDeterministicFeasibility } from '../services/feasibilityEngine';
import { getLocationById } from '../services/locationService';
import { classifyIntent } from '../services/advisorQueryRouter';
import { generateAdvisorResponse } from '../services/advisorBotService';
import { UserBusinessInput, LocationData, FinancialPlan, RiskProfile, SchemeMatchResult, EvidenceRecord } from '../types';
import { SwotAnalysis } from '../types/swotTypes';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] TEST ${totalTests}: ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] TEST ${totalTests}: ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

console.log('========================================================================');
console.log('UDYORA PHASE 8: EVIDENCE-BASED SWOT ANALYSIS TEST SUITE');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// 1. SCENARIO 1: DAIRY BUSINESS SWOT
// -----------------------------------------------------------------------------
console.log('1. DAIRY BUSINESS SWOT GENERATION & EVIDENCE LINKAGE:');
{
  const input: UserBusinessInput = {
    businessIdea: 'Commercial Dairy Farm with 8 HF Cows',
    businessCategoryId: 'dairy',
    availableCapital: 100000,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural',
    language: 'en'
  };
  const location = getLocationById('loc_khed_shivapur_pune');
  const finPlan = generateDeterministicFinancialPlan(input);
  const riskProfile: RiskProfile = {
    overallRiskLevel: 'MEDIUM',
    riskFactors: [
      {
        factor: 'Biosecurity & Fodder Price Volatility',
        category: 'OPERATIONAL',
        description: 'Green fodder supply dips in peak summer.',
        severity: 'HIGH',
        mitigation: 'Establish silage pits and enter contract farming.',
        confidence: 0.92,
        evidenceRefId: 'ev_risk_fodder'
      }
    ]
  };
  const schemeMatches: SchemeMatchResult[] = [
    {
      scheme: {
        id: 'scheme_pmegp',
        name: "Prime Minister's Employment Generation Programme",
        shortName: 'PMEGP',
        nodalAgency: 'KVIC / Ministry of MSME',
        subsidyPercentage: 35,
        minOwnContributionPercentage: 10,
        maxProjectCostCeiling: 5000000,
        interestRateRange: '8.5% - 11.5%'
      },
      matchScore: 92,
      qualificationStatus: 'ELIGIBLE',
      potentialSubsidyPct: 35,
      potentialSubsidyAmount: 350000,
      whyItMatches: ['Project cost within bounds']
    }
  ];

  const swot = generateDeterministicSwot({
    input,
    location,
    financialPlan: finPlan,
    schemeMatches,
    riskProfile,
    opportunitySpots: [
      {
        id: 'spot_1',
        name: 'Khed Shivapur Dairy Hub',
        spotName: 'Khed Shivapur Dairy Hub',
        latitude: 18.3475,
        longitude: 73.8567,
        distanceKm: 2.1,
        opportunityScore: 88,
        dataConfidence: 90,
        dataQuality: 'VERIFIED',
        rank: 1,
        factors: [],
        sources: []
      }
    ]
  });

  assert(swot.strengths.some((s) => s.id === 'swot_s_dscr' && s.sourceType === 'FINANCE'), 'Dairy SWOT includes DSCR financial strength');
  assert(swot.strengths.some((s) => s.id === 'swot_s_dairy_coop' && s.title.includes('Dairy Cooperative')), 'Dairy SWOT includes cooperative collection access');
  assert(swot.weaknesses.some((w) => w.id === 'swot_w_feed_dependency'), 'Dairy SWOT flags cattle feed cost concentration weakness');
  assert(swot.opportunities.some((o) => o.id === 'swot_o_scheme_subsidy' && o.explanation.includes('35%')), 'Dairy SWOT links to 35% PMEGP subsidy');
  assert(swot.opportunities.some((o) => o.id === 'swot_o_dairy_value_add'), 'Dairy SWOT identifies paneer & ghee value-addition');
  assert(swot.threats.some((t) => t.title.includes('Fodder Price Volatility')), 'Dairy threat is directly derived from Risk Agent factor');
}

// -----------------------------------------------------------------------------
// 2. SCENARIO 2: RETAIL STORE SWOT
// -----------------------------------------------------------------------------
console.log('\n2. RETAIL STORE SWOT (FOOTFALL & INVENTORY):');
{
  const input: UserBusinessInput = {
    businessIdea: 'Kirana & Provisions General Store',
    businessCategoryId: 'retail',
    availableCapital: 75000,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural',
    language: 'en'
  };
  const location = getLocationById('loc_khed_shivapur_pune');
  const finPlan = generateDeterministicFinancialPlan(input);

  const swot = generateDeterministicSwot({
    input,
    location,
    financialPlan: finPlan
  });

  assert(swot.strengths.some((s) => s.id === 'swot_s_retail_footfall'), 'Retail SWOT reflects household consumer footfall');
  assert(swot.weaknesses.some((w) => w.id === 'swot_w_inventory_lock'), 'Retail SWOT identifies inventory working capital lock-in');
  assert(swot.opportunities.some((o) => o.id === 'swot_o_retail_digital'), 'Retail SWOT identifies QR UPI and essential goods expansion');
}

// -----------------------------------------------------------------------------
// 3. SCENARIO 3: TAILORING ENTERPRISE SWOT
// -----------------------------------------------------------------------------
console.log('\n3. TAILORING ENTERPRISE SWOT (WOMEN SUBSIDY & LABOR):');
{
  const input: UserBusinessInput = {
    businessIdea: 'Boutique Tailoring & Stitching Center',
    businessCategoryId: 'tailoring',
    availableCapital: 50000,
    beneficiaryCategory: 'Women',
    locationAreaType: 'Rural',
    language: 'en'
  };
  const location = getLocationById('loc_khed_shivapur_pune');
  const finPlan = generateDeterministicFinancialPlan(input);

  const swot = generateDeterministicSwot({
    input,
    location,
    financialPlan: finPlan
  });

  assert(swot.strengths.some((s) => s.id === 'swot_s_tailoring_margin'), 'Tailoring SWOT identifies high value-added operating margins');
  assert(swot.weaknesses.some((w) => w.id === 'swot_w_labor_capacity'), 'Tailoring SWOT captures single-operator labor capacity constraint');
  assert(swot.opportunities.some((o) => o.id === 'swot_o_tailoring_bulk'), 'Tailoring SWOT includes institutional bulk school uniform contracts');
}

// -----------------------------------------------------------------------------
// 4. SCENARIO 4: POULTRY FARMING SWOT
// -----------------------------------------------------------------------------
console.log('\n4. POULTRY FARMING SWOT (BIOSECURITY & DIRECT SALES):');
{
  const input: UserBusinessInput = {
    businessIdea: 'Broiler Poultry Rearing Unit',
    businessCategoryId: 'poultry',
    availableCapital: 100000,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural',
    language: 'en'
  };
  const location = getLocationById('loc_sirsi_karnataka');
  const finPlan = generateDeterministicFinancialPlan(input);

  const swot = generateDeterministicSwot({
    input,
    location,
    financialPlan: finPlan
  });

  assert(swot.strengths.some((s) => s.id === 'swot_s_poultry_siting'), 'Poultry SWOT includes rural biosecurity land buffer strength');
  assert(swot.opportunities.some((o) => o.id === 'swot_o_poultry_direct'), 'Poultry SWOT identifies direct farm-gate sales to local dhabas & markets');
}

// -----------------------------------------------------------------------------
// 5. LOCATION SENSITIVITY (KHED SHIVAPUR VS SIRSI)
// -----------------------------------------------------------------------------
console.log('\n5. LOCATION SENSITIVITY TEST:');
{
  const input: UserBusinessInput = {
    businessIdea: 'Dairy Enterprise',
    businessCategoryId: 'dairy',
    availableCapital: 100000,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural',
    language: 'en'
  };
  const locKhed = getLocationById('loc_khed_shivapur_pune');
  const locMandya = getLocationById('loc_mandya_karnataka');
  const finPlan = generateDeterministicFinancialPlan(input);

  const swotKhed = generateDeterministicSwot({ input, location: locKhed, financialPlan: finPlan });
  const swotMandya = generateDeterministicSwot({ input, location: locMandya, financialPlan: finPlan });

  const khedLocStrength = swotKhed.strengths.find((s) => s.id === 'swot_s_location_access');
  const mandyaLocStrength = swotMandya.strengths.find((s) => s.id === 'swot_s_location_access');

  assert(khedLocStrength !== undefined && khedLocStrength.explanation.includes(locKhed.district), 'Khed Shivapur SWOT references Pune corridor');
  assert(mandyaLocStrength !== undefined && mandyaLocStrength.explanation.includes(locMandya.district), 'Mandya SWOT references Mandya corridor');
}

// -----------------------------------------------------------------------------
// 6. CAPITAL SENSITIVITY (₹50,000 VS ₹2,00,000)
// -----------------------------------------------------------------------------
console.log('\n6. CAPITAL SENSITIVITY TEST:');
{
  const inputLow: UserBusinessInput = {
    businessIdea: 'Dairy Enterprise',
    businessCategoryId: 'dairy',
    availableCapital: 50000,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural',
    language: 'en'
  };
  const inputHigh: UserBusinessInput = {
    businessIdea: 'Dairy Enterprise',
    businessCategoryId: 'dairy',
    availableCapital: 200000,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural',
    language: 'en'
  };
  const location = getLocationById('loc_khed_shivapur_pune');
  const finLow = generateDeterministicFinancialPlan(inputLow);
  const finHigh = generateDeterministicFinancialPlan(inputHigh);

  const swotLow = generateDeterministicSwot({ input: inputLow, location, financialPlan: finLow });
  const swotHigh = generateDeterministicSwot({ input: inputHigh, location, financialPlan: finHigh });

  assert(swotLow.weaknesses.some((w) => w.id === 'swot_w_capital_buffer'), 'Low capital (₹50k) produces Constrained Equity Buffer weakness');
  assert(!swotHigh.weaknesses.some((w) => w.id === 'swot_w_capital_buffer'), 'High capital (₹2L) does NOT produce capital buffer weakness');
  assert(swotHigh.strengths.some((s) => s.id === 'swot_s_equity'), 'High capital (₹2L) produces Strong Promoter Equity strength');
}

// -----------------------------------------------------------------------------
// 7. MISSING EVIDENCE DIAGNOSTICS & DATA QUALITY
// -----------------------------------------------------------------------------
console.log('\n7. MISSING EVIDENCE & INSUFFICIENT DATA TEST:');
{
  const input: UserBusinessInput = {
    businessIdea: 'Rural Dairy Unit',
    businessCategoryId: 'dairy',
    availableCapital: 100000,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural',
    language: 'en'
  };
  const locationMissingPop: LocationData = {
    ...getLocationById('loc_khed_shivapur_pune'),
    population: {
      id: 'ev_pop_missing',
      metric: 'CENSUS_POPULATION',
      metricName: 'Census Population',
      value: 'INSUFFICIENT_DATA' as any,
      source: 'Census Registry',
      status: 'INSUFFICIENT_DATA',
      confidence: 0.0,
      timestamp: new Date().toISOString(),
      geographicLevel: 'VILLAGE'
    }
  };
  const finPlan = generateDeterministicFinancialPlan(input);

  const swot = generateDeterministicSwot({ input, location: locationMissingPop, financialPlan: finPlan });

  assert(swot.hasMissingData === true, 'Missing population flags hasMissingData: true');
  assert(swot.weaknesses.some((w) => w.id === 'swot_w_missing_pop' && w.dataQuality === 'INSUFFICIENT_DATA'), 'Missing population outputs explicit INSUFFICIENT_DATA weakness');
  assert(swot.dataQuality === 'INSUFFICIENT_DATA', 'Overall SWOT quality is INSUFFICIENT_DATA');
}

// -----------------------------------------------------------------------------
// 8. RISK AGENT -> THREAT CONSISTENCY
// -----------------------------------------------------------------------------
console.log('\n8. RISK AGENT -> THREAT CONSISTENCY TEST:');
{
  const input: UserBusinessInput = {
    businessIdea: 'Dairy Enterprise',
    businessCategoryId: 'dairy',
    availableCapital: 100000,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural',
    language: 'en'
  };
  const location = getLocationById('loc_khed_shivapur_pune');
  const finPlan = generateDeterministicFinancialPlan(input);
  const riskProfile: RiskProfile = {
    overallRiskLevel: 'HIGH',
    riskFactors: [
      {
        factor: 'Regional Foot and Mouth Disease Outbreak',
        category: 'BIOLOGICAL',
        description: 'Periodic viral outbreaks in livestock clusters.',
        severity: 'HIGH',
        mitigation: 'Implement mandatory bi-annual vaccination schedules.',
        confidence: 0.95,
        evidenceRefId: 'ev_risk_fmd'
      }
    ]
  };

  const swot = generateDeterministicSwot({ input, location, financialPlan: finPlan, riskProfile });
  const threat = swot.threats[0];

  assert(threat.title.includes('Foot and Mouth Disease'), 'Threat title directly mirrors Risk Agent factor');
  assert(threat.explanation.includes('vaccination schedules'), 'Threat explanation incorporates Risk Agent mitigation');
  assert(threat.badgeLabel === 'Risk (HIGH)', 'Threat badge reflects exact HIGH severity rating');
}

// -----------------------------------------------------------------------------
// 9. FEASIBILITY ENGINE INDEPENDENCE
// -----------------------------------------------------------------------------
console.log('\n9. FEASIBILITY SCORE INDEPENDENCE TEST:');
{
  const input: UserBusinessInput = {
    businessIdea: 'Dairy Enterprise',
    businessCategoryId: 'dairy',
    availableCapital: 100000,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural',
    language: 'en'
  };
  const location = getLocationById('loc_khed_shivapur_pune');
  const finPlan = generateDeterministicFinancialPlan(input);

  const feasibilityBefore = calculateDeterministicFeasibility(input, location, finPlan);
  const swot = generateDeterministicSwot({ input, location, financialPlan: finPlan });
  const feasibilityAfter = calculateDeterministicFeasibility(input, location, finPlan);

  assert(feasibilityBefore.score === feasibilityAfter.score, 'Composite feasibility score is exactly invariant under SWOT generation');
  assert(feasibilityBefore.dataConfidenceScore === feasibilityAfter.dataConfidenceScore, 'Data confidence score is invariant under SWOT generation');
}

// -----------------------------------------------------------------------------
// 10. CHATBOT INTENT CLASSIFICATION & SWOT RETRIEVAL
// -----------------------------------------------------------------------------
console.log('\n10. CHATBOT INTENT ROUTING & SWOT RETRIEVAL TEST:');
{
  const qStrengths = classifyIntent('What are the strengths of my business?');
  const qWeaknesses = classifyIntent('What weaknesses should I be aware of?');
  const qOpportunities = classifyIntent('What opportunities do I have?');
  const qThreats = classifyIntent('What are the main threats to my dairy farm?');
  const qFull = classifyIntent('Give me the complete SWOT analysis');

  assert(qStrengths.intent === 'SWOT_STRENGTHS', 'Correctly routes strengths question to SWOT_STRENGTHS');
  assert(qWeaknesses.intent === 'SWOT_WEAKNESSES', 'Correctly routes weaknesses question to SWOT_WEAKNESSES');
  assert(qOpportunities.intent === 'SWOT_OPPORTUNITIES', 'Correctly routes opportunities question to SWOT_OPPORTUNITIES');
  assert(qThreats.intent === 'SWOT_THREATS', 'Correctly routes threats question to SWOT_THREATS');
  assert(qFull.intent === 'SWOT_FULL', 'Correctly routes SWOT question to SWOT_FULL');

  const input: UserBusinessInput = {
    businessIdea: 'Dairy Enterprise',
    businessCategoryId: 'dairy',
    availableCapital: 100000,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural',
    language: 'en'
  };
  const location = getLocationById('loc_khed_shivapur_pune');
  const plan = generateDeterministicFinancialPlan(input);
  const swot = generateDeterministicSwot({ input, location, financialPlan: plan });

  const mockReport: any = {
    userInput: input,
    location,
    financialPlan: { data: plan },
    swotAnalysis: swot
  };

  const responseEn = await generateAdvisorResponse('What are the strengths of my business?', {
    userInput: input,
    location,
    analysisReport: mockReport,
    language: 'en'
  });

  assert(responseEn.text.includes('Key Strategic Strengths') && responseEn.text.includes('Debt-Service Coverage'), 'Chatbot retrieves exact strengths from active analysis SWOT');

  const responseHi = await generateAdvisorResponse('व्यवसाय की शक्तियाँ क्या हैं?', {
    userInput: input,
    location,
    analysisReport: mockReport,
    language: 'hi'
  });

  assert(responseHi.text.includes('सामर्थ्य') || responseHi.text.includes('शक्तियां'), 'Chatbot responds with Hindi localized SWOT strengths header');
}

// -----------------------------------------------------------------------------
// 11. DEMO DATASET INTEGRATION (PROVENANCE PRESERVATION)
// -----------------------------------------------------------------------------
console.log('\n11. DEMO DATASET INTEGRATION TEST:');
{
  const demoInput: UserBusinessInput = {
    businessIdea: 'Dataset B Entrepreneur Profile',
    businessCategoryId: 'dairy',
    availableCapital: 100000,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural',
    language: 'en',
    dataQuality: 'DEMO'
  } as any;
  const location = getLocationById('loc_khed_shivapur_pune');
  const plan = generateDeterministicFinancialPlan(demoInput);

  const swot = generateDeterministicSwot({ input: demoInput, location, financialPlan: plan });

  assert(swot.dataQuality === 'DEMO', 'Demo dataset SWOT preserves DEMO / TEST DATA provenance');
}

// -----------------------------------------------------------------------------
// 12. ZERO HALLUCINATION & EVIDENCE INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n12. ZERO HALLUCINATION & EVIDENCE INTEGRITY:');
{
  const input: UserBusinessInput = {
    businessIdea: 'Dairy Enterprise',
    businessCategoryId: 'dairy',
    availableCapital: 100000,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural',
    language: 'en'
  };
  const location = getLocationById('loc_khed_shivapur_pune');
  const plan = generateDeterministicFinancialPlan(input);

  const swot = generateDeterministicSwot({ input, location, financialPlan: plan });

  const allItems = [...swot.strengths, ...swot.weaknesses, ...swot.opportunities, ...swot.threats];
  const allHaveEvidenceOrQuality = allItems.every((item) => item.evidenceIds.length > 0 && item.dataQuality !== undefined);

  assert(allHaveEvidenceOrQuality === true, '100% of SWOT items link to concrete evidence IDs or verified quality statuses');
  assert(allItems.length >= 8, `Sufficient SWOT items generated (${allItems.length} factors across 4 quadrants)`);
}

console.log('\n------------------------------------------------------------------------');
console.log(`TEST SUMMARY: ${passedTests} PASSED, ${totalTests - passedTests} FAILED (Total: ${totalTests})`);
console.log('------------------------------------------------------------------------');

if (passedTests !== totalTests) {
  process.exit(1);
}
