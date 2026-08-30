import { useState, useEffect, useCallback } from 'react';
import { SupportedLanguage } from '../i18n/types';

export const TTS_LOCALES: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  te: 'te-IN',
  kn: 'kn-IN'
};

export const LANGUAGE_NAMES: Record<SupportedLanguage, { en: string; native: string }> = {
  en: { en: 'English', native: 'English' },
  hi: { en: 'Hindi', native: 'हिन्दी' },
  mr: { en: 'Marathi', native: 'मराठी' },
  te: { en: 'Telugu', native: 'తెలుగు' },
  kn: { en: 'Kannada', native: 'ಕನ್ನಡ' }
};

export const VOICE_UNAVAILABLE_NOTICES: Record<SupportedLanguage, { message: string; action: string }> = {
  en: {
    message: 'English voice is not available on this device. The text response is still available.',
    action: 'Continue with Text'
  },
  hi: {
    message: 'इस डिवाइस पर हिन्दी आवाज़ उपलब्ध नहीं है। टेक्स्ट उत्तर अभी भी उपलब्ध है।',
    action: 'टेक्स्ट के साथ जारी रखें'
  },
  mr: {
    message: 'या डिव्हाइसवर मराठी आवाज उपलब्ध नाही. मजकूर उत्तर उपलब्ध आहे.',
    action: 'मजकुरासह पुढे जा'
  },
  te: {
    message: 'ఈ పరికరంలో తెలుగు వాయిస్ అందుబాటులో లేదు. టెక్స్ట్ ప్రతిస్పందన అందుబాటులో ఉంది.',
    action: 'టెక్స్ట్‌తో కొనసాగించండి'
  },
  kn: {
    message: 'ಈ ಸಾಧನದಲ್ಲಿ ಕನ್ನಡ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ. ಪಠ್ಯ ಉತ್ತರ ಲಭ್ಯವಿದೆ.',
    action: 'ಪಠ್ಯದೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ'
  }
};

export const LISTEN_BUTTON_LABELS: Record<
  SupportedLanguage,
  { listen: string; speaking: string; paused: string; unavailable: string; textOnly: string }
> = {
  en: {
    listen: 'Listen',
    speaking: 'Speaking...',
    paused: 'Paused',
    unavailable: 'Voice unavailable',
    textOnly: 'Text only'
  },
  hi: {
    listen: 'सुनें',
    speaking: 'बोल रहा है...',
    paused: 'रुका हुआ',
    unavailable: 'वॉयस अनुपलब्ध',
    textOnly: 'केवल टेक्स्ट'
  },
  mr: {
    listen: 'ऐका',
    speaking: 'बोलत आहे...',
    paused: 'थांबवले',
    unavailable: 'व्हॉईस अनुपलब्ध',
    textOnly: 'फक्त मजकूर'
  },
  te: {
    listen: 'వినండి',
    speaking: 'వినిపిస్తోంది...',
    paused: 'పాజ్ చేయబడింది',
    unavailable: 'వాయిస్ అందుబాటులో లేదు',
    textOnly: 'టెక్స్ట్ మాత్రమే'
  },
  kn: {
    listen: 'ಕೇಳಿ',
    speaking: 'ಮಾತನಾಡುತ್ತಿದೆ...',
    paused: 'ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ',
    unavailable: 'ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ',
    textOnly: 'ಪಠ್ಯ ಮಾತ್ರ'
  }
};

export const MISSING_VOICE_MESSAGES: Record<SupportedLanguage, string> = {
  en: VOICE_UNAVAILABLE_NOTICES.en.message,
  hi: VOICE_UNAVAILABLE_NOTICES.hi.message,
  mr: VOICE_UNAVAILABLE_NOTICES.mr.message,
  te: VOICE_UNAVAILABLE_NOTICES.te.message,
  kn: VOICE_UNAVAILABLE_NOTICES.kn.message
};

export type VoiceAvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'LOADING';

export interface VoiceStatusResult {
  language: SupportedLanguage;
  locale: string;
  status: VoiceAvailabilityStatus;
  isAvailable: boolean;
  voiceName?: string;
  voiceURI?: string;
}

let currentSpeakingUtterance: SpeechSynthesisUtterance | null = null;
const voiceChangeSubscribers = new Set<(voices: SpeechSynthesisVoice[]) => void>();

export interface SpeakOptions {
  text: string;
  language: SupportedLanguage;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (errMessage: string) => void;
}

export interface SpeakResult {
  success: boolean;
  isVoiceUnavailable?: boolean;
  message?: string;
}

export function isSpeechSynthesisAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof window.speechSynthesis !== 'undefined';
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
    currentSpeakingUtterance = null;
  }
}

export const stopVoiceOutput = stopSpeaking;

export function pauseVoiceOutput(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.pause();
    } catch {}
  }
}

export function resumeVoiceOutput(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.resume();
    } catch {}
  }
}

/**
 * Retrieves voices asynchronously handling browser voice loading events.
 */
export function getAvailableVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSynthesisAvailable()) return Promise.resolve([]);

  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing && existing.length > 0) {
      resolve(existing);
      return;
    }

    let resolved = false;
    const handleVoicesChanged = () => {
      if (resolved) return;
      resolved = true;
      const vList = window.speechSynthesis.getVoices() || [];
      resolve(vList);
    };

    window.speechSynthesis.addEventListener?.('voiceschanged', handleVoicesChanged);
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

    // Timeout fallback if onvoiceschanged doesn't trigger
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        const vList = window.speechSynthesis.getVoices() || [];
        resolve(vList);
      }
    }, 400);
  });
}

/**
 * Canonical function to find matching voice for a given language.
 * Enforces STRICT language boundary:
 * - English voices may match en-IN, en-US, en-GB, etc.
 * - Telugu voices will ONLY match te-IN or Telugu-named voices. NEVER silently falls back to English/Hindi.
 * - Hindi, Marathi, Kannada voices similarly will NEVER cross-pollute into other languages.
 */
export function findMatchingVoice(
  voices: SpeechSynthesisVoice[],
  language: SupportedLanguage
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const targetLocale = TTS_LOCALES[language] || 'en-IN';
  const langPrefix = language.toLowerCase();

  // 1. Exact locale match (e.g. te-IN or te_in)
  const exact = voices.find((v) => {
    const vLang = (v.lang || '').replace('_', '-').toLowerCase();
    return vLang === targetLocale.toLowerCase();
  });
  if (exact) return exact;

  // 2. Base language prefix match (e.g. te or te-*)
  const prefixMatch = voices.find((v) => {
    const vLang = (v.lang || '').replace('_', '-').toLowerCase();
    return vLang === langPrefix || vLang.startsWith(`${langPrefix}-`);
  });
  if (prefixMatch) return prefixMatch;

  // 3. Name-based search for native language indicators (e.g., "Telugu", "తెలుగు", "Hindi", "हिन्दी")
  const nativeNameKeywords: Record<SupportedLanguage, string[]> = {
    te: ['telugu', 'తెలుగు'],
    hi: ['hindi', 'हिन्दी', 'हिंदी'],
    mr: ['marathi', 'मराठी'],
    kn: ['kannada', 'ಕನ್ನಡ'],
    en: ['english']
  };

  const keywords = nativeNameKeywords[language] || [];
  const nameMatch = voices.find((v) => {
    const nameLower = (v.name || '').toLowerCase();
    return keywords.some((kw) => nameLower.includes(kw.toLowerCase()));
  });
  if (nameMatch) return nameMatch;

  // 4. Dialect fallback ONLY for English
  if (language === 'en') {
    const englishFallback = voices.find((v) => {
      const vLang = (v.lang || '').replace('_', '-').toLowerCase();
      return vLang.startsWith('en');
    });
    if (englishFallback) return englishFallback;
  }

  // 5. Non-English languages MUST NOT silently fall back to English/other languages
  return null;
}

/**
 * Canonical helper: get available voice instance for language
 */
export function getAvailableVoiceForLanguage(
  language: SupportedLanguage,
  customVoices?: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (customVoices && customVoices.length > 0) {
    return findMatchingVoice(customVoices, language);
  }
  if (!isSpeechSynthesisAvailable()) return null;
  const currentVoices = window.speechSynthesis.getVoices() || [];
  return findMatchingVoice(currentVoices, language);
}

/**
 * Canonical helper: boolean check whether browser/device can speak the language
 */
export function canSpeakLanguage(
  language: SupportedLanguage,
  customVoices?: SpeechSynthesisVoice[]
): boolean {
  return getAvailableVoiceForLanguage(language, customVoices) !== null;
}

/**
 * Canonical helper: get detailed voice status result for language
 */
export function getVoiceStatusForLanguage(
  language: SupportedLanguage,
  customVoices?: SpeechSynthesisVoice[]
): VoiceStatusResult {
  const targetLocale = TTS_LOCALES[language] || 'en-IN';
  const matchedVoice = getAvailableVoiceForLanguage(language, customVoices);

  if (matchedVoice) {
    return {
      language,
      locale: targetLocale,
      status: 'AVAILABLE',
      isAvailable: true,
      voiceName: matchedVoice.name,
      voiceURI: matchedVoice.voiceURI
    };
  }

  return {
    language,
    locale: targetLocale,
    status: 'UNAVAILABLE',
    isAvailable: false
  };
}

/**
 * Global subscriber for voice changes
 */
export function subscribeVoicesChanged(callback: (voices: SpeechSynthesisVoice[]) => void): () => void {
  voiceChangeSubscribers.add(callback);

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    const notify = () => {
      const vList = window.speechSynthesis.getVoices() || [];
      voiceChangeSubscribers.forEach((cb) => cb(vList));
    };

    window.speechSynthesis.addEventListener?.('voiceschanged', notify);
    window.speechSynthesis.onvoiceschanged = notify;
  }

  return () => {
    voiceChangeSubscribers.delete(callback);
  };
}

/**
 * React hook to reactively check and observe voice availability for any language
 */
export function useVoiceAvailability(language: SupportedLanguage) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      return window.speechSynthesis.getVoices() || [];
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => voices.length === 0);

  const checkVoices = useCallback(() => {
    if (!isSpeechSynthesisAvailable()) {
      setIsLoading(false);
      return;
    }
    const current = window.speechSynthesis.getVoices() || [];
    if (current.length > 0) {
      setVoices(current);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkVoices();

    if (!isSpeechSynthesisAvailable()) {
      setIsLoading(false);
      return;
    }

    const handleVoicesChanged = () => {
      const updated = window.speechSynthesis.getVoices() || [];
      setVoices(updated);
      setIsLoading(false);
    };

    window.speechSynthesis.addEventListener?.('voiceschanged', handleVoicesChanged);
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

    // Fallback timer for lazy-loaded engines
    const timer = setTimeout(() => {
      checkVoices();
      setIsLoading(false);
    }, 600);

    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', handleVoicesChanged);
      clearTimeout(timer);
    };
  }, [checkVoices]);

  const voiceStatus = getVoiceStatusForLanguage(language, voices);

  return {
    status: isLoading && voices.length === 0 ? ('LOADING' as VoiceAvailabilityStatus) : voiceStatus.status,
    isAvailable: voiceStatus.isAvailable,
    isLoading: isLoading && voices.length === 0,
    voiceName: voiceStatus.voiceName,
    voiceURI: voiceStatus.voiceURI,
    locale: voiceStatus.locale,
    checkVoice: checkVoices
  };
}

export async function logVoiceAvailabilityDiagnostic(): Promise<
  Record<SupportedLanguage, { locale: string; available: boolean; voiceName?: string }>
> {
  const voices = await getAvailableVoicesAsync();
  const report: Record<SupportedLanguage, { locale: string; available: boolean; voiceName?: string }> = {
    en: { locale: 'en-IN', available: false },
    hi: { locale: 'hi-IN', available: false },
    mr: { locale: 'mr-IN', available: false },
    te: { locale: 'te-IN', available: false },
    kn: { locale: 'kn-IN', available: false }
  };

  (['en', 'hi', 'mr', 'te', 'kn'] as SupportedLanguage[]).forEach((lang) => {
    const match = findMatchingVoice(voices, lang);
    report[lang] = {
      locale: TTS_LOCALES[lang],
      available: !!match,
      voiceName: match ? match.name : undefined
    };
  });

  return report;
}

export async function getAvailableLocalizedVoices(language: SupportedLanguage): Promise<SpeechSynthesisVoice[]> {
  const voices = await getAvailableVoicesAsync();
  const matched = findMatchingVoice(voices, language);
  return matched ? [matched] : [];
}

export async function isVoiceAvailable(language: SupportedLanguage): Promise<boolean> {
  const voices = await getAvailableVoicesAsync();
  const matched = findMatchingVoice(voices, language);
  return !!matched;
}

/**
 * Centralized Multilingual Text-To-Speech (TTS) Service
 * Traces exact Listen flow, enforces LanguageContext, selects device voice without silent cross-language fallback.
 */
export async function speakLocalizedText({
  text,
  language,
  onStart,
  onEnd,
  onError
}: SpeakOptions): Promise<SpeakResult> {
  if (!isSpeechSynthesisAvailable()) {
    const errMsg = VOICE_UNAVAILABLE_NOTICES[language]?.message || 'Voice output is unavailable in this browser environment.';
    if (onError) onError(errMsg);
    return { success: false, isVoiceUnavailable: true, message: errMsg };
  }

  try {
    // 1. Stop current speaking session
    stopSpeaking();

    // 2. Unicode preservation & speech text normalization
    const cleanSpeech = text
      .replace(/[*#_`~[\]]/g, '')
      .replace(/₹\s?/g, 'Rupees ')
      .replace(/%/g, ' percent ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/•/g, '')
      .trim();

    if (!cleanSpeech) {
      return { success: false, message: 'Empty text payload' };
    }

    const targetLocale = TTS_LOCALES[language] || 'en-IN';
    const voices = await getAvailableVoicesAsync();
    const matchedVoice = findMatchingVoice(voices, language);

    // 3. Strict voice guard: If target language voice is missing, do NOT fallback to English/wrong language accent
    if (!matchedVoice) {
      const fallbackWarning = VOICE_UNAVAILABLE_NOTICES[language]?.message || VOICE_UNAVAILABLE_NOTICES.en.message;
      if (onError) onError(fallbackWarning);
      return {
        success: false,
        isVoiceUnavailable: true,
        message: fallbackWarning
      };
    }

    // 4. Create Utterance with exact language voice
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = matchedVoice ? matchedVoice.lang : targetLocale;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.voice = matchedVoice;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      currentSpeakingUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (event: any) => {
      currentSpeakingUtterance = null;
      const errTxt = 'Voice response interrupted or unavailable.';
      if (onError) onError(errTxt);
    };

    currentSpeakingUtterance = utterance;
    window.speechSynthesis.speak(utterance);

    return { success: true };
  } catch (err: any) {
    const errTxt = err?.message || 'Voice response unavailable. Try again.';
    if (onError) onError(errTxt);
    return { success: false, message: errTxt };
  }
}

// Backward compatible helper alias
export function playVoiceOutput(options: SpeakOptions): boolean {
  speakLocalizedText(options);
  return true;
}

export function openSpeechSettingsIntent(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if ((window as any).AndroidInterface && typeof (window as any).AndroidInterface.openSpeechSettings === 'function') {
      (window as any).AndroidInterface.openSpeechSettings();
      return true;
    }

    if (typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)) {
      window.location.href =
        'intent://com.android.settings.TTS_SETTINGS#Intent;scheme=android.settings;action=com.android.settings.TTS_SETTINGS;end';
      return true;
    }
  } catch (err) {
    console.warn('[TTS] Speech settings intent error:', err);
  }

  return false;
}

