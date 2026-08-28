import { SupportedLanguage } from '../i18n/types';

export const TTS_LOCALES: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  te: 'te-IN',
  kn: 'kn-IN'
};

export const MISSING_VOICE_MESSAGES: Record<SupportedLanguage, string> = {
  en: 'English voice is not available on this device. Please install an English speech voice in Android settings.',
  hi: 'हिन्दी वॉयस इस डिवाइस पर उपलब्ध नहीं है। कृपया सेटिंग्स से हिन्दी आवाज़ इंस्टॉल करें।',
  mr: 'मराठी व्हॉईस या डिव्हाइसवर उपलब्ध नाही. कृपया सेटिंग्जमधून मराठी आवाज़ इंस्टॉल करा.',
  te: 'ఈ పరికరంలో తెలుగు వాయిస్ అందుబాటులో లేదు. దయచేసి సెట్టింగ్‌ల నుండి తెలుగు వాయిస్‌ని ఇన్‌స్టాల్ చేయండి.',
  kn: 'ಈ ಸಾಧನದಲ್ಲಿ ಕನ್ನಡ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಸೆಟ್ಟಿಂಗ್‌ಗಳಿಂದ ಕನ್ನಡ ಧ್ವನಿಯನ್ನು ಸ್ಥಾಪಿಸಿ.'
};

let currentSpeakingUtterance: SpeechSynthesisUtterance | null = null;

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
      const vList = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = null;
      resolve(vList);
    };

    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

    // Timeout fallback if onvoiceschanged doesn't trigger
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        window.speechSynthesis.onvoiceschanged = null;
        resolve(window.speechSynthesis.getVoices() || []);
      }
    }, 350);
  });
}

export function findMatchingVoice(
  voices: SpeechSynthesisVoice[],
  language: SupportedLanguage
): SpeechSynthesisVoice | null {
  const targetLocale = TTS_LOCALES[language] || 'en-IN';
  const langPrefix = language.toLowerCase();

  // 1. Exact locale match (e.g. te-IN)
  const exact = voices.find((v) => v.lang.replace('_', '-').toLowerCase() === targetLocale.toLowerCase());
  if (exact) return exact;

  // 2. Base language prefix match (e.g. te)
  const prefixMatch = voices.find((v) => {
    const cleanLang = v.lang.replace('_', '-').toLowerCase();
    return cleanLang.startsWith(langPrefix) || cleanLang.startsWith(targetLocale.slice(0, 2).toLowerCase());
  });

  return prefixMatch || null;
}

export async function logVoiceAvailabilityDiagnostic(): Promise<Record<SupportedLanguage, { locale: string; available: boolean; voiceName?: string }>> {
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

  if (import.meta.env?.DEV) {
    console.table(
      Object.entries(report).map(([lang, info]) => ({
        Language: lang.toUpperCase(),
        Locale: info.locale,
        'Voice Available': info.available ? 'YES' : 'NO',
        'Selected Voice Name': info.voiceName || 'None'
      }))
    );
  }

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
 * Traces exact Listen flow, enforces LanguageContext, selects device voice without silent English fallback.
 */
export async function speakLocalizedText({
  text,
  language,
  onStart,
  onEnd,
  onError
}: SpeakOptions): Promise<SpeakResult> {
  if (!isSpeechSynthesisAvailable()) {
    const errMsg = 'Voice output is unavailable in this browser environment.';
    if (onError) onError(errMsg);
    return { success: false, message: errMsg };
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

    // TRACE LOGS
    if (import.meta.env?.DEV) {
      console.log(`[TTS DEBUG] selected language = ${language}`);
      console.log(`[TTS DEBUG] requested locale = ${targetLocale}`);
      console.log(
        `[TTS DEBUG] available voices =`,
        voices.map((v) => `${v.name} (${v.lang})`)
      );
      console.log(
        `[TTS DEBUG] matching voices =`,
        matchedVoice ? `${matchedVoice.name} (${matchedVoice.lang})` : 'NONE'
      );
      console.log(
        `[TTS DEBUG] selected voice =`,
        matchedVoice ? matchedVoice.voiceURI || matchedVoice.name : 'NONE'
      );
    }

    // Run voice availability diagnostic table in dev mode
    logVoiceAvailabilityDiagnostic();

    // 3. Strict voice guard: If target language voice is missing, do NOT fallback to English accent
    if (!matchedVoice && language !== 'en') {
      const fallbackWarning = MISSING_VOICE_MESSAGES[language] || MISSING_VOICE_MESSAGES.en;
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

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      if (import.meta.env?.DEV) {
        console.log(`[TTS DEBUG] Speech.speak called`);
      }
      if (onStart) onStart();
    };

    utterance.onend = () => {
      currentSpeakingUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (event: any) => {
      currentSpeakingUtterance = null;
      if (import.meta.env?.DEV) {
        console.log(`[TTS DEBUG] speech error =`, event);
      }
      const errTxt = 'Voice response unavailable. Try again.';
      if (onError) onError(errTxt);
    };

    currentSpeakingUtterance = utterance;
    window.speechSynthesis.speak(utterance);

    return { success: true };
  } catch (err: any) {
    if (import.meta.env?.DEV) {
      console.log(`[TTS DEBUG] speech error =`, err);
    }
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
      window.location.href = 'intent://com.android.settings.TTS_SETTINGS#Intent;scheme=android.settings;action=com.android.settings.TTS_SETTINGS;end';
      return true;
    }
  } catch (err) {
    console.warn('[TTS] Speech settings intent error:', err);
  }

  return false;
}
