import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Briefcase,
  IndianRupee,
  Mic,
  MicOff,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  Clock,
  Award,
  Compass,
  Layers,
  Building2
} from 'lucide-react';
import { UserBusinessInput, LocationData } from '../types';
import { LgdVillage } from '../types/lgd';
import { LocationResolution, NearbyPlace } from '../types/map';
import { OFFICIAL_LGD_VILLAGES } from '../data/lgdHierarchy';
import { convertLgdToLocationData } from '../services/locationHierarchyService';
import { resolveLocationFromLgdVillage } from '../services/geocodingService';
import { LocationHierarchySelector } from './LocationHierarchySelector';
import { LocalitySearchBar } from './LocalitySearchBar';
import { LocationSummaryCard } from './LocationSummaryCard';
import { InteractiveMap } from './InteractiveMap';
import { useLanguage } from '../i18n/LanguageContext';
import {
  startVoiceRecognition,
  stopVoiceRecognition,
  isSpeechRecognitionAvailable
} from '../services/speechRecognition';

interface BusinessInputFormProps {
  onSubmit: (input: UserBusinessInput) => void;
  isLoading: boolean;
  initialValues?: Partial<UserBusinessInput>;
}

export const BusinessInputForm: React.FC<BusinessInputFormProps> = ({
  onSubmit,
  isLoading,
  initialValues
}) => {
  const { t, language } = useLanguage();

  // Location Resolution State
  const defaultVillage = OFFICIAL_LGD_VILLAGES[0];
  const [selectedVillage, setSelectedVillage] = useState<LgdVillage>(defaultVillage);
  const [locationResolution, setLocationResolution] = useState<LocationResolution>(() =>
    resolveLocationFromLgdVillage(defaultVillage)
  );

  // Map & Spatial Catchment State
  const [analysisRadius, setAnalysisRadius] = useState<5 | 10>(5);
  const [observedPlaces, setObservedPlaces] = useState<NearbyPlace[]>([]);
  const [showCascadeSelector, setShowCascadeSelector] = useState<boolean>(false);

  // Business Category & Idea
  const [businessCategory, setBusinessCategory] = useState<'dairy' | 'tailoring' | 'retail' | 'poultry' | 'custom'>(
    initialValues?.businessCategoryId || 'dairy'
  );
  const [businessIdea, setBusinessIdea] = useState<string>(
    initialValues?.businessIdea ||
      'Commercial Micro Dairy Farming with 8-10 high-yield milch cows, hygienic shed and local chilling center connectivity.'
  );

  // Capital State
  const [availableCapital, setAvailableCapital] = useState<number>(initialValues?.availableCapital || 100000);
  const [rawCapitalString, setRawCapitalString] = useState<string>('100000');
  const [isEditingCapital, setIsEditingCapital] = useState<boolean>(false);

  // Optional Advanced Details Accordion
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [experienceYears, setExperienceYears] = useState<number>(initialValues?.experienceYears || 2);
  const [existingBusiness, setExistingBusiness] = useState<boolean>(initialValues?.existingBusiness || false);
  const [beneficiaryCategory, setBeneficiaryCategory] = useState<string>(initialValues?.beneficiaryCategory || 'General');

  // Speech Recognition State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);

  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionAvailable());
  }, []);

  const handleVoiceInputToggle = () => {
    if (!speechSupported) {
      alert('Voice dictation is supported in Chrome, Edge, and Safari.');
      return;
    }

    if (isListening) {
      stopVoiceRecognition();
      setIsListening(false);
    } else {
      setIsListening(true);
      startVoiceRecognition({
        language,
        onResult: (transcript) => {
          setBusinessIdea((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        onEnd: () => {
          setIsListening(false);
        },
        onError: (error) => {
          console.warn('Speech recognition warning:', error);
          setIsListening(false);
        }
      });
    }
  };

  // Capital quick presets
  const capitalPresets = [50000, 100000, 150000, 200000, 500000];

  const handlePresetCapital = (amount: number) => {
    setAvailableCapital(amount);
    setRawCapitalString(String(amount));
  };

  const handleRawCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setRawCapitalString(val);
    const num = Number(val) || 0;
    setAvailableCapital(num);
  };

  // Handle Demo Scenario shortcut updates
  const handleScenarioChange = (scenario: 'dairy' | 'tailoring' | 'retail') => {
    if (scenario === 'dairy') {
      setBusinessCategory('dairy');
      setBusinessIdea('Commercial Micro Dairy Farming with 8-10 high-yield milch cows, hygienic shed and local chilling center connectivity.');
      setAvailableCapital(100000);
      setRawCapitalString('100000');
    } else if (scenario === 'tailoring') {
      setBusinessCategory('tailoring');
      setBusinessIdea('Custom Garment & Boutique Tailoring Workshop with 4 industrial sewing machines and bridal embroidery.');
      setAvailableCapital(50000);
      setRawCapitalString('50000');
    } else if (scenario === 'retail') {
      setBusinessCategory('retail');
      setBusinessIdea('Rural Kirana & Essential Provisions Retail Store with packaged goods, dairy distribution and digital UPI billing.');
      setAvailableCapital(75000);
      setRawCapitalString('75000');
    }
  };

  // Handle Locality Resolution from Search Bar
  const handleLocationResolved = (resolution: LocationResolution) => {
    setLocationResolution(resolution);
    // Also find or approximate LGD village
    const matchedLgd = resolution.villageCode
      ? OFFICIAL_LGD_VILLAGES.find((v) => v.lgdCode === resolution.villageCode)
      : OFFICIAL_LGD_VILLAGES.find(
          (v) => v.name.toLowerCase() === resolution.localityName.toLowerCase()
        );
    if (matchedLgd) {
      setSelectedVillage(matchedLgd);
    }
  };

  // Handle Selection from Cascade Selector
  const handleSelectVillageFromCascade = (vil: LgdVillage) => {
    setSelectedVillage(vil);
    setLocationResolution(resolveLocationFromLgdVillage(vil));
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationResolution) {
      alert('Please select or search your target location.');
      return;
    }
    if (!businessIdea.trim()) {
      alert('Please describe your business plan or idea.');
      return;
    }
    if (availableCapital < 10000) {
      alert('Minimum own equity capital for feasibility assessment is ₹10,000.');
      return;
    }

    const locationData: LocationData = convertLgdToLocationData(selectedVillage);
    // Attach exact coordinates and map resolution
    locationData.latitude = locationResolution.latitude;
    locationData.longitude = locationResolution.longitude;
    locationData.administrativeSource = locationResolution.administrativeSource;
    locationData.mappingSource = locationResolution.mappingSource;
    locationData.observedNearbyPlaces = observedPlaces;

    const inputData: UserBusinessInput = {
      locationId: locationData.id,
      customLocationText: locationResolution.formattedAddress,
      businessCategoryId: businessCategory,
      businessIdea: businessIdea.trim(),
      availableCapital,
      experienceYears,
      existingBusiness,
      beneficiaryCategory,
      locationAreaType: locationResolution.areaType,
      language,
      latitude: locationResolution.latitude,
      longitude: locationResolution.longitude,
      locationResolution
    };

    onSubmit(inputData);
  };

  // Indicative Project Cost & Financing Math Preview
  const indicativeProjectCost = Math.round(availableCapital / 0.10);
  const indicativeFinancing = Math.round(indicativeProjectCost - availableCapital);
  const indicativeEMI = Math.round((indicativeFinancing * (9.5 / 1200) * Math.pow(1 + 9.5 / 1200, 60)) / (Math.pow(1 + 9.5 / 1200, 60) - 1));

  return (
    <form onSubmit={handleSubmit} className="select-none max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            LEFT COLUMN: BUSINESS INPUTS & LOCALITY SEARCH (~60% width)
            ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. LOCALITY SEARCH & CONFIRMED LOCATION */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black">
                  01
                </span>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                  Where is your business located?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCascadeSelector(!showCascadeSelector)}
                className="text-[11px] font-bold text-slate-500 hover:text-blue-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>{showCascadeSelector ? 'Use Search Bar' : 'Administrative LGD Explorer'}</span>
                {showCascadeSelector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Practical Locality Search Bar */}
            {!showCascadeSelector && (
              <div className="space-y-3">
                <LocalitySearchBar
                  onLocationResolved={handleLocationResolved}
                  currentResolution={locationResolution}
                />
                <LocationSummaryCard
                  location={locationResolution}
                  onEditLocation={() => {}}
                />
              </div>
            )}

            {/* Optional Administrative Cascade Selector */}
            {showCascadeSelector && (
              <div className="pt-2 space-y-3 border-t border-slate-100">
                <LocationHierarchySelector
                  selectedVillage={selectedVillage}
                  onSelectVillage={handleSelectVillageFromCascade}
                  onSelectDemoScenario={handleScenarioChange}
                />
              </div>
            )}
          </div>

          {/* 2. BUSINESS PLANNING */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black">
                  02
                </span>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                  What are you planning to build?
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-400 font-mono">Step 2 of 3</span>
            </div>

            {/* Business Category Selection Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Business Sector Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'dairy' as const, label: '🥛 Dairy Farming', sub: 'Livestock & Milk' },
                  { id: 'tailoring' as const, label: '🧵 Tailoring Unit', sub: 'Apparel & Boutique' },
                  { id: 'retail' as const, label: '🛍 Kirana Retail', sub: 'Provisions & FMCG' },
                  { id: 'poultry' as const, label: '🐣 Poultry & Agro', sub: 'Broiler / Processing' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setBusinessCategory(cat.id);
                      if (cat.id === 'dairy') handleScenarioChange('dairy');
                      else if (cat.id === 'tailoring') handleScenarioChange('tailoring');
                      else if (cat.id === 'retail') handleScenarioChange('retail');
                      else {
                        setBusinessIdea('Commercial poultry broiler rearing unit with automated feeder & biocontrol shed.');
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      businessCategory === cat.id
                        ? 'bg-blue-50/90 border-blue-700 shadow-2xs ring-1 ring-blue-700 text-slate-950'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-xs sm:text-sm font-bold">{cat.label}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{cat.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Business Description Textarea with Voice Dictation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Business Scope & Idea Description
                </label>
                {speechSupported && (
                  <button
                    type="button"
                    onClick={handleVoiceInputToggle}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse shadow-xs'
                        : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <textarea
                  rows={3}
                  value={businessIdea}
                  onChange={(e) => setBusinessIdea(e.target.value)}
                  placeholder="Describe your micro-enterprise plan, capacity, machinery, and market..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-700 focus:ring-3 focus:ring-blue-100 transition-all outline-hidden resize-none"
                />
              </div>
            </div>
          </div>

          {/* 3. OWN EQUITY CAPITAL */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black">
                  03
                </span>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                  Available Own Capital (Promoter Margin)
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                10% Contribution Rule
              </span>
            </div>

            {/* Quick Touch Capital Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {capitalPresets.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handlePresetCapital(amount)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    availableCapital === amount
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  ₹{(amount / 1000).toLocaleString('en-IN')}k
                </button>
              ))}
            </div>

            {/* Capital Input Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                ₹
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={isEditingCapital ? rawCapitalString : `₹${availableCapital.toLocaleString('en-IN')}`}
                onFocus={() => {
                  setIsEditingCapital(true);
                  setRawCapitalString(String(availableCapital));
                }}
                onBlur={() => setIsEditingCapital(false)}
                onChange={handleRawCapitalChange}
                className="w-full pl-8 pr-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-2xl text-base sm:text-lg font-mono font-black text-slate-950 transition-all outline-hidden"
              />
            </div>

            {/* Real-time Math Preview Bar */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50/60 border border-blue-200/80 rounded-2xl text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Project Cost</span>
                <span className="font-black text-slate-950">₹{indicativeProjectCost.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Bank Loan</span>
                <span className="font-black text-blue-900">₹{indicativeFinancing.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Est. EMI (60m)</span>
                <span className="font-black text-slate-950">₹{indicativeEMI.toLocaleString('en-IN')}/m</span>
              </div>
            </div>
          </div>

          {/* 4. OPTIONAL ADVANCED PARAMETERS ACCORDION */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-700" />
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  Optional Entrepreneur & Subsidy Profile
                </span>
              </div>
              <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                {showAdvanced ? 'Hide' : 'Add Details'}
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>

            {showAdvanced && (
              <div className="pt-4 mt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Beneficiary Category (For Subsidies)</label>
                  <select
                    value={beneficiaryCategory}
                    onChange={(e) => setBeneficiaryCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:border-blue-700"
                  >
                    <option value="General">General Category (25% Rural Subsidy)</option>
                    <option value="Women">Women Entrepreneur (35% Special Rural Subsidy)</option>
                    <option value="SC/ST">SC / ST Category (35% Special Rural Subsidy)</option>
                    <option value="OBC">OBC Category (35% Special Rural Subsidy)</option>
                    <option value="Minority">Minority Category (35% Special Rural Subsidy)</option>
                    <option value="Ex-Servicemen">Ex-Servicemen / PwD (35% Special Subsidy)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Relevant Domain Experience</label>
                  <select
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:border-blue-700"
                  >
                    <option value={0}>First-time Entrepreneur (0 Years)</option>
                    <option value={2}>1 - 2 Years Family / Practical Experience</option>
                    <option value={5}>3 - 5 Years Operating Experience</option>
                    <option value={10}>5+ Years Experienced Enterprise</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON (Desktop View) */}
          <div className="hidden lg:block pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-2xl text-sm sm:text-base font-black tracking-tight shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Multi-Agent Advisory...</span>
                </>
              ) : (
                <>
                  <span>ANALYZE ENTERPRISE FEASIBILITY & MAP INTELLIGENCE</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: INTERACTIVE MAP & SPATIAL CATCHMENT (~40% width)
            ========================================================================= */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-blue-900 font-mono tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-700" />
                  Locality & Catchment Map
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded">
                📍 {locationResolution.localityName}
              </span>
            </div>

            {/* Interactive Google Map with Radius & POI Overlay */}
            <InteractiveMap
              key={`${locationResolution.latitude}-${locationResolution.longitude}-${analysisRadius}`}
              location={locationResolution}
              businessCategory={businessCategory}
              radiusKm={analysisRadius}
              onRadiusChange={(r) => setAnalysisRadius(r)}
              onPlacesLoaded={(p) => setObservedPlaces(p)}
            />

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Spatial Catchment Proximity</span>
                <span className="font-mono text-blue-700">{analysisRadius} km Analysis Zone</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Map overlays observed infrastructure nodes (Banks, BMC Chilling Units, APMC Mandis, Transport) to evaluate supply chain feasibility.
              </p>
            </div>
          </div>

          {/* SUBMIT BUTTON (Mobile only) */}
          <div className="block lg:hidden pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-2xl text-sm sm:text-base font-black tracking-tight shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Multi-Agent Advisory...</span>
                </>
              ) : (
                <>
                  <span>ANALYZE ENTERPRISE FEASIBILITY</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
