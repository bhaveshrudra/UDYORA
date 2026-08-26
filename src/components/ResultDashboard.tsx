import React, { useState } from 'react';
import {
  Compass,
  FileText,
  Calculator,
  Award,
  Store,
  ShieldAlert,
  Database,
  Printer,
  ChevronRight,
  MapPin,
  IndianRupee,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { CompleteAnalysisReport } from '../types';
import { FeasibilityGauge } from './FeasibilityGauge';
import { FinancialPlanCard } from './FinancialPlanCard';
import { SchemeGuidanceCard } from './SchemeGuidanceCard';
import { MarketIntelligenceCard } from './MarketIntelligenceCard';
import { RiskAnalysisCard } from './RiskAnalysisCard';
import { EvidenceAuditCard } from './EvidenceAuditCard';
import { getTranslations } from '../utils/translations';

interface ResultDashboardProps {
  report: CompleteAnalysisReport;
  onReset: () => void;
  onPrint: () => void;
  currentLanguage?: string;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  report,
  onReset,
  onPrint,
  currentLanguage = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'finance' | 'schemes' | 'market' | 'risks' | 'evidence'>('all');
  const t = getTranslations(currentLanguage);

  const {
    reportId,
    generatedAt,
    input,
    location,
    feasibilityVerdict,
    businessAnalysis,
    marketIntelligence,
    financialPlan,
    schemeGuidance,
    riskAnalysis,
    evidenceAuditLog
  } = report;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Advisory Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-800 text-blue-100 tracking-wider">
                UDYORA ADVISORY REPORT
              </span>
              <span className="text-xs text-slate-400 font-mono">{t.reportId}: {reportId}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {input.businessIdea}
            </h1>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {location.village}, Block {location.block}, District {location.district}, {location.state} ({location.areaType})
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-700" />
              <span>{t.printReport}</span>
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.newSearch}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'all', label: t.fullReportTab, icon: <FileText className="w-3.5 h-3.5" /> },
          { id: 'finance', label: t.financeTab, icon: <Calculator className="w-3.5 h-3.5" /> },
          { id: 'schemes', label: t.schemesTab, icon: <Award className="w-3.5 h-3.5" /> },
          { id: 'market', label: t.marketTab, icon: <Store className="w-3.5 h-3.5" /> },
          { id: 'risks', label: t.risksTab, icon: <ShieldAlert className="w-3.5 h-3.5" /> },
          { id: 'evidence', label: t.evidenceTab, icon: <Database className="w-3.5 h-3.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. Feasibility Score & Verdict Banner */}
      {(activeTab === 'all' || activeTab === 'finance') && (
        <FeasibilityGauge verdict={feasibilityVerdict} />
      )}

      {/* 2. Deterministic Financial Plan Card */}
      {(activeTab === 'all' || activeTab === 'finance') && (
        <FinancialPlanCard initialPlan={financialPlan.data} />
      )}

      {/* 3. Scheme Guidance Card */}
      {(activeTab === 'all' || activeTab === 'schemes') && (
        <SchemeGuidanceCard schemes={schemeGuidance.data} />
      )}

      {/* 4. Hyper-Local Market Intelligence Card */}
      {(activeTab === 'all' || activeTab === 'market') && (
        <MarketIntelligenceCard marketData={marketIntelligence.data} location={location} />
      )}

      {/* 5. Risk Analysis Card */}
      {(activeTab === 'all' || activeTab === 'risks') && (
        <RiskAnalysisCard riskProfile={riskAnalysis.data} />
      )}

      {/* 6. Evidence & Ground Truth Audit Trail */}
      {(activeTab === 'all' || activeTab === 'evidence') && (
        <EvidenceAuditCard evidenceList={evidenceAuditLog} />
      )}

      {/* Footer Legal & Advisory Note */}
      <div className="border-t border-slate-200 pt-6 text-center text-xs text-slate-500 max-w-3xl mx-auto space-y-2">
        <p className="leading-relaxed">
          {feasibilityVerdict.disclaimer}
        </p>
        <p className="font-semibold text-slate-700">
          UDYORA © 2026 • {t.tagline}
        </p>
      </div>
    </div>
  );
};
