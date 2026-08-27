/**
 * UDYORA Advisor Query Router
 * Intelligently routes natural language queries into deterministic application services.
 * Supports multilingual intent detection across English, Hindi, Telugu, Marathi, and Kannada.
 */

export type AdvisorIntent =
  | 'BUSINESS'
  | 'MARKET'
  | 'FINANCE'
  | 'SCHEME'
  | 'RISK'
  | 'EVIDENCE'
  | 'LOCATION'
  | 'REPORT'
  | 'COMPARISON'
  | 'ACTION'
  | 'GENERAL';

export interface IntentRouteResult {
  intent: AdvisorIntent;
  confidence: number;
  serviceCalled: string;
  entities: {
    topic?: string;
    subTopic?: string;
    actionType?: 'TRIGGER_ANALYSIS' | 'RESET_ANALYSIS' | 'SHOW_PLAN';
    schemeName?: string;
  };
}

export function routeAdvisorQuery(
  rawQuery: string,
  previousTopic?: string
): IntentRouteResult {
  const query = rawQuery.trim().toLowerCase();

  // 1. ACTION INTENT (Start / Run / Reset / Analyze)
  if (
    query.includes('start analysis') ||
    query.includes('run analysis') ||
    query.includes('analyze my business') ||
    query.includes('analyze business') ||
    query.includes('begin assessment') ||
    query.includes('विश्लेषण शुरू') ||
    query.includes('విశ్లేషణ ప్రారంభించు') ||
    query.includes('విశ్లేషణ మొదలుపెట్టు') ||
    query.includes('विश्लेषण सुरू करा') ||
    query.includes('ವಿಶ್ಲೇಷಣೆ ಪ್ರಾರಂಭಿಸಿ')
  ) {
    return {
      intent: 'ACTION',
      confidence: 0.98,
      serviceCalled: 'Multi-Agent Orchestrator Pipeline',
      entities: { actionType: 'TRIGGER_ANALYSIS' }
    };
  }

  if (
    query.includes('reset analysis') ||
    query.includes('start new') ||
    query.includes('start a new analysis') ||
    query.includes('clear form') ||
    query.includes('नया विश्लेषण') ||
    query.includes('కొత్త విశ్లేషణ') ||
    query.includes('नवीन विश्लेषण')
  ) {
    return {
      intent: 'ACTION',
      confidence: 0.96,
      serviceCalled: 'Application State Controller',
      entities: { actionType: 'RESET_ANALYSIS' }
    };
  }

  // 2. COMPARISON INTENT (Compare domains, which business is best, alternative options, ranked first)
  if (
    query.includes('which business is best') ||
    query.includes('best business for me') ||
    query.includes('best business') ||
    query.includes('best-fit') ||
    query.includes('other business') ||
    query.includes('other businesses') ||
    query.includes('other options') ||
    query.includes('alternative') ||
    query.includes('alternatives') ||
    query.includes('compare') ||
    query.includes('comparison') ||
    query.includes('ranked first') ||
    query.includes('ranked #1') ||
    query.includes('ranked 1') ||
    query.includes('why is dairy ranked') ||
    query.includes('which business fits') ||
    query.includes('suitability score') ||
    query.includes('कौन सा व्यवसाय सबसे अच्छा') ||
    query.includes('दूसरे विकल्प') ||
    query.includes('तुलना') ||
    query.includes('ఏ వ్యాపారం బెస్ట్') ||
    query.includes('ఇతర వ్యాపారాలు') ||
    query.includes('పోలిక') ||
    query.includes('कोणता व्यवसाय चांगला') ||
    query.includes('इतर पर्याय') ||
    query.includes('ಯಾವ ಉದ್ಯಮ ಸೂಕ್ತ') ||
    query.includes('ಇತರ ಆಯ್ಕೆಗಳು')
  ) {
    return {
      intent: 'COMPARISON',
      confidence: 0.97,
      serviceCalled: 'Domain Comparison Engine (domainComparisonService.ts)',
      entities: { topic: 'business_suitability_ranking' }
    };
  }

  // 3. EVIDENCE & SOURCE INTENT (Where did data come from, Census 2011, APMC, reliability)
  if (
    query.includes('evidence') ||
    query.includes('source') ||
    query.includes('sources') ||
    query.includes('data come from') ||
    query.includes('where did') ||
    query.includes('where do you get') ||
    query.includes('where did you get') ||
    query.includes('verified') ||
    query.includes('census') ||
    query.includes('reliable') ||
    query.includes('accuracy') ||
    query.includes('provenance') ||
    query.includes('डेटा कहाँ से') ||
    query.includes('स्रोत') ||
    query.includes('सत्यापित') ||
    query.includes('డేటా ఎక్కడి') ||
    query.includes('ఆధారం') ||
    query.includes('మూలం') ||
    query.includes('పురಾವె') ||
    query.includes('ಮಾಹಿತಿ ಮೂಲ')
  ) {
    return {
      intent: 'EVIDENCE',
      confidence: 0.96,
      serviceCalled: 'Evidence Registry & Provenance Layer (evidenceAgent.ts)',
      entities: { topic: 'data_provenance' }
    };
  }

  // 4. FINANCE INTENT (EMI, Loan, CapEx, OpEx, Profit, Working Capital, Interest, Equity, Lakh)
  if (
    query.includes('emi') ||
    query.includes('loan') ||
    query.includes('borrow') ||
    query.includes('monthly payment') ||
    query.includes('interest') ||
    query.includes('capex') ||
    query.includes('opex') ||
    query.includes('capital') ||
    query.includes('project cost') ||
    query.includes('cost to start') ||
    query.includes('start with') ||
    query.includes('lakh') ||
    query.includes('₹') ||
    query.includes('rupees') ||
    query.includes('investment') ||
    query.includes('invest') ||
    query.includes('profit') ||
    query.includes('margin') ||
    query.includes('dscr') ||
    query.includes('roi') ||
    query.includes('किस्त') ||
    query.includes('लोन') ||
    query.includes('ऋण') ||
    query.includes('लागत') ||
    query.includes('लाख') ||
    query.includes('पूंजी') ||
    query.includes('मुनाफा') ||
    query.includes('వడ్డీ') ||
    query.includes('రుణం') ||
    query.includes('ఖర్చు') ||
    query.includes('మూలధనం') ||
    query.includes('లక్ష') ||
    query.includes('లాభం') ||
    query.includes('హఫ్తా') ||
    query.includes('कर्ज') ||
    query.includes('खर्च') ||
    query.includes('भांडवल') ||
    query.includes('नफा') ||
    query.includes('ಬಡ್ಡಿ') ||
    query.includes('ಸಾಲ') ||
    query.includes('ವೆಚ್ಚ') ||
    query.includes('ಬಂಡವಾಳ') ||
    query.includes('ಲಾಭ')
  ) {
    return {
      intent: 'FINANCE',
      confidence: 0.96,
      serviceCalled: 'Deterministic Financial Calculator (financialCalculator.ts)',
      entities: {
        topic: query.includes('emi') || query.includes('किस्त') || query.includes('హఫ్తా') ? 'emi' : 'loan_planning'
      }
    };
  }

  // 5. SCHEME INTENT (PMEGP, Mudra, Subsidy, Eligibility, Documents, Schemes)
  if (
    query.includes('scheme') ||
    query.includes('schemes') ||
    query.includes('subsidy') ||
    query.includes('pmegp') ||
    query.includes('mudra') ||
    query.includes('nabard') ||
    query.includes('ahidf') ||
    query.includes('eligible') ||
    query.includes('eligibility') ||
    query.includes('document') ||
    query.includes('documents') ||
    query.includes('paperwork') ||
    query.includes('government grant') ||
    query.includes('योजना') ||
    query.includes('सब्सिडी') ||
    query.includes('दस्तावेज') ||
    query.includes('पात्रता') ||
    query.includes('పథకం') ||
    query.includes('పథకాలు') ||
    query.includes('సబ్సిడీ') ||
    query.includes('పత్రాలు') ||
    query.includes('అర్హత') ||
    query.includes('कागदपत्रे') ||
    query.includes('अनुदान') ||
    query.includes('ಯೋಜನೆ') ||
    query.includes('ದಾಖಲೆಗಳು') ||
    query.includes('ಅರ್ಹತೆ')
  ) {
    return {
      intent: 'SCHEME',
      confidence: 0.95,
      serviceCalled: 'Scheme Rule Engine (schemeRules.ts)',
      entities: {
        schemeName: query.includes('pmegp') ? 'PMEGP' : query.includes('mudra') ? 'MUDRA' : 'ALL_MATCHES'
      }
    };
  }

  // 6. RISK INTENT (Risks, what can go wrong, mitigation, severity, challenges)
  if (
    query.includes('risk') ||
    query.includes('risks') ||
    query.includes('wrong') ||
    query.includes('danger') ||
    query.includes('threat') ||
    query.includes('mitigation') ||
    query.includes('reduce risk') ||
    query.includes('safeguard') ||
    query.includes('loss') ||
    query.includes('जोखिम') ||
    query.includes('खतरे') ||
    query.includes('नुकसान') ||
    query.includes('बचाव') ||
    query.includes('రిస్క్') ||
    query.includes('రిస్కులు') ||
    query.includes('ప్రమాదం') ||
    query.includes('ప్రమాదాలు') ||
    query.includes('నష్టం') ||
    query.includes('ధోका') ||
    query.includes('धोके') ||
    query.includes('ಅಪಾಯ') ||
    query.includes('ಅಪಾಯಗಳು') ||
    query.includes('ನಷ್ಟ')
  ) {
    return {
      intent: 'RISK',
      confidence: 0.94,
      serviceCalled: 'Risk Analysis Agent (riskAgent.ts)',
      entities: { topic: 'risk_mitigation' }
    };
  }

  // 7. LOCATION & MAP INTENT (Village, Coordinates, Near me, Nearby Banks, Market Distance, Map Radius)
  if (
    query.includes('location') ||
    query.includes('show me my location') ||
    query.includes('my location') ||
    query.includes('near me') ||
    query.includes('nearby') ||
    query.includes('what is near me') ||
    query.includes('banks nearby') ||
    query.includes('how far') ||
    query.includes('nearest market') ||
    query.includes('nearest bank') ||
    query.includes('observed nearby') ||
    query.includes('10 km') ||
    query.includes('5 km') ||
    query.includes('map') ||
    query.includes('catchment') ||
    query.includes('coordinates') ||
    query.includes('village') ||
    query.includes('district') ||
    query.includes('taluka') ||
    query.includes('mandal') ||
    query.includes('tehsil') ||
    query.includes('pincode') ||
    query.includes('lgd') ||
    query.includes('गाव') ||
    query.includes('स्थान') ||
    query.includes('नजदीक') ||
    query.includes('पास') ||
    query.includes('గ్రామం') ||
    query.includes('జిల్లా') ||
    query.includes('దగ్గర') ||
    query.includes('మండలం') ||
    query.includes('మ్యాప్') ||
    query.includes('బ్యాంకులు') ||
    query.includes('నక్షా') ||
    query.includes('ನನ್ನ ಸ್ಥಳ') ||
    query.includes('ಹತ್ತಿರ')
  ) {
    return {
      intent: 'LOCATION',
      confidence: 0.95,
      serviceCalled: 'Map Intelligence & LGD Spatial Service (mapService.ts)',
      entities: { topic: 'map_and_locality' }
    };
  }

  // 8. REPORT / FEASIBILITY SUMMARY INTENT
  if (
    query.includes('score') ||
    query.includes('feasibility') ||
    query.includes('report') ||
    query.includes('summarize') ||
    query.includes('summary') ||
    query.includes('verdict') ||
    query.includes('is it feasible') ||
    query.includes('should i do this') ||
    query.includes('82') ||
    query.includes('रिपोर्ट') ||
    query.includes('स्कोर') ||
    query.includes('విశ్వసనీయత') ||
    query.includes('సారాంశం') ||
    query.includes('రిపోర్ట్') ||
    query.includes('వరದಿ')
  ) {
    return {
      intent: 'REPORT',
      confidence: 0.93,
      serviceCalled: 'Final Feasibility Aggregator (finalAdvisorAgent.ts)',
      entities: { topic: 'feasibility_summary' }
    };
  }

  // 9. MARKET INTENT (Demand, competition, buyers, customer base, mandi rates)
  if (
    query.includes('market') ||
    query.includes('demand') ||
    query.includes('competition') ||
    query.includes('competitor') ||
    query.includes('customer') ||
    query.includes('buyers') ||
    query.includes('selling') ||
    query.includes('mandi') ||
    query.includes('cooperative') ||
    query.includes('बाजार') ||
    query.includes('मांग') ||
    query.includes('ग्राहक') ||
    query.includes('प्रतिस्पर्धा') ||
    query.includes('మార్కెట్') ||
    query.includes('డిమాండ్') ||
    query.includes('పోటీ') ||
    query.includes('గ్రాహకులు') ||
    query.includes('ಮಾರುಕಟ್ಟೆ') ||
    query.includes('ಬೇಡಿಕೆ')
  ) {
    return {
      intent: 'MARKET',
      confidence: 0.92,
      serviceCalled: 'Market Intelligence Agent (marketAgent.ts)',
      entities: { topic: 'market_dynamics' }
    };
  }

  // 10. BUSINESS SPECIFIC INTENT (Inputs, expansions, general viability)
  if (
    query.includes('business') ||
    query.includes('dairy') ||
    query.includes('tailoring') ||
    query.includes('retail') ||
    query.includes('poultry') ||
    query.includes('cow') ||
    query.includes('machine') ||
    query.includes('equipment') ||
    query.includes('व्यवसाय') ||
    query.includes('व्यापार') ||
    query.includes('వ్యాపారం') ||
    query.includes('ಉದ್ಯಮ')
  ) {
    return {
      intent: 'BUSINESS',
      confidence: 0.90,
      serviceCalled: 'Business Analysis Agent (businessAgent.ts)',
      entities: { topic: 'business_operations' }
    };
  }

  // 11. CONVERSATIONAL PRONOUN RESOLUTION (Contextual Memory fallback)
  if (previousTopic && (query.includes('it') || query.includes('why') || query.includes('how') || query.includes('that') || query.includes('इसको') || query.includes('ఇది') || query.includes('का'))) {
    if (previousTopic === 'finance') {
      return {
        intent: 'FINANCE',
        confidence: 0.85,
        serviceCalled: 'Deterministic Financial Calculator (Contextual Followup)',
        entities: { topic: 'emi_explanation' }
      };
    }
    if (previousTopic === 'scheme') {
      return {
        intent: 'SCHEME',
        confidence: 0.85,
        serviceCalled: 'Scheme Rule Engine (Contextual Followup)',
        entities: { topic: 'scheme_details' }
      };
    }
    if (previousTopic === 'risk') {
      return {
        intent: 'RISK',
        confidence: 0.85,
        serviceCalled: 'Risk Analysis Agent (Contextual Followup)',
        entities: { topic: 'risk_mitigation' }
      };
    }
  }

  // 12. GENERAL CONVERSATION INTENT
  return {
    intent: 'GENERAL',
    confidence: 0.70,
    serviceCalled: 'Contextual Advisor Assistant',
    entities: {}
  };
}
