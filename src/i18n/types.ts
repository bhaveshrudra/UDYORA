export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'te' | 'kn';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English (EN)' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी (HI)' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी (MR)' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు (TE)' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ (KN)' },
];

export interface TranslationDictionary {
  // Common & Navigation
  'nav.home': string;
  'nav.capabilities': string;
  'nav.howItWorks': string;
  'nav.evidence': string;
  'nav.launchApp': string;
  'nav.getStarted': string;
  'nav.exploreDemo': string;
  'nav.startAnalysis': string;
  'nav.printReport': string;
  'nav.newAnalysis': string;
  'nav.newSearch': string;
  'brand.name': string;
  'brand.tagline': string;
  'brand.developedBy': string;
  'brand.badge': string;

  // Hero & Landing
  'hero.title': string;
  'hero.subtitle': string;
  'hero.supporting': string;
  'hero.empowering': string;

  // Capabilities
  'cap.sectionBadge': string;
  'cap.title': string;
  'cap.subtitle': string;
  'cap.market.title': string;
  'cap.market.desc': string;
  'cap.market.detail': string;
  'cap.feasibility.title': string;
  'cap.feasibility.desc': string;
  'cap.feasibility.detail': string;
  'cap.finance.title': string;
  'cap.finance.desc': string;
  'cap.finance.detail': string;
  'cap.guidance.title': string;
  'cap.guidance.desc': string;
  'cap.guidance.detail': string;

  // How It Works
  'workflow.badge': string;
  'workflow.title': string;
  'workflow.subtitle': string;
  'workflow.step1.title': string;
  'workflow.step1.desc': string;
  'workflow.step2.title': string;
  'workflow.step2.desc': string;
  'workflow.step3.title': string;
  'workflow.step3.desc': string;
  'workflow.step4.title': string;
  'workflow.step4.desc': string;
  'workflow.step5.title': string;
  'workflow.step5.desc': string;
  'workflow.step6.title': string;
  'workflow.step6.desc': string;
  'workflow.step7.title': string;
  'workflow.step7.desc': string;

  // Responsible AI / Evidence
  'evidence.badge': string;
  'evidence.title': string;
  'evidence.desc': string;
  'evidence.verified.title': string;
  'evidence.verified.desc': string;
  'evidence.estimated.title': string;
  'evidence.estimated.desc': string;
  'evidence.insufficient.title': string;
  'evidence.insufficient.desc': string;

  // Final CTA
  'cta.title': string;
  'cta.subtitle': string;
  'cta.button': string;

  // App Form
  'form.presets.title': string;
  'form.presets.subtitle': string;
  'form.presets.primaryBadge': string;
  'form.presets.secondaryBadge': string;
  'form.presets.dairyTitle': string;
  'form.presets.tailoringTitle': string;
  'form.presets.retailTitle': string;
  'form.title': string;
  'form.subtitle': string;
  'form.location.label': string;
  'form.location.indexed': string;
  'form.location.customPrompt': string;
  'form.location.customPlaceholder': string;
  'form.location.customNote': string;
  'form.location.useVerified': string;
  'form.sector.label': string;
  'form.title.label': string;
  'form.capital.label': string;
  'form.capital.marginBadge': string;
  'form.capital.formula': string;
  'form.optional.show': string;
  'form.optional.hide': string;
  'form.beneficiary.label': string;
  'form.beneficiary.general': string;
  'form.beneficiary.women': string;
  'form.beneficiary.scst': string;
  'form.beneficiary.obc': string;
  'form.experience.label': string;
  'form.experience.0': string;
  'form.experience.2': string;
  'form.experience.5': string;
  'form.area.label': string;
  'form.area.rural': string;
  'form.area.semiurban': string;
  'form.submitBtn': string;
  'form.submittingBtn': string;

  // Categories
  'cat.dairy': string;
  'cat.tailoring': string;
  'cat.retail': string;
  'cat.poultry': string;
  'cat.custom': string;

  // Agent Progress
  'progress.title': string;
  'progress.subtitle': string;
  'progress.completeRatio': string;
  'progress.status.waiting': string;
  'progress.status.running': string;
  'progress.status.completed': string;
  'progress.status.failed': string;
  'progress.agent.evidence': string;
  'progress.agent.evidenceRole': string;
  'progress.agent.business': string;
  'progress.agent.businessRole': string;
  'progress.agent.market': string;
  'progress.agent.marketRole': string;
  'progress.agent.finance': string;
  'progress.agent.financeRole': string;
  'progress.agent.scheme': string;
  'progress.agent.schemeRole': string;
  'progress.agent.risk': string;
  'progress.agent.riskRole': string;
  'progress.agent.validator': string;
  'progress.agent.validatorRole': string;
  'progress.agent.final': string;
  'progress.agent.finalRole': string;

  // Dashboard & Tabs
  'dash.reportHeader': string;
  'dash.reportId': string;
  'dash.tab.all': string;
  'dash.tab.finance': string;
  'dash.tab.schemes': string;
  'dash.tab.market': string;
  'dash.tab.risks': string;
  'dash.tab.evidence': string;

  // Feasibility Gauge
  'feasibility.statusBadge': string;
  'feasibility.explainableLabel': string;
  'feasibility.index': string;
  'feasibility.breakdownTitle': string;
  'feasibility.preconditionTitle': string;
  'feasibility.weight': string;
  'feasibility.cat.high': string;
  'feasibility.cat.moderate': string;
  'feasibility.cat.conditional': string;
  'feasibility.cat.low': string;
  'feasibility.rating.strong': string;
  'feasibility.rating.adequate': string;
  'feasibility.rating.needsAttention': string;

  // Financial Plan Card
  'fin.title': string;
  'fin.subtitle': string;
  'fin.zeroHallucination': string;
  'fin.ownCapital': string;
  'fin.promoterMargin': string;
  'fin.projectCost': string;
  'fin.capexWorkingCap': string;
  'fin.financing': string;
  'fin.loanNeed': string;
  'fin.monthlyEMI': string;
  'fin.emiTenureRate': string;
  'fin.estRevenue': string;
  'fin.estOpEx': string;
  'fin.estNetProfit': string;
  'fin.dscr': string;
  'fin.calculatorTitle': string;
  'fin.calculatorSubtitle': string;
  'fin.tenure': string;
  'fin.interestRate': string;
  'fin.moratorium': string;
  'fin.totalInterest': string;
  'fin.totalRepayment': string;
  'fin.capexToggle': string;
  'fin.table.item': string;
  'fin.table.category': string;
  'fin.table.status': string;
  'fin.table.cost': string;
  'fin.table.totalCost': string;
  'fin.table.essential': string;
  'fin.table.optional': string;
  'fin.table.capex': string;
  'fin.table.workingCapital': string;
  'fin.scheduleToggle': string;
  'fin.schedule.month': string;
  'fin.schedule.opening': string;
  'fin.schedule.principal': string;
  'fin.schedule.interest': string;
  'fin.schedule.emi': string;
  'fin.schedule.closing': string;
  'fin.schedule.grace': string;

  // Scheme Guidance Card
  'scheme.title': string;
  'scheme.subtitle': string;
  'scheme.evaluatedCount': string;
  'scheme.status.eligible': string;
  'scheme.status.conditional': string;
  'scheme.status.verification': string;
  'scheme.status.ineligible': string;
  'scheme.portalBtn': string;
  'scheme.interestRate': string;
  'scheme.estSubsidy': string;
  'scheme.minMargin': string;
  'scheme.maxCeiling': string;
  'scheme.whyMatches': string;
  'scheme.checklistTitle': string;
  'scheme.readyCount': string;
  'scheme.verifiedOn': string;

  // Market Intelligence Card
  'market.title': string;
  'market.subtitle': string;
  'market.opportunity': string;
  'market.reach': string;
  'market.competition': string;
  'market.population': string;
  'market.households': string;
  'market.demandTitle': string;
  'market.proximityTitle': string;
  'market.limitationsTitle': string;
  'market.level.high': string;
  'market.level.moderate': string;
  'market.level.low': string;
  'market.level.unknown': string;

  // Risk Analysis Card
  'risk.title': string;
  'risk.subtitle': string;
  'risk.overallBadge': string;
  'risk.highTitle': string;
  'risk.mediumTitle': string;
  'risk.lowTitle': string;
  'risk.mitigationLabel': string;
  'risk.level.high': string;
  'risk.level.medium': string;
  'risk.level.low': string;

  // Evidence Audit Card
  'evidence.auditTitle': string;
  'evidence.auditSubtitle': string;
  'evidence.filterAll': string;
  'evidence.filterVerified': string;
  'evidence.filterEstimated': string;
  'evidence.filterInsufficient': string;
  'evidence.table.param': string;
  'evidence.table.value': string;
  'evidence.table.level': string;
  'evidence.table.status': string;
  'evidence.table.confidence': string;
  'evidence.table.source': string;
  'evidence.badge.verified': string;
  'evidence.badge.estimated': string;
  'evidence.badge.insufficient': string;

  // Printable Report
  'print.headerTitle': string;
  'print.tagline': string;
  'print.reportId': string;
  'print.date': string;
  'print.sec1Title': string;
  'print.sec2Title': string;
  'print.sec3Title': string;
  'print.sec4Title': string;
  'print.sec5Title': string;
  'print.proposedBiz': string;
  'print.location': string;
  'print.ownCapital': string;
  'print.areaCategory': string;
  'print.topScheme': string;
  'print.riskPriority': string;
  'print.disclaimerTitle': string;
}
