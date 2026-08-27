import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { useReport } from '../context/ReportContext';
import { RootStackScreenProps } from '../types/navigation';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { formatINR } from '../utils/formatters';

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
  { key: 'financial', label: 'Financial', icon: '💰' },
  { key: 'schemes', label: 'Schemes', icon: '🏛️' },
  { key: 'market', label: 'Market', icon: '📍' },
  { key: 'risks', label: 'Risks', icon: '🛡️' },
  { key: 'evidence', label: 'Evidence', icon: '📑' },
  { key: 'comparison', label: 'Compare', icon: '⚖️' }
];

export const ResultDashboardScreen: React.FC<RootStackScreenProps<'ResultDashboard'>> = ({
  navigation
}) => {
  const insets = useSafeAreaInsets();
  const { languageCode } = useLanguage();
  const { report } = useReport();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

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

  return (
    <View style={styles.container}>
      <Header title="UDYORA" showBack={true} onBack={() => navigation.navigate('BusinessInput')} />

      {/* Top Fixed Header with Assessment ID */}
      <View style={styles.reportTopBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.topLocality}>
            📍 {userContext.locationContext.localityName} ({userContext.locationContext.districtName})
          </Text>
          <Text style={styles.topSector}>
            {businessSummary.businessCategory} Farming / Enterprise
          </Text>
        </View>
        <Badge label={`SCORE ${feasibility.overallScore}`} variant="success" />
      </View>

      {/* Horizontal Tab Navigator */}
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
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {/* Feasibility Hero Card */}
            <Card style={styles.scoreHeroCard}>
              <View style={styles.scoreRow}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreNumber}>{feasibility.overallScore}</Text>
                  <Text style={styles.scoreDenominator}>/100</Text>
                </View>
                <View style={styles.scoreDetails}>
                  <Text style={styles.scoreRatingText}>{feasibility.rating}</Text>
                  <Text style={styles.scoreSub}>
                    Weighted multi-factor score across market, capital fit, DSCR, and infrastructure.
                  </Text>
                </View>
              </View>
            </Card>

            {/* Multilingual Executive Summary */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>EXECUTIVE ADVISORY SUMMARY</Text>
              <Text style={styles.execSummaryText}>{recommendations.executiveSummary}</Text>
            </Card>

            {/* Actionable Next Steps */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>PRIMARY ACTIONABLE NEXT STEPS</Text>
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

            {/* Key Opportunities & Constraints */}
            <View style={styles.oppGrid}>
              <Card style={styles.oppCard}>
                <Text style={styles.oppTitle}>🌟 Key Opportunities</Text>
                {businessSummary.keyOpportunities.map((op, i) => (
                  <Text key={i} style={styles.oppItem}>
                    • {op}
                  </Text>
                ))}
              </Card>

              <Card style={styles.oppCard}>
                <Text style={styles.oppTitle}>⚠️ Operating Constraints</Text>
                {businessSummary.keyConstraints.map((cn, i) => (
                  <Text key={i} style={styles.oppItem}>
                    • {cn}
                  </Text>
                ))}
              </Card>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 2: FINANCIAL PLAN */}
        {/* ======================================================== */}
        {activeTab === 'financial' && (
          <View style={styles.tabContent}>
            {/* Capital Structure Card */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>CAPITAL FINANCING STRUCTURE (SIH26091)</Text>
              <View style={styles.finGrid}>
                <View style={styles.finCell}>
                  <Text style={styles.finLabel}>Promoter Own Equity</Text>
                  <Text style={[styles.finVal, { color: COLORS.secondary }]}>
                    {formatINR(financial.availableEquity)}
                  </Text>
                  <Text style={styles.finSub}>{financial.promoterMarginPercentage}% Margin</Text>
                </View>
                <View style={styles.finCell}>
                  <Text style={styles.finLabel}>Indicative Project Cost</Text>
                  <Text style={styles.finVal}>{formatINR(financial.indicativeProjectCost)}</Text>
                  <Text style={styles.finSub}>10x Equity Standard</Text>
                </View>
                <View style={styles.finCell}>
                  <Text style={styles.finLabel}>Bank Term Loan</Text>
                  <Text style={[styles.finVal, { color: COLORS.primary }]}>
                    {formatINR(financial.termLoanAmount)}
                  </Text>
                  <Text style={styles.finSub}>5 Yrs @ 9.25% p.a.</Text>
                </View>
                <View style={styles.finCell}>
                  <Text style={styles.finLabel}>Monthly EMI</Text>
                  <Text style={[styles.finVal, { color: COLORS.primaryDark }]}>
                    {formatINR(financial.monthlyEMI)}
                  </Text>
                  <Text style={styles.finSub}>60 Installments</Text>
                </View>
              </View>
            </Card>

            {/* Profitability & Cash Flow Card */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>ESTIMATED ANNUAL CASH FLOW</Text>
              <View style={styles.profitList}>
                <View style={styles.profitRow}>
                  <Text style={styles.profitLabel}>Gross Annual Turnover / Revenue:</Text>
                  <Text style={styles.profitVal}>{formatINR(financial.estimatedAnnualRevenue)}</Text>
                </View>
                <View style={styles.profitRow}>
                  <Text style={styles.profitLabel}>Operating & Feed / Raw Material Cost:</Text>
                  <Text style={styles.profitVal}>- {formatINR(financial.estimatedAnnualOperatingCost)}</Text>
                </View>
                <View style={styles.profitRow}>
                  <Text style={styles.profitLabel}>Annual Loan Servicing (EMI x 12):</Text>
                  <Text style={styles.profitVal}>- {formatINR(financial.monthlyEMI * 12)}</Text>
                </View>
                <View style={[styles.profitRow, styles.netProfitRow]}>
                  <Text style={styles.netProfitLabel}>Estimated Net Take-Home Profit:</Text>
                  <Text style={styles.netProfitVal}>{formatINR(financial.estimatedAnnualNetProfit)}/yr</Text>
                </View>
              </View>

              <View style={styles.dscrBanner}>
                <Text style={styles.dscrText}>
                  🛡️ <strong>Debt Service Coverage Ratio (DSCR):</strong> {financial.debtServiceCoverageRatio}x (Healthy buffer &gt; 1.5x)
                </Text>
              </View>
            </Card>

            {/* Amortization Table */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>5-YEAR LOAN REPAYMENT SCHEDULE</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { width: '15%' }]}>Yr</Text>
                  <Text style={[styles.th, { width: '30%' }]}>Principal</Text>
                  <Text style={[styles.th, { width: '25%' }]}>Interest</Text>
                  <Text style={[styles.th, { width: '30%' }]}>Closing</Text>
                </View>
                {financial.repaymentSchedule.map((row) => (
                  <View key={row.year} style={styles.tableRow}>
                    <Text style={[styles.td, { width: '15%', fontWeight: '800' }]}>Y{row.year}</Text>
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
                      Eligible Grant: Up to {formatINR(scheme.estimatedSubsidyAmount)}
                    </Text>
                  </View>
                )}

                <View style={styles.schemeSection}>
                  <Text style={styles.schemeSectionTitle}>Key Financial Benefits:</Text>
                  {scheme.keyBenefits.map((b, i) => (
                    <Text key={i} style={styles.schemeBullet}>
                      ✓ {b}
                    </Text>
                  ))}
                </View>

                <View style={styles.schemeSection}>
                  <Text style={styles.schemeSectionTitle}>Required Application Documents:</Text>
                  {scheme.requiredDocuments.map((d, i) => (
                    <Text key={i} style={styles.schemeDoc}>
                      📄 {d}
                    </Text>
                  ))}
                </View>

                <View style={styles.schemeFooter}>
                  <Text style={styles.schemePortal}>Official Portal: {scheme.officialPortalUrl}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MARKET & INFRASTRUCTURE */}
        {/* ======================================================== */}
        {activeTab === 'market' && (
          <View style={styles.tabContent}>
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>LOCAL MARKET & ACCESSIBILITY</Text>
              <Text style={styles.marketDesc}>{report.market.marketOpportunityText}</Text>
              <View style={styles.infraGrid}>
                <View style={styles.infraCell}>
                  <Text style={styles.infraLabel}>Catchment Accessibility</Text>
                  <Text style={styles.infraVal}>{report.market.accessibilityRating}</Text>
                </View>
                <View style={styles.infraCell}>
                  <Text style={styles.infraLabel}>Observed Commercial POIs</Text>
                  <Text style={styles.infraVal}>{report.market.observedCompetitorCount} Observed</Text>
                </View>
              </View>

              <Text style={[styles.cardHeaderTitle, { marginTop: 12 }]}>FIELD OBSERVATIONS</Text>
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
            <View style={styles.riskOverviewHeader}>
              <Text style={styles.riskOverviewTitle}>Overall Risk Rating</Text>
              <Badge
                label={risks.overallRiskRating}
                variant={
                  risks.overallRiskRating === 'LOW'
                    ? 'success'
                    : risks.overallRiskRating === 'MODERATE'
                    ? 'primary'
                    : 'danger'
                }
              />
            </View>

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
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>VERIFIABLE EVIDENCE REPOSITORY</Text>
              <Text style={styles.evidenceDesc}>
                All metrics used in this feasibility assessment are linked to ground administrative directories, spatial maps, or deterministic financial standards.
              </Text>

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
        {/* TAB 7: BUSINESS DOMAIN COMPARISON */}
        {/* ======================================================== */}
        {activeTab === 'comparison' && (
          <View style={styles.tabContent}>
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>BUSINESS DOMAIN COMPARISON ENGINE</Text>
              <Text style={styles.evidenceDesc}>
                Comparative suitability ranking for this specific location and promoter equity level.
              </Text>

              <View style={styles.domainList}>
                {domainComparison.map((item, idx) => (
                  <View
                    key={item.domain}
                    style={[styles.domainRow, item.isProposed && styles.proposedDomainRow]}
                  >
                    <View style={styles.domainRankCol}>
                      <Text style={styles.domainRank}>#{idx + 1}</Text>
                    </View>
                    <View style={styles.domainInfo}>
                      <View style={styles.domainNameRow}>
                        <Text style={styles.domainName}>
                          {item.domain === 'Dairy' ? '🥛 ' : item.domain === 'Retail' ? '🛍️ ' : item.domain === 'Tailoring' ? '🧵 ' : '🐣 '}
                          {item.domain}
                        </Text>
                        {item.isProposed && <Badge label="PROPOSED" variant="primary" />}
                      </View>
                      <Text style={styles.domainAdvantage}>{item.keyAdvantage}</Text>
                      <Text style={styles.domainMeta}>
                        Capital Fit: {item.promoterCapitalFit} • Demand: {item.localMarketDemand}
                      </Text>
                    </View>
                    <View style={styles.domainScoreBadge}>
                      <Text style={styles.domainScoreNum}>{item.suitabilityScore}</Text>
                      <Text style={styles.domainScoreDenom}>/100</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* Disclaimer Bottom Banner */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>{recommendations.cautionNotice}</Text>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button
            title="← Adjust Business Profile"
            variant="outline"
            size="md"
            onPress={() => navigation.navigate('BusinessInput')}
          />
        </View>
      </ScrollView>
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
    marginRight: 10
  },
  topLocality: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  topSector: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 1
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#93C5FD'
  },
  scoreNumber: {
    fontSize: 24,
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
    fontSize: 15,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5
  },
  scoreSub: {
    fontSize: 11,
    color: '#BFDBFE',
    marginTop: 2,
    lineHeight: 15
  },
  sectionCard: {
    padding: 14
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8
  },
  execSummaryText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 19,
    fontWeight: '500'
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
  oppGrid: {
    flexDirection: 'row',
    gap: 8
  },
  oppCard: {
    flex: 1,
    padding: 12
  },
  oppTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6
  },
  oppItem: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 14,
    marginBottom: 4
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
    paddingVertical: 4
  },
  riskOverviewTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary
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
  domainList: {
    gap: 8
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  proposedDomainRow: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary
  },
  domainRankCol: {
    width: 24
  },
  domainRank: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textMuted
  },
  domainInfo: {
    flex: 1,
    paddingHorizontal: 6
  },
  domainNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  domainName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  domainAdvantage: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  domainMeta: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1
  },
  domainScoreBadge: {
    alignItems: 'center'
  },
  domainScoreNum: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.secondary
  },
  domainScoreDenom: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted
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
