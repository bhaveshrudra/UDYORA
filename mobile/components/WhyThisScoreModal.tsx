import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback
} from 'react-native';
import { COLORS } from '../utils/constants';
import { CompleteAdvisoryReport } from '../types';
import { chartDataTransformers } from '../utils/chartDataTransformers';
import { Badge } from './Badge';

interface WhyThisScoreModalProps {
  visible: boolean;
  onClose: () => void;
  report: CompleteAdvisoryReport;
}

export const WhyThisScoreModal: React.FC<WhyThisScoreModalProps> = ({
  visible,
  onClose,
  report
}) => {
  if (!visible || !report) return null;

  const factors = chartDataTransformers.prepareScoreExplanation(report);
  const totalScore = report.feasibility.overallScore;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>🎯 WHY THIS SCORE ({totalScore}/100)?</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.introBox}>
                  <Text style={styles.introText}>
                    UDYORA computes feasibility using a <strong>deterministic multi-factor weighted model</strong>. No arbitrary or hallucinated scoring is used.
                  </Text>
                </View>

                {/* Factor Contribution Rows */}
                <View style={styles.factorsList}>
                  {factors.map((f, idx) => (
                    <View key={idx} style={styles.factorCard}>
                      <View style={styles.factorHeader}>
                        <Text style={styles.factorName}>{f.name}</Text>
                        <Badge label={`+${f.contributionPoints} pts (${f.weight}%)`} variant="primary" />
                      </View>

                      <View style={styles.scoreBarTrack}>
                        <View
                          style={[
                            styles.scoreBarFill,
                            { width: `${f.rawScore}%` }
                          ]}
                        />
                      </View>

                      <Text style={styles.factorRationale}>{f.rationale}</Text>
                    </View>
                  ))}
                </View>

                {/* Total Summation Box */}
                <View style={styles.totalBox}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Weighted Overall Feasibility:</Text>
                    <Text style={styles.totalVal}>{totalScore} / 100</Text>
                  </View>
                  <Text style={styles.totalSub}>
                    Rating: <strong>{report.feasibility.rating}</strong> (78% Evidence Confidence)
                  </Text>
                </View>
              </ScrollView>

              <TouchableOpacity style={styles.closeActionBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.closeActionText}>Close Breakdown</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    width: '100%',
    maxHeight: '85%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 10
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  closeBtn: {
    padding: 4
  },
  closeText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMuted
  },
  scroll: {
    paddingBottom: 16
  },
  introBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 12
  },
  introText: {
    fontSize: 11,
    color: COLORS.primaryDark,
    lineHeight: 15
  },
  factorsList: {
    gap: 8
  },
  factorCard: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  factorName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  scoreBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 2
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3
  },
  factorRationale: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 14
  },
  totalBox: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 12
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  totalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.secondary
  },
  totalSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  closeActionBtn: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  closeActionText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900'
  }
});
