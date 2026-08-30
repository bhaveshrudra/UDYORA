import React, { useEffect, useRef, useState } from 'react';
import { Compass, MapPin, Sparkles, Building2, Store, ExternalLink, Info, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react';
import { LocationResolution, OpportunitySpot } from '../types/map';
import { useLanguage } from '../i18n/LanguageContext';
import {
  isApiKeyConfigured,
  loadGoogleMapsScript,
  isMapBillingError,
  resetGoogleMapLoader
} from '../services/googleMapLoader';
import { normalizeCoordinates, MapLocation } from '../services/coordinateNormalizer';
import {
  NearbyResourceItem,
  fetchNearbyResourcesFromGoogle,
  CATEGORY_SEARCH_PARAMS
} from '../services/nearbyPlacesService';
import { findTopOpportunitySpots, findAllOpportunitySpots } from '../services/opportunitySpotService';

export interface InteractiveMapProps {
  location?: LocationResolution | null;
  mapState?: 'india' | 'state' | 'district' | 'mandal' | 'confirmed';
  centerCoords?: { lat: number; lng: number; zoom: number };
  radiusKm?: 5 | 10;
  onRadiusChange?: (radius: 5 | 10) => void;
  businessCategory?: string;
  className?: string;
}

export type MapTypeOption = 'roadmap' | 'satellite' | 'terrain' | 'hybrid';

const UDYORA_MAP_ID = 'UDYORA_MAP_ID';

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  location,
  mapState = 'india',
  centerCoords,
  radiusKm = 5,
  onRadiusChange,
  businessCategory = 'dairy',
  className = ''
}) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const circleInstanceRef = useRef<google.maps.Circle | null>(null);
  const markersRef = useRef<any[]>([]);

  const [activeMapType, setActiveMapType] = useState<MapTypeOption>('roadmap');
  const [activeRadius, setActiveRadius] = useState<5 | 10>(radiusKm);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [mapConfigured, setMapConfigured] = useState<boolean>(true);
  const [hasBillingError, setHasBillingError] = useState<boolean>(false);

  // Places API & Opportunity Spots Data State
  const [nearbyResources, setNearbyResources] = useState<NearbyResourceItem[]>([]);
  const [opportunitySpots, setOpportunitySpots] = useState<OpportunitySpot[]>([]);
  const [allOpportunitySpots, setAllOpportunitySpots] = useState<OpportunitySpot[]>([]);
  const [showAllSpots, setShowAllSpots] = useState<boolean>(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(false);
  const [selectedPoi, setSelectedPoi] = useState<{
    title: string;
    category: string;
    distanceKm: number;
    address: string;
    source: string;
    type: 'location' | 'opportunity' | 'resource';
  } | null>(null);

  // Sync radius prop
  useEffect(() => {
    setActiveRadius(radiusKm);
  }, [radiusKm]);

  // Coordinate Normalization (No undefined.lat)
  const normalizedLocationCoords: MapLocation | null = normalizeCoordinates(location);
  const normalizedCenterCoords: MapLocation | null = normalizeCoordinates(centerCoords) || { lat: 20.5937, lng: 78.9629 };
  const currentZoom: number = centerCoords?.zoom || (mapState === 'confirmed' ? 13.0 : mapState === 'mandal' ? 11.5 : mapState === 'district' ? 9.5 : mapState === 'state' ? 7.0 : 4.5);

  // 1. Listen for Google Maps Billing Errors
  useEffect(() => {
    const handleBillingErr = () => {
      setHasBillingError(true);
    };
    window.addEventListener('udyora_map_billing_error', handleBillingErr);
    if (isMapBillingError()) setHasBillingError(true);

    return () => {
      window.removeEventListener('udyora_map_billing_error', handleBillingErr);
    };
  }, []);

  // 2. Load Google Maps JS API Asynchronously
  useEffect(() => {
    let isSubscribed = true;

    if (!isApiKeyConfigured()) {
      setMapConfigured(false);
      return;
    }

    loadGoogleMapsScript().then((success) => {
      if (!isSubscribed) return;
      if (success && window.google && window.google.maps) {
        setIsMapLoaded(true);
        setMapConfigured(true);
      } else {
        setMapConfigured(false);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, []);

  // 3. Initialize Google Map Instance ONCE on mount (No Map Recreation)
  useEffect(() => {
    if (!isMapLoaded || !mapContainerRef.current || hasBillingError) return;
    if (mapInstanceRef.current) return;

    const initialCenter = mapState === 'confirmed' && normalizedLocationCoords
      ? normalizedLocationCoords
      : normalizedCenterCoords;

    try {
      const map = new google.maps.Map(mapContainerRef.current, {
        center: initialCenter,
        zoom: currentZoom,
        mapId: UDYORA_MAP_ID,
        mapTypeId: activeMapType,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'cooperative'
      });

      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('[UDYORA MAP Init Error]', err);
    }
  }, [isMapLoaded, hasBillingError]);

  // 4. Fetch Real Google Places & UDYORA Opportunities ONLY when location, business, or radius changes
  useEffect(() => {
    if (mapState !== 'confirmed' || !location || !normalizedLocationCoords) {
      setNearbyResources([]);
      setOpportunitySpots([]);
      setAllOpportunitySpots([]);
      return;
    }

    // A. Calculate UDYORA Analytical Opportunities
    const allOpps = findAllOpportunitySpots(location, businessCategory, activeRadius);
    setAllOpportunitySpots(allOpps);
    setOpportunitySpots(allOpps.slice(0, 3));

    // B. Fetch Real Nearby Resources from Google Places API
    setIsLoadingPlaces(true);
    fetchNearbyResourcesFromGoogle(normalizedLocationCoords, businessCategory, activeRadius)
      .then((items) => {
        setNearbyResources(items);
      })
      .finally(() => {
        setIsLoadingPlaces(false);
      });
  }, [
    mapState,
    location?.id,
    location?.latitude,
    location?.longitude,
    location?.villageName,
    location?.localityName,
    businessCategory,
    activeRadius
  ]);

  // 5. Render Map Center, Catchment Circle, and Distinct AdvancedMarkerElement Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapLoaded || hasBillingError || !window.google || !window.google.maps) return;

    // Clear existing markers and circle
    markersRef.current.forEach((m) => {
      if (m.map !== undefined) m.map = null;
      else if (m.setMap) m.setMap(null);
    });
    markersRef.current = [];

    if (circleInstanceRef.current) {
      circleInstanceRef.current.setMap(null);
      circleInstanceRef.current = null;
    }

    if (mapState === 'india') {
      map.setCenter({ lat: 20.5937, lng: 78.9629 });
      map.setZoom(4.5);
    } else if (mapState === 'state' && normalizedCenterCoords) {
      map.setCenter(normalizedCenterCoords);
      map.setZoom(7.0);
    } else if (mapState === 'district' && normalizedCenterCoords) {
      map.setCenter(normalizedCenterCoords);
      map.setZoom(9.5);
    } else if (mapState === 'mandal' && normalizedCenterCoords) {
      map.setCenter(normalizedCenterCoords);
      map.setZoom(11.5);
    } else if (mapState === 'confirmed' && normalizedLocationCoords) {
      const center = normalizedLocationCoords;
      map.setCenter(center);
      map.setZoom(activeRadius === 10 ? 12.0 : 13.0);

      // A. Selected Location Marker (● Dark Blue Pin)
      try {
        const locPin = document.createElement('div');
        locPin.className = 'w-7 h-7 rounded-full bg-blue-950 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform';
        locPin.innerHTML = '<div class="w-2.5 h-2.5 rounded-full bg-white font-bold text-[8px]">●</div>';

        if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
          const locMarker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: center,
            title: location?.localityName || location?.villageName || 'Selected Location',
            content: locPin
          });
          locMarker.addListener('click', () => {
            setSelectedPoi({
              title: location?.localityName || location?.villageName || 'Selected Center',
              category: 'Confirmed Village / Locality Center',
              distanceKm: 0,
              address: location?.formattedAddress || 'Local Government Directory Center',
              source: 'Local Government Directory (LGD)',
              type: 'location'
            });
          });
          markersRef.current.push(locMarker);
        } else {
          const legacyLocMarker = new google.maps.Marker({
            position: center,
            map,
            title: location?.localityName || 'Selected Location'
          });
          markersRef.current.push(legacyLocMarker);
        }
      } catch (err) {
        console.warn('[UDYORA MAP Marker Warning]', err);
      }

      // B. Recommended Opportunity Markers (◆ Amber Diamond Pins)
      opportunitySpots.forEach((opp) => {
        try {
          const oppPin = document.createElement('div');
          oppPin.className = 'w-6 h-6 rotate-45 bg-amber-500 border-2 border-white shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform';
          oppPin.innerHTML = `<span class="-rotate-45 text-[9px] font-black text-slate-950">${opp.rank}</span>`;

          if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
            const oppMarker = new google.maps.marker.AdvancedMarkerElement({
              map,
              position: { lat: opp.latitude, lng: opp.longitude },
              title: opp.spotName,
              content: oppPin
            });
            oppMarker.addListener('click', () => {
              setSelectedPoi({
                title: opp.spotName,
                category: opp.categoryLabel,
                distanceKm: opp.distanceKm,
                address: opp.summaryReason,
                source: 'UDYORA Location Intelligence Engine',
                type: 'opportunity'
              });
            });
            markersRef.current.push(oppMarker);
          }
        } catch (err) {}
      });

      // C. Nearby Resource Markers (○ Emerald Circle Pins)
      nearbyResources.forEach((res) => {
        try {
          const resPin = document.createElement('div');
          resPin.className = 'w-5 h-5 rounded-full bg-emerald-600 border-2 border-white shadow-xs flex items-center justify-center cursor-pointer hover:scale-110 transition-transform';
          resPin.innerHTML = '<div class="w-1.5 h-1.5 rounded-full bg-white"></div>';

          if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
            const resMarker = new google.maps.marker.AdvancedMarkerElement({
              map,
              position: res.coords,
              title: res.name,
              content: resPin
            });
            resMarker.addListener('click', () => {
              setSelectedPoi({
                title: res.name,
                category: res.categoryLabel,
                distanceKm: res.distanceKm,
                address: res.address,
                source: res.dataSource,
                type: 'resource'
              });
            });
            markersRef.current.push(resMarker);
          }
        } catch (err) {}
      });

      // Real 5 km / 10 km Geographic Circle
      const circle = new google.maps.Circle({
        map,
        center,
        radius: activeRadius * 1000,
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.06
      });
      circleInstanceRef.current = circle;
    }
  }, [mapState, normalizedCenterCoords?.lat, normalizedCenterCoords?.lng, normalizedLocationCoords?.lat, normalizedLocationCoords?.lng, activeRadius, opportunitySpots, nearbyResources, isMapLoaded, hasBillingError]);

  // Map Type Switcher Handler (No Places search or map recreation)
  const handleMapTypeChange = (type: MapTypeOption) => {
    setActiveMapType(type);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type);
    }
  };

  const handleRadiusToggle = (r: 5 | 10) => {
    setActiveRadius(r);
    if (onRadiusChange) {
      onRadiusChange(r);
    }
  };

  const handleRetryMap = () => {
    resetGoogleMapLoader();
    setHasBillingError(false);
    setMapConfigured(true);
    setIsMapLoaded(false);

    loadGoogleMapsScript().then((success) => {
      if (success && window.google && window.google.maps) {
        setIsMapLoaded(true);
        setMapConfigured(true);
      } else {
        setMapConfigured(false);
      }
    });
  };

  // Controlled UDYORA Fallback for BillingNotEnabledMapError, Key/Referrer Failure, or Unconfigured API Key
  if (!mapConfigured || hasBillingError) {
    return (
      <div className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs ${className}`}>
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider bg-slate-800 text-white px-2 py-0.5 rounded font-mono">
            LOCALITY & CATCHMENT MAP
          </span>
        </div>
        <div className="p-8 text-center space-y-3 bg-slate-50/50">
          <Compass className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-black text-slate-800">
              Map temporarily unavailable.
            </h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Location intelligence could not be loaded right now. Rest of the assessment remains active.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRetryMap}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const categoryLabel = (CATEGORY_SEARCH_PARAMS[businessCategory] || CATEGORY_SEARCH_PARAMS.custom).categoryLabel;

  return (
    <div className={`bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-0 ${className}`}>
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-900 text-white px-2 py-0.5 rounded font-mono">
              LOCALITY & CATCHMENT
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 mt-1">
            {mapState === 'confirmed' && location
              ? `${location.localityName || location.villageName}, ${location.subDistrictName}, ${location.districtName}`
              : mapState === 'mandal'
              ? 'Sub-District / Mandal Level View'
              : mapState === 'district'
              ? 'District Level View'
              : mapState === 'state'
              ? 'State Level View'
              : t('loc.mapInitialPrompt')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Map Type Switcher */}
          <div className="inline-flex rounded-xl bg-slate-200/80 p-0.5 border border-slate-300/60 text-[11px] font-bold">
            {[
              { id: 'roadmap' as const, label: 'Normal' },
              { id: 'satellite' as const, label: 'Satellite' },
              { id: 'terrain' as const, label: 'Terrain' },
              { id: 'hybrid' as const, label: 'Hybrid' }
            ].map((tOpt) => (
              <button
                key={tOpt.id}
                type="button"
                onClick={() => handleMapTypeChange(tOpt.id)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeMapType === tOpt.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                {tOpt.label}
              </button>
            ))}
          </div>

          {/* 5 km / 10 km Radius Switcher */}
          {mapState === 'confirmed' && (
            <div className="inline-flex rounded-xl bg-slate-200/80 p-0.5 border border-slate-300/60 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => handleRadiusToggle(5)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeRadius === 5
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                5 km
              </button>
              <button
                type="button"
                onClick={() => handleRadiusToggle(10)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeRadius === 10
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                10 km
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Google Maps Container */}
      <div className="relative">
        <div ref={mapContainerRef} className="w-full h-[360px] sm:h-[380px] bg-slate-100 z-0" />

        {/* Selected POI Modal Popover */}
        {selectedPoi && (
          <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-sm bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-xl z-20 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                  selectedPoi.type === 'location'
                    ? 'bg-blue-100 text-blue-900'
                    : selectedPoi.type === 'opportunity'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {selectedPoi.type === 'location'
                    ? 'Selected Center'
                    : selectedPoi.type === 'opportunity'
                    ? 'Recommended Opportunity'
                    : 'Nearby Resource'}
                </span>
                <h4 className="text-xs font-black text-slate-950 mt-1">{selectedPoi.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPoi(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="text-[11px] font-semibold text-slate-700 space-y-1">
              <p><span className="text-slate-400">Category:</span> {selectedPoi.category}</p>
              <p><span className="text-slate-400">Distance:</span> <strong className="text-blue-700 font-mono">{selectedPoi.distanceKm} km</strong></p>
              <p><span className="text-slate-400">Address / Detail:</span> {selectedPoi.address}</p>
              <p><span className="text-slate-400">Data Source:</span> <span className="text-slate-800 font-mono">{selectedPoi.source}</span></p>
            </div>
          </div>
        )}

        {/* Map Legend Overlay */}
        {mapState === 'confirmed' && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs z-10 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-950 border border-white inline-block"></span>
              Selected Center
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rotate-45 bg-amber-500 border border-white inline-block"></span>
              Recommended Opportunity
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white inline-block"></span>
              Nearby Resource ({categoryLabel})
            </span>
          </div>
        )}
      </div>

      {/* COMPACT NEARBY RESOURCES & ANALYTICAL OPPORTUNITY PANEL */}
      {mapState === 'confirmed' && (
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* 1. RECOMMENDED OPPORTUNITIES PANEL (UDYORA Analytical Engine) */}
            <div className="bg-white border border-amber-200/90 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <h3 className="text-xs font-black text-slate-900 tracking-tight">
                    RECOMMENDED OPPORTUNITY AREAS
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-mono">
                    {allOpportunitySpots.length > 0 ? (showAllSpots ? `${allOpportunitySpots.length} Total` : `Top 3 of ${allOpportunitySpots.length}`) : '0 Ranked'}
                  </span>
                  {allOpportunitySpots.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllSpots(!showAllSpots)}
                      className="text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      {showAllSpots ? 'Show Top 3' : `View All (${allOpportunitySpots.length})`}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {(showAllSpots ? allOpportunitySpots : allOpportunitySpots.slice(0, 3)).map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => setSelectedPoi({
                      title: opp.spotName,
                      category: opp.categoryLabel,
                      distanceKm: opp.distanceKm,
                      address: opp.summaryReason,
                      source: 'UDYORA Location Intelligence Engine',
                      type: 'opportunity'
                    })}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-amber-300 bg-amber-50/30 hover:bg-amber-50/80 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[9px] font-black">
                          {opp.rank}
                        </span>
                        {opp.spotName}
                      </span>
                      <span className="text-xs font-bold font-mono text-blue-700">{opp.distanceKm} km</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-600 line-clamp-1">{opp.summaryReason}</p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-0.5">
                      <span>{opp.categoryLabel}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-800 font-mono">Score: {opp.opportunityScore}/100</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-emerald-700 font-mono">Conf: {opp.dataConfidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. NEARBY RESOURCES PANEL (Google Places Real POIs) */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h3 className="text-xs font-black text-slate-900 tracking-tight">
                    NEARBY RESOURCES
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-mono">
                  {isLoadingPlaces ? 'Searching...' : `${nearbyResources.length} Verified Places`}
                </span>
              </div>

              {isLoadingPlaces ? (
                <div className="p-4 text-center text-xs font-bold text-slate-500 animate-pulse">
                  Querying Google Places API for nearby {categoryLabel}...
                </div>
              ) : nearbyResources.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl text-center text-xs font-semibold text-slate-600">
                  No verified nearby resources found for this business category within {activeRadius} km.
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {nearbyResources.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => setSelectedPoi({
                        title: res.name,
                        category: res.categoryLabel,
                        distanceKm: res.distanceKm,
                        address: res.address,
                        source: res.dataSource,
                        type: 'resource'
                      })}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 bg-slate-50/60 hover:bg-emerald-50/40 transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                          {res.name}
                        </span>
                        <span className="text-xs font-bold font-mono text-emerald-800 shrink-0">{res.distanceKm} km</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                        <span className="truncate max-w-[180px]">{res.address}</span>
                        <span className="text-slate-400 font-mono">Source: Google Places</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
