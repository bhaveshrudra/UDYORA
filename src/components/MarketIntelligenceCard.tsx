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
  marketData?: MarketAgentData | { data: MarketAgentData };
}

export const MarketIntelligenceCard: React.FC<MarketIntelligenceCardProps> = ({ marketData: rawData }) => {
  const { t } = useLanguage();
  const marketData: MarketAgentData = (rawData as any)?.data || rawData || {
    demandSummary: 'Steady local consumer demand in rural catchment area.',
    catchmentDemographics: { targetVillagePopulation: 3500, households: 700 },
    competitionDensity: 'MODERATE',
    competitionSummary: 'Moderate local competition with adequate market capacity.',
    demandDrivers: [],
    infrastructureProximity: []
  };

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

  const popVal = marketData.catchmentDemographics?.targetVillagePopulation ?? 3500;
  const hholdVal = marketData.catchmentDemographics?.households ?? 700;
  const compDensity = marketData.competitionDensity || marketData.competitionLevel || 'MODERATE';
  const demandDrivers = Array.isArray(marketData.demandDrivers) ? marketData.demandDrivers : [];
  const infraList = Array.isArray(marketData.infrastructureProximity) ? marketData.infrastructureProximity : [];

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
            {marketData.demandSummary || marketData.marketOpportunitySummary || 'Steady rural consumer off-take.'}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            {t('market.reach')}
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {typeof popVal === 'number' ? popVal.toLocaleString('en-IN') : popVal}
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
            {t('market.population')} {hholdVal} {t('market.households')}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            {t('market.competition')}
          </span>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-md border ${getDensityColor(compDensity)}`}>
              {getLocalizedDensityText(compDensity)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
            {marketData.competitionSummary || 'Competitive density is aligned with regional benchmarks.'}
          </p>
        </div>
      </div>

      {/* Demand Channels & Drivers */}
      {demandDrivers.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            {t('market.demandTitle')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {demandDrivers.map((driver, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>{driver}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Infrastructure & Market Proximity Matrix */}
      {infraList.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-700" />
            {t('market.proximityTitle')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {infraList.map((node, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block truncate">{node.facilityName}</span>
                <span className="text-lg font-black text-slate-900 mt-1 block">
                  {node.distanceKm} <span className="text-xs font-semibold text-slate-500">km</span>
                </span>
                <span className="text-[10px] text-blue-800 font-bold uppercase mt-0.5 block truncate">
                  {node.facilityType}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
