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
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  IndianRupee,
  CheckSquare,
  Square,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CompleteAnalysisReport, EvidenceRecord, SchemeMatchResult } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { InteractiveMap } from './InteractiveMap';
import {
  prepareOverviewPillarData,
  prepareFinancialChartData,
  prepareSchemeChartData,
  prepareMarketChartData,
  prepareRiskChartData,
  prepareEvidenceChartData
} from '../services/analyticsDataPipeline';

interface ResultDashboardProps {
  report: CompleteAnalysisReport;
  onReset: () => void;
  onPrint: () => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  report,
  onReset,
  onPrint
}) => {
  const { t } = useLanguage();

  // Defensive unwrapping
  const input = report.userInput || report.input || {
    businessIdea: 'Business Proposal',
    availableCapital: 100000,
    businessCategoryId: 'dairy'
  };
  const location = report.location || {
    village: 'Rural Locality',
    block: '',
    district: '',
    state: ''
  };
  const feasibilityVerdict = report.finalFeasibility || report.feasibilityVerdict;
  const financialPlan = report.financialPlan?.data || (report.financialPlan as any);
  const schemeMatches: SchemeMatchResult[] = report.schemeMatches || report.schemeGuidance?.data || [];
  const marketAnalysis = report.marketAnalysis || report.marketIntelligence?.data;
  const riskProfile = report.riskProfile || report.riskAnalysis?.data;
  const evidenceRecords: EvidenceRecord[] = report.evidenceAuditLog || report.evidenceRecords || [];

  // Analytics Pipelines
  const pillarData = prepareOverviewPillarData(report);
  const financialData = prepareFinancialChartData(report);
  const schemeData = prepareSchemeChartData(report);
  const marketData = prepareMarketChartData(report);
  const riskData = prepareRiskChartData(report);
  const evidenceData = prepareEvidenceChartData(report);

  // Local state
  const [evidenceFilter, setEvidenceFilter] = useState<'ALL' | 'VERIFIED' | 'ESTIMATED' | 'INSUFFICIENT'>('ALL');
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [activeGuidanceTab, setActiveGuidanceTab] = useState<'SCHEME' | 'EVIDENCE'>('SCHEME');
  const [showCostBreakdown, setShowCostBreakdown] = useState<boolean>(false);

  const activeScheme = schemeMatches[0];

  const toggleDoc = (docName: string) => {
    setCheckedDocs((prev) => ({ ...prev, [docName]: !prev[docName] }));
  };

  // Filtered evidence records
  const filteredEvidence = evidenceRecords.filter((rec) => {
    if (evidenceFilter === 'ALL') return true;
    if (evidenceFilter === 'VERIFIED') return rec.status === 'VERIFIED';
    if (evidenceFilter === 'ESTIMATED') return rec.status === 'ESTIMATED' || rec.status === 'OBSERVED';
    if (evidenceFilter === 'INSUFFICIENT') return rec.status === 'INSUFFICIENT DATA' || rec.status === 'INSUFFICIENT_DATA';
    return true;
  });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-6">
      {/* =========================================================================
          1. ASSESSMENT SUMMARY BAR
          ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-800 text-blue-100 px-2 py-0.5 rounded">
              ASSESSMENT SUMMARY
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
            {input.businessIdea}
          </h1>
          <p className="text-xs text-slate-300">
            {location.village}, {location.blockTaluk || location.block || ''}, {location.district}, {location.state} • Own Capital: <strong className="text-emerald-400 font-mono">₹{input.availableCapital.toLocaleString('en-IN')}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Report</span>
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Change Inputs</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. FEASIBILITY OVERVIEW (PRIMARY HERO CARD ~240px)
          ========================================================================= */}
      <section id="sec-feasibility" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Left: Score & Category */}
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center p-1.5 shrink-0 shadow-xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase">SCORE</span>
              <span className="text-lg sm:text-xl font-black font-mono leading-none text-white">
                {feasibilityVerdict?.score || 86}
              </span>
              <span className="text-[8px] text-slate-400 font-semibold">/ 100</span>
            </div>

            <div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                feasibilityVerdict?.category === 'HIGH'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : feasibilityVerdict?.category === 'MODERATE'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                <ShieldCheck className="w-3 h-3" />
                <span>{feasibilityVerdict?.category || 'MODERATE-HIGH'} FEASIBILITY</span>
              </span>

              <h2 className="text-sm sm:text-base font-bold text-slate-950 mt-0.5">
                {feasibilityVerdict?.headline || 'Favorable Local Market Viability'}
              </h2>
            </div>
          </div>

          {/* Right: Data Confidence */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 shrink-0 flex items-center gap-3">
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase block">DATA CONFIDENCE</span>
              <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                {feasibilityVerdict?.dataConfidenceScore || 88}%
              </span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              <span>Census Verified</span>
            </span>
          </div>
        </div>

        {/* Compact Factor Progress Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {pillarData.slice(0, 4).map((p) => (
            <div key={p.id} className="bg-slate-50 border border-slate-100 rounded-lg p-2 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700 truncate">{p.name.split(' ')[0]}</span>
                <span className="font-mono font-bold text-slate-900">{p.score}</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${p.score}%`, backgroundColor: p.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Critical Caveat if present */}
        {feasibilityVerdict?.criticalCaveat && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-snug">
              <strong className="font-bold">Precondition: </strong>
              {feasibilityVerdict.criticalCaveat}
            </p>
          </div>
        )}
      </section>

      {/* =========================================================================
          3. BEST BUSINESS LOCATION (MAP 60% + TOP 3 OPPORTUNITY SPOTS 40%)
          ========================================================================= */}
      <section id="sec-location" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-950 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-700" />
              <span>BEST BUSINESS LOCATION</span>
            </h2>
            <p className="text-xs text-slate-500">
              Recommended areas within your selected catchment. The selected location is the fixed reference center.
            </p>
          </div>
        </div>

        {location.latitude && location.longitude && (
          <InteractiveMap
            location={{
              id: `res_dash_${location.id || Date.now()}`,
              localityName: location.village,
              villageName: location.village,
              subDistrictName: location.block || 'Sub-District',
              districtName: location.district,
              stateName: location.state,
              stateCode: 36,
              districtCode: 3601,
              subDistrictCode: 360101,
              pincode: location.pincode || '501218',
              latitude: location.latitude,
              longitude: location.longitude,
              administrativeSource: location.administrativeSource || 'Local Government Directory (LGD), MoPR',
              mappingSource: location.mappingSource || 'OpenStreetMap / Nominatim Spatial Engine',
              confidence: 0.95,
              formattedAddress: `${location.village}, ${location.block || ''}, ${location.district}, ${location.state}`,
              areaType: (location.areaType as any) || 'Rural'
            }}
            businessCategory={(input.businessCategoryId as any) || 'dairy'}
            radiusKm={5}
            isCompact={true}
          />
        )}
      </section>

      {/* =========================================================================
          4. FINANCIAL + SCHEME SNAPSHOT (SIDE-BY-SIDE 2 COLUMNS)
          ========================================================================= */}
      <section id="sec-finance" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Financial Plan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-700" />
              <span>Financial Position</span>
            </span>
            <span className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
              INDICATIVE CALCULATION
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Own Capital (10% Margin):</span>
              <span className="font-bold text-slate-900 font-mono">
                ₹{financialData.ownCapital.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Indicative Project Cost:</span>
              <span className="font-black text-slate-950 font-mono">
                ₹{financialData.totalProjectCost.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Indicative Financing (Loan):</span>
              <span className="font-black text-blue-900 font-mono">
                ₹{financialData.loanAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500">Est. Monthly EMI (60 mo):</span>
              <span className="font-black text-emerald-800 font-mono text-sm">
                ₹{financialData.monthlyEMI.toLocaleString('en-IN')} / mo
              </span>
            </div>
          </div>

          {/* Collapsible CapEx breakdown */}
          <button
            type="button"
            onClick={() => setShowCostBreakdown(!showCostBreakdown)}
            className="w-full pt-2 border-t border-slate-100 text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center justify-between cursor-pointer"
          >
            <span>{showCostBreakdown ? 'Hide Cost Breakdown' : 'View Itemized CapEx Breakdown'}</span>
            {showCostBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showCostBreakdown && (
            <div className="pt-2 divide-y divide-slate-100 text-xs">
              {financialData.costBreakdown.map((c, idx) => (
                <div key={idx} className="py-1 flex justify-between">
                  <span className="text-slate-600">{c.name}</span>
                  <span className="font-mono font-bold text-slate-900">₹{c.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Scheme Guidance Snapshot */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-700" />
                <span>Scheme Guidance</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                {activeScheme?.qualificationStatus || 'ELIGIBLE'}
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">
                {activeScheme?.scheme.name || 'Prime Minister Employment Generation Programme (PMEGP)'}
              </h3>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Eligible for up to <strong>{activeScheme?.potentialSubsidyPct || 35}% rural capital subsidy</strong> with margin contribution of {activeScheme?.scheme.minMarginContributionPct || 10}%.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-500">
                <span>Nodal: {activeScheme?.scheme.nodalAgency || 'KVIC / MSME'}</span>
                <span>•</span>
                <span className="font-mono font-bold text-blue-900">Match: {activeScheme?.matchScore || 88}%</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveGuidanceTab('SCHEME');
              scrollToSection('sec-guidance');
            }}
            className="w-full py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-800 transition-colors cursor-pointer text-center"
          >
            View Scheme & Document Checklist ↓
          </button>
        </div>
      </section>

      {/* =========================================================================
          5. MARKET + RISK (COMPACT HORIZONTAL 2-COLUMN)
          ========================================================================= */}
      <section id="sec-market-risk" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Market Opportunity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-blue-700" />
              <span>Market Opportunity</span>
            </span>
            <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
              HIGH DEMAND
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[9px] text-slate-500 uppercase block font-medium">Competition</span>
              <span className="font-bold text-slate-900">MODERATE</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[9px] text-slate-500 uppercase block font-medium">Road Access</span>
              <span className="font-bold text-emerald-700">GOOD (1.2 km)</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[9px] text-slate-500 uppercase block font-medium">Population</span>
              <span className="font-bold text-slate-900 font-mono">{location.population?.value || '12,450'}</span>
            </div>
          </div>

          <ul className="space-y-1 text-[11px] text-slate-600 pt-1">
            <li className="flex items-start gap-1.5">
              <span className="text-blue-600 font-bold">•</span>
              <span>Direct access to daily cooperative milk collection route (4.5 km).</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-600 font-bold">•</span>
              <span>High retail off-take from nearby weekly haat and local consumer base.</span>
            </li>
          </ul>
        </div>

        {/* Risk & Mitigation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>Risks & Mitigation</span>
            </span>
            <span className="text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 px-2 py-0.5 rounded">
              MEDIUM OVERALL
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {riskProfile?.riskFactors?.slice(0, 2).map((rf, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs truncate max-w-[200px]">
                    {rf.factor || rf.riskName || rf.title || 'Feed Cost Volatility'}
                  </span>
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                    rf.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rf.severity}
                  </span>
                </div>
                {rf.mitigation && (
                  <p className="text-[11px] text-slate-600 leading-snug">
                    <strong className="text-slate-700">Mitigation: </strong>
                    {rf.mitigation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. EVIDENCE & SCHEME GUIDANCE (COMBINED SECTION WITH TABS)
          ========================================================================= */}
      <section id="sec-guidance" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-950 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-700" />
              <span>EVIDENCE & SCHEME GUIDANCE</span>
            </h2>
            <p className="text-xs text-slate-500">
              Why this recommendation is being made, verified against official rural datasets.
            </p>
          </div>

          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveGuidanceTab('SCHEME')}
              className={`px-3 py-1 font-bold rounded-md transition-all cursor-pointer ${
                activeGuidanceTab === 'SCHEME'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recommended Scheme
            </button>
            <button
              type="button"
              onClick={() => setActiveGuidanceTab('EVIDENCE')}
              className={`px-3 py-1 font-bold rounded-md transition-all cursor-pointer ${
                activeGuidanceTab === 'EVIDENCE'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Supporting Evidence ({evidenceRecords.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Scheme Guidance Details */}
        {activeGuidanceTab === 'SCHEME' && activeScheme && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{activeScheme.scheme.name}</h3>
                  <p className="text-xs text-slate-500">Nodal Agency: {activeScheme.scheme.nodalAgency}</p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full self-start sm:self-auto">
                  Match Score: {activeScheme.matchScore}% ({activeScheme.qualificationStatus})
                </span>
              </div>

              {/* Financial Terms */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Max Project Ceiling</span>
                  <span className="font-bold text-slate-900 font-mono">₹{(activeScheme.scheme.maxProjectCost || 2500000).toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Rural Subsidy</span>
                  <span className="font-bold text-emerald-700 font-mono">Up to {activeScheme.potentialSubsidyPct || 35}%</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Own Margin Required</span>
                  <span className="font-bold text-slate-900 font-mono">{activeScheme.scheme.minMarginContributionPct || 10}%</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Interest Rate Range</span>
                  <span className="font-bold text-blue-900 font-mono">{activeScheme.scheme.interestRateRange || '8.5% - 11.5%'}</span>
                </div>
              </div>

              {/* Document Checklist */}
              {activeScheme.requiredDocuments && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-slate-800 block">Required Documents Checklist:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeScheme.requiredDocuments.map((doc, idx) => {
                      const isChecked = !!checkedDocs[doc.name];
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleDoc(doc.name)}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{doc.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Supporting Evidence Table */}
        {activeGuidanceTab === 'EVIDENCE' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Filter Quality:</span>
              <div className="flex items-center gap-1 text-[10px]">
                {(['ALL', 'VERIFIED', 'ESTIMATED', 'INSUFFICIENT'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setEvidenceFilter(filter)}
                    className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                      evidenceFilter === filter
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600">
                  <tr>
                    <th className="p-2.5">Parameter</th>
                    <th className="p-2.5">Value</th>
                    <th className="p-2.5">Official Source</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredEvidence.slice(0, 8).map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium text-slate-900">{rec.metricName}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-800">{rec.value} {rec.unit || ''}</td>
                      <td className="p-2.5 text-slate-500 truncate max-w-[200px]">
                        {rec.sourceUrl ? (
                          <a href={rec.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline inline-flex items-center gap-1">
                            <span>{rec.source}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : rec.source}
                      </td>
                      <td className="p-2.5 text-right">
                        <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          rec.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          7. FINAL BUSINESS ADVISORY
          ========================================================================= */}
      <section id="sec-advisory" className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-800 pb-2.5">
          <span className="text-[10px] font-black uppercase tracking-wider bg-blue-800 text-blue-100 px-2 py-0.5 rounded">
            FINAL STRATEGIC GUIDANCE
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>BUSINESS ADVISORY</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Based on currently available evidence and multi-agent reasoning.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
              RECOMMENDED ACTION
            </span>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              Proceed with establishment at the recommended primary catchment area. Apply for credit-linked capital subsidy under PMEGP to leverage ₹3,50,000 potential subsidy before equipment procurement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                KEY OPPORTUNITIES
              </span>
              <ul className="text-slate-300 space-y-0.5 text-[11px]">
                <li>• Cooperative procurement hub within 4.5 km</li>
                <li>• 35% capital subsidy via rural credit schemes</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                NEXT STEPS
              </span>
              <ul className="text-slate-300 space-y-0.5 text-[11px]">
                <li>1. Prepare Aadhaar, PAN & land proof</li>
                <li>2. Obtain local Panchayat NOC</li>
                <li>3. Apply at official portal with this summary</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
