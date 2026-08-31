import React from'react';
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
} from'lucide-react';
import { MarketAgentData } from'../types';
import { useLanguage } from'../i18n/LanguageContext';

interface MarketIntelligenceCardProps {
 marketData?: MarketAgentData | { data: MarketAgentData };
}

export const MarketIntelligenceCard: React.FC<MarketIntelligenceCardProps> = ({ marketData: rawData }) => {
 const { t } = useLanguage();
 const marketData: MarketAgentData = (rawData as any)?.data || rawData || {
 demandSummary:'Steady local consumer demand in rural catchment area.',
 catchmentDemographics: { targetVillagePopulation: 3500, households: 700 },
 competitionDensity:'MODERATE',
 competitionSummary:'Moderate local competition with adequate market capacity.',
 demandDrivers: [],
 infrastructureProximity: []
 };

 const getDensityColor = (density: string) => {
 switch (density) {
 case'LOW':
 return'text-emerald-800 bg-emerald-50 border-emerald-200';
 case'MODERATE':
 return'text-blue-800 bg-blue-50 border-blue-200';
 case'HIGH':
 return'text-amber-800 bg-amber-50 border-amber-200';
 default:
 return'text-slate-600 bg-slate-100 border-slate-200';
 }
 };

 const getLocalizedDensityText = (density: string) => {
 switch (density) {
 case'LOW': return t('market.level.low');
 case'MODERATE': return t('market.level.moderate');
 case'HIGH': return t('market.level.high');
 default: return t('market.level.unknown');
 }
 };

 const popVal = marketData.catchmentDemographics?.targetVillagePopulation ?? 3500;
 const hholdVal = marketData.catchmentDemographics?.households ?? 700;
 const compDensity = marketData.competitionDensity || marketData.competitionLevel ||'MODERATE';
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
 {marketData.demandSummary || marketData.marketOpportunitySummary ||'Steady rural consumer off-take.'}
 </p>
 </div>

 <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
 <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
 {t('market.reach')}
 </span>
 <p className="text-xl font-black text-slate-900 mt-1">
 {typeof popVal ==='number' ? popVal.toLocaleString('en-IN') : popVal}
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
 {marketData.competitionSummary ||'Competitive density is aligned with regional benchmarks.'}
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

 {/* Recommended Business Opportunity Spots Section */}
 {marketData.recommendedOpportunitySpots && marketData.recommendedOpportunitySpots.length > 0 && (
 <div className="border-t border-slate-100 pt-5 space-y-3">
 <div className="flex items-center justify-between">
 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
 <MapPin className="w-3.5 h-3.5 text-blue-700" />
 Recommended Business Opportunity Spots (5km Catchment)
 </h3>
 <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
 Spatial Decision Support
 </span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {marketData.recommendedOpportunitySpots.map((spot) => (
 <div
 key={spot.id}
 className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 space-y-2 hover:border-blue-300 transition-colors"
 >
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-start gap-2">
 <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
 {spot.rank}
 </span>
 <div>
 <h4 className="text-xs font-bold text-slate-900">{spot.spotName}</h4>
 <span className="text-[11px] text-slate-500 font-medium">
 {spot.categoryLabel} • {spot.distanceKm} km from center
 </span>
 </div>
 </div>

 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
 {spot.opportunityScore}/100
 </span>
 </div>

 <p className="text-[11px] text-slate-600 leading-relaxed">
 {spot.summaryReason}
 </p>

 <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
 <span>Data Quality: <strong>{spot.dataQuality}</strong></span>
 <span>Confidence: <strong>{spot.dataConfidence}%</strong></span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
};
