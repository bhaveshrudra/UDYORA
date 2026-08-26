import { SupportedLanguage } from '../i18n/types';

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export const SPEECH_LANG_MAP: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  kn: 'kn-IN'
};

let activeRecognitionInstance: any = null;

export interface SpeechRecognitionHandlers {
  language: SupportedLanguage;
  onStart?: () => void;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (errorMessage: string) => void;
  onEnd?: () => void;
}

export function isSpeechRecognitionAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as IWindow;
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Starts real browser speech recognition.
 * Dynamically binds language locale according to the selected global language.
 */
export function startVoiceRecognition({
  language,
  onStart,
  onResult,
  onError,
  onEnd
}: SpeechRecognitionHandlers): boolean {
  if (!isSpeechRecognitionAvailable()) {
    if (onError) {
      onError('Voice input is not supported in this browser. Please use text input.');
    }
    return false;
  }

  try {
    stopVoiceRecognition();

    const win = window as IWindow;
    const SpeechClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    const recognition = new SpeechClass();

    recognition.lang = SPEECH_LANG_MAP[language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (onStart) onStart();
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      if (final) {
        onResult(final.trim(), true);
      } else if (interim) {
        onResult(interim.trim(), false);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[Speech Recognition Event Error]:', event.error);
      if (event.error === 'not-allowed') {
        if (onError) onError('Microphone permission is required. Please allow microphone access in browser settings.');
      } else if (event.error === 'no-speech') {
        if (onError) onError('No speech was detected. Please try again.');
      } else if (event.error === 'network') {
        if (onError) onError('Network recognition error occurred. Please check connectivity or use text input.');
      } else {
        if (onError) onError('Voice input could not be processed. Please try again or use text.');
      }
    };

    recognition.onend = () => {
      activeRecognitionInstance = null;
      if (onEnd) onEnd();
    };

    activeRecognitionInstance = recognition;
    recognition.start();
    return true;
  } catch (err: any) {
    console.error('[Speech Recognition Launch Error]:', err);
    if (onError) onError('Unable to start microphone recording. Please use text input.');
    return false;
  }
}

export function stopVoiceRecognition(): void {
  if (activeRecognitionInstance) {
    try {
      activeRecognitionInstance.abort();
    } catch {}
    activeRecognitionInstance = null;
  }
}
