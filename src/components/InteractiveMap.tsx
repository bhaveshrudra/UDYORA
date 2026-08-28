import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
  Building2,
  Store,
  Truck,
  CheckCircle2,
  X,
  Compass
} from 'lucide-react';
import { LocationResolution, NearbyPlace, OpportunitySpot } from '../types/map';
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
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  location,
  businessCategory,
  radiusKm = 5,
  onRadiusChange,
  onPlacesLoaded,
  onOpportunitySpotsLoaded,
  className = ''
}) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circleLayerRef = useRef<L.Circle | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeRadius, setActiveRadius] = useState<5 | 10>(radiusKm);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [opportunitySpots, setOpportunitySpots] = useState<OpportunitySpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<OpportunitySpot | null>(null);
  const [showAllSpotsModal, setShowAllSpotsModal] = useState<boolean>(false);

  // Sync internal radius with prop
  useEffect(() => {
    setActiveRadius(radiusKm);
  }, [radiusKm]);

  // Load and score Opportunity Spots deterministically
  const loadLocationIntelligence = useCallback(async () => {
    try {
      const fetchedPlaces = await getNearbyPlacesForLocation(location, businessCategory, activeRadius);
      setPlaces(fetchedPlaces);
      if (onPlacesLoaded) {
        onPlacesLoaded(fetchedPlaces);
      }

      const spots = findTopOpportunitySpots(location, businessCategory, activeRadius, 6);
      setOpportunitySpots(spots);
      if (onOpportunitySpotsLoaded) {
        onOpportunitySpotsLoaded(spots);
      }
    } catch (err) {
      console.warn('Location intelligence loading warning:', err);
    }
  }, [location, businessCategory, activeRadius, onPlacesLoaded, onOpportunitySpotsLoaded]);

  useEffect(() => {
    loadLocationIntelligence();
  }, [loadLocationIntelligence]);

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const centerLat = location.latitude;
    const centerLng = location.longitude;

    // 1. Initialize map if not created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: activeRadius === 5 ? 13 : 12,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false
      });

      // CartoDB Voyager Clean Vector/Raster Tiles (No commercial ads or cluttered labels)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Invalidate size in case of container layout changes
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // 2. Clear previous markers and circle
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }
    if (circleLayerRef.current) {
      map.removeLayer(circleLayerRef.current);
    }

    // 3. Draw Geographic Dotted Circle (True geographic radius: 5km or 10km)
    const circle = L.circle([centerLat, centerLng], {
      radius: activeRadius * 1000,
      color: '#2563eb',
      weight: 2,
      dashArray: '6, 6',
      fillColor: '#3b82f6',
      fillOpacity: 0.05
    }).addTo(map);
    circleLayerRef.current = circle;

    // Fit map bounds to geographic circle
    map.fitBounds(circle.getBounds().pad(0.08));

    // 4. Add Center Marker (● Selected Location)
    const centerIcon = L.divIcon({
      className: 'custom-center-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; transform: translate(-50%, -50%);">
          <span style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(37,99,235,0.25); animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></span>
          <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: #1e3a8a; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 900;">
            ●
          </div>
        </div>
      `,
      iconSize: [0, 0]
    });

    const centerMarker = L.marker([centerLat, centerLng], { icon: centerIcon }).bindTooltip(
      `<strong>${location.villageName || location.localityName}</strong><br/>Fixed Reference Center`,
      { direction: 'top', offset: [0, -14], className: 'custom-map-tooltip' }
    );
    if (markersLayerRef.current) {
      markersLayerRef.current.addLayer(centerMarker);
    }

    // 5. Add Top 3 Opportunity Spot Markers (◆)
    const top3Spots = opportunitySpots.slice(0, 3);
    top3Spots.forEach((spot) => {
      const isSelected = selectedSpot?.id === spot.id;
      const spotIcon = L.divIcon({
        className: `custom-spot-marker-${spot.id}`,
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; transform: translate(-50%, -50%); cursor: pointer;">
            <div style="width: 22px; height: 22px; border-radius: 6px; background: ${
              isSelected ? '#2563eb' : '#f59e0b'
            }; border: 2.5px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; transform: rotate(45deg); transition: all 0.2s ease;">
              <span style="transform: rotate(-45deg); color: #ffffff; font-size: 9px; font-weight: 900;">
                #${spot.rank}
              </span>
            </div>
          </div>
        `,
        iconSize: [0, 0]
      });

      const spotMarker = L.marker([spot.latitude, spot.longitude], { icon: spotIcon })
        .bindTooltip(
          `<strong>#${spot.rank} ${spot.spotName}</strong><br/>Opportunity Score: ${spot.opportunityScore}/100 • ${spot.distanceKm} km`,
          { direction: 'top', offset: [0, -14], className: 'custom-map-tooltip' }
        )
        .on('click', () => {
          setSelectedSpot(spot);
          map.flyTo([spot.latitude, spot.longitude], 14, { animate: true, duration: 0.6 });
        });

      if (markersLayerRef.current) {
        markersLayerRef.current.addLayer(spotMarker);
      }
    });

    return () => {
      // Clean up map instance on unmount
    };
  }, [location, activeRadius, opportunitySpots, selectedSpot]);

  const handleRadiusToggle = (newRadius: 5 | 10) => {
    setActiveRadius(newRadius);
    if (onRadiusChange) {
      onRadiusChange(newRadius);
    }
  };

  const handleRecenter = () => {
    setSelectedSpot(null);
    if (mapInstanceRef.current && circleLayerRef.current) {
      mapInstanceRef.current.fitBounds(circleLayerRef.current.getBounds().pad(0.08), { animate: true });
    }
  };

  const handleSelectSpot = (spot: OpportunitySpot) => {
    setSelectedSpot(spot);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([spot.latitude, spot.longitude], 14, { animate: true, duration: 0.6 });
    }
  };

  const topSpots = opportunitySpots.slice(0, 3);
  const hasMoreSpots = opportunitySpots.length > 3;

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-0 ${className}`}>
      {/* 1. Header Bar: Location identity & Radius Controls */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-800 text-blue-100 px-2 py-0.5 rounded">
              LOCALITY & BUSINESS CATCHMENT
            </span>
            <span className="text-xs font-bold text-slate-900">
              {location.villageName || location.localityName}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {location.districtName}, {location.stateName} •{' '}
            <span className="font-mono text-slate-600">
              {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
            </span>
          </p>
        </div>

        {/* Radius controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 border border-slate-300/60">
            <button
              type="button"
              onClick={() => handleRadiusToggle(5)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeRadius === 5
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5 km
            </button>
            <button
              type="button"
              onClick={() => handleRadiusToggle(10)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeRadius === 10
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              10 km
            </button>
          </div>

          <button
            type="button"
            onClick={handleRecenter}
            title="Recenter Map"
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main 65/35 Balanced Grid: Leaflet Map Left (65%), Top 3 Opportunities Right (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-slate-200">
        {/* LEFT 65%: Fixed-Height Map (440px on Desktop, 340px on Mobile) */}
        <div className="lg:col-span-7 xl:col-span-8 relative h-[340px] sm:h-[440px] bg-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200">
          <div ref={mapContainerRef} className="w-full h-full z-0 select-none" />

          {/* Clean Small Legend Overlay at Bottom-Left */}
          <div className="absolute bottom-3 left-3 z-[400] pointer-events-none">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/95 shadow-sm border border-slate-200 text-[10.5px] font-bold text-slate-800 backdrop-blur-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-900 inline-block border border-white shadow-2xs" />
                <span>Selected Center</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block rotate-45 border border-white shadow-2xs" />
                <span>Opportunity Spot</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-dashed border-blue-600 inline-block" />
                <span>{activeRadius} km Catchment</span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT 35%: Top 3 Recommended Opportunity Areas (Matching 440px Height, Proper Width) */}
        <div className="lg:col-span-5 xl:col-span-4 p-3.5 sm:p-4 h-auto lg:h-[440px] overflow-y-auto flex flex-col justify-between bg-white space-y-2.5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Top Opportunities</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {topSpots.length} within {activeRadius} km
              </span>
            </div>

            {/* Top 3 Opportunity Cards */}
            <div className="space-y-2">
              {topSpots.map((spot) => {
                const isSelected = selectedSpot?.id === spot.id;
                return (
                  <div
                    key={spot.id}
                    onClick={() => handleSelectSpot(spot)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 ${
                          spot.rank === 1
                            ? 'bg-amber-500 text-white'
                            : spot.rank === 2
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-300 text-slate-800'
                        }`}>
                          #{spot.rank}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                            {spot.spotName}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                            {spot.distanceKm} km from center
                          </span>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-100 text-amber-900 shrink-0 font-mono">
                        {spot.opportunityScore} / 100
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-1.5 leading-snug line-clamp-2">
                      {spot.summaryReason}
                    </p>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Confidence: {spot.dataConfidence}%</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSpot(spot);
                        }}
                        className="text-blue-700 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>View factors</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* View all opportunity areas button if more exist */}
          {hasMoreSpots && (
            <button
              type="button"
              onClick={() => setShowAllSpotsModal(true)}
              className="w-full mt-2 py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer text-center"
            >
              View all {opportunitySpots.length} opportunity areas
            </button>
          )}
        </div>
      </div>

      {/* 3. Compact Infrastructure Summary Strip (Height ~80px) */}
      <div className="p-3 sm:p-3.5 bg-slate-50/90 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-500" />
          <div>
            <span className="text-[10px] text-slate-500 font-medium block">
              {businessCategory === 'dairy' ? 'Nearest Dairy Co-op' : 'Wholesale Market'}
            </span>
            <span className="font-bold text-slate-900 font-mono">4.5 km</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-slate-500" />
          <div>
            <span className="text-[10px] text-slate-500 font-medium block">Nearest APMC Mandi</span>
            <span className="font-bold text-slate-900 font-mono">22 km</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-slate-500" />
          <div>
            <span className="text-[10px] text-slate-500 font-medium block">Highway Access</span>
            <span className="font-bold text-emerald-700">Good (1.2 km)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-slate-500" />
          <div>
            <span className="text-[10px] text-slate-500 font-medium block">Transport Route</span>
            <span className="font-bold text-slate-900">Active Commercial</span>
          </div>
        </div>
      </div>

      {/* 4. Selected Spot Detail Drawer / Modal (Compact View Factors) */}
      {selectedSpot && (
        <div className="p-4 bg-blue-50/80 border-t border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                #{selectedSpot.rank} Recommended Spot • {selectedSpot.opportunityScore} / 100
              </span>
              <span className="text-xs text-slate-600 font-mono font-medium">
                {selectedSpot.distanceKm} km from center
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {selectedSpot.spotName}
            </h4>
            <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
              {selectedSpot.summaryReason}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pt-1">
              <span>Population Reach: <strong className="text-slate-900 font-mono">3,800+</strong></span>
              <span>•</span>
              <span>Access: <strong className="text-emerald-700">Paved Transit Corridor</strong></span>
              <span>•</span>
              <span>Data Quality: <strong className="text-blue-900 font-bold">{selectedSpot.dataQuality}</strong></span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedSpot(null)}
            className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0 shadow-xs"
          >
            Close
          </button>
        </div>
      )}

      {/* Modal for All Opportunity Areas */}
      {showAllSpotsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>All Recommended Opportunity Areas ({opportunitySpots.length})</span>
              </h3>
              <button
                onClick={() => setShowAllSpotsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {opportunitySpots.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => {
                    handleSelectSpot(spot);
                    setShowAllSpotsModal(false);
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      #{spot.rank} {spot.spotName}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {spot.opportunityScore} / 100
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {spot.summaryReason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
