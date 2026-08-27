import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { RootStackScreenProps } from '../types/navigation';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

export const BusinessInputScreen: React.FC<RootStackScreenProps<'BusinessInput'>> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { selectedLocation, selectedRadiusKm } = useLocation();

  return (
    <View style={styles.container}>
      <Header title="UDYORA" showBack={true} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.badgeText}>STEP 3: BUSINESS INPUT</Text>
          <Text style={styles.title}>
            {t('loc.businessSetupPlaceholder', 'Business setup will continue here.')}
          </Text>
          <Text style={styles.subtitle}>
            Location intelligence and device permissions are established for hyper-local advisory synthesis.
          </Text>
        </View>

        {/* Established Location Summary Card */}
        <Card style={styles.locationCard}>
          <View style={styles.locHeader}>
            <Text style={styles.pin}>📍</Text>
            <View style={styles.locText}>
              <Text style={styles.locName}>{selectedLocation.localityName}</Text>
              <Text style={styles.locSub}>
                {selectedLocation.subDistrictName} {selectedLocation.subDistrictType} • {selectedLocation.districtName} • {selectedLocation.stateName}
              </Text>
            </View>
            <Badge label="VERIFIED LGD" variant="success" />
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Radius: <strong>{selectedRadiusKm} km</strong> • Quality: <strong>{selectedLocation.dataQuality}</strong>
            </Text>
          </View>
        </Card>

        {/* Phase 3 Completion Box */}
        <View style={styles.completeBox}>
          <Text style={styles.completeTitle}>✓ Phase 3 Foundation Complete</Text>
          <Text style={styles.completeDesc}>
            Foreground location permissions, microphone audio preparation, one-time GPS fix, practical locality disambiguation, LGD directory resolution, and interactive MapView foundation are active.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          title="← Back to Location Setup"
          variant="outline"
          size="lg"
          onPress={() => navigation.goBack()}
        />
      </View>
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
    marginBottom: 16
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18
  },
  locationCard: {
    padding: 16,
    marginBottom: 16
  },
  locHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },
  pin: {
    fontSize: 22
  },
  locText: {
    flex: 1
  },
  locName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  locSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  metaRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  completeBox: {
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  completeTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.secondary,
    marginBottom: 4
  },
  completeDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16
  },
  bottomBar: {
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  }
});
