import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { useReport } from '../context/ReportContext';
import { RootStackScreenProps } from '../types/navigation';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { formatINR } from '../utils/formatters';
import { UdyoraMap } from '../components/UdyoraMap';
import { chartDataTransformers } from '../utils/chartDataTransformers';
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart';
import { DonutBreakdownChart } from '../components/charts/DonutBreakdownChart';
import { WhyThisScoreModal } from '../components/WhyThisScoreModal';
import { ChatbotAdvisorySheet } from '../components/ChatbotAdvisorySheet';

type TabKey =
  | 'overview'
  | 'financial'
  | 'schemes'
  | 'market'
  | 'risks'
  | 'evidence'
  | 'comparison';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'financial', label: 'Financial Plan', icon: '💰' },
  { key: 'schemes', label: 'Govt Schemes', icon: '🏛️' },
  { key: 'market', label: 'Market & Map', icon: '📍' },
  { key: 'risks', label: 'Risk Analysis', icon: '🛡️' },
  { key: 'evidence', label: 'Evidence Audit', icon: '📑' },
  { key: 'comparison', label: 'Compare Options', icon: '⚖️' }
];

export const ResultsScreen: React.FC<RootStackScreenProps<'ResultDashboard'>> = ({
  navigation
}) => {
  const insets = useSafeAreaInsets();
  const { currentLanguage, languageCode, t } = useLanguage();
  const { report } = useReport();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [whyScoreVisible, setWhyScoreVisible] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mapRadius, setMapRadius] = useState<number>(5);

  if (!report) {
    return (
      <View style={styles.container}>
        <Header title="UDYORA" showBack={true} onBack={() => navigation.goBack()} />
        <View style={styles.fallbackCenter}>
          <Text style={styles.fallbackTitle}>No Advisory Report Available</Text>
          <Text style={styles.fallbackSub}>
            Please configure and execute your business analysis to generate a dossier.
          </Text>
          <Button
            title="Start Business Planning"
            onPress={() => navigation.navigate('BusinessInput')}
            style={{ marginTop: 14 }}
          />
        </View>
      </View>
    );
  }

  const {
    businessSummary,
    feasibility,
    financial,
    schemes,
    risks,
    evidence,
    domainComparison,
    recommendations,
    userContext
  } = report;

  // Chart Data Preparation (Memoized via pure transformer functions)
  const feasibilityChartData = chartDataTransformers.prepareFeasibilityChartData(report);
  const capitalStructureData = chartDataTransformers.prepareFinancialCapitalStructure(report);
  const costBreakdownData = chartDataTransformers.prepareCostBreakdown(report);
  const riskDistData = chartDataTransformers.prepareRiskDistribution(report);
  const evidenceDistData = chartDataTransformers.prepareEvidenceDistribution(report);
  const comparisonChartData = chartDataTransformers.prepareComparisonChartData(report);
  const informationGaps = chartDataTransformers.prepareInformationGaps(report);

  // Native Multilingual Text-to-Speech
  const handleReadSummary = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${recommendations.executiveSummary} ${recommendations.primaryActionableSteps.join('. ')}`;
    setIsSpeaking(true);

    Speech.speak(textToRead, {
      language: currentLanguage,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  // Native Share Report
  const handleShareReport = async () => {
    try {
      const shareMsg = `UDYORA Business Advisory Report\nLocation: ${userContext.locationContext.localityName}\nBusiness: ${businessSummary.businessCategory}\nFeasibility Score: ${feasibility.overallScore}/100 (${feasibility.rating})\nPromoter Equity: ₹${financial.availableEquity.toLocaleString('en-IN')}\nIndicative Scale: ₹${financial.indicativeProjectCost.toLocaleString('en-IN')}\nMonthly EMI: ₹${financial.monthlyEMI.toLocaleString('en-IN')}\nGenerated via UDYORA Hyper-Local Advisory Engine.`;
      await Share.share({ message: shareMsg, title: 'UDYORA Business Advisory Report' });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="UDYORA" showBack={true} onBack={() => navigation.navigate('BusinessInput')} />

      {/* Top Banner with Assessment ID and Locality */}
      <View style={styles.reportTopBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.topAssessmentLabel}>YOUR BUSINESS ASSESSMENT</Text>
          <Text style={styles.topLocality}>
            📍 {userContext.locationContext.localityName} ({userContext.locationContext.districtName}, {userContext.locationContext.stateName})
          </Text>
          <Text style={styles.topSector}>
            {businessSummary.businessCategory} • Equity: {formatINR(financial.availableEquity)}
          </Text>
        </View>
        <Badge label={`SCORE ${feasibility.overallScore}`} variant="success" />
      </View>

      {/* Horizontal Scrollable Tab Bar */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabBtn, isActive && styles.activeTabBtn]}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Tab Content */}
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 36 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Action Pills: Read Summary, Why This Score, Chatbot, Share */}
        <View style={styles.quickActionsBar}>
          <TouchableOpacity
            style={[styles.actionPill, isSpeaking && styles.activeActionPill]}
            onPress={handleReadSummary}
            activeOpacity={0.8}
          >
            <Text style={styles.actionPillText}>
              {isSpeaking ? '⏹ Stop Voice' : '🔊 Read Summary'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => setWhyScoreVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionPillText}>🎯 Why this Score?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => setChatbotVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionPillText}>💬 Ask Advisor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            onPress={handleShareReport}
            activeOpacity={0.8}
          >
            <Text style={styles.actionPillText}>📤 Share</Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {/* Feasibility Hero Gauge Card */}
            <Card style={styles.scoreHeroCard}>
              <View style={styles.scoreRow}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreNumber}>{feasibility.overallScore}</Text>
                  <Text style={styles.scoreDenominator}>/100</Text>
                </View>
                <View style={styles.scoreDetails}>
                  <Text style={styles.scoreRatingText}>{feasibility.rating}</Text>
                  <Text style={styles.confidenceText}>Assessment Confidence: 78%</Text>
                  <Text style={styles.confidenceDisclaimer}>
                    Confidence reflects evidence quality & availability, not guaranteed business success.
                  </Text>
                </View>
              </View>
            </Card>

            {/* Top Recommendation Badge */}
            <Card style={styles.recommendationCard}>
              <Text style={styles.recHeading}>UDYORA'S ASSESSMENT</Text>
              <Text style={styles.recBadgeText}>PROCEED WITH FURTHER VALIDATION</Text>
              <Text style={styles.execSummaryText}>{recommendations.executiveSummary}</Text>
            </Card>

            {/* Feasibility Factor Breakdown Chart */}
            <Card style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderTitle}>FEASIBILITY FACTOR BREAKDOWN</Text>
                <TouchableOpacity onPress={() => setWhyScoreVisible(true)}>
                  <Text style={styles.linkText}>View Math ›</Text>
                </TouchableOpacity>
              </View>
              <HorizontalBarChart items={feasibilityChartData} showSubText={false} />
            </Card>

            {/* Key Opportunities */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>🌟 KEY OPPORTUNITIES</Text>
              <View style={styles.bulletList}>
                {businessSummary.keyOpportunities.map((op, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletIcon}>✓</Text>
                    <Text style={styles.bulletText}>{op}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Key Risks */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>⚠️ KEY OPERATIONAL RISKS</Text>
              <View style={styles.riskList}>
                {risks.factors.slice(0, 3).map((r) => (
                  <View key={r.id} style={styles.riskItemCard}>
                    <View style={styles.riskItemHeader}>
                      <Text style={styles.riskItemName}>{r.name}</Text>
                      <Badge
                        label={`${r.severity} SEVERITY`}
                        variant={r.severity === 'HIGH' ? 'danger' : 'neutral'}
                      />
                    </View>
                    <Text style={styles.riskReasonText}>{r.reason}</Text>
                    <View style={styles.mitigationPill}>
                      <Text style={styles.mitigationPillText}>
                        🛡️ <strong>Mitigation:</strong> {r.mitigation}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>

            {/* What Should I Do Next? */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>🚀 WHAT SHOULD I DO NEXT?</Text>
              <View style={styles.stepsList}>
                {recommendations.primaryActionableSteps.map((step, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Important Information Gaps */}
            <Card style={styles.gapsCard}>
              <Text style={styles.gapsTitle}>ℹ️ IMPORTANT INFORMATION GAPS</Text>
              <Text style={styles.gapsSub}>
                To maintain transparency, UDYORA highlights areas where ground evidence is incomplete:
              </Text>
              <View style={styles.gapsList}>
                {informationGaps.map((gap, i) => (
                  <Text key={i} style={styles.gapItem}>
                    • {gap}
                  </Text>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 2: FINANCIAL PLAN */}
        {/* ======================================================== */}
        {activeTab === 'financial' && (
          <View style={styles.tabContent}>
            {/* KPI Grid */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>FINANCIAL STRUCTURE (INDICATIVE)</Text>
              <View style={styles.finGrid}>
                <View style={styles.finCell}>
                  <Text style={styles.finLabel}>Promoter Own Equity</Text>
                  <Text style={[styles.finVal, { color: COLORS.secondary }]}>
                    {formatINR(financial.availableEquity)}
                  </Text>
                  <Text style={styles.finSub}>{financial.promoterMarginPercentage}% Margin (SIH26091)</Text>
                </View>
                <View style={styles.finCell}>
                  <Text style={styles.finLabel}>Indicative Project Scale</Text>
                  <Text style={styles.finVal}>{formatINR(financial.indicativeProjectCost)}</Text>
                  <Text style={styles.finSub}>10x Promoter Equity</Text>
                </View>
                <View style={styles.finCell}>
                  <Text style={styles.finLabel}>Bank Term Loan</Text>
                  <Text style={[styles.finVal, { color: COLORS.primary }]}>
                    {formatINR(financial.termLoanAmount)}
                  </Text>
                  <Text style={styles.finSub}>5 Yrs @ {financial.interestRateAnnual}% p.a.</Text>
                </View>
                <View style={styles.finCell}>
                  <Text style={styles.finLabel}>Monthly EMI</Text>
                  <Text style={[styles.finVal, { color: COLORS.primaryDark }]}>
                    {formatINR(financial.monthlyEMI)}
                  </Text>
                  <Text style={styles.finSub}>60 Monthly Installments</Text>
                </View>
              </View>
            </Card>

            {/* Capital Structure Donut Chart */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>CAPITAL STRUCTURE BREAKDOWN</Text>
              <DonutBreakdownChart segments={capitalStructureData} />
            </Card>

            {/* Cost Breakdown Chart */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>ESTIMATED COST BREAKDOWN</Text>
              <HorizontalBarChart items={costBreakdownData} showSubText={true} />
            </Card>

            {/* Cash Flow & DSCR */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>ANNUAL CASH FLOW & PROFITABILITY</Text>
              <View style={styles.profitList}>
                <View style={styles.profitRow}>
                  <Text style={styles.profitLabel}>Gross Annual Turnover:</Text>
                  <Text style={styles.profitVal}>{formatINR(financial.estimatedAnnualRevenue)}</Text>
                </View>
                <View style={styles.profitRow}>
                  <Text style={styles.profitLabel}>Operating Costs (Feed / Labor / Power):</Text>
                  <Text style={styles.profitVal}>- {formatINR(financial.estimatedAnnualOperatingCost)}</Text>
                </View>
                <View style={styles.profitRow}>
                  <Text style={styles.profitLabel}>Annual Debt Servicing (EMI x 12):</Text>
                  <Text style={styles.profitVal}>- {formatINR(financial.monthlyEMI * 12)}</Text>
                </View>
                <View style={[styles.profitRow, styles.netProfitRow]}>
                  <Text style={styles.netProfitLabel}>Estimated Net Take-Home Profit:</Text>
                  <Text style={styles.netProfitVal}>{formatINR(financial.estimatedAnnualNetProfit)}/yr</Text>
                </View>
              </View>

              <View style={styles.dscrBanner}>
                <Text style={styles.dscrText}>
                  🛡️ <strong>Debt Service Coverage Ratio (DSCR):</strong> {financial.debtServiceCoverageRatio}x (Healthy safety margin &gt; 1.5x)
                </Text>
              </View>
            </Card>

            {/* 5-Year Amortization Schedule */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>5-YEAR LOAN REPAYMENT SCHEDULE</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { width: '15%' }]}>Year</Text>
                  <Text style={[styles.th, { width: '30%' }]}>Principal</Text>
                  <Text style={[styles.th, { width: '25%' }]}>Interest</Text>
                  <Text style={[styles.th, { width: '30%' }]}>Closing</Text>
                </View>
                {financial.repaymentSchedule.map((row) => (
                  <View key={row.year} style={styles.tableRow}>
                    <Text style={[styles.td, { width: '15%', fontWeight: '800' }]}>Year {row.year}</Text>
                    <Text style={[styles.td, { width: '30%' }]}>{formatINR(row.principalPaid)}</Text>
                    <Text style={[styles.td, { width: '25%' }]}>{formatINR(row.interestPaid)}</Text>
                    <Text style={[styles.td, { width: '30%' }]}>{formatINR(row.closingBalance)}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 3: GOVERNMENT SCHEMES */}
        {/* ======================================================== */}
        {activeTab === 'schemes' && (
          <View style={styles.tabContent}>
            {schemes.map((scheme) => (
              <Card key={scheme.schemeId} style={styles.schemeCard}>
                <View style={styles.schemeHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.schemeName}>{scheme.schemeName}</Text>
                    <Text style={styles.schemeMinistry}>{scheme.ministryAgency}</Text>
                  </View>
                  <Badge label={scheme.matchStatus} variant="success" />
                </View>

                {scheme.subsidyPercentage > 0 && (
                  <View style={styles.subsidyBox}>
                    <Text style={styles.subsidyBig}>
                      {scheme.subsidyPercentage}% Capital Subsidy
                    </Text>
                    <Text style={styles.subsidyAmt}>
                      Eligible Grant Component: Up to {formatINR(scheme.estimatedSubsidyAmount)}
                    </Text>
                  </View>
                )}

                <View style={styles.schemeSection}>
                  <Text style={styles.schemeSectionTitle}>Why It Matches & Key Benefits:</Text>
                  {scheme.keyBenefits.map((b, i) => (
                    <Text key={i} style={styles.schemeBullet}>
                      ✓ {b}
                    </Text>
                  ))}
                </View>

                <View style={styles.schemeSection}>
                  <Text style={styles.schemeSectionTitle}>Required Application Checklist:</Text>
                  {scheme.requiredDocuments.map((d, i) => (
                    <Text key={i} style={styles.schemeDoc}>
                      📄 {d}
                    </Text>
                  ))}
                </View>

                <View style={styles.schemeFooter}>
                  <Text style={styles.schemePortal}>Official Application Portal: {scheme.officialPortalUrl}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MARKET & MAP */}
        {/* ======================================================== */}
        {activeTab === 'market' && (
          <View style={styles.tabContent}>
            {/* Interactive Map Catchment View */}
            <View style={styles.mapSection}>
              <UdyoraMap
                latitude={userContext.locationContext.latitude}
                longitude={userContext.locationContext.longitude}
                localityName={userContext.locationContext.localityName}
                subDistrictName={`${userContext.locationContext.subDistrictName} ${userContext.locationContext.subDistrictType}`}
                districtName={userContext.locationContext.districtName}
                radiusKm={mapRadius}
                height={280}
                onRadiusChange={(r) => setMapRadius(r)}
              />
            </View>

            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>LOCAL MARKET INTELLIGENCE</Text>
              <Text style={styles.marketDesc}>{report.market.marketOpportunityText}</Text>
              <View style={styles.infraGrid}>
                <View style={styles.infraCell}>
                  <Text style={styles.infraLabel}>Catchment Accessibility</Text>
                  <Text style={styles.infraVal}>{report.market.accessibilityRating}</Text>
                </View>
                <View style={styles.infraCell}>
                  <Text style={styles.infraLabel}>Observed Commercial POIs</Text>
                  <Text style={styles.infraVal}>{report.market.observedCompetitorCount} Facilities</Text>
                </View>
              </View>

              <Text style={[styles.cardHeaderTitle, { marginTop: 10 }]}>FIELD OBSERVATIONS</Text>
              {report.market.observations.map((obs, i) => (
                <Text key={i} style={styles.obsBullet}>
                  • {obs}
                </Text>
              ))}
            </Card>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 5: RISK ANALYSIS */}
        {/* ======================================================== */}
        {activeTab === 'risks' && (
          <View style={styles.tabContent}>
            {/* Severity Distribution Chart */}
            <Card style={styles.sectionCard}>
              <View style={styles.riskOverviewHeader}>
                <Text style={styles.cardHeaderTitle}>RISK SEVERITY DISTRIBUTION</Text>
                <Badge label={`OVERALL ${risks.overallRiskRating} RISK`} variant="primary" />
              </View>
              <DonutBreakdownChart segments={riskDistData} />
            </Card>

            {/* Individual Risk Mitigations */}
            {risks.factors.map((risk) => (
              <Card key={risk.id} style={styles.riskCard}>
                <View style={styles.riskCardTop}>
                  <Text style={styles.riskName}>{risk.name}</Text>
                  <Badge
                    label={`${risk.severity} SEVERITY`}
                    variant={risk.severity === 'HIGH' ? 'danger' : 'neutral'}
                  />
                </View>
                <Text style={styles.riskReason}>
                  <strong>Risk Driver:</strong> {risk.reason}
                </Text>
                <View style={styles.mitigationBox}>
                  <Text style={styles.mitigationText}>
                    🛡️ <strong>Recommended Mitigation:</strong> {risk.mitigation}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 6: EVIDENCE AUDIT */}
        {/* ======================================================== */}
        {activeTab === 'evidence' && (
          <View style={styles.tabContent}>
            {/* Data Quality Distribution Chart */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>EVIDENCE DATA QUALITY DISTRIBUTION</Text>
              <DonutBreakdownChart segments={evidenceDistData} />
            </Card>

            {/* Verifiable Evidence Table */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>AUDITED GROUND EVIDENCE RECORDS</Text>
              <View style={styles.evidenceList}>
                {evidence.map((ev) => (
                  <View key={ev.id} style={styles.evRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.evMetric}>{ev.metric}</Text>
                      <Text style={styles.evVal}>{ev.value}</Text>
                      <Text style={styles.evSource}>Source: {ev.source}</Text>
                    </View>
                    <Badge label={ev.status} variant="success" />
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 7: BUSINESS COMPARISON */}
        {/* ======================================================== */}
        {activeTab === 'comparison' && (
          <View style={styles.tabContent}>
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>OTHER BUSINESS DOMAIN OPTIONS</Text>
              <Text style={styles.evidenceDesc}>
                Comparative suitability ranking for this specific location and promoter equity level:
              </Text>
              <HorizontalBarChart items={comparisonChartData} showSubText={true} />
            </Card>
          </View>
        )}

        {/* Mandatory Transparency Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            ℹ️ <strong>UDYORA Disclaimer:</strong> UDYORA provides decision-support based on available evidence, configured rules and estimates. It does not guarantee business success, financing approval or commercial outcomes.
          </Text>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomActions}>
          <Button
            title="← Adjust Business Profile"
            variant="outline"
            size="md"
            onPress={() => navigation.navigate('BusinessInput')}
          />
        </View>
      </ScrollView>

      {/* Interactive "Why This Score?" Mathematical Modal */}
      <WhyThisScoreModal
        visible={whyScoreVisible}
        onClose={() => setWhyScoreVisible(false)}
        report={report}
      />

      {/* Interactive Chatbot Advisory Sheet */}
      <ChatbotAdvisorySheet
        visible={chatbotVisible}
        onClose={() => setChatbotVisible(false)}
        report={report}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  reportTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  topBarLeft: {
    flex: 1,
    marginRight: 8
  },
  topAssessmentLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5
  },
  topLocality: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 1
  },
  topSector: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  tabsContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  tabsRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    gap: 4
  },
  activeTabBtn: {
    backgroundColor: COLORS.primaryDark
  },
  tabIcon: {
    fontSize: 12
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary
  },
  activeTabLabel: {
    color: '#FFF'
  },
  scroll: {
    padding: 16
  },
  quickActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap'
  },
  actionPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  activeActionPill: {
    backgroundColor: COLORS.dangerLight,
    borderColor: COLORS.danger
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  tabContent: {
    gap: 12
  },
  scoreHeroCard: {
    padding: 16,
    backgroundColor: '#1E3A8A'
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  scoreCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#93C5FD'
  },
  scoreNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFF'
  },
  scoreDenominator: {
    fontSize: 10,
    color: '#BFDBFE',
    fontWeight: '700'
  },
  scoreDetails: {
    flex: 1
  },
  scoreRatingText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#93C5FD',
    marginTop: 2
  },
  confidenceDisclaimer: {
    fontSize: 9,
    color: '#BFDBFE',
    marginTop: 2,
    lineHeight: 12
  },
  recommendationCard: {
    padding: 14,
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0'
  },
  recHeading: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.5
  },
  recBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.secondary,
    marginVertical: 3
  },
  execSummaryText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
    fontWeight: '500'
  },
  sectionCard: {
    padding: 14
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8
  },
  linkText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary
  },
  bulletList: {
    gap: 6
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  bulletIcon: {
    color: COLORS.secondary,
    fontWeight: '900',
    fontSize: 12
  },
  bulletText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 16,
    flex: 1
  },
  riskList: {
    gap: 8
  },
  riskItemCard: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4
  },
  riskItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  riskItemName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  riskReasonText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15
  },
  mitigationPill: {
    backgroundColor: '#EFF6FF',
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  mitigationPillText: {
    fontSize: 10,
    color: COLORS.primaryDark,
    lineHeight: 14
  },
  stepsList: {
    gap: 8
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 17
  },
  gapsCard: {
    padding: 14,
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A'
  },
  gapsTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B45309',
    marginBottom: 4
  },
  gapsSub: {
    fontSize: 10,
    color: '#92400E',
    marginBottom: 6
  },
  gapsList: {
    gap: 4
  },
  gapItem: {
    fontSize: 10,
    color: '#78350F',
    lineHeight: 14
  },
  finGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  finCell: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  finLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase'
  },
  finVal: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginVertical: 2
  },
  finSub: {
    fontSize: 10,
    color: COLORS.textSecondary
  },
  profitList: {
    gap: 6
  },
  profitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  profitLabel: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  profitVal: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  netProfitRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
    marginTop: 2
  },
  netProfitLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.secondary
  },
  netProfitVal: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.secondary
  },
  dscrBanner: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 10
  },
  dscrText: {
    fontSize: 11,
    color: COLORS.secondary
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 8
  },
  th: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border
  },
  td: {
    fontSize: 10,
    color: COLORS.textPrimary
  },
  schemeCard: {
    padding: 14,
    gap: 10
  },
  schemeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  schemeName: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  schemeMinistry: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  subsidyBox: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  subsidyBig: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.secondary
  },
  subsidyAmt: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 1
  },
  schemeSection: {
    gap: 3
  },
  schemeSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase'
  },
  schemeBullet: {
    fontSize: 11,
    color: COLORS.textPrimary,
    lineHeight: 15
  },
  schemeDoc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15
  },
  schemeFooter: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: 6
  },
  schemePortal: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: '700'
  },
  mapSection: {
    marginBottom: 4
  },
  marketDesc: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 17,
    marginBottom: 8
  },
  infraGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6
  },
  infraCell: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  infraLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  infraVal: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2
  },
  obsBullet: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16
  },
  riskOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  riskCard: {
    padding: 12,
    gap: 6
  },
  riskCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  riskName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8
  },
  riskReason: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15
  },
  mitigationBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  mitigationText: {
    fontSize: 10,
    color: COLORS.primaryDark,
    lineHeight: 14
  },
  evidenceDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 10
  },
  evidenceList: {
    gap: 8
  },
  evRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border
  },
  evMetric: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  evVal: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginTop: 1
  },
  evSource: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1
  },
  disclaimerBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 4
  },
  disclaimerText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 14
  },
  bottomActions: {
    marginTop: 8
  },
  fallbackCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  fallbackSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4
  }
});
