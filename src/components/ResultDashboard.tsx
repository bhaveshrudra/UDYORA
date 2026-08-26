import React, { useState } from 'react';
import {
  FileText,
  Calculator,
  Award,
  Store,
  ShieldAlert,
  Database,
  Printer,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  IndianRupee,
  BarChart3,
  PieChart
} from 'lucide-react';
import { CompleteAnalysisReport } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { FeasibilityGauge } from './FeasibilityGauge';
import { FinancialPlanCard } from './FinancialPlanCard';
import { SchemeGuidanceCard } from './SchemeGuidanceCard';
import { MarketIntelligenceCard } from './MarketIntelligenceCard';
import { RiskAnalysisCard } from './RiskAnalysisCard';
import { EvidenceAuditCard } from './EvidenceAuditCard';

import {
  prepareOverviewPillarData,
  prepareFinancialChartData,
  prepareSchemeChartData,
  prepareMarketChartData,
  prepareRiskChartData,
  prepareEvidenceChartData
} from '../services/analyticsDataPipeline';

import {
  HorizontalBarChart,
  DonutChart,
  RepaymentLineChart,
  RiskMatrixGrid
} from './charts/DashboardCharts';

interface ResultDashboardProps {
  report: CompleteAnalysisReport;
  onReset: () => void;
  onPrint: () => void;
}

type TabType = 'overview' | 'financial' | 'schemes' | 'market' | 'risks' | 'evidence';

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  report,
  onReset,
  onPrint
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <FileText className="w-4 h-4" /> },
    { id: 'financial', label: t('dash.tab.finance'), icon: <Calculator className="w-4 h-4" /> },
    { id: 'schemes', label: t('dash.tab.schemes'), icon: <Award className="w-4 h-4" /> },
    { id: 'market', label: 'Market & Infrastructure', icon: <Store className="w-4 h-4" /> },
    { id: 'risks', label: t('dash.tab.risks'), icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'evidence', label: 'Evidence Audit', icon: <Database className="w-4 h-4" /> }
  ];

  // Defensive field unwrapping to prevent any undefined crashes
  const input = report.userInput || report.input || { businessIdea: 'Business Proposal', availableCapital: 100000 };
  const location = report.location || { village: 'Rural Hub', block: '', district: '', state: '' };
  const feasibilityVerdict = report.finalFeasibility || report.feasibilityVerdict;
  const financialPlan = report.financialPlan?.data || (report.financialPlan as any);
  const schemeMatches = report.schemeMatches || report.schemeGuidance?.data || [];
  const marketAnalysis = report.marketAnalysis || report.marketIntelligence?.data;
  const riskProfile = report.riskProfile || report.riskAnalysis?.data;
  const evidenceRecords = report.evidenceAudit || report.evidenceRecords || [];
  const reportId = report.id || report.reportId || 'UDY-REPORT';

  // Analytics Pipelines (Single Source of Truth)
  const pillarData = prepareOverviewPillarData(report);
  const financialData = prepareFinancialChartData(report);
  const schemeData = prepareSchemeChartData(report);
  const marketData = prepareMarketChartData(report);
  const riskData = prepareRiskChartData(report);
  const evidenceData = prepareEvidenceChartData(report);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Advisory Report Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-blue-800 text-blue-100 px-2.5 py-0.5 rounded">
              {t('dash.reportHeader')}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {t('dash.reportId')}: {reportId}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5">
            {input.businessIdea}
          </h1>

          <p className="text-xs text-slate-300 mt-1">
            {location.village}, Block {location.blockTaluk || location.block || ''}, District {location.district}, {location.state}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('nav.printReport')}</span>
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('nav.newAnalysis')}</span>
          </button>
        </div>
      </div>

      {/* Modern Horizontal Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl overflow-x-auto border border-slate-300/60">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* =========================================================================
          TAB 1: CONCISE EXECUTIVE OVERVIEW (NO DUPLICATE FULL CARDS)
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Feasibility Verdict Card */}
          {feasibilityVerdict && <FeasibilityGauge verdict={feasibilityVerdict} />}

          {/* Pillar-by-Pillar Readiness Score Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-700" />
                  <span>Pillar-by-Pillar Enterprise Feasibility Breakdown</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consolidated ratings generated by the multi-agent reasoning pipeline (0–100 scale).
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 hidden sm:inline">
                Deterministic Scoring
              </span>
            </div>

            <HorizontalBarChart
              items={pillarData.map((p) => ({
                id: p.id,
                label: p.name,
                value: p.score,
                max: 100,
                unit: '/ 100',
                color: p.color,
                badge: `${p.weight}% Weight`,
                summary: p.summary
              }))}
              maxValue={100}
            />
          </div>

          {/* Executive Summary Grid: Key Financial Snapshot, Opportunities & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Financial Position Snapshot */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <IndianRupee className="w-4 h-4 text-emerald-700" />
                <span>Financial Snapshot</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Own Capital Margin:</span>
                  <span className="font-bold text-slate-900">₹{financialData.ownCapital.toLocaleString('en-IN')} (10%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Project Cost:</span>
                  <span className="font-bold text-slate-900">₹{financialData.totalProjectCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Bank Loan Required:</span>
                  <span className="font-bold text-blue-900">₹{financialData.loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Monthly EMI:</span>
                  <span className="font-bold text-emerald-700">₹{financialData.monthlyEMI.toLocaleString('en-IN')} / mo</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('financial')}
                className="w-full text-center text-xs font-bold text-blue-700 hover:text-blue-900 pt-1 cursor-pointer flex items-center justify-center gap-1"
              >
                <span>View Full Financial Analytics</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Scheme Eligibility Snapshot */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <Award className="w-4 h-4 text-blue-700" />
                <span>Top Government Scheme</span>
              </div>
              {schemeData.length > 0 ? (
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-900 text-sm">
                    {schemeData[0].name}
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Eligible for up to <strong>{schemeData[0].subsidyPct}% rural credit subsidy</strong> under official MSME guidelines.
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {schemeData[0].status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      Match: {schemeData[0].matchScore}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No active government scheme matching this activity.</p>
              )}
              <button
                onClick={() => setActiveTab('schemes')}
                className="w-full text-center text-xs font-bold text-blue-700 hover:text-blue-900 pt-2 cursor-pointer flex items-center justify-center gap-1"
              >
                <span>View Scheme Recommendations</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Risk & Data Quality Snapshot */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Data Rigor & Risks</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Overall Risk Level:</span>
                  <span className="font-bold text-amber-800">{riskData.overallLevel}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Verified Evidence:</span>
                  <span className="font-bold text-emerald-800">{evidenceData.verifiedCount} Metrics</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Estimated Data:</span>
                  <span className="font-bold text-slate-700">{evidenceData.estimatedCount} Metrics</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('risks')}
                className="w-full text-center text-xs font-bold text-blue-700 hover:text-blue-900 pt-1 cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Inspect Risks & Mitigations</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: FINANCIAL PLAN WITH VISUAL CHARTS
          ========================================================================= */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Key Financial Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Own Capital (Margin)
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900">
                ₹{financialData.ownCapital.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">10% Contribution</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Indicative Project Cost
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900">
                ₹{financialData.totalProjectCost.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">CapEx + Working Cap</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Bank Loan Financing
              </span>
              <span className="text-lg sm:text-xl font-black text-blue-900">
                ₹{financialData.loanAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-bold text-blue-700 block mt-0.5">90% Debt Component</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Monthly EMI
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-800">
                ₹{financialData.monthlyEMI.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">DSCR: {financialData.dscr}x</span>
            </div>
          </div>

          {/* Visual Analytics Charts: Capital Structure Donut & Cost Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Capital Structure Donut */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-700" />
                  <span>Capital Structure Composition</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proportion of promoter equity margin vs bank debt financing.
                </p>
              </div>

              <DonutChart
                segments={financialData.capitalStructure}
                centerTitle={`₹${financialData.totalProjectCost.toLocaleString('en-IN')}`}
                centerSubtitle="Total Project"
              />
            </div>

            {/* Project Cost Breakdown Bars */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-700" />
                  <span>Estimated Cost Allocation</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standard enterprise CapEx, initial inventory, and working capital buffers.
                </p>
              </div>

              <HorizontalBarChart
                items={financialData.costBreakdown.map((c) => ({
                  label: c.name,
                  value: c.amount,
                  max: financialData.totalProjectCost,
                  unit: `(₹${c.amount.toLocaleString('en-IN')})`,
                  color: c.color,
                  badge: `${c.percentage}%`
                }))}
                valueFormat={(v) => `₹${v.toLocaleString('en-IN')}`}
                showSummary={false}
              />
            </div>
          </div>

          {/* Repayment Amortization Line Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-700" />
                <span>Repayment Schedule & Loan Amortization</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Principal balance trajectory over tenure calculated via institutional reducing balance formula.
              </p>
            </div>

            <RepaymentLineChart schedule={financialData.repaymentSchedule} />
          </div>

          {/* Detailed Financial Calculation Card */}
          {financialPlan && <FinancialPlanCard initialPlan={financialPlan} />}
        </div>
      )}

      {/* =========================================================================
          TAB 3: GOVERNMENT SCHEMES
          ========================================================================= */}
      {activeTab === 'schemes' && (
        <div className="space-y-6">
          {/* Scheme Match Score Analytics Bar Chart */}
          {schemeData.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-700" />
                  <span>Scheme Match & Qualification Score</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Algorithmically verified against activity eligibility and margin constraints.
                </p>
              </div>

              <HorizontalBarChart
                items={schemeData.map((s) => ({
                  id: s.id,
                  label: s.name,
                  value: s.matchScore,
                  max: 100,
                  unit: '%',
                  badge: s.status,
                  color: s.qualificationStatus === 'ELIGIBLE' ? '#059669' : '#2563eb',
                  summary: `Max loan ceiling: ₹${s.maxCeiling.toLocaleString('en-IN')} • Estimated subsidy: ${s.subsidyPct}%`
                }))}
                maxValue={100}
              />
            </div>
          )}

          {/* Scheme Guidance Cards & Detailed Checklists */}
          <SchemeGuidanceCard
            matchResults={schemeMatches}
            indicativeLoanAmount={financialData.loanAmount}
            beneficiaryCategory={input.beneficiaryCategory || 'General'}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 4: MARKET & INFRASTRUCTURE
          ========================================================================= */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          {/* Infrastructure Distance Matrix Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-700" />
                <span>Hyper-Local Infrastructure Distance Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Proximity to wholesale APMC mandis, dairy cooperative chilling hubs, and transport arteries.
              </p>
            </div>

            <HorizontalBarChart
              items={marketData.infrastructureDistances.map((d, idx) => ({
                id: `infra_${idx}`,
                label: d.label,
                value: d.distanceKm,
                max: 30,
                unit: 'km',
                color: d.color,
                badge: d.category,
                summary: d.distanceKm <= 5 ? 'Direct hyper-local advantage' : d.distanceKm <= 15 ? 'Accessible within 30 min transport' : 'District-level hub'
              }))}
              maxValue={30}
              valueFormat={(v) => `${v}`}
            />
          </div>

          {/* Detailed Market Intelligence Component */}
          {marketAnalysis && <MarketIntelligenceCard marketData={marketAnalysis} />}
        </div>
      )}

      {/* =========================================================================
          TAB 5: RISK ANALYSIS
          ========================================================================= */}
      {activeTab === 'risks' && (
        <div className="space-y-6">
          {/* Risk Level Donut & Matrix Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution Donut */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  <span>Risk Severity Distribution</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proportion of identified operational, market, and biosecurity vulnerabilities.
                </p>
              </div>

              <DonutChart
                segments={riskData.distribution.map((d) => ({
                  name: `${d.severity} Priority`,
                  value: d.count,
                  percentage: d.percentage,
                  color: d.color,
                  formatted: `${d.count} risks`
                }))}
                centerTitle={riskData.overallLevel}
                centerSubtitle="Overall Level"
              />
            </div>

            {/* 3x3 Likelihood x Impact Risk Matrix Grid */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-700" />
                  <span>3×3 Likelihood × Impact Risk Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click on any risk badge to inspect the recommended rural mitigation action.
                </p>
              </div>

              <RiskMatrixGrid items={riskData.matrixItems} />
            </div>
          </div>

          {/* Full Risk Analysis & Mitigations Card */}
          {riskProfile && <RiskAnalysisCard riskProfile={riskProfile} />}
        </div>
      )}

      {/* =========================================================================
          TAB 6: EVIDENCE AUDIT TRAIL
          ========================================================================= */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          {/* Data Quality Donut & Confidence by Domain */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Quality Donut */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-700" />
                  <span>Evidence Verification Ratio</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Breakdown of officially verified vs statistically estimated vs flagged parameters.
                </p>
              </div>

              <DonutChart
                segments={evidenceData.qualityDistribution}
                centerTitle={`${evidenceData.totalRecords}`}
                centerSubtitle="Total Metrics"
              />
            </div>

            {/* Domain Confidence Horizontal Bar Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Domain Confidence Scores</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mathematical confidence index derived from source authenticity and geographic specificity.
                </p>
              </div>

              <HorizontalBarChart
                items={evidenceData.confidenceByGroup.map((g, idx) => ({
                  id: `conf_${idx}`,
                  label: g.group,
                  value: g.confidencePct,
                  max: 100,
                  unit: '%',
                  color: g.color,
                  badge: `${g.recordCount} records`
                }))}
                maxValue={100}
                valueFormat={(v) => `${v}`}
              />
            </div>
          </div>

          {/* Full Searchable & Filterable Evidence Table */}
          {evidenceRecords && <EvidenceAuditCard evidenceRecords={evidenceRecords} />}
        </div>
      )}
    </div>
  );
};
