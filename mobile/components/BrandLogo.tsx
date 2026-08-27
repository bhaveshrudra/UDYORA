import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../utils/constants';

interface BrandLogoProps {
  size?: 'large' | 'medium' | 'compact';
  showText?: boolean;
  inverted?: boolean;
  style?: ViewStyle;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'medium',
  showText = true,
  inverted = false,
  style
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'large':
        return { img: 72, title: 28, sub: 12, gap: 10 };
      case 'compact':
        return { img: 32, title: 16, sub: 10, gap: 6 };
      case 'medium':
      default:
        return { img: 48, title: 20, sub: 11, gap: 8 };
    }
  };

  const dims = getDimensions();

  return (
    <View
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel="UDYORA official brand logo"
      style={[styles.container, { gap: dims.gap }, style]}
    >
      <View style={[styles.imageWrapper, { width: dims.img, height: dims.img, borderRadius: dims.img / 4 }]}>
        <Image
          source={require('../assets/icon.png')}
          style={{ width: dims.img, height: dims.img, borderRadius: dims.img / 4 }}
          resizeMode="contain"
        />
      </View>

      {showText && (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.brandTitle,
              { fontSize: dims.title, color: inverted ? COLORS.textInverted : COLORS.primaryDark }
            ]}
          >
            UDYORA
          </Text>
          <Text
            style={[
              styles.brandSub,
              { fontSize: dims.sub, color: inverted ? '#CBD5E1' : COLORS.textSecondary }
            ]}
          >
            Hyper-Local Business Intelligence
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageWrapper: {
    overflow: 'hidden',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2
  },
  textContainer: {
    alignItems: 'center'
  },
  brandTitle: {
    fontWeight: '900',
    letterSpacing: 2,
    lineHeight: undefined
  },
  brandSub: {
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center'
  }
});
