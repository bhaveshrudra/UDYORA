import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Info,
  Compass,
  ArrowRight,
  Database,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  LgdState,
  LgdDistrict,
  LgdSubDistrict,
  LgdVillage,
  LgdSearchResult
} from '../types/lgd';
import {
  getLgdStates,
  getLgdDistrictsByState,
  getLgdSubDistrictsByDistrict,
  getLgdVillagesBySubDistrict,
  searchLgdLocations,
  getLgdLocationByVillageCode
} from '../services/locationHierarchyService';

interface LocationHierarchySelectorProps {
  selectedVillage: LgdVillage;
  onSelectVillage: (village: LgdVillage) => void;
  onSelectDemoScenario?: (scenario: 'dairy' | 'tailoring' | 'retail') => void;
}

export const LocationHierarchySelector: React.FC<LocationHierarchySelectorProps> = ({
  selectedVillage,
  onSelectVillage,
  onSelectDemoScenario
}) => {
  const [selectionMode, setSelectionMode] = useState<'search' | 'cascade'>('search');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LgdSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showAdminDetails, setShowAdminDetails] = useState<boolean>(false);

  // Cascading Hierarchy State
  const states = getLgdStates();
  const [selectedStateCode, setSelectedStateCode] = useState<number>(selectedVillage.stateCode);
  const [districts, setDistricts] = useState<LgdDistrict[]>(() => getLgdDistrictsByState(selectedVillage.stateCode));
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number>(selectedVillage.districtCode);
  const [subDistricts, setSubDistricts] = useState<LgdSubDistrict[]>(() => getLgdSubDistrictsByDistrict(selectedVillage.districtCode));
  const [selectedSubDistrictCode, setSelectedSubDistrictCode] = useState<number>(selectedVillage.subDistrictCode);
  const [villages, setVillages] = useState<LgdVillage[]>(() => getLgdVillagesBySubDistrict(selectedVillage.subDistrictCode));

  const currentState = states.find((s) => s.lgdCode === selectedStateCode) || states[0];
  const dynamicSubDistrictTerm = currentState.subDistrictTerm || 'Sub-District';

  // Handle Search Input with Debounce
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const results = searchLgdLocations(searchQuery, 8);
        setSearchResults(results);
        setIsSearching(false);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Synchronize Cascading changes when State changes
  const handleStateChange = (newCode: number) => {
    setSelectedStateCode(newCode);
    const newDistricts = getLgdDistrictsByState(newCode);
    setDistricts(newDistricts);

    if (newDistricts.length > 0) {
      const firstDistrict = newDistricts[0];
      setSelectedDistrictCode(firstDistrict.lgdCode);
      const newSubs = getLgdSubDistrictsByDistrict(firstDistrict.lgdCode);
      setSubDistricts(newSubs);

      if (newSubs.length > 0) {
        const firstSub = newSubs[0];
        setSelectedSubDistrictCode(firstSub.lgdCode);
        const newVils = getLgdVillagesBySubDistrict(firstSub.lgdCode);
        setVillages(newVils);
        if (newVils.length > 0) {
          onSelectVillage(newVils[0]);
        }
      }
    }
  };

  // Synchronize when District changes
  const handleDistrictChange = (newCode: number) => {
    setSelectedDistrictCode(newCode);
    const newSubs = getLgdSubDistrictsByDistrict(newCode);
    setSubDistricts(newSubs);

    if (newSubs.length > 0) {
      const firstSub = newSubs[0];
      setSelectedSubDistrictCode(firstSub.lgdCode);
      const newVils = getLgdVillagesBySubDistrict(firstSub.lgdCode);
      setVillages(newVils);
      if (newVils.length > 0) {
        onSelectVillage(newVils[0]);
      }
    }
  };

  // Synchronize when Sub-District changes
  const handleSubDistrictChange = (newCode: number) => {
    setSelectedSubDistrictCode(newCode);
    const newVils = getLgdVillagesBySubDistrict(newCode);
    setVillages(newVils);
    if (newVils.length > 0) {
      onSelectVillage(newVils[0]);
    }
  };

  // Select Search result
  const handleSelectSearchResult = (result: LgdSearchResult) => {
    onSelectVillage(result.village);
    setSelectedStateCode(result.village.stateCode);
    setDistricts(getLgdDistrictsByState(result.village.stateCode));
    setSelectedDistrictCode(result.village.districtCode);
    setSubDistricts(getLgdSubDistrictsByDistrict(result.village.districtCode));
    setSelectedSubDistrictCode(result.village.subDistrictCode);
    setVillages(getLgdVillagesBySubDistrict(result.village.subDistrictCode));
    setSearchQuery('');
    setSearchResults([]);
  };

  // Shortcut scenario loader
  const handleDemoPresetClick = (scenario: 'dairy' | 'tailoring' | 'retail') => {
    let villageCode = 556214; // Default Dairy: Khed Shivapur
    if (scenario === 'tailoring') villageCode = 586001; // Tailoring: Madhurawada
    if (scenario === 'retail') villageCode = 614101; // Retail: Gejjalagere

    const target = getLgdLocationByVillageCode(villageCode);
    if (target) {
      onSelectVillage(target);
      setSelectedStateCode(target.stateCode);
      setDistricts(getLgdDistrictsByState(target.stateCode));
      setSelectedDistrictCode(target.districtCode);
      setSubDistricts(getLgdSubDistrictsByDistrict(target.districtCode));
      setSelectedSubDistrictCode(target.subDistrictCode);
      setVillages(getLgdVillagesBySubDistrict(target.subDistrictCode));
    }
    if (onSelectDemoScenario) onSelectDemoScenario(scenario);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Selector Mode Toggle Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => setSelectionMode('search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectionMode === 'search'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Village</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectionMode('cascade')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectionMode === 'cascade'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Browse LGD Hierarchy</span>
          </button>
        </div>

        {/* LGD Official Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          <span>LGD 2026.02 Verified</span>
        </div>
      </div>

      {/* MODE 1: UNIFIED INSTANT SEARCH */}
      {selectionMode === 'search' && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search your village, mandal, taluk, district or PIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 hover:border-blue-400 focus:border-blue-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-3 focus:ring-blue-100 shadow-2xs transition-all"
            />
            {isSearching && (
              <span className="absolute right-3.5 top-3 text-[11px] font-bold text-slate-400 animate-pulse">
                Searching...
              </span>
            )}
          </div>

          {/* Search Results Dropdown List */}
          {searchResults.length > 0 && (
            <div className="bg-white border border-blue-200 rounded-2xl shadow-xl divide-y divide-slate-100 max-h-60 overflow-y-auto z-20">
              {searchResults.map((res) => (
                <button
                  key={res.village.id}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full p-3 text-left hover:bg-blue-50/80 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-900 block">
                      📍 {res.village.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {res.village.subDistrictName} {res.village.administrativeTerm} • {res.village.districtName} District • {res.village.stateName}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                    LGD: {res.village.lgdCode}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: CASCADING 4-STEP HIERARCHICAL SELECTOR */}
      {selectionMode === 'cascade' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80">
          {/* Step 1: State */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              01 • State / UT
            </label>
            <div className="relative">
              <select
                value={selectedStateCode}
                onChange={(e) => handleStateChange(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 appearance-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer pr-8 shadow-2xs"
              >
                {states.map((st) => (
                  <option key={st.id} value={st.lgdCode}>
                    {st.name} ({st.shortName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Step 2: District */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              02 • District
            </label>
            <div className="relative">
              <select
                value={selectedDistrictCode}
                onChange={(e) => handleDistrictChange(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 appearance-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer pr-8 shadow-2xs"
              >
                {districts.map((dst) => (
                  <option key={dst.id} value={dst.lgdCode}>
                    {dst.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Step 3: Sub-District (Mandal / Taluka / Taluk / Tehsil) */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-blue-900">
              03 • {dynamicSubDistrictTerm}
            </label>
            <div className="relative">
              <select
                value={selectedSubDistrictCode}
                onChange={(e) => handleSubDistrictChange(Number(e.target.value))}
                className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 appearance-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer pr-8 shadow-2xs"
              >
                {subDistricts.map((sub) => (
                  <option key={sub.id} value={sub.lgdCode}>
                    {sub.name} {sub.administrativeTerm}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Step 4: Village */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              04 • Village / Habitation
            </label>
            <div className="relative">
              <select
                value={selectedVillage.lgdCode}
                onChange={(e) => {
                  const v = villages.find((item) => item.lgdCode === Number(e.target.value));
                  if (v) onSelectVillage(v);
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 appearance-none focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer pr-8 shadow-2xs"
              >
                {villages.map((vil) => (
                  <option key={vil.id} value={vil.lgdCode}>
                    {vil.name} (PIN: {vil.pincode})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMED LOCATION HERO CARD */}
      <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/40 border border-blue-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                  Confirmed Target Catchment
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  PIN: {selectedVillage.pincode}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight mt-1">
                {selectedVillage.name}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {selectedVillage.subDistrictName} {selectedVillage.administrativeTerm} • {selectedVillage.districtName} District • {selectedVillage.stateName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdminDetails(!showAdminDetails)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-800 bg-white hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer self-start sm:self-center shadow-2xs"
          >
            <span>{showAdminDetails ? 'Hide LGD Codes' : 'Administrative Details'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdminDetails ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Collapsible Administrative & Demographic Details */}
        {showAdminDetails && (
          <div className="pt-3 border-t border-blue-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-fadeIn">
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Village LGD Code</span>
              <span className="text-xs font-black text-slate-900 font-mono">{selectedVillage.lgdCode}</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">{selectedVillage.administrativeTerm} Code</span>
              <span className="text-xs font-black text-slate-900 font-mono">{selectedVillage.subDistrictCode}</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">District LGD Code</span>
              <span className="text-xs font-black text-slate-900 font-mono">{selectedVillage.districtCode}</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Population (Census 2011)</span>
              <span className="text-xs font-black text-slate-900 font-mono">{selectedVillage.populationCensus2011.toLocaleString('en-IN')} pop</span>
            </div>
            <div className="sm:col-span-4 text-[11px] text-slate-500 font-mono flex items-center justify-between pt-1">
              <span>Primary Source: Local Government Directory (LGD), MoPR</span>
              <span>Last Synchronized: {selectedVillage.lastSynchronized.split('T')[0]}</span>
            </div>
          </div>
        )}
      </div>

      {/* DEMO SCENARIO SHORTCUTS (CLEARLY LABELED AS SHORTCUTS) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Demo Scenario Shortcuts (1-Click Benchmarks)</span>
          </span>
          <span className="text-[10px] text-slate-400">Loads representative rural catchments</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleDemoPresetClick('dairy')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedVillage.name === 'Khed Shivapur'
                ? 'bg-blue-50/90 border-blue-600 shadow-2xs text-slate-950 font-bold'
                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">🥛 Dairy Farming</span>
              <span className="text-[9px] font-mono bg-blue-100 text-blue-900 px-1 rounded">MH</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Khed Shivapur, Haveli (Pune)
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoPresetClick('tailoring')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedVillage.name === 'Madhurawada'
                ? 'bg-blue-50/90 border-blue-600 shadow-2xs text-slate-950 font-bold'
                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">🧵 Tailoring Workshop</span>
              <span className="text-[9px] font-mono bg-blue-100 text-blue-900 px-1 rounded">AP</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Madhurawada, Vizag Rural
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoPresetClick('retail')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedVillage.name === 'Gejjalagere'
                ? 'bg-blue-50/90 border-blue-600 shadow-2xs text-slate-950 font-bold'
                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">🛍 Kirana Retail Store</span>
              <span className="text-[9px] font-mono bg-blue-100 text-blue-900 px-1 rounded">KA</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Gejjalagere, Maddur (Mandya)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
