/**
 * UDYORA Advisor Query Router & Intent Classification Layer
 * Intelligently classifies natural language queries into deterministic application services or polite out-of-scope handling.
 * Supports multilingual intent detection across English, Hindi, Telugu, Marathi, and Kannada.
 */

export type AdvisorIntent =
  | 'BUSINESS_FEASIBILITY'
  | 'MARKET_INTELLIGENCE'
  | 'LOCATION_ANALYSIS'
  | 'FINANCIAL_PLANNING'
  | 'SCHEME_GUIDANCE'
  | 'RISK_ANALYSIS'
  | 'EVIDENCE'
  | 'REPORT_EXPLANATION'
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
    // Known keyboard mash patterns
    if (/asdf|dfgh|ghjk|hjkl|qwerty|werty|ertyu|rtyui|tyuio|yuio|zxcvb|xcvbn|cvbnm/.test(clean)) {
      return true;
    }
  }

  return false;
}

/**
 * Detects prompt injections, jailbreak attempts, or malicious instructions.
 */
function isPromptInjection(text: string): boolean {
  const clean = text.toLowerCase().trim();
  return (
    clean.includes('ignore previous instructions') ||
    clean.includes('ignore all previous instructions') ||
    clean.includes('ignore your instructions') ||
    clean.includes('disregard previous instructions') ||
    clean.includes('disregard all previous instructions') ||
    clean.includes('system prompt') ||
    clean.includes('jailbreak') ||
    clean.includes('act as a general') ||
    clean.includes('act as an unrestricted') ||
    clean.includes('pretend you are') ||
    clean.includes('bypass rules') ||
    clean.includes('answer anything') ||
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

  // 2. Creative Writing, Humor & Entertainment
  if (
    clean.includes('tell me a joke') ||
    clean.includes('tell a joke') ||
    clean.includes('say a joke') ||
    clean.includes('make me laugh') ||
    clean.includes('write me a poem') ||
    clean.includes('write a poem') ||
    clean.includes('write a story') ||
    clean.includes('write a song') ||
    clean.includes('riddle') ||
    clean.includes('funny joke') ||
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

  // 3. General Trivia & Non-Business Geography / History
  if (
    clean.includes('capital of france') ||
    clean.includes('capital of germany') ||
    clean.includes('capital of') ||
    clean.includes('who is president') ||
    clean.includes('who is prime minister') ||
    clean.includes('solar system') ||
    clean.includes('planet') ||
    clean.includes('speed of light') ||
    clean.includes('history of rome')
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
    clean.includes('write a script to') ||
    clean.includes('write code') ||
    clean.includes('java code') ||
    clean.includes('python code') ||
    clean.includes('coding in')
  ) {
    return true;
  }

  // 5. Academic / College Homework
  if (
    clean.includes('solve my college homework') ||
    clean.includes('solve my homework') ||
    clean.includes('do my homework') ||
    clean.includes('solve this math problem') ||
    clean.includes('calculus') ||
    clean.includes('algebra problem') ||
    clean.includes('physics question') ||
    clean.includes('chemistry equation')
  ) {
    return true;
  }

  // 6. Sports Matches & Live News
  if (
    clean.includes('cricket match') ||
    clean.includes('football match') ||
    clean.includes('who won the match') ||
    clean.includes('live score') ||
    clean.includes('ipl score') ||
    clean.includes('world cup score')
  ) {
    return true;
  }

  // 7. Personal & Relationship Advice
  if (
    clean.includes('relationship advice') ||
    clean.includes('dating advice') ||
    clean.includes('my boyfriend') ||
    clean.includes('my girlfriend') ||
    clean.includes('horoscope') ||
    clean.includes('astrology') ||
    clean.includes('zodiac sign') ||
    clean.includes('love life')
  ) {
    return true;
  }

  // 8. Cryptocurrency & Speculation
  if (
    clean.includes('bitcoin') ||
    clean.includes('ethereum') ||
    clean.includes('crypto price') ||
    clean.includes('buy crypto') ||
    clean.includes('stock market tip') ||
    clean.includes('forex trading') ||
    clean.includes('nft')
  ) {
    return true;
  }

  // 9. Social Media Captions
  if (
    clean.includes('instagram caption') ||
    clean.includes('insta caption') ||
    clean.includes('tiktok bio') ||
    clean.includes('youtube title') ||
    clean.includes('write a tweet')
  ) {
    return true;
  }

  // 10. Weather (when not agricultural business climate)
  if (
    clean.includes('weather') ||
    clean.includes('forecast') ||
    clean.includes('rain today') ||
    clean.includes('आज का मौसम') ||
    clean.includes('ఈరోజు వాతావరణం')
  ) {
    return true;
  }

  return false;
}

/**
 * Classifies a user query into one of the standard UDYORA intents.
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

  // 4. ACTION INTENT (Start / Run / Reset / Analyze)
  if (
    query.includes('start analysis') ||
    query.includes('run analysis') ||
    query.includes('analyze my business') ||
    query.includes('analyze business') ||
    query.includes('begin assessment') ||
    query.includes('विश्लेषण शुरू') ||
    query.includes('विश्लेषण सुरू') ||
    query.includes('విశ్లేషణ ప్రారంభించు') ||
    query.includes('విశ్లేషణ మొదలుపెట్టు') ||
    query.includes('ವಿಶ್ಲೇಷಣೆ ಪ್ರಾರಂಭಿಸಿ')
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
    query.includes('start a new analysis') ||
    query.includes('clear form') ||
    query.includes('नया विश्लेषण') ||
    query.includes('కొత్త విశ్లేషణ') ||
    query.includes('नवीन विश्लेषण')
  ) {
    return {
      intent: 'BUSINESS_FEASIBILITY',
      confidence: 0.96,
      serviceCalled: 'Application State Controller',
      entities: { actionType: 'RESET_ANALYSIS' }
    };
  }

  // 5. UDYORA HELP & PLATFORM INQUIRIES
  if (
    query.includes('what is udyora') ||
    query.includes('what does udyora do') ||
    query.includes('how does udyora work') ||
    query.includes('who made udyora') ||
    query.includes('about udyora') ||
    query.includes('udyora help') ||
    query.includes('how to use this app') ||
    query.includes('what is this app') ||
    query.includes('उद्योरा क्या है') ||
    query.includes('उद्योरा काय आहे') ||
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

  // 6. MULTILINGUAL GUIDANCE & LANGUAGE ASSISTANCE
  if (
    query.includes('change language') ||
    query.includes('available languages') ||
    query.includes('speak in hindi') ||
    query.includes('speak in telugu') ||
    query.includes('speak in marathi') ||
    query.includes('speak in kannada') ||
    query.includes('भाषा बदलें') ||
    query.includes('భాష మార్చండి') ||
    query.includes('भाषा बदला')
  ) {
    return {
      intent: 'MULTILINGUAL_HELP',
      confidence: 0.96,
      serviceCalled: 'Multilingual Localization Engine',
      entities: { topic: 'language_selection' }
    };
  }

  // 7. EVIDENCE & PROVENANCE (Census, APMC, Sources, Provenance)
  if (
    query.includes('population number come from') ||
    query.includes('where did this data come from') ||
    query.includes('where did the data come from') ||
    query.includes('where did you get this data') ||
    query.includes('where do you get') ||
    query.includes('data source') ||
    query.includes('sources') ||
    query.includes('evidence') ||
    query.includes('census 2011') ||
    query.includes('census') ||
    query.includes('provenance') ||
    query.includes('audit trail') ||
    query.includes('how reliable') ||
    query.includes('verified data') ||
    query.includes('डेटा कहाँ से आया') ||
    query.includes('स्रोत') ||
    query.includes('सत्यापित') ||
    query.includes('డేటా ఎక్కడి నుండి వచ్చింది') ||
    query.includes('ఆధారం') ||
    query.includes('మూలం') ||
    query.includes('ಮಾಹಿತಿ ಮೂಲ')
  ) {
    return {
      intent: 'EVIDENCE',
      confidence: 0.97,
      serviceCalled: 'Evidence Registry & Provenance Layer (evidenceAgent.ts)',
      entities: { topic: 'data_provenance' }
    };
  }

  // 8. FINANCIAL PLANNING (EMI, Loan, Project Cost, CapEx, OpEx, Profit, Working Capital, Interest, Equity, DSCR)
  if (
    query.includes('calculate emi') ||
    query.includes('my emi') ||
    query.includes('what is emi') ||
    query.includes('what is my emi') ||
    query.includes('what about emi') ||
    query.includes('emi') ||
    query.includes('monthly installment') ||
    query.includes('monthly payment') ||
    query.includes('loan amount') ||
    query.includes('bank loan') ||
    query.includes('term loan') ||
    query.includes('project cost') ||
    query.includes('total cost') ||
    query.includes('how much loan') ||
    query.includes('interest rate') ||
    query.includes('interest') ||
    query.includes('equity') ||
    query.includes('promoter margin') ||
    query.includes('down payment') ||
    query.includes('dscr') ||
    query.includes('capex') ||
    query.includes('opex') ||
    query.includes('working capital') ||
    query.includes('profit margin') ||
    query.includes('roi') ||
    query.includes('किस्त') ||
    query.includes('ईएमआई') ||
    query.includes('मासिक किस्त') ||
    query.includes('लोन') ||
    query.includes('ऋण') ||
    query.includes('लागत') ||
    query.includes('ब्याज') ||
    query.includes('हफ्ता') ||
    query.includes('వడ్డీ') ||
    query.includes('రుణం') ||
    query.includes('ఖర్చు') ||
    query.includes('ఈఎంఐ') ||
    query.includes('నెలవారీ వాయిదా') ||
    query.includes('कर्ज') ||
    query.includes('व्याज') ||
    query.includes('हप्ता') ||
    query.includes('ईएमआय') ||
    query.includes('ಸಾಲ') ||
    query.includes('ಬಡ್ಡಿ') ||
    query.includes('ಮಾಸಿಕ ಕಂತು')
  ) {
    return {
      intent: 'FINANCIAL_PLANNING',
      confidence: 0.98,
      serviceCalled: 'Deterministic Financial Calculator (financialCalculator.ts)',
      entities: {
        topic: query.includes('emi') || query.includes('किस्त') || query.includes('వాయిదా') || query.includes('हफ्ता') ? 'emi' : 'loan_structure'
      }
    };
  }

  // 9. SCHEME GUIDANCE (Government schemes, PMEGP, MUDRA, Subsidies, Eligibility, Documents)
  if (
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
    query.includes('pmmsy') ||
    query.includes('eligible for scheme') ||
    query.includes('scheme eligibility') ||
    query.includes('documents needed') ||
    query.includes('documents required') ||
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
      intent: 'SCHEME_GUIDANCE',
      confidence: 0.97,
      serviceCalled: 'Scheme Rule Engine (schemeRules.ts)',
      entities: {
        schemeName: query.includes('pmegp') ? 'PMEGP' : query.includes('mudra') ? 'MUDRA' : 'ALL_MATCHES'
      }
    };
  }

  // 10. RISK ANALYSIS (Risks, what can go wrong, mitigations, severity, dangers)
  if (
    query.includes('risk') ||
    query.includes('risks') ||
    query.includes('what are the main risks') ||
    query.includes('main risks') ||
    query.includes('biggest risks') ||
    query.includes('threats') ||
    query.includes('challenges') ||
    query.includes('danger') ||
    query.includes('what can go wrong') ||
    query.includes('mitigation') ||
    query.includes('reduce risk') ||
    query.includes('safeguard') ||
    query.includes('business failure') ||
    query.includes('loss') ||
    query.includes('जोखिम') ||
    query.includes('खतरे') ||
    query.includes('नुकसान') ||
    query.includes('बचाव') ||
    query.includes('రిస్క్') ||
    query.includes('రిస్కులు') ||
    query.includes('ప్రమాదం') ||
    query.includes('ప్రమాదాలు') ||
    query.includes('ధోకా') ||
    query.includes('धोके') ||
    query.includes('धोका') ||
    query.includes('ಅಪಾಯ') ||
    query.includes('ಅಪಾಯಗಳು')
  ) {
    return {
      intent: 'RISK_ANALYSIS',
      confidence: 0.96,
      serviceCalled: 'Risk Analysis Agent (riskAgent.ts)',
      entities: { topic: 'risk_mitigation' }
    };
  }

  // 11. LOCATION ANALYSIS & SPATIAL INSIGHTS (Why recommend this location, coordinates, banks, village population)
  if (
    query.includes('why did you recommend this location') ||
    query.includes('recommend this location') ||
    query.includes('how many people live in this village') ||
    query.includes('people live in this village') ||
    query.includes('village population') ||
    query.includes('location insights') ||
    query.includes('why this village') ||
    query.includes('nearby banks') ||
    query.includes('nearest bank') ||
    query.includes('nearest market') ||
    query.includes('how far is mandi') ||
    query.includes('5 km') ||
    query.includes('10 km') ||
    query.includes('catchment') ||
    query.includes('coordinates') ||
    query.includes('latitude') ||
    query.includes('longitude') ||
    query.includes('taluka') ||
    query.includes('mandal') ||
    query.includes('tehsil') ||
    query.includes('pincode') ||
    query.includes('lgd') ||
    query.includes('map location') ||
    query.includes('स्थान') ||
    query.includes('गाँव') ||
    query.includes('जनसंख्या') ||
    query.includes('नजदीकी बैंक') ||
    query.includes('గ్రామం') ||
    query.includes('జనాభా') ||
    query.includes('సమీప బ్యాంకులు') ||
    query.includes('స్థాన వివరాలు') ||
    query.includes('ಸ್ಥಳದ ಮಾಹಿತಿ') ||
    query.includes('ಜನಸಂಖ್ಯೆ')
  ) {
    return {
      intent: 'LOCATION_ANALYSIS',
      confidence: 0.95,
      serviceCalled: 'Map Intelligence & LGD Spatial Service (mapService.ts)',
      entities: { topic: 'spatial_and_locality' }
    };
  }

  // 12. MARKET INTELLIGENCE (Demand, competition, buyers, mandi offtake, local consumers)
  if (
    query.includes('market demand') ||
    query.includes('market opportunity') ||
    query.includes('market opportunities') ||
    query.includes('market') ||
    query.includes('demand') ||
    query.includes('competition') ||
    query.includes('competitors') ||
    query.includes('customer base') ||
    query.includes('buyers') ||
    query.includes('selling') ||
    query.includes('mandi') ||
    query.includes('cooperative offtake') ||
    query.includes('बाजार') ||
    query.includes('मांग') ||
    query.includes('ग्राहक') ||
    query.includes('प्रतिस्पर्धा') ||
    query.includes('మార్కెట్') ||
    query.includes('డిమాండ్') ||
    query.includes('పోటీ') ||
    query.includes('ಮಾರುಕಟ್ಟೆ') ||
    query.includes('ಬೇಡಿಕೆ')
  ) {
    return {
      intent: 'MARKET_INTELLIGENCE',
      confidence: 0.94,
      serviceCalled: 'Market Intelligence Agent (marketAgent.ts)',
      entities: { topic: 'market_dynamics' }
    };
  }

  // 13. REPORT EXPLANATION & SUMMARY (Summarize report, explain feasibility verdict)
  if (
    query.includes('summarize my report') ||
    query.includes('summarize report') ||
    query.includes('summary of my report') ||
    query.includes('report summary') ||
    query.includes('explain my score') ||
    query.includes('explain score') ||
    query.includes('verdict') ||
    query.includes('feasibility score') ||
    query.includes('feasibility verdict') ||
    query.includes('final recommendation') ||
    query.includes('रिपोर्ट का सारांश') ||
    query.includes('स्कोर का मतलब') ||
    query.includes('निवेదిక సారాంశం') ||
    query.includes('స్కోరు వివరాలు') ||
    query.includes('ಅಹವಾಲು ಸಾರಾಂಶ')
  ) {
    return {
      intent: 'REPORT_EXPLANATION',
      confidence: 0.96,
      serviceCalled: 'Final Feasibility Aggregator (finalAdvisorAgent.ts)',
      entities: { topic: 'report_explanation' }
    };
  }

  // 14. BUSINESS FEASIBILITY & DOMAIN COMPARISON ("What business can I start with ₹1 lakh?", alternative businesses)
  if (
    query.includes('what business can i start') ||
    query.includes('business can i start with') ||
    query.includes('start with 1 lakh') ||
    query.includes('start with ₹1 lakh') ||
    query.includes('start with 50000') ||
    query.includes('business idea') ||
    query.includes('business ideas') ||
    query.includes('business feasibility') ||
    query.includes('is it feasible') ||
    query.includes('which business is best') ||
    query.includes('best business for me') ||
    query.includes('other businesses') ||
    query.includes('other options') ||
    query.includes('compare businesses') ||
    query.includes('suitability score') ||
    query.includes('ranked first') ||
    query.includes('ranked #1') ||
    query.includes('dairy business') ||
    query.includes('kirana store') ||
    query.includes('grocery store') ||
    query.includes('tailoring unit') ||
    query.includes('poultry farm') ||
    query.includes('cow') ||
    query.includes('equipment') ||
    query.includes('machinery') ||
    query.includes('लाख में कौन सा व्यवसाय') ||
    query.includes('व्यवसाय के विचार') ||
    query.includes('లక్షతో ఏ వ్యాపారం') ||
    query.includes('వ్యాపార ఆలోచనలు') ||
    query.includes('ಉದ್ಯಮ ಕಲ್ಪನೆಗಳು')
  ) {
    return {
      intent: 'BUSINESS_FEASIBILITY',
      confidence: 0.95,
      serviceCalled: 'Domain Comparison & Feasibility Engine (domainComparisonService.ts)',
      entities: { topic: 'business_feasibility_ranking' }
    };
  }

  // 15. CONVERSATIONAL PRONOUN RESOLUTION (Contextual Memory fallback)
  if (
    previousTopic &&
    (query === 'why' ||
      query === 'how' ||
      query.includes('why is that') ||
      query.includes('how does that work') ||
      query.includes('tell me more about it') ||
      query.includes('what about it') ||
      query.includes('इसको समझाइए') ||
      query.includes('దీని గురించి వివరించండి'))
  ) {
    if (previousTopic === 'finance' || previousTopic === 'FINANCIAL_PLANNING') {
      return {
        intent: 'FINANCIAL_PLANNING',
        confidence: 0.88,
        serviceCalled: 'Deterministic Financial Calculator (Contextual Followup)',
        entities: { topic: 'emi_explanation' }
      };
    }
    if (previousTopic === 'scheme' || previousTopic === 'SCHEME_GUIDANCE') {
      return {
        intent: 'SCHEME_GUIDANCE',
        confidence: 0.88,
        serviceCalled: 'Scheme Rule Engine (Contextual Followup)',
        entities: { topic: 'scheme_details' }
      };
    }
    if (previousTopic === 'risk' || previousTopic === 'RISK_ANALYSIS') {
      return {
        intent: 'RISK_ANALYSIS',
        confidence: 0.88,
        serviceCalled: 'Risk Analysis Agent (Contextual Followup)',
        entities: { topic: 'risk_mitigation' }
      };
    }
    if (previousTopic === 'location' || previousTopic === 'LOCATION_ANALYSIS') {
      return {
        intent: 'LOCATION_ANALYSIS',
        confidence: 0.88,
        serviceCalled: 'Map Intelligence Service (Contextual Followup)',
        entities: { topic: 'location_details' }
      };
    }
  }

  // 16. IF QUERY HAS ANY BUSINESS / FINANCIAL KEYWORDS, PRESERVE AS BUSINESS FEASIBILITY
  if (
    query.includes('business') ||
    query.includes('enterprise') ||
    query.includes('shop') ||
    query.includes('store') ||
    query.includes('farming') ||
    query.includes('cost') ||
    query.includes('money') ||
    query.includes('capital') ||
    query.includes('invest') ||
    query.includes('paisa') ||
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

  // 17. FINAL FALLBACK: UNCLEAR
  return {
    intent: 'UNCLEAR',
    confidence: 0.80,
    serviceCalled: 'Intent Clarification Handler',
    entities: {}
  };
}

/**
 * Backward compatibility alias for routeAdvisorQuery.
 */
export const routeAdvisorQuery = classifyIntent;

