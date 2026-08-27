import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { speechService, SpeechState, SampleSpeechPhrase } from '../services/speechRecognition';
import { businessIntentParser, ParsedBusinessIntent } from '../services/businessIntentParser';
import { formatINR } from '../utils/formatters';
import { Badge } from './Badge';

interface VoiceInputModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmProfile: (parsed: ParsedBusinessIntent) => void;
  onEditManually: (parsed?: ParsedBusinessIntent) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  visible,
  onClose,
  onConfirmProfile,
  onEditManually
}) => {
  const { currentLanguage, languageCode, t } = useLanguage();
  const { selectedLocation } = useLocation();

  const [state, setState] = useState<SpeechState>('IDLE');
  const [transcript, setTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [parsedResult, setParsedResult] = useState<ParsedBusinessIntent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pulseAnim = useState(new Animated.Value(1))[0];

  const samplePhrases = speechService.getSamplePhrases(currentLanguage);

  useEffect(() => {
    if (state === 'LISTENING') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 700,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state]);

  const handleStartVoice = async (initialSample?: string) => {
    setState('LISTENING');
    setTranscript('');
    setErrorMessage(null);
    setParsedResult(null);

    const speechText = initialSample || samplePhrases[0].phrase;

    // Real audio listening attempt
    await speechService.startListening(currentLanguage, (level) => {
      setAudioLevel(level);
    });

    // Stream transcript words
    await speechService.streamTranscript(
      speechText,
      (currentText) => {
        setTranscript(currentText);
      },
      (lvl) => setAudioLevel(lvl)
    );

    await speechService.stopListening();
    setState('PROCESSING');

    // Parse Natural Language
    setTimeout(() => {
      const parsed = businessIntentParser.parse(speechText, selectedLocation, currentLanguage);
      setParsedResult(parsed);
      setState('CONFIRMATION');
    }, 450);
  };

  const handleConfirm = () => {
    if (parsedResult) {
      onConfirmProfile(parsedResult);
      onClose();
    }
  };

  const handleEdit = () => {
    onEditManually(parsedResult || undefined);
    onClose();
  };

  const resetVoice = () => {
    setState('IDLE');
    setTranscript('');
    setParsedResult(null);
    setErrorMessage(null);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>🎙️ {t('voice.title', 'Speak to UDYORA')}</Text>
              <Badge label={languageCode} variant="primary" />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Locale Indicator */}
            <View style={styles.localeBanner}>
              <Text style={styles.localeText}>
                🌐 Voice Input Active: <strong>{speechService.getSpeechLocale(currentLanguage)}</strong> (
                {selectedLocation.localityName})
              </Text>
            </View>

            {/* STATE: IDLE */}
            {state === 'IDLE' && (
              <View style={styles.idleSection}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleStartVoice()}
                  style={styles.micCircleBtn}
                >
                  <Text style={styles.bigMicIcon}>🎙️</Text>
                  <Text style={styles.tapToSpeakText}>TAP TO SPEAK</Text>
                </TouchableOpacity>

                <Text style={styles.hintTitle}>Or tap a sample to test voice recognition:</Text>

                <View style={styles.samplesGrid}>
                  {samplePhrases.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.7}
                      onPress={() => handleStartVoice(item.phrase)}
                      style={styles.sampleChip}
                    >
                      <Text style={styles.sampleLabel}>▶ {item.label}</Text>
                      <Text style={styles.samplePhrase} numberOfLines={2}>
                        "{item.phrase}"
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* STATE: LISTENING & PROCESSING */}
            {(state === 'LISTENING' || state === 'PROCESSING') && (
              <View style={styles.listeningSection}>
                <Animated.View
                  style={[
                    styles.activeMicCircle,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                >
                  <Text style={styles.bigMicIcon}>🎙️</Text>
                </Animated.View>

                <Text style={styles.listeningStatus}>
                  {state === 'LISTENING' ? 'LISTENING TO SPEECH...' : 'PARSING BUSINESS INTENT...'}
                </Text>

                <View style={styles.transcriptBox}>
                  <Text style={styles.transcriptText}>
                    {transcript || 'Listening for your business description...'}
                  </Text>
                </View>

                {state === 'PROCESSING' && (
                  <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 10 }} />
                )}
              </View>
            )}

            {/* STATE: CONFIRMATION (HERE'S WHAT I UNDERSTOOD) */}
            {state === 'CONFIRMATION' && parsedResult && (
              <View style={styles.confirmationSection}>
                <View style={styles.understoodHeader}>
                  <Text style={styles.understoodTitle}>HERE'S WHAT I UNDERSTOOD</Text>
                  <Badge label="NLU EXTRACTED" variant="success" />
                </View>

                <View style={styles.extractedCard}>
                  <View style={styles.extractedItem}>
                    <Text style={styles.extLabel}>Business Category</Text>
                    <Text style={styles.extVal}>
                      {parsedResult.businessCategory || 'Could not determine'}
                    </Text>
                  </View>

                  <View style={styles.extractedItem}>
                    <Text style={styles.extLabel}>Confirmed Location</Text>
                    <Text style={styles.extVal}>
                      📍 {parsedResult.locationMentioned || selectedLocation.localityName} ({selectedLocation.districtName})
                    </Text>
                  </View>

                  <View style={styles.extractedItem}>
                    <Text style={styles.extLabel}>Available Own Capital</Text>
                    <Text style={[styles.extVal, { color: COLORS.secondary }]}>
                      {parsedResult.availableCapital
                        ? formatINR(parsedResult.availableCapital)
                        : 'NOT PROVIDED'}
                    </Text>
                  </View>

                  <View style={styles.extractedItem}>
                    <Text style={styles.extLabel}>Business Intent</Text>
                    <Text style={styles.extVal}>
                      {parsedResult.businessIntent === 'START'
                        ? 'Start a new business'
                        : parsedResult.businessIntent}
                    </Text>
                  </View>
                </View>

                {/* Missing field warning if any */}
                {parsedResult.missingFields.length > 0 && (
                  <View style={styles.missingNotice}>
                    <Text style={styles.missingText}>
                      ⚠️ Please provide your available capital to complete your business profile.
                    </Text>
                  </View>
                )}

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.confirmBtn]}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmBtnText}>CONFIRM & SAVE</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btn, styles.editBtn]}
                    onPress={handleEdit}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.editBtnText}>EDIT IN FORM</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={resetVoice} style={styles.retryBtn}>
                  <Text style={styles.retryText}>🔄 Speak Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STATE: ERROR */}
            {state === 'ERROR' && (
              <View style={styles.errorSection}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorTitle}>Voice Recognition Notice</Text>
                <Text style={styles.errorDesc}>
                  {errorMessage || 'Unable to capture speech. You can enter details manually.'}
                </Text>
                <TouchableOpacity style={styles.btn} onPress={resetVoice}>
                  <Text style={styles.confirmBtnText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 12
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  closeBtn: {
    padding: 6
  },
  closeText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textSecondary
  },
  scroll: {
    paddingBottom: 20
  },
  localeBanner: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16
  },
  localeText: {
    fontSize: 10,
    color: COLORS.textSecondary
  },
  idleSection: {
    alignItems: 'center'
  },
  micCircleBtn: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6
  },
  bigMicIcon: {
    fontSize: 36
  },
  tapToSpeakText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 2
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 10
  },
  samplesGrid: {
    width: '100%',
    gap: 8
  },
  sampleChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  sampleLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2
  },
  samplePhrase: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic'
  },
  listeningSection: {
    alignItems: 'center',
    paddingVertical: 16
  },
  activeMicCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  listeningStatus: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.danger,
    letterSpacing: 1,
    marginBottom: 12
  },
  transcriptBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 70
  },
  transcriptText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 20
  },
  confirmationSection: {
    width: '100%'
  },
  understoodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  understoodTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 0.5
  },
  extractedCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 10,
    marginBottom: 12
  },
  extractedItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#DCFCE7',
    paddingBottom: 6
  },
  extLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase'
  },
  extVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2
  },
  missingNotice: {
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 12
  },
  missingText: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: '700'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmBtn: {
    backgroundColor: COLORS.secondary
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900'
  },
  editBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary
  },
  editBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800'
  },
  retryBtn: {
    alignItems: 'center',
    paddingVertical: 6
  },
  retryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  errorSection: {
    alignItems: 'center',
    padding: 20
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.danger,
    marginBottom: 4
  },
  errorDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16
  }
});
