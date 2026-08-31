import React from'react';
import {
 ShieldAlert,
 AlertTriangle,
 CheckCircle2,
 ShieldCheck,
 Info
} from'lucide-react';
import { RiskProfile } from'../types';
import { useLanguage } from'../i18n/LanguageContext';

interface RiskAnalysisCardProps {
 riskProfile?: RiskProfile | { data: RiskProfile };
}

export const RiskAnalysisCard: React.FC<RiskAnalysisCardProps> = ({ riskProfile: rawRisk }) => {
 const { t } = useLanguage();
 const riskProfile: RiskProfile = (rawRisk as any)?.data || rawRisk || {
 overallRiskLevel:'MEDIUM',
 riskFactors: []
 };

 const getOverallBadge = (level: string) => {
 switch (level) {
 case'HIGH':
 return'bg-rose-100 text-rose-900 border-rose-300';
 case'MEDIUM':
 return'bg-amber-100 text-amber-900 border-amber-300';
 case'LOW':
 return'bg-emerald-100 text-emerald-900 border-emerald-300';
 default:
 return'bg-slate-100 text-slate-800 border-slate-300';
 }
 };

 const getSeverityBadge = (sev: string) => {
 switch (sev) {
 case'HIGH':
 return'text-rose-800 bg-rose-50 border-rose-200';
 case'MEDIUM':
 return'text-amber-800 bg-amber-50 border-amber-200';
 default:
 return'text-emerald-800 bg-emerald-50 border-emerald-200';
 }
 };

 const getLocalizedSeverityText = (sev: string) => {
 switch (sev) {
 case'HIGH': return t('risk.level.high');
 case'MEDIUM': return t('risk.level.medium');
 default: return t('risk.level.low');
 }
 };

 const riskFactors = Array.isArray(riskProfile.riskFactors) ? riskProfile.riskFactors : [];
 const highRisks = riskFactors.filter((r) => r && r.severity ==='HIGH');
 const mediumRisks = riskFactors.filter((r) => r && r.severity ==='MEDIUM');
 const lowRisks = riskFactors.filter((r) => r && r.severity ==='LOW');
 const overallLevel = riskProfile.overallRiskLevel ||'MEDIUM';

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
 <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${getOverallBadge(overallLevel)}`}>
 {t('risk.overallBadge', { level: overallLevel })}
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
 <span className="text-xs font-bold text-slate-900">{factor.category ||'Operational Risk'}</span>
 {factor.dimension && (
 <span className="text-[10px] text-slate-400 font-medium">({factor.dimension})</span>
 )}
 </div>
 <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getSeverityBadge(factor.severity)}`}>
 {getLocalizedSeverityText(factor.severity)}
 </span>
 </div>

 <p className="text-xs text-slate-700 leading-relaxed font-medium">
 {factor.description}
 </p>

 {factor.potentialImpact && (
 <p className="text-[11px] text-rose-900 bg-rose-100/50 p-2 rounded border border-rose-200">
 <strong>Impact:</strong> {factor.potentialImpact}
 </p>
 )}

 <div className="pt-2 border-t border-rose-100 flex items-start gap-2 text-xs text-slate-600">
 <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
 <div>
 <span className="font-bold text-slate-800">{t('risk.mitigationLabel')}: </span>
 <span>{factor.mitigation || factor.mitigationSuggestion ||'Maintain emergency liquidity buffer.'}</span>
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
 <Info className="w-3.5 h-3.5 text-amber-600" />
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
 <span className="text-xs font-bold text-slate-900">{factor.category ||'Financial/Market Risk'}</span>
 {factor.dimension && (
 <span className="text-[10px] text-slate-400 font-medium">({factor.dimension})</span>
 )}
 </div>
 <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getSeverityBadge(factor.severity)}`}>
 {getLocalizedSeverityText(factor.severity)}
 </span>
 </div>

 <p className="text-xs text-slate-700 leading-relaxed font-medium">
 {factor.description}
 </p>

 {factor.potentialImpact && (
 <p className="text-[11px] text-amber-900 bg-amber-100/50 p-2 rounded border border-amber-200">
 <strong>Impact:</strong> {factor.potentialImpact}
 </p>
 )}

 <div className="pt-2 border-t border-amber-100 flex items-start gap-2 text-xs text-slate-600">
 <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
 <div>
 <span className="font-bold text-slate-800">{t('risk.mitigationLabel')}: </span>
 <span>{factor.mitigation || factor.mitigationSuggestion ||'Adhere to operational protocols.'}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Low Priority Risks */}
 {lowRisks.length > 0 && (
 <div className="space-y-2">
 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
 {t('risk.lowTitle', { count: lowRisks.length })}
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
 {lowRisks.map((factor, idx) => (
 <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
 <div className="flex items-center justify-between">
 <span className="font-bold text-slate-900">{factor.category}</span>
 <span className="text-[10px] text-emerald-700 font-bold uppercase bg-emerald-50 px-1.5 py-0.5 rounded">
 {getLocalizedSeverityText(factor.severity)}
 </span>
 </div>
 <p className="text-slate-600 leading-snug text-[11px]">{factor.description}</p>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
};
