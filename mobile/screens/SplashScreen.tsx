import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { RootStackScreenProps } from '../types/navigation';
import { BrandLogo } from '../components/BrandLogo';

const LETTERS = ['U', 'D', 'Y', 'O', 'R', 'A'];

export const SplashScreen: React.FC<RootStackScreenProps<'Splash'>> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLanguageInitialized, hasStoredLanguage, t } = useLanguage();

  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [showSubtitle, setShowSubtitle] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  // Letter-by-letter reveal animation
  useEffect(() => {
    let current = 0;
    const letterInterval = setInterval(() => {
      current++;
      setVisibleCount(current);
      if (current >= LETTERS.length) {
        clearInterval(letterInterval);
        setShowSubtitle(true);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 7,
            useNativeDriver: true
          })
        ]).start();
      }
    }, 120); // 6 * 120ms = 720ms

    return () => clearInterval(letterInterval);
  }, []);

  // Navigation transition after 1.8s
  useEffect(() => {
    if (isLanguageInitialized) {
      const timer = setTimeout(() => {
        if (!hasStoredLanguage) {
          navigation.replace('LanguageSelection', undefined);
        } else {
          navigation.replace('Authentication', undefined);
        }
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [isLanguageInitialized, hasStoredLanguage, navigation]);

  const animatedWord = LETTERS.slice(0, visibleCount).join('');

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.centerContent}>
        {/* Official Brand Logo Mark */}
        <BrandLogo size="large" showText={false} inverted={true} style={styles.logo} />

        {/* Letter-By-Letter Animated Title */}
        <View style={styles.wordRow} accessible={true} accessibilityLabel="UDYORA">
          <Text style={styles.animatedTitle}>{animatedWord}</Text>
          {visibleCount < LETTERS.length && <Text style={styles.cursor}>|</Text>}
        </View>

        {/* Subtitle with Smooth Fade and Slide Up */}
        {showSubtitle && (
          <Animated.View
            style={[
              styles.subtitleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            <Text style={styles.subtitle}>
              Hyper-Local Business Intelligence
            </Text>
            <Text style={styles.subtitleSub}>
              for Rural Entrepreneurs
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Official Government Alignment Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerGov}>
          {t('app.govHeader', 'GOVERNMENT OF INDIA • LOCAL GOVERNMENT DIRECTORY (LGD)')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  logo: {
    marginBottom: 20
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52
  },
  animatedTitle: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 6,
    color: COLORS.textInverted
  },
  cursor: {
    fontSize: 34,
    fontWeight: '300',
    color: '#60A5FA',
    marginLeft: 4
  },
  subtitleContainer: {
    alignItems: 'center',
    marginTop: 10
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center'
  },
  subtitleSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2
  },
  footer: {
    paddingBottom: 16,
    alignItems: 'center'
  },
  footerGov: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    textAlign: 'center'
  }
});
