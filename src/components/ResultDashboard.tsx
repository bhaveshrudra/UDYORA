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
  Info
} from 'lucide-react';
import { CompleteAnalysisReport } from '../types';
import { FeasibilityGauge } from './FeasibilityGauge';
import { FinancialPlanCard } from './FinancialPlanCard';
import { SchemeGuidanceCard } from './SchemeGuidanceCard';
import { MarketIntelligenceCard } from './MarketIntelligenceCard';
import { RiskAnalysisCard } from './RiskAnalysisCard';
import { EvidenceAuditCard } from './EvidenceAuditCard';
import { useLanguage } from '../i18n/LanguageContext';

interface ResultDashboardProps {
  report: CompleteAnalysisReport;
  onReset: () => void;
  onPrint: () => void;
}

type TabType = 'all' | 'financial' | 'schemes' | 'market' | 'risks' | 'evidence';

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  report,
  onReset,
  onPrint
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t('dash.tab.all'), icon: <FileText className="w-4 h-4" /> },
    { id: 'financial', label: t('dash.tab.finance'), icon: <Calculator className="w-4 h-4" /> },
    { id: 'schemes', label: t('dash.tab.schemes'), icon: <Award className="w-4 h-4" /> },
    { id: 'market', label: t('dash.tab.market'), icon: <Store className="w-4 h-4" /> },
    { id: 'risks', label: t('dash.tab.risks'), icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'evidence', label: t('dash.tab.evidence'), icon: <Database className="w-4 h-4" /> }
  ];

  // Defensive field unwrapping to prevent any undefined crashes
  const input = report.userInput || report.input || { businessIdea: 'Business Proposal' };
  const location = report.location || { village: '', block: '', district: '', state: '' };
  const feasibilityVerdict = report.finalFeasibility || report.feasibilityVerdict;
  const financialPlan = report.financialPlan?.data || (report.financialPlan as any);
  const schemeMatches = report.schemeMatches || report.schemeGuidance?.data || [];
  const marketAnalysis = report.marketAnalysis || report.marketIntelligence?.data || {
    demandSummary: '',
    catchmentDemographics: { targetVillagePopulation: 0, households: 0 },
    competitionLevel: 'LOW',
    competitionDensity: 'LOW',
    competitionSummary: '',
    demandDrivers: [],
    infrastructureProximity: [],
    potentialDemandIndicators: [],
    nearbyFacilities: [],
    dataLimitations: []
  };
  const riskProfile = report.riskProfile || report.riskAnalysis?.data || {
    overallRiskLevel: 'MEDIUM',
    riskFactors: [],
    dataConfidenceScore: 0.8,
    insufficientDataFields: []
  };
  const evidenceRecords = report.evidenceRecords || report.evidenceAuditLog || [];
  const reportId = report.id || report.reportId || 'UDY-REPORT';

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
            {location.village}, Block {location.block}, District {location.district}, {location.state}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-700" />
            <span>{t('nav.printReport')}</span>
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-300" />
            <span>{t('nav.newSearch')}</span>
          </button>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Content Views */}
      <div className="space-y-6">
        {/* TAB: ALL / FULL REPORT */}
        {activeTab === 'all' && (
          <>
            {/* 1. Feasibility Gauge */}
            {feasibilityVerdict && <FeasibilityGauge verdict={feasibilityVerdict} />}

            {/* 2. Deterministic Financial Plan */}
            {financialPlan && <FinancialPlanCard initialPlan={financialPlan} />}

            {/* 3. Rule-Based Government Scheme Guidance */}
            <SchemeGuidanceCard schemes={schemeMatches} />

            {/* 4. Hyper-Local Market & Infrastructure */}
            <MarketIntelligenceCard marketData={marketAnalysis} />

            {/* 5. Multidimensional Risk Matrix */}
            <RiskAnalysisCard riskProfile={riskProfile} />

            {/* 6. Evidence & Ground Truth Audit Trail */}
            <EvidenceAuditCard evidenceRecords={evidenceRecords} />
          </>
        )}

        {/* TAB: FINANCIAL ONLY */}
        {activeTab === 'financial' && (
          <>
            {financialPlan && <FinancialPlanCard initialPlan={financialPlan} />}
            {feasibilityVerdict && <FeasibilityGauge verdict={feasibilityVerdict} />}
          </>
        )}

        {/* TAB: SCHEMES ONLY */}
        {activeTab === 'schemes' && (
          <SchemeGuidanceCard schemes={schemeMatches} />
        )}

        {/* TAB: MARKET ONLY */}
        {activeTab === 'market' && (
          <MarketIntelligenceCard marketData={marketAnalysis} />
        )}

        {/* TAB: RISKS ONLY */}
        {activeTab === 'risks' && (
          <RiskAnalysisCard riskProfile={riskProfile} />
        )}

        {/* TAB: EVIDENCE ONLY */}
        {activeTab === 'evidence' && (
          <EvidenceAuditCard evidenceRecords={evidenceRecords} />
        )}
      </div>

      {/* Official Bottom Disclaimer */}
      {feasibilityVerdict?.disclaimer && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('print.disclaimerTitle')}</span>
          </div>
          <p className="leading-relaxed">
            {feasibilityVerdict.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
};
