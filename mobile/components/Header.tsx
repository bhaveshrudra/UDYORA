import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LanguageSelectorModal } from './LanguageSelectorModal';
import { Badge } from './Badge';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showLanguage?: boolean;
  showUserBadge?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'UDYORA',
  showBack = false,
  onBack,
  showLanguage = true,
  showUserBadge = true
}) => {
  const insets = useSafeAreaInsets();
  const { languageCode } = useLanguage();
  const { authStatus, user } = useAuth();
  const [langModalVisible, setLangModalVisible] = useState(false);

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
        <View style={styles.leftRow}>
          {showBack && onBack && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onBack}
              style={styles.backButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          )}

          <View>
            <Text style={styles.logoTitle}>{title}</Text>
            <Text style={styles.logoSubtitle}>Rural Business Intelligence</Text>
          </View>
        </View>

        <View style={styles.rightRow}>
          {showUserBadge && (
            <Badge
              label={authStatus === 'guest' ? 'GUEST' : user?.role === 'admin' ? 'ADMIN' : 'PROMOTER'}
              variant={authStatus === 'guest' ? 'neutral' : 'success'}
            />
          )}

          {showLanguage && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setLangModalVisible(true)}
              style={styles.langButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Change application language"
            >
              <Text style={styles.langText}>{languageCode} ▼</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  backArrow: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    color: COLORS.primaryDark
  },
  logoSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  langButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  langText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary
  }
});
