/**
 * UDYORA Business Input & Voice Command Parser
 * Deterministic extraction and normalization of business category, capital, scale,
 * and description from natural language voice or typed inputs.
 * Multilingual support across English, Hindi, Telugu, Marathi, and Kannada.
 */

import { SupportedLanguage } from '../i18n/types';

export type BusinessCategoryKey = 'dairy' | 'tailoring' | 'retail' | 'poultry' | 'custom';
export type VoiceParsingConfidence = 'CLEAR' | 'AMBIGUOUS' | 'INSUFFICIENT';

export interface AmbiguityOption {
  label: string;
  category: BusinessCategoryKey;
  suggestedIdea: string;
}

export interface ParsedBusinessCommand {
  rawTranscript: string;
  confidence: VoiceParsingConfidence;
  category?: BusinessCategoryKey;
  categoryLabel?: string;
  capital?: number;
  capitalFormatted?: string;
  scaleQuantity?: string;
  businessIdea?: string;
  ambiguityQuestion?: string;
  ambiguityOptions?: AmbiguityOption[];
  missingFields: Array<'category' | 'capital' | 'description'>;
  feedbackMessage?: string;
}

/**
 * Maps standard categories to human-readable labels.
 */
export const CATEGORY_LABELS: Record<BusinessCategoryKey, string> = {
  dairy: 'Dairy Farming & Milk Production',
  tailoring: 'Apparel & Custom Tailoring Unit',
  retail: 'Kirana & Daily Essentials Retail Store',
  poultry: 'Broiler / Country Chicken Poultry Farm',
  custom: 'Custom / Other Micro-Enterprise'
};

/**
 * Number words mapping for English and Indian regional languages.
 */
const WORD_TO_NUMBER: Record<string, number> = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'fifteen': 15, 'twenty': 20, 'twenty five': 25, 'twenty-five': 25, 'thirty': 30, 'forty': 40, 'fifty': 50,
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'पंद्रह': 15, 'बीस': 20, 'पच्चीस': 25, 'तीस': 30, 'चालीस': 40, 'पचास': 50,
  'दोन': 2, 'पाच': 5, 'सहा': 6, 'दहा': 10, 'वीस': 20, 'पंचवीस': 25, 'पन्नास': 50,
  'ఒక': 1, 'ఒకటి': 1, 'రెండు': 2, 'మూడు': 3, 'నాలుగు': 4, 'ఐదు': 5, 'ఆరు': 6, 'ఏడు': 7, 'ఎనిమిది': 8, 'తొమ్మిది': 9, 'పది': 10,
  'ఇరవై': 20, 'యాభై': 50,
  'ಒಂದು': 1, 'ಎರಡು': 2, 'ಮೂರು': 3, 'ನಾಲ್ಕು': 4, 'ಐದು': 5, 'ಆರು': 6, 'ಏಳು': 7, 'ಎಂಟು': 8, 'ಒಂಬತ್ತು': 9, 'ಹತ್ತು': 10,
  'ಇಪ್ಪತ್ತು': 20, 'ಐವತ್ತು': 50
};

/**
 * Extracts and normalizes capital amount from text.
 * Strictly differentiates e.g. ₹1 lakh (100,000) from ₹10 lakh (1,000,000).
 */
export function extractCapitalAmount(text: string): { amount?: number; formatted?: string } | null {
  if (!text) return null;
  const clean = text.toLowerCase().replace(/,/g, '').trim();

  // 1. Direct Indian number word combos (e.g., "डेढ़ लाख" -> 150000, "दीड लाख" -> 150000, "లక్షన్నర" -> 150000)
  if (
    clean.includes('डेढ़ लाख') ||
    clean.includes('दीड लाख') ||
    clean.includes('లక్షన్నర') ||
    clean.includes('ಒಂದೂವರೆ ಲಕ್ಷ') ||
    clean.includes('one and half lakh') ||
    clean.includes('one and a half lakh') ||
    clean.includes('1 and half lakh')
  ) {
    return { amount: 150000, formatted: '₹1,50,000' };
  }

  if (clean.includes('ढाई लाख') || clean.includes('अडीच लाख') || clean.includes('two and half lakh')) {
    return { amount: 250000, formatted: '₹2,50,000' };
  }

  // 2. Regex for numeric multiplier: e.g. "1.5 lakh", "10 lakhs", "₹1 lakh", "2 crore", "50k", "50 thousand"
  const lakhMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|lac|l|लाख|లక్షలు|లక్ష|ಲಕ್ಷ)/i);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    if (!isNaN(val) && val > 0) {
      const amount = Math.round(val * 100000);
      return { amount, formatted: `₹${amount.toLocaleString('en-IN')}` };
    }
  }

  const croreMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:crores?|cr|करोड़|కోట్లు|కోటి|ಕೋಟಿ)/i);
  if (croreMatch) {
    const val = parseFloat(croreMatch[1]);
    if (!isNaN(val) && val > 0) {
      const amount = Math.round(val * 10000000);
      return { amount, formatted: `₹${amount.toLocaleString('en-IN')}` };
    }
  }

  const thousandMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:thousands?|k|हजार|వేలు|వేల|ಸಾವಿರ)/i);
  if (thousandMatch) {
    const val = parseFloat(thousandMatch[1]);
    if (!isNaN(val) && val > 0) {
      const amount = Math.round(val * 1000);
      return { amount, formatted: `₹${amount.toLocaleString('en-IN')}` };
    }
  }

  // 3. Word multipliers: "one lakh", "two lakh", "दस लाख", "ఒక లక్ష", "पचास हजार"
  for (const [word, num] of Object.entries(WORD_TO_NUMBER)) {
    // Word + lakh
    const isLakhMatch =
      new RegExp(`(?:^|[\\s.,!?])${word}\\s*(?:lakhs?|lacs?|lac|लाख|లక్షలు|లక్ష|ಲಕ್ಷ)(?:[\\s.,!?]|$)`, 'iu').test(clean) ||
      clean.includes(`${word} lakh`) ||
      clean.includes(`${word}lakh`) ||
      clean.includes(`${word} लाख`) ||
      clean.includes(`${word}लाख`) ||
      clean.includes(`${word} లక్ష`) ||
      clean.includes(`${word}లక్ష`) ||
      clean.includes(`${word} ಲಕ್ಷ`) ||
      clean.includes(`${word}ಲಕ್ಷ`);

    if (isLakhMatch) {
      const amount = num * 100000;
      return { amount, formatted: `₹${amount.toLocaleString('en-IN')}` };
    }

    // Word + thousand
    const isThousandMatch =
      new RegExp(`(?:^|[\\s.,!?])${word}\\s*(?:thousands?|हजार|వేలు|వేల|ಸಾವಿರ)(?:[\\s.,!?]|$)`, 'iu').test(clean) ||
      clean.includes(`${word} thousand`) ||
      clean.includes(`${word} हजार`) ||
      clean.includes(`${word}हजार`) ||
      clean.includes(`${word} వేలు`) ||
      clean.includes(`${word}వేలు`) ||
      clean.includes(`${word} వేల`) ||
      clean.includes(`${word} ಸಾವಿರ`) ||
      clean.includes(`${word}ಸಾವಿರ`);

    if (isThousandMatch) {
      const amount = num * 1000;
      return { amount, formatted: `₹${amount.toLocaleString('en-IN')}` };
    }
  }

  // 4. Standalone plain numeric figure: e.g. "₹100000", "150000", "₹ 50000"
  const rawNumMatch = clean.match(/(?:₹|rs\.?|inr)?\s*(\d{4,9})/i);
  if (rawNumMatch) {
    const val = parseInt(rawNumMatch[1], 10);
    if (!isNaN(val) && val >= 5000) {
      return { amount: val, formatted: `₹${val.toLocaleString('en-IN')}` };
    }
  }

  return null;
}

/**
 * Extracts business scale or quantity indicator if present (e.g. "8 cows", "4 machines", "1000 birds").
 */
export function extractScaleQuantity(text: string): string | undefined {
  if (!text) return undefined;
  const clean = text.toLowerCase().trim();

  // Livestock / Dairy animals
  const cowMatch = clean.match(/(\d+)\s*(?:cows?|buffaloes?|cattle|milch animals?|milch cows?|animals?|गाय|भैंस|पशु|ఆవులు|గేదెలు|పాడి పశువులు|ಹಸುಗಳು|ಹಸು)/i);
  if (cowMatch) {
    return `${cowMatch[1]} cows/milch animals`;
  }

  // Tailoring / Sewing machines
  const machineMatch = clean.match(/(\d+)\s*(?:sewing machines?|machines?|मशीन|सिलाई मशीन|మిషన్లు|కుట్టు మిషన్లు|ಹೊಲಿಗೆ ಯಂತ್ರಗಳು|ಯಂತ್ರಗಳು)/i);
  if (machineMatch) {
    return `${machineMatch[1]} sewing machines`;
  }

  // Poultry birds
  const poultryMatch = clean.match(/(\d+)\s*(?:birds?|chickens?|broilers?|layers?|मुर्गी|मुर्गियां|కోళ్లు|కోడిపిల్లలు|ಕೋಳಿಗಳು)/i);
  if (poultryMatch) {
    return `${poultryMatch[1]} birds capacity`;
  }

  return undefined;
}

/**
 * Checks for ambiguous keywords that could span multiple distinct business domains.
 */
function checkAmbiguity(text: string): { isAmbiguous: boolean; question?: string; options?: AmbiguityOption[] } {
  const clean = text.toLowerCase().trim();

  // "milk business" or "milk shop" without specifying farming vs collection vs retail
  const hasMilk = clean.includes('milk') || clean.includes('दूध') || clean.includes('पాలు') || clean.includes('ಹಾಲು');
  const hasFarmingKeyword = clean.includes('farm') || clean.includes('cow') || clean.includes('buffalo') || clean.includes('dairy') || clean.includes('डेयरी') || clean.includes('డైరీ') || clean.includes('డెయిరీ');
  const hasShopKeyword = clean.includes('shop') || clean.includes('retail') || clean.includes('store') || clean.includes('दुकान') || clean.includes('దుకాణం');

  if (hasMilk && !hasFarmingKeyword && !hasShopKeyword && (clean.includes('business') || clean.includes('काम') || clean.includes('వ్యాపారం') || clean.includes('ಉದ್ಯಮ'))) {
    return {
      isAmbiguous: true,
      question: 'Do you mean dairy farming (cattle rearing), a milk collection center, or a milk/dairy retail shop?',
      options: [
        {
          label: 'Dairy Farming (Cows / Milk Production)',
          category: 'dairy',
          suggestedIdea: 'Commercial Micro Dairy Farming Unit with high-yield milch cows'
        },
        {
          label: 'Milk Retail / Dairy Product Shop',
          category: 'retail',
          suggestedIdea: 'Retail Daily Essentials and Milk Product Booth'
        },
        {
          label: 'Custom Dairy Enterprise',
          category: 'custom',
          suggestedIdea: 'Custom Milk Collection and Processing Unit'
        }
      ]
    };
  }

  // "cloth business" without specifying tailoring vs textile retail
  const hasCloth = clean.includes('cloth') || clean.includes('कपड़े') || clean.includes('कपडे') || clean.includes('బట్టలు') || clean.includes('ಬಟ್ಟೆ');
  const hasTailorKeyword = clean.includes('tailor') || clean.includes('stitch') || clean.includes('boutique') || clean.includes('सिलाई') || clean.includes('కుట్టు') || clean.includes('ಹೊಲಿಗೆ');

  if (hasCloth && !hasTailorKeyword && !hasShopKeyword && (clean.includes('business') || clean.includes('start') || clean.includes('काम') || clean.includes('వ్యాపారం'))) {
    return {
      isAmbiguous: true,
      question: 'Do you mean an apparel & tailoring stitching unit, or a retail cloth / garment shop?',
      options: [
        {
          label: 'Tailoring & Garment Stitching Unit',
          category: 'tailoring',
          suggestedIdea: 'Apparel & Custom Tailoring Production Unit with industrial sewing machines'
        },
        {
          label: 'Retail Ready-Made Garment Store',
          category: 'retail',
          suggestedIdea: 'Retail Garment and Clothing Store'
        }
      ]
    };
  }

  return { isAmbiguous: false };
}

/**
 * Classifies business category from natural text.
 */
function detectCategory(text: string): BusinessCategoryKey | undefined {
  const clean = text.toLowerCase().trim();

  // 1. Dairy Keywords
  if (
    clean.includes('dairy') ||
    clean.includes('milk') ||
    clean.includes('cow') ||
    clean.includes('cows') ||
    clean.includes('buffalo') ||
    clean.includes('buffaloes') ||
    clean.includes('cattle') ||
    clean.includes('milch') ||
    clean.includes('paneer') ||
    clean.includes('ghee') ||
    clean.includes('डेयरी') ||
    clean.includes('डेरी') ||
    clean.includes('दूध') ||
    clean.includes('गाय') ||
    clean.includes('भैंस') ||
    clean.includes('पशुपालन') ||
    clean.includes('दुग्ध') ||
    clean.includes('డెయిరీ') ||
    clean.includes('డైరీ') ||
    clean.includes('పాల') ||
    clean.includes('పాలు') ||
    clean.includes('ఆవులు') ||
    clean.includes('గేదెలు') ||
    clean.includes('పాడి') ||
    clean.includes('ಡೈರಿ') ||
    clean.includes('ಹಾಲು') ||
    clean.includes('ಹಸು')
  ) {
    return 'dairy';
  }

  // 2. Tailoring Keywords
  if (
    clean.includes('tailor') ||
    clean.includes('tailoring') ||
    clean.includes('stitch') ||
    clean.includes('stitching') ||
    clean.includes('boutique') ||
    clean.includes('garment') ||
    clean.includes('garments') ||
    clean.includes('sewing') ||
    clean.includes('dress design') ||
    clean.includes('embroidery') ||
    clean.includes('टेलर') ||
    clean.includes('टेलरिंग') ||
    clean.includes('सिलाई') ||
    clean.includes('कपड़े सिलाई') ||
    clean.includes('शिंपी') ||
    clean.includes('శిక్షణ') ||
    clean.includes('టైలరింగ్') ||
    clean.includes('కుట్టుపని') ||
    clean.includes('కుట్టు') ||
    clean.includes('టెక్స్‌టైల్') ||
    clean.includes('ಟೈಲರಿಂಗ್') ||
    clean.includes('ಹೊಲಿಗೆ') ||
    clean.includes('ಬಟ್ಟೆ ಹೊಲಿಗೆ')
  ) {
    return 'tailoring';
  }

  // 3. Retail / Kirana Keywords
  if (
    clean.includes('kirana') ||
    clean.includes('grocery') ||
    clean.includes('general store') ||
    clean.includes('provision store') ||
    clean.includes('supermarket') ||
    clean.includes('retail shop') ||
    clean.includes('retail store') ||
    clean.includes('shop') ||
    clean.includes('store') ||
    clean.includes('fmcg') ||
    clean.includes('किराना') ||
    clean.includes('किराने') ||
    clean.includes('दुकान') ||
    clean.includes('जनरल स्टोर') ||
    clean.includes('रेशन') ||
    clean.includes('కిరాణా') ||
    clean.includes('కిరాణ') ||
    clean.includes('దుకాణం') ||
    clean.includes('షాప్') ||
    clean.includes('అంగడి') ||
    clean.includes('ಕಿರಾಣಿ') ||
    clean.includes('ಕಿರಾಣಿ ಅಂಗಡಿ') ||
    clean.includes('ಅಂಗಡಿ')
  ) {
    return 'retail';
  }

  // 4. Poultry / Chicken Keywords
  if (
    clean.includes('poultry') ||
    clean.includes('chicken') ||
    clean.includes('broiler') ||
    clean.includes('layer farm') ||
    clean.includes('egg farm') ||
    clean.includes('bird farm') ||
    clean.includes('hatchery') ||
    clean.includes('पोल्ट्री') ||
    clean.includes('कुक्कुटपालन') ||
    clean.includes('मुर्गी पालन') ||
    clean.includes('चिकन') ||
    clean.includes('పౌల్ట్రీ') ||
    clean.includes('కోళ్ల ఫారం') ||
    clean.includes('కోళ్ల పెంపకం') ||
    clean.includes('చికెన్') ||
    clean.includes('ಕೋಳಿ ಫಾರಂ') ||
    clean.includes('ಕೋಳಿ ಸಾಕಣೆ')
  ) {
    return 'poultry';
  }

  // 5. Custom / Other Micro-Enterprises
  if (
    clean.includes('manufacturing') ||
    clean.includes('workshop') ||
    clean.includes('repair') ||
    clean.includes('processing') ||
    clean.includes('enterprise') ||
    clean.includes('business') ||
    clean.includes('उद्योग') ||
    clean.includes('व्यवसाय') ||
    clean.includes('వ్యాపారం') ||
    clean.includes('ಉದ್ಯಮ')
  ) {
    return 'custom';
  }

  return undefined;
}

/**
 * Builds a professional structured business idea description based on extracted fields.
 */
function buildStructuredDescription(
  category: BusinessCategoryKey,
  rawText: string,
  scaleQuantity?: string,
  capital?: number
): string {
  const capitalClause = capital ? ` with proposed own capital of ₹${capital.toLocaleString('en-IN')}` : '';
  const scaleClause = scaleQuantity ? ` (${scaleQuantity})` : '';

  switch (category) {
    case 'dairy':
      return `Commercial Micro Dairy Farming Unit${scaleClause} with high-yield milch animals, hygienic shed and local milk cooperative connectivity${capitalClause}.`;
    case 'tailoring':
      return `Apparel & Custom Tailoring Production Unit${scaleClause} with industrial stitching machines, boutique cutting tables and local customer order servicing${capitalClause}.`;
    case 'retail':
      return `Rural Kirana & Essential Daily Goods Retail Store${scaleClause} with modular display shelving, FMCG inventory and digital billing${capitalClause}.`;
    case 'poultry':
      return `Broiler / Country Chicken Micro Poultry Farm${scaleClause} with climate-controlled shed, automatic feeding/drinker systems and wholesale mandi offtake${capitalClause}.`;
    case 'custom':
    default:
      return rawText.trim() || 'Micro-enterprise operational unit with verified local market demand and institutional credit alignment.';
  }
}

/**
 * Main Natural Language Business Command Parser
 * Parses natural speech or typed text into a structured, validated business input definition.
 */
export function parseBusinessVoiceCommand(
  rawTranscript: string,
  _activeLanguage: SupportedLanguage = 'en'
): ParsedBusinessCommand {
  const text = rawTranscript.trim();
  const clean = text.toLowerCase();

  // 1. Empty or Extremely Short Input
  if (!text || text.length < 3) {
    return {
      rawTranscript: text,
      confidence: 'INSUFFICIENT',
      missingFields: ['category', 'capital', 'description'],
      feedbackMessage: 'No speech or input detected. Please state the business you want to start and your available capital.'
    };
  }

  // 2. Generic Insufficient Input ("I want to start a business", "नया व्यापार करना है")
  const isGenericOnly =
    clean === 'i want to start a business' ||
    clean === 'i want to start a business.' ||
    clean === 'i want to do business' ||
    clean === 'i want to start business' ||
    clean === 'business' ||
    clean === 'start a business' ||
    clean === 'business plan' ||
    clean === 'start business' ||
    clean === 'नया व्यवसाय' ||
    clean === 'व्यापार करना है' ||
    clean === 'వ్యాపారం చేయాలి' ||
    clean === 'వ్యాపారం ప్రారంభించాలి' ||
    clean === 'ಉದ್ಯಮ ಆರಂಭಿಸಬೇಕು';

  if (isGenericOnly) {
    return {
      rawTranscript: text,
      confidence: 'INSUFFICIENT',
      missingFields: ['category', 'capital'],
      feedbackMessage: 'Please specify the type of business you want to start (e.g. Dairy Farming, Kirana Store, Tailoring, or Poultry).'
    };
  }

  // 3. Ambiguity Check
  const ambiguityCheck = checkAmbiguity(text);
  if (ambiguityCheck.isAmbiguous) {
    return {
      rawTranscript: text,
      confidence: 'AMBIGUOUS',
      ambiguityQuestion: ambiguityCheck.question,
      ambiguityOptions: ambiguityCheck.options,
      missingFields: ['category'],
      feedbackMessage: ambiguityCheck.question
    };
  }

  // 4. Extract Category, Capital, and Scale
  const category = detectCategory(text);
  const capitalResult = extractCapitalAmount(text);
  const scaleQuantity = extractScaleQuantity(text);

  const missingFields: Array<'category' | 'capital' | 'description'> = [];
  if (!category) missingFields.push('category');
  if (!capitalResult?.amount) missingFields.push('capital');

  if (!category) {
    return {
      rawTranscript: text,
      confidence: 'INSUFFICIENT',
      capital: capitalResult?.amount,
      capitalFormatted: capitalResult?.formatted,
      missingFields: ['category'],
      feedbackMessage: 'Could not clearly recognize the business category. Please mention Dairy, Retail, Tailoring, or Poultry.'
    };
  }

  const categoryLabel = CATEGORY_LABELS[category];
  const businessIdea = buildStructuredDescription(category, text, scaleQuantity, capitalResult?.amount);

  return {
    rawTranscript: text,
    confidence: 'CLEAR',
    category,
    categoryLabel,
    capital: capitalResult?.amount,
    capitalFormatted: capitalResult?.formatted,
    scaleQuantity,
    businessIdea,
    missingFields,
    feedbackMessage: `Understood: ${categoryLabel}${capitalResult?.formatted ? ` with ${capitalResult.formatted} capital` : ''}${scaleQuantity ? ` (${scaleQuantity})` : ''}.`
  };
}
