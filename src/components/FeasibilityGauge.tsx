import React from 'react';
import {
  Award,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Info
} from 'lucide-react';
import { FinalFeasibilityVerdict } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface FeasibilityGaugeProps {
  verdict: FinalFeasibilityVerdict;
}

export const FeasibilityGauge: React.FC<FeasibilityGaugeProps> = ({ verdict }) => {
  const { t } = useLanguage();
  const { score, category, headline, explanation, readinessFactors, criticalCaveat } = verdict;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'HIGH':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'MODERATE':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'CONDITIONAL':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'LOW':
        return 'text-rose-800 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-800 bg-slate-50 border-slate-200';
    }
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'STRONG':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'ADEQUATE':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'NEEDS_ATTENTION':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  const getLocalizedCategory = (cat: string) => {
    switch (cat) {
      case 'HIGH': return t('feasibility.cat.high');
      case 'MODERATE': return t('feasibility.cat.moderate');
      case 'CONDITIONAL': return t('feasibility.cat.conditional');
      case 'LOW': return t('feasibility.cat.low');
      default: return cat;
    }
  };

  const getLocalizedRating = (rating: string) => {
    switch (rating) {
      case 'STRONG': return t('feasibility.rating.strong');
      case 'ADEQUATE': return t('feasibility.rating.adequate');
      case 'NEEDS_ATTENTION': return t('feasibility.rating.needsAttention');
      default: return rating;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
      {/* Top Banner with Score Gauge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${getCategoryColor(category)}`}>
              {t('feasibility.statusBadge')}: {getLocalizedCategory(category)}
            </span>
            <span className="text-xs text-slate-500 font-medium">{t('feasibility.explainableLabel')}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
            {headline}
          </h2>

          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            {explanation}
          </p>
        </div>

        {/* Score Ring / Gauge Display */}
        <div className="shrink-0 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl p-5 w-full sm:w-auto">
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
                {score}
              </span>
              <span className="text-lg font-bold text-slate-400">/ 100</span>
            </div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
              {t('feasibility.index')}
            </p>
            <div className="w-28 h-1.5 bg-slate-200 rounded-full mt-2 mx-auto overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  score >= 80 ? 'bg-emerald-600' : score >= 65 ? 'bg-blue-600' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5 Pillar Breakdown Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-blue-700" />
          {t('feasibility.breakdownTitle')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {readinessFactors.map((factor, index) => (
            <div
              key={index}
              className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">
                    {factor.area}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${getRatingBadge(factor.rating)}`}>
                    {getLocalizedRating(factor.rating)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {factor.summary}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span>{t('feasibility.weight')}: {factor.weight}%</span>
                <span className="font-bold text-slate-800">{factor.score} / 100</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Caveat Callout */}
      {criticalCaveat && (
        <div className="mt-5 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">{t('feasibility.preconditionTitle')} </strong>
            <span>{criticalCaveat}</span>
          </div>
        </div>
      )}
    </div>
  );
};
