import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Compass,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2
} from 'lucide-react';
import { MapSearchResult, LocationResolution } from '../types/map';
import { searchLocalities, resolveLocationFromSearchResult, KNOWN_LOCALITIES } from '../services/geocodingService';
import { useLanguage } from '../i18n/LanguageContext';

interface LocalitySearchBarProps {
  onLocationResolved: (resolution: LocationResolution) => void;
  currentResolution?: LocationResolution;
  className?: string;
}

export const LocalitySearchBar: React.FC<LocalitySearchBarProps> = ({
  onLocationResolved,
  currentResolution,
  className = ''
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<MapSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showDisambiguation, setShowDisambiguation] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick preset chips for rapid testing / demo
  const presetChips = [
    { label: 'Shamshabad (TS)', query: 'Shamshabad' },
    { label: 'Baramati (MH)', query: 'Baramati' },
    { label: 'Gajwel (TS)', query: 'Gajwel' },
    { label: 'Channarayapatna (KA)', query: 'Channarayapatna' },
    { label: 'Shirwal (MH)', query: 'Shirwal' }
  ];

  // Debounced locality search
  useEffect(() => {
    if (query.trim().length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        try {
          const res = await searchLocalities(query, 6);
          setResults(res);
          setIsOpen(true);
        } catch (err) {
          console.warn('Locality search error:', err);
        } finally {
          setIsSearching(false);
        }
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsOpen(false);
      setIsSearching(false);
    }
  }, [query]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectResult = (result: MapSearchResult) => {
    // If exact name query matches multiple places in different districts/states, show confirmation
    const exactNameMatches = results.filter(
      (r) => r.locality.toLowerCase() === result.locality.toLowerCase()
    );

    if (exactNameMatches.length > 1 && !showDisambiguation) {
      setShowDisambiguation(true);
      return;
    }

    const resolved = resolveLocationFromSearchResult(result);
    onLocationResolved(resolved);
    setQuery('');
    setIsOpen(false);
    setShowDisambiguation(false);
  };

  const handlePresetClick = async (presetQuery: string) => {
    setQuery(presetQuery);
    setIsSearching(true);
    const res = await searchLocalities(presetQuery, 4);
    if (res.length > 0) {
      handleSelectResult(res[0]);
    }
    setIsSearching(false);
  };

  return (
    <div ref={containerRef} className={`relative space-y-2.5 ${className}`}>
      {/* 1. SEARCH INPUT BOX */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-blue-700" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search village, locality, mandal, district (e.g. Shamshabad)..."
          className="w-full pl-10 pr-10 py-3 bg-white border-2 border-slate-200 focus:border-blue-700 focus:ring-4 focus:ring-blue-100 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all outline-hidden"
        />

        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* 2. QUICK DEMO PRESET CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
          Presets:
        </span>
        {presetChips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => handlePresetClick(chip.query)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-200 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            📍 {chip.label}
          </button>
        ))}
      </div>

      {/* 3. AUTOCOMPLETE & DISAMBIGUATION DROPDOWN */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-500 overflow-hidden divide-y divide-slate-100 animate-fadeIn">
          {/* Disambiguation Header if multiple locations share same name */}
          {showDisambiguation && (
            <div className="p-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Multiple locations matched. Please confirm your specific district:</span>
              </div>
            </div>
          )}

          <div className="p-1.5 max-h-72 overflow-y-auto space-y-1">
            {results.map((res) => (
              <button
                key={res.id}
                type="button"
                onClick={() => handleSelectResult(res)}
                className="w-full text-left p-2.5 hover:bg-blue-50/80 rounded-xl transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-0.5 truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-950 group-hover:text-blue-950">
                      {res.locality}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {res.state}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {res.subDistrict} Mandal • {res.district} District • PIN: {res.pincode}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-blue-700 font-bold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Select</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>

          <div className="p-2 bg-slate-50 text-[10px] text-slate-500 flex items-center justify-between font-mono">
            <span>Official LGD Hierarchy + Spatial Geocoding</span>
            <span>Zero Guessing</span>
          </div>
        </div>
      )}
    </div>
  );
};
