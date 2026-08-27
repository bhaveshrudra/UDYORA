import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageTag, SupportedLanguageInfo } from '../types';
import { RootStackScreenProps } from '../types/navigation';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DevResetButton } from '../components/DevResetButton';

export const LanguageSelectionScreen: React.FC<RootStackScreenProps<'LanguageSelection'>> = ({
  navigation,
  route
}) => {
  const insets = useSafeAreaInsets();
  const { currentLanguage, supportedLanguages, setLanguage, t } = useLanguage();

  const isFromSettings = route.params?.fromSettings;
  const [selectedTag, setSelectedTag] = useState<LanguageTag | null>(isFromSettings ? currentLanguage : null);

  // Prevent back navigation during mandatory first-start selection
  useEffect(() => {
    if (!isFromSettings) {
      const backAction = () => true; // Block Android back button
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }
  }, [isFromSettings]);

  const handleSelectLanguage = (tag: LanguageTag) => {
    setSelectedTag(tag);
  };

  const handleContinue = async () => {
    if (!selectedTag) return;
    await setLanguage(selectedTag);

    if (isFromSettings) {
      navigation.goBack();
    } else {
      navigation.replace('Authentication', undefined);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.header}>
          <BrandLogo size="medium" showText={false} style={styles.logo} />
          <Text style={styles.brandName}>UDYORA</Text>
          <Text style={styles.title}>{t('lang.title', 'Choose your preferred language')}</Text>
          <Text style={styles.subtitle}>
            మీ భాషను ఎంచుకోండి • अपनी भाषा चुनें • भाषा निवडा • ನಿಮ್ಮ ಭಾಷೆ
          </Text>
        </View>

        {/* Language Cards Grid */}
        <View style={styles.languagesList}>
          {supportedLanguages.map((lang: SupportedLanguageInfo) => {
            const isSelected = selectedTag === lang.tag;

            return (
              <TouchableOpacity
                key={lang.tag}
                activeOpacity={0.8}
                onPress={() => handleSelectLanguage(lang.tag)}
                accessible={true}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${lang.nativeName}, ${lang.name}`}
              >
                <Card active={isSelected} style={styles.card}>
                  <View style={styles.cardContent}>
                    <View style={styles.cardTextRow}>
                      <Text style={[styles.nativeText, isSelected && styles.activeNativeText]}>
                        {lang.nativeName}
                      </Text>
                      <Text style={[styles.englishText, isSelected && styles.activeEnglishText]}>
                        {lang.name}
                      </Text>
                    </View>

                    <View style={styles.rightPill}>
                      <Text style={[styles.codePill, isSelected && styles.activeCodePill]}>
                        {lang.code}
                      </Text>
                      <View style={[styles.checkCircle, isSelected && styles.activeCheckCircle]}>
                        {isSelected && <Text style={styles.checkMark}>✓</Text>}
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dev Reset Utility */}
        {__DEV__ && <DevResetButton />}
      </ScrollView>

      {/* Fixed Bottom Action Button */}
      <View style={styles.bottomBar}>
        <Button
          title={t('lang.continue', 'CONTINUE →')}
          disabled={!selectedTag}
          onPress={handleContinue}
          size="lg"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20
  },
  scroll: {
    paddingBottom: 24
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  logo: {
    marginBottom: 8
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    color: COLORS.primaryDark,
    marginBottom: 8
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16
  },
  languagesList: {
    gap: 12
  },
  card: {
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardTextRow: {
    flexDirection: 'column'
  },
  nativeText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  activeNativeText: {
    color: COLORS.primary
  },
  englishText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2
  },
  activeEnglishText: {
    color: COLORS.primary
  },
  rightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  codePill: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F1F5F9'
  },
  activeCodePill: {
    color: COLORS.primary,
    backgroundColor: '#DBEAFE'
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.borderDark,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeCheckCircle: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary
  },
  checkMark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900'
  },
  bottomBar: {
    paddingTop: 12
  }
});
