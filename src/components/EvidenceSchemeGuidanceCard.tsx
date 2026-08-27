import React, { useState } from 'react';
import {
  Award,
  Database,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Calendar,
  CheckSquare,
  Square,
  ShieldCheck,
  Building2,
  Info,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';
import { SchemeMatchResult, EvidenceRecord } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface EvidenceSchemeGuidanceCardProps {
  schemes?: SchemeMatchResult[] | { data: SchemeMatchResult[] };
  evidenceRecords?: EvidenceRecord[] | { data: EvidenceRecord[] };
}

export const EvidenceSchemeGuidanceCard: React.FC<EvidenceSchemeGuidanceCardProps> = ({
  schemes: rawSchemes,
  evidenceRecords: rawEvidence
}) => {
  const { t } = useLanguage();

  const schemes: SchemeMatchResult[] = Array.isArray(rawSchemes)
    ? rawSchemes
    : (rawSchemes as any)?.data || [];

  const evidenceRecords: EvidenceRecord[] = Array.isArray(rawEvidence)
    ? rawEvidence
    : (rawEvidence as any)?.data || [];

  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemes[0]?.scheme?.id || '');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const toggleDoc = (docKey: string) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [docKey]: !prev[docKey]
    }));
  };

  const activeSchemeMatch = schemes.find((s) => s.scheme?.id === selectedSchemeId) || schemes[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ELIGIBLE':
        return 'text-emerald-800 bg-emerald-50 border-emerald-300';
      case 'CONDITIONALLY_ELIGIBLE':
        return 'text-blue-800 bg-blue-50 border-blue-300';
      case 'REQUIRES_VERIFICATION':
        return 'text-amber-800 bg-amber-50 border-amber-300';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-300';
    }
  };

  const getLocalizedStatusText = (status: string) => {
    switch (status) {
      case 'ELIGIBLE': return t('scheme.status.eligible') || 'ELIGIBLE';
      case 'CONDITIONALLY_ELIGIBLE': return t('scheme.status.conditional') || 'CONDITIONALLY ELIGIBLE';
      case 'REQUIRES_VERIFICATION': return t('scheme.status.verification') || 'REQUIRES VERIFICATION';
      default: return t('scheme.status.ineligible') || 'INELIGIBLE';
    }
  };

  const validEvidence = evidenceRecords.filter((r) => r && r.id);
  const filteredEvidence = filterStatus === 'ALL'
    ? validEvidence
    : validEvidence.filter((r) => r.status === filterStatus);

  const verifiedCount = validEvidence.filter((r) => r.status === 'VERIFIED').length;
  const estimatedCount = validEvidence.filter((r) => r.status === 'ESTIMATED').length;
  const insufficientCount = validEvidence.filter((r) => r.status === 'INSUFFICIENT DATA').length;

  const renderEvidenceStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border text-emerald-800 bg-emerald-50 border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{t('evidence.badge.verified') || 'VERIFIED'}</span>
          </span>
        );
      case 'ESTIMATED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border text-amber-800 bg-amber-50 border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>{t('evidence.badge.estimated') || 'ESTIMATED'}</span>
          </span>
        );
      case 'INSUFFICIENT DATA':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border text-rose-800 bg-rose-50 border-rose-300">
            <HelpCircle className="w-3 h-3 text-rose-600" />
            <span>{t('evidence.badge.insufficient') || 'INSUFFICIENT DATA'}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          MAIN HEADER BANNER
          ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider font-mono block">
                  Unified Decision Support
                </span>
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  EVIDENCE & SCHEME GUIDANCE
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl mt-1">
              Deterministic matching against official government credit subsidy schemes backed by timestamped ground-truth evidence.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 block">
                {schemes.length} Schemes Evaluated
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {verifiedCount} Verified Data Points
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PART 1: RECOMMENDED GOVERNMENT SCHEMES
            ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-700" />
              1. Recommended Government Credit Schemes
            </h3>
            <span className="text-[11px] font-medium text-slate-500">
              Select a scheme to view specific qualification terms
            </span>
          </div>

          {/* Scheme Selection Tabs */}
          {schemes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {schemes.map((match, idx) => {
                const s = match.scheme || (match as any);
                const isSelected = s.id === (activeSchemeMatch?.scheme?.id || schemes[0]?.scheme?.id);
                return (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => setSelectedSchemeId(s.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-blue-950 text-white border-blue-900 shadow-sm ring-2 ring-blue-500/20'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <Award className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                    <div>
                      <span className="block font-bold">{s.name}</span>
                      <span className={`text-[10px] font-mono block ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                        Match: {match.matchScore || 85}% • {s.nodalAgency || 'Official Nodal Agency'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
              No matching government credit schemes found for this sector category.
            </p>
          )}

          {/* Active Scheme Detailed Breakdown Card */}
          {activeSchemeMatch && (
            <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-black text-slate-950">
                      {activeSchemeMatch.scheme?.name}
                    </h4>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(activeSchemeMatch.status)}`}>
                      {getLocalizedStatusText(activeSchemeMatch.status)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                      Nodal: {activeSchemeMatch.scheme?.nodalAgency || 'Central Ministry'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activeSchemeMatch.scheme?.description}
                  </p>
                </div>

                {activeSchemeMatch.scheme?.portalUrl && (
                  <a
                    href={activeSchemeMatch.scheme.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <span>{t('scheme.portalBtn') || 'Official Portal'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Financial Terms Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {t('scheme.interestRate') || 'Interest Rate:'}
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                    {activeSchemeMatch.scheme?.interestRateRange || '8.5% - 11.5% p.a.'}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {t('scheme.estSubsidy') || 'Est. Subsidy / Benefit:'}
                  </span>
                  <span className="text-sm font-black text-emerald-800 font-mono mt-0.5 block">
                    {activeSchemeMatch.scheme?.subsidyPercentage ? `${activeSchemeMatch.scheme.subsidyPercentage}% (Rural)` : 'Credit Linked / 25-35%'}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {t('scheme.minMargin') || 'Min Margin Contribution:'}
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                    {activeSchemeMatch.scheme?.minOwnContributionPercentage || 5}% Promoter Equity
                  </span>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {t('scheme.maxCeiling') || 'Max Project Ceiling:'}
                  </span>
                  <span className="text-sm font-black text-blue-900 font-mono mt-0.5 block">
                    ₹{((activeSchemeMatch.scheme?.maxProjectCostCeiling || 2500000) / 100000).toFixed(0)} Lakhs
                  </span>
                </div>
              </div>

              {/* Why it Matches / Qualification Reason */}
              <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl space-y-1.5 text-xs">
                <span className="font-extrabold text-blue-950 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  {t('scheme.whyMatches') || 'Eligibility & Matching Justification:'}
                </span>
                <p className="text-slate-800 text-xs leading-relaxed">
                  {activeSchemeMatch.qualificationReason ||
                    'Project cost falls within the official guideline ceiling with promoter margin exceeding the minimum required 5% threshold. Business proposal qualifies under rural micro-enterprise priority lending.'}
                </p>
              </div>

              {/* Required Documents Interactive Checklist */}
              {activeSchemeMatch.scheme?.requiredDocuments && activeSchemeMatch.scheme.requiredDocuments.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-600" />
                      {t('scheme.checklistTitle') || 'Required Documents Checklist (Ready for Application)'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {Object.values(checkedDocs).filter(Boolean).length} of {activeSchemeMatch.scheme.requiredDocuments.length} Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeSchemeMatch.scheme.requiredDocuments.map((doc, idx) => {
                      const docKey = `${activeSchemeMatch.scheme?.id}-${idx}`;
                      const isChecked = !!checkedDocs[docKey];
                      return (
                        <div
                          key={docKey}
                          onClick={() => toggleDoc(docKey)}
                          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all cursor-pointer select-none ${
                            isChecked
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{doc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            PART 2: SUPPORTING EVIDENCE & GROUND TRUTH AUDIT
            ========================================================================= */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                2. Supporting Evidence & Verification Audit
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                “Why am I getting this scheme recommendation, and what evidence supports it?”
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  filterStatus === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({validEvidence.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('VERIFIED')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  filterStatus === 'VERIFIED'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Verified ({verifiedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('ESTIMATED')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  filterStatus === 'ESTIMATED'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Estimated ({estimatedCount})
              </button>
              {insufficientCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterStatus('INSUFFICIENT DATA')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    filterStatus === 'INSUFFICIENT DATA'
                      ? 'bg-rose-800 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  Insufficient ({insufficientCount})
                </button>
              )}
            </div>
          </div>

          {/* Mobile Evidence Cards (Visible on screens < 640px) */}
          <div className="sm:hidden space-y-3">
            {filteredEvidence.length > 0 ? (
              filteredEvidence.map((rec, idx) => (
                <div
                  key={rec.id || idx}
                  className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      {rec.parameterName || rec.metric || 'Local Ground Parameter'}
                    </span>
                    <div className="shrink-0">
                      {renderEvidenceStatusBadge(rec.status)}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl font-mono font-bold text-slate-950 text-xs border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-sans block uppercase">Observed Value</span>
                    <span>{rec.value || rec.observedValue || '—'}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <span className="truncate">
                      Source: {rec.source || rec.provenance || 'Official Directory (MoPR / LGD)'}
                    </span>
                    {rec.sourceUrl && (
                      <a
                        href={rec.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 shrink-0 font-bold"
                      >
                        Link ↗
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500 italic bg-white rounded-2xl border border-slate-200">
                No evidence records matching the selected status filter.
              </div>
            )}
          </div>

          {/* Desktop Evidence Table (Visible on sm and larger) */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3">Data Point / Parameter</th>
                  <th className="p-3">Observed Value</th>
                  <th className="p-3">Data Source & Audit Trail</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvidence.length > 0 ? (
                  filteredEvidence.map((rec, idx) => (
                    <tr key={rec.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        {rec.parameterName || rec.metric || 'Local Ground Parameter'}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-950">
                        {rec.value || rec.observedValue || '—'}
                      </td>
                      <td className="p-3 text-slate-600 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{rec.source || rec.provenance || 'Official Directory (MoPR / LGD)'}</span>
                          {rec.sourceUrl && (
                            <a
                              href={rec.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        {renderEvidenceStatusBadge(rec.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500 italic">
                      No evidence records matching the selected status filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
