import { SupportedLanguage } from '../i18n/types';

// Web Speech API interface declarations for TypeScript compatibility
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export const LANGUAGE_LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  kn: 'kn-IN'
};

let activeRecognition: any = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as IWindow;
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof window.speechSynthesis !== 'undefined';
}

export interface SpeechRecognitionOptions {
  language: SupportedLanguage;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export function startSpeechRecognition({
  language,
  onResult,
  onError,
  onStart,
  onEnd
}: SpeechRecognitionOptions): boolean {
  if (!isSpeechRecognitionSupported()) {
    if (onError) {
      onError('Voice input is not supported in this browser. Please use text input.');
    }
    return false;
  }

  try {
    stopSpeechRecognition();

    const win = window as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.lang = LANGUAGE_LOCALE_MAP[language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (onStart) onStart();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        onResult(interimTranscript.trim(), false);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition event error:', event.error);
      if (event.error === 'no-speech') {
        if (onError) onError('No speech detected. Please speak into your microphone.');
      } else if (event.error === 'not-allowed') {
        if (onError) onError('Microphone access was denied. Please enable microphone permissions in your browser.');
      } else {
        if (onError) onError('Voice input could not be processed. Please try again or use text.');
      }
    };

    recognition.onend = () => {
      activeRecognition = null;
      if (onEnd) onEnd();
    };

    activeRecognition = recognition;
    recognition.start();
    return true;
  } catch (err: any) {
    console.error('Failed to start speech recognition:', err);
    if (onError) onError('Unable to start voice input. Please use text input.');
    return false;
  }
}

export function stopSpeechRecognition(): void {
  if (activeRecognition) {
    try {
      activeRecognition.abort();
    } catch {}
    activeRecognition = null;
  }
}

export interface SpeechSynthesisOptions {
  text: string;
  language: SupportedLanguage;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export function speakText({
  text,
  language,
  onStart,
  onEnd,
  onError
}: SpeechSynthesisOptions): boolean {
  if (!isSpeechSynthesisSupported()) {
    if (onError) onError('Voice output is unavailable. You can read the response instead.');
    return false;
  }

  try {
    stopSpeechSynthesis();

    // Clean markdown symbols for natural speech reading
    const cleanText = text
      .replace(/[*#_`~[\]]/g, '')
      .replace(/₹\s?/g, 'Rupees ')
      .replace(/%/g, ' percent')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLocale = LANGUAGE_LOCALE_MAP[language] || 'en-IN';
    utterance.lang = targetLocale;
    utterance.rate = 0.95; // Clear and accessible pace
    utterance.pitch = 1.0;

    // Pick best matching voice if available
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
      currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      currentUtterance = null;
      console.warn('Speech synthesis error:', err);
      if (onError) onError(err);
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis failure:', err);
    if (onError) onError(err);
    return false;
  }
}

export function stopSpeechSynthesis(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
    currentUtterance = null;
  }
}

export function pauseSpeechSynthesis(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.pause();
    } catch {}
  }
}

export function resumeSpeechSynthesis(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.resume();
    } catch {}
  }
}
