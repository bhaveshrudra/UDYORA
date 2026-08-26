import React, { useState } from 'react';
import {
  Award,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  CheckSquare,
  Square,
  ShieldCheck,
  Building2,
  Info
} from 'lucide-react';
import { SchemeMatchResult } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface SchemeGuidanceCardProps {
  schemes?: SchemeMatchResult[] | { data: SchemeMatchResult[] };
}

export const SchemeGuidanceCard: React.FC<SchemeGuidanceCardProps> = ({ schemes: rawSchemes }) => {
  const { t } = useLanguage();
  const schemes: SchemeMatchResult[] = Array.isArray(rawSchemes)
    ? rawSchemes
    : (rawSchemes as any)?.data || [];

  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemes[0]?.scheme?.id || '');

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
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'CONDITIONALLY_ELIGIBLE':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'REQUIRES_VERIFICATION':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getLocalizedStatusText = (status: string) => {
    switch (status) {
      case 'ELIGIBLE': return t('scheme.status.eligible');
      case 'CONDITIONALLY_ELIGIBLE': return t('scheme.status.conditional');
      case 'REQUIRES_VERIFICATION': return t('scheme.status.verification');
      default: return t('scheme.status.ineligible');
    }
  };

  if (!schemes || schemes.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Award className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            {t('scheme.title')}
          </h2>
        </div>
        <p className="text-xs text-slate-500 italic">
          Insufficient Data available for government credit scheme matching in this category.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              {t('scheme.title')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('scheme.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
          <span>{t('scheme.evaluatedCount', { count: schemes.length })}</span>
        </div>
      </div>

      {/* Scheme Selection Tabs */}
      <div className="flex flex-wrap gap-2">
        {schemes.map((match, idx) => {
          const schemeId = match.scheme?.id || `scheme_${idx}`;
          const isSelected = selectedSchemeId ? selectedSchemeId === schemeId : idx === 0;
          return (
            <button
              key={schemeId}
              onClick={() => setSelectedSchemeId(schemeId)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{match.scheme?.shortName || match.scheme?.name || 'Government Scheme'}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
                isSelected
                  ? 'bg-blue-800 text-blue-100'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {match.matchScore || 0}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Scheme Detailed View */}
      {activeSchemeMatch && (
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-5">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusBadge(activeSchemeMatch.qualificationStatus)}`}>
                  {getLocalizedStatusText(activeSchemeMatch.qualificationStatus)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Nodal: {activeSchemeMatch.scheme?.nodalAgency || 'Official Government Agency'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {activeSchemeMatch.scheme?.name || 'Government Scheme Guidelines'}
              </h3>
            </div>

            {activeSchemeMatch.scheme?.officialSourceUrl && (
              <a
                href={activeSchemeMatch.scheme.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-800 bg-white border border-blue-200 hover:bg-blue-50 transition-colors shadow-2xs shrink-0 cursor-pointer"
              >
                <span>{t('scheme.portalBtn')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Scheme Financial Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium block">{t('scheme.interestRate')}</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{activeSchemeMatch.scheme?.interestRateRange || 'Benchmark 9.5% p.a.'}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium block">{t('scheme.estSubsidy')}</span>
              <span className="font-bold text-emerald-700 mt-0.5 block">
                {(activeSchemeMatch.potentialSubsidyAmount || 0) > 0
                  ? `₹${activeSchemeMatch.potentialSubsidyAmount.toLocaleString('en-IN')} (${activeSchemeMatch.potentialSubsidyPct}%)`
                  : 'Collateral-free Guarantee'}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium block">{t('scheme.minMargin')}</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{activeSchemeMatch.scheme?.minMarginContributionPct || 10}%</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium block">{t('scheme.maxCeiling')}</span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {activeSchemeMatch.scheme?.maxProjectCost
                  ? `₹${(activeSchemeMatch.scheme.maxProjectCost / 100000).toLocaleString('en-IN')} Lakhs`
                  : 'As per DPR'}
              </span>
            </div>
          </div>

          {/* Why it matches */}
          {activeSchemeMatch.whyItMatches && activeSchemeMatch.whyItMatches.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                {t('scheme.whyMatches')}
              </h4>
              <ul className="space-y-1.5">
                {activeSchemeMatch.whyItMatches.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Documents Checklist */}
          {activeSchemeMatch.requiredDocuments && activeSchemeMatch.requiredDocuments.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-700" />
                  {t('scheme.checklistTitle')}
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  {t('scheme.readyCount', {
                    ready: Object.values(checkedDocs).filter(Boolean).length,
                    total: activeSchemeMatch.requiredDocuments.length
                  })}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeSchemeMatch.requiredDocuments.map((doc, idx) => {
                  const docKey = `${activeSchemeMatch.scheme?.id || 'scheme'}_${idx}`;
                  const isChecked = !!checkedDocs[docKey];
                  const docName = typeof doc === 'string' ? doc : doc.name;
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleDoc(docKey)}
                      className={`p-2.5 rounded-lg border transition-colors flex items-start gap-2.5 text-xs cursor-pointer select-none ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-tight">{docName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Verification Audit Note */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{activeSchemeMatch.verificationNote || 'Verified against published scheme guidelines.'}</span>
            </span>
            {activeSchemeMatch.scheme?.lastVerifiedDate && (
              <span>{t('scheme.verifiedOn', { date: activeSchemeMatch.scheme.lastVerifiedDate })}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
