import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';
import { useLocation } from '../context/LocationContext';
import { RootStackScreenProps } from '../types/navigation';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { DevResetButton } from '../components/DevResetButton';

export const PermissionsScreen: React.FC<RootStackScreenProps<'Permissions'>> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t, languageCode } = useLanguage();
  const { authStatus } = useAuth();
  const {
    permissions,
    isLocationGranted,
    isMicrophoneGranted,
    requestLocation,
    requestMicrophone
  } = usePermissions();

  const { detectCurrentLocation, isDetecting } = useLocation();

  const [isLocRequesting, setIsLocRequesting] = useState(false);
  const [isMicRequesting, setIsMicRequesting] = useState(false);

  const handleAllowLocation = async () => {
    setIsLocRequesting(true);
    await requestLocation();
    setIsLocRequesting(false);
  };

  const handleAllowMicrophone = async () => {
    setIsMicRequesting(true);
    await requestMicrophone();
    setIsMicRequesting(false);
  };

  const handleUseCurrentLocation = async () => {
    if (!isLocationGranted) {
      const status = await requestLocation();
      if (status !== 'granted') {
        Alert.alert(
          t('perm.locDeniedLabel', 'LOCATION ACCESS DENIED'),
          'Please allow location permission in system settings or use manual location search.',
          [
            { text: 'Search Manually', onPress: () => navigation.navigate('LocationSearch') },
            { text: 'OK' }
          ]
        );
        return;
      }
    }

    const res = await detectCurrentLocation();
    if (res.success && res.data) {
      navigation.navigate('LocationConfirmation', {
        locationId: res.data.id,
        isGPSDetected: true
      });
    } else {
      Alert.alert(
        'GPS Detection Notice',
        res.error || 'Unable to determine GPS coordinates. You can search your locality manually.',
        [
          { text: 'Search Manually', onPress: () => navigation.navigate('LocationSearch') },
          { text: 'OK' }
        ]
      );
    }
  };

  const getStatusBadge = (status: 'unknown' | 'granted' | 'denied') => {
    switch (status) {
      case 'granted':
        return <Badge label={t('perm.statusGranted', 'Granted')} variant="success" />;
      case 'denied':
        return <Badge label={t('perm.statusDenied', 'Denied')} variant="danger" />;
      case 'unknown':
      default:
        return <Badge label={t('perm.statusNotGranted', 'Not granted')} variant="neutral" />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <BrandLogo size="compact" showText={false} />
        <View style={styles.badgeRow}>
          <Badge
            label={authStatus === 'guest' ? 'GUEST' : 'AUTHENTICATED'}
            variant={authStatus === 'guest' ? 'neutral' : 'success'}
          />
          <View style={styles.langPill}>
            <Text style={styles.langPillText}>{languageCode}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introBox}>
          <Text style={styles.heading}>{t('perm.heading', "LET'S SET UP UDYORA")}</Text>
          <Text style={styles.subHeading}>
            {t(
              'perm.subHeading',
              'To provide location-aware business intelligence and voice assistance, UDYORA needs access to your device location and microphone.'
            )}
          </Text>
        </View>

        {/* 1. LOCATION PERMISSION CARD */}
        <Card style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>📍</Text>
            </View>
            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>{t('perm.locTitle', 'LOCATION')}</Text>
                {getStatusBadge(permissions.location)}
              </View>
              <Text style={styles.cardDesc}>
                {t(
                  'perm.locSubtitle',
                  'Used to identify your current locality and nearby business context.'
                )}
              </Text>
            </View>
          </View>

          {/* Action Row depending on status */}
          {permissions.location === 'granted' ? (
            <View style={styles.grantedRow}>
              <Text style={styles.grantedText}>
                {t('perm.locGrantedLabel', 'LOCATION ACCESS GRANTED ✓')}
              </Text>
            </View>
          ) : permissions.location === 'denied' ? (
            <View style={styles.deniedBox}>
              <Text style={styles.deniedText}>
                {t('perm.locDeniedLabel', 'LOCATION ACCESS DENIED')}
              </Text>
              <View style={styles.btnRow}>
                <Button
                  title={t('perm.tryAgain', 'TRY AGAIN')}
                  variant="outline"
                  size="sm"
                  onPress={handleAllowLocation}
                  loading={isLocRequesting}
                />
                <Button
                  title={t('perm.manualSearch', 'ENTER LOCATION MANUALLY')}
                  variant="ghost"
                  size="sm"
                  onPress={() => navigation.navigate('LocationSearch')}
                />
              </View>
            </View>
          ) : (
            <Button
              title={t('perm.allowLocBtn', 'ALLOW LOCATION')}
              variant="primary"
              size="md"
              onPress={handleAllowLocation}
              loading={isLocRequesting}
              style={styles.cardBtn}
            />
          )}
        </Card>

        {/* 2. MICROPHONE PERMISSION CARD */}
        <Card style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>🎙️</Text>
            </View>
            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>{t('perm.micTitle', 'MICROPHONE')}</Text>
                {getStatusBadge(permissions.microphone)}
              </View>
              <Text style={styles.cardDesc}>
                {t(
                  'perm.micSubtitle',
                  'Used for voice-based business input and conversational assistance.'
                )}
              </Text>
            </View>
          </View>

          {permissions.microphone === 'granted' ? (
            <View style={styles.grantedRow}>
              <Text style={styles.grantedText}>MICROPHONE ACCESS GRANTED ✓</Text>
            </View>
          ) : (
            <View style={styles.btnRow}>
              <Button
                title={t('perm.allowMicBtn', 'ALLOW MICROPHONE')}
                variant="outline"
                size="sm"
                onPress={handleAllowMicrophone}
                loading={isMicRequesting}
                style={{ flex: 1 }}
              />
              {permissions.microphone !== 'denied' && (
                <Button
                  title={t('perm.notNow', 'NOT NOW')}
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    // Allows user to skip microphone without error
                  }}
                />
              )}
            </View>
          )}
        </Card>

        {/* Privacy Explanation Banner */}
        <View style={styles.privacyBox}>
          <Text style={styles.privacyText}>
            🔒 <strong>Privacy:</strong> {t('perm.privacyExplain', 'Your location is used to identify the selected locality and provide location-aware business intelligence.')} One-time check only; no continuous tracking.
          </Text>
        </View>

        {/* Dev Reset Utility */}
        {__DEV__ && <DevResetButton />}
      </ScrollView>

      {/* Bottom Sticky Action Buttons */}
      <View style={styles.bottomBar}>
        <Button
          title={t('perm.useCurrentLoc', 'USE MY CURRENT LOCATION')}
          onPress={handleUseCurrentLocation}
          loading={isDetecting}
          size="lg"
          style={styles.primaryBtn}
        />

        <Button
          title={t('perm.searchLocManually', 'SEARCH LOCATION MANUALLY')}
          variant="outline"
          size="md"
          onPress={() => navigation.navigate('LocationSearch')}
          style={styles.secondaryBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 18
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 12
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  langPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary
  },
  scroll: {
    paddingBottom: 16
  },
  introBox: {
    marginBottom: 16
  },
  heading: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: COLORS.primaryDark,
    marginBottom: 4
  },
  subHeading: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 18
  },
  card: {
    padding: 16,
    marginBottom: 12
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    fontSize: 18
  },
  info: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5
  },
  cardDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16
  },
  cardBtn: {
    marginTop: 12
  },
  grantedRow: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.secondaryLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  grantedText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.secondary
  },
  deniedBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.dangerLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8
  },
  deniedText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.danger
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10
  },
  privacyBox: {
    marginTop: 6,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  privacyText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 15
  },
  bottomBar: {
    paddingTop: 8,
    gap: 8
  },
  primaryBtn: {
    width: '100%'
  },
  secondaryBtn: {
    width: '100%'
  }
});
