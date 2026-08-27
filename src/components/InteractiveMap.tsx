import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Info,
  ShieldCheck,
  Building2,
  Store,
  Truck,
  HeartPulse,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { LocationResolution, NearbyPlace, POICategory } from '../types/map';
import { getNearbyPlacesForLocation } from '../services/mapService';
import { useLanguage } from '../i18n/LanguageContext';

interface InteractiveMapProps {
  location: LocationResolution;
  businessCategory: string;
  radiusKm?: 5 | 10;
  onRadiusChange?: (radius: 5 | 10) => void;
  onPlacesLoaded?: (places: NearbyPlace[]) => void;
  className?: string;
  isCompact?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  location,
  businessCategory,
  radiusKm = 5,
  onRadiusChange,
  onPlacesLoaded,
  className = '',
  isCompact = false
}) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circleLayerRef = useRef<L.Circle | null>(null);

  const [activeRadius, setActiveRadius] = useState<5 | 10>(radiusKm);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [tileStyle, setTileStyle] = useState<'standard' | 'carto'>('standard');

  // Synchronize internal radius with parent prop
  useEffect(() => {
    setActiveRadius(radiusKm);
  }, [radiusKm]);

  // Category Icon & Color Mapping
  const getCategoryColor = (cat: POICategory): string => {
    switch (cat) {
      case 'bank':
        return '#2563eb'; // blue-600
      case 'cooperative':
        return '#059669'; // emerald-600
      case 'market':
        return '#d97706'; // amber-600
      case 'veterinary':
      case 'healthcare':
        return '#7c3aed'; // violet-600
      case 'feed_supplier':
        return '#ea580c'; // orange-600
      case 'retail':
        return '#0284c7'; // sky-600
      case 'transport':
      case 'warehouse':
      default:
        return '#475569'; // slate-600
    }
  };

  const getCategoryEmoji = (cat: POICategory): string => {
    switch (cat) {
      case 'bank':
        return '🏦';
      case 'cooperative':
        return '🥛';
      case 'market':
        return '🌾';
      case 'veterinary':
      case 'healthcare':
        return '🏥';
      case 'feed_supplier':
        return '📦';
      case 'retail':
        return '🏪';
      case 'transport':
        return '🚌';
      case 'warehouse':
        return '🏭';
      default:
        return '📍';
    }
  };

  // Load POIs for current location & category
  const loadPOIs = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const fetchedPlaces = await getNearbyPlacesForLocation(location, businessCategory, activeRadius);
      setPlaces(fetchedPlaces);
      if (onPlacesLoaded) {
        onPlacesLoaded(fetchedPlaces);
      }
    } catch (err) {
      console.warn('Failed to load POIs:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [location, businessCategory, activeRadius, onPlacesLoaded]);

  useEffect(() => {
    loadPOIs();
  }, [loadPOIs]);

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if container changed
    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          center: [location.latitude, location.longitude],
          zoom: activeRadius === 5 ? 13 : 12,
          zoomControl: false,
          attributionControl: false
        });

        // Add OSM Tile Layer
        const tileUrl =
          tileStyle === 'standard'
            ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

        L.tileLayer(tileUrl, {
          maxZoom: 18,
          subdomains: 'abc'
        }).addTo(map);

        // Attribution
        L.control
          .attribution({
            position: 'bottomright',
            prefix: '<span class="text-[9px] text-slate-400">© <a href="https://www.openstreetmap.org/copyright" target="_blank" class="text-blue-600">OpenStreetMap</a> | UDYORA LGD Engine</span>'
          })
          .addTo(map);

        // Marker layer group
        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;

        mapInstanceRef.current = map;
      } catch (err) {
        console.warn('Map initialization error:', err);
        setHasError(true);
      }
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Fly to new center smoothly
    map.flyTo([location.latitude, location.longitude], activeRadius === 5 ? 13 : 12, {
      duration: 1.2
    });

    // Clear previous dynamic layers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }
    if (circleLayerRef.current) {
      map.removeLayer(circleLayerRef.current);
    }

    // 1. Draw 5km / 10km Analysis Radius Circle Overlay
    const radiusCircle = L.circle([location.latitude, location.longitude], {
      radius: activeRadius * 1000,
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '5, 5'
    }).addTo(map);
    circleLayerRef.current = radiusCircle;

    // 2. Draw Center Locality Pin (Pulsing Pin)
    const centerIconHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <span class="absolute w-8 h-8 rounded-full bg-blue-500 opacity-30 animate-ping"></span>
        <div class="relative z-10 w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white">
          📍
        </div>
      </div>
    `;

    const centerMarker = L.marker([location.latitude, location.longitude], {
      icon: L.divIcon({
        className: 'custom-center-pin',
        html: centerIconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      })
    });

    centerMarker.bindPopup(`
      <div class="p-2.5 font-sans space-y-1 text-slate-900 min-w-[200px]">
        <div class="flex items-center gap-1.5 font-black text-xs text-blue-950">
          <span>📍</span>
          <span>${location.localityName}</span>
        </div>
        <p class="text-[11px] text-slate-600 leading-tight">
          ${location.subDistrictName} Mandal, ${location.districtName}, ${location.stateName}
        </p>
        <div class="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono">
          <span class="text-slate-500">Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}</span>
          <span class="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">CENTER</span>
        </div>
      </div>
    `);

    if (markersLayerRef.current) {
      markersLayerRef.current.addLayer(centerMarker);
    }

    // 3. Draw POI Markers
    const filteredPlaces =
      selectedCategory === 'all' ? places : places.filter((p) => p.category === selectedCategory);

    filteredPlaces.forEach((place) => {
      const color = getCategoryColor(place.category);
      const emoji = getCategoryEmoji(place.category);

      const poiIconHtml = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 cursor-pointer">
          <div style="background-color: ${color};" class="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs shadow-md border-2 border-white">
            ${emoji}
          </div>
        </div>
      `;

      const poiMarker = L.marker([place.latitude, place.longitude], {
        icon: L.divIcon({
          className: 'custom-poi-marker',
          html: poiIconHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      });

      poiMarker.bindPopup(`
        <div class="p-2.5 font-sans space-y-1.5 text-slate-900 min-w-[220px]">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              ${place.categoryLabel}
            </span>
            <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
              place.dataQuality === 'VERIFIED'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }">
              ${place.dataQuality}
            </span>
          </div>

          <h4 class="font-bold text-xs text-slate-950 leading-tight">
            ${place.placeName}
          </h4>

          ${place.address ? `<p class="text-[11px] text-slate-600">${place.address}</p>` : ''}

          <div class="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <span class="font-bold text-blue-900 font-mono">
              📏 ${place.distanceKm} km from center
            </span>
            <span class="text-[9px] text-slate-400 font-mono">
              ${place.source.split(' ')[0]}
            </span>
          </div>
        </div>
      `);

      poiMarker.on('click', () => {
        setSelectedPlace(place);
      });

      if (markersLayerRef.current) {
        markersLayerRef.current.addLayer(poiMarker);
      }
    });
  }, [location, places, activeRadius, selectedCategory, tileStyle]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    mapInstanceRef.current?.flyTo([location.latitude, location.longitude], activeRadius === 5 ? 13 : 12, {
      duration: 0.8
    });
  };

  const handleRadiusToggle = (newRadius: 5 | 10) => {
    setActiveRadius(newRadius);
    if (onRadiusChange) {
      onRadiusChange(newRadius);
    }
  };

  return (
    <div
      className={`relative w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 shadow-md flex flex-col ${
        isCompact ? 'h-[320px]' : 'h-[380px] sm:h-[460px]'
      } ${className}`}
    >
      {/* 1. TOP FLOATING CONTROL BAR */}
      <div className="absolute top-3 left-3 right-3 z-400 flex items-center justify-between pointer-events-none gap-2">
        {/* Left: Radius Toggle Chips */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1 shadow-sm flex items-center gap-1 pointer-events-auto">
          <span className="text-[10px] font-bold text-slate-500 px-2 uppercase font-mono hidden sm:inline">
            Radius
          </span>
          <button
            type="button"
            onClick={() => handleRadiusToggle(5)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeRadius === 5
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            5 km
          </button>
          <button
            type="button"
            onClick={() => handleRadiusToggle(10)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeRadius === 10
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            10 km
          </button>
        </div>

        {/* Right: Map Navigation Controls */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1 shadow-sm flex items-center gap-1 pointer-events-auto">
          <button
            type="button"
            onClick={handleRecenter}
            className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Recenter Map"
          >
            <Compass className="w-4 h-4 text-blue-700" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. LEAFLET MAP CANVAS CONTAINER */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0 relative min-h-0 bg-slate-100" />

      {/* 3. ERROR FALLBACK OVERLAY */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center z-500">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
            <Info className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-black text-slate-900 uppercase">Map Data Unavailable</h4>
          <p className="text-[11px] text-slate-600 mt-1 max-w-xs leading-tight">
            Location resolved for <strong>{location.localityName}</strong>. Interactive tiles are offline, but multi-agent analysis will proceed normally using LGD data.
          </p>
        </div>
      )}

      {/* 4. LOADING STATE OVERLAY */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-500">
          <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl shadow-md border border-slate-200 text-xs font-bold text-slate-800">
            <div className="w-3.5 h-3.5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
            <span>Loading location intelligence...</span>
          </div>
        </div>
      )}

      {/* 5. BOTTOM OBSERVATION & METRICS FOOTER */}
      <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-between text-xs z-400 select-none">
        <div className="flex items-center gap-2 truncate">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-slate-900 truncate">
            {places.length} Places Observed within {activeRadius} km
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
            OBSERVED
          </span>
        </div>
      </div>
    </div>
  );
};
