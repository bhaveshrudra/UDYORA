/**
 * UDYORA Advisor Query Router & Intent Classification Layer
 * Intelligently classifies natural language queries into deterministic application services
 * or polite out-of-scope handling.
 * Supports multilingual intent detection across English, Hindi, Telugu, Marathi, and Kannada.
 */

export type AdvisorIntent =
  | 'GREETING'
  | 'BUSINESS_FEASIBILITY'
  | 'MARKET_INTELLIGENCE'
  | 'LOCATION_ANALYSIS'
  | 'FINANCIAL_PLANNING'
  | 'EMI'
  | 'SCHEME_GUIDANCE'
  | 'RISK_ANALYSIS'
  | 'EVIDENCE'
  | 'REPORT_EXPLANATION'
  | 'NEXT_STEPS'
  | 'UDYORA_HELP'
  | 'MULTILINGUAL_HELP'
  | 'OUT_OF_SCOPE'
  | 'UNCLEAR'
  // Backward compatibility aliases
  | 'FINANCE'
  | 'SCHEME'
  | 'RISK'
  | 'LOCATION'
  | 'MARKET'
  | 'REPORT'
  | 'BUSINESS'
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
    targetAmount?: number;
    businessCategory?: string;
  };
}

/**
 * Checks if text is nonsensical gibberish or random keyboard mashing.
 */
function isGibberish(text: string): boolean {
  const clean = text.toLowerCase().trim();
  if (!clean || clean.length < 2) return true;

  // Single or multiple repeating punctuation only: ???, !!!, ..., ###
  if (/^[^\w\s\u0900-\u0D7F]+$/.test(clean)) return true;

  // Only Latin consonants repeated with no vowels: e.g. "asdfghjkl", "qwertyuiop", "zxcvbnm", "lkjhgfdsa"
  const latinOnly = /^[a-z]+$/.test(clean);
  if (latinOnly && clean.length >= 6) {
    const vowelCount = (clean.match(/[aeiou]/g) || []).length;
    if (vowelCount === 0) return true;
    if (/asdf|dfgh|ghjk|hjkl|qwerty|werty|ertyu|rtyui|tyuio|yuio|zxcvb|xcvbn|cvbnm/.test(clean)) {
      return true;
    }
  }

  return false;
}

/**
 * Detects prompt injections or jailbreak attempts.
 */
function isPromptInjection(text: string): boolean {
  const clean = text.toLowerCase().trim();
  return (
    clean.includes('ignore previous instructions') ||
    clean.includes('ignore all previous instructions') ||
    clean.includes('system prompt') ||
    clean.includes('jailbreak') ||
    clean.includes('act as a general') ||
    clean.includes('bypass rules') ||
    clean.includes('override instructions')
  );
}

/**
 * Detects explicitly out-of-scope non-business queries.
 */
function isOutOfScope(raw: string): boolean {
  const clean = raw.toLowerCase().replace(/[^\w\s\u0900-\u0D7F]/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. Celebrities, Athletes & Pop Culture
  if (
    clean.includes('cristiano ronaldo') ||
    clean.includes('ronaldo') ||
    clean.includes('messi') ||
    clean.includes('virat kohli') ||
    clean.includes('virat') ||
    clean.includes('kohli') ||
    clean.includes('sachin tendulkar') ||
    clean.includes('dhoni') ||
    clean.includes('rohit sharma') ||
    clean.includes('shah rukh khan') ||
    clean.includes('salman khan') ||
    clean.includes('celebrity') ||
    clean.includes('actor') ||
    clean.includes('actress') ||
    clean.includes('movie') ||
    clean.includes('bollywood') ||
    clean.includes('hollywood') ||
    clean.includes('cinema') ||
    clean.includes('song lyrics')
  ) {
    return true;
  }

  // 2. Creative Writing, Jokes & Entertainment
  if (
    clean.includes('tell me a joke') ||
    clean.includes('tell a joke') ||
    clean.includes('say a joke') ||
    clean.includes('make me laugh') ||
    clean.includes('write me a poem') ||
    clean.includes('write a poem') ||
    clean.includes('write a story') ||
    clean.includes('joke') ||
    clean.includes('poem') ||
    clean.includes('चुटकुल') ||
    clean.includes('जोक') ||
    clean.includes('कवि') ||
    clean.includes('కవిత') ||
    clean.includes('జోక్') ||
    clean.includes('హాస్య') ||
    clean.includes('विनोद') ||
    clean.includes('कविता') ||
    clean.includes('ಹರಟೆ') ||
    clean.includes('ಕವನ') ||
    clean.includes('ಹಾಸ್ಯ')
  ) {
    return true;
  }

  // 3. General Trivia & Non-Business Subjects
  if (
    clean.includes('capital of france') ||
    clean.includes('capital of germany') ||
    clean.includes('who is president') ||
    clean.includes('who is prime minister') ||
    clean.includes('solar system') ||
    clean.includes('speed of light')
  ) {
    return true;
  }

  // 4. Software Programming & Code Generation
  if (
    clean.includes('write java code') ||
    clean.includes('write python code') ||
    clean.includes('write c++ code') ||
    clean.includes('write javascript') ||
    clean.includes('write react code') ||
    clean.includes('write html') ||
    clean.includes('write sql') ||
    clean.includes('debug my code') ||
    clean.includes('java code') ||
    clean.includes('python code') ||
    clean.includes('write code') ||
    clean.includes('coding in')
  ) {
    return true;
  }

  // 5. Academic / Homework
  if (
    clean.includes('college homework') ||
    clean.includes('do my homework') ||
    clean.includes('solve this math problem') ||
    clean.includes('calculus') ||
    clean.includes('algebra problem') ||
    clean.includes('physics question') ||
    clean.includes('chemistry equation')
  ) {
    return true;
  }

  // 6. Sports Matches & Live Scores
  if (
    clean.includes('cricket match') ||
    clean.includes('football match') ||
    clean.includes('who won the match') ||
    clean.includes('live score') ||
    clean.includes('ipl score') ||
    clean.includes('cricket score') ||
    clean.includes('what is cricket') ||
    clean.includes('cricket')
  ) {
    return true;
  }

  // 7. Relationships & Astrology
  if (
    clean.includes('relationship advice') ||
    clean.includes('horoscope') ||
    clean.includes('astrology') ||
    clean.includes('zodiac sign')
  ) {
    return true;
  }

  // 8. Crypto & Speculation
  if (
    clean.includes('bitcoin') ||
    clean.includes('ethereum') ||
    clean.includes('crypto price') ||
    clean.includes('forex trading') ||
    clean.includes('nft')
  ) {
    return true;
  }

  return false;
}

/**
 * Classifies a user query into structured AdvisorIntent with confidence score and entities.
 */
export function classifyIntent(
  rawQuery: string,
  previousTopic?: string
): IntentRouteResult {
  const query = rawQuery.trim().toLowerCase();

  // 1. UNRECOGNIZABLE / GIBBERISH INPUT
  if (isGibberish(query)) {
    return {
      intent: 'UNCLEAR',
      confidence: 0.95,
      serviceCalled: 'Intent Clarification Protocol',
      entities: { topic: 'clarification_needed' }
    };
  }

  // 2. PROMPT INJECTION / MALICIOUS OVERRIDE DEFENSE
  if (isPromptInjection(query)) {
    return {
      intent: 'OUT_OF_SCOPE',
      confidence: 0.99,
      serviceCalled: 'Safety Guardrail & Scope Controller',
      entities: { topic: 'prompt_injection_defense' }
    };
  }

  // 3. EXPLICIT OUT-OF-SCOPE GENERAL QUERIES
  if (isOutOfScope(query)) {
    return {
      intent: 'OUT_OF_SCOPE',
      confidence: 0.97,
      serviceCalled: 'Out-Of-Scope Boundary Handler',
      entities: { topic: 'general_knowledge_fallback' }
    };
  }

  // 4. NATURAL GREETINGS
  if (
    query === 'hi' ||
    query === 'hello' ||
    query === 'hey' ||
    query === 'namaste' ||
    query === 'good morning' ||
    query === 'good afternoon' ||
    query === 'good evening' ||
    query === 'नमस्ते' ||
    query === 'नमस्कार' ||
    query === 'నమస్కారం' ||
    query === 'నమస్తే' ||
    query === 'ನಮಸ್ಕಾರ'
  ) {
    return {
      intent: 'GREETING',
      confidence: 0.99,
      serviceCalled: 'Conversational Greeting Handler',
      entities: { topic: 'greeting' }
    };
  }

  // 5. NEXT STEPS / ACTIONABLE RECOMMENDATIONS
  if (
    query.includes('what should i do next') ||
    query.includes('what to do next') ||
    query.includes('next steps') ||
    query.includes('how to proceed') ||
    query.includes('what to do now') ||
    query.includes('अगला कदम') ||
    query.includes('आगे क्या करें') ||
    query.includes('తదుపరి చర్యలు') ||
    query.includes('తర్వాత ఏమి చేయాలి') ||
    query.includes('ಮುಂದಿನ ಹೆಜ್ಜೆಗಳು')
  ) {
    return {
      intent: 'NEXT_STEPS',
      confidence: 0.98,
      serviceCalled: 'Actionable Next-Step Protocol (finalAdvisor.ts)',
      entities: { topic: 'next_steps' }
    };
  }

  // 6. ACTION INTENTS (Start / Reset Analysis)
  if (
    query.includes('start analysis') ||
    query.includes('run analysis') ||
    query.includes('analyze my business') ||
    query.includes('analyze business') ||
    query.includes('विश्लेषण शुरू') ||
    query.includes('విశ్లేషణ ప్రారంభించు')
  ) {
    return {
      intent: 'BUSINESS_FEASIBILITY',
      confidence: 0.98,
      serviceCalled: 'Multi-Agent Orchestrator Pipeline',
      entities: { actionType: 'TRIGGER_ANALYSIS' }
    };
  }

  if (
    query.includes('reset analysis') ||
    query.includes('start new') ||
    query.includes('clear form') ||
    query.includes('नया विश्लेषण') ||
    query.includes('కొత్త విశ్లేషణ')
  ) {
    return {
      intent: 'BUSINESS_FEASIBILITY',
      confidence: 0.96,
      serviceCalled: 'Application State Controller',
      entities: { actionType: 'RESET_ANALYSIS' }
    };
  }

  // 7. UDYORA HELP & PLATFORM INQUIRIES
  if (
    query.includes('what is udyora') ||
    query.includes('what does udyora do') ||
    query.includes('how does udyora work') ||
    query.includes('about udyora') ||
    query.includes('udyora help') ||
    query.includes('उद्योरा क्या है') ||
    query.includes('ఉద్యోరా అంటే ఏమిటి') ||
    query.includes('ಉದ್ಯೋರಾ ಎಂದರೇನು')
  ) {
    return {
      intent: 'UDYORA_HELP',
      confidence: 0.98,
      serviceCalled: 'UDYORA Knowledge Service',
      entities: { topic: 'platform_capabilities' }
    };
  }

  // 8. MULTILINGUAL GUIDANCE
  if (
    query.includes('change language') ||
    query.includes('available languages') ||
    query.includes('speak in hindi') ||
    query.includes('speak in telugu') ||
    query.includes('भाषा बदलें') ||
    query.includes('భాష మార్చండి')
  ) {
    return {
      intent: 'MULTILINGUAL_HELP',
      confidence: 0.96,
      serviceCalled: 'Multilingual Localization Engine',
      entities: { topic: 'language_selection' }
    };
  }

  // 9. EVIDENCE & DATA PROVENANCE
  if (
    query.includes('population number come from') ||
    query.includes('population data come from') ||
    query.includes('where did this data come from') ||
    query.includes('where did this population data come from') ||
    query.includes('where did the data come from') ||
    query.includes('data come from') ||
    query.includes('data source') ||
    query.includes('sources') ||
    query.includes('evidence') ||
    query.includes('census 2011') ||
    query.includes('census') ||
    query.includes('provenance') ||
    query.includes('audit trail') ||
    query.includes('verified data') ||
    query.includes('estimated data') ||
    query.includes('डेटा कहाँ से आया') ||
    query.includes('स्रोत') ||
    query.includes('డేటా ఎక్కడి నుండి వచ్చింది') ||
    query.includes('మాಹಿತಿ ಮೂಲ')
  ) {
    return {
      intent: 'EVIDENCE',
      confidence: 0.97,
      serviceCalled: 'Evidence Registry & Provenance Layer (evidenceAgent.ts)',
      entities: { topic: 'data_provenance' }
    };
  }

  // 10. FINANCIAL PLANNING & EMI CALCULATIONS
  const isFinancePill =
    query.includes('financial planning') ||
    query.includes('financial plan') ||
    query.includes('financial') ||
    query.includes('finance') ||
    query.includes('वित्तीय योजना') ||
    query.includes('आर्थिक नियोजन') ||
    query.includes('ఆర్థిక ప్రణాళిక') ||
    query.includes('హణకాసు యోజనె');

  const isEmiSpecific =
    query.includes('emi') ||
    query.includes('calculate emi') ||
    query.includes('my emi') ||
    query.includes('what is emi') ||
    query.includes('what is my emi') ||
    query.includes('why is my emi') ||
    query.includes('reduce my emi') ||
    query.includes('reduce emi') ||
    query.includes('monthly installment') ||
    query.includes('monthly payment') ||
    query.includes('ईएमआई') ||
    query.includes('मासिक किस्त') ||
    query.includes('నెలవారీ వాయిదా') ||
    query.includes('ఈఎంఐ') ||
    query.includes('मासिक हप्ता') ||
    query.includes('ಮಾಸಿಕ ಕಂತು');

  if (
    isFinancePill ||
    isEmiSpecific ||
    query.includes('loan amount') ||
    query.includes('bank loan') ||
    query.includes('term loan') ||
    query.includes('project cost') ||
    query.includes('total cost') ||
    query.includes('how much loan') ||
    query.includes('how much to borrow') ||
    query.includes('how much financing') ||
    query.includes('interest rate') ||
    query.includes('interest paid') ||
    query.includes('equity') ||
    query.includes('promoter margin') ||
    query.includes('dscr') ||
    query.includes('capex') ||
    query.includes('opex') ||
    query.includes('working capital') ||
    query.includes('profit margin') ||
    query.includes('किस्त') ||
    query.includes('लोन') ||
    query.includes('ऋण') ||
    query.includes('लागत') ||
    query.includes('ब्याज') ||
    query.includes('వడ్డీ') ||
    query.includes('రుణం') ||
    query.includes('ఖర్చు') ||
    query.includes('कर्ज') ||
    query.includes('संसार') ||
    query.includes('ಸಾಲ') ||
    query.includes('ಬಡ್ಡಿ')
  ) {
    return {
      intent: isEmiSpecific ? 'EMI' : 'FINANCIAL_PLANNING',
      confidence: 0.99,
      serviceCalled: 'Deterministic Financial Calculator (financialCalculator.ts)',
      entities: {
        topic: isEmiSpecific ? 'emi' : 'loan_structure'
      }
    };
  }

  // 11. GOVERNMENT SCHEME GUIDANCE
  if (
    query.includes('government schemes') ||
    query.includes('which government scheme') ||
    query.includes('which scheme') ||
    query.includes('what scheme') ||
    query.includes('scheme for') ||
    query.includes('government scheme') ||
    query.includes('schemes') ||
    query.includes('subsidy') ||
    query.includes('subsidies') ||
    query.includes('pmegp') ||
    query.includes('mudra') ||
    query.includes('ahidf') ||
    query.includes('nabard') ||
    query.includes('stand up india') ||
    query.includes('eligible for scheme') ||
    query.includes('scheme eligibility') ||
    query.includes('documents needed') ||
    query.includes('documents required') ||
    query.includes('paperwork') ||
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
    query.includes('ದಾಖಲೆಗಳು')
  ) {
    return {
      intent: 'SCHEME_GUIDANCE',
      confidence: 0.99,
      serviceCalled: 'Scheme Rule Engine (schemeRules.ts)',
      entities: {
        schemeName: query.includes('pmegp') ? 'PMEGP' : query.includes('mudra') ? 'MUDRA' : 'ALL_MATCHES'
      }
    };
  }

  // 12. RISK ANALYSIS
  if (
    query.includes('risk analysis') ||
    query.includes('risk') ||
    query.includes('risks') ||
    query.includes('what are my risks') ||
    query.includes('what are the main risks') ||
    query.includes('biggest risks') ||
    query.includes('threats') ||
    query.includes('challenges') ||
    query.includes('what can go wrong') ||
    query.includes('mitigation') ||
    query.includes('reduce risk') ||
    query.includes('reduce these risks') ||
    query.includes('safeguard') ||
    query.includes('जोखिम विश्लेषण') ||
    query.includes('जोखिम') ||
    query.includes('खतरे') ||
    query.includes('नुकसान') ||
    query.includes('రిస్క్ విశ్లేషణ') ||
    query.includes('రిస్క్') ||
    query.includes('రిస్కులు') ||
    query.includes('ప్రమాదం') ||
    query.includes('धोके') ||
    query.includes('अಪಾಯ')
  ) {
    return {
      intent: 'RISK_ANALYSIS',
      confidence: 0.99,
      serviceCalled: 'Risk Analysis Agent (riskAgent.ts)',
      entities: { topic: 'risk_mitigation' }
    };
  }

  // 13. LOCATION ANALYSIS
  if (
    query.includes('location analysis') ||
    query.includes('why this location') ||
    query.includes('why did you recommend this location') ||
    query.includes('recommend this location') ||
    query.includes('best location') ||
    query.includes('village population') ||
    query.includes('location insights') ||
    query.includes('why this village') ||
    query.includes('nearby banks') ||
    query.includes('nearest bank') ||
    query.includes('nearest market') ||
    query.includes('coordinates') ||
    query.includes('latitude') ||
    query.includes('longitude') ||
    query.includes('tehsil') ||
    query.includes('mandal') ||
    query.includes('lgd') ||
    query.includes('स्थान विश्लेषण') ||
    query.includes('गाँव') ||
    query.includes('जनसंख्या') ||
    query.includes('గ్రామం') ||
    query.includes('జనాభా') ||
    query.includes('స్థాన వివరాలు') ||
    query.includes('ಸ್ಥಳದ ಮಾಹಿತಿ')
  ) {
    return {
      intent: 'LOCATION_ANALYSIS',
      confidence: 0.99,
      serviceCalled: 'Map Intelligence & LGD Spatial Service (mapService.ts)',
      entities: { topic: 'spatial_and_locality' }
    };
  }

  // 14. MARKET INTELLIGENCE
  if (
    query.includes('market analysis') ||
    query.includes('market intelligence') ||
    query.includes('market demand') ||
    query.includes('market opportunity') ||
    query.includes('market opportunities') ||
    query.includes('market') ||
    query.includes('demand') ||
    query.includes('competition') ||
    query.includes('competitors') ||
    query.includes('customer base') ||
    query.includes('buyers') ||
    query.includes('mandi') ||
    query.includes('बाज़ार विश्लेषण') ||
    query.includes('मांग') ||
    query.includes('ग्राहक') ||
    query.includes('मार्केट విశ్లేషణ') ||
    query.includes('డిమాండ్') ||
    query.includes('పోటీ') ||
    query.includes('ಮಾರುಕಟ್ಟೆ')
  ) {
    return {
      intent: 'MARKET_INTELLIGENCE',
      confidence: 0.99,
      serviceCalled: 'Market Intelligence Agent (marketAgent.ts)',
      entities: { topic: 'market_dynamics' }
    };
  }

  // 15. REPORT EXPLANATION & SUMMARY
  if (
    query.includes('summarize my report') ||
    query.includes('summarize report') ||
    query.includes('summary of my report') ||
    query.includes('report summary') ||
    query.includes('explain my score') ||
    query.includes('feasibility score') ||
    query.includes('feasibility verdict') ||
    query.includes('रिपोर्ट का सारांश') ||
    query.includes('निवेదిక సారాంశం') ||
    query.includes('అహವಾಲು ಸಾರಾಂಶ')
  ) {
    return {
      intent: 'REPORT_EXPLANATION',
      confidence: 0.98,
      serviceCalled: 'Final Feasibility Aggregator (finalAdvisorAgent.ts)',
      entities: { topic: 'report_explanation' }
    };
  }

  // 16. BUSINESS FEASIBILITY & DOMAIN RANKINGS
  if (
    query.includes('business feasibility') ||
    query.includes('what business can i start') ||
    query.includes('start with 1 lakh') ||
    query.includes('start with ₹1 lakh') ||
    query.includes('business idea') ||
    query.includes('business ideas') ||
    query.includes('is it feasible') ||
    query.includes('which business is best') ||
    query.includes('compare businesses') ||
    query.includes('suitability score') ||
    query.includes('dairy business') ||
    query.includes('kirana store') ||
    query.includes('tailoring unit') ||
    query.includes('poultry farm') ||
    query.includes('व्यवसाय व्यवहार्यता') ||
    query.includes('వ్యాపార సాధ్యాసాధ్యాలు') ||
    query.includes('ವ್ಯಾಪಾರ ಕಾರ್ಯಸಾಧ್ಯತೆ')
  ) {
    return {
      intent: 'BUSINESS_FEASIBILITY',
      confidence: 0.99,
      serviceCalled: 'Domain Comparison & Feasibility Engine (domainComparisonService.ts)',
      entities: { topic: 'business_feasibility_ranking' }
    };
  }

  // 17. CONVERSATIONAL PRONOUN RESOLUTION (Memory Continuity)
  if (
    previousTopic &&
    (query === 'why' ||
      query === 'how' ||
      query.includes('why is that') ||
      query.includes('how does that work') ||
      query.includes('tell me more') ||
      query.includes('what about it') ||
      query.includes('how can i reduce it') ||
      query.includes('reduce it') ||
      query.includes('increase my contribution') ||
      query.includes('इसको समझाइए') ||
      query.includes('దీని గురించి వివరించండి'))
  ) {
    if (previousTopic === 'finance' || previousTopic === 'FINANCIAL_PLANNING' || previousTopic === 'EMI') {
      return {
        intent: query.includes('reduce') ? 'EMI' : 'FINANCIAL_PLANNING',
        confidence: 0.90,
        serviceCalled: 'Deterministic Financial Calculator (Conversational Continuity)',
        entities: { topic: 'emi_explanation' }
      };
    }
    if (previousTopic === 'scheme' || previousTopic === 'SCHEME_GUIDANCE') {
      return {
        intent: 'SCHEME_GUIDANCE',
        confidence: 0.90,
        serviceCalled: 'Scheme Rule Engine (Conversational Continuity)',
        entities: { topic: 'scheme_details' }
      };
    }
    if (previousTopic === 'risk' || previousTopic === 'RISK_ANALYSIS') {
      return {
        intent: 'RISK_ANALYSIS',
        confidence: 0.90,
        serviceCalled: 'Risk Analysis Agent (Conversational Continuity)',
        entities: { topic: 'risk_mitigation' }
      };
    }
    if (previousTopic === 'location' || previousTopic === 'LOCATION_ANALYSIS') {
      return {
        intent: 'LOCATION_ANALYSIS',
        confidence: 0.90,
        serviceCalled: 'Map Intelligence Service (Conversational Continuity)',
        entities: { topic: 'location_details' }
      };
    }
    if (previousTopic === 'market' || previousTopic === 'MARKET_INTELLIGENCE') {
      return {
        intent: 'MARKET_INTELLIGENCE',
        confidence: 0.90,
        serviceCalled: 'Market Intelligence Agent (Conversational Continuity)',
        entities: { topic: 'market_dynamics' }
      };
    }
  }

  // 18. GENERAL BUSINESS KEYWORD CATCH
  if (
    query.includes('business') ||
    query.includes('enterprise') ||
    query.includes('shop') ||
    query.includes('store') ||
    query.includes('cost') ||
    query.includes('capital') ||
    query.includes('money') ||
    query.includes('व्यवसाय') ||
    query.includes('వ్యాపారం') ||
    query.includes('ಉದ್ಯಮ')
  ) {
    return {
      intent: 'BUSINESS_FEASIBILITY',
      confidence: 0.85,
      serviceCalled: 'Business Advisory Agent',
      entities: { topic: 'general_business_inquiry' }
    };
  }

  // 19. FINAL FALLBACK: UNCLEAR
  return {
    intent: 'UNCLEAR',
    confidence: 0.80,
    serviceCalled: 'Intent Clarification Handler',
    entities: {}
  };
}

export const routeAdvisorQuery = classifyIntent;
