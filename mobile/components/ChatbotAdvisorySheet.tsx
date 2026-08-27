import React, { useState } from 'react';
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
import { formatINR } from '../utils/formatters';
import { Badge } from './Badge';

interface ChatbotAdvisorySheetProps {
  visible: boolean;
  onClose: () => void;
  report: CompleteAdvisoryReport;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export const ChatbotAdvisorySheet: React.FC<ChatbotAdvisorySheetProps> = ({
  visible,
  onClose,
  report
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_welcome',
      sender: 'bot',
      text: `Hello! I am your UDYORA Business Advisor. I have analyzed your ${report.businessSummary.businessCategory} proposal for ${report.userContext.locationContext.localityName}. How can I assist you with this report?`
    }
  ]);

  const quickQuestions = [
    {
      q: 'What is my monthly EMI and financing structure?',
      a: `Based on your available equity of ${formatINR(report.financial.availableEquity)}, your indicative project scale is ${formatINR(report.financial.indicativeProjectCost)}. The required bank term loan is ${formatINR(report.financial.termLoanAmount)} at 9.25% interest with an estimated monthly EMI of ${formatINR(report.financial.monthlyEMI)} over 5 years (60 months). Your projected DSCR is ${report.financial.debtServiceCoverageRatio}x.`
    },
    {
      q: 'Which government scheme gives the best subsidy?',
      a: `The highest matching scheme is ${report.schemes[0]?.schemeName || 'PMEGP'} offering up to ${report.schemes[0]?.subsidyPercentage || 35}% capital subsidy (estimated grant of ${formatINR(report.schemes[0]?.estimatedSubsidyAmount || 0)}) in rural zones with collateral-free credit cover.`
    },
    {
      q: 'What are the top risks and how do I mitigate them?',
      a: `Your overall risk level is ${report.risks.overallRiskRating}. Key risks include: ${report.risks.factors.slice(0, 2).map((r) => `${r.name} (${r.mitigation})`).join('; ')}.`
    },
    {
      q: 'Compare other business options for my capital.',
      a: `For your location and equity of ${formatINR(report.financial.availableEquity)}, UDYORA ranked: ${report.domainComparison.map((d, i) => `#${i + 1} ${d.domain} (${d.suitabilityScore}/100)`).join(', ')}.`
    },
    {
      q: 'What local evidence was used for this score?',
      a: `This dossier audited ${report.evidence.length} evidence records, including Local Government Directory (LGD) administrative boundaries, OpenStreetMap commercial POI grids, and RBI priority sector lending norms.`
    }
  ];

  const handleAsk = (q: string, a: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `u_${Date.now()}`, sender: 'user', text: q },
      { id: `b_${Date.now()}`, sender: 'bot', text: a }
    ]);
  };

  if (!visible || !report) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>💬 UDYORA Advisor Chat</Text>
                  <Badge label="DOSSIER LINKED" variant="success" />
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Chat Messages Stream */}
              <ScrollView
                contentContainerStyle={styles.chatStream}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((m) => (
                  <View
                    key={m.id}
                    style={[
                      styles.msgBubble,
                      m.sender === 'user' ? styles.userBubble : styles.botBubble
                    ]}
                  >
                    <Text
                      style={[
                        styles.msgText,
                        m.sender === 'user' ? styles.userText : styles.botText
                      ]}
                    >
                      {m.text}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              {/* Quick Suggestion Chips */}
              <View style={styles.chipsSection}>
                <Text style={styles.chipsTitle}>Quick Questions:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsRow}
                >
                  {quickQuestions.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.7}
                      onPress={() => handleAsk(item.q, item.a)}
                      style={styles.chip}
                    >
                      <Text style={styles.chipText}>💬 {item.q}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
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
    padding: 18,
    width: '100%',
    height: '80%',
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
    paddingBottom: 10,
    marginBottom: 10
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
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
  chatStream: {
    paddingBottom: 10,
    gap: 10
  },
  msgBubble: {
    padding: 12,
    borderRadius: 14,
    maxWidth: '88%'
  },
  botBubble: {
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  userBubble: {
    backgroundColor: COLORS.primaryDark,
    alignSelf: 'flex-end'
  },
  msgText: {
    fontSize: 12,
    lineHeight: 18
  },
  botText: {
    color: COLORS.textPrimary,
    fontWeight: '500'
  },
  userText: {
    color: '#FFF',
    fontWeight: '700'
  },
  chipsSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10
  },
  chipsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6
  },
  chipsRow: {
    gap: 8
  },
  chip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary
  }
});
