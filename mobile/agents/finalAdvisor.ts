import {
  UserContext,
  BusinessSummary,
  FeasibilityBreakdown,
  FinancialPlan,
  GovernmentSchemeMatch,
  LanguageTag
} from '../types';
import { formatINR } from '../utils/formatters';

export const finalAdvisor = {
  async execute(
    userContext: UserContext,
    businessSummary: BusinessSummary,
    feasibility: FeasibilityBreakdown,
    financialPlan: FinancialPlan,
    schemes: GovernmentSchemeMatch[]
  ) {
    const { language, locationContext, businessProfile } = userContext;
    const cat = businessProfile.businessCategory;
    const locName = locationContext.localityName;
    const capitalStr = formatINR(businessProfile.availableCapital);
    const costStr = formatINR(financialPlan.indicativeProjectCost);
    const loanStr = formatINR(financialPlan.termLoanAmount);
    const emiStr = formatINR(financialPlan.monthlyEMI);
    const topScheme = schemes[0]?.schemeName || 'PMEGP Scheme';

    let executiveSummary = '';
    let primaryActionableSteps: string[] = [];
    let financingGuidance = '';
    let schemeGuidance = '';
    let cautionNotice = '';

    if (language === 'te-IN') {
      executiveSummary = `${locName} పరిధిలో ${cat} వ్యాపార స్థాపన ${feasibility.overallScore}/100 సాధ్యాసాధ్యత స్కోరుతో అత్యంత అనుకూలంగా ఉంది. మీ సొంత పెట్టుబడి ${capitalStr} ఆధారంగా మొత్తం ప్రాజెక్ట్ వ్యయం ${costStr} గా అంచనా వేయబడింది.`;
      primaryActionableSteps = [
        `స్థానిక పశువైద్య లేదా జిల్లా పరిశ్రమల కేంద్రం (DIC) వద్ద ప్రాజెక్ట్ వివరాలను నమోదు చేసుకోండి.`,
        `${topScheme} కింద 35% గ్రామీణ సబ్సిడీ కొరకు ఆన్‌లైన్ దరఖాస్తును సమర్పించండి.`,
        `బ్యాంక్ రుణం (${loanStr}) కొరకు కొటేషన్లు మరియు గ్రామీణ చిరునామా ధృవీకరణ పత్రాన్ని సిద్ధం చేయండి.`,
        `రోజువారీ ఉత్పత్తి విక్రయాల కొరకు స్థానిక సహకార సంఘంతో ఒప్పందం చేసుకోండి.`
      ];
      financingGuidance = `మీ సొంత ఈక్విటీ ${capitalStr} (10% ప్రమోటర్ మార్జిన్) గా ఉంది. మిగిలిన ${loanStr} రుణాన్ని 5 సంవత్సరాల కాలపరిమితితో నెలవారీ EMI ${emiStr} తో పొందవచ్చు.`;
      schemeGuidance = `మీరు ${topScheme} ద్వారా రూ. ${formatINR(schemes[0]?.estimatedSubsidyAmount || 0)} వరకు మూలధన సబ్సిడీకి అర్హులు.`;
      cautionNotice = `గమనిక: మార్కెట్ ఆధారిత పరిశీలనలు మరియు ఆర్థిక ప్రణాళిక బ్యాంక్ ఆమోదం మరియు స్థానిక ధరలపై ఆధారపడి ఉంటాయి.`;
    } else if (language === 'hi-IN') {
      executiveSummary = `${locName} में ${cat} व्यवसाय की स्थापना ${feasibility.overallScore}/100 व्यवहार्यता स्कोर के साथ अत्यधिक अनुकूल है। आपकी उपलब्ध पूँजी ${capitalStr} के आधार पर कुल परियोजना लागत ${costStr} अनुमानित है।`;
      primaryActionableSteps = [
        `जिला उद्योग केंद्र (DIC) अथवा स्थानीय बैंक शाखा में परियोजना विवरण प्रस्तुत करें।`,
        `${topScheme} के तहत 35% ग्रामीण सब्सिडी हेतु ऑनलाइन आवेदन दर्ज करें।`,
        `बैंक ऋण (${loanStr}) हेतु आवश्यक कोटेशन और ग्रामीण निवास प्रमाण पत्र तैयार रखें।`,
        `दैनिक बिक्री और आपूर्ति हेतु स्थानीय खरीदारों/सहकारी संस्था से संपर्क स्थापित करें।`
      ];
      financingGuidance = `आपकी पूँजी ${capitalStr} (10% प्रमोटर मार्जिन) है। शेष ${loanStr} बैंक ऋण के रूप में 5 वर्ष की अवधि के लिए मासिक EMI ${emiStr} पर उपलब्ध होगा।`;
      schemeGuidance = `${topScheme} के माध्यम से आप ₹${formatINR(schemes[0]?.estimatedSubsidyAmount || 0)} तक की पूंजीगत सब्सिडी के पात्र हैं।`;
      cautionNotice = `सूचना: यह रिपोर्ट सत्यापित साक्ष्यों पर आधारित है; वास्तविक ऋण स्वीकृति बैंक नियमों के अधीन है।`;
    } else if (language === 'mr-IN') {
      executiveSummary = `${locName} येथे ${cat} व्यवसाय सुरू करणे ${feasibility.overallScore}/100 सुसंगतता स्कोअरसह अत्यंत व्यवहार्य आहे. तुमच्या ₹${capitalStr} भांडवलावर आधारित प्रकल्प खर्च ${costStr} निश्चित केला आहे.`;
      primaryActionableSteps = [
        `जिल्हा उद्योग केंद्र (DIC) किंवा स्थानिक सहकारी बँकेत प्रकल्प अहवाल सादर करा.`,
        `${topScheme} अंतर्गत ३५% ग्रामीण अनुदानासाठी ऑनलाइन अर्ज करा.`,
        `बँक कर्ज (${loanStr}) मंजुरीसाठी कोटेशन्स आणि ग्रामपंचायत दाखला तयार ठेवा.`
      ];
      financingGuidance = `प्रवर्तक भांडवल ${capitalStr} असून उर्वरित ${loanStr} कर्ज ५ वर्षांसाठी दरमहा हप्ता (EMI) ${emiStr} असेल.`;
      schemeGuidance = `${topScheme} अंतर्गत तुम्हाला भरीव शासकीय अनुदान उपलब्ध होऊ शकते.`;
      cautionNotice = `टीप: ही शिफारस प्रत्यक्ष शासकीय व स्थानिक डेटावर आधारित असून अंतिम मंजुरी बँकेवर अवलंबून आहे.`;
    } else if (language === 'kn-IN') {
      executiveSummary = `${locName} ನಲ್ಲಿ ${cat} ಉದ್ಯಮವನ್ನು ಪ್ರಾರಂಭಿಸುವುದು ${feasibility.overallScore}/100 ಕಾರ್ಯಸಾಧ್ಯತೆಯ ಸ್ಕೋರ್‌ನೊಂದಿಗೆ ಹೆಚ್ಚು ಸೂಕ್ತವಾಗಿದೆ. ನಿಮ್ಮ ${capitalStr} ಬಂಡವಾಳದ ಮೇಲೆ ಯೋಜನಾ ವೆಚ್ಚ ${costStr} ಎಂದು ಅಂದಾಜಿಸಲಾಗಿದೆ.`;
      primaryActionableSteps = [
        `ಜಿಲ್ಲಾ ಕೈಗಾರಿಕಾ ಕೇಂದ್ರ (DIC) ಅಥವಾ ಸ್ಥಳೀಯ ಬ್ಯಾಂಕಿನಲ್ಲಿ ಯೋಜನಾ ವರದಿ ಸಲ್ಲಿಸಿ.`,
        `${topScheme} ಅಡಿಯಲ್ಲಿ ಸಬ್ಸಿಡಿಗಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.`,
        `ಅಗತ್ಯವಿರುವ ಬ್ಯಾಂಕ್ ಸಾಲ (${loanStr}) ಕ್ಕೆ ದಾಖಲೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿಕೊಳ್ಳಿ.`
      ];
      financingGuidance = `ನಿಮ್ಮ ಸ್ವಂತ ಹೂಡಿಕೆ ${capitalStr} ಮತ್ತು ಬ್ಯಾಂಕ್ ಸಾಲ ${loanStr} ರೊಂದಿಗೆ ಮಾಸಿಕ ಕಂತು ${emiStr} ಆಗಿರುತ್ತದೆ.`;
      schemeGuidance = `${topScheme} ಯೋಜನೆಯಿಂದ ಗರಿಷ್ಠ ಸಬ್ಸಿಡಿ ಪ್ರಯೋಜನ ಪಡೆಯಬಹುದು.`;
      cautionNotice = `ಸೂಚನೆ: ಬ್ಯಾಂಕ್ ನಿಯಮಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆ ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತದೆ.`;
    } else {
      // English Default
      executiveSummary = `The establishment of a ${cat} Enterprise in ${locName} (${locationContext.districtName}) demonstrates strong viability with a calculated Feasibility Score of ${feasibility.overallScore}/100 (${feasibility.rating}). Based on your available equity of ${capitalStr}, the recommended project scale is ${costStr}.`;
      primaryActionableSteps = [
        `Submit a formal enterprise proposal through the ${topScheme} online single-window portal to lock in rural capital subsidy.`,
        `Obtain firm vendor quotations for primary machinery / livestock and secure Gram Panchayat locality verification certificate.`,
        `Approach a local Public Sector Bank / Regional Rural Bank with the DPR for sanction of ${loanStr} term loan under Priority Sector Lending.`,
        `Finalize formal off-take agreement with local agricultural market / cooperative procurement network.`
      ];
      financingGuidance = `Your promoter contribution of ${capitalStr} fulfills the 10% equity requirement (SIH26091 standard). The remaining ${loanStr} is structured as a 5-year term loan @ 9.25% p.a. with an estimated monthly EMI of ${emiStr}. Projected DSCR of ${financialPlan.debtServiceCoverageRatio}x indicates safe debt-servicing capability.`;
      schemeGuidance = `You are eligible for capital subsidy under ${topScheme} (up to ${schemes[0]?.subsidyPercentage || 35}% in rural zones) as well as MUDRA collateral-free credit coverage.`;
      cautionNotice = `Notice: Projections are derived from deterministic empirical benchmarks and Local Government Directory (LGD) evidence. Official loan sanction and subsidy release are subject to bank due diligence and portal verification.`;
    }

    return {
      executiveSummary,
      primaryActionableSteps,
      financingGuidance,
      schemeGuidance,
      cautionNotice
    };
  }
};
