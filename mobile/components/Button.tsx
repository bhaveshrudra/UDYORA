import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle
} from 'react-native';
import { COLORS } from '../utils/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle
}) => {
  const getButtonStyles = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: COLORS.secondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.borderDark };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      case 'danger':
        return { backgroundColor: COLORS.danger };
      case 'primary':
      default:
        return { backgroundColor: COLORS.primary };
    }
  };

  const getTextStyles = (): TextStyle => {
    switch (variant) {
      case 'outline':
        return { color: COLORS.textPrimary };
      case 'ghost':
        return { color: COLORS.primary };
      case 'primary':
      case 'secondary':
      case 'danger':
      default:
        return { color: COLORS.textInverted };
    }
  };

  const getSizeStyles = (): { btn: ViewStyle; txt: TextStyle } => {
    switch (size) {
      case 'sm':
        return { btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }, txt: { fontSize: 12 } };
      case 'lg':
        return { btn: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 18 }, txt: { fontSize: 16 } };
      case 'md':
      default:
        return { btn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14 }, txt: { fontSize: 14 } };
    }
  };

  const sizeStyle = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        getButtonStyles(),
        sizeStyle.btn,
        (disabled || loading) && styles.disabledButton,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.textInverted}
        />
      ) : (
        <>
          {icon && icon}
          <Text style={[styles.baseText, getTextStyles(), sizeStyle.txt, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  baseText: {
    fontWeight: '800',
    textAlign: 'center'
  },
  disabledButton: {
    opacity: 0.5
  }
});
