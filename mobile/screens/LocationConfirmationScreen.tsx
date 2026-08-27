import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { RootStackScreenProps } from '../types/navigation';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { UdyoraMap } from '../components/UdyoraMap';
import { PlaceDetailModal } from '../components/PlaceDetailModal';
import { localityIntelligenceService } from '../services/localityIntelligenceService';
import { MapPlace, POICategory } from '../types';

const CATEGORY_CHIPS: { id: POICategory; label: string; icon: string }[] = [
  { id: 'ALL', label: 'All Places', icon: '🌐' },
  { id: 'MARKETS', label: 'Markets & Mandis', icon: '🌾' },
  { id: 'BANKS', label: 'Banks & Credit', icon: '🏦' },
  { id: 'HEALTHCARE', label: 'Veterinary & Health', icon: '🏥' },
  { id: 'RETAIL', label: 'Retail & FMCG', icon: '🛍️' },
  { id: 'DAIRY_SERVICES', label: 'Dairy Infrastructure', icon: '🥛' },
  { id: 'TRANSPORT', label: 'Transport & Freight', icon: '🚌' }
];

export const LocationConfirmationScreen: React.FC<RootStackScreenProps<'LocationConfirmation'>> = ({
  navigation,
  route
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { selectedLocation, selectedRadiusKm, setSelectedRadiusKm, confirmLocation } = useLocation();

  const [radius, setRadius] = useState<number>(selectedRadiusKm || 5);
  const [activeCategory, setActiveCategory] = useState<POICategory>('ALL');
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);

  // Generate structured Locality Intelligence Profile
  const localityProfile = useMemo(() => {
    return localityIntelligenceService.buildLocalityProfile(
      selectedLocation,
      radius,
      activeCategory
    );
  }, [selectedLocation, radius, activeCategory]);

  const handleConfirm = async () => {
    await confirmLocation();
    navigation.navigate('BusinessInput');
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    setSelectedRadiusKm(newRadius);
  };

  return (
    <View style={styles.container}>
      <Header title="UDYORA" showBack={true} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.stepBadge}>STEP 2: PRACTICAL LOCALITY INTELLIGENCE</Text>
          <Text style={styles.title}>{t('loc.intelligenceHeading', 'LOCALITY INTELLIGENCE')}</Text>
        </View>

        {/* 1. SELECTED LOCALITY SUMMARY CARD */}
        <Card style={styles.summaryCard}>
          <View style={styles.cardTop}>
            <View style={styles.pinRow}>
              <Text style={styles.pinIcon}>📍</Text>
              <View>
                <Text style={styles.confirmedBadge}>
                  {t('loc.confirmedHeading', 'LOCATION CONFIRMED')}
                </Text>
                <Text style={styles.localityTitle}>{selectedLocation.localityName}</Text>
              </View>
            </View>
            <Badge label={selectedLocation.dataQuality} variant="success" />
          </View>

          <Text style={styles.adminHierarchy}>
            {selectedLocation.subDistrictName} {selectedLocation.subDistrictType} • {selectedLocation.districtName} District • {selectedLocation.stateName}
          </Text>

          {selectedLocation.accuracy && (
            <Text style={styles.accuracyText}>
              {t('loc.accuracyLabel', 'Location accuracy')}: ±{selectedLocation.accuracy} m
            </Text>
          )}

          {/* Dual Provenance Data Separation */}
          <View style={styles.provenanceRow}>
            <View style={styles.provCol}>
              <Text style={styles.provLabel}>{t('loc.adminSource', 'Administrative Source')}:</Text>
              <Text style={styles.provVal}>{selectedLocation.administrativeSource}</Text>
            </View>
            <View style={styles.provCol}>
              <Text style={styles.provLabel}>{t('loc.mapSource', 'Geospatial Source')}:</Text>
              <Text style={styles.provVal}>{selectedLocation.mappingSource}</Text>
            </View>
          </View>
        </Card>

        {/* 2. INTERACTIVE MAP WITH RADIUS & POIS */}
        <View style={styles.mapSection}>
          <UdyoraMap
            latitude={selectedLocation.latitude}
            longitude={selectedLocation.longitude}
            localityName={selectedLocation.localityName}
            subDistrictName={`${selectedLocation.subDistrictName} ${selectedLocation.subDistrictType}`}
            districtName={selectedLocation.districtName}
            radiusKm={radius}
            places={localityProfile.nearbyPlaces}
            selectedCategory={activeCategory}
            accuracy={selectedLocation.accuracy}
            height={320}
            onRadiusChange={handleRadiusChange}
            onSelectPlace={(place) => setSelectedPlace(place)}
          />
        </View>

        {/* Radius Caption */}
        <View style={styles.radiusCaptionBox}>
          <Text style={styles.radiusCaptionText}>
            Showing observed places within <strong>{radius} km</strong> circular catchment
          </Text>
        </View>

        {/* 3. CATEGORY FILTER CHIPS */}
        <View style={styles.chipsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {CATEGORY_CHIPS.map((chip) => {
              const isActive = activeCategory === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  activeOpacity={0.7}
                  onPress={() => setActiveCategory(chip.id)}
                  style={[styles.categoryChip, isActive && styles.activeCategoryChip]}
                >
                  <Text style={styles.chipIcon}>{chip.icon}</Text>
                  <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. NEARBY OBSERVED PLACES LIST */}
        <View style={styles.placesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Nearby Observed Places ({localityProfile.nearbyPlaces.length})</Text>
            <Badge label="OBSERVED" variant="primary" />
          </View>

          {localityProfile.nearbyPlaces.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No observed facilities matching "{activeCategory}" within {radius} km. Try expanding to 10 km.
              </Text>
            </Card>
          ) : (
            localityProfile.nearbyPlaces.slice(0, 5).map((place) => (
              <TouchableOpacity
                key={place.id}
                activeOpacity={0.8}
                onPress={() => setSelectedPlace(place)}
              >
                <Card style={styles.placeCard}>
                  <View style={styles.placeCardRow}>
                    <View style={styles.placeInfo}>
                      <Text style={styles.placeName}>{place.name}</Text>
                      <Text style={styles.placeMeta}>
                        {place.categoryLabel} • {place.distanceKm} km away
                      </Text>
                      {place.address && <Text style={styles.placeAddress}>{place.address}</Text>}
                    </View>
                    <Text style={styles.placeDetailArrow}>→</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* 5. LOCAL MARKET SNAPSHOT */}
        <View style={styles.indicatorsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Local Market Snapshot</Text>
            <Badge label="MARKET INTEL" variant="success" />
          </View>

          <View style={styles.indicatorsGrid}>
            {localityProfile.marketIndicators.map((ind, idx) => (
              <Card key={idx} style={styles.indicatorCard}>
                <Text style={styles.indTitle}>{ind.title}</Text>
                <Text style={styles.indVal}>{ind.value}</Text>
                <View style={styles.indFooter}>
                  <Text style={styles.indStatus}>● {ind.status}</Text>
                  <Text style={styles.indSource}>{ind.source.split('/')[0]}</Text>
                </View>
              </Card>
            ))}
          </View>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              ℹ️ <strong>Market Notice:</strong> Map-based observations may not represent every operating unorganised business.
            </Text>
          </View>
        </View>

        {/* 6. LOCAL INFRASTRUCTURE */}
        <View style={styles.indicatorsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Local Infrastructure</Text>
            <Badge label="OFFICIAL LGD" variant="success" />
          </View>

          <View style={styles.infraList}>
            {localityProfile.infrastructureIndicators.map((infra, idx) => (
              <Card key={idx} style={styles.infraCard}>
                <View style={styles.infraHeader}>
                  <Text style={styles.infraTitle}>{infra.title}</Text>
                  <Badge
                    label={infra.availability}
                    variant={infra.availability === 'HIGH' ? 'success' : 'neutral'}
                  />
                </View>
                <Text style={styles.infraStatusText}>{infra.statusText}</Text>
                <Text style={styles.infraSource}>Source: {infra.source}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Button
            title="Continue to Business Planning →"
            onPress={handleConfirm}
            size="lg"
            style={styles.primaryActionBtn}
          />

          <Button
            title={t('loc.changeBtn', 'CHANGE LOCATION')}
            variant="outline"
            size="md"
            onPress={() => navigation.navigate('LocationSearch')}
            style={styles.secondaryActionBtn}
          />
        </View>
      </ScrollView>

      {/* Tap-on-marker Place Details Bottom Sheet */}
      <PlaceDetailModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
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
  summaryCard: {
    padding: 16,
    marginBottom: 14,
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0'
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  pinIcon: {
    fontSize: 22
  },
  confirmedBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 0.5
  },
  localityTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  adminHierarchy: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4
  },
  accuracyText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6
  },
  provenanceRow: {
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
    paddingTop: 8,
    gap: 4
  },
  provCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  provLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  provVal: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  mapSection: {
    marginBottom: 8
  },
  radiusCaptionBox: {
    alignItems: 'center',
    marginBottom: 12
  },
  radiusCaptionText: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  chipsSection: {
    marginBottom: 14
  },
  chipsRow: {
    gap: 8
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6
  },
  activeCategoryChip: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark
  },
  chipIcon: {
    fontSize: 12
  },
  chipText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary
  },
  activeChipText: {
    color: '#FFF'
  },
  placesSection: {
    marginBottom: 18
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  emptyCard: {
    padding: 16,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  placeCard: {
    padding: 12,
    marginBottom: 8
  },
  placeCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  placeInfo: {
    flex: 1
  },
  placeName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  placeMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2
  },
  placeAddress: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1
  },
  placeDetailArrow: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textMuted,
    marginLeft: 8
  },
  indicatorsSection: {
    marginBottom: 18
  },
  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  indicatorCard: {
    width: '48%',
    padding: 10
  },
  indTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase'
  },
  indVal: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginVertical: 3
  },
  indFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  indStatus: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.secondary
  },
  indSource: {
    fontSize: 8,
    color: COLORS.textMuted
  },
  noticeBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  noticeText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 14
  },
  infraList: {
    gap: 8
  },
  infraCard: {
    padding: 12
  },
  infraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  infraTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  infraStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginVertical: 2
  },
  infraSource: {
    fontSize: 9,
    color: COLORS.textMuted
  },
  actionRow: {
    gap: 8
  },
  primaryActionBtn: {
    width: '100%'
  },
  secondaryActionBtn: {
    width: '100%'
  }
});
