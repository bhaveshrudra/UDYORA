import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, CAPITAL_PRESETS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { useBusinessProfile } from '../context/BusinessProfileContext';
import { RootStackScreenProps } from '../types/navigation';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { VoiceInputModal } from '../components/VoiceInputModal';
import { formatINR } from '../utils/formatters';
import {
  CanonicalBusinessCategory,
  BusinessIntent,
  BusinessExperience,
  ExpectedScale
} from '../types';
import { ParsedBusinessIntent } from '../services/businessIntentParser';

const CATEGORIES: { id: CanonicalBusinessCategory; label: string; icon: string; desc: string }[] = [
  { id: 'Dairy', label: 'Dairy Farming', icon: '🥛', desc: 'Milch animals, chilling & cooperative supply' },
  { id: 'Retail', label: 'Retail / Kirana', icon: '🛍️', desc: 'Provisions, FMCG & daily essentials' },
  { id: 'Tailoring', label: 'Tailoring Boutique', icon: '🧵', desc: 'Garments, stitching & apparel unit' },
  { id: 'Poultry', label: 'Poultry & Agro', icon: '🐣', desc: 'Commercial broiler rearing & feed' },
  { id: 'Agro-processing', label: 'Agro Processing', icon: '🌾', desc: 'Flour mill, oil expeller & grading' },
  { id: 'Custom', label: 'Other Enterprise', icon: '⚙️', desc: 'Custom rural service or manufacturing' }
];

const INTENTS: { id: BusinessIntent; label: string; sub: string }[] = [
  { id: 'START', label: 'Start New', sub: 'Fresh enterprise' },
  { id: 'EXPAND', label: 'Expand', sub: 'Scale capacity' },
  { id: 'IMPROVE', label: 'Improve', sub: 'Modernize unit' },
  { id: 'RESTART', label: 'Restart', sub: 'Revive business' }
];

export const BusinessProfileScreen: React.FC<RootStackScreenProps<'BusinessInput'>> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { selectedLocation } = useLocation();
  const { profile, updateProfile, setProfile } = useBusinessProfile();

  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Form State
  const [category, setCategoryState] = useState<CanonicalBusinessCategory>(profile.businessCategory || 'Dairy');
  const [description, setDescriptionState] = useState<string>(profile.businessDescription || '');
  const [capitalStr, setCapitalStr] = useState<string>(String(profile.availableCapital || 100000));
  const [intent, setIntentState] = useState<BusinessIntent>(profile.businessIntent || 'START');
  const [experience, setExperienceState] = useState<BusinessExperience>(profile.experience || 'SOME_EXPERIENCE');
  const [scale, setScaleState] = useState<ExpectedScale>(profile.expectedScale || 'MICRO');
  const [hasExistingBiz, setHasExistingBiz] = useState<boolean>(profile.existingBusiness?.exists || false);

  const numCapital = Number(capitalStr.replace(/[^0-9]/g, '')) || 0;

  // 10% Margin standard calculations
  const estimatedProjectCost = Math.round(numCapital / 0.10);
  const estimatedLoan = Math.round(estimatedProjectCost - numCapital);

  const handleApplyVoiceParsed = (parsed: ParsedBusinessIntent) => {
    if (parsed.businessCategory) {
      setCategoryState(parsed.businessCategory);
    }
    if (parsed.availableCapital) {
      setCapitalStr(String(parsed.availableCapital));
    }
    if (parsed.businessIntent) {
      setIntentState(parsed.businessIntent);
    }
    if (parsed.rawInput) {
      setDescriptionState(parsed.rawInput);
    }

    updateProfile({
      businessCategory: parsed.businessCategory || category,
      businessDescription: parsed.rawInput || description,
      businessIntent: parsed.businessIntent || intent,
      availableCapital: parsed.availableCapital || numCapital,
      inputSource: 'VOICE',
      rawTranscript: parsed.rawInput
    });

    navigation.navigate('BusinessProfileReview');
  };

  const handleReview = () => {
    if (!category) {
      Alert.alert('Missing Field', 'Please select a business category.');
      return;
    }
    if (numCapital <= 0) {
      Alert.alert('Missing Capital', 'Please enter your available own capital.');
      return;
    }

    updateProfile({
      businessCategory: category,
      businessName: `${category} Enterprise`,
      businessDescription: description.trim() || `${category} unit in ${selectedLocation.localityName}`,
      businessIntent: intent,
      availableCapital: numCapital,
      experience,
      expectedScale: scale,
      existingBusiness: { exists: hasExistingBiz },
      inputSource: 'FORM'
    });

    navigation.navigate('BusinessProfileReview');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="UDYORA" showBack={true} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.stepBadge}>STEP 3: BUSINESS PROFILE</Text>
          <Text style={styles.title}>YOUR BUSINESS</Text>
          <Text style={styles.subtitle}>
            Tell UDYORA what you want to start, expand, or improve.
          </Text>
        </View>

        {/* Established Location Pin Card */}
        <Card style={styles.locationSummaryCard}>
          <View style={styles.locRow}>
            <Text style={styles.locIcon}>📍</Text>
            <View style={styles.locInfo}>
              <Text style={styles.locLabel}>ADVISORY TARGET LOCATION</Text>
              <Text style={styles.locName}>
                {selectedLocation.localityName} ({selectedLocation.subDistrictName} {selectedLocation.subDistrictType}, {selectedLocation.districtName})
              </Text>
            </View>
            <Badge label="CONFIRMED" variant="success" />
          </View>
        </Card>

        {/* PRIMARY OPTION: PROMINENT VOICE-FIRST BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setVoiceModalVisible(true)}
          style={styles.voicePrimaryCard}
        >
          <View style={styles.voiceLeft}>
            <View style={styles.voiceMicCircle}>
              <Text style={styles.voiceMicIcon}>🎙️</Text>
            </View>
            <View style={styles.voiceTextContainer}>
              <Text style={styles.voiceHeading}>SPEAK TO UDYORA</Text>
              <Text style={styles.voiceSub}>
                Describe your idea in Telugu, Hindi, Marathi, Kannada, or English
              </Text>
            </View>
          </View>
          <Text style={styles.voiceArrow}>→</Text>
        </TouchableOpacity>

        {/* OR DIVIDER */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* 1. BUSINESS CATEGORY SELECTOR */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>1. Select Business Category</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.7}
                  onPress={() => setCategoryState(cat.id)}
                  style={styles.categoryCol}
                >
                  <Card active={isSelected} style={styles.categoryCard}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                    <Text style={[styles.catTitle, isSelected && styles.activeCatTitle]}>
                      {cat.label}
                    </Text>
                    <Text style={styles.catDesc}>{cat.desc}</Text>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. AVAILABLE CAPITAL INPUT & QUICK PRESETS */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeading}>2. Available Own Capital</Text>
            <Text style={styles.marginStandardBadge}>10% Promoter Margin Rule</Text>
          </View>

          {/* Quick Capital Touch Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.capitalChipsRow}
          >
            {CAPITAL_PRESETS.map((amt) => {
              const isSelected = numCapital === amt;
              return (
                <TouchableOpacity
                  key={amt}
                  activeOpacity={0.7}
                  onPress={() => setCapitalStr(String(amt))}
                  style={[styles.capitalChip, isSelected && styles.activeCapitalChip]}
                >
                  <Text style={[styles.capitalChipText, isSelected && styles.activeCapitalChipText]}>
                    {formatINR(amt)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Rupee Input Field */}
          <Card style={styles.capitalInputCard}>
            <Text style={styles.rupeePrefix}>₹</Text>
            <TextInput
              keyboardType="number-pad"
              value={capitalStr}
              onChangeText={(val) => setCapitalStr(val.replace(/[^0-9]/g, ''))}
              placeholder="100000"
              placeholderTextColor={COLORS.textMuted}
              style={styles.capitalTextInput}
            />
          </Card>

          {/* Real-Time Financing Preview */}
          <View style={styles.mathPreviewGrid}>
            <View style={styles.mathCell}>
              <Text style={styles.mathLabel}>Est. Project Scale</Text>
              <Text style={styles.mathVal}>{formatINR(estimatedProjectCost)}</Text>
            </View>
            <View style={styles.mathCell}>
              <Text style={styles.mathLabel}>Eligible Bank Loan</Text>
              <Text style={[styles.mathVal, { color: COLORS.primary }]}>
                {formatINR(estimatedLoan)}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. BUSINESS INTENT */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>3. Business Intent</Text>
          <View style={styles.intentGrid}>
            {INTENTS.map((item) => {
              const isSelected = intent === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => setIntentState(item.id)}
                  style={styles.intentCol}
                >
                  <Card active={isSelected} style={styles.intentCard}>
                    <Text style={[styles.intentTitle, isSelected && styles.activeIntentTitle]}>
                      {item.label}
                    </Text>
                    <Text style={styles.intentSub}>{item.sub}</Text>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 4. BUSINESS DESCRIPTION (OPTIONAL TEXT) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>4. Scope & Description (Optional)</Text>
          <Card style={styles.descCard}>
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="e.g. 8 milch cows, modern shed, local chilling center supply..."
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={setDescriptionState}
              style={styles.descInput}
            />
          </Card>
        </View>

        {/* 5. COLLAPSIBLE OPTIONAL DETAILS (EXPERIENCE & SCALE) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowOptionalFields(!showOptionalFields)}
          style={styles.optionalToggle}
        >
          <Text style={styles.optionalToggleText}>
            {showOptionalFields ? '▼ Hide Additional Details' : '▶ Add Experience & Scale (Optional)'}
          </Text>
        </TouchableOpacity>

        {showOptionalFields && (
          <View style={styles.optionalSection}>
            {/* Experience */}
            <Text style={styles.optionalHeading}>Business Experience:</Text>
            <View style={styles.optionPillsRow}>
              {(['NEW', 'SOME_EXPERIENCE', 'EXPERIENCED'] as BusinessExperience[]).map((exp) => (
                <TouchableOpacity
                  key={exp}
                  activeOpacity={0.7}
                  onPress={() => setExperienceState(exp)}
                  style={[styles.optPill, experience === exp && styles.activeOptPill]}
                >
                  <Text style={[styles.optPillText, experience === exp && styles.activeOptPillText]}>
                    {exp === 'NEW' ? 'New to Business' : exp === 'SOME_EXPERIENCE' ? 'Some Experience' : 'Experienced'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Expected Scale */}
            <Text style={[styles.optionalHeading, { marginTop: 12 }]}>Planned Scale:</Text>
            <View style={styles.optionPillsRow}>
              {(['MICRO', 'SMALL', 'MEDIUM'] as ExpectedScale[]).map((sc) => (
                <TouchableOpacity
                  key={sc}
                  activeOpacity={0.7}
                  onPress={() => setScaleState(sc)}
                  style={[styles.optPill, scale === sc && styles.activeOptPill]}
                >
                  <Text style={[styles.optPillText, scale === sc && styles.activeOptPillText]}>
                    {sc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Review Action */}
        <View style={styles.actionSection}>
          <Button
            title="REVIEW BUSINESS PROFILE →"
            onPress={handleReview}
            size="lg"
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>

      {/* Voice Recognition Modal */}
      <VoiceInputModal
        visible={voiceModalVisible}
        onClose={() => setVoiceModalVisible(false)}
        onConfirmProfile={handleApplyVoiceParsed}
        onEditManually={(parsed) => {
          if (parsed) {
            if (parsed.businessCategory) setCategoryState(parsed.businessCategory);
            if (parsed.availableCapital) setCapitalStr(String(parsed.availableCapital));
            if (parsed.businessIntent) setIntentState(parsed.businessIntent);
          }
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scroll: {
    padding: 18
  },
  header: {
    marginBottom: 12
  },
  stepBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 2
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  locationSummaryCard: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 14
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  locIcon: {
    fontSize: 18
  },
  locInfo: {
    flex: 1
  },
  locLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted
  },
  locName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 1
  },
  voicePrimaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E3A8A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  voiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  voiceMicCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  voiceMicIcon: {
    fontSize: 22
  },
  voiceTextContainer: {
    flex: 1
  },
  voiceHeading: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5
  },
  voiceSub: {
    fontSize: 11,
    color: '#BFDBFE',
    marginTop: 2,
    lineHeight: 15
  },
  voiceArrow: {
    fontSize: 20,
    fontWeight: '900',
    color: '#93C5FD',
    marginLeft: 8
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 8
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5
  },
  section: {
    marginBottom: 16
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  marginStandardBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.secondary,
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  categoryCol: {
    width: '48%'
  },
  categoryCard: {
    padding: 12
  },
  catIcon: {
    fontSize: 20,
    marginBottom: 4
  },
  catTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  activeCatTitle: {
    color: COLORS.primary
  },
  catDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 13
  },
  capitalChipsRow: {
    gap: 8,
    marginBottom: 8
  },
  capitalChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  activeCapitalChip: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark
  },
  capitalChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary
  },
  activeCapitalChipText: {
    color: '#FFF'
  },
  capitalInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 8
  },
  rupeePrefix: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textSecondary,
    marginRight: 6
  },
  capitalTextInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  mathPreviewGrid: {
    flexDirection: 'row',
    gap: 8
  },
  mathCell: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  mathLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase'
  },
  mathVal: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2
  },
  intentGrid: {
    flexDirection: 'row',
    gap: 6
  },
  intentCol: {
    flex: 1
  },
  intentCard: {
    padding: 10,
    alignItems: 'center'
  },
  intentTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  activeIntentTitle: {
    color: COLORS.primary
  },
  intentSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center'
  },
  descCard: {
    padding: 12
  },
  descInput: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top'
  },
  optionalToggle: {
    paddingVertical: 8,
    marginBottom: 10
  },
  optionalToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary
  },
  optionalSection: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16
  },
  optionalHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 6
  },
  optionPillsRow: {
    flexDirection: 'row',
    gap: 8
  },
  optPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  activeOptPill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  optPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  activeOptPillText: {
    color: '#FFF'
  },
  actionSection: {
    marginTop: 8
  },
  submitBtn: {
    width: '100%'
  }
});
