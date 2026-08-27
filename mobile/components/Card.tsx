import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../utils/constants';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  active?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, active = false }) => {
  return (
    <View
      style={[
        styles.card,
        active && styles.activeCard,
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1
  },
  activeCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5
  }
});
