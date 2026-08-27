import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  MapPin,
  Compass,
  Info,
  ShieldCheck,
  Building2,
  Store,
  Truck,
  HeartPulse,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { LocationResolution, NearbyPlace, POICategory, OpportunitySpot } from '../types/map';
import { getNearbyPlacesForLocation } from '../services/mapService';
import { findTopOpportunitySpots } from '../services/opportunitySpotService';
import { useLanguage } from '../i18n/LanguageContext';

interface InteractiveMapProps {
  location: LocationResolution;
  businessCategory: string;
  radiusKm?: 5 | 10;
  onRadiusChange?: (radius: 5 | 10) => void;
  onPlacesLoaded?: (places: NearbyPlace[]) => void;
  onOpportunitySpotsLoaded?: (spots: OpportunitySpot[]) => void;
  className?: string;
  isCompact?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  location,
  businessCategory,
  radiusKm = 5,
  onRadiusChange,
  onPlacesLoaded,
  onOpportunitySpotsLoaded,
  className = '',
  isCompact = false
}) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const googleMapInstanceRef = useRef<any | null>(null);
  const googleMarkersRef = useRef<any[]>([]);
  const googleCircleRef = useRef<any | null>(null);

  const [activeRadius, setActiveRadius] = useState<5 | 10>(radiusKm);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [opportunitySpots, setOpportunitySpots] = useState<OpportunitySpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<OpportunitySpot | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'spots' | 'infrastructure'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const [focusedCoordinates, setFocusedCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  // Synchronize internal radius with parent prop
  useEffect(() => {
    setActiveRadius(radiusKm);
  }, [radiusKm]);

  // Load and score Opportunity Spots + POIs deterministically
  const loadLocationIntelligence = useCallback(async () => {
    setIsLoading(true);
    setLoadingStep(1); // Resolving location
    setSelectedSpot(null);
    setSelectedPlace(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      setLoadingStep(2); // Building catchment

      await new Promise((resolve) => setTimeout(resolve, 150));
      setLoadingStep(3); // Analyzing local evidence
      const fetchedPlaces = await getNearbyPlacesForLocation(location, businessCategory, activeRadius);
      setPlaces(fetchedPlaces);
      if (onPlacesLoaded) {
        onPlacesLoaded(fetchedPlaces);
      }

      setLoadingStep(4); // Finding candidate areas
      await new Promise((resolve) => setTimeout(resolve, 150));
      setLoadingStep(5); // Calculating opportunity scores
      const spots = findTopOpportunitySpots(location, businessCategory, activeRadius, 4);
      setOpportunitySpots(spots);
      if (onOpportunitySpotsLoaded) {
        onOpportunitySpotsLoaded(spots);
      }
    } catch (err) {
      console.warn('Location intelligence loading warning:', err);
    } finally {
      setIsLoading(false);
    }
  }, [location, businessCategory, activeRadius, onPlacesLoaded, onOpportunitySpotsLoaded]);

  useEffect(() => {
    loadLocationIntelligence();
  }, [loadLocationIntelligence]);

  const handleRadiusToggle = (newRadius: 5 | 10) => {
    setActiveRadius(newRadius);
    if (onRadiusChange) {
      onRadiusChange(newRadius);
    }
  };

  const handleRecenter = () => {
    setFocusedCoordinates(null);
    setSelectedSpot(null);
    setSelectedPlace(null);
  };

  const handleSelectSpot = (spot: OpportunitySpot) => {
    setSelectedSpot(spot);
    setSelectedPlace(null);
    setFocusedCoordinates({ lat: spot.latitude, lng: spot.longitude });
  };

  // Google Maps Embed URL centered on selected location or active focused spot
  const centerLat = focusedCoordinates ? focusedCoordinates.lat : location.latitude;
  const centerLng = focusedCoordinates ? focusedCoordinates.lng : location.longitude;
  const embedZoom = focusedCoordinates ? 15 : activeRadius === 5 ? 13 : 12;

  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${centerLat},${centerLng}`
  )}&hl=en&z=${embedZoom}&output=embed`;

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs ${className}`}>
      {/* Header Bar: Selected Location & Catchment Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Location Identity */}
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {location.villageName || location.localityName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Fixed Reference Center
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {location.subDistrictName ? `${location.subDistrictName}, ` : ''}
                {location.districtName}, {location.stateName} •{' '}
                <span className="font-mono text-slate-600">
                  {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                </span>
              </p>
            </div>
          </div>

          {/* Catchment Radius Selector & Recenter Button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex rounded-xl bg-slate-200/80 p-1 border border-slate-300/60">
              <button
                type="button"
                onClick={() => handleRadiusToggle(5)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeRadius === 5
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                5 km Radius
              </button>
              <button
                type="button"
                onClick={() => handleRadiusToggle(10)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeRadius === 10
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                10 km Radius
              </button>
            </div>

            <button
              type="button"
              onClick={handleRecenter}
              title="Reset center to selected location"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended Spots List + Map Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Recommended Opportunity Spots (Ranked List) */}
        <div className="lg:col-span-5 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-slate-200 space-y-3.5 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Recommended Opportunity Spots
              </h4>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              {opportunitySpots.length} within {activeRadius}km
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Candidate opportunity zones for <strong className="text-slate-800 uppercase">{businessCategory}</strong> evaluated across population, road access, and competition gap.
          </p>

          {/* Opportunity Spots Card List */}
          <div className="space-y-2.5">
            {opportunitySpots.map((spot) => {
              const isSelected = selectedSpot?.id === spot.id;
              return (
                <div
                  key={spot.id}
                  onClick={() => handleSelectSpot(spot)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {spot.rank}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 leading-snug">
                          {spot.spotName}
                        </h5>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {spot.categoryLabel} • {spot.distanceKm} km from center
                        </span>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                        {spot.opportunityScore}/100
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed line-clamp-2">
                    {spot.summaryReason}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Confidence: {spot.dataConfidence}%
                    </span>
                    <span className="text-blue-700 font-bold hover:underline flex items-center gap-0.5">
                      View factors <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Map View + Overlays */}
        <div className="lg:col-span-7 relative flex flex-col justify-between bg-slate-100 min-h-[340px] sm:min-h-[460px]">
          {/* Google Maps View */}
          <div className="relative w-full h-[340px] sm:h-[460px] overflow-hidden">
            <iframe
              title={`Google Map - ${location.villageName || location.localityName}`}
              src={googleMapsEmbedUrl}
              className="w-full h-full border-0 select-none pointer-events-auto"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Catchment Radius Badge Overlay */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 shadow-sm border border-slate-200/80 backdrop-blur-xs">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                Business Catchment: {activeRadius} km Radius
              </span>
            </div>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
              <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-white/95 shadow-sm border border-slate-200/80 text-[11px] font-bold text-slate-800 backdrop-blur-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  Selected Center
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block rotate-45" />
                  Opportunity Spot
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
                  Infrastructure
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Opportunity Spot Detail Modal / Drawer */}
      {selectedSpot && (
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/80">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Rank #{selectedSpot.rank} Opportunity Spot
                </span>
                <span className="text-xs text-slate-500">
                  {selectedSpot.distanceKm} km from selected center
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mt-1">
                {selectedSpot.spotName}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {selectedSpot.summaryReason}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSpot(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Factor-by-Factor Explainable Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(selectedSpot.factors).map(([key, factor]) => (
              <div key={key} className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{factor.factorName}</span>
                  <span className="font-mono text-blue-700 font-bold">{factor.score}/100</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      factor.score >= 85 ? 'bg-emerald-600' : factor.score >= 70 ? 'bg-blue-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight pt-1">
                  {factor.details}
                </p>
              </div>
            ))}
          </div>

          {/* Provenance & Decision Support Note */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Data Quality: <strong>{selectedSpot.dataQuality}</strong> • Sources: {selectedSpot.sources.map((s) => s.name).join(', ')}
              </span>
            </div>
            <span className="italic text-[11px]">
              Recommendation provided as decision support based on verified spatial benchmarks.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
