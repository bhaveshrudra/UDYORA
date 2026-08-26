import React from 'react';
import {
  Store,
  MapPin,
  TrendingUp,
  AlertCircle,
  Users,
  Navigation,
  Building,
  Info
} from 'lucide-react';
import { LocationData, MarketAgentData } from '../types';

interface MarketIntelligenceCardProps {
  marketData: MarketAgentData;
  location: LocationData;
}

export const MarketIntelligenceCard: React.FC<MarketIntelligenceCardProps> = ({
  marketData,
  location
}) => {
  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'MODERATE':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'LOW':
        return 'text-slate-700 bg-slate-100 border-slate-200';
      default:
        return 'text-amber-800 bg-amber-50 border-amber-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Hyper-Local Market & Infrastructure Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Catchment demographics, cooperative hubs, and verified market access points.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-blue-700" />
          <span>{location.village}, {location.block} Block</span>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Market Opportunity Summary
          </span>
          <p className="text-xs font-bold text-slate-900 mt-1.5 leading-relaxed">
            {marketData.marketOpportunitySummary}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Estimated Catchment Reach
          </span>
          <p className="text-xs font-bold text-slate-900 mt-1.5 leading-relaxed">
            {marketData.estimatedMarketReach}
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
            <Users className="w-3.5 h-3.5" />
            <span>Population: {location.population.value} ({location.householdCount.value} HH)</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Competition Density Index
          </span>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded border ${getLevelBadge(marketData.competitionLevel)}`}>
              {marketData.competitionLevel}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              (~{location.localCompetitorsCount.value} local units)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Status: <strong className="text-slate-700">{location.localCompetitorsCount.status}</strong> ({Math.round(location.localCompetitorsCount.confidence * 100)}% confidence)
          </p>
        </div>
      </div>

      {/* Demand Indicators */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Local Demand Channels & Drivers
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {marketData.potentialDemandIndicators.map((item, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-900">{item.indicator}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${getLevelBadge(item.level)}`}>
                  {item.level}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Infrastructure Facilities */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-blue-700" />
          Proximity to Critical Supply Chain & Market Nodes
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {marketData.nearbyFacilities.map((fac, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] font-bold text-slate-900 block line-clamp-1">{fac.name}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{fac.type}</span>
              <p className="text-sm font-extrabold text-blue-900 mt-2">{fac.distanceKm} km</p>
            </div>
          ))}
        </div>
      </div>

      {/* Explicit Data Limitations */}
      {marketData.dataLimitations.length > 0 && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Market Data Limitations & Assumptions
            </h4>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
            {marketData.dataLimitations.map((limit, idx) => (
              <li key={idx}>{limit}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
