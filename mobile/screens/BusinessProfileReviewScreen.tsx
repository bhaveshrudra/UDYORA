import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { useBusinessProfile } from '../context/BusinessProfileContext';
import { RootStackScreenProps } from '../types/navigation';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { formatINR } from '../utils/formatters';

export const BusinessProfileReviewScreen: React.FC<RootStackScreenProps<'BusinessProfileReview'>> = ({
  navigation
}) => {
  const insets = useSafeAreaInsets();
  const { languageCode } = useLanguage();
  const { selectedLocation } = useLocation();
  const { profile, confirmProfile } = useBusinessProfile();

  const handleConfirm = async () => {
    await confirmProfile();
    navigation.navigate('AnalysisPreparation');
  };

  return (
    <View style={styles.container}>
      <Header title="UDYORA" showBack={true} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.stepBadge}>STEP 4: PROFILE REVIEW</Text>
          <Text style={styles.title}>BUSINESS PROFILE</Text>
          <Text style={styles.subtitle}>
            Review your structured enterprise profile before multi-agent feasibility synthesis.
          </Text>
        </View>

        {/* Established Profile Summary Card */}
        <Card style={styles.reviewCard}>
          <View style={styles.reviewCardHeader}>
            <Text style={styles.reviewCardTitle}>ENTERPRISE PROFILE DOSSIER</Text>
            <Badge label={profile.inputSource || 'STRUCTURED'} variant="primary" />
          </View>

          {/* Row 1: Target Location */}
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Target Locality (LGD)</Text>
            <Text style={styles.itemValue}>
              📍 {selectedLocation.localityName}, {selectedLocation.subDistrictName} {selectedLocation.subDistrictType}
            </Text>
            <Text style={styles.itemSub}>
              {selectedLocation.districtName} District • {selectedLocation.stateName} • PIN: {selectedLocation.pincode}
            </Text>
          </View>

          {/* Row 2: Business Sector */}
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Business Sector & Scale</Text>
            <Text style={styles.itemValue}>
              {profile.businessCategory === 'Dairy' ? '🥛 ' : profile.businessCategory === 'Retail' ? '🛍️ ' : profile.businessCategory === 'Tailoring' ? '🧵 ' : '🐣 '}
              {profile.businessCategory} Farming / Enterprise
            </Text>
            <Text style={styles.itemSub}>Planned Scale: {profile.expectedScale} Unit</Text>
          </View>

          {/* Row 3: Own Capital */}
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Available Own Capital (Equity)</Text>
            <Text style={[styles.itemValue, { color: COLORS.secondary, fontSize: 18 }]}>
              {formatINR(profile.availableCapital)}
            </Text>
            <Text style={styles.itemSub}>10% Promoter Margin Standard</Text>
          </View>

          {/* Row 4: Intent & Experience */}
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.itemLabel}>Business Intent</Text>
              <Text style={styles.gridVal}>
                {profile.businessIntent === 'START' ? 'Start New' : profile.businessIntent}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.itemLabel}>Experience</Text>
              <Text style={styles.gridVal}>
                {profile.experience === 'NEW' ? 'New to Business' : 'Experienced'}
              </Text>
            </View>
          </View>

          {/* Transcript preview if voice was used */}
          {profile.rawTranscript && (
            <View style={styles.transcriptBox}>
              <Text style={styles.transcriptLabel}>Captured Natural-Language Input:</Text>
              <Text style={styles.transcriptText}>"{profile.rawTranscript}"</Text>
            </View>
          )}
        </Card>

        {/* Verification Checkmark Banner */}
        <View style={styles.verifyBox}>
          <Text style={styles.verifyTitle}>✓ Profile Structured & Validated</Text>
          <Text style={styles.verifyText}>
            Core inputs (Location, Sector, Capital) are complete and ready to be dispatched to the Multi-Agent Feasibility Engine.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="CONFIRM PROFILE →"
            onPress={handleConfirm}
            size="lg"
            style={styles.confirmBtn}
          />

          <Button
            title="EDIT PROFILE"
            variant="outline"
            size="md"
            onPress={() => navigation.goBack()}
            style={styles.editBtn}
          />
        </View>
      </ScrollView>
    </View>
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
    marginBottom: 14
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
  reviewCard: {
    padding: 16,
    gap: 12,
    marginBottom: 14
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
    marginBottom: 2
  },
  reviewCardTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textSecondary,
    letterSpacing: 0.5
  },
  itemRow: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingBottom: 8
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  itemSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10
  },
  gridCol: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  gridVal: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2
  },
  transcriptBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 4
  },
  transcriptLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2
  },
  transcriptText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.textPrimary
  },
  verifyBox: {
    padding: 14,
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16
  },
  verifyTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.secondary,
    marginBottom: 2
  },
  verifyText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15
  },
  actionsContainer: {
    gap: 8
  },
  confirmBtn: {
    width: '100%'
  },
  editBtn: {
    width: '100%'
  }
});
