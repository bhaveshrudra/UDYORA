import {
  CanonicalBusinessCategory,
  BusinessIntent,
  LocationResolution,
  LanguageTag
} from '../types';

export interface ParsedBusinessIntent {
  businessCategory: CanonicalBusinessCategory | null;
  businessName?: string;
  businessDescription: string;
  businessIntent: BusinessIntent;
  availableCapital: number | null;
  locationMentioned?: string | null;
  confidence: {
    category: number;
    capital: number;
    location: number;
  };
  missingFields: ('category' | 'capital' | 'location')[];
  isCorrection?: boolean;
  correctionField?: 'capital' | 'category' | 'intent';
  rawInput: string;
}

/**
 * Deterministic Natural Language Parser for Indian Vernacular & English Business Inputs
 */
export const businessIntentParser = {
  /**
   * Main parsing entry point
   */
  parse(
    input: string,
    existingLocation?: LocationResolution | null,
    currentLanguage?: LanguageTag
  ): ParsedBusinessIntent {
    const raw = (input || '').trim();
    const text = raw.toLowerCase();

    // 1. Detect Conversational Voice Edit Commands
    const correctionCheck = this.detectCorrection(text);
    if (correctionCheck.isCorrection) {
      return {
        businessCategory: correctionCheck.category || null,
        businessDescription: raw,
        businessIntent: 'START',
        availableCapital: correctionCheck.capital || null,
        locationMentioned: existingLocation?.localityName || null,
        confidence: {
          category: correctionCheck.category ? 0.95 : 0.5,
          capital: correctionCheck.capital ? 0.95 : 0.5,
          location: 0.9
        },
        missingFields: [],
        isCorrection: true,
        correctionField: correctionCheck.correctionField,
        rawInput: raw
      };
    }

    // 2. Extract Business Category
    const categoryResult = this.extractCategory(text);

    // 3. Extract Capital (deterministic numeric normalization)
    const capitalResult = this.extractCapital(text);

    // 4. Extract Intent (START / EXPAND / IMPROVE / RESTART)
    const intentResult = this.extractIntent(text);

    // 5. Extract Location Mention
    const locationMentioned = this.extractLocation(text, existingLocation);

    // 6. Identify Missing Fields
    const missingFields: ('category' | 'capital' | 'location')[] = [];
    if (!categoryResult.category) {
      missingFields.push('category');
    }
    if (capitalResult.capital === null) {
      missingFields.push('capital');
    }
    if (!existingLocation && !locationMentioned) {
      missingFields.push('location');
    }

    return {
      businessCategory: categoryResult.category,
      businessName: categoryResult.category ? `${categoryResult.category} Enterprise` : 'Rural Business Unit',
      businessDescription: raw,
      businessIntent: intentResult,
      availableCapital: capitalResult.capital,
      locationMentioned: locationMentioned || existingLocation?.localityName || null,
      confidence: {
        category: categoryResult.confidence,
        capital: capitalResult.confidence,
        location: existingLocation ? 0.98 : locationMentioned ? 0.85 : 0.4
      },
      missingFields,
      isCorrection: false,
      rawInput: raw
    };
  },

  /**
   * Deterministic Capital Normalization (lakh, L, k, thousand, crores, Telugu, Hindi, Marathi, Kannada)
   */
  extractCapital(text: string): { capital: number | null; confidence: number } {
    // 1. Direct Regex checks for Indian currency patterns
    // e.g. "1.5 lakh", "1.5L", "2 lakh", "10 lakh", "₹ 1,00,000", "50k", "50000"
    const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b/i);
    if (lakhMatch) {
      const num = parseFloat(lakhMatch[1]);
      return { capital: Math.round(num * 100000), confidence: 0.98 };
    }

    const croreMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)\b/i);
    if (croreMatch) {
      const num = parseFloat(croreMatch[1]);
      return { capital: Math.round(num * 10000000), confidence: 0.98 };
    }

    const thousandMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k)\b/i);
    if (thousandMatch) {
      const num = parseFloat(thousandMatch[1]);
      return { capital: Math.round(num * 1000), confidence: 0.95 };
    }

    // Direct rupee numbers e.g. "₹ 100000", "₹1,00,000", "100000", "50000"
    const rawNumberMatch = text.match(/(?:rs\.?|inr|₹)?\s*(\d{1,3}(?:,\d{2,3})*|\d{4,9})/i);
    if (rawNumberMatch) {
      const clean = rawNumberMatch[1].replace(/,/g, '');
      const parsed = parseInt(clean, 10);
      if (!isNaN(parsed) && parsed >= 5000) {
        return { capital: parsed, confidence: 0.95 };
      }
    }

    // Multilingual Vernacular Word Matching:
    // Telugu: ఒక లక్ష (1L), రెండు లక్షలు (2L), ఒకటిన్నర లక్ష (1.5L), యాభై వేలు (50k)
    if (text.includes('ఒకటిన్నర లక్ష') || text.includes('ఒకటిన్నర లచ్చ') || text.includes('1.5 లక్ష')) {
      return { capital: 150000, confidence: 0.96 };
    }
    if (text.includes('ఒక లక్ష') || text.includes('ఒక లచ్చ') || text.includes('one lakh') || text.includes('వన్‌ లాఖ్')) {
      return { capital: 100000, confidence: 0.96 };
    }
    if (text.includes('రెండు లక్షలు') || text.includes('రెండు లచ్చలు') || text.includes('two lakh') || text.includes('టూ లాఖ్')) {
      return { capital: 200000, confidence: 0.96 };
    }
    if (text.includes('మూడు లక్షలు') || text.includes('three lakh')) {
      return { capital: 300000, confidence: 0.96 };
    }
    if (text.includes('ఐదు లక్షలు') || text.includes('five lakh')) {
      return { capital: 500000, confidence: 0.96 };
    }
    if (text.includes('యాభై వేలు') || text.includes('fifty thousand')) {
      return { capital: 50000, confidence: 0.95 };
    }

    // Hindi: एक लाख (1L), दो लाख (2L), डेढ़ लाख (1.5L), पचास हजार (50k), पाँच लाख (5L)
    if (text.includes('डेढ़ लाख') || text.includes('एक लाख पचास हजार')) {
      return { capital: 150000, confidence: 0.96 };
    }
    if (text.includes('एक लाख') || text.includes('1 लाख')) {
      return { capital: 100000, confidence: 0.96 };
    }
    if (text.includes('दो लाख') || text.includes('2 लाख')) {
      return { capital: 200000, confidence: 0.96 };
    }
    if (text.includes('तीन लाख')) {
      return { capital: 300000, confidence: 0.96 };
    }
    if (text.includes('पाँच लाख') || text.includes('पांच लाख')) {
      return { capital: 500000, confidence: 0.96 };
    }
    if (text.includes('पचास हजार') || text.includes('50 हजार')) {
      return { capital: 50000, confidence: 0.95 };
    }

    // Marathi: एक लाख (1L), दोन लाख (2L), दीड लाख (1.5L), पन्नास हजार (50k)
    if (text.includes('दीड लाख')) {
      return { capital: 150000, confidence: 0.96 };
    }
    if (text.includes('दोन लाख')) {
      return { capital: 200000, confidence: 0.96 };
    }
    if (text.includes('पन्नास हजार')) {
      return { capital: 50000, confidence: 0.95 };
    }

    // Kannada: ಒಂದು ಲಕ್ಷ (1L), ಎರಡು ಲಕ್ಷ (2L), ಒಂದೂವರೆ ಲಕ್ಷ (1.5L), ಐವತ್ತು ಸಾವಿರ (50k)
    if (text.includes('ಒಂದೂವರೆ ಲಕ್ಷ')) {
      return { capital: 150000, confidence: 0.96 };
    }
    if (text.includes('ಒಂದು ಲಕ್ಷ')) {
      return { capital: 100000, confidence: 0.96 };
    }
    if (text.includes('ಎರಡು ಲಕ್ಷ')) {
      return { capital: 200000, confidence: 0.96 };
    }
    if (text.includes('ಐವತ್ತು ಸಾವಿರ')) {
      return { capital: 50000, confidence: 0.95 };
    }

    return { capital: null, confidence: 0 };
  },

  /**
   * Deterministic Business Category Mapping across 5 Languages
   */
  extractCategory(text: string): { category: CanonicalBusinessCategory | null; confidence: number } {
    // 1. Dairy
    const dairyKeywords = [
      'dairy',
      'milk',
      'cows',
      'cow',
      'buffalo',
      'buffaloes',
      'milch',
      'chilling',
      'cattle',
      'dung',
      'పాడి',
      'డైరీ',
      'పాలు',
      'గేదెలు',
      'ఆవులు',
      'పాల',
      'दूध',
      'डेयरी',
      'गाय',
      'भैंस',
      'दुग्ध',
      'गोपालन',
      'हैकू',
      'दुग्धव्यवसाय',
      'गाई',
      'म्हशी',
      'ಹೈನುಗಾರಿಕೆ',
      'ಹಾಲು',
      'ಹಸು',
      'ದನ'
    ];
    if (dairyKeywords.some((kw) => text.includes(kw))) {
      return { category: 'Dairy', confidence: 0.96 };
    }

    // 2. Retail / Kirana
    const retailKeywords = [
      'kirana',
      'retail',
      'grocery',
      'provisions',
      'general store',
      'supermarket',
      'fmcg',
      'shop',
      'store',
      'కిరాణా',
      'దుకాణం',
      'షాప్',
      'సరుకులు',
      'किराना',
      'दुकान',
      'जनरल स्टोर',
      'राशन',
      'दुकानदार',
      'किराणा दुकान',
      'ಕಿರಾಣಿ',
      'ಅಂಗಡಿ',
      'ದಿನಸಿ'
    ];
    if (retailKeywords.some((kw) => text.includes(kw))) {
      return { category: 'Retail', confidence: 0.94 };
    }

    // 3. Tailoring / Boutique
    const tailoringKeywords = [
      'tailor',
      'tailoring',
      'stitching',
      'boutique',
      'embroidery',
      'garment',
      'garments',
      'textile',
      'apparel',
      'dress',
      'sewing',
      'కుట్టు',
      'టైలరింగ్',
      'బొటిక్',
      'దుస్తులు',
      'सिलाई',
      'टेलरिंग',
      'बुटीक',
      'कपड़ा',
      'टेलर',
      'शिलाई',
      'टेलरिंग व्यवसाय',
      'ಟೈಲರಿಂಗ್',
      'ಹೊಲಿಗೆ',
      'ಉಡುಪು'
    ];
    if (tailoringKeywords.some((kw) => text.includes(kw))) {
      return { category: 'Tailoring', confidence: 0.95 };
    }

    // 4. Poultry
    const poultryKeywords = [
      'poultry',
      'chicken',
      'broiler',
      'layer',
      'birds',
      'hatchery',
      'eggs',
      'కోళ్లు',
      'కోళ్ల ఫారం',
      'పౌల్ట్రీ',
      'కోడి',
      'पोल्ट्री',
      'मुर्गी',
      'मुर्गीपालन',
      'ब्रोइलर',
      'अंडा',
      'कुक्कुटपालन',
      'ಕೋಳಿ',
      'ಕೋಳಿ ಸಾಕಾಣಿಕೆ',
      'ಕುಕ್ಕುಟ'
    ];
    if (poultryKeywords.some((kw) => text.includes(kw))) {
      return { category: 'Poultry', confidence: 0.96 };
    }

    // 5. Agro-processing
    const agroKeywords = [
      'agro',
      'flour mill',
      'dal mill',
      'oil mill',
      'spices',
      'chilli powder',
      'food processing',
      'గిర్నీ',
      'ఆటా చक्की',
      'पिसाई',
      'चक्की',
      'ಹಿಟ್ಟಿನ ಗಿರಣಿ'
    ];
    if (agroKeywords.some((kw) => text.includes(kw))) {
      return { category: 'Agro-processing', confidence: 0.90 };
    }

    return { category: null, confidence: 0 };
  },

  /**
   * Deterministic Business Intent Extractor
   */
  extractIntent(text: string): BusinessIntent {
    if (
      text.includes('expand') ||
      text.includes('scale up') ||
      text.includes('పెంచాలి') ||
      text.includes('విస్తరించాలి') ||
      text.includes('बढ़ाना') ||
      text.includes('विस्तार') ||
      text.includes('ಹೆಚ್ಚಿಸಲು')
    ) {
      return 'EXPAND';
    }
    if (
      text.includes('improve') ||
      text.includes('upgrade') ||
      text.includes('మెరుగుపరచాలి') ||
      text.includes('सुधार')
    ) {
      return 'IMPROVE';
    }
    if (
      text.includes('restart') ||
      text.includes('reopen') ||
      text.includes('మళ్లీ ప్రారంభించాలి') ||
      text.includes('फिर से शुरू')
    ) {
      return 'RESTART';
    }
    return 'START';
  },

  /**
   * Location Extraction from Text
   */
  extractLocation(text: string, existingLocation?: LocationResolution | null): string | null {
    if (text.includes('shamshabad') || text.includes('శంషాబాద్') || text.includes('शामशाबाद')) {
      return 'Shamshabad';
    }
    if (text.includes('khed shivapur') || text.includes('खेड शिवापूर')) {
      return 'Khed Shivapur';
    }
    if (text.includes('gejjalagere') || text.includes('ಗೆಜ್ಜಲಗೆರೆ')) {
      return 'Gejjalagere';
    }
    if (text.includes('baramati') || text.includes('बारामती')) {
      return 'Baramati';
    }
    if (text.includes('gajwel') || text.includes('గజ్వేల్')) {
      return 'Gajwel';
    }
    return existingLocation?.localityName || null;
  },

  /**
   * Detect Conversational Corrections (e.g. "Actually capital is two lakh")
   */
  detectCorrection(text: string): {
    isCorrection: boolean;
    correctionField?: 'capital' | 'category' | 'intent';
    capital?: number;
    category?: CanonicalBusinessCategory;
  } {
    const isCorrectionTrigger =
      text.includes('actually') ||
      text.includes('change capital') ||
      text.includes('change business') ||
      text.includes('instead') ||
      text.includes('not ') ||
      text.includes('కాదు') ||
      text.includes('మార్చండి') ||
      text.includes('बदलें') ||
      text.includes('बदला');

    if (!isCorrectionTrigger) {
      return { isCorrection: false };
    }

    if (text.includes('capital') || text.includes('పెట్టుబడి') || text.includes('पूँजी') || text.includes('भांडवल')) {
      const cap = this.extractCapital(text);
      if (cap.capital) {
        return { isCorrection: true, correctionField: 'capital', capital: cap.capital };
      }
    }

    const cat = this.extractCategory(text);
    if (cat.category) {
      return { isCorrection: true, correctionField: 'category', category: cat.category };
    }

    return { isCorrection: false };
  }
};
