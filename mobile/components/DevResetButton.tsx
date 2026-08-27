import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

export const DevResetButton: React.FC = () => {
  const { resetAllState } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleReset = () => {
    Alert.alert(
      'Reset App State (Dev)',
      'This will clear saved language, authentication session, and guest state to simulate a fresh app install.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAllState();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Splash' }]
            });
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleReset}
      style={styles.btn}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Reset app state for testing"
    >
      <Text style={styles.text}>🔄 Reset State (Dev)</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 8
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B'
  }
});
