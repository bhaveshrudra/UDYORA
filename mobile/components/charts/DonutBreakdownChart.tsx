import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';
import { DonutSegment } from '../../utils/chartDataTransformers';

interface DonutBreakdownChartProps {
  title?: string;
  segments: DonutSegment[];
}

export const DonutBreakdownChart: React.FC<DonutBreakdownChartProps> = ({
  title,
  segments
}) => {
  if (!segments || segments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>INSUFFICIENT DATA</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      {/* Multi-Segment Stacked Bar Gauge */}
      <View style={styles.multiBar}>
        {segments.map((seg, idx) => (
          <View
            key={idx}
            style={[
              styles.barSegment,
              { width: `${seg.percentage}%`, backgroundColor: seg.color },
              idx === 0 && styles.firstSegment,
              idx === segments.length - 1 && styles.lastSegment
            ]}
          />
        ))}
      </View>

      {/* Legend & Percentages List */}
      <View style={styles.legendContainer}>
        {segments.map((seg, idx) => (
          <View key={idx} style={styles.legendRow}>
            <View style={styles.legendLeft}>
              <View style={[styles.colorDot, { backgroundColor: seg.color }]} />
              <Text style={styles.legendLabel}>{seg.label}</Text>
            </View>
            <View style={styles.legendRight}>
              {seg.formattedAmount && (
                <Text style={styles.legendAmount}>{seg.formattedAmount}</Text>
              )}
              <Text style={[styles.legendPct, { color: seg.color }]}>
                ({seg.percentage}%)
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  multiBar: {
    flexDirection: 'row',
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 6
  },
  barSegment: {
    height: '100%'
  },
  firstSegment: {
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7
  },
  lastSegment: {
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7
  },
  legendContainer: {
    gap: 6
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  legendAmount: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  legendPct: {
    fontSize: 11,
    fontWeight: '900'
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8
  },
  emptyText: {
    fontSize: 11,
    color: COLORS.textMuted
  }
});
