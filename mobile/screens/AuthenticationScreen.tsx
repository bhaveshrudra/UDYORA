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
import { COLORS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { RootStackScreenProps } from '../types/navigation';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DevResetButton } from '../components/DevResetButton';

export const AuthenticationScreen: React.FC<RootStackScreenProps<'Authentication'>> = ({
  navigation,
  route
}) => {
  const insets = useSafeAreaInsets();
  const { t, languageCode } = useLanguage();
  const { signIn, register, continueAsGuest, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>(
    route.params?.initialTab || 'signin'
  );

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('entrepreneur@udyora.gov.in');
  const [signInPassword, setSignInPassword] = useState('123456');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regPhoneOrEmail, setRegPhoneOrEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Inline Validation Error State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    setErrorMessage(null);
    if (!signInEmail.trim()) {
      setErrorMessage(t('auth.validation.emailRequired', 'Please enter your email address.'));
      return;
    }
    if (!signInEmail.includes('@')) {
      setErrorMessage(t('auth.validation.invalidEmail', 'Please enter a valid email address.'));
      return;
    }
    if (!signInPassword) {
      setErrorMessage(t('auth.validation.passwordRequired', 'Please enter your password.'));
      return;
    }
    if (signInPassword.length < 6) {
      setErrorMessage(t('auth.validation.passwordShort', 'Password must be at least 6 characters.'));
      return;
    }

    const res = await signIn(signInEmail, signInPassword);
    if (res.success) {
      navigation.replace('Permissions');
    } else {
      setErrorMessage(res.error || 'Authentication failed. Please check credentials.');
    }
  };

  const handleRegister = async () => {
    setErrorMessage(null);
    if (!regName.trim()) {
      setErrorMessage(t('auth.validation.nameRequired', 'Please enter your full name.'));
      return;
    }
    if (!regPhoneOrEmail.trim()) {
      setErrorMessage(t('auth.validation.phoneOrEmailRequired', 'Please enter your mobile or email.'));
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage(t('auth.validation.passwordShort', 'Password must be at least 6 characters.'));
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage(t('auth.validation.passwordMismatch', 'Passwords do not match.'));
      return;
    }

    const res = await register(regName, regPhoneOrEmail, regPassword);
    if (res.success) {
      navigation.replace('Permissions');
    } else {
      setErrorMessage(res.error || 'Registration failed.');
    }
  };

  const handleGuestAccess = () => {
    Alert.alert(
      t('auth.guestConfirmTitle', 'Continue as a Guest?'),
      t(
        'auth.guestConfirmDesc',
        'You can evaluate full business feasibility, local village data, and government subsidies without creating an account.'
      ),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('auth.guestProceedBtn', 'Proceed as Guest →'),
          style: 'default',
          onPress: async () => {
            await continueAsGuest();
            navigation.replace('Permissions');
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header with Language Indicator */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <BrandLogo size="compact" showText={false} />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('LanguageSelection', { fromSettings: true })}
          style={styles.langPill}
          accessible={true}
          accessibilityLabel="Change selected language"
        >
          <Text style={styles.langPillText}>🌐 {languageCode} ▼</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Intro Box */}
        <View style={styles.introBox}>
          <Text style={styles.welcomeTitle}>{t('auth.welcome', 'Welcome to UDYORA')}</Text>
          <Text style={styles.welcomeSub}>
            {t('auth.subtitle', 'Access your business intelligence workspace.')}
          </Text>
        </View>

        {/* Tab Segment Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setActiveTab('signin');
              setErrorMessage(null);
            }}
            style={[styles.tabBtn, activeTab === 'signin' && styles.activeTabBtn]}
          >
            <Text style={[styles.tabText, activeTab === 'signin' && styles.activeTabText]}>
              {t('auth.signInTab', 'SIGN IN')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setActiveTab('register');
              setErrorMessage(null);
            }}
            style={[styles.tabBtn, activeTab === 'register' && styles.activeTabBtn]}
          >
            <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
              {t('auth.createAccountTab', 'CREATE ACCOUNT')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inline Error Banner */}
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        )}

        {/* TAB 1: SIGN IN */}
        {activeTab === 'signin' && (
          <Card style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('auth.emailLabel', 'Email Address')}</Text>
              <TextInput
                style={styles.input}
                value={signInEmail}
                onChangeText={setSignInEmail}
                placeholder={t('auth.emailPlaceholder', 'entrepreneur@domain.in')}
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>{t('auth.passwordLabel', 'Password')}</Text>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      'Forgot Password',
                      'For prototype access, default password is: 123456'
                    )
                  }
                >
                  <Text style={styles.forgotText}>
                    {t('auth.forgotPassword', 'Forgot password?')}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                value={signInPassword}
                onChangeText={setSignInPassword}
                placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
              />
            </View>

            <Button
              title={t('auth.signInBtn', 'SIGN IN →')}
              loading={isLoading}
              onPress={handleSignIn}
              size="lg"
              style={styles.actionBtn}
            />
          </Card>
        )}

        {/* TAB 2: CREATE ACCOUNT */}
        {activeTab === 'register' && (
          <Card style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('auth.nameLabel', 'Full Name')}</Text>
              <TextInput
                style={styles.input}
                value={regName}
                onChangeText={setRegName}
                placeholder={t('auth.namePlaceholder', 'Enter your full name')}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                {t('auth.phoneOrEmailLabel', 'Mobile Number or Email')}
              </Text>
              <TextInput
                style={styles.input}
                value={regPhoneOrEmail}
                onChangeText={setRegPhoneOrEmail}
                placeholder={t('auth.phoneOrEmailPlaceholder', 'e.g. 9876543210 or email@domain.in')}
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('auth.passwordLabel', 'Password')}</Text>
              <TextInput
                style={styles.input}
                value={regPassword}
                onChangeText={setRegPassword}
                placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                {t('auth.confirmPasswordLabel', 'Confirm Password')}
              </Text>
              <TextInput
                style={styles.input}
                value={regConfirmPassword}
                onChangeText={setRegConfirmPassword}
                placeholder={t('auth.confirmPasswordPlaceholder', 'Re-enter your password')}
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
              />
            </View>

            <Button
              title={t('auth.createAccountBtn', 'CREATE ACCOUNT →')}
              loading={isLoading}
              onPress={handleRegister}
              size="lg"
              style={styles.actionBtn}
            />
          </Card>
        )}

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('auth.orDivider', 'OR')}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Continue as Guest Button */}
        <Card style={styles.guestCard}>
          <Text style={styles.guestTitle}>
            {t('auth.guestSubtitle', 'Instant access without account creation')}
          </Text>
          <Button
            title={t('auth.continueGuest', 'CONTINUE AS GUEST')}
            variant="outline"
            size="md"
            onPress={handleGuestAccess}
            style={styles.guestBtn}
          />
        </Card>

        {/* Dev Reset Utility */}
        {__DEV__ && <DevResetButton />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary
  },
  scroll: {
    padding: 20
  },
  introBox: {
    marginBottom: 16
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 4
  },
  welcomeSub: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: 18
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 3,
    marginBottom: 16
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11
  },
  activeTabBtn: {
    backgroundColor: COLORS.surface,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5
  },
  activeTabText: {
    color: COLORS.primaryDark
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14
  },
  errorText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger
  },
  formCard: {
    padding: 18,
    gap: 14
  },
  fieldGroup: {
    gap: 6
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  actionBtn: {
    marginTop: 6
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted
  },
  guestCard: {
    padding: 16,
    alignItems: 'center',
    gap: 10
  },
  guestTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  guestBtn: {
    width: '100%',
    borderColor: COLORS.primary
  }
});
