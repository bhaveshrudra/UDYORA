import { SupportedLanguage } from '../i18n/types';
import { SPEECH_LANG_MAP } from './speechRecognition';

let currentSpeakingUtterance: SpeechSynthesisUtterance | null = null;

export interface SpeakOptions {
  text: string;
  language: SupportedLanguage;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export function isSpeechSynthesisAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof window.speechSynthesis !== 'undefined';
}

/**
 * Reads aloud text in the matching application language.
 * Ensures only ONE utterance speaks at any given time.
 */
export function playVoiceOutput({
  text,
  language,
  onStart,
  onEnd,
  onError
}: SpeakOptions): boolean {
  if (!isSpeechSynthesisAvailable()) {
    if (onError) onError('Voice output is unavailable in this browser environment.');
    return false;
  }

  try {
    stopVoiceOutput();

    // Clean text: strip markdown, URLs, bullet formatting, and expand currency for clean pronunciation
    const cleanSpeech = text
      .replace(/[*#_`~[\]]/g, '')
      .replace(/₹\s?/g, 'Rupees ')
      .replace(/%/g, ' percent ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/•/g, '')
      .trim();

    if (!cleanSpeech) return false;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    const targetLocale = SPEECH_LANG_MAP[language] || 'en-IN';
    utterance.lang = targetLocale;
    utterance.rate = 0.95; // Clear and accessible pace
    utterance.pitch = 1.0;

    // Match browser available voice if matching language is found
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang === targetLocale || v.lang.replace('_', '-').startsWith(language)
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      currentSpeakingUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      currentSpeakingUtterance = null;
      console.warn('[Speech Synthesis Error Event]:', err);
      if (onError) onError(err);
    };

    currentSpeakingUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('[Speech Synthesis Error]:', err);
    if (onError) onError(err);
    return false;
  }
}

export function stopVoiceOutput(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
    currentSpeakingUtterance = null;
  }
}

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
