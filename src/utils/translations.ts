export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'te' | 'kn';

export interface Translations {
  // Navigation & Common
  home: string;
  launchApp: string;
  getStarted: string;
  exploreDemo: string;
  startAnalysis: string;
  printReport: string;
  newAnalysis: string;
  newSearch: string;
  tagline: string;
  appTitle: string;
  appSubtitle: string;
  evidenceAwareBadge: string;
  developedBy: string;

  // Landing Page Sections
  capabilitiesNav: string;
  howItWorksNav: string;
  evidenceNav: string;
  coreCapabilities: string;
  advisoryEngine: string;
  advisoryEngineDesc: string;
  userWorkflow: string;
  howUdyoraWorks: string;
  howUdyoraWorksDesc: string;
  corePrinciple: string;
  evidenceLedGuidance: string;
  evidenceLedGuidanceDesc: string;
  readyToExplore: string;
  readyToExploreDesc: string;

  // Form
  quickPresetsTitle: string;
  quickPresetsSubtitle: string;
  primaryDemoBadge: string;
  secondaryBadge: string;
  locationLabel: string;
  selectLocation: string;
  enterCustomLocation: string;
  useVerifiedLocation: string;
  businessSectorLabel: string;
  businessTitleLabel: string;
  availableCapitalLabel: string;
  promoterMargin: string;
  standardMarginFormula: string;
  showOptionalDetails: string;
  hideOptionalDetails: string;
  beneficiaryCategory: string;
  priorExperience: string;
  areaClassification: string;
  analyzeBusinessBtn: string;
  analyzingBtn: string;

  // Categories
  catDairy: string;
  catTailoring: string;
  catRetail: string;
  catPoultry: string;
  catCustom: string;

  // Dashboard & Tabs
  reportId: string;
  fullReportTab: string;
  financeTab: string;
  schemesTab: string;
  marketTab: string;
  risksTab: string;
  evidenceTab: string;

  // Feasibility Gauge
  feasibilityStatus: string;
  feasibilityIndex: string;
  pillarBreakdown: string;
  requiredPrecondition: string;

  // Financial Plan
  financialPlanTitle: string;
  financialPlanSubtitle: string;
  zeroHallucination: string;
  availableOwnCapital: string;
  indicativeProjectCost: string;
  indicativeFinancing: string;
  calculatedMonthlyEMI: string;
  estMonthlyRevenue: string;
  estMonthlyOpEx: string;
  estNetProfit: string;
  debtServiceCoverage: string;
  interactiveSensitivity: string;
  loanTenure: string;
  annualInterestRate: string;
  moratoriumPeriod: string;
  totalInterest: string;
  totalRepayment: string;
  capexBreakdownTitle: string;
  amortizationPreviewTitle: string;

  // Schemes
  govSchemesTitle: string;
  govSchemesSubtitle: string;
  officialPortal: string;
  whyItMatchesTitle: string;
  requiredDocsChecklistTitle: string;

  // Market & Risks
  marketInfraTitle: string;
  marketInfraSubtitle: string;
  riskAnalysisTitle: string;
  riskAnalysisSubtitle: string;
  evidenceAuditTitle: string;
  evidenceAuditSubtitle: string;

  // Status Badges
  verifiedBadge: string;
  estimatedBadge: string;
  insufficientDataBadge: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    home: 'Home',
    launchApp: 'Launch App',
    getStarted: 'GET STARTED',
    exploreDemo: 'EXPLORE DEMO',
    startAnalysis: 'START ANALYSIS',
    printReport: 'Print Report',
    newAnalysis: 'New Analysis',
    newSearch: 'New Search',
    tagline: 'Hyper-Local Business Intelligence for Rural Entrepreneurs',
    appTitle: 'UDYORA Business Intelligence',
    appSubtitle: 'Evaluate village-level enterprise viability, deterministic loan financing, government scheme subsidies, and practical rural risk mitigations using coordinated specialized agents.',
    evidenceAwareBadge: 'Evidence-Aware Multi-Agent Business Advisory',
    developedBy: 'Developed by Beyond Zero',

    capabilitiesNav: 'Capabilities',
    howItWorksNav: 'How It Works',
    evidenceNav: 'Evidence Principles',
    coreCapabilities: 'Core Capabilities',
    advisoryEngine: 'Specialized Business Advisory Engine',
    advisoryEngineDesc: 'Coordinated analytical modules designed specifically for rural and semi-urban enterprise viability.',
    userWorkflow: 'User Workflow',
    howUdyoraWorks: 'How UDYORA Works',
    howUdyoraWorksDesc: 'From village context to actionable financial planning in seven structured steps.',
    corePrinciple: 'Core Architectural Principle',
    evidenceLedGuidance: 'EVIDENCE-LED GUIDANCE',
    evidenceLedGuidanceDesc: 'UDYORA is designed to distinguish between verified information, estimates, and insufficient data. Recommendations are intended to support decision-making, not guarantee business success.',
    readyToExplore: 'READY TO EXPLORE UDYORA?',
    readyToExploreDesc: 'Start with a business idea, location and available capital.',

    quickPresetsTitle: 'Select Demo Scenario / Quick Presets',
    quickPresetsSubtitle: 'Click to pre-fill standard parameters',
    primaryDemoBadge: 'PRIMARY DEMO',
    secondaryBadge: 'SECONDARY',
    locationLabel: '1. Location (Village / Block / District)',
    selectLocation: 'Select verified village location...',
    enterCustomLocation: 'Enter custom village...',
    useVerifiedLocation: 'Use verified demo location',
    businessSectorLabel: '2. Business Sector / Category',
    businessTitleLabel: 'Proposed Business Description / Title',
    availableCapitalLabel: '3. Available Own Capital (Promoter Margin)',
    promoterMargin: 'Promoter Margin',
    standardMarginFormula: 'Standard 10% promoter contribution rule derives an indicative project cost of ₹10,00,000 and financing requirement of ₹9,00,000.',
    showOptionalDetails: 'Show Optional Details (Beneficiary Category, Experience)',
    hideOptionalDetails: 'Hide Optional Business Profile Details',
    beneficiaryCategory: 'Beneficiary Category',
    priorExperience: 'Prior Experience',
    areaClassification: 'Location Area Classification',
    analyzeBusinessBtn: 'Analyze Business',
    analyzingBtn: 'Executing Multi-Agent Analysis...',

    catDairy: 'Dairy Farming & Milk Supply',
    catTailoring: 'Custom Tailoring & Apparel',
    catRetail: 'Rural Kirana / Retail Goods',
    catPoultry: 'Micro Poultry Farming',
    catCustom: 'Other Micro Enterprise',

    reportId: 'Report ID',
    fullReportTab: 'Full Advisory Report',
    financeTab: 'Financial Plan',
    schemesTab: 'Government Schemes',
    marketTab: 'Market & Infra',
    risksTab: 'Risk Analysis',
    evidenceTab: 'Evidence Audit Trail',

    feasibilityStatus: 'FEASIBILITY STATUS',
    feasibilityIndex: 'Feasibility Index',
    pillarBreakdown: 'Pillar-by-Pillar Feasibility Breakdown',
    requiredPrecondition: 'Required Pre-Condition',

    financialPlanTitle: 'Deterministic Financial Plan & Capital Structuring',
    financialPlanSubtitle: '100% pure mathematical calculations based on standard 10% margin logic & reducing-balance loan amortization.',
    zeroHallucination: 'Zero LLM Arithmetic Hallucination',
    availableOwnCapital: 'Available Own Capital',
    indicativeProjectCost: 'Indicative Project Cost',
    indicativeFinancing: 'Indicative Financing',
    calculatedMonthlyEMI: 'Calculated Monthly EMI',
    estMonthlyRevenue: 'Est. Monthly Revenue',
    estMonthlyOpEx: 'Est. Monthly OpEx',
    estNetProfit: 'Est. Net Profit (Post-EMI)',
    debtServiceCoverage: 'Debt Service Coverage (DSCR)',
    interactiveSensitivity: 'Interactive Sensitivity & Loan Calculator',
    loanTenure: 'Loan Tenure',
    annualInterestRate: 'Annual Interest Rate',
    moratoriumPeriod: 'Moratorium Period',
    totalInterest: 'Total Interest over Tenure',
    totalRepayment: 'Total Repayment Amount',
    capexBreakdownTitle: 'Itemized Capital Expenditure (CapEx) & Working Capital Breakdown',
    amortizationPreviewTitle: 'Amortization Schedule Preview (First 12 Months)',

    govSchemesTitle: 'Government Credit Schemes & Subsidies',
    govSchemesSubtitle: 'Rule-based matching against verified guidelines with official portal references.',
    officialPortal: 'Official Portal',
    whyItMatchesTitle: 'Eligibility & Matching Justification:',
    requiredDocsChecklistTitle: 'Required Documents Checklist (Ready for Application)',

    marketInfraTitle: 'Hyper-Local Market & Infrastructure Intelligence',
    marketInfraSubtitle: 'Catchment demographics, cooperative hubs, and verified market access points.',
    riskAnalysisTitle: 'Multidimensional Risk Analysis & Mitigations',
    riskAnalysisSubtitle: 'Operational, financial, seasonal, biological, and data-quality risk evaluation.',
    evidenceAuditTitle: 'Evidence & Ground Truth Audit Trail',
    evidenceAuditSubtitle: 'Full provenance of every factual parameter with confidence scores and verification stamps.',

    verifiedBadge: 'VERIFIED',
    estimatedBadge: 'ESTIMATED',
    insufficientDataBadge: 'INSUFFICIENT DATA'
  },
  hi: {
    home: 'होम',
    launchApp: 'ऐप खोलें',
    getStarted: 'शुरू करें',
    exploreDemo: 'डेमो देखें',
    startAnalysis: 'विश्लेषण शुरू करें',
    printReport: 'रिपोर्ट प्रिंट करें',
    newAnalysis: 'नया विश्लेषण',
    newSearch: 'नई खोज',
    tagline: 'ग्रामीण उद्यमियों के लिए अति-स्थानीय व्यावसायिक समझ',
    appTitle: 'उद्योगोरा व्यावसायिक समझ',
    appSubtitle: 'ग्राम स्तर पर व्यापार व्यवहार्यता, ऋण वित्तपोषण, सरकारी योजना सब्सिडी और जोखिम निवारण का सटीक विश्लेषण।',
    evidenceAwareBadge: 'प्रमाण-आधारित मल्टी-एजेंट व्यावसायिक सलाहकार',
    developedBy: 'बियॉन्ड ज़ीरो द्वारा विकसित',

    capabilitiesNav: 'क्षमताएं',
    howItWorksNav: 'यह कैसे काम करता है',
    evidenceNav: 'प्रमाण सिद्धांत',
    coreCapabilities: 'मुख्य क्षमताएं',
    advisoryEngine: 'विशेषज्ञ व्यावसायिक सलाहकार इंजन',
    advisoryEngineDesc: 'ग्रामीण और अर्ध-शहरी उद्यमों की सफलता के लिए विशेष रूप से डिज़ाइन किए गए विश्लेषणात्मक मॉड्यूल।',
    userWorkflow: 'उपयोगकर्ता प्रक्रिया',
    howUdyoraWorks: 'उद्योगोरा कैसे काम करता है',
    howUdyoraWorksDesc: 'गाँव के संदर्भ से लेकर विस्तृत वित्तीय योजना तक सात सरल चरणों में।',
    corePrinciple: 'मूल वास्तुकला सिद्धांत',
    evidenceLedGuidance: 'प्रमाण-आधारित मार्गदर्शन',
    evidenceLedGuidanceDesc: 'उद्योगोरा को सत्यापित जानकारी, अनुमान और अपर्याप्त डेटा के बीच स्पष्ट अंतर करने के लिए बनाया गया है।',
    readyToExplore: 'उद्योगोरा का उपयोग करने के लिए तैयार हैं?',
    readyToExploreDesc: 'अपने व्यवसाय के विचार, स्थान और उपलब्ध पूंजी के साथ शुरुआत करें।',

    quickPresetsTitle: 'डेमो परिदृश्य चुनें / त्वरित प्रीसेट',
    quickPresetsSubtitle: 'मानक विवरण स्वतः भरने के लिए क्लिक करें',
    primaryDemoBadge: 'मुख्य डेमो',
    secondaryBadge: 'वैकल्पिक',
    locationLabel: '१. स्थान (गाँव / ब्लॉक / जिला)',
    selectLocation: 'सत्यापित गाँव का चयन करें...',
    enterCustomLocation: 'अन्य गाँव दर्ज करें...',
    useVerifiedLocation: 'सत्यापित डेमो स्थान का उपयोग करें',
    businessSectorLabel: '२. व्यापार क्षेत्र / श्रेणी',
    businessTitleLabel: 'प्रस्तावित व्यवसाय का विवरण / नाम',
    availableCapitalLabel: '३. उपलब्ध स्वयं की पूंजी (मार्जिन राशि)',
    promoterMargin: 'उद्यमी का योगदान',
    standardMarginFormula: 'मानक १०% मार्जिन नियम के अनुसार अनुमानित परियोजना लागत ₹१०,००,००० और ऋण आवश्यकता ₹९,००,००० है।',
    showOptionalDetails: 'अतिरिक्त विवरण दिखाएं (श्रेणी, अनुभव)',
    hideOptionalDetails: 'अतिरिक्त विवरण छिपाएं',
    beneficiaryCategory: 'लाभार्थी श्रेणी',
    priorExperience: 'पूर्व अनुभव',
    areaClassification: 'स्थान क्षेत्र वर्गीकरण',
    analyzeBusinessBtn: 'व्यवसाय का विश्लेषण करें',
    analyzingBtn: 'मल्टी-एजेंट विश्लेषण प्रगति पर है...',

    catDairy: 'डेयरी फार्मिंग एवं दुग्ध आपूर्ति',
    catTailoring: 'सिलाई एवं परिधान निर्माण',
    catRetail: 'ग्रामीण किराना एवं दैनिक सामान',
    catPoultry: 'मुर्गी पालन (पोल्ट्री फार्म)',
    catCustom: 'अन्य सूक्ष्म उद्यम',

    reportId: 'रिपोर्ट आईडी',
    fullReportTab: 'पूर्ण सलाहकार रिपोर्ट',
    financeTab: 'वित्तीय योजना',
    schemesTab: 'सरकारी योजनाएं',
    marketTab: 'बाजार एवं बुनियादी ढांचा',
    risksTab: 'जोखिम विश्लेषण',
    evidenceTab: 'प्रमाण ऑडिट ट्रेल',

    feasibilityStatus: 'व्यवहार्यता स्थिति',
    feasibilityIndex: 'व्यवहार्यता सूचकांक',
    pillarBreakdown: 'विस्तृत स्तंभ-वार मूल्यांकन',
    requiredPrecondition: 'आवश्यक पूर्व-शर्त',

    financialPlanTitle: 'सटीक वित्तीय योजना और पूंजी संरचना',
    financialPlanSubtitle: 'मानक १०% मार्जिन और घटते शेष ऋण ईएमआई पर आधारित पूर्णतः गणितीय गणना।',
    zeroHallucination: 'शून्य गणितीय त्रुटि (सटीक गणना)',
    availableOwnCapital: 'उपलब्ध स्वयं की पूंजी',
    indicativeProjectCost: 'अनुमानित परियोजना लागत',
    indicativeFinancing: 'ऋण आवश्यकता',
    calculatedMonthlyEMI: 'मासिक ईएमआई (किस्त)',
    estMonthlyRevenue: 'अनुमानित मासिक आय',
    estMonthlyOpEx: 'मासिक परिचालन व्यय',
    estNetProfit: 'अनुमानित शुद्ध लाभ (ईएमआई पश्चात)',
    debtServiceCoverage: 'ऋण सेवा कवरेज अनुपात (DSCR)',
    interactiveSensitivity: 'इंटरैक्टिव ऋण कैलकुलेटर',
    loanTenure: 'ऋण अवधि',
    annualInterestRate: 'वार्षिक ब्याज दर',
    moratoriumPeriod: 'मोरेटोरियम (छूट अवधि)',
    totalInterest: 'कुल ब्याज देय',
    totalRepayment: 'कुल पुनर्भुगतान राशि',
    capexBreakdownTitle: 'पूंजीगत व्यय (CapEx) एवं कार्यशील पूंजी विवरण',
    amortizationPreviewTitle: 'मासिक ऋण किस्त तालिका (प्रथम १२ माह)',

    govSchemesTitle: 'सरकारी ऋण योजनाएं एवं सब्सिडी',
    govSchemesSubtitle: 'सत्यापित सरकारी नियमों और आधिकारिक पोर्टलों के आधार पर मिलान।',
    officialPortal: 'आधिकारिक पोर्टल',
    whyItMatchesTitle: 'पात्रता एवं मिलान का कारण:',
    requiredDocsChecklistTitle: 'आवश्यक दस्तावेजों की चेकलिस्ट',

    marketInfraTitle: 'स्थानीय बाजार एवं बुनियादी ढांचा विश्लेषण',
    marketInfraSubtitle: 'आबादी, नजदीकी डेयरी केंद्र, मंडी और बाजार पहुंच।',
    riskAnalysisTitle: 'जोखिम विश्लेषण एवं बचाव के उपाय',
    riskAnalysisSubtitle: 'व्यावसायिक, वित्तीय, मौसमी और स्थानीय जोखिमों का मूल्यांकन।',
    evidenceAuditTitle: 'प्रमाण एवं स्रोत सत्यापन तालिका',
    evidenceAuditSubtitle: 'जनगणना, नाबार्ड और सरकारी स्रोतों की प्रामाणिकता।',

    verifiedBadge: 'सत्यापित (VERIFIED)',
    estimatedBadge: 'अनुमानित (ESTIMATED)',
    insufficientDataBadge: 'अपर्याप्त डेटा (INSUFFICIENT DATA)'
  },
  mr: {
    home: 'मुख्यपृष्ठ',
    launchApp: 'अॅप सुरू करा',
    getStarted: 'सुरू करा',
    exploreDemo: 'डेमो पहा',
    startAnalysis: 'विश्लेषण सुरू करा',
    printReport: 'अहवाल प्रिंट करा',
    newAnalysis: 'नवीन विश्लेषण',
    newSearch: 'नवीन शोध',
    tagline: 'ग्रामीण उद्योजकांसाठी अति-स्थानिक व्यावसायिक बुद्धिमत्ता',
    appTitle: 'उद्योगोरा व्यवसाय बुद्धिमत्ता',
    appSubtitle: 'ग्रामपातळीवरील व्यवसाय व्यवहार्यता, कर्ज नियोजन, सरकारी योजना सबसिडी आणि जोखीम निवारणाचे अचूक विश्लेषण.',
    evidenceAwareBadge: 'प्रमाण-आधारित मल्टी-एजंट व्यवसाय सल्लागार',
    developedBy: 'बियॉन्ड झिरो द्वारे विकसित',

    capabilitiesNav: 'वैशिष्ट्ये',
    howItWorksNav: 'प्रक्रिया कशी चालते',
    evidenceNav: 'प्रमाण तत्त्वे',
    coreCapabilities: 'प्रमुख क्षमता',
    advisoryEngine: 'विशेष व्यावसायिक सल्लागार इंजिन',
    advisoryEngineDesc: 'ग्रामीण आणि निम-शहरी उद्योगांच्या यशासाठी तयार केलेले विश्लेषणात्मक मॉड्युल्स.',
    userWorkflow: 'वापरकर्ता प्रक्रिया',
    howUdyoraWorks: 'उद्योगोरा कसे कार्य करते',
    howUdyoraWorksDesc: 'गावाच्या संदर्भापासून ते आर्थिक नियोजनापर्यंत सात सोप्या टप्प्यांत.',
    corePrinciple: 'मूलभूत रचना तत्त्व',
    evidenceLedGuidance: 'प्रमाण-आधारित मार्गदर्शन',
    evidenceLedGuidanceDesc: 'उद्योगोरा हे पडताळलेली माहिती, अंदाज आणि अपुरा डेटा यांच्यातील फरक स्पष्ट करण्यासाठी डिझाइन केलेले आहे.',
    readyToExplore: 'उद्योगोरा वापरण्यासाठी सज्ज आहात?',
    readyToExploreDesc: 'तुमची व्यवसायाची कल्पना, गाव आणि उपलब्ध भांडवलासह सुरुवात करा.',

    quickPresetsTitle: 'डेमो पर्याय निवडा / झटपट प्रीसेट',
    quickPresetsSubtitle: 'प्रमाणित माहिती भरण्यासाठी क्लिक करा',
    primaryDemoBadge: 'मुख्य डेमो',
    secondaryBadge: 'पर्यायी',
    locationLabel: '१. स्थान (गाव / तालुका / जिल्हा)',
    selectLocation: 'तपासलेले गाव निवडा...',
    enterCustomLocation: 'इतर गाव प्रविष्ट करा...',
    useVerifiedLocation: 'तपासलेले डेमो स्थान वापरा',
    businessSectorLabel: '२. व्यवसाय क्षेत्र / प्रकार',
    businessTitleLabel: 'प्रस्तावित व्यवसायाचे नाव / वर्णन',
    availableCapitalLabel: '३. स्वतःचे उपलब्ध भांडवल (मार्जिन मनी)',
    promoterMargin: 'उद्योजकाचा वाटा',
    standardMarginFormula: '१०% मार्जिन नियमानुसार एकूण प्रकल्प खर्च ₹१०,००,००० आणि कर्ज गरज ₹९,००,००० आहे.',
    showOptionalDetails: 'पर्यायी तपशील दाखवा (प्रवर्ग, अनुभव)',
    hideOptionalDetails: 'पर्यायी तपशील लपवा',
    beneficiaryCategory: 'लाभार्थी प्रवर्ग',
    priorExperience: 'मागील अनुभव',
    areaClassification: 'स्थान क्षेत्र वर्गीकरण',
    analyzeBusinessBtn: 'व्यवसायाचे विश्लेषण करा',
    analyzingBtn: 'मल्टी-एजंट विश्लेषण सुरू आहे...',

    catDairy: 'दुग्धव्यवसाय व दूध पुरवठा',
    catTailoring: 'टेलरिंग व कपडे निर्मिती',
    catRetail: 'ग्रामीण किराणा व दैनंदिन वस्तू दुकान',
    catPoultry: 'कुक्कुटपालन (पोल्ट्री फार्म)',
    catCustom: 'इतर सूक्ष्म उद्योग',

    reportId: 'अहवाल आयडी',
    fullReportTab: 'संपूर्ण सल्लागार अहवाल',
    financeTab: 'आर्थिक नियोजन',
    schemesTab: 'सरकारी योजना',
    marketTab: 'बाजारपेठ व सुविधा',
    risksTab: 'जोखीम विश्लेषण',
    evidenceTab: 'माहिती स्रोत तपासणी',

    feasibilityStatus: 'व्यवहार्यता स्थिती',
    feasibilityIndex: 'व्यवहार्यता निर्देशांक',
    pillarBreakdown: 'स्तंभ-निहाय सविस्तर मूल्यमापन',
    requiredPrecondition: 'आवश्यक पूर्व-अट',

    financialPlanTitle: 'अचूक आर्थिक नियोजन व भांडवली रचना',
    financialPlanSubtitle: '१०% मार्जिन आणि कमी होणाऱ्या मुद्दलावरील ईएमआयवर आधारित गणिती आकडेमोड.',
    zeroHallucination: 'अचूक गणितीय गणना',
    availableOwnCapital: 'स्वतःचे उपलब्ध भांडवल',
    indicativeProjectCost: 'अपेक्षित एकूण प्रकल्प खर्च',
    indicativeFinancing: 'कर्ज आवश्यकता',
    calculatedMonthlyEMI: 'मासिक ईएमआय (हप्ता)',
    estMonthlyRevenue: 'अपेक्षित मासिक उत्पन्न',
    estMonthlyOpEx: 'मासिक खर्च',
    estNetProfit: 'अपेक्षित निव्वळ नफा (ईएमआय वजा जाता)',
    debtServiceCoverage: 'कर्ज परतफेड क्षमता (DSCR)',
    interactiveSensitivity: 'इंटरॅक्टिव्ह कर्ज कॅल्क्युलेटर',
    loanTenure: 'कर्ज मुदत',
    annualInterestRate: 'वार्षिक व्याजदर',
    moratoriumPeriod: 'सूट कालावधी (मोरेटोरियम)',
    totalInterest: 'एकूण देय व्याज',
    totalRepayment: 'एकूण परतफेड रक्कम',
    capexBreakdownTitle: 'भांडवली खर्च (CapEx) व खेळते भांडवल तपशील',
    amortizationPreviewTitle: 'मासिक कर्ज हप्ता तक्ता (पहिले १२ महिने)',

    govSchemesTitle: 'सरकारी कर्ज योजना व अनुदान',
    govSchemesSubtitle: 'अधिकृत सरकारी नियमांनुसार तपासणी व मिलान.',
    officialPortal: 'अधिकृत पोर्टल',
    whyItMatchesTitle: 'पात्रता व निवडीचे कारण:',
    requiredDocsChecklistTitle: 'आवश्यक कागदपत्रांची यादी',

    marketInfraTitle: 'स्थानिक बाजारपेठ व पायाभूत सुविधा',
    marketInfraSubtitle: 'लोकसंख्या, दूध संकलन केंद्र, बाजार आणि रस्ते जोडणी.',
    riskAnalysisTitle: 'जोखीम विश्लेषण व उपाययोजना',
    riskAnalysisSubtitle: 'व्यावसायिक, आर्थिक, मौसमी व स्थानिक जोखमींचे मूल्यांकन.',
    evidenceAuditTitle: 'प्रमाण व माहिती स्रोत तपासणी तक्ता',
    evidenceAuditSubtitle: 'जनगणना, नाबार्ड व शासकीय नोंदींची सत्यता.',

    verifiedBadge: 'सत्यापित (VERIFIED)',
    estimatedBadge: 'अंदाजित (ESTIMATED)',
    insufficientDataBadge: 'अपुरा डेटा (INSUFFICIENT DATA)'
  },
  te: {
    home: 'హోమ్',
    launchApp: 'యాప్‌ను ప్రారంభించండి',
    getStarted: 'ప్రారంభించండి',
    exploreDemo: 'డెమో చూడండి',
    startAnalysis: 'విశ్లేషణ ప్రారంభించండి',
    printReport: 'రిపోర్ట్ ప్రింట్ చేయండి',
    newAnalysis: 'కొత్త విశ్లేషణ',
    newSearch: 'కొత్త శోధన',
    tagline: 'గ్రామీణ వ్యాపారవేత్తల కోసం స్థానిక వ్యాపార ఇంటెలిజెన్స్',
    appTitle: 'ఉద్యోరా బిజినెస్ ఇంటెలిజెన్స్',
    appSubtitle: 'గ్రామ స్థాయిలో వ్యాపార సాధ్యాసాధ్యాలు, ఆర్థిక ప్రణాళిక, ప్రభుత్వ పథకాల సబ్సిడీ మరియు రిస్క్ విశ్లేషణ.',
    evidenceAwareBadge: 'ఆధార-ఆధారిత మల్టీ-ఏజెంట్ వ్యాపార సలహాదారు',
    developedBy: 'బియాండ్ జీరో ద్వారా అభివృద్ధి చేయబడింది',

    capabilitiesNav: 'సామర్థ్యాలు',
    howItWorksNav: 'ఇది ఎలా పనిచేస్తుంది',
    evidenceNav: 'ఆధార సూత్రాలు',
    coreCapabilities: 'ప్రధాన సామర్థ్యాలు',
    advisoryEngine: 'ప్రత్యేక వ్యాపార సలహా ఇంజిన్',
    advisoryEngineDesc: 'గ్రామీణ మరియు సెమీ-అర్బన్ వ్యాపారాల కోసం రూపొందించబడిన విశ్లేషణాత్మక వ్యవస్థ.',
    userWorkflow: 'వినియోగదారు ప్రక్రియ',
    howUdyoraWorks: 'ఉద్యోరా ఎలా పనిచేస్తుంది',
    howUdyoraWorksDesc: 'గ్రామ పరిధి నుండి పూర్తి ఆర్థిక ప్రణాళిక వరకు ఏడు దశల్లో.',
    corePrinciple: 'ప్రధాన సూత్రం',
    evidenceLedGuidance: 'ఆధార-ఆధారిత మార్గదర్శకత్వం',
    evidenceLedGuidanceDesc: 'ధృవీకరించబడిన సమాచారం, అంచనాలు మరియు అందుబాటులో లేని డేటా మధ్య స్పష్టమైన తేడాను చూపిస్తుంది.',
    readyToExplore: 'ఉద్యోరాను అన్వేషించడానికి సిద్ధంగా ఉన్నారా?',
    readyToExploreDesc: 'మీ వ్యాపార ఆలోచన, ప్రాంతం మరియు పెట్టుబడితో ప్రారంభించండి.',

    quickPresetsTitle: 'డెమో దృశ్యాన్ని ఎంచుకోండి / శీఘ్ర ప్రీసెట్లు',
    quickPresetsSubtitle: 'ప్రామాణిక వివరాలను స్వయంచాలకంగా పూరించడానికి క్లిక్ చేయండి',
    primaryDemoBadge: 'ప్రధాన డెమో',
    secondaryBadge: 'ద్వితీయ',
    locationLabel: '1. ప్రాంతం (గ్రామం / మండలం / జిల్లా)',
    selectLocation: 'ధృవీకరించబడిన గ్రామాన్ని ఎంచుకోండి...',
    enterCustomLocation: 'ఇతర గ్రామం నమోదు చేయండి...',
    useVerifiedLocation: 'ధృవీకరించబడిన డెమో ప్రాంతాన్ని ఉపయోగించండి',
    businessSectorLabel: '2. వ్యాపార విభాగం / రంగం',
    businessTitleLabel: 'ప్రతిపాదిత వ్యాపార వివరణ / పేరు',
    availableCapitalLabel: '3. అందుబాటులో ఉన్న సొంత పెట్టుబడి (మార్జిన్ మనీ)',
    promoterMargin: 'వ్యాపారవేత్త వాటా',
    standardMarginFormula: '10% మార్జిన్ నిబంధన ప్రకారం ప్రాజెక్ట్ ఖర్చు ₹10,00,000 మరియు లోన్ అవసరం ₹9,00,000.',
    showOptionalDetails: 'ఐచ్ఛిక వివరాలను చూపించండి',
    hideOptionalDetails: 'ఐచ్ఛిక వివరాలను దాచండి',
    beneficiaryCategory: 'లబ్ధిదారుల వర్గం',
    priorExperience: 'మునుపటి అనుభవం',
    areaClassification: 'ప్రాంత వర్గీకరణ',
    analyzeBusinessBtn: 'వ్యాపారాన్ని విశ్లేషించండి',
    analyzingBtn: 'మల్టీ-ఏజెంట్ విశ్లేషణ జరుగుతోంది...',

    catDairy: 'పాల ఉత్పత్తి మరియు డైరీ ఫామ్',
    catTailoring: 'టైలరింగ్ మరియు గార్మెంట్ యూనిట్',
    catRetail: 'గ్రామీణ కిరాణా మరియు నిత్యావసర దుకాణం',
    catPoultry: 'పౌల్ట్రీ ఫామ్ (కోళ్ల పెంపకం)',
    catCustom: 'ఇతర చిన్న వ్యాపారం',

    reportId: 'రిపోర్ట్ ఐడీ',
    fullReportTab: 'పూర్తి సలహా నివేదిక',
    financeTab: 'ఆర్థిక ప్రణాళిక',
    schemesTab: 'ప్రభుత్వ పథకాలు',
    marketTab: 'మార్కెట్ మరియు మౌలిక సదుపాయాలు',
    risksTab: 'రిస్క్ విశ్లేషణ',
    evidenceTab: 'ఆధారాల ఆడిట్ ట్రయిల్',

    feasibilityStatus: 'సాధ్యాసాధ్య స్థితి',
    feasibilityIndex: 'సాధ్యాసాధ్య సూచిక',
    pillarBreakdown: 'విభాగాల వారీగా మూల్యాంకనం',
    requiredPrecondition: 'అవసరమైన ముందస్తు షరతు',

    financialPlanTitle: 'ఖచ్చితమైన ఆర్థిక ప్రణాళిక & మూలధన నిర్మాణం',
    financialPlanSubtitle: '10% మార్జిన్ ఆధారంగా లెక్కించబడిన ఖచ్చితమైన లోన్ మరియు EMI లెక్కలు.',
    zeroHallucination: 'ఖచ్చితమైన గణిత గణనలు',
    availableOwnCapital: 'అందుబాటులో ఉన్న సొంత పెట్టుబడి',
    indicativeProjectCost: 'అంచనా వేసిన ప్రాజెక్ట్ ఖర్చు',
    indicativeFinancing: 'బ్యాంక్ లోన్ అవసరం',
    calculatedMonthlyEMI: 'నెలవారీ EMI (కిస్తీ)',
    estMonthlyRevenue: 'అంచనా నెలవారీ ఆదాయం',
    estMonthlyOpEx: 'నెలవారీ నిర్వహణ ఖర్చు',
    estNetProfit: 'నికర లాభం (EMI చెల్లించిన తర్వాత)',
    debtServiceCoverage: 'రుణ చెల్లింపు సామర్థ్యం (DSCR)',
    interactiveSensitivity: 'ఇంటరాక్టివ్ లోన్ కాలిక్యులేటర్',
    loanTenure: 'లోన్ కాలపరిమితి',
    annualInterestRate: 'వార్షిక వడ్డీ రేటు',
    moratoriumPeriod: 'మొరటోరియం కాలం',
    totalInterest: 'మొత్తం వడ్డీ',
    totalRepayment: 'మొత్తం చెల్లింపు మొత్తం',
    capexBreakdownTitle: 'మూలధన వ్యయం (CapEx) మరియు వర్కింగ్ క్యాపిటల్ వివరాలు',
    amortizationPreviewTitle: 'నెలవారీ చెల్లింపు షెడ్యూల్ (మొదటి 12 నెలలు)',

    govSchemesTitle: 'ప్రభుత్వ లోన్ పథకాలు & సబ్సిడీలు',
    govSchemesSubtitle: 'అధికారిక నిబంధనల ఆధారంగా సరిపోలిన పథకాలు.',
    officialPortal: 'అధికారిక పోర్టల్',
    whyItMatchesTitle: 'అర్హత & సరిపోలిన కారణం:',
    requiredDocsChecklistTitle: 'అవసరమైన పత్రాల చెక్‌లిస్ట్',

    marketInfraTitle: 'స్థానిక మార్కెట్ మరియు మౌలిక సదుపాయాలు',
    marketInfraSubtitle: 'జనాభా, పాల సేకరణ కేంద్రం దూరం, మార్కెట్ కనెక్టివిటీ.',
    riskAnalysisTitle: 'రిస్క్ విశ్లేషణ మరియు నివారణ మార్గాలు',
    riskAnalysisSubtitle: 'వ్యాపార, ఆర్థిక, కాలానుగుణ రిస్క్‌ల మూల్యాంకనం.',
    evidenceAuditTitle: 'ఆధారాలు మరియు డేటా ధృవీకరణ పట్టిక',
    evidenceAuditSubtitle: 'సెన్సస్, నాబార్డ్ మరియు ప్రభుత్వ రికార్డుల ప్రామాణికత.',

    verifiedBadge: 'ధృవీకరించబడింది (VERIFIED)',
    estimatedBadge: 'అంచనా వేయబడింది (ESTIMATED)',
    insufficientDataBadge: 'సరిపోని డేటా (INSUFFICIENT DATA)'
  },
  kn: {
    home: 'ಮುಖಪುಟ',
    launchApp: 'ಅಪ್ಲಿಕೇಶನ್ ಪ್ರಾರಂಭಿಸಿ',
    getStarted: 'ಪ್ರಾರಂಭಿಸಿ',
    exploreDemo: 'ಡೆಮೊ ನೋಡಿ',
    startAnalysis: 'ವಿಶ್ಲೇಷಣೆ ಪ್ರಾರಂಭಿಸಿ',
    printReport: 'ವರದಿ ಮುದ್ರಿಸಿ (Print Report)',
    newAnalysis: 'ಹೊಸ ವಿಶ್ಲೇಷಣೆ',
    newSearch: 'ಹೊಸ ಹುಡುಕಾಟ',
    tagline: 'ಗ್ರಾಮೀಣ ಉದ್ಯಮಿಗಳಿಗಾಗಿ ಸ್ಥಳೀಯ ವ್ಯಾಪಾರ ಬುದ್ಧಿಮತ್ತೆ',
    appTitle: 'ಉದ್ಯೋರಾ ವ್ಯಾಪಾರ ಬುದ್ಧಿಮತ್ತೆ',
    appSubtitle: 'ಗ್ರಾಮ ಮಟ್ಟದಲ್ಲಿ ಉದ್ಯಮದ ಕಾರ್ಯಸಾಧ್ಯತೆ, ಹಣಕಾಸು ಯೋಜನೆ, ಸರಕಾರಿ ಯೋಜನೆಗಳ ಸಬ್ಸಿಡಿ ಮತ್ತು ಅಪಾಯ ವಿಶ್ಲೇಷಣೆ.',
    evidenceAwareBadge: 'ಆಧಾರ-ಆಧಾರಿತ ಬಹು-ಏಜೆಂಟ್ ವ್ಯವಹಾರ ಸಲಹೆಗಾರ',
    developedBy: 'ಬಿಯಾಂಡ್ ಜೀರೋ ಅಭಿವೃದ್ಧಿಪಡಿಸಿದೆ',

    capabilitiesNav: 'ಸಾಮರ್ಥ್ಯಗಳು',
    howItWorksNav: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    evidenceNav: 'ಆಧಾರ ತತ್ವಗಳು',
    coreCapabilities: 'ಪ್ರಮುಖ ಸಾಮರ್ಥ್ಯಗಳು',
    advisoryEngine: 'ವಿಶೇಷ ವ್ಯಾಪಾರ ಸಲಹಾ ಇಂಜಿನ್',
    advisoryEngineDesc: 'ಗ್ರಾಮೀಣ ಮತ್ತು ಅರೆ-ನಗರ ಸೂಕ್ಷ್ಮ ಉದ್ಯಮಗಳ ಯಶಸ್ಸಿಗಾಗಿ ರಚಿಸಲಾದ ವಿಶ್ಲೇಷಣಾ ವ್ಯವಸ್ಥೆ.',
    userWorkflow: 'ಬಳಕೆದಾರರ ಪ್ರಕ್ರಿಯೆ',
    howUdyoraWorks: 'ಉದ್ಯೋರಾ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    howUdyoraWorksDesc: 'ಗ್ರಾಮದ ಹಿನ್ನೆಲೆಯಿಂದ ಸಮಗ್ರ ಹಣಕಾಸು ಯೋಜನೆಯವರೆಗೆ ಏಳು ಹಂತಗಳಲ್ಲಿ.',
    corePrinciple: 'ಮೂಲ ತತ್ವ',
    evidenceLedGuidance: 'ಆಧಾರ-ಆಧಾರಿತ ಮಾರ್ಗದರ್ಶನ',
    evidenceLedGuidanceDesc: 'ಪರಿಶೀಲಿಸಿದ ಮಾಹಿತಿ, ಅಂದಾಜುಗಳು ಮತ್ತು ಅಪೂರ್ಣ ಮಾಹಿತಿಯ ನಡುವಿನ ವ್ಯತ್ಯಾಸವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ತೋರಿಸುತ್ತದೆ.',
    readyToExplore: 'ಉದ್ಯೋರಾ ಬಳಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?',
    readyToExploreDesc: 'ನಿಮ್ಮ ವ್ಯವಹಾರದ ಕಲ್ಪನೆ, ಸ್ಥಳ ಮತ್ತು ಲಭ್ಯವಿರುವ ಬಂಡವಾಳದೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಿ.',

    quickPresetsTitle: 'ಡೆಮೊ ಆಯ್ಕೆಮಾಡಿ / ತ್ವರಿತ ಪ್ರಿಸೆಟ್‌ಗಳು',
    quickPresetsSubtitle: 'ಪ್ರಾಮಾಣಿಕ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    primaryDemoBadge: 'ಮುಖ್ಯ ಡೆಮೊ',
    secondaryBadge: 'ದ್ವಿತೀಯ',
    locationLabel: '೧. ಸ್ಥಳ (ಗ್ರಾಮ / ತಾಲೂಕು / ಜಿಲ್ಲೆ)',
    selectLocation: 'ಪರಿಶೀಲಿಸಿದ ಗ್ರಾಮವನ್ನು ಆಯ್ಕೆಮಾಡಿ...',
    enterCustomLocation: 'ಇತರ ಗ್ರಾಮವನ್ನು ನಮೂದಿಸಿ...',
    useVerifiedLocation: 'ಪರಿಶೀಲಿಸಿದ ಡೆಮೊ ಸ್ಥಳ ಬಳಸಿ',
    businessSectorLabel: '೨. ವ್ಯವಹಾರ ಕ್ಷೇತ್ರ / ವರ್ಗ',
    businessTitleLabel: 'ಪ್ರಸ್ತಾವಿತ ವ್ಯವಹಾರದ ವಿವರಣೆ / ಹೆಸರು',
    availableCapitalLabel: '೩. ಲಭ್ಯವಿರುವ ಸ್ವಂತ ಬಂಡವಾಳ (ಮಾರ್ಜಿನ್ ಹಣ)',
    promoterMargin: 'ಉದ್ಯಮಿಯ ಪಾಲು',
    standardMarginFormula: '೧೦% ಮಾರ್ಜಿನ್ ನಿಯಮದಂತೆ ಯೋಜನಾ ವೆಚ್ಚ ₹೧೦,೦೦,೦೦೦ ಮತ್ತು ಸಾಲದ ಅಗತ್ಯ ₹೯,೦೦,೦೦೦ ಆಗಿದೆ.',
    showOptionalDetails: 'ಹೆಚ್ಚುವರಿ ವಿವರಗಳನ್ನು ತೋರಿಸಿ',
    hideOptionalDetails: 'ಹೆಚ್ಚುವರಿ ವಿವರಗಳನ್ನು ಮರೆಮಾಡಿ',
    beneficiaryCategory: 'ಫಲಾನುಭವಿ ವರ್ಗ',
    priorExperience: 'ಹಿಂದಿನ ಅನುಭವ',
    areaClassification: 'ಸ್ಥಳ ಪ್ರದೇಶ ವರ್ಗೀಕರಣ',
    analyzeBusinessBtn: 'ವ್ಯವಹಾರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ',
    analyzingBtn: 'ಬಹು-ಏಜೆಂಟ್ ವಿಶ್ಲೇಷಣೆ ನಡೆಯುತ್ತಿದೆ...',

    catDairy: 'ಡೈರಿ ಫಾರ್ಮಿಂಗ್ ಮತ್ತು ಹಾಲು ಸರಬರಾಜು',
    catTailoring: 'ಟೈಲರಿಂಗ್ ಮತ್ತು ಉಡುಪು ತಯಾರಿಕೆ',
    catRetail: 'ಗ್ರಾಮೀಣ ಕಿರಾಣಿ ಮತ್ತು ದಿನಸಿ ಅಂಗಡಿ',
    catPoultry: 'ಕೋಳಿ ಸಾಕಾಣಿಕೆ (ಪೌಲ್ಟ್ರಿ ಫಾರ್ಮ್)',
    catCustom: 'ಇತರ ಸಣ್ಣ ಉದ್ಯಮ',

    reportId: 'ವರದಿ ಐಡಿ',
    fullReportTab: 'ಸಂಪೂರ್ಣ ಸಲಹಾ ವರದಿ',
    financeTab: 'ಹಣಕಾಸು ಯೋಜನೆ',
    schemesTab: 'ಸರಕಾರಿ ಯೋಜನೆಗಳು',
    marketTab: 'ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಮೂಲಸೌಕರ್ಯ',
    risksTab: 'ಅಪಾಯ ವಿಶ್ಲೇಷಣೆ',
    evidenceTab: 'ಮಾಹಿತಿ ಆಧಾರ ಪರಿಶೀಲನೆ',

    feasibilityStatus: 'ಕಾರ್ಯಸಾಧ್ಯತೆಯ ಸ್ಥಿತಿ',
    feasibilityIndex: 'ಕಾರ್ಯಸಾಧ್ಯತಾ ಸೂಚ್ಯಂಕ',
    pillarBreakdown: 'ವಿಭಾಗವಾರು ಸಮಗ್ರ ಮೌಲ್ಯಮಾಪನ',
    requiredPrecondition: 'ಅಗತ್ಯವಿರುವ ಮುನ್ನೆಚ್ಚರಿಕೆ ಷರತ್ತು',

    financialPlanTitle: 'ನಿಖರ ಹಣಕಾಸು ಯೋಜನೆ ಮತ್ತು ಬಂಡವಾಳ ರಚನೆ',
    financialPlanSubtitle: '೧೦% ಮಾರ್ಜಿನ್ ಆಧಾರಿತ ನಿಖರ ಗಣಿತದ ಲೆಕ್ಕಾಚಾರಗಳು ಮತ್ತು ಇಎಂಐ ವಿವರ.',
    zeroHallucination: 'ನಿಖರ ಗಣಿತ ಲೆಕ್ಕಾಚಾರಗಳು',
    availableOwnCapital: 'ಲಭ್ಯವಿರುವ ಸ್ವಂತ ಬಂಡವಾಳ',
    indicativeProjectCost: 'ಅಂದಾಜು ಯೋಜನಾ ವೆಚ್ಚ',
    indicativeFinancing: 'ಸಾಲದ ಅಗತ್ಯತೆ',
    calculatedMonthlyEMI: 'ಮಾಸಿಕ ಇಎಂಐ (EMI)',
    estMonthlyRevenue: 'ಅಂದಾಜು ಮಾಸಿಕ ಆದಾಯ',
    estMonthlyOpEx: 'ಮಾಸಿಕ ನಿರ್ವಹಣಾ ವೆಚ್ಚ',
    estNetProfit: 'ನಿವ್ವಳ ಲಾಭ (ಇಎಂಐ ನಂತರ)',
    debtServiceCoverage: 'ಸಾಲ ಮರುಪಾವತಿ ಸಾಮರ್ಥ್ಯ (DSCR)',
    interactiveSensitivity: 'ಸಂವಾದಾತ್ಮಕ ಸಾಲ ಕ್ಯಾಲ್ಕುಲೇಟರ್',
    loanTenure: 'ಸಾಲದ ಅವಧಿ',
    annualInterestRate: 'ವಾರ್ಷಿಕ ಬಡ್ಡಿದರ',
    moratoriumPeriod: 'ಮೊರಟೋರಿಯಂ ಅವಧಿ',
    totalInterest: 'ಒಟ್ಟು ಪಾವತಿಸಬೇಕಾದ ಬಡ್ಡಿ',
    totalRepayment: 'ಒಟ್ಟು ಮರುಪಾವತಿ ಮೊತ್ತ',
    capexBreakdownTitle: 'ಬಂಡವಾಳ ವೆಚ್ಚ (CapEx) ಮತ್ತು ಕಾರ್ಯನಿರತ ಬಂಡವಾಳ ವಿವರ',
    amortizationPreviewTitle: 'ಮಾಸಿಕ ಕಂತು ಪಟ್ಟಿ (ಮೊದಲ ೧೨ ತಿಂಗಳು)',

    govSchemesTitle: 'ಸರಕಾರಿ ಸಾಲ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿಗಳು',
    govSchemesSubtitle: 'ಅಧಿಕೃತ ಸರಕಾರಿ ನಿಯಮಗಳ ಆಧಾರದ ಮೇಲೆ ಹೊಂದಾಣಿಕೆ.',
    officialPortal: 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್',
    whyItMatchesTitle: 'ಅರ್ಹತೆ ಮತ್ತು ಹೊಂದಾಣಿಕೆಯ ಕಾರಣ:',
    requiredDocsChecklistTitle: 'ಅಗತ್ಯ ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ',

    marketInfraTitle: 'ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಮೂಲಸೌಕರ್ಯ ಮಾಹಿತಿ',
    marketInfraSubtitle: 'ಜನಸಂಖ್ಯೆ, ಹಾಲು ಸಂಗ್ರಹಣಾ ಕೇಂದ್ರ, ಮಾರುಕಟ್ಟೆ ಸಂಪರ್ಕ.',
    riskAnalysisTitle: 'ಅಪಾಯ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ತಡೆಗಟ್ಟುವ ಕ್ರಮಗಳು',
    riskAnalysisSubtitle: 'ವ್ಯವಹಾರ, ಆರ್ಥಿಕ ಮತ್ತು ಸ್ಥಳೀಯ ಅಪಾಯಗಳ ಮೌಲ್ಯಮಾಪನ.',
    evidenceAuditTitle: 'ಆಧಾರ ಮತ್ತು ಮಾಹಿತಿ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ',
    evidenceAuditSubtitle: 'ಜನಗಣತಿ, ನಬಾರ್ಡ್ ಮತ್ತು ಸರಕಾರಿ ದಾಖಲೆಗಳ ಪ್ರಾಮಾಣಿಕತೆ.',

    verifiedBadge: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ (VERIFIED)',
    estimatedBadge: 'ಅಂದಾಜಿಸಲಾಗಿದೆ (ESTIMATED)',
    insufficientDataBadge: 'ಅಪೂರ್ಣ ಮಾಹಿತಿ (INSUFFICIENT DATA)'
  }
};

export function getTranslations(lang: string = 'en'): Translations {
  const supported: SupportedLanguage = (['en', 'hi', 'mr', 'te', 'kn'].includes(lang) ? lang : 'en') as SupportedLanguage;
  return TRANSLATIONS[supported];
}
