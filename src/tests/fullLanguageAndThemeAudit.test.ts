import { TRANSLATIONS } from '../i18n/translations';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n/types';
import { calculateDeterministicFeasibility } from '../services/feasibilityEngine';
import { generateDeterministicFinancialPlan } from '../services/financialCalculator';
import * as fs from 'fs';
import * as path from 'path';

export function runLanguageAndThemeAuditTests() {
  const languages: SupportedLanguage[] = ['en', 'hi', 'mr', 'te', 'kn'];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      passed++;
      console.log(`  [PASS] ${message}`);
    } else {
      failed++;
      console.error(`  [FAIL] ${message}`);
    }
  }

  console.log('\n========================================================================');
  console.log('UDYORA TEST SUITE: FULL-PAGE LANGUAGE & THEME VALIDATION');
  console.log('========================================================================\n');

  console.log('1. MULTILINGUAL DICTIONARY INTEGRITY:');
  assert(SUPPORTED_LANGUAGES.length === 5, 'All 5 languages defined in SUPPORTED_LANGUAGES');

  const criticalKeys = [
    'nav.home',
    'nav.assessments',
    'nav.reports',
    'nav.guidance',
    'nav.sec.overview',
    'nav.sec.swot',
    'nav.sec.location',
    'nav.sec.finance',
    'nav.sec.guidance',
    'nav.sec.market',
    'nav.sec.risks',
    'nav.sec.evidence',
    'dash.snapshot.business',
    'dash.snapshot.location',
    'dash.snapshot.capital',
    'dash.snapshot.status',
    'dash.snapshot.completed',
    'dash.metric.feasibility',
    'dash.metric.confidence',
    'dash.metric.market',
    'dash.metric.financial',
    'dash.location.title',
    'dash.fin.title',
    'dash.scheme.title',
    'dash.risk.title',
    'dash.loc.topSpot',
    'dash.loc.secondSpot',
    'dash.loc.thirdSpot',
    'dash.loc.viewFactors',
    'dash.fin.ownCapital',
    'dash.fin.projectCost',
    'dash.fin.bankLoan',
    'dash.fin.monthlyEmi',
    'dash.market.title',
    'dash.market.subtitle',
    'dash.market.popLabel',
    'dash.market.households',
    'dash.market.transit',
    'dash.ev.verifiedCount',
    'dash.ev.estimatedCount',
    'dash.ev.insufficientCount',
    'dash.ev.openModal',
    'dash.advisory.actionText',
    'dash.advisory.opportunityText',
    'dash.advisory.riskText',
    'dash.advisory.nextStepText',
    'dash.advisory.downloadPdf',
    'scheme.subtab.financials',
    'scheme.subtab.overview',
    'scheme.subtab.eligibility',
    'scheme.subtab.documents',
    'scheme.subtab.process',
    'scheme.subtab.evidence',
    'scheme.col.condition',
    'scheme.col.requirement',
    'scheme.col.userValue',
    'scheme.col.status',
    'scheme.status.eligible',
    'scheme.status.condEligible',
    'scheme.status.reqVerification',
    'scheme.status.notEligible',
    'modal.close',
    'modal.finTitle',
    'modal.riskTitle',
    'modal.evidenceTitle',
    'modal.factorsTitle'
  ];

  let missingAny = false;
  languages.forEach((lang) => {
    criticalKeys.forEach((key) => {
      const val = (TRANSLATIONS[lang] as any)[key];
      if (!val || val.trim().length === 0) {
        missingAny = true;
        console.error(`Missing or empty key '${key}' in language '${lang}'`);
      }
    });
  });
  assert(!missingAny, 'All critical dashboard keys populated across all 5 languages');

  console.log('\n2. DETERMINISTIC CALCULATION INVARIANT:');
  const input: any = {
    businessCategoryId: 'dairy',
    experienceYears: 3,
    availableCapital: 150000,
    plannedTimelineMonths: 6,
    hasLocationAccess: true,
    latitude: 18.5204,
    longitude: 73.8567,
    selectedVillageId: 'VIL_PUNE_01'
  };

  const loc: any = {
    state: 'Maharashtra',
    district: 'Pune',
    subDistrict: 'Haveli',
    village: 'Shivajinagar',
    lgdCode: 'LGD_PUNE_001',
    nearestTownDistanceKm: { value: 12, status: 'VERIFIED', confidence: 0.95 }
  };

  const score1 = calculateDeterministicFeasibility({ input, location: loc });
  const score2 = calculateDeterministicFeasibility({ input, location: loc });
  assert(score1.score === score2.score && score1.score > 0, 'Feasibility score deterministic invariant verified');

  const plan1 = generateDeterministicFinancialPlan(input);
  const plan2 = generateDeterministicFinancialPlan(input);
  assert(plan1.indicativeProjectCost === plan2.indicativeProjectCost, 'Project cost deterministic invariant verified');
  assert(plan1.monthlyEMI === plan2.monthlyEMI, 'Monthly EMI deterministic invariant verified');

  console.log('\n3. THEME SYSTEM & HEADER CLEANUP:');
  const headerPath = path.resolve(process.cwd(), 'src/components/Header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf-8');
  assert(!headerContent.includes("onClick={() => setTheme('light')}"), 'Theme toggle removed from Header');
  assert(!headerContent.includes("onClick={() => setTheme('dark')}"), 'Theme dark button removed from Header');

  const navPath = path.resolve(process.cwd(), 'src/components/AppSectionNav.tsx');
  const navContent = fs.readFileSync(navPath, 'utf-8');
  const expectedIds = ['overview', 'swot', 'location', 'finance', 'guidance', 'market', 'risks', 'evidence'];
  const allIdsPresent = expectedIds.every((id) => navContent.includes(`id: '${id}'`));
  assert(allIdsPresent, 'All 8 canonical section IDs active in AppSectionNav');

  console.log('\n------------------------------------------------------------------------');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('------------------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLanguageAndThemeAuditTests();
