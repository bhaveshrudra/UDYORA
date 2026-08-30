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

export const SPEECH_LANG_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  en: 'English (India)',
  hi: 'हिन्दी (Hindi)',
  te: 'తెలుగు (Telugu)',
  mr: 'मराठी (Marathi)',
  kn: 'ಕನ್ನಡ (Kannada)'
};

let activeRecognitionInstance: any = null;

export type SpeechListeningState = 'IDLE' | 'LISTENING' | 'TRANSCRIBING' | 'SUCCESS' | 'ERROR';

export interface SpeechRecognitionHandlers {
  language: SupportedLanguage;
  onStart?: () => void;
  onStateChange?: (state: SpeechListeningState) => void;
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
 * Ensures zero duplicate transcript collisions and safe unmount cleanup.
 */
export function startVoiceRecognition({
  language,
  onStart,
  onStateChange,
  onResult,
  onError,
  onEnd
}: SpeechRecognitionHandlers): boolean {
  if (!isSpeechRecognitionAvailable()) {
    if (onError) {
      onError('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari, or enter details using text.');
    }
    if (onStateChange) onStateChange('ERROR');
    return false;
  }

  try {
    stopVoiceRecognition();

    const win = window as IWindow;
    const SpeechClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    const recognition = new SpeechClass();

    const langLocale = SPEECH_LANG_MAP[language] || 'en-IN';
    recognition.lang = langLocale;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let hasReceivedFinal = false;

    recognition.onstart = () => {
      if (onStart) onStart();
      if (onStateChange) onStateChange('LISTENING');
    };

    recognition.onspeechstart = () => {
      if (onStateChange) onStateChange('TRANSCRIBING');
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
        hasReceivedFinal = true;
        if (onStateChange) onStateChange('SUCCESS');
        onResult(final.trim(), true);
      } else if (interim && !hasReceivedFinal) {
        if (onStateChange) onStateChange('TRANSCRIBING');
        onResult(interim.trim(), false);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[Speech Recognition Event Error]:', event.error);
      if (onStateChange) onStateChange('ERROR');

      if (event.error === 'not-allowed') {
        if (onError) onError('Microphone access was denied. Please allow microphone permissions in your browser address bar.');
      } else if (event.error === 'no-speech') {
        if (onError) onError('No speech detected. Please speak clearly into your microphone and try again.');
      } else if (event.error === 'network') {
        if (onError) onError('Network connection error occurred during voice recognition. Please check your internet connection or use text input.');
      } else if (event.error === 'audio-capture') {
        if (onError) onError('No microphone was found on this device. Please connect a microphone or use text input.');
      } else if (event.error === 'aborted') {
        // Aborted gracefully by user
      } else {
        if (onError) onError(`Voice input error (${event.error}). Please try again or type your business idea.`);
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
    if (onStateChange) onStateChange('ERROR');
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
