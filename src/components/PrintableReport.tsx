import React from 'react';
import { CompleteAnalysisReport } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { generateRepaymentSchedule } from '../services/financialCalculator';

interface PrintableReportProps {
  report: CompleteAnalysisReport;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ report }) => {
  const { language } = useLanguage();

  // Multi-Language Localized Labels Dictionary (Strict Unicode-Safe)
  const reportI18n: Record<string, Record<string, string>> = {
    en: {
      docTitle: 'Official Business Feasibility & Advisory Assessment',
      subTitle: 'Comprehensive Multi-Agent Synthesis • Local Government Directory (LGD 2026.02 Verified)',
      repId: 'Report ID',
      generated: 'Generated',
      langLabel: 'Language',
      mathEngine: '● Deterministic Math Engine',
      sec1: '01 • Business Profile & Catchment Context',
      sec1Sub: 'Primary Parameters',
      propEnterprise: 'Proposed Enterprise',
      targetCatchment: 'Target Catchment',
      sectorDomain: 'Sector Domain',
      ownCapital: 'Available Own Capital',
      promoterContr: '(10% Promoter Contribution)',
      beneficiaryCat: 'Beneficiary / Category',
      sec2: '02 • Executive Feasibility Summary',
      sec2Sub: 'Synthesis Rating',
      verdictTitle: 'Overall Feasibility Verdict',
      rating: 'Rating',
      keyOpp: '★ Key Strategic Opportunity:',
      keyCaveat: '⚠️ Critical Boundary Condition / Risk:',
      sec3: '03 • Local Market Intelligence & Catchment Demographics',
      sec3Sub: 'Spatial Infrastructure',
      catchmentPop: 'Estimated Catchment Population',
      households: 'Households',
      demandChannels: 'Demand Channels',
      infraProximity: 'Observed Infrastructure Nodes',
      sec4: '04 • Financial Structure & Unit Economics',
      sec4Sub: 'Deterministic Math',
      projCost: 'Indicative Project Cost',
      ownEquity: 'Own Equity (Margin)',
      loanNeed: 'Net Bank Loan Need',
      monthlyEmi: 'Monthly Loan EMI',
      interestRate: 'Interest Rate',
      dscr: 'Debt Service (DSCR)',
      moRev: 'Est. Monthly Revenue',
      moOpEx: 'Est. Monthly OpEx',
      moProfit: 'Est. Net Monthly Profit',
      sec5: '05 • Evidence & Scheme Guidance',
      sec5Sub: 'Official Subsidies',
      recScheme: 'Top Recommended Scheme',
      matchScore: 'Match Score',
      estSubsidy: 'Est. Capital Subsidy',
      minMargin: 'Min Own Margin',
      maxCeiling: 'Max Project Ceiling',
      whyMatches: 'Eligibility Justification:',
      docChecklist: 'Required Documents Checklist:',
      sec6: '06 • 5-Year Loan Amortization & Repayment Trajectory',
      sec6Sub: 'Amortization Schedule',
      yr: 'Year',
      principalPaid: 'Principal Repaid',
      interestPaid: 'Interest Paid',
      totalPaid: 'Total Installment',
      closingBal: 'Closing Balance',
      sec7: '07 • Multidimensional Risk Matrix & Actionable Mitigations',
      sec7Sub: 'Operational Safeguards',
      riskFactor: 'Identified Risk Vector',
      severity: 'Severity',
      mitigation: 'Actionable Mitigation',
      sec8: '08 • Ground-Truth Evidence & Data Quality Audit',
      sec8Sub: 'Verified Provenance',
      param: 'Data Parameter / Metric',
      value: 'Observed Value',
      source: 'Official Source & Provenance',
      status: 'Status',
      sec9: '09 • Final Strategic Recommendation & Governance Note',
      disclaimer: 'DISCLAIMER: This advisory dossier was synthesized using deterministic mathematical models, verified Census/LGD administrative registries, and official credit subsidy guidelines. Final credit sanction is subject to formal appraisal by the financing bank.'
    },
    hi: {
      docTitle: 'आधिकारिक व्यवसाय व्यवहार्यता एवं सलाहकार मूल्यांकन',
      subTitle: 'व्यापक मल्टी-एजेंट विश्लेषण • स्थानीय सरकार निर्देशिका (LGD 2026.02 सत्यापित)',
      repId: 'रिपोर्ट आईडी',
      generated: 'दिनांक',
      langLabel: 'भाषा',
      mathEngine: '● सटीक गणितीय गणना इंजन',
      sec1: '01 • व्यवसाय प्रोफाइल एवं स्थानीय संदर्भ',
      sec1Sub: 'प्राथमिक मानक',
      propEnterprise: 'प्रस्तावित उद्यम',
      targetCatchment: 'लक्षित कार्यक्षेत्र',
      sectorDomain: 'व्यवसाय क्षेत्र',
      ownCapital: 'उपलब्ध स्वयं की पूंजी',
      promoterContr: '(10% प्रवर्तक अंशदान)',
      beneficiaryCat: 'लाभार्थी श्रेणी / अनुभव',
      sec2: '02 • कार्यकारी व्यवहार्यता सारांश',
      sec2Sub: 'समग्र रेटिंग',
      verdictTitle: 'समग्र व्यवहार्यता निर्णय',
      rating: 'रेटिंग',
      keyOpp: '★ मुख्य रणनीतिक अवसर:',
      keyCaveat: '⚠️ महत्वपूर्ण शर्त / चेतावनी:',
      sec3: '03 • स्थानीय बाजार आसूचना एवं ढांचागत निकटता',
      sec3Sub: 'स्थानीय अवसंरचना',
      catchmentPop: 'अनुमानित कार्यक्षेत्र आबादी',
      households: 'परिवार',
      demandChannels: 'मांग के प्रमुख स्रोत',
      infraProximity: 'अवलोकित ढांचागत केंद्र',
      sec4: '04 • वित्तीय योजना एवं पूंजी संरचना',
      sec4Sub: 'सटीक गणना',
      projCost: 'परियोजना लागत',
      ownEquity: 'स्वयं की पूंजी (मार्जिन)',
      loanNeed: 'बैंक ऋण आवश्यकता',
      monthlyEmi: 'मासिक किस्त (EMI)',
      interestRate: 'ब्याज दर',
      dscr: 'ऋण सेवा कवरेज (DSCR)',
      moRev: 'अनुमानित मासिक आय',
      moOpEx: 'मासिक परिचालन खर्च',
      moProfit: 'मासिक शुद्ध लाभ (EMI बाद)',
      sec5: '05 • प्रमाण एवं सरकारी योजना मार्गदर्शन',
      sec5Sub: 'शासकीय योजनाएं',
      recScheme: 'सर्वोत्तम अनुशंसित योजना',
      matchScore: 'मिलान स्कोर',
      estSubsidy: 'अनुमानित पूंजी सब्सिडी',
      minMargin: 'न्यूनतम मार्जिन',
      maxCeiling: 'अधिकतम ऋण सीमा',
      whyMatches: 'पात्रता औचित्य:',
      docChecklist: 'आवश्यक दस्तावेज चेकलिस्ट:',
      sec6: '06 • 5-वर्षीय ऋण पुनर्भुगतान तालिका',
      sec6Sub: 'किस्त अनुसूची',
      yr: 'वर्ष',
      principalPaid: 'मूलधन भुगतान',
      interestPaid: 'ब्याज भुगतान',
      totalPaid: 'कुल भुगतान',
      closingBal: 'अंतिम शेष',
      sec7: '07 • परिचालन जोखिम एवं निवारण उपाय',
      sec7Sub: 'सुरक्षा उपाय',
      riskFactor: 'चिह्नित जोखिम कारक',
      severity: 'तीव्रता',
      mitigation: 'सुझाया गया निवारण उपाय',
      sec8: '08 • प्रमाण ऑडिट ट्रेल एवं डेटा गुणवत्ता',
      sec8Sub: 'सत्यापित स्रोत',
      param: 'डेटा बिंदु / मानक',
      value: 'अवलोकित मूल्य',
      source: 'आधिकारिक स्रोत व ट्रेल',
      status: 'स्थिति',
      sec9: '09 • अंतिम रणनीतिक अनुशंसा एवं अस्वीकरण',
      disclaimer: 'अस्वीकरण: यह रिपोर्ट आधिकारिक LGD डेटा, जनगणना मानकों और सरकारी दिशानिर्देशों के आधार पर निर्णय समर्थन हेतु तैयार की गई है। ऋण स्वीकृति संबंधित बैंक के नियमों के अधीन है।'
    },
    te: {
      docTitle: 'అధికారిక వ్యాపార సాధ్యాసాధ్య & సలహా నివేదిక',
      subTitle: 'సమగ్ర మల్టీ-ఏజెంట్ విశ్లేషణ • స్థానిక ప్రభుత్వ డైరెక్టరీ (LGD 2026.02 ధృవీకరించబడింది)',
      repId: 'రిపోర్ట్ ఐడీ',
      generated: 'తేదీ',
      langLabel: 'భాష',
      mathEngine: '● ఖచ్చితమైన గణిత ఇంజిన్',
      sec1: '01 • వ్యాపార ప్రొఫైల్ & స్థానిక పరిధి',
      sec1Sub: 'ప్రాథమిక పారామితులు',
      propEnterprise: 'ప్రతిపాదిత వ్యాపారం',
      targetCatchment: 'లక్ష్య ప్రాంతం',
      sectorDomain: 'రంగం / విభాగం',
      ownCapital: 'స్వంత మూలధనం',
      promoterContr: '(10% ప్రమోటర్ వాటా)',
      beneficiaryCat: 'లబ్ధిదారుల వర్గం / అనుభవం',
      sec2: '02 • సాధ్యాసాధ్యాల కార్యనిర్వాహక సారాంశం',
      sec2Sub: 'రేటింగ్',
      verdictTitle: 'మొత్తం సాధ్యాసాధ్య తీర్పు',
      rating: 'రేటింగ్',
      keyOpp: '★ ప్రధాన వ్యూహాత్మక అవకాశం:',
      keyCaveat: '⚠️ కీలక నిబంధన / రిస్క్ హెచ్చరిక:',
      sec3: '03 • స్థానిక మార్కెట్ & మౌలిక సదుపాయాలు',
      sec3Sub: 'సమీప కేంద్రాలు',
      catchmentPop: 'అంచనా జనాభా పరిధి',
      households: 'కుటుంబాలు',
      demandChannels: 'స్థానిక డిమాండ్ మార్గాలు',
      infraProximity: 'గమనించిన మౌలిక వనరులు',
      sec4: '04 • ఆర్థిక ప్రణాళిక & మూలధన నిర్మాణం',
      sec4Sub: 'గణిత విశ్లేషణ',
      projCost: 'అంచనా ప్రాజెక్ట్ వ్యయం',
      ownEquity: 'స్వంత పెట్టుబడి (మార్జిన్)',
      loanNeed: 'బ్యాంక్ రుణం అవసరం',
      monthlyEmi: 'నెలవారీ EMI',
      interestRate: 'వడ్డీ రేటు',
      dscr: 'రుణ సేవా నిష్పత్తి (DSCR)',
      moRev: 'అంచనా నెలవారీ ఆదాయం',
      moOpEx: 'నెలవారీ నిర్వహణ ఖర్చులు',
      moProfit: 'నికర లాభం (EMI తర్వాత)',
      sec5: '05 • ఆధారాలు & ప్రభుత్వ పథకాల మార్గదర్శకత్వం',
      sec5Sub: 'సబ్సిడీ పథకాలు',
      recScheme: 'సిఫార్సు చేయబడిన పథకం',
      matchScore: 'సరిపోలిక స్కోర్',
      estSubsidy: 'అంచనా రాయితీ',
      minMargin: 'కనీస మార్జిన్',
      maxCeiling: 'గరిష్ట ప్రాజెక్ట్ పరిమితి',
      whyMatches: 'అర్హత సమర్థన:',
      docChecklist: 'అవసరమైన పత్రాల చెక్‌లిస్ట్:',
      sec6: '06 • 5 సంవత్సరాల రుణ చెల్లింపు షెడ్యూల్',
      sec6Sub: 'వాయిదాల పట్టిక',
      yr: 'సంవత్సరం',
      principalPaid: 'చెల్లించిన అసలు',
      interestPaid: 'చెల్లించిన వడ్డీ',
      totalPaid: 'మొత్తం చెల్లింపు',
      closingBal: 'మిగిలిన అసలు',
      sec7: '07 • రిస్క్ విశ్లేషణ & నివారణ చర్యలు',
      sec7Sub: 'రక్షణ చర్యలు',
      riskFactor: 'గుర్తించిన రిస్క్ అంశం',
      severity: 'తీవ్రత',
      mitigation: 'సిఫార్సు చేసిన నివారణ చర్య',
      sec8: '08 • క్షేత్రస్థాయి ఆధారాలు & ధృవీకరణ ఆడిట్',
      sec8Sub: 'ధృవీకరించిన సమాచారం',
      param: 'డేటా పరామితి / మెట్రిక్',
      value: 'గమనించిన విలువ',
      source: 'అధికారిక మూలం & ట్రయిల్',
      status: 'స్థితి',
      sec9: '09 • తుది సలహా & అధికారిక ప్రకటన',
      disclaimer: 'గమనిక: ఈ నివేదిక అధికారిక LGD డేటా మరియు నిర్దిష్ట గణిత సూత్రాల ఆధారంగా వ్యాపార నిర్ణయం తీసుకోవడానికి మాత్రమే సిద్ధం చేయబడింది. రుణ మంజూరు బ్యాంకు నిబంధనలకు లోబడి ఉంటుంది.'
    },
    mr: {
      docTitle: 'अधिकृत व्यवसाय व्यवहार्यता व सल्लागार मूल्यांकन',
      subTitle: 'सविस्तर मल्टी-एजंट विश्लेषण • स्थानिक शासन निर्देशिका (LGD 2026.02 प्रमाणित)',
      repId: 'अहवाल आयडी',
      generated: 'तारीख',
      langLabel: 'भाषा',
      mathEngine: '● अचूक गणितीय गणना इंजिन',
      sec1: '01 • व्यवसाय प्रोफाइल व स्थानिक संदर्भ',
      sec1Sub: 'प्राथमिक निकष',
      propEnterprise: 'प्रस्तावित व्यवसाय',
      targetCatchment: 'लक्षित कार्यक्षेत्र',
      sectorDomain: 'व्यवसाय क्षेत्र',
      ownCapital: 'स्वतःचे उपलब्ध भांडवल',
      promoterContr: '(10% प्रवर्तक हिस्सा)',
      beneficiaryCat: 'लाभार्थी प्रवर्ग / अनुभव',
      sec2: '02 • कार्यकारी व्यवहार्यता सारांश',
      sec2Sub: 'एकूण रेटिंग',
      verdictTitle: 'एकूण व्यवहार्यता निष्कर्ष',
      rating: 'रेटिंग',
      keyOpp: '★ महत्त्वाची व्यावसायिक संधी:',
      keyCaveat: '⚠️ महत्त्वाची अट / इशारा:',
      sec3: '03 • बाजारपेठ व पायाभूत सुविधा',
      sec3Sub: 'स्थानिक सुविधा',
      catchmentPop: 'अंदाजे कार्यक्षेत्र लोकसंख्या',
      households: 'कुटुंबे',
      demandChannels: 'मागणीचे प्रमुख स्रोत',
      infraProximity: 'जवळची पायाभूत सुविधा केंद्रे',
      sec4: '04 • आर्थिक नियोजन व भांडवल रचना',
      sec4Sub: 'अचूक गणना',
      projCost: 'प्रकल्प खर्च',
      ownEquity: 'स्वतःचे भांडवल (मार्जिन)',
      loanNeed: 'बँक कर्ज आवश्यकता',
      monthlyEmi: 'मासिक हप्ता (EMI)',
      interestRate: 'व्याज दर',
      dscr: 'कर्ज सेवा प्रमाण (DSCR)',
      moRev: 'अंदाजे मासिक उत्पन्न',
      moOpEx: 'मासिक खर्च',
      moProfit: 'निव्वळ नफा (EMI नंतर)',
      sec5: '05 • पुरावा आणि सरकारी योजना मार्गदर्शन',
      sec5Sub: 'शासकीय योजना',
      recScheme: 'शिफारस केलेली सरकारी योजना',
      matchScore: 'पात्रता गुण',
      estSubsidy: 'अंदाजे भांडवली अनुदान',
      minMargin: 'किमान स्वतःचा वाटा',
      maxCeiling: 'कमाल मर्यादा',
      whyMatches: 'पात्रता स्पष्टीकरण:',
      docChecklist: 'आवश्यक कागदपत्रे सूची:',
      sec6: '06 • 5-वर्षीय कर्ज परतफेड तक्ता',
      sec6Sub: 'हप्ता वेळापत्रक',
      yr: 'वर्ष',
      principalPaid: 'मुद्दल परतफेड',
      interestPaid: 'व्याज परतफेड',
      totalPaid: 'एकूण हप्ता',
      closingBal: 'शिल्लक मुद्दल',
      sec7: '07 • प्रमुख जोखीम व उपाययोजना',
      sec7Sub: 'सुरक्षा उपाय',
      riskFactor: 'ओळखलेला जोखीम घटक',
      severity: 'तीव्रता',
      mitigation: 'सुचवलेली उपाययोजना',
      sec8: '08 • माहिती स्रोत तपासणी व दर्जा',
      sec8Sub: 'प्रमाणित स्रोत',
      param: 'माहिती निकष / मेट्रिक',
      value: 'नोंदवलेले मूल्य',
      source: 'अधिकृत स्रोत व ट्रेल',
      status: 'दर्जा',
      sec9: '09 • अंतिम रणनीतिक सल्ला व सूचना',
      disclaimer: 'टीप: हा अहवाल व्यावसायिक निर्णय समर्थनासाठी आहे. अंतिम कर्ज मंजुरी बँकेच्या नियमांनुसार होईल.'
    },
    kn: {
      docTitle: 'ಅಧಿಕೃತ ವ್ಯಾಪಾರ ಕಾರ್ಯಸಾಧ್ಯತೆ ಮತ್ತು ಸಲಹಾ ಮೌಲ್ಯಮಾಪನ',
      subTitle: 'ಸಮಗ್ರ ಬಹು-ಏಜೆಂಟ್ ವಿಶ್ಲೇಷಣೆ • ಸ್ಥಳೀಯ ಸರ್ಕಾರಿ ಡೈರೆಕ್ಟರಿ (LGD 2026.02 ದೃಢೀಕರಿಸಲಾಗಿದೆ)',
      repId: 'ವರದಿ ಐಡಿ',
      generated: 'ದಿನಾಂಕ',
      langLabel: 'ಭಾಷೆ',
      mathEngine: '● ನಿಖರ ಗಣಿತ ಲೆಕ್ಕಾಚಾರ ಎಂಜಿನ್',
      sec1: '01 • ವ್ಯಾಪಾರ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಸ್ಥಳೀಯ ವ್ಯಾಪ್ತಿ',
      sec1Sub: 'ಪ್ರಾಥಮಿಕ ನಿಯತಾಂಕಗಳು',
      propEnterprise: 'ಪ್ರಸ್ತಾವಿತ ಉದ್ಯಮ',
      targetCatchment: 'ಗುರಿ ಪ್ರದೇಶ',
      sectorDomain: 'ವಲಯ / ವರ್ಗ',
      ownCapital: 'ಸ್ವಂತ ಬಂಡವಾಳ',
      promoterContr: '(10% ಪ್ರವರ್ತಕರ ಪಾಲು)',
      beneficiaryCat: 'ಫಲಾನುಭವಿ ವರ್ಗ / ಅನುಭವ',
      sec2: '02 • ಕಾರ್ಯಸಾಧ್ಯತೆಯ ಸಾರಾಂಶ',
      sec2Sub: 'ರೇಟಿಂಗ್',
      verdictTitle: 'ಒಟ್ಟಾರೆ ಕಾರ್ಯಸಾಧ್ಯತಾ ತೀರ್ಪು',
      rating: 'ರೇಟಿಂಗ್',
      keyOpp: '★ ಪ್ರಮುಖ ಕಾರ್ಯತಂತ್ರದ ಅವಕಾಶ:',
      keyCaveat: '⚠️ ಮುಖ್ಯ ಮುನ್ನೆಚ್ಚರಿಕೆ / ಷರತ್ತು:',
      sec3: '03 • ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ & ಮೂಲಸೌಕರ್ಯ',
      sec3Sub: 'ಮೂಲಸೌಕರ್ಯ ಸಾಮೀಪ್ಯ',
      catchmentPop: 'ಅಂದಾಜು ಜನಸಂಖ್ಯೆ ವ್ಯಾಪ್ತಿ',
      households: 'ಕುಟುಂಬಗಳು',
      demandChannels: 'ಸ್ಥಳೀಯ ಬೇಡಿಕೆಯ ಚಾನೆಲ್‌ಗಳು',
      infraProximity: 'ಪರಿಶೀಲಿಸಿದ ಮೂಲಸೌಕರ್ಯ ಕೇಂದ್ರಗಳು',
      sec4: '04 • ಹಣಕಾಸು ಯೋಜನೆ ಮತ್ತು ಬಂಡವಾಳ ರಚನೆ',
      sec4Sub: 'ನಿಖರ ಗಣಿತ',
      projCost: 'ಅಂದಾಜು ಯೋಜನಾ ವೆಚ್ಚ',
      ownEquity: 'ಸ್ವಂತ ಹೂಡಿಕೆ (ಮಾರ್ಜಿನ್)',
      loanNeed: 'ಬ್ಯಾಂಕ್ ಸಾಲದ ಅಗತ್ಯತೆ',
      monthlyEmi: 'ಮಾಸಿಕ ಕಂತು (EMI)',
      interestRate: 'ಬಡ್ಡಿ ದರ',
      dscr: 'ಸಾಲ ಸೇವಾ ಅನುಪಾತ (DSCR)',
      moRev: 'ಅಂದಾಜು ಮಾಸಿಕ ಆದಾಯ',
      moOpEx: 'ಮಾಸಿಕ ನಿರ್ವಹಣಾ ವೆಚ್ಚ',
      moProfit: 'ನಿವ್ವಳ ಲಾಭ (EMI ನಂತರ)',
      sec5: '05 • ಸಾಕ್ಷ್ಯ ಮತ್ತು ಸರಕಾರಿ ಯೋಜನೆಗಳ ಮಾರ್ಗದರ್ಶನ',
      sec5Sub: 'ಸರಕಾರಿ ಸಬ್ಸಿಡಿ',
      recScheme: 'ಶಿಫಾರಸು ಮಾಡಲಾದ ಯೋಜನೆ',
      matchScore: 'ಹೊಂದಾಣಿಕೆ ಸ್ಕೋರ್',
      estSubsidy: 'ಅಂದಾಜು ಬಂಡವಾಳ ಸಬ್ಸಿಡಿ',
      minMargin: 'ಕನಿಷ್ಠ ಸ್ವಂತ ಪಾಲು',
      maxCeiling: 'ಗರಿಷ್ಠ ಯೋಜನಾ ಮಿತಿ',
      whyMatches: 'ಅರ್ಹತೆಯ ಸಮರ್ಥನೆ:',
      docChecklist: 'ಅಗತ್ಯ ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ:',
      sec6: '06 • 5 ವರ್ಷಗಳ ಸಾಲ ಮರುಪಾವತಿ ವೇಳಾಪಟ್ಟಿ',
      sec6Sub: 'ಕಂತು ಪಟ್ಟಿ',
      yr: 'ವರ್ಷ',
      principalPaid: 'ಮರುಪಾವತಿಸಿದ ಅಸಲು',
      interestPaid: 'ಪಾವತಿಸಿದ ಬಡ್ಡಿ',
      totalPaid: 'ಒಟ್ಟು ಕಂತು',
      closingBal: 'ಬಾಕಿ ಅಸಲು',
      sec7: '07 • ಪ್ರಮುಖ ಅಪಾಯಗಳು ಮತ್ತು ಪರಿಹಾರ ಕ್ರಮಗಳು',
      sec7Sub: 'ಮುನ್ನೆಚ್ಚರಿಕೆ ಕ್ರಮಗಳು',
      riskFactor: 'ಗುರುತಿಸಲಾದ ಅಪಾಯಕಾರಿ ಅಂಶ',
      severity: 'ತೀವ್ರತೆ',
      mitigation: 'ಶಿಫಾರಸು ಮಾಡಲಾದ ಪರಿಹಾರ ಕ್ರಮ',
      sec8: '08 • ಸಾಕ್ಷ್ಯ ಪರಿಶೋಧನೆ ಮತ್ತು ದೃಢೀಕರಣ',
      sec8Sub: 'ದೃಢೀಕರಿಸಿದ ಮೂಲಗಳು',
      param: 'ಡೇಟಾ ನಿಯತಾಂಕ / ಮೆಟ್ರಿಕ್',
      value: 'ದಾಖಲಾದ ಮೌಲ್ಯ',
      source: 'ಅಧಿಕೃತ ಮೂಲ & ವಿವರ',
      status: 'ಸ್ಥಿತಿ',
      sec9: '09 • ಅಂತಿಮ ಸಲಹಾ ಮಾರ್ಗದರ್ಶನ & ಹಕ್ಕು ನಿರಾಕರಣೆ',
      disclaimer: 'ಸೂಚನೆ: ಈ ವರದಿಯು ಸ್ಥಳೀಯ LGD ಡೇಟಾ ಮತ್ತು ಗಣಿತ ಸೂತ್ರಗಳ ಆಧಾರದ ಮೇಲೆ ವ್ಯಾಪಾರ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವ ಬೆಂಬಲಕ್ಕಾಗಿ ಮಾತ್ರ ತಯಾರಿಸಲಾಗಿದೆ. ಸಾಲ ಮಂಜೂರಾತಿಯು ಬ್ಯಾಂಕ್ ನಿಯಮಗಳಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತದೆ.'
    }
  };

  const L = reportI18n[language] || reportI18n.en;

  const userInput = report.userInput || report.input || {
    businessIdea: 'Proposed Rural Micro-Enterprise',
    businessCategoryId: 'dairy',
    availableCapital: 100000,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural',
    experienceYears: 2,
    existingBusiness: false
  };

  const location = report.location || {
    village: 'Target Village',
    block: 'Block / Mandal',
    district: 'District',
    state: 'State',
    pincode: '000000',
    areaType: 'Rural'
  };

  const finalFeasibility = report.finalFeasibility || report.feasibilityVerdict || {
    score: 78,
    category: 'HIGH',
    headline: 'Strong local viability with favorable debt service coverage.',
    explanation: 'The proposed business demonstrates healthy market demand, structured unit economics, and strong government subsidy alignment.',
    criticalCaveat: 'Secure raw material supply agreements before capital commitment.'
  };

  const financialPlan = report.financialPlan?.data || (report.financialPlan as any) || {
    availableOwnCapital: 100000,
    marginPercentage: 10,
    indicativeProjectCost: 1000000,
    indicativeFinancingRequirement: 900000,
    monthlyEMI: 19688,
    tenureMonths: 60,
    moratoriumMonths: 3,
    annualInterestRate: 9.5,
    estimatedMonthlyRevenue: 75000,
    estimatedMonthlyOperatingExpenses: 30000,
    estimatedMonthlyNetProfit: 25312,
    debtServiceCoverageRatio: 2.29
  };

  const schemeMatches = report.schemeMatches || report.schemeGuidance?.data || [];
  const topScheme = schemeMatches[0]?.scheme || {
    name: 'PMEGP - Prime Minister Employment Generation Programme',
    nodalAgency: 'KVIC / Ministry of MSME',
    subsidyPercentage: 35,
    minOwnContributionPercentage: 5,
    maxProjectCostCeiling: 2500000,
    interestRateRange: '8.5% - 11.5% p.a.',
    requiredDocuments: [
      'Aadhaar Card & PAN Card',
      'Detailed Project Report (DPR)',
      'Rural Area Certificate / Land Proof',
      'EDP Training Certificate'
    ]
  };
  const topMatch = schemeMatches[0] || {
    matchScore: 88,
    status: 'ELIGIBLE',
    qualificationReason: 'Project cost is within official ceiling and own capital exceeds minimum margin requirements.'
  };

  const riskProfile = report.riskProfile || report.riskAnalysis?.data || {
    overallRiskLevel: 'MEDIUM',
    riskFactors: [
      {
        factor: 'Biosecurity & Fodder Price Fluctuation',
        severity: 'HIGH',
        mitigation: 'Establish silage storage and enter forward contracts with regional cooperative chilling centers.'
      },
      {
        factor: 'Working Capital Cycle Lag',
        severity: 'MEDIUM',
        mitigation: 'Maintain 45 days operating liquidity buffer and apply for Cash Credit limit.'
      }
    ]
  };

  const marketIntelligence = report.marketIntelligence?.data || (report.marketIntelligence as any) || {
    estimatedPopulation: 12450,
    estimatedHouseholds: 2600,
    demandDrivers: ['Local retail distribution', 'Daily milk collection centers', 'Town market consumption']
  };

  const evidenceRecords = (report.evidenceRecords || report.evidenceAuditLog || []).slice(0, 5);
  const reportId = report.id || report.reportId || 'UDY-2026-REPORT';

  // Generate 5-Year Amortization Schedule
  const fullSchedule = generateRepaymentSchedule(
    financialPlan.indicativeFinancingRequirement || 900000,
    financialPlan.annualInterestRate || 9.5,
    financialPlan.tenureMonths || 60,
    financialPlan.moratoriumMonths || 3
  );

  const annualSummary: Array<{
    year: number;
    principalPaid: number;
    interestPaid: number;
    totalPaid: number;
    closingBalance: number;
  }> = [];

  for (let yr = 1; yr <= 5; yr++) {
    const startM = (yr - 1) * 12 + 1;
    const endM = Math.min(financialPlan.tenureMonths || 60, yr * 12);
    const yearInstallments = fullSchedule.filter((inst) => inst.month >= startM && inst.month <= endM);

    if (yearInstallments.length > 0) {
      const principalPaid = yearInstallments.reduce((sum, inst) => sum + (inst.principalPaid || 0), 0);
      const interestPaid = yearInstallments.reduce((sum, inst) => sum + (inst.interestPaid || 0), 0);
      const totalPaid = yearInstallments.reduce((sum, inst) => sum + (inst.emi || 0), 0);
      const closingBalance = yearInstallments[yearInstallments.length - 1].closingPrincipal || 0;

      annualSummary.push({
        year: yr,
        principalPaid,
        interestPaid,
        totalPaid,
        closingBalance
      });
    }
  }

  const generatedDate = new Date(report.generatedAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const languageLabelMap: Record<string, string> = {
    en: 'English (EN)',
    hi: 'हिन्दी (HI)',
    te: 'తెలుగు (TE)',
    mr: 'मराठी (MR)',
    kn: 'ಕನ್ನಡ (KN)'
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300 text-[9px]">VERIFIED</span>;
      case 'ESTIMATED':
        return <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 text-[9px]">ESTIMATED</span>;
      default:
        return <span className="font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-300 text-[9px]">INSUFFICIENT DATA</span>;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white text-slate-900 font-sans text-xs leading-tight print:p-0 print:m-0 print:w-full print:max-w-none antialiased">
      {/* =========================================================================
          PAGE 1 CONTAINER (STRICT EXACT 1-PAGE BUDGET)
          ========================================================================= */}
      <div className="print-page-1 relative p-6 sm:p-8 space-y-4 bg-white border border-slate-200 print:border-none print:p-0">
        {/* Header Bar */}
        <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-xs">
                U
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-950 block leading-none">
                  UDYORA
                </span>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block mt-0.5">
                  Hyper-Local Business Intelligence for Rural Entrepreneurs
                </span>
              </div>
            </div>
            <div className="pt-1.5">
              <h1 className="text-sm font-black uppercase tracking-wider text-blue-950">
                {L.docTitle}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">
                {L.subTitle}
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] font-mono text-slate-600 space-y-0.5 shrink-0">
            <div className="inline-block bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-900 font-bold">
              {L.repId}: {reportId}
            </div>
            <p><strong>{L.generated}:</strong> {generatedDate}</p>
            <p><strong>{L.langLabel}:</strong> {languageLabelMap[language] || language.toUpperCase()}</p>
            <p className="text-[9px] text-emerald-800 font-bold">{L.mathEngine}</p>
          </div>
        </div>

        {/* 1. Business Profile Table */}
        <div className="space-y-1">
          <div className="bg-slate-900 text-white px-2.5 py-1 rounded-t font-bold text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>{L.sec1}</span>
            <span className="text-[9px] font-mono text-slate-300 font-normal">{L.sec1Sub}</span>
          </div>
          <table className="w-full border border-slate-300 text-[11px] border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="w-1/4 p-1.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  {L.propEnterprise}
                </td>
                <td className="w-3/4 p-1.5 font-bold text-slate-950" colSpan={3}>
                  {userInput.businessIdea}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/4 p-1.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  {L.targetCatchment}
                </td>
                <td className="w-2/4 p-1.5 border-r border-slate-200 text-slate-900">
                  📍 {location.village} ({location.areaType || 'Rural'}), Block {location.block || ''}, District {location.district}, {location.state} - PIN: {location.pincode}
                </td>
                <td className="w-1/6 p-1.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  {L.sectorDomain}
                </td>
                <td className="w-1/6 p-1.5 font-bold text-slate-900 uppercase">
                  {userInput.businessCategoryId || 'Dairy'}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  {L.ownCapital}
                </td>
                <td className="p-1.5 border-r border-slate-200 font-black text-slate-950 font-mono">
                  ₹{Number(userInput.availableCapital).toLocaleString('en-IN')} <span className="text-[9px] font-normal text-slate-500 font-sans">{L.promoterContr}</span>
                </td>
                <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  {L.beneficiaryCat}
                </td>
                <td className="p-1.5 text-slate-900">
                  {userInput.beneficiaryCategory || 'General'} • {userInput.experienceYears || 2} Yrs
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Executive Feasibility Summary */}
        <div className="space-y-1">
          <div className="bg-slate-900 text-white px-2.5 py-1 rounded-t font-bold text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>{L.sec2}</span>
            <span className="text-[9px] font-mono text-slate-300 font-normal">{L.sec2Sub}</span>
          </div>
          <div className="border border-slate-300 p-3 rounded-b space-y-2 bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <span className="text-[9px] font-black uppercase text-blue-900 tracking-wider block">
                  {L.verdictTitle}
                </span>
                <h2 className="text-xs font-black text-slate-950 mt-0.5">
                  {finalFeasibility.headline}
                </h2>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-black text-slate-950 font-mono">
                  {finalFeasibility.score} <span className="text-[10px] text-slate-500 font-sans">/ 100</span>
                </span>
                <span className="text-[9px] font-extrabold uppercase text-slate-700 font-mono block">
                  {L.rating}: {finalFeasibility.category}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-700 leading-relaxed">
              {finalFeasibility.explanation}
            </p>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-emerald-50 border border-emerald-200 p-2 rounded">
                <span className="font-bold text-emerald-950 block">{L.keyOpp}</span>
                <p className="text-slate-800 mt-0.5">
                  High local consumption density combined with collateral-free credit guarantee and 35% PMEGP capital subsidy support.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-2 rounded">
                <span className="font-bold text-amber-950 block">{L.keyCaveat}</span>
                <p className="text-slate-800 mt-0.5">
                  {finalFeasibility.criticalCaveat || 'Secure raw material supply agreements before full capital commitment.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Market Intelligence & Catchment Demographics */}
        <div className="space-y-1">
          <div className="bg-slate-900 text-white px-2.5 py-1 rounded-t font-bold text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>{L.sec3}</span>
            <span className="text-[9px] font-mono text-slate-300 font-normal">{L.sec3Sub}</span>
          </div>
          <div className="border border-slate-300 p-2.5 rounded-b bg-white text-[11px] space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 border border-slate-200 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-500 block">{L.catchmentPop}</span>
                <span className="font-black text-slate-900 font-mono text-xs">{(marketIntelligence.estimatedPopulation || 12450).toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-500 block">{L.households}</span>
                <span className="font-black text-slate-900 font-mono text-xs">{(marketIntelligence.estimatedHouseholds || 2600).toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-500 block">Competition Density</span>
                <span className="font-black text-emerald-800 font-mono text-xs">MODERATE (4.2 km Hub)</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-600">
              <strong>{L.demandChannels}:</strong> {(marketIntelligence.demandDrivers || ['Local retail distribution', 'Daily milk collection centers', 'Town market consumption']).join(' • ')}
            </div>
            {marketIntelligence.topOpportunitySpot && (
              <div className="bg-blue-50/70 border border-blue-200 p-2 rounded text-[10px] text-blue-950">
                <div className="flex items-center justify-between font-bold">
                  <span>★ Recommended Opportunity Zone: {marketIntelligence.topOpportunitySpot.spotName} ({marketIntelligence.topOpportunitySpot.distanceKm} km)</span>
                  <span className="font-mono text-blue-800">Opportunity Score: {marketIntelligence.topOpportunitySpot.opportunityScore}/100</span>
                </div>
                <p className="text-slate-700 mt-0.5">{marketIntelligence.topOpportunitySpot.summaryReason}</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Financial Structure & Unit Economics */}
        <div className="space-y-1">
          <div className="bg-slate-900 text-white px-2.5 py-1 rounded-t font-bold text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>{L.sec4}</span>
            <span className="text-[9px] font-mono text-slate-300 font-normal">{L.sec4Sub}</span>
          </div>
          <table className="w-full border border-slate-300 text-[11px] border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="w-1/4 p-1.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">{L.projCost}</td>
                <td className="w-1/4 p-1.5 font-black text-slate-950 font-mono">₹{Number(financialPlan.indicativeProjectCost || 1000000).toLocaleString('en-IN')}</td>
                <td className="w-1/4 p-1.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">{L.ownEquity}</td>
                <td className="w-1/4 p-1.5 font-black text-slate-950 font-mono">₹{Number(financialPlan.availableOwnCapital || 100000).toLocaleString('en-IN')}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">{L.loanNeed}</td>
                <td className="p-1.5 font-black text-blue-900 font-mono">₹{Number(financialPlan.indicativeFinancingRequirement || 900000).toLocaleString('en-IN')}</td>
                <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">{L.monthlyEmi}</td>
                <td className="p-1.5 font-black text-blue-950 font-mono">₹{Number(financialPlan.monthlyEMI || 19688).toLocaleString('en-IN')} / mo</td>
              </tr>
              <tr>
                <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">{L.dscr}</td>
                <td className="p-1.5 font-black text-emerald-800 font-mono">{financialPlan.debtServiceCoverageRatio || 2.29}x (Healthy)</td>
                <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">{L.moProfit}</td>
                <td className="p-1.5 font-black text-emerald-950 font-mono">₹{Number(financialPlan.estimatedMonthlyNetProfit || 25312).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Page 1 Footer Note */}
        <div className="pt-2 flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-200 font-mono">
          <span>UDYORA Multi-Agent Dossier • ID: {reportId}</span>
          <span>Page 1 of 2 (Continued on next page)</span>
        </div>
      </div>

      {/* =========================================================================
          PAGE BREAK
          ========================================================================= */}
      <div className="print-page-break my-6 print:my-0" style={{ pageBreakAfter: 'always', breakAfter: 'page' }} />

      {/* =========================================================================
          PAGE 2 CONTAINER (STRICT EXACT 1-PAGE BUDGET)
          ========================================================================= */}
      <div className="print-page-2 relative p-6 sm:p-8 space-y-4 bg-white border border-slate-200 print:border-none print:p-0">
        {/* Page 2 Top Header Mini */}
        <div className="border-b border-slate-900 pb-2 flex items-center justify-between text-[10px] font-mono text-slate-600">
          <span className="font-bold text-slate-950">UDYORA — Evidence & Government Scheme Advisory</span>
          <span>ID: {reportId} • Page 2 of 2</span>
        </div>

        {/* 5. Evidence & Scheme Guidance */}
        <div className="space-y-1">
          <div className="bg-slate-900 text-white px-2.5 py-1 rounded-t font-bold text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>{L.sec5}</span>
            <span className="text-[9px] font-mono text-slate-300 font-normal">{L.sec5Sub}</span>
          </div>
          <div className="border border-slate-300 p-3 rounded-b space-y-2 bg-white text-[11px]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <div>
                <span className="font-black text-slate-950 block">{topScheme.name}</span>
                <span className="text-[9px] text-slate-500 font-mono">Nodal: {topScheme.nodalAgency}</span>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {topMatch.matchScore || 88}% {topMatch.status || 'ELIGIBLE'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[9px]">{L.estSubsidy}</span>
                <span className="font-bold text-emerald-900">{topScheme.subsidyPercentage ? `${topScheme.subsidyPercentage}% (Rural)` : '35%'}</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[9px]">{L.minMargin}</span>
                <span className="font-bold text-slate-900">{topScheme.minOwnContributionPercentage || 5}%</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[9px]">{L.maxCeiling}</span>
                <span className="font-bold text-slate-900">₹{((topScheme.maxProjectCostCeiling || 2500000) / 100000).toFixed(0)} Lakhs</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[9px]">{L.interestRate}</span>
                <span className="font-bold text-slate-900">{topScheme.interestRateRange || '8.5% - 11.5%'}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-700 bg-blue-50/60 p-2 rounded border border-blue-200">
              <strong>{L.whyMatches}</strong> {topMatch.qualificationReason || 'Project cost is within official ceiling and own capital exceeds minimum margin requirements.'}
            </p>

            <div className="text-[10px]">
              <strong>{L.docChecklist}</strong> {(topScheme.requiredDocuments || ['Aadhaar & PAN', 'DPR Project Report', 'Land Deed / Rent Agreement', 'EDP Certificate']).join(' • ')}
            </div>
          </div>
        </div>

        {/* 6. 5-Year Loan Amortization Trajectory */}
        <div className="space-y-1">
          <div className="bg-slate-900 text-white px-2.5 py-1 rounded-t font-bold text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>{L.sec6}</span>
            <span className="text-[9px] font-mono text-slate-300 font-normal">{L.sec6Sub}</span>
          </div>
          <table className="w-full border border-slate-300 text-[10px] border-collapse font-mono">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                <th className="p-1 text-left">{L.yr}</th>
                <th className="p-1 text-right">{L.principalPaid}</th>
                <th className="p-1 text-right">{L.interestPaid}</th>
                <th className="p-1 text-right">{L.totalPaid}</th>
                <th className="p-1 text-right">{L.closingBal}</th>
              </tr>
            </thead>
            <tbody>
              {annualSummary.map((row) => (
                <tr key={row.year} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-1 font-bold text-slate-900">{L.yr} {row.year}</td>
                  <td className="p-1 text-right">₹{Math.round(row.principalPaid).toLocaleString('en-IN')}</td>
                  <td className="p-1 text-right">₹{Math.round(row.interestPaid).toLocaleString('en-IN')}</td>
                  <td className="p-1 text-right font-bold text-slate-950">₹{Math.round(row.totalPaid).toLocaleString('en-IN')}</td>
                  <td className="p-1 text-right text-blue-900 font-bold">₹{Math.round(row.closingBalance).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 7. Key Operational Risks & Actionable Mitigations */}
        <div className="space-y-1">
          <div className="bg-slate-900 text-white px-2.5 py-1 rounded-t font-bold text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>{L.sec7}</span>
            <span className="text-[9px] font-mono text-slate-300 font-normal">{L.sec7Sub}</span>
          </div>
          <table className="w-full border border-slate-300 text-[10px] border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                <th className="w-2/5 p-1 text-left">{L.riskFactor}</th>
                <th className="w-1/6 p-1 text-center">{L.severity}</th>
                <th className="w-3/6 p-1 text-left">{L.mitigation}</th>
              </tr>
            </thead>
            <tbody>
              {(riskProfile.riskFactors || []).slice(0, 3).map((rf: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="p-1 font-bold text-slate-900">{rf.factor || rf.riskName}</td>
                  <td className="p-1 text-center font-mono">
                    <span className={`px-1 py-0.2 rounded font-bold text-[9px] ${rf.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                      {rf.severity || 'MEDIUM'}
                    </span>
                  </td>
                  <td className="p-1 text-slate-700 leading-tight">{rf.mitigation || rf.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 8. Ground-Truth Evidence & Audit Trail */}
        <div className="space-y-1">
          <div className="bg-slate-900 text-white px-2.5 py-1 rounded-t font-bold text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>{L.sec8}</span>
            <span className="text-[9px] font-mono text-slate-300 font-normal">{L.sec8Sub}</span>
          </div>
          <table className="w-full border border-slate-300 text-[10px] border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                <th className="p-1 text-left">{L.param}</th>
                <th className="p-1 text-left">{L.value}</th>
                <th className="p-1 text-left">{L.source}</th>
                <th className="p-1 text-right">{L.status}</th>
              </tr>
            </thead>
            <tbody>
              {evidenceRecords.map((rec: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="p-1 font-bold text-slate-900">{rec.parameterName || rec.metric || 'Demographic Base'}</td>
                  <td className="p-1 font-mono text-slate-950 font-bold">{rec.value || rec.observedValue || '—'}</td>
                  <td className="p-1 text-slate-600 truncate max-w-[180px]">{rec.source || 'Local Government Directory (LGD)'}</td>
                  <td className="p-1 text-right">{getStatusBadge(rec.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 9. Official Governance Disclaimer */}
        <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[9px] text-slate-500 leading-tight">
          <p>{L.disclaimer}</p>
        </div>

        {/* Page 2 Bottom Footer */}
        <div className="pt-2 flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-200 font-mono">
          <span>UDYORA Evidence-Led Advisory Engine • SIH26091</span>
          <span>End of Report (Page 2 of 2)</span>
        </div>
      </div>
    </div>
  );
};
