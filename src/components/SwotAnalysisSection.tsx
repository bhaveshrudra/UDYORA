import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Info,
  CheckCircle2,
  HelpCircle,
  Database,
  Layers
} from 'lucide-react';
import { SwotAnalysis, SwotItem } from '../types/swotTypes';
import { EvidenceRecord } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage } from '../i18n/types';

interface SwotAnalysisSectionProps {
  swotAnalysis?: SwotAnalysis;
  evidenceAuditLog?: EvidenceRecord[];
}

// Natural Language Localization Dictionary for SWOT Elements
const SWOT_LOCALIZED_FACTORS: Record<
  SupportedLanguage,
  Record<string, { title: string; badgeLabel?: string }>
> = {
  en: {
    swot_s_dscr: { title: 'Robust Debt-Service Coverage & Repayment Capacity', badgeLabel: 'Financial Viability' },
    swot_s_equity: { title: 'Adequate Promoter Equity Contribution', badgeLabel: 'Equity Readiness' },
    swot_s_location_access: { title: 'Strategic Market Corridor Proximity', badgeLabel: 'Transit Access' },
    swot_s_dairy_coop: { title: 'Direct Dairy Cooperative Collection Access', badgeLabel: 'Supply Chain Link' },
    swot_s_retail_footfall: { title: 'High Household Density & Footfall', badgeLabel: 'Demand Catchment' },
    swot_s_tailoring_margin: { title: 'High Value-Add Custom Tailoring Margin', badgeLabel: 'Unit Economics' },
    swot_s_poultry_land: { title: 'Optimal Rural Land Buffer & Biosecurity', badgeLabel: 'Infrastructure' },
    swot_w_feed_dependency: { title: 'Commercial Cattle Feed & Fodder Cost Concentration', badgeLabel: 'OpEx Sensitivity' },
    swot_w_working_capital: { title: 'Working Capital Cycle Lag', badgeLabel: 'Liquidity Buffer' },
    swot_w_retail_inventory: { title: 'Working Capital Lock-in in Stock Inventory', badgeLabel: 'Cash Flow Lock-in' },
    swot_w_tailoring_capacity: { title: 'Single-Operator Labor Capacity Constraint', badgeLabel: 'Labor Capacity' },
    swot_w_poultry_disease: { title: 'Seasonal Disease Outbreak & Mortality Risk', badgeLabel: 'Biosecurity Risk' },
    swot_w_capital_constrained: { title: 'Constrained Equity Buffer for Working Capital', badgeLabel: 'Capital Adequacy' },
    swot_w_missing_pop: { title: 'Unverified Micro-Demographic Catchment', badgeLabel: 'Data Precondition' },
    swot_o_scheme_subsidy: { title: 'Capital Subsidy Under Matched Government Scheme', badgeLabel: 'Policy Incentive' },
    swot_o_dairy_value_add: { title: 'Value-Added Dairy Products (Ghee, Curd, Paneer)', badgeLabel: 'Margin Expansion' },
    swot_o_retail_upi: { title: 'Digital Payments (UPI) & FMCG Product Expansion', badgeLabel: 'Revenue Upsell' },
    swot_o_tailoring_bulk: { title: 'Institutional Uniforms & Festive Custom Apparel', badgeLabel: 'B2B Contracts' },
    swot_o_poultry_direct: { title: 'Direct Off-Take to Local Dhabas, Hotels & Weekly Haats', badgeLabel: 'Direct Channel' },
    swot_o_opportunity_spot: { title: 'High-Demand Commercial Catchment Proximity', badgeLabel: 'Spatial Advantage' }
  },
  hi: {
    swot_s_dscr: { title: 'मजबूत ऋण पुनर्भुगतान क्षमता (DSCR)', badgeLabel: 'वित्तीय व्यवहार्यता' },
    swot_s_equity: { title: 'पर्याप्त प्रमोटर पूँजी योगदान', badgeLabel: 'पूँजी तत्परता' },
    swot_s_location_access: { title: 'रणनीतिक बाज़ार व परिवहन संपर्क', badgeLabel: 'परिवहन सुविधा' },
    swot_s_dairy_coop: { title: 'डेयरी सहकारी समिति से सीधा संपर्क', badgeLabel: 'आपूर्ति श्रृंखला' },
    swot_s_retail_footfall: { title: 'सघन पारिवारिक आबादी एवं उपभोक्ता आवक', badgeLabel: 'मांग क्षेत्र' },
    swot_s_tailoring_margin: { title: 'सिलाई कार्य में उच्च लाभ मार्जिन', badgeLabel: 'इकाई अर्थशास्त्र' },
    swot_s_poultry_land: { title: 'पोल्ट्री हेतु उपयुक्त ग्रामीण भूमि व जैव-सुरक्षा', badgeLabel: 'बुनियादी ढाँचा' },
    swot_w_feed_dependency: { title: 'पशु आहार एवं चारे की लागत पर निर्भरता', badgeLabel: 'लागत संवेदनशीलता' },
    swot_w_working_capital: { title: 'कार्यशील पूँजी चक्र में देरी का जोखिम', badgeLabel: 'तरलता बफर' },
    swot_w_retail_inventory: { title: 'दुकान के माल/स्टॉक में पूँजी फँसने का जोखिम', badgeLabel: 'कैश फ्लो रुकावट' },
    swot_w_tailoring_capacity: { title: 'एकल कारीगर उत्पादन क्षमता की सीमा', badgeLabel: 'श्रम क्षमता' },
    swot_w_poultry_disease: { title: 'मौसमी बीमारी एवं पक्षियों की मृत्यु दर का जोखिम', badgeLabel: 'जैव-सुरक्षा जोखिम' },
    swot_w_capital_constrained: { title: 'शुरुआती कार्यशील पूँजी हेतु सीमित पूँजी बफर', badgeLabel: 'पूँजी पर्याप्तता' },
    swot_w_missing_pop: { title: 'असत्यापित स्थानीय जनसंख्या आंकड़े', badgeLabel: 'डेटा पूर्व-शर्त' },
    swot_o_scheme_subsidy: { title: 'सरकारी योजना के तहत पूँजीगत सब्सिडी का लाभ', badgeLabel: 'नीतिगत प्रोत्साहन' },
    swot_o_dairy_value_add: { title: 'मूल्यवर्धित डेयरी उत्पाद (घी, दही, पनीर)', badgeLabel: 'मार्जिन विस्तार' },
    swot_o_retail_upi: { title: 'डिजिटल भुगतान (UPI) और दैनिक किराना विस्तार', badgeLabel: 'आय वृद्धि' },
    swot_o_tailoring_bulk: { title: 'स्कूल यूनिफॉर्म एवं त्यौहारी कपड़ों के थोक ऑर्डर', badgeLabel: 'संस्थागत ऑर्डर' },
    swot_o_poultry_direct: { title: 'स्थानीय ढाबों, होटलों और साप्ताहिक हाटों में सीधी बिक्री', badgeLabel: 'सीधा बाज़ार' },
    swot_o_opportunity_spot: { title: 'उच्च मांग वाले व्यावसायिक क्षेत्र में स्थान', badgeLabel: 'स्थानिक लाभ' }
  },
  mr: {
    swot_s_dscr: { title: 'मजबूत कर्ज परतफेड क्षमता (DSCR)', badgeLabel: 'आर्थिक व्यवहार्यता' },
    swot_s_equity: { title: 'पुरेसे स्वतःचे भांडवली योगदान', badgeLabel: 'भांडवल तयारी' },
    swot_s_location_access: { title: 'मोक्याचे बाजारपेठ व वाहतूक स्थान', badgeLabel: 'वाहतूक संपर्क' },
    swot_s_dairy_coop: { title: 'दूध उत्पादक सहकारी संस्थेशी थेट संपर्क', badgeLabel: 'पुरवठा साखळी' },
    swot_s_retail_footfall: { title: 'दाट वस्ती व नियमित ग्राहक वावर', badgeLabel: 'मागणी क्षेत्र' },
    swot_s_tailoring_margin: { title: 'टेलरिंग कामात उत्तम नफा मार्जिन', badgeLabel: 'व्यवसाय नफा' },
    swot_s_poultry_land: { title: 'कुक्कुटपालनासाठी योग्य ग्रामीण जागा व जैवसुरक्षा', badgeLabel: 'पायाभूत सुविधा' },
    swot_w_feed_dependency: { title: 'पशुखाद्य व चाऱ्याच्या खर्चावर अधिक अवलंबित्व', badgeLabel: 'खर्च संवेदनशीलता' },
    swot_w_working_capital: { title: 'खेळत्या भांडवलाच्या चक्रातील अंतर', badgeLabel: 'तरलता राखीव' },
    swot_w_retail_inventory: { title: 'मालाच्या साठ्यात भांडवल अडकण्याचा धोका', badgeLabel: 'कॅश फ्लो अडचण' },
    swot_w_tailoring_capacity: { title: 'एकाच कारागिराच्या कामाची मर्यादा', badgeLabel: 'कामगार क्षमता' },
    swot_w_poultry_disease: { title: 'हंगामी साथीचे आजार व पक्षी मृत्यूचा धोका', badgeLabel: 'जैवसुरक्षा धोका' },
    swot_w_capital_constrained: { title: 'सुरुवातीच्या खर्चासाठी मर्यादित भांडवली राखीव', badgeLabel: 'भांडवल मर्यादा' },
    swot_w_missing_pop: { title: 'अपुऱ्या स्थानिक लोकसंख्या नोंदी', badgeLabel: 'माहिती पूर्वअट' },
    swot_o_scheme_subsidy: { title: 'सरकारी योजनेअंतर्गत भांडवली अनुदानाचा लाभ', badgeLabel: 'शासकीय योजना' },
    swot_o_dairy_value_add: { title: 'मूल्यवर्धित दुग्ध उत्पादने (तूप, दही, पनीर)', badgeLabel: 'नफा विस्तार' },
    swot_o_retail_upi: { title: 'डिजिटल पेमेंट (UPI) व दैनंदिन किराणा विस्तार', badgeLabel: 'उत्पन्न वाढ' },
    swot_o_tailoring_bulk: { title: 'शालेय गणवेश व सणासुदीच्या कपड्यांचे मोठ्या प्रमाणावरील काम', badgeLabel: 'मोठे कंत्राट' },
    swot_o_poultry_direct: { title: 'स्थानिक धाबे, हॉटेल्स व आठवडे बाजारात थेट विक्री', badgeLabel: 'थेट विक्री' },
    swot_o_opportunity_spot: { title: 'उच्च मागणी असलेल्या व्यापारी केंद्राजवळ स्थान', badgeLabel: 'स्थानिक फायदा' }
  },
  te: {
    swot_s_dscr: { title: 'బలమైన రుణ తిరిగి చెల్లింపు సామర్థ్యం (DSCR)', badgeLabel: 'ఆర్థిక సాధ్యత' },
    swot_s_equity: { title: 'సరిపడా స్వంత మూలధన వాటా', badgeLabel: 'పెట్టుబడి సంసిద్ధత' },
    swot_s_location_access: { title: 'వ్యూహాత్మక మార్కెట్ & రవాణా సామీప్యత', badgeLabel: 'రవాణా సౌలభ్యం' },
    swot_s_dairy_coop: { title: 'పాడి సహకార సంఘానికి ప్రత్యక్ష రవాణా సౌకర్యం', badgeLabel: 'సరఫరా అనుసంధానం' },
    swot_s_retail_footfall: { title: 'అధిక జనాభా సాంద్రత & వినియోగదారుల రాకపోకలు', badgeLabel: 'గిరాకీ ప్రాంతం' },
    swot_s_tailoring_margin: { title: 'టైలరింగ్ వ్యాపారంలో అధిక లాభాల మార్జిన్', badgeLabel: 'యూనిట్ లాభం' },
    swot_s_poultry_land: { title: 'పౌల్ట్రీ ఫారమ్‌కు అనువైన భూమి & జీవ భద్రత', badgeLabel: 'మౌలిక వసతులు' },
    swot_w_feed_dependency: { title: 'దాణా మరియు మేత ఖర్చులపై అధిక ఆధారపడటం', badgeLabel: 'వ్యయ సున్నితత్వం' },
    swot_w_working_capital: { title: 'నిర్వహణ మూలధన చెల్లింపుల వ్యవధిలో జాప్యం', badgeLabel: 'ద్రవ్యత నిల్వ' },
    swot_w_retail_inventory: { title: 'దుకాణంలో సరుకుల నిల్వలో మూలధనం నిలిచిపోవడం', badgeLabel: 'నగదు ప్రవాహం' },
    swot_w_tailoring_capacity: { title: 'ఒకే దర్జీ పని సామర్థ్యం పరిమితి', badgeLabel: 'శ్రామిక పరిమితి' },
    swot_w_poultry_disease: { title: 'సీజనల్ వ్యాధులు & పౌల్ట్రీ మరణాల ముప్పు', badgeLabel: 'జీవ భద్రత ముప్పు' },
    swot_w_capital_constrained: { title: 'ప్రారంభ ఖర్చుల కొరకు పరిమిత స్వంత పెట్టుబడి', badgeLabel: 'మూలధన పరిమితి' },
    swot_w_missing_pop: { title: 'ధృవీకరించబడని స్థానిక జనాభా డేటా', badgeLabel: 'డేటా ముందస్తు షరతు' },
    swot_o_scheme_subsidy: { title: 'ప్రభుత్వ పథకం ద్వారా మూలధన సబ్సిడీ ప్రయోజనం', badgeLabel: 'ప్రభుత్వ ప్రోత్సాహకం' },
    swot_o_dairy_value_add: { title: 'పాల ఉప ఉత్పత్తులు (నెయ్యి, పెరుగు, పన్నీర్)', badgeLabel: 'లాభాల విస్తరణ' },
    swot_o_retail_upi: { title: 'డిజిటల్ చెల్లింపులు (UPI) & నిత్యావసర సరుకుల విస్తరణ', badgeLabel: 'ఆదాయ వృద్ధి' },
    swot_o_tailoring_bulk: { title: 'స్కూల్ యూనిఫారాలు & పండుగ దుస్తుల బల్క్ ఆర్డర్లు', badgeLabel: 'సంస్థాగత ఆర్డర్లు' },
    swot_o_poultry_direct: { title: 'స్థానిక ధాబాలు, హోటళ్లు & సంతలలో ప్రత్యక్ష విక్రయం', badgeLabel: 'ప్రత్యక్ష మార్కెట్' },
    swot_o_opportunity_spot: { title: 'అధిక గిరాకీ గల వాణిజ్య కేంద్రానికి సామీప్యత', badgeLabel: 'స్థాన ప్రయోజనం' }
  },
  kn: {
    swot_s_dscr: { title: 'ದೃಢ ಸಾಲ ಮರುಪಾವತಿ ಸಾಮರ್ಥ್ಯ (DSCR)', badgeLabel: 'ಹಣಕಾಸು ಕಾರ್ಯಸಾಧ್ಯತೆ' },
    swot_s_equity: { title: 'ಸಾಕಷ್ಟು ಸ್ವಂತ ಬಂಡವಾಳ ಹೂಡಿಕೆ', badgeLabel: 'ಬಂಡವಾಳ ಸನ್ನದ್ಧತೆ' },
    swot_s_location_access: { title: 'ಆಯಕಟ್ಟಿನ ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಸಾರಿಗೆ ಸಂಪರ್ಕ', badgeLabel: 'ಸಾರಿಗೆ ಲಭ್ಯತೆ' },
    swot_s_dairy_coop: { title: 'ಡೈರಿ ಸಹಕಾರಿ ಸಂಘಕ್ಕೆ ನೇರ ಸಂಪರ್ಕ', badgeLabel: 'ಪೂರೈಕೆ ಸರಪಳಿ' },
    swot_s_retail_footfall: { title: 'ಹೆಚ್ಚಿನ ಜನಸಾಂದ್ರತೆ ಮತ್ತು ಗ್ರಾಹಕರ ಭೇಟಿ', badgeLabel: 'ಬೇಡಿಕೆ ಪ್ರದೇಶ' },
    swot_s_tailoring_margin: { title: 'ಟೈಲರಿಂಗ್ ಕೆಲಸದಲ್ಲಿ ಅತ್ಯಧಿಕ ಲಾಭಾಂಶ', badgeLabel: 'ಉದ್ಯಮ ಲಾಭ' },
    swot_s_poultry_land: { title: 'ಕೋಳಿ ಸಾಕಣೆಗೆ ಸೂಕ್ತ ಗ್ರಾಮೀಣ ಜಮೀನು ಮತ್ತು ಜೈವಿಕ ಸುರಕ್ಷತೆ', badgeLabel: 'ಮೂಲಸೌಕರ್ಯ' },
    swot_w_feed_dependency: { title: 'ಪಶು ಆಹಾರ ಮತ್ತು ಮೇವಿನ ವೆಚ್ಚದ ಅವಲಂಬನೆ', badgeLabel: 'ವೆಚ್ಚ ಸೂಕ್ಷ್ಮತೆ' },
    swot_w_working_capital: { title: 'ದುಡಿಯುವ ಬಂಡವಾಳದ ಚಕ್ರದ ವಿಳಂಬ', badgeLabel: 'ಹಣಕಾಸು ಮೀಸಲು' },
    swot_w_retail_inventory: { title: 'ದಾಸ್ತಾನುಗಳಲ್ಲಿ ಬಂಡವಾಳ ಸಿಲುಕಿಕೊಳ್ಳುವ ಅಪಾಯ', badgeLabel: 'ಹಣಕಾಸು ಹರಿವು' },
    swot_w_tailoring_capacity: { title: 'ಒಬ್ಬರೇ ಕೆಲಸ ಮಾಡುವ ಸಾಮರ್ಥ್ಯದ ಮಿತಿ', badgeLabel: 'ಶ್ರಮ ಸಾಮರ್ಥ್ಯ' },
    swot_w_poultry_disease: { title: 'ಋತುಮಾನದ ರೋಗಗಳು ಮತ್ತು ಕೋಳಿ ಮರಣದ ಅಪಾಯ', badgeLabel: 'ಜೈವಿಕ ಸುರಕ್ಷತೆ' },
    swot_w_capital_constrained: { title: 'ಆರಂಭಿಕ ವೆಚ್ಚಗಳಿಗೆ ಸೀಮಿತ ಬಂಡವಾಳ ಮೀಸಲು', badgeLabel: 'ಬಂಡವಾಳ ಮಿತಿ' },
    swot_w_missing_pop: { title: 'ಪರಿಶೀಲಿಸದ ಸ್ಥಳೀಯ ಜನಸಂಖ್ಯೆ ಮಾಹಿತಿ', badgeLabel: 'ಮಾಹಿತಿ ಪೂರ್ವಷರತ್ತು' },
    swot_o_scheme_subsidy: { title: 'ಸರ್ಕಾರಿ ಯೋಜನೆಯಡಿ ಬಂಡವಾಳ ಸಬ್ಸಿಡಿ ಸೌಲಭ್ಯ', badgeLabel: 'ಸರ್ಕಾರಿ ಪ್ರೋತ್ಸಾಹ' },
    swot_o_dairy_value_add: { title: 'ಮೌಲ್ಯವರ್ಧಿತ ಡೈರಿ ಉತ್ಪನ್ನಗಳು (ತುಪ್ಪ, ಮೊಸರು, ಪನೀರ್)', badgeLabel: 'ಲಾಭ ವಿಸ್ತರಣೆ' },
    swot_o_retail_upi: { title: 'ಡಿಜಿಟಲ್ ಪಾವತಿಗಳು (UPI) ಮತ್ತು ದಿನಸಿ ಸಾಮಗ್ರಿ ವಿಸ್ತರಣೆ', badgeLabel: 'ಆದಾಯ ವೃದ್ಧಿ' },
    swot_o_tailoring_bulk: { title: 'ಶಾಲಾ ಸಮವಸ್ತ್ರಗಳು ಮತ್ತು ಹಬ್ಬದ ಉಡುಪುಗಳ ಬೃಹತ್ ಆರ್ಡರ್‌ಗಳು', badgeLabel: 'ಸಂಸ್ಥಾಗತ ಒಪ್ಪಂದ' },
    swot_o_poultry_direct: { title: 'ಸ್ಥಳೀಯ ಧಾಬಾಗಳು, ಹೋಟೆಲ್‌ಗಳು ಮತ್ತು ಸಂತೆಗಳಲ್ಲಿ ನೇರ ಮಾರಾಟ', badgeLabel: 'ನೇರ ಮಾರುಕಟ್ಟೆ' },
    swot_o_opportunity_spot: { title: 'ಹೆಚ್ಚಿನ ಬೇಡಿಕೆಯ ವಾಣಿಜ್ಯ ಕೇಂದ್ರದ ಸಾಮೀಪ್ಯ', badgeLabel: 'ಸ್ಥಳೀಯ ಅನುಕೂಲ' }
  }
};

const SOURCE_TYPE_LABELS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    FINANCE: 'Financial Engine',
    LOCATION: 'Location Intelligence',
    BUSINESS: 'Business Operations Model',
    SCHEME: 'Government Scheme Rules',
    MARKET: 'Market Intelligence Agent',
    RISK: 'Multi-Agent Risk Engine',
    EVIDENCE: 'Primary Data Verification'
  },
  hi: {
    FINANCE: 'Financial Engine (वित्तीय इंजन)',
    LOCATION: 'Location Intelligence (स्थान इंटेलिजेंस)',
    BUSINESS: 'Business Model (व्यावसायिक मॉडल)',
    SCHEME: 'Government Scheme Rules (सरकारी योजना नियम)',
    MARKET: 'Market Intelligence Agent (बाज़ार इंटेलिजेंस)',
    RISK: 'Multi-Agent Risk Engine (जोखिम इंजन)',
    EVIDENCE: 'Primary Data Verification (प्राथमिक डेटा सत्यापन)'
  },
  mr: {
    FINANCE: 'Financial Engine (आर्थिक इंजिन)',
    LOCATION: 'Location Intelligence (स्थान विश्लेषण)',
    BUSINESS: 'Business Model (व्यवसाय मॉडेल)',
    SCHEME: 'Government Scheme Rules (शासकीय योजना नियम)',
    MARKET: 'Market Intelligence Agent (बाजार विश्लेषण)',
    RISK: 'Multi-Agent Risk Engine (जोखीम इंजिन)',
    EVIDENCE: 'Primary Data Verification (प्राथमिक माहिती)'
  },
  te: {
    FINANCE: 'Financial Engine (ఆర్థిక ఇంజిన్)',
    LOCATION: 'Location Intelligence (స్థాన సమాచారం)',
    BUSINESS: 'Business Operations (వ్యాపార నిర్వహణ)',
    SCHEME: 'Government Scheme Rules (ప్రభుత్వ పథకాల నియమాలు)',
    MARKET: 'Market Intelligence Agent (మార్కెట్ సమాచారం)',
    RISK: 'Multi-Agent Risk Engine (రిస్క్ ఇంజిన్)',
    EVIDENCE: 'Primary Data Verification (డేటా ధృవీకరణ)'
  },
  kn: {
    FINANCE: 'Financial Engine (ಹಣಕಾಸು ಎಂಜಿನ್)',
    LOCATION: 'Location Intelligence (ಸ್ಥಳ ಮಾಹಿತಿ)',
    BUSINESS: 'Business Operations (ವ್ಯವಹಾರ ಕಾರ್ಯಾಚರಣೆ)',
    SCHEME: 'Government Scheme Rules (ಸರ್ಕಾರಿ ಯೋಜನೆ ನಿಯಮಗಳು)',
    MARKET: 'Market Intelligence Agent (ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ)',
    RISK: 'Multi-Agent Risk Engine (ಅಪಾಯ ವಿಶ್ಲೇಷಣೆ)',
    EVIDENCE: 'Primary Data Verification (ಮಾಹಿತಿ ಪರಿಶೀಲನೆ)'
  }
};

export const SwotAnalysisSection: React.FC<SwotAnalysisSectionProps> = ({
  swotAnalysis
}) => {
  const { language } = useLanguage();

  if (!swotAnalysis) return null;

  const { strengths, weaknesses, opportunities, threats, dataQuality } = swotAnalysis;

  const labels = {
    en: {
      sectionTitle: 'Evidence-Based SWOT Analysis',
      sectionSubtitle: 'Strategic synthesis derived deterministically from validated business, market, location, and financial evidence.',
      strengths: 'Strengths',
      weaknesses: 'Weaknesses',
      opportunities: 'Opportunities',
      threats: 'Threats',
      sourceLabel: 'Source:',
      factorsCount: 'Factors',
      deterministicBadge: 'Deterministic Evidence',
      dataQualityLabel: 'Data Quality:'
    },
    hi: {
      sectionTitle: 'प्रमाण-आधारित स्वाट (SWOT) विश्लेषण',
      sectionSubtitle: 'सत्यापित व्यवसाय, बाज़ार, स्थान और वित्तीय साक्ष्यों से तैयार रणनीतिक विश्लेषण।',
      strengths: 'शक्तियाँ (Strengths)',
      weaknesses: 'कमजोरियाँ (Weaknesses)',
      opportunities: 'अवसर (Opportunities)',
      threats: 'चुनौतियां / खतरे (Threats)',
      sourceLabel: 'स्रोत:',
      factorsCount: 'कारक',
      deterministicBadge: 'सत्यापित साक्ष्य',
      dataQualityLabel: 'डेटा गुणवत्ता:'
    },
    mr: {
      sectionTitle: 'पुरावा-आधारित स्वाट (SWOT) विश्लेषण',
      sectionSubtitle: 'सत्यापित व्यवसाय, बाजार, स्थान आणि आर्थिक पुराव्यांवर आधारित धोरणात्मक विश्लेषण.',
      strengths: 'सामर्थ्य (Strengths)',
      weaknesses: 'उणिवा (Weaknesses)',
      opportunities: 'संधी (Opportunities)',
      threats: 'धोके / आव्हाने (Threats)',
      sourceLabel: 'स्रोत:',
      factorsCount: 'घटक',
      deterministicBadge: 'प्रमाणित पुरावा',
      dataQualityLabel: 'माहिती दर्जा:'
    },
    te: {
      sectionTitle: 'సాక్ష్యాధారిత SWOT విశ్లేషణ',
      sectionSubtitle: 'ధృవీకరించబడిన వ్యాపార, మార్కెట్, స్థాన మరియు ఆర్థిక ఆధారాల నుండి రూపొందించిన వ్యూహాత్మక విశ్లేషణ.',
      strengths: 'బలాలు (Strengths)',
      weaknesses: 'బలహీనతలు (Weaknesses)',
      opportunities: 'అవకాశాలు (Opportunities)',
      threats: 'ముప్పులు / సవాళ్లు (Threats)',
      sourceLabel: 'మూలం:',
      factorsCount: 'కారకాలు',
      deterministicBadge: 'ధృవీకరించిన సాక్ష్యం',
      dataQualityLabel: 'డేటా నాణ్యత:'
    },
    kn: {
      sectionTitle: 'ಸಾಕ್ಷ್ಯಾಧಾರಿತ SWOT ವಿಶ್ಲೇಷಣೆ',
      sectionSubtitle: 'ಪರಿಶೀಲಿಸಿದ ಉದ್ಯಮ, ಮಾರುಕಟ್ಟೆ, ಸ್ಥಳ ಮತ್ತು ಹಣಕಾಸು ಪುರಾವೆಗಳಿಂದ ಪಡೆದ ಕಾರ್ಯತಂತ್ರದ ವಿಶ್ಲೇಷಣೆ.',
      strengths: 'ಸಾಮರ್ಥ್ಯಗಳು (Strengths)',
      weaknesses: 'ದೌರ್ಬಲ್ಯಗಳು (Weaknesses)',
      opportunities: 'ಅವಕಾಶಗಳು (Opportunities)',
      threats: 'ಬೆದರಿಕೆಗಳು (Threats)',
      sourceLabel: 'ಮೂಲ:',
      factorsCount: 'ಅಂಶಗಳು',
      deterministicBadge: 'ಪರಿಶೀಲಿಸಿದ ಪುರಾವೆ',
      dataQualityLabel: 'ಮಾಹಿತಿ ಗುಣಮಟ್ಟ:'
    }
  }[language] || {
    sectionTitle: 'Evidence-Based SWOT Analysis',
    sectionSubtitle: 'Strategic synthesis derived deterministically from validated business, market, location, and financial evidence.',
    strengths: 'Strengths',
    weaknesses: 'Weaknesses',
    opportunities: 'Opportunities',
    threats: 'Threats',
    sourceLabel: 'Source:',
    factorsCount: 'Factors',
    deterministicBadge: 'Deterministic Evidence',
    dataQualityLabel: 'Data Quality:'
  };

  const getLocalizedItem = (item: SwotItem) => {
    const locMap = SWOT_LOCALIZED_FACTORS[language] || SWOT_LOCALIZED_FACTORS.en;
    const factorLoc = locMap[item.id];
    const localizedSource = (SOURCE_TYPE_LABELS[language] || SOURCE_TYPE_LABELS.en)[item.sourceType] || item.sourceType;

    return {
      title: factorLoc?.title || item.title,
      badgeLabel: factorLoc?.badgeLabel || item.badgeLabel,
      sourceTypeLabel: localizedSource,
      explanation: item.explanation
    };
  };

  return (
    <div id="swot" className="scroll-mt-32 sm:scroll-mt-36 space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
              {labels.sectionTitle}
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {labels.deterministicBadge}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {labels.sectionSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">{labels.dataQualityLabel}</span>
          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-slate-100 text-slate-800 border border-slate-200">
            {dataQuality}
          </span>
        </div>
      </div>

      {/* 2x2 SWOT Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. STRENGTHS (Top Left - Emerald) */}
        <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4.5 space-y-3 shadow-xs transition-colors">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                S
              </div>
              <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                {labels.strengths}
              </h3>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {strengths.length} {labels.factorsCount}
            </span>
          </div>

          <div className="space-y-2.5">
            {strengths.map((item) => {
              const loc = getLocalizedItem(item);
              return (
                <div
                  key={item.id}
                  className="bg-white/95 border border-emerald-100 rounded-xl p-3 space-y-1.5 shadow-2xs hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{loc.title}</h4>
                    {loc.badgeLabel && (
                      <span className="shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {loc.badgeLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{loc.explanation}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-400 font-medium">
                      {labels.sourceLabel} <strong className="text-slate-700">{loc.sourceTypeLabel}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. WEAKNESSES (Top Right - Amber) */}
        <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4.5 space-y-3 shadow-xs transition-colors">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                W
              </div>
              <h3 className="text-sm font-black text-amber-950 uppercase tracking-wide">
                {labels.weaknesses}
              </h3>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              {weaknesses.length} {labels.factorsCount}
            </span>
          </div>

          <div className="space-y-2.5">
            {weaknesses.map((item) => {
              const loc = getLocalizedItem(item);
              return (
                <div
                  key={item.id}
                  className="bg-white/95 border border-amber-100 rounded-xl p-3 space-y-1.5 shadow-2xs hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{loc.title}</h4>
                    {loc.badgeLabel && (
                      <span className="shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        {loc.badgeLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{loc.explanation}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-400 font-medium">
                      {labels.sourceLabel} <strong className="text-slate-700">{loc.sourceTypeLabel}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. OPPORTUNITIES (Bottom Left - Indigo/Blue) */}
        <div className="bg-blue-50/40 border border-blue-200/80 rounded-2xl p-4.5 space-y-3 shadow-xs transition-colors">
          <div className="flex items-center justify-between border-b border-blue-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                O
              </div>
              <h3 className="text-sm font-black text-blue-950 uppercase tracking-wide">
                {labels.opportunities}
              </h3>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-blue-100 text-blue-800 border border-blue-300">
              {opportunities.length} {labels.factorsCount}
            </span>
          </div>

          <div className="space-y-2.5">
            {opportunities.map((item) => {
              const loc = getLocalizedItem(item);
              return (
                <div
                  key={item.id}
                  className="bg-white/95 border border-blue-100 rounded-xl p-3 space-y-1.5 shadow-2xs hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{loc.title}</h4>
                    {loc.badgeLabel && (
                      <span className="shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                        {loc.badgeLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{loc.explanation}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-400 font-medium">
                      {labels.sourceLabel} <strong className="text-slate-700">{loc.sourceTypeLabel}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. THREATS (Bottom Right - Rose/Red) */}
        <div className="bg-rose-50/40 border border-rose-200/80 rounded-2xl p-4.5 space-y-3 shadow-xs transition-colors">
          <div className="flex items-center justify-between border-b border-rose-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                T
              </div>
              <h3 className="text-sm font-black text-rose-950 uppercase tracking-wide">
                {labels.threats}
              </h3>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-100 text-rose-800 border border-rose-300">
              {threats.length} {labels.factorsCount}
            </span>
          </div>

          <div className="space-y-2.5">
            {threats.map((item) => {
              const loc = getLocalizedItem(item);
              return (
                <div
                  key={item.id}
                  className="bg-white/95 border border-rose-100 rounded-xl p-3 space-y-1.5 shadow-2xs hover:border-rose-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{loc.title}</h4>
                    <span className="shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                      {item.badgeLabel || 'High Risk'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{loc.explanation}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-400 font-medium">
                      {labels.sourceLabel} <strong className="text-slate-700">{loc.sourceTypeLabel}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
