import React, { useState } from 'react';
import {
  MapPin,
  IndianRupee,
  Briefcase,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  Store,
  Scissors,
  Milk,
  Egg
} from 'lucide-react';
import { UserBusinessInput } from '../types';
import { DEMO_LOCATIONS } from '../data/locations';
import { useLanguage } from '../i18n/LanguageContext';
import { startVoiceRecognition, stopVoiceRecognition, isSpeechRecognitionAvailable } from '../services/speechRecognition';

interface BusinessInputFormProps {
  onSubmit: (input: UserBusinessInput) => void;
  isLoading: boolean;
}

export const BusinessInputForm: React.FC<BusinessInputFormProps> = ({
  onSubmit,
  isLoading
}) => {
  const { t, language } = useLanguage();

  const [selectedLocationId, setSelectedLocationId] = useState<string>(DEMO_LOCATIONS[0].id);
  const [isCustomLocation, setIsCustomLocation] = useState<boolean>(false);
  const [customLocationText, setCustomLocationText] = useState<string>('');
  const [businessCategory, setBusinessCategory] = useState<'dairy' | 'tailoring' | 'retail' | 'poultry' | 'custom'>('dairy');
  const [businessIdeaText, setBusinessIdeaText] = useState<string>('Commercial Micro Dairy Farming & Milk Supply Unit');
  const [availableCapital, setAvailableCapital] = useState<number>(100000);
  const [beneficiaryCategory, setBeneficiaryCategory] = useState<'General' | 'SC/ST' | 'OBC' | 'Women'>('General');
  const [experienceYears, setExperienceYears] = useState<number>(2);
  const [locationAreaType, setLocationAreaType] = useState<'Rural' | 'Semi-Urban'>('Rural');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);

  // Form Inline Validation errors
  const [errors, setErrors] = useState<{ location?: string; business?: string; capital?: string }>({});

  // Quick preset loader
  const applyPreset = (
    locId: string,
    cat: 'dairy' | 'tailoring' | 'retail' | 'poultry',
    idea: string,
    capital: number,
    beneficiary: 'General' | 'SC/ST' | 'OBC' | 'Women' = 'General'
  ) => {
    setIsCustomLocation(false);
    setSelectedLocationId(locId);
    setBusinessCategory(cat);
    setBusinessIdeaText(idea);
    setAvailableCapital(capital);
    setBeneficiaryCategory(beneficiary);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const errs: { location?: string; business?: string; capital?: string } = {};

    if (isCustomLocation && !customLocationText.trim()) {
      errs.location = 'Please enter your village and district location.';
    }
    if (!businessIdeaText.trim()) {
      errs.business = 'Please describe your business proposal.';
    }
    if (!availableCapital || availableCapital <= 0) {
      errs.capital = 'Enter a valid own capital amount greater than ₹0.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isLoading) return;

    const input: UserBusinessInput = {
      locationId: selectedLocationId,
      customLocationText: isCustomLocation ? customLocationText : undefined,
      businessCategoryId: businessCategory,
      businessIdea: businessIdeaText,
      availableCapital: Number(availableCapital) || 100000,
      beneficiaryCategory,
      experienceYears,
      locationAreaType,
      language
    };
    onSubmit(input);
  };

  // Voice recording for Business Description field
  const toggleVoiceInput = () => {
    if (isListeningVoice) {
      stopVoiceRecognition();
      setIsListeningVoice(false);
      return;
    }

    if (!isSpeechRecognitionAvailable()) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    startVoiceRecognition({
      language,
      onStart: () => setIsListeningVoice(true),
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          setBusinessIdeaText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListeningVoice(false);
        }
      },
      onError: () => setIsListeningVoice(false),
      onEnd: () => setIsListeningVoice(false)
    });
  };

  const selectedLocationObj = DEMO_LOCATIONS.find((l) => l.id === selectedLocationId) || DEMO_LOCATIONS[0];
  const activeLocationLabel = isCustomLocation ? (customLocationText || 'Custom Village') : `${selectedLocationObj.village}, ${selectedLocationObj.district}`;
  const indicativeProjectCost = (availableCapital * 10).toLocaleString('en-IN');

  const capitalPresets = [50000, 100000, 150000, 200000, 500000];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* =========================================================================
          1. DEMO SCENARIO PRESETS (IMPROVED HIERARCHY)
          ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Demo Scenarios (1-Click Benchmarks)
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            Select a verified template or configure your own below
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Scenario 1: Dairy Farming */}
          <button
            type="button"
            onClick={() =>
              applyPreset(
                'loc_khed_shivapur_pune',
                'dairy',
                'Commercial Micro Dairy Farming & Milk Supply Unit (8-10 Cows)',
                100000,
                'General'
              )
            }
            className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
              selectedLocationId === 'loc_khed_shivapur_pune' && businessCategory === 'dairy' && availableCapital === 100000 && !isCustomLocation
                ? 'bg-blue-50/80 text-slate-950 border-blue-600 shadow-xs ring-1 ring-blue-600'
                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-slate-50/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100/80 text-blue-900 border border-blue-200 flex items-center gap-1">
                  <Milk className="w-3 h-3 text-blue-700" />
                  <span>Dairy Unit</span>
                </span>
                <span className="font-mono font-bold text-xs text-slate-900">₹1,00,000</span>
              </div>
              <p className="font-bold text-xs text-slate-900 line-clamp-1">Commercial Micro Dairy Farming</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Khed Shivapur, Pune (MH)</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-blue-800 mt-2">
              <span>SIH 10% Margin Example</span>
              {selectedLocationId === 'loc_khed_shivapur_pune' && businessCategory === 'dairy' && !isCustomLocation && (
                <span className="text-emerald-700 font-bold">✓ Selected</span>
              )}
            </div>
          </button>

          {/* Scenario 2: Tailoring Workshop */}
          <button
            type="button"
            onClick={() =>
              applyPreset(
                'loc_madhurawada_vizag',
                'tailoring',
                'Custom Garment & Boutique Tailoring Workshop',
                50000,
                'Women'
              )
            }
            className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
              selectedLocationId === 'loc_madhurawada_vizag' && businessCategory === 'tailoring' && availableCapital === 50000 && !isCustomLocation
                ? 'bg-blue-50/80 text-slate-950 border-blue-600 shadow-xs ring-1 ring-blue-600'
                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-slate-50/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100/80 text-purple-900 border border-purple-200 flex items-center gap-1">
                  <Scissors className="w-3 h-3 text-purple-700" />
                  <span>Tailoring</span>
                </span>
                <span className="font-mono font-bold text-xs text-slate-900">₹50,000</span>
              </div>
              <p className="font-bold text-xs text-slate-900 line-clamp-1">Custom Garment Workshop</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Madhurawada, Vizag (AP)</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-purple-800 mt-2">
              <span>Women Enterprise Scheme</span>
              {selectedLocationId === 'loc_madhurawada_vizag' && businessCategory === 'tailoring' && !isCustomLocation && (
                <span className="text-emerald-700 font-bold">✓ Selected</span>
              )}
            </div>
          </button>

          {/* Scenario 3: Daily Essentials Store */}
          <button
            type="button"
            onClick={() =>
              applyPreset(
                'loc_mandya_karnataka',
                'retail',
                'Rural Kirana & Essential Goods Retail Store',
                75000,
                'General'
              )
            }
            className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
              selectedLocationId === 'loc_mandya_karnataka' && businessCategory === 'retail' && availableCapital === 75000 && !isCustomLocation
                ? 'bg-blue-50/80 text-slate-950 border-blue-600 shadow-xs ring-1 ring-blue-600'
                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-slate-50/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100/80 text-amber-900 border border-amber-200 flex items-center gap-1">
                  <Store className="w-3 h-3 text-amber-700" />
                  <span>Retail Store</span>
                </span>
                <span className="font-mono font-bold text-xs text-slate-900">₹75,000</span>
              </div>
              <p className="font-bold text-xs text-slate-900 line-clamp-1">Rural Kirana & Goods Store</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Gejjalagere, Mandya (KA)</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-amber-800 mt-2">
              <span>MUDRA Shishu / Kishore</span>
              {selectedLocationId === 'loc_mandya_karnataka' && businessCategory === 'retail' && !isCustomLocation && (
                <span className="text-emerald-700 font-bold">✓ Selected</span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. GUIDED INTELLIGENT WORKSPACE FORM (3 NUMBERED STEPS)
          ========================================================================= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8"
      >
        {/* STEP 01: LOCATION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-black text-xs flex items-center justify-center">
                01
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Where is your business located?
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select your village or rural catchment to evaluate local demographics and off-take nodes.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline">
              01 Location ✓
            </span>
          </div>

          {!isCustomLocation ? (
            <div className="space-y-2 pt-1">
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer shadow-2xs"
                >
                  {DEMO_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.village}, Block {loc.block}, District {loc.district}, {loc.state} (PIN: {loc.pincode}) [{loc.areaType}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Source-backed demographic data available (Census & APMC records)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomLocation(true)}
                  className="text-blue-700 hover:text-blue-900 font-semibold cursor-pointer text-xs"
                >
                  + Enter custom village...
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <input
                type="text"
                placeholder="e.g., Gejjalagere, Maddur Taluk, Mandya, Karnataka"
                value={customLocationText}
                onChange={(e) => setCustomLocationText(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-amber-700 text-[11px] font-medium">
                  ⚠️ Custom location will use state-level statistical benchmarks.
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomLocation(false)}
                  className="text-blue-700 hover:text-blue-900 font-semibold cursor-pointer text-xs"
                >
                  ← Use verified location list
                </button>
              </div>
            </div>
          )}
          {errors.location && <p className="text-xs text-rose-600 font-medium">{errors.location}</p>}
        </div>

        {/* STEP 02: BUSINESS SECTOR & PROPOSAL */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-black text-xs flex items-center justify-center">
                02
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  What are you planning to build?
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select your enterprise sector and briefly describe your proposal or planned expansion.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline">
              02 Business ✓
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-1">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Business Category
              </label>
              <select
                value={businessCategory}
                onChange={(e) => {
                  const cat = e.target.value as any;
                  setBusinessCategory(cat);
                  if (cat === 'dairy') setBusinessIdeaText('Commercial Micro Dairy Farming & Milk Supply Unit');
                  else if (cat === 'tailoring') setBusinessIdeaText('Apparel & Custom Garment Tailoring Workshop');
                  else if (cat === 'retail') setBusinessIdeaText('Rural Kirana & Essential Goods Retail Store');
                  else if (cat === 'poultry') setBusinessIdeaText('Environment-Controlled Micro Poultry Broiler Farm');
                  else setBusinessIdeaText('Custom Micro-Enterprise');
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="dairy">Dairy Farming & Milk Supply</option>
                <option value="tailoring">Apparel & Custom Tailoring</option>
                <option value="retail">Rural Kirana & Retail Goods</option>
                <option value="poultry">Micro Poultry Broiler Unit</option>
                <option value="custom">Custom Micro-Enterprise</option>
              </select>
            </div>

            <div className="sm:col-span-8">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Business Description / Scope
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Describe what you plan to build or expand</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={businessIdeaText}
                  onChange={(e) => setBusinessIdeaText(e.target.value)}
                  placeholder="e.g. Commercial Micro Dairy Farming (8-10 Cows)"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  title="Speak to dictate business idea"
                  className={`absolute right-2 top-2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isListeningVoice ? 'bg-rose-600 text-white animate-pulse' : 'text-slate-400 hover:text-blue-700 hover:bg-slate-100'
                  }`}
                >
                  {isListeningVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          {errors.business && <p className="text-xs text-rose-600 font-medium">{errors.business}</p>}
        </div>

        {/* STEP 03: AVAILABLE OWN CAPITAL (IMPROVED FINANCIAL UX) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-black text-xs flex items-center justify-center">
                03
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  How much capital do you have?
                </h3>
                <p className="text-[11px] text-slate-500">
                  How much of your own promoter equity capital can you contribute?
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline">
              03 Capital ✓
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Prominent Currency Input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                  ₹
                </div>
                <input
                  type="number"
                  min="10000"
                  max="5000000"
                  step="5000"
                  value={availableCapital}
                  onChange={(e) => setAvailableCapital(Number(e.target.value))}
                  required
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-lg font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              {/* Formatted Display Badge */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-center sm:text-right shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                  Promoter Own Capital
                </span>
                <span className="text-base font-black text-blue-950 font-mono">
                  ₹{availableCapital.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Quick Capital Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Presets:
              </span>
              {capitalPresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAvailableCapital(val)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    availableCapital === val
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  ₹{val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            {/* Deterministic Scale Explanation Note */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Under standard institutional 10% margin logic, this equity may support an indicative project size of{' '}
                <strong className="text-slate-900 font-bold">₹{indicativeProjectCost}</strong> with bank loan financing of{' '}
                <strong className="text-blue-900 font-bold">₹{(availableCapital * 9).toLocaleString('en-IN')}</strong>.
              </p>
            </div>
          </div>
          {errors.capital && <p className="text-xs text-rose-600 font-medium">{errors.capital}</p>}
        </div>

        {/* =========================================================================
            3. EXPANDABLE OPTIONAL DETAILS (ACCORDION)
            ========================================================================= */}
        <div className="border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer py-1"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showAdvanced ? 'Hide additional parameters' : '+ Add more details (Beneficiary, Experience, Area)'}</span>
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Beneficiary Category
                </label>
                <select
                  value={beneficiaryCategory}
                  onChange={(e) => setBeneficiaryCategory(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800"
                >
                  <option value="General">General Category</option>
                  <option value="Women">Women Entrepreneur (Special Subsidy)</option>
                  <option value="SC/ST">SC / ST Category</option>
                  <option value="OBC">OBC Category</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Relevant Experience
                </label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800"
                >
                  <option value={0}>First-time entrepreneur (0 yrs)</option>
                  <option value={2}>Moderate experience (1-3 yrs)</option>
                  <option value={5}>Extensive experience (4+ yrs)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Location Area Type
                </label>
                <select
                  value={locationAreaType}
                  onChange={(e) => setLocationAreaType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800"
                >
                  <option value="Rural">Rural (PMEGP 35% Subsidy)</option>
                  <option value="Semi-Urban">Semi-Urban / Peri-Urban</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            4. PRE-ANALYSIS SUMMARY STRIP & FULL-WIDTH ANALYZE CTA
            ========================================================================= */}
        <div className="space-y-4 pt-2 border-t border-slate-200">
          {/* Pre-Analysis Confirmation Strip */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-extrabold uppercase tracking-wider text-slate-500 text-[10px]">
              Ready to Analyze
            </span>
            <div className="flex flex-wrap items-center gap-3 text-slate-800 font-bold">
              <span>📍 {activeLocationLabel}</span>
              <span className="text-slate-300">•</span>
              <span>🏢 {businessCategory.toUpperCase()}</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700">₹{availableCapital.toLocaleString('en-IN')} Equity</span>
            </div>
          </div>

          {/* Full-Width Interactive Analyze Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white bg-slate-900 overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {/* Muted Blue Fill Sweep Overlay */}
            <span
              className="absolute inset-0 w-full h-full bg-blue-800 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
              aria-hidden="true"
            />

            <span className="relative z-10 text-white">
              {isLoading ? 'ANALYZING BUSINESS (RUNNING 7 AGENTS)...' : 'ANALYZE BUSINESS'}
            </span>

            {!isLoading && (
              <ArrowRight className="relative z-10 w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform duration-300" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
