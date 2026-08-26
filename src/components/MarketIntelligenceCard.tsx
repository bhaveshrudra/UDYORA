import React from 'react';
import {
  Store,
  MapPin,
  TrendingUp,
  Users,
  Navigation,
  Info,
  Building2,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { MarketAgentData } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface MarketIntelligenceCardProps {
  marketData: MarketAgentData;
}

export const MarketIntelligenceCard: React.FC<MarketIntelligenceCardProps> = ({ marketData }) => {
  const { t } = useLanguage();

  const getDensityColor = (density: string) => {
    switch (density) {
      case 'LOW':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'MODERATE':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'HIGH':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getLocalizedDensityText = (density: string) => {
    switch (density) {
      case 'LOW': return t('market.level.low');
      case 'MODERATE': return t('market.level.moderate');
      case 'HIGH': return t('market.level.high');
      default: return t('market.level.unknown');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              {t('market.title')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('market.subtitle')}
          </p>
        </div>
      </div>

      {/* Top 3 Summary Metric Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            {t('market.opportunity')}
          </span>
          <p className="text-xs font-bold text-slate-900 mt-2 leading-relaxed">
            {marketData.demandSummary}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            {t('market.reach')}
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {marketData.catchmentDemographics.targetVillagePopulation.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
            {t('market.population')} {marketData.catchmentDemographics.households} {t('market.households')}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            {t('market.competition')}
          </span>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-md border ${getDensityColor(marketData.competitionDensity)}`}>
              {getLocalizedDensityText(marketData.competitionDensity)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
            {marketData.competitionSummary}
          </p>
        </div>
      </div>

      {/* Demand Channels & Drivers */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
          {t('market.demandTitle')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {marketData.demandDrivers.map((driver, idx) => (
            <div key={idx} className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs text-slate-700 leading-snug font-medium">{driver}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Infrastructure Distances */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-blue-700" />
          {t('market.proximityTitle')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {marketData.infrastructureProximity.map((infra, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-slate-600 block line-clamp-1">
                {infra.facilityName}
              </span>
              <p className="text-lg font-black text-slate-900 mt-1">
                {infra.distanceKm} km
              </p>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                {infra.facilityType}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Limitations Callout */}
      {marketData.dataLimitations && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-slate-800">{t('market.limitationsTitle')}: </strong>
            <span>{marketData.dataLimitations}</span>
          </div>
        </div>
      )}
    </div>
  );
};
