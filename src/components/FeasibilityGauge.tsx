import React from'react';
import {
 AlertTriangle,
 BarChart3,
 ShieldCheck,
 Info
} from'lucide-react';
import { FinalFeasibilityVerdict } from'../types';
import { useLanguage } from'../i18n/LanguageContext';

interface FeasibilityGaugeProps {
 verdict?: FinalFeasibilityVerdict | { data: FinalFeasibilityVerdict };
}

export const FeasibilityGauge: React.FC<FeasibilityGaugeProps> = ({ verdict: rawVerdict }) => {
 const { t } = useLanguage();
 const verdict: FinalFeasibilityVerdict = (rawVerdict as any)?.data || rawVerdict || {
 score: 75,
 dataConfidenceScore: 88,
 category:'MODERATE',
 headline:'Standard Enterprise Feasibility',
 explanation:'Viable unit economics under rural business benchmarks.',
 readinessFactors: [],
 criticalCaveat:'',
 disclaimer:''
 };

 const safeScore = Number.isFinite(verdict.score) ? verdict.score : 75;
 const safeConfidence = Number.isFinite(verdict.dataConfidenceScore) ? verdict.dataConfidenceScore : 85;
 const { category ='MODERATE', headline ='', explanation ='', criticalCaveat } = verdict;
 const readinessFactors = Array.isArray(verdict.readinessFactors) ? verdict.readinessFactors : [];

 const getCategoryColor = (cat: string) => {
 switch (cat) {
 case'HIGH':
 return'text-emerald-700 bg-emerald-50 border-emerald-200';
 case'MODERATE':
 return'text-blue-800 bg-blue-50 border-blue-200';
 case'CONDITIONAL':
 return'text-amber-800 bg-amber-50 border-amber-200';
 case'LOW':
 return'text-rose-800 bg-rose-50 border-rose-200';
 default:
 return'text-slate-800 bg-slate-50 border-slate-200';
 }
 };

 const getRatingBadge = (rating: string) => {
 switch (rating) {
 case'STRONG':
 return'text-emerald-700 bg-emerald-50 border-emerald-200';
 case'ADEQUATE':
 return'text-blue-700 bg-blue-50 border-blue-200';
 case'NEEDS_ATTENTION':
 return'text-amber-700 bg-amber-50 border-amber-200';
 default:
 return'text-rose-700 bg-rose-50 border-rose-200';
 }
 };

 const getLocalizedCategory = (cat: string) => {
 switch (cat) {
 case'HIGH': return t('feasibility.cat.high');
 case'MODERATE': return t('feasibility.cat.moderate');
 case'CONDITIONAL': return t('feasibility.cat.conditional');
 case'LOW': return t('feasibility.cat.low');
 default: return cat;
 }
 };

 const getLocalizedRating = (rating: string) => {
 switch (rating) {
 case'STRONG': return t('feasibility.rating.strong');
 case'ADEQUATE': return t('feasibility.rating.adequate');
 case'NEEDS_ATTENTION': return t('feasibility.rating.needsAttention');
 default: return rating;
 }
 };

 return (
 <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
 {/* Top Banner with Score Gauge */}
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6 mb-6">
 <div className="flex-1">
 <div className="flex flex-wrap items-center gap-2.5 mb-2">
 <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${getCategoryColor(category)}`}>
 {t('feasibility.statusBadge')}: {getLocalizedCategory(category)}
 </span>
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
 <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
 Data Confidence: {safeConfidence}%
 </span>
 </div>

 <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
 {headline}
 </h2>

 <p className="text-sm text-slate-600 mt-2 leading-relaxed">
 {explanation}
 </p>
 </div>

 {/* Dual Metric Gauge Display: Feasibility Score & Data Confidence */}
 <div className="shrink-0 flex items-center justify-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full sm:w-auto">
 {/* Metric 1: Feasibility Index */}
 <div className="text-center px-3 border-r border-slate-200">
 <div className="flex items-baseline justify-center gap-1">
 <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
 {safeScore}
 </span>
 <span className="text-sm font-bold text-slate-400">/ 100</span>
 </div>
 <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
 Feasibility Score
 </p>
 </div>

 {/* Metric 2: Evidence Grounding Confidence */}
 <div className="text-center px-3">
 <div className="flex items-baseline justify-center gap-0.5">
 <span className="text-3xl sm:text-4xl font-black tracking-tight text-blue-900">
 {safeConfidence}
 </span>
 <span className="text-sm font-bold text-blue-500">%</span>
 </div>
 <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
 Data Confidence
 </p>
 </div>
 </div>
 </div>

 {/* 5-6 Explainable Readiness Pillars */}
 {readinessFactors.length > 0 && (
 <div className="space-y-3">
 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
 <BarChart3 className="w-4 h-4 text-blue-700" />
 {t('feasibility.breakdownTitle')}
 </h3>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
 {readinessFactors.map((factor, idx) => {
 const factorScore = Number.isFinite(factor.score) ? factor.score : 0;
 const safeWidthPct = Math.min(100, Math.max(0, factorScore));
 return (
 <div
 key={idx}
 className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2"
 >
 <div>
 <div className="flex items-center justify-between gap-1 mb-1">
 <span className="text-xs font-bold text-slate-900 truncate">
 {factor.area}
 </span>
 <span className="text-[10px] text-slate-500 font-mono">
 {factor.weight}%
 </span>
 </div>

 {/* Visual mini progress bar */}
 <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
 <div
 className={`h-full rounded-full ${
 factorScore >= 80 ?'bg-emerald-600' : factorScore >= 60 ?'bg-blue-600' :'bg-amber-500'
 }`}
 style={{ width:`${safeWidthPct}%` }}
 />
 </div>

 <p className="text-[11px] text-slate-600 leading-snug">
 {factor.summary}
 </p>
 </div>

 <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
 <span className="text-xs font-bold text-slate-900">{factorScore}/100</span>
 <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${getRatingBadge(factor.rating)}`}>
 {getLocalizedRating(factor.rating)}
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* Critical Caveat Warning */}
 {criticalCaveat && (
 <div className="mt-6 bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
 <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
 <div className="space-y-1">
 <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
 {t('feasibility.preconditionTitle')}
 </span>
 <p className="text-xs text-amber-900 leading-relaxed font-medium">
 {criticalCaveat}
 </p>
 </div>
 </div>
 )}
 </div>
 );
};
