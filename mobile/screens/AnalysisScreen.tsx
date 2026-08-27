import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { useBusinessProfile } from '../context/BusinessProfileContext';
import { useReport } from '../context/ReportContext';
import { RootStackScreenProps } from '../types/navigation';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { orchestratorService } from '../services/orchestratorService';
import { AgentStatusInfo } from '../types';

export const AnalysisScreen: React.FC<RootStackScreenProps<'Analysis'>> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { userContext } = useBusinessProfile();
  const { setReport } = useReport();

  const [statuses, setStatuses] = useState<Record<string, AgentStatusInfo>>({
    business: { agentName: 'business', displayName: 'Business Analysis', status: 'WAITING' },
    market: { agentName: 'market', displayName: 'Market Intelligence', status: 'WAITING' },
    financial: { agentName: 'financial', displayName: 'Financial Planning', status: 'WAITING' },
    scheme: { agentName: 'scheme', displayName: 'Scheme Analysis', status: 'WAITING' },
    risk: { agentName: 'risk', displayName: 'Risk Assessment', status: 'WAITING' },
    evidence: { agentName: 'evidence', displayName: 'Evidence Audit', status: 'WAITING' },
    validator: { agentName: 'validator', displayName: 'Validation Engine', status: 'WAITING' },
    finalAdvisor: { agentName: 'finalAdvisor', displayName: 'Final Advisory Synthesis', status: 'WAITING' }
  });

  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startAnalysis = async () => {
    setIsRunning(true);
    setErrorMessage(null);
    setLogs(['Initializing UDYORA Multi-Agent Execution Graph...']);

    const res = await orchestratorService.runAnalysis(userContext, (updatedStatuses, logMsg) => {
      setStatuses(updatedStatuses);
      if (logMsg) {
        setLogs((prev) => [...prev, logMsg]);
      }
    });

    if (res.success && res.report) {
      setReport(res.report);
      setIsRunning(false);
      setTimeout(() => {
        navigation.replace('ResultDashboard', { assessmentId: res.report?.assessmentId });
      }, 600);
    } else {
      setIsRunning(false);
      setErrorMessage(res.error || 'Failed to complete analysis.');
    }
  };

  useEffect(() => {
    startAnalysis();
    return () => {
      orchestratorService.cancelAnalysis();
    };
  }, []);

  const handleCancel = () => {
    orchestratorService.cancelAnalysis();
    navigation.goBack();
  };

  const getStatusIcon = (status: AgentStatusInfo['status']) => {
    switch (status) {
      case 'RUNNING':
        return <ActivityIndicator size="small" color={COLORS.primary} />;
      case 'COMPLETED':
        return <Text style={styles.statusSuccessIcon}>✓</Text>;
      case 'FAILED':
        return <Text style={styles.statusFailIcon}>✕</Text>;
      case 'WAITING':
      default:
        return <Text style={styles.statusWaitIcon}>○</Text>;
    }
  };

  const completedCount = Object.values(statuses).filter((s) => s.status === 'COMPLETED').length;
  const progressPct = Math.round((completedCount / 8) * 100);

  return (
    <View style={styles.container}>
      <Header title="UDYORA" showBack={false} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.stepBadge}>MULTI-AGENT ORCHESTRATION</Text>
          <Text style={styles.title}>UDYORA BUSINESS ANALYSIS</Text>
          <Text style={styles.subtitle}>
            Analyzing your business using available location, market, financial and scheme evidence.
          </Text>
        </View>

        {/* Progress Bar Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Execution Progress</Text>
            <Text style={styles.progressPercent}>{progressPct}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressSub}>
            {completedCount} of 8 Autonomous Engines Completed
          </Text>
        </Card>

        {/* Agent Status List */}
        <Card style={styles.agentListCard}>
          <Text style={styles.listTitle}>AUTONOMOUS AGENT PIPELINE</Text>
          <View style={styles.agentRows}>
            {Object.values(statuses).map((agent) => (
              <View key={agent.agentName} style={styles.agentRow}>
                <View style={styles.agentLeft}>
                  <View style={styles.iconContainer}>{getStatusIcon(agent.status)}</View>
                  <Text
                    style={[
                      styles.agentName,
                      agent.status === 'RUNNING' && styles.agentNameRunning,
                      agent.status === 'COMPLETED' && styles.agentNameCompleted
                    ]}
                  >
                    {agent.displayName}
                  </Text>
                </View>
                <Badge
                  label={agent.status}
                  variant={
                    agent.status === 'COMPLETED'
                      ? 'success'
                      : agent.status === 'RUNNING'
                      ? 'primary'
                      : agent.status === 'FAILED'
                      ? 'danger'
                      : 'neutral'
                  }
                />
              </View>
            ))}
          </View>
        </Card>

        {/* Expandable Live Analysis Log */}
        <Card style={styles.logCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowLogs(!showLogs)}
            style={styles.logHeader}
          >
            <Text style={styles.logTitle}>
              {showLogs ? '▼ VIEW ANALYSIS DETAILS' : '▶ VIEW ANALYSIS DETAILS'}
            </Text>
            <Text style={styles.logCount}>{logs.length} events</Text>
          </TouchableOpacity>

          {showLogs && (
            <View style={styles.logBody}>
              {logs.map((msg, idx) => (
                <Text key={idx} style={styles.logLine}>
                  › {msg}
                </Text>
              ))}
            </View>
          )}
        </Card>

        {/* Error Notification if any */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Analysis Notice</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <View style={styles.errorActions}>
              <Button title="RETRY ANALYSIS" onPress={startAnalysis} size="md" />
              <Button
                title="Return to Profile"
                variant="outline"
                size="md"
                onPress={() => navigation.goBack()}
              />
            </View>
          </View>
        )}

        {/* Cancel Button */}
        {isRunning && !errorMessage && (
          <View style={styles.cancelContainer}>
            <Button
              title="Cancel Analysis"
              variant="outline"
              size="md"
              onPress={handleCancel}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scroll: {
    padding: 18
  },
  header: {
    marginBottom: 14
  },
  stepBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 2
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  progressCard: {
    padding: 14,
    marginBottom: 12
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase'
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4
  },
  progressSub: {
    fontSize: 10,
    color: COLORS.textMuted
  },
  agentListCard: {
    padding: 14,
    marginBottom: 12
  },
  listTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 10
  },
  agentRows: {
    gap: 10
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  agentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconContainer: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusWaitIcon: {
    fontSize: 14,
    color: COLORS.textMuted
  },
  statusSuccessIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.secondary
  },
  statusFailIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.danger
  },
  agentName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  agentNameRunning: {
    color: COLORS.primaryDark,
    fontWeight: '900'
  },
  agentNameCompleted: {
    color: COLORS.textPrimary,
    fontWeight: '800'
  },
  logCard: {
    padding: 12,
    backgroundColor: '#0F172A',
    marginBottom: 14
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5
  },
  logCount: {
    fontSize: 10,
    color: '#64748B'
  },
  logBody: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 8,
    gap: 4
  },
  logLine: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#38BDF8',
    lineHeight: 14
  },
  errorBox: {
    padding: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 14
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.danger,
    marginBottom: 4
  },
  errorText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 10
  },
  errorActions: {
    flexDirection: 'row',
    gap: 8
  },
  cancelContainer: {
    marginTop: 4
  }
});
