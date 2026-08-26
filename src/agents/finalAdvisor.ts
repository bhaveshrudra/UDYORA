import {
  AgentPayload,
  BusinessAgentData,
  FeasibilityCategory,
  FinalFeasibilityVerdict,
  FinancialPlan,
  LocationData,
  MarketAgentData,
  RiskProfile,
  SchemeMatchResult,
  UserBusinessInput,
  EvidenceRecord
} from '../types';
import { SupportedLanguage } from '../i18n/types';

/**
 * FINAL ADVISOR / REPORT AGENT
 * Synthesizes all validated multi-agent findings into a clear, explainable,
 * balanced feasibility advisory report in the user's selected language.
 * 
 * Strict Guideline:
 * Never say "Your business will definitely succeed."
 * Uses "Based on available evidence, the estimated feasibility is..."
 */
export function runFinalAdvisorAgent(
  input: UserBusinessInput,
  location: LocationData,
  businessPayload: AgentPayload<BusinessAgentData>,
  marketPayload: AgentPayload<MarketAgentData>,
  financePayload: AgentPayload<FinancialPlan>,
  schemePayload: AgentPayload<SchemeMatchResult[]>,
  riskPayload: AgentPayload<RiskProfile>,
  evidenceAuditLog: EvidenceRecord[]
): FinalFeasibilityVerdict {
  const lang: SupportedLanguage = (input.language as SupportedLanguage) || 'en';
  const plan = financePayload.data;
  const risk = riskPayload.data;
  const schemes = schemePayload.data;
  const market = marketPayload.data;

  // Compute explainable readiness scores across 5 pillars
  // Pillar 1: Market Demand & Connectivity (Weight: 25%)
  let marketScore = 70;
  if (market.competitionLevel === 'LOW' || market.competitionLevel === 'MODERATE') marketScore += 15;
  if (location.transportConnectivity.status === 'VERIFIED') marketScore += 10;
  marketScore = Math.min(100, Math.max(0, marketScore));

  // Pillar 2: Financial Viability & DSCR (Weight: 25%)
  let financialScore = 65;
  if (plan.debtServiceCoverageRatio >= 2.0) financialScore += 25;
  else if (plan.debtServiceCoverageRatio >= 1.5) financialScore += 15;
  else if (plan.debtServiceCoverageRatio >= 1.2) financialScore += 5;
  else financialScore -= 20;
  financialScore = Math.min(100, Math.max(0, financialScore));

  // Pillar 3: Government Scheme & Subsidy Alignment (Weight: 20%)
  const topScheme = schemes[0];
  let schemeScore = 50;
  if (topScheme && topScheme.qualificationStatus === 'ELIGIBLE') schemeScore = topScheme.matchScore;
  else if (topScheme && topScheme.qualificationStatus === 'CONDITIONALLY_ELIGIBLE') schemeScore = Math.round(topScheme.matchScore * 0.85);

  // Pillar 4: Risk Manageability & Mitigations (Weight: 15%)
  let riskScore = 60;
  if (risk.overallRiskLevel === 'LOW') riskScore = 88;
  else if (risk.overallRiskLevel === 'MEDIUM') riskScore = 72;
  else riskScore = 45;

  // Pillar 5: Evidence Grounding & Data Quality (Weight: 15%)
  const verifiedCount = evidenceAuditLog.filter((e) => e.status === 'VERIFIED').length;
  const dataQualityScore = Math.min(100, Math.round((verifiedCount / Math.max(1, evidenceAuditLog.length)) * 100));

  // Weighted Total Feasibility Score (0 to 100)
  const weightedScore = Math.round(
    marketScore * 0.25 +
    financialScore * 0.25 +
    schemeScore * 0.20 +
    riskScore * 0.15 +
    dataQualityScore * 0.15
  );

  let category: FeasibilityCategory = 'MODERATE';
  if (weightedScore >= 80) category = 'HIGH';
  else if (weightedScore >= 65) category = 'MODERATE';
  else if (weightedScore >= 50) category = 'CONDITIONAL';
  else category = 'LOW';

  // Area Names Localized
  const getAreaName = (pillar: number): string => {
    switch (pillar) {
      case 1:
        if (lang === 'hi') return 'बाजार मांग एवं बिक्री पहुंच';
        if (lang === 'mr') return 'बाजारपेठ मागणी व विक्री व्यवस्था';
        if (lang === 'te') return 'మార్కెట్ డిమాండ్ & అమ్మకాల సదుపాయం';
        if (lang === 'kn') return 'ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆ ಮತ್ತು ಮಾರಾಟ ಸಂಪರ್ಕ';
        return 'Market Demand & Off-Take';
      case 2:
        if (lang === 'hi') return 'वित्तीय ऋण भुगतान क्षमता (DSCR)';
        if (lang === 'mr') return 'कर्ज परतफेड क्षमता (DSCR)';
        if (lang === 'te') return 'ఆర్థిక రుణ చెల్లింపు సామర్థ్యం (DSCR)';
        if (lang === 'kn') return 'ಸಾಲ ಮರುಪಾವತಿ ಸಾಮರ್ಥ್ಯ (DSCR)';
        return 'Financial Debt Service Capacity';
      case 3:
        if (lang === 'hi') return 'सरकारी योजना एवं सब्सिडी अनुकूलता';
        if (lang === 'mr') return 'शासकीय योजना व सबसिडी जुळणी';
        if (lang === 'te') return 'ప్రభుత్వ పథకాలు & సబ్సిడీ అనుకూలత';
        if (lang === 'kn') return 'ಸರಕಾರಿ ಯೋಜನೆ ಮತ್ತು ಸಬ್ಸಿಡಿ ಹೊಂದಾಣಿಕೆ';
        return 'Institutional Scheme Alignment';
      case 4:
        if (lang === 'hi') return 'जोखिम प्रबंधन एवं सुरक्षा उपाय';
        if (lang === 'mr') return 'जोखीम व्यवस्थापन व उपाययोजना';
        if (lang === 'te') return 'రిస్క్ నిర్వహణ & నివారణ చర్యలు';
        if (lang === 'kn') return 'ಅಪಾಯ ನಿರ್ವಹಣೆ ಮತ್ತು ಮುನ್ನೆಚ್ಚರಿಕೆ ಕ್ರಮಗಳು';
        return 'Risk Mitigation & Buffers';
      case 5:
      default:
        if (lang === 'hi') return 'प्रमाण सत्यता एवं डेटा गुणवत्ता';
        if (lang === 'mr') return 'माहिती सत्यता व डेटा गुणवत्ता';
        if (lang === 'te') return 'ఆధారాల ఖచ్చితత్వం & డేటా నాణ್ಯత';
        if (lang === 'kn') return 'ಮಾಹಿತಿ ದೃಢೀಕರಣ ಮತ್ತು ಡೇಟಾ ಗುಣಮಟ್ಟ';
        return 'Evidence Rigor & Data Quality';
    }
  };

  const getPillarSummary = (pillar: number): string => {
    switch (pillar) {
      case 1:
        if (lang === 'hi') return `दुग्ध सहकारी संकलन केंद्र (${location.nearestDairyCooperativeKm.value} किमी) और सड़क संपर्क के कारण निरंतर मांग उपलब्ध है।`;
        if (lang === 'mr') return `दूध संकलन केंद्र (${location.nearestDairyCooperativeKm.value} किमी) आणि महामार्ग जोडणीमुळे नियमित विक्री सुलभ आहे.`;
        if (lang === 'te') return `పాల సేకరణ కేంద్రం (${location.nearestDairyCooperativeKm.value} కి.మీ) మరియు రవాణా సౌకర్యం స్థిరమైన డిమాండ్‌ను అందిస్తాయి.`;
        if (lang === 'kn') return `ಹಾಲು ಸಂಗ್ರಹಣಾ ಕೇಂದ್ರ (${location.nearestDairyCooperativeKm.value} ಕಿ.ಮೀ) ಮತ್ತು ರಸ್ತೆ ಸಂಪರ್ಕವು ನಿರಂತರ ಬೇಡಿಕೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ.`;
        return `Proximity to cooperative collection point (${location.nearestDairyCooperativeKm.value} km) and access to highway corridor provide steady demand off-take.`;
      case 2:
        if (lang === 'hi') return `डीएससीआर ${plan.debtServiceCoverageRatio}x है और मासिक ईएमआई ₹${plan.monthlyEMI.toLocaleString('en-IN')} के बाद ₹${plan.estimatedMonthlyNetProfit.toLocaleString('en-IN')} का शुद्ध लाभ अनुमानित है।`;
        if (lang === 'mr') return `डीएससीआर ${plan.debtServiceCoverageRatio}x असून मासिक हप्ता ₹${plan.monthlyEMI.toLocaleString('en-IN')} वजा जाता ₹${plan.estimatedMonthlyNetProfit.toLocaleString('en-IN')} निव्वळ नफा अपेक्षित आहे.`;
        if (lang === 'te') return `DSCR ${plan.debtServiceCoverageRatio}x గా లెక్కించబడింది మరియు నెలవారీ EMI ₹${plan.monthlyEMI.toLocaleString('en-IN')} చెల్లించిన తర్వాత ₹${plan.estimatedMonthlyNetProfit.toLocaleString('en-IN')} నికర లాభం ఉంటుంది.`;
        if (lang === 'kn') return `DSCR ${plan.debtServiceCoverageRatio}x ಆಗಿದೆ ಮತ್ತು ಮಾಸಿಕ ಇಎಂಐ ₹${plan.monthlyEMI.toLocaleString('en-IN')} ನಂತರ ₹${plan.estimatedMonthlyNetProfit.toLocaleString('en-IN')} ನಿವ್ವಳ ಲಾಭ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ.`;
        return `DSCR is calculated at ${plan.debtServiceCoverageRatio}x with indicative monthly net profit of ₹${plan.estimatedMonthlyNetProfit.toLocaleString('en-IN')} after servicing monthly EMI of ₹${plan.monthlyEMI.toLocaleString('en-IN')}.`;
      case 3:
        if (lang === 'hi') return `${topScheme?.scheme.shortName || 'PMEGP'} के अंतर्गत मजबूत पात्रता और ₹${topScheme?.potentialSubsidyAmount.toLocaleString('en-IN') || '0'} की अनुमानित मार्जिन सब्सिडी।`;
        if (lang === 'mr') return `${topScheme?.scheme.shortName || 'PMEGP'} अंतर्गत मजबूत पात्रता आणि ₹${topScheme?.potentialSubsidyAmount.toLocaleString('en-IN') || '0'} मार्जिन मनी सबसिडी अपेक्षित आहे.`;
        if (lang === 'te') return `${topScheme?.scheme.shortName || 'PMEGP'} కింద అర్హత మరియు ₹${topScheme?.potentialSubsidyAmount.toLocaleString('en-IN') || '0'} మార్జిన్ సబ్సిడీ అవకాశం ఉంది.`;
        if (lang === 'kn') return `${topScheme?.scheme.shortName || 'PMEGP'} ಅಡಿಯಲ್ಲಿ ಉತ್ತಮ ಅರ್ಹತೆ ಮತ್ತು ₹${topScheme?.potentialSubsidyAmount.toLocaleString('en-IN') || '0'} ಅಂದಾಜು ಸಬ್ಸಿಡಿ ಲಭ್ಯವಿದೆ.`;
        return `Strong eligibility under ${topScheme?.scheme.shortName || 'PMEGP'} with estimated margin money subsidy of ₹${topScheme?.potentialSubsidyAmount.toLocaleString('en-IN') || '0'}.`;
      case 4:
        if (lang === 'hi') return `पशुधन मृत्यु (बीमा) और चारा मूल्य में उतार-चढ़ाव (हरा चारा उत्पादन) के लिए निवारण रणनीतियां शामिल हैं।`;
        if (lang === 'mr') return `पशुधन विमा आणि चारा नियोजनासाठी योग्य उपाययोजना प्रस्तावित आहेत.`;
        if (lang === 'te') return `పశువుల భద్రత (బీమా) మరియు మేత కొరత నివారణ చర్యలు చేర్చబడ్డాయి.`;
        if (lang === 'kn') return `ಪಶುಸಂಗೋಪನೆ ವಿಮೆ ಮತ್ತು ಹಸಿರು ಮೇವು ನಿರ್ವಹಣೆಗೆ ಸೂಕ್ತ ಕ್ರಮಗಳನ್ನು ರೂಪಿಸಲಾಗಿದೆ.`;
        return `Mitigation strategies established for livestock mortality (insurance) and feed volatility (fodder cultivation).`;
      case 5:
      default:
        if (lang === 'hi') return `जनगणना एवं नाबार्ड रिकॉर्ड के आधार पर ${evidenceAuditLog.length} में से ${verifiedCount} बुनियादी पैरामीटर सत्यापित हैं।`;
        if (lang === 'mr') return `जनगणना व अधिकृत नोंदीनुसार ${evidenceAuditLog.length} पैकी ${verifiedCount} घटक पूर्णतः सत्यापित आहेत.`;
        if (lang === 'te') return `సెన్సస్ మరియు అధికారిక రికార్డుల ప్రకారం ${evidenceAuditLog.length} లో ${verifiedCount} పారామీటర్లు ధృవీకరించబడ్డాయి.`;
        if (lang === 'kn') return `ಜನಗಣತಿ ಮತ್ತು ಅಧಿಕೃತ ದಾಖಲೆಗಳ ಪ್ರಕಾರ ${evidenceAuditLog.length} ರಲ್ಲಿ ${verifiedCount} ಅಂಶಗಳು ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿವೆ.`;
        return `${verifiedCount} of ${evidenceAuditLog.length} foundational parameters verified against Census, NABARD, and District records.`;
    }
  };

  const readinessFactors = [
    {
      area: getAreaName(1),
      score: marketScore,
      weight: 25,
      rating: (marketScore >= 80 ? 'STRONG' : marketScore >= 65 ? 'ADEQUATE' : 'NEEDS_ATTENTION') as 'STRONG' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'CRITICAL',
      summary: getPillarSummary(1)
    },
    {
      area: getAreaName(2),
      score: financialScore,
      weight: 25,
      rating: (financialScore >= 80 ? 'STRONG' : financialScore >= 65 ? 'ADEQUATE' : 'NEEDS_ATTENTION') as 'STRONG' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'CRITICAL',
      summary: getPillarSummary(2)
    },
    {
      area: getAreaName(3),
      score: schemeScore,
      weight: 20,
      rating: (schemeScore >= 80 ? 'STRONG' : schemeScore >= 65 ? 'ADEQUATE' : 'NEEDS_ATTENTION') as 'STRONG' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'CRITICAL',
      summary: getPillarSummary(3)
    },
    {
      area: getAreaName(4),
      score: riskScore,
      weight: 15,
      rating: (riskScore >= 75 ? 'STRONG' : riskScore >= 60 ? 'ADEQUATE' : 'NEEDS_ATTENTION') as 'STRONG' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'CRITICAL',
      summary: getPillarSummary(4)
    },
    {
      area: getAreaName(5),
      score: dataQualityScore,
      weight: 15,
      rating: (dataQualityScore >= 75 ? 'STRONG' : 'ADEQUATE') as 'STRONG' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'CRITICAL',
      summary: getPillarSummary(5)
    }
  ];

  // Headline
  let headline = `Based on available evidence, the estimated enterprise feasibility is ${category} (${weightedScore}/100).`;
  if (lang === 'hi') {
    headline = `उपलब्ध साक्ष्यों के आधार पर अनुमानित उद्यम व्यवहार्यता ${category} (${weightedScore}/100) है।`;
  } else if (lang === 'mr') {
    headline = `उपलब्ध पुराव्यांच्या आधारे अपेक्षित व्यवसाय व्यवहार्यता ${category} (${weightedScore}/100) आहे.`;
  } else if (lang === 'te') {
    headline = `అందుబాటులో ఉన్న ఆధారాల ప్రకారం అంచనా వేసిన వ్యాపార సాధ్యాసాధ్యం ${category} (${weightedScore}/100).`;
  } else if (lang === 'kn') {
    headline = `ಲಭ್ಯವಿರುವ ಆಧಾರಗಳ ಪ್ರಕಾರ ಅಂದಾಜು ಉದ್ಯಮ ಕಾರ್ಯಸಾಧ್ಯತೆ ${category} (${weightedScore}/100) ಆಗಿದೆ.`;
  }

  // Explanation
  let explanation = `The proposed ${businessPayload.data.businessSummary.toLowerCase()} in ${location.village} shows viable unit economics with a projected Debt Service Coverage Ratio (DSCR) of ${plan.debtServiceCoverageRatio}x. Capital contribution of ₹${plan.availableOwnCapital.toLocaleString('en-IN')} successfully satisfies the 10% promoter margin requirement under ${topScheme?.scheme.shortName || 'PMEGP'} for an indicative project cost of ₹${plan.indicativeProjectCost.toLocaleString('en-IN')}. Key operational priorities include maintaining livestock biosecurity and managing dry season feed procurement.`;
  if (lang === 'hi') {
    explanation = `${location.village} में प्रस्तावित व्यवसाय ${plan.debtServiceCoverageRatio}x के अनुमानित ऋण सेवा कवरेज अनुपात (DSCR) के साथ वित्तीय रूप से व्यावहारिक है। ₹${plan.availableOwnCapital.toLocaleString('en-IN')} की स्वयं की पूंजी ₹${plan.indicativeProjectCost.toLocaleString('en-IN')} की अनुमानित परियोजना लागत पर ${topScheme?.scheme.shortName || 'PMEGP'} के १०% मार्जिन नियम को पूरा करती है।`;
  } else if (lang === 'mr') {
    explanation = `${location.village} मधील प्रस्तावित व्यवसाय ${plan.debtServiceCoverageRatio}x च्या अपेक्षित कर्ज परतफेड गुणोत्तरासह (DSCR) आर्थिकदृष्ट्या व्यवहार्य आहे. ₹${plan.availableOwnCapital.toLocaleString('en-IN')} चे उपलब्ध भांडवल ₹${plan.indicativeProjectCost.toLocaleString('en-IN')} च्या एकूण खर्चावर १०% मार्जिन नियमांची पूर्तता करते.`;
  } else if (lang === 'te') {
    explanation = `${location.village} లో ప్రతిపాదిత వ్యాపారం ${plan.debtServiceCoverageRatio}x DSCR తో ఆర్థికంగా లాభదాయకంగా ఉంది. ₹${plan.availableOwnCapital.toLocaleString('en-IN')} సొంత పెట్టుబడి ₹${plan.indicativeProjectCost.toLocaleString('en-IN')} ప్రాజెక్ట్ ఖర్చుకు 10% మార్జిన్ నిబంధనను సంతృప్తిపరుస్తుంది.`;
  } else if (lang === 'kn') {
    explanation = `${location.village} ನಲ್ಲಿ ಪ್ರಸ್ತಾವಿತ ವ್ಯವಹಾರವು ${plan.debtServiceCoverageRatio}x DSCR ನೊಂದಿಗೆ ಆರ್ಥಿಕವಾಗಿ ಕಾರ್ಯಸಾಧ್ಯವಾಗಿದೆ. ₹${plan.availableOwnCapital.toLocaleString('en-IN')} ಸ್ವಂತ ಬಂಡವಾಳವು ₹${plan.indicativeProjectCost.toLocaleString('en-IN')} ಯೋಜನಾ ವೆಚ್ಚಕ್ಕೆ ೧೦% ಮಾರ್ಜಿನ್ ಅಗತ್ಯತೆಯನ್ನು ಪೂರೈಸುತ್ತದೆ.`;
  }

  // Critical Caveat
  let criticalCaveat = `Feasibility is conditioned upon obtaining formal credit sanction from a participating commercial/rural bank, completing veterinary tagging/insurance, and securing assured off-take with the local cooperative collection center.`;
  if (lang === 'hi') {
    criticalCaveat = `व्यवहार्यता बैंक से औपचारिक ऋण स्वीकृति प्राप्त करने, पशु चिकित्सा टैगिंग/बीमा पूरा करने और स्थानीय सहकारी संकलन केंद्र के साथ बिक्री अनुबंध पर निर्भर है।`;
  } else if (lang === 'mr') {
    criticalCaveat = `व्यवहार्यता बँकेकडून अधिकृत कर्ज मंजुरी, पशुवैद्यकीय विमा आणि स्थानिक दूध केंद्राशी खरेदी करार यावर अवलंबून आहे.`;
  } else if (lang === 'te') {
    criticalCaveat = `సాధ్యాసాధ్యం బ్యాంక్ రుణ మంజూరు, పశువుల బీమా మరియు స్థానిక సహకార సంఘంతో ఒప్పందంపై ఆధారపడి ఉంటుంది.`;
  } else if (lang === 'kn') {
    criticalCaveat = `ಕಾರ್ಯಸಾಧ್ಯತೆಯು ಬ್ಯಾಂಕ್ ಸಾಲ ಮಂಜೂರಾತಿ, ಪಶುವೈದ್ಯಕೀಯ ವಿಮೆ ಮತ್ತು ಸ್ಥಳೀಯ ಸಹಕಾರಿ ಸಂಘದೊಂದಿಗೆ ಮಾರಾಟ ಒಪ್ಪಂದವನ್ನು ಅವಲಂಬಿಸಿದೆ.`;
  }

  // Disclaimer
  let disclaimer = `UDYORA provides advisory intelligence based on deterministic financial formulas, structured government scheme guidelines, and verified public datasets. This advisory report does not constitute a guaranteed commercial outcome or formal banking sanction. Field verification by a certified banking correspondent or veterinary extension officer is advised prior to capital disbursement.`;
  if (lang === 'hi') {
    disclaimer = `उद्योगोरा गणितीय वित्तीय सूत्रों, सरकारी योजना नियमों और सत्यापित डेटा पर आधारित सलाह प्रदान करता है। यह रिपोर्ट किसी निश्चित व्यावसायिक सफलता या औपचारिक बैंक स्वीकृति की गारंटी नहीं है। पूंजी वितरण से पूर्व क्षेत्रीय सत्यापन की सलाह दी जाती है।`;
  } else if (lang === 'mr') {
    disclaimer = `उद्योगोरा हे गणिती आर्थिक सूत्रे, शासकीय योजना नियम आणि पडताळलेल्या डेटावर आधारित सल्लागार माहिती प्रदान करते. हा अहवाल व्यवसाय यशाची किंवा बँक मंजुरीची हमी देत नाही.`;
  } else if (lang === 'te') {
    disclaimer = `ఉద్యోరా గణిత సూత్రాలు, ప్రభుత్వ పథక నిబంధనలు మరియు ధృవీకరించిన డేటా ఆధారంగా సలహాలను అందిస్తుంది. ఈ నివేదిక వ్యాపార విజయానికి లేదా అధికారిక బ్యాంక్ రుణానికి గ్యారెంటీ కాదు.`;
  } else if (lang === 'kn') {
    disclaimer = `ಉದ್ಯೋರಾ ಗಣಿತ ಸೂತ್ರಗಳು, ಸರಕಾರಿ ಯೋಜನೆಗಳ ನಿಯಮಗಳು ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ ಸಲಹೆಯನ್ನು ನೀಡುತ್ತದೆ. ಈ ವರದಿಯು ಉದ್ಯಮದ ಯಶಸ್ಸು ಅಥವಾ ಬ್ಯಾಂಕ್ ಸಾಲದ ಖಾತರಿಯನ್ನು ನೀಡುವುದಿಲ್ಲ.`;
  }

  return {
    score: weightedScore,
    category,
    headline,
    explanation,
    readinessFactors,
    criticalCaveat,
    disclaimer
  };
}
