import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Info
} from 'lucide-react';
import { RiskProfile } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface RiskAnalysisCardProps {
  riskProfile: RiskProfile;
}

export const RiskAnalysisCard: React.FC<RiskAnalysisCardProps> = ({ riskProfile }) => {
  const { t } = useLanguage();

  const getOverallBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'LOW':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'HIGH':
        return 'text-rose-800 bg-rose-50 border-rose-200';
      case 'MEDIUM':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      default:
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
    }
  };

  const getLocalizedSeverityText = (sev: string) => {
    switch (sev) {
      case 'HIGH': return t('risk.level.high');
      case 'MEDIUM': return t('risk.level.medium');
      default: return t('risk.level.low');
    }
  };

  const highRisks = riskProfile.riskFactors.filter((r) => r.severity === 'HIGH');
  const mediumRisks = riskProfile.riskFactors.filter((r) => r.severity === 'MEDIUM');
  const lowRisks = riskProfile.riskFactors.filter((r) => r.severity === 'LOW');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-700" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              {t('risk.title')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('risk.subtitle')}
          </p>
        </div>

        <div>
          <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${getOverallBadge(riskProfile.overallRiskLevel)}`}>
            {t('risk.overallBadge', { level: riskProfile.overallRiskLevel })}
          </span>
        </div>
      </div>

      {/* High Priority Risks */}
      {highRisks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>{t('risk.highTitle', { count: highRisks.length })}</span>
          </h3>

          <div className="space-y-3">
            {highRisks.map((factor, idx) => (
              <div
                key={idx}
                className="bg-rose-50/40 border border-rose-200 rounded-xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{factor.category}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({factor.dimension})</span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getSeverityBadge(factor.severity)}`}>
                    {getLocalizedSeverityText(factor.severity)}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {factor.description}
                </p>

                <div className="bg-white/80 border border-rose-200/60 rounded-lg p-2.5 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-800">
                    <span className="font-bold text-emerald-800">{t('risk.mitigationLabel')} </span>
                    <span>{factor.mitigation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medium Priority Risks */}
      {mediumRisks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('risk.mediumTitle', { count: mediumRisks.length })}</span>
          </h3>

          <div className="space-y-3">
            {mediumRisks.map((factor, idx) => (
              <div
                key={idx}
                className="bg-amber-50/30 border border-amber-200 rounded-xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{factor.category}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({factor.dimension})</span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getSeverityBadge(factor.severity)}`}>
                    {getLocalizedSeverityText(factor.severity)}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {factor.description}
                </p>

                <div className="bg-white/80 border border-amber-200/60 rounded-lg p-2.5 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-800">
                    <span className="font-bold text-emerald-800">{t('risk.mitigationLabel')} </span>
                    <span>{factor.mitigation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Managed Risks */}
      {lowRisks.length > 0 && (
        <div className="space-y-2 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('risk.lowTitle', { count: lowRisks.length })}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {lowRisks.map((factor, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="font-bold text-slate-800 block">{factor.category}</span>
                <span className="text-slate-600 text-[11px] mt-0.5 block">{factor.mitigation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
