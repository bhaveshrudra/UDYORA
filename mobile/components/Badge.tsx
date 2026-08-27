import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../utils/constants';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', style }) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: COLORS.secondaryLight, text: COLORS.secondary, border: '#A7F3D0' };
      case 'warning':
        return { bg: COLORS.accentLight, text: COLORS.accent, border: '#FDE68A' };
      case 'danger':
        return { bg: COLORS.dangerLight, text: COLORS.danger, border: '#FECACA' };
      case 'neutral':
        return { bg: '#F1F5F9', text: COLORS.textSecondary, border: COLORS.border };
      case 'primary':
      default:
        return { bg: COLORS.primaryLight, text: COLORS.primary, border: '#BFDBFE' };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  }
});
