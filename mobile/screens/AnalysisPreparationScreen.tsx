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

export const AnalysisPreparationScreen: React.FC<RootStackScreenProps<'AnalysisPreparation'>> = ({
  navigation
}) => {
  const insets = useSafeAreaInsets();
  const { languageCode } = useLanguage();
  const { selectedLocation } = useLocation();
  const { profile } = useBusinessProfile();

  const handleStartAnalysis = () => {
    navigation.navigate('Analysis');
  };

  return (
    <View style={styles.container}>
      <Header title="UDYORA" showBack={true} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.stepBadge}>STEP 5: ANALYSIS PREPARATION</Text>
          <Text style={styles.title}>YOUR PROFILE IS READY</Text>
          <Text style={styles.subtitle}>
            All core parameters have been canonicalized for the UDYORA Multi-Agent Advisory Pipeline.
          </Text>
        </View>

        {/* Established Readiness Card */}
        <Card style={styles.readyCard}>
          <View style={styles.readyCardHeader}>
            <Text style={styles.readyTitle}>CANONICAL USER CONTEXT</Text>
            <Badge label="100% READY" variant="success" />
          </View>

          <View style={styles.readinessList}>
            {/* 1. Location */}
            <View style={styles.readinessItem}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              <View style={styles.readinessInfo}>
                <Text style={styles.readinessLabel}>Target Location</Text>
                <Text style={styles.readinessValue}>
                  {selectedLocation.localityName}, {selectedLocation.districtName} ({selectedLocation.stateName})
                </Text>
              </View>
            </View>

            {/* 2. Business */}
            <View style={styles.readinessItem}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              <View style={styles.readinessInfo}>
                <Text style={styles.readinessLabel}>Business Sector</Text>
                <Text style={styles.readinessValue}>
                  {profile.businessCategory} Enterprise ({profile.businessIntent})
                </Text>
              </View>
            </View>

            {/* 3. Capital */}
            <View style={styles.readinessItem}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              <View style={styles.readinessInfo}>
                <Text style={styles.readinessLabel}>Own Capital (Equity)</Text>
                <Text style={[styles.readinessValue, { color: COLORS.secondary }]}>
                  {formatINR(profile.availableCapital)}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Pipeline Ready Notification */}
        <View style={styles.pipelineBox}>
          <Text style={styles.pipelineTitle}>Phase 5 Contract Ready</Text>
          <Text style={styles.pipelineText}>
            The canonical UserContext object is fully prepared for Phase 6 multi-agent orchestration (Evidence Agent, Business Agent, Market Agent, Finance Agent, Scheme Agent, Risk Agent, and Validator).
          </Text>
        </View>

        {/* Start Analysis Button */}
        <View style={styles.actionContainer}>
          <Button
            title="START ANALYSIS →"
            onPress={handleStartAnalysis}
            size="lg"
            style={styles.startBtn}
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
    color: COLORS.secondary,
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
  readyCard: {
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
    marginBottom: 16
  },
  readyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
    paddingBottom: 8,
    marginBottom: 12
  },
  readyTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 0.5
  },
  readinessList: {
    gap: 12
  },
  readinessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900'
  },
  readinessInfo: {
    flex: 1
  },
  readinessLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase'
  },
  readinessValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 1
  },
  pipelineBox: {
    padding: 14,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 20
  },
  pipelineTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 2
  },
  pipelineText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15
  },
  actionContainer: {
    marginTop: 4
  },
  startBtn: {
    width: '100%'
  }
});
