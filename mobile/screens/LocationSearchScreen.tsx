import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { LocationResolution } from '../types';
import { locationService, SEEDED_LOCALITIES } from '../services/locationService';
import { RootStackScreenProps } from '../types/navigation';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

export const LocationSearchScreen: React.FC<RootStackScreenProps<'LocationSearch'>> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { setSelectedLocation } = useLocation();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResolution[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        const matches = await locationService.searchLocalities(query);
        setResults(matches);
        setIsSearching(false);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }, [query]);

  const handleSelect = (loc: LocationResolution) => {
    setSelectedLocation(loc);
    navigation.navigate('LocationConfirmation', { locationId: loc.id });
  };

  return (
    <View style={styles.container}>
      <Header title="UDYORA" showBack={true} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('loc.searchHeading', 'SEARCH YOUR LOCATION')}</Text>
          <Text style={styles.subtitle}>
            {t(
              'loc.searchSubtitle',
              'Enter your village, locality, mandal, or district to resolve official LGD data.'
            )}
          </Text>
        </View>

        {/* Search Input Box */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder={t(
              'loc.searchPlaceholder',
              'Search locality, village, mandal, district (e.g. Shamshabad)...'
            )}
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            style={styles.input}
            autoFocus={true}
          />
          {isSearching && <ActivityIndicator size="small" color={COLORS.primary} />}
          {query.length > 0 && !isSearching && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results / Possible Matches List */}
        {query.trim().length >= 2 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>
              {t('loc.searchMatches', 'Possible Matches')} ({results.length})
            </Text>

            {results.length === 0 && !isSearching ? (
              <Card style={styles.noResultsCard}>
                <Text style={styles.noResultsText}>
                  {t('loc.noMatches', 'No matching localities found. Try another search term.')}
                </Text>
              </Card>
            ) : (
              results.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(item)}
                >
                  <Card style={styles.resultCard}>
                    <View style={styles.resultRow}>
                      <View style={styles.resultTextCol}>
                        <View style={styles.localityNameRow}>
                          <Text style={styles.localityName}>{item.localityName}</Text>
                          <Badge label={item.dataQuality} variant="success" />
                        </View>
                        <Text style={styles.hierarchyText}>
                          {item.subDistrictName} {item.subDistrictType} • {item.districtName} District • {item.stateName}
                        </Text>
                        <Text style={styles.pincodeText}>PIN: {item.pincode}</Text>
                      </View>
                      <Text style={styles.arrowIcon}>→</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          /* Recommended Benchmark Presets */
          <View style={styles.presetsContainer}>
            <Text style={styles.sectionTitle}>Frequently Analyzed Localities:</Text>
            <View style={styles.presetsList}>
              {SEEDED_LOCALITIES.slice(0, 6).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(item)}
                >
                  <Card style={styles.presetCard}>
                    <View style={styles.resultRow}>
                      <View style={styles.resultTextCol}>
                        <Text style={styles.presetName}>📍 {item.localityName}</Text>
                        <Text style={styles.presetSub}>
                          {item.subDistrictName} {item.subDistrictType}, {item.districtName} ({item.stateName})
                        </Text>
                      </View>
                      <Text style={styles.arrowIcon}>→</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
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
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 16
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.textMuted,
    padding: 4
  },
  resultsContainer: {
    gap: 10
  },
  presetsContainer: {
    gap: 10
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  resultCard: {
    padding: 14,
    marginBottom: 8
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  resultTextCol: {
    flex: 1
  },
  localityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2
  },
  localityName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  hierarchyText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2
  },
  pincodeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2
  },
  arrowIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
    marginLeft: 8
  },
  presetCard: {
    padding: 12,
    marginBottom: 8
  },
  presetName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  presetSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  presetsList: {
    gap: 2
  },
  noResultsCard: {
    padding: 16,
    alignItems: 'center'
  },
  noResultsText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center'
  }
});
