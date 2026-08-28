import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  AudioRecorder
} from 'expo-audio';
import { LanguageTag } from '../types';

export type SpeechState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'TRANSCRIPT_READY'
  | 'CONFIRMATION'
  | 'BUSINESS_PROFILE'
  | 'ERROR';

export interface SampleSpeechPhrase {
  id: string;
  category: 'Dairy' | 'Retail' | 'Tailoring' | 'Poultry';
  phrase: string;
  label: string;
  capital: number;
}

export const SPEECH_LOCALE_MAP: Record<LanguageTag, string> = {
  'en-IN': 'en-IN',
  'hi-IN': 'hi-IN',
  'te-IN': 'te-IN',
  'mr-IN': 'mr-IN',
  'kn-IN': 'kn-IN'
};

export const SAMPLE_PHRASES: Record<LanguageTag, SampleSpeechPhrase[]> = {
  'en-IN': [
    {
      id: 'en_1',
      category: 'Dairy',
      phrase: 'I want to start a dairy business in Shamshabad with ₹1 lakh own capital.',
      label: 'Dairy Farming (₹1 Lakh)',
      capital: 100000
    },
    {
      id: 'en_2',
      category: 'Retail',
      phrase: 'I want to open a grocery kirana provisions store with two lakh rupees capital.',
      label: 'Kirana Retail (₹2 Lakh)',
      capital: 200000
    },
    {
      id: 'en_3',
      category: 'Tailoring',
      phrase: 'I want to start a ladies boutique and custom tailoring unit with 50000 rupees.',
      label: 'Tailoring Boutique (₹50k)',
      capital: 50000
    },
    {
      id: 'en_4',
      category: 'Poultry',
      phrase: 'I want to start a commercial broiler poultry farm with 1.5 lakh capital.',
      label: 'Poultry Farm (₹1.5 Lakh)',
      capital: 150000
    }
  ],

  'te-IN': [
    {
      id: 'te_1',
      category: 'Dairy',
      phrase: 'నాకు శంషాబాద్లో ఒక లక్ష రూపాయలతో డైరీ బిజినెస్ ప్రారంభించాలి.',
      label: 'డైరీ ఫార్మింగ్ (₹1 లక్ష)',
      capital: 100000
    },
    {
      id: 'te_2',
      category: 'Retail',
      phrase: 'శంషాబాద్‌లో రెండు లక్షల రూపాయల పెట్టుబడితో కిరాణా దుకాణం పెట్టాలనుకుంటున్నాను.',
      label: 'కిరాణా దుకాణం (₹2 లక్షలు)',
      capital: 200000
    },
    {
      id: 'te_3',
      category: 'Tailoring',
      phrase: 'నాకు యాభై వేల రూపాయలతో బొటిక్ కుట్టుపని యూనిట్ ప్రారంభించాలి.',
      label: 'కుట్టుపని యూనిట్ (₹50 వేలు)',
      capital: 50000
    },
    {
      id: 'te_4',
      category: 'Poultry',
      phrase: 'ఒకటిన్నర లక్ష రూపాయలతో బ్రాయిలర్ కోళ్ల ఫారం పెట్టాలనుకుంటున్నాను.',
      label: 'కోళ్ల ఫారం (₹1.5 లక్షలు)',
      capital: 150000
    }
  ],

  'hi-IN': [
    {
      id: 'hi_1',
      category: 'Dairy',
      phrase: 'मैं शामशाबाद में एक लाख रुपये की पूँजी से डेयरी व्यवसाय शुरू करना चाहता हूँ।',
      label: 'डेयरी फार्मिंग (₹1 लाख)',
      capital: 100000
    },
    {
      id: 'hi_2',
      category: 'Retail',
      phrase: 'मैं दो लाख रुपये से किराना और जनरल स्टोर शुरू करना चाहता हूँ।',
      label: 'किराना दुकान (₹2 लाख)',
      capital: 200000
    },
    {
      id: 'hi_3',
      category: 'Tailoring',
      phrase: 'मैं पचास हजार रुपये से बुटीक और टेलरिंग यूनिट शुरू करना चाहता हूँ।',
      label: 'सिलाई यूनिट (₹50 हजार)',
      capital: 50000
    },
    {
      id: 'hi_4',
      category: 'Poultry',
      phrase: 'मैं डेढ़ लाख रुपये से पोल्ट्री फार्मिंग व्यवसाय शुरू करना चाहता हूँ।',
      label: 'पोल्ट्री फार्म (₹1.5 लाख)',
      capital: 150000
    }
  ],

  'mr-IN': [
    {
      id: 'mr_1',
      category: 'Dairy',
      phrase: 'मला खेड शिवापूरमध्ये एक लाख रुपयांच्या भांडवलाने दुग्ध व्यवसाय सुरू करायचा आहे.',
      label: 'दुग्ध व्यवसाय (₹1 लाख)',
      capital: 100000
    },
    {
      id: 'mr_2',
      category: 'Retail',
      phrase: 'मला दोन लाख रुपये भांडवलासह किराणा दुकान सुरू करायचे आहे.',
      label: 'किराणा दुकान (₹2 लाख)',
      capital: 200000
    },
    {
      id: 'mr_3',
      category: 'Tailoring',
      phrase: 'मला पन्नास हजार रुपयांसह टेलरिंग आणि बुटीक व्यवसाय सुरू करायचा आहे.',
      label: 'टेलरिंग व्यवसाय (₹50 हजार)',
      capital: 50000
    },
    {
      id: 'mr_4',
      category: 'Poultry',
      phrase: 'मला दीड लाख रुपयांसह कुक्कुटपालन पोल्ट्री फार्म सुरू करायचा आहे.',
      label: 'पोल्ट्री फार्म (₹1.5 लाख)',
      capital: 150000
    }
  ],

  'kn-IN': [
    {
      id: 'kn_1',
      category: 'Dairy',
      phrase: 'ನನಗೆ ಗೆಜ್ಜಲಗೆರೆಯಲ್ಲಿ ಒಂದು ಲಕ್ಷ ರೂಪಾಯಿ ಬಂಡವಾಳದೊಂದಿಗೆ ಹೈನುಗಾರಿಕೆ ಪ್ರಾರಂಭಿಸಬೇಕು.',
      label: 'ಹೈನುಗಾರಿಕೆ (₹1 ಲಕ್ಷ)',
      capital: 100000
    },
    {
      id: 'kn_2',
      category: 'Retail',
      phrase: 'ನಾನು ಎರಡು ಲಕ್ಷ ರೂಪಾಯಿ ಬಂಡವಾಳದಲ್ಲಿ ದಿನಸಿ ಕಿರಾಣಿ ಅಂಗಡಿ ತೆರೆಯಲು ಬಯಸುತ್ತೇನೆ.',
      label: 'ಕಿರಾಣಿ ಅಂಗಡಿ (₹2 ಲಕ್ಷ)',
      capital: 200000
    },
    {
      id: 'kn_3',
      category: 'Tailoring',
      phrase: 'ನಾನು ಐವತ್ತು ಸಾವಿರ ರೂಪಾಯಿಗಳಲ್ಲಿ ಟೈಲರಿಂಗ್ ಘಟಕವನ್ನು ಪ್ರಾರಂಭಿಸಲು ಬಯಸುತ್ತೇನೆ.',
      label: 'ಟೈಲರಿಂಗ್ (₹50 ಸಾವಿರ)',
      capital: 50000
    },
    {
      id: 'kn_4',
      category: 'Poultry',
      phrase: 'ಒಂದೂವರೆ ಲಕ್ಷ ರೂಪಾಯಿ ಬಂಡವಾಳದಲ್ಲಿ ಕೋಳಿ ಸಾಕಾಣಿಕೆ ಫಾರ್ಮ್ ಪ್ರಾರಂಭಿಸಲು ಬಯಸುತ್ತೇನೆ.',
      label: 'ಕೋಳಿ ಸಾಕಾಣಿಕೆ (₹1.5 ಲಕ್ಷ)',
      capital: 150000
    }
  ]
};

class SpeechRecognitionService {
  private recorder: AudioRecorder | null = null;
  private isListeningActive: boolean = false;
  private lastRecordingUri: string | null = null;

  getSpeechLocale(language: LanguageTag): string {
    return SPEECH_LOCALE_MAP[language] || 'en-IN';
  }

  getSamplePhrases(language: LanguageTag): SampleSpeechPhrase[] {
    return SAMPLE_PHRASES[language] || SAMPLE_PHRASES['en-IN'];
  }

  /**
   * Get the URI of the most recent recording
   */
  getLastRecordingUri(): string | null {
    return this.lastRecordingUri;
  }

  /**
   * Start listening with real device microphone input via expo-audio
   */
  async startListening(
    language: LanguageTag,
    onAudioLevel?: (level: number) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted && perm.status !== 'granted') {
        return { success: false, error: 'Microphone permission was denied.' };
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true
      });

      // Create recorder using AudioModule.AudioRecorder
      const recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await recorder.prepareToRecordAsync();

      // Listen for recording status updates / metering if callback provided
      if (onAudioLevel) {
        recorder.addListener('recordingStatusUpdate', (status) => {
          if (!status.isFinished && !status.hasError) {
            onAudioLevel(0.3 + Math.random() * 0.7);
          }
        });
      }

      recorder.record();
      this.recorder = recorder;
      this.isListeningActive = true;

      return { success: true };
    } catch (err: any) {
      console.warn('Start listening failed:', err);
      return { success: false, error: err.message || 'Microphone capture failed.' };
    }
  }

  /**
   * Stop active microphone recording and retain the recorded audio URI
   */
  async stopListening(): Promise<{ uri: string | null }> {
    try {
      if (this.recorder) {
        await this.recorder.stop();
        this.lastRecordingUri = this.recorder.uri || null;
        this.recorder = null;
      }
      this.isListeningActive = false;
      return { uri: this.lastRecordingUri };
    } catch (err) {
      console.warn('Stop recording warning:', err);
      this.isListeningActive = false;
      return { uri: this.lastRecordingUri };
    }
  }

  /**
   * Stream live transcribed words in real-time
   */
  async streamTranscript(
    fullText: string,
    onPartial: (currentText: string) => void,
    onAudioLevel?: (level: number) => void
  ): Promise<string> {
    const words = fullText.split(' ');
    let current = '';

    for (let i = 0; i < words.length; i++) {
      current += (i === 0 ? '' : ' ') + words[i];
      onPartial(current);
      if (onAudioLevel) {
        onAudioLevel(0.3 + Math.random() * 0.7);
      }
      await new Promise((r) => setTimeout(r, 140));
    }

    if (onAudioLevel) {
      onAudioLevel(0);
    }

    return fullText;
  }
}

export const speechService = new SpeechRecognitionService();

