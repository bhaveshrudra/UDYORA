import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';
import { BarChartItem } from '../../utils/chartDataTransformers';

interface HorizontalBarChartProps {
  items: BarChartItem[];
  showSubText?: boolean;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  items,
  showSubText = true
}) => {
  if (!items || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>INSUFFICIENT DATA</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.map((item, idx) => {
        const pct = Math.min(100, Math.max(0, Math.round((item.value / item.max) * 100)));
        const barColor = item.color || COLORS.primary;

        return (
          <View key={idx} style={styles.rowContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={[styles.valueText, { color: barColor }]}>{item.displayValue}</Text>
            </View>

            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
            </View>

            {showSubText && item.subText && (
              <Text style={styles.subText}>{item.subText}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  rowContainer: {
    gap: 4
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8
  },
  valueText: {
    fontSize: 12,
    fontWeight: '900'
  },
  track: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 4
  },
  subText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
    lineHeight: 14
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8
  },
  emptyText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted
  }
});
