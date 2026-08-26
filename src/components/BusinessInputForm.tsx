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
  Info,
  HelpCircle,
  Clock,
  Award
} from 'lucide-react';
import { UserBusinessInput, LocationData } from '../types';
import { LgdVillage } from '../types/lgd';
import { OFFICIAL_LGD_VILLAGES } from '../data/lgdHierarchy';
import { convertLgdToLocationData } from '../services/locationHierarchyService';
import { LocationHierarchySelector } from './LocationHierarchySelector';
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

  // Location Selection State (LGD-based)
  const [selectedVillage, setSelectedVillage] = useState<LgdVillage>(OFFICIAL_LGD_VILLAGES[0]);

  // Business Category & Idea
  const [businessCategory, setBusinessCategory] = useState<'dairy' | 'tailoring' | 'retail' | 'poultry' | 'custom'>(
    initialValues?.businessCategoryId || 'dairy'
  );
  const [businessIdea, setBusinessIdea] = useState<string>(
    initialValues?.businessIdea || 'Commercial Micro Dairy Farming with 8-10 high-yield milch cows, hygienic shed and local chilling center connectivity.'
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

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVillage) {
      alert('Please confirm your target location.');
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

    const inputData: UserBusinessInput = {
      locationId: locationData.id,
      customLocationText: `${selectedVillage.name}, ${selectedVillage.subDistrictName} ${selectedVillage.administrativeTerm}, ${selectedVillage.districtName}, ${selectedVillage.stateName}`,
      businessCategoryId: businessCategory,
      businessIdea: businessIdea.trim(),
      availableCapital,
      experienceYears,
      existingBusiness,
      beneficiaryCategory,
      locationAreaType: selectedVillage.areaType,
      language
    };

    onSubmit(inputData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 select-none max-w-4xl mx-auto">
      {/* SECTION 1: LOCATION HIERARCHY (HERO OF WORKFLOW) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black">
            01
          </span>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
            Where is your business located?
          </h2>
        </div>

        <LocationHierarchySelector
          selectedVillage={selectedVillage}
          onSelectVillage={(vil) => setSelectedVillage(vil)}
          onSelectDemoScenario={handleScenarioChange}
        />
      </div>

      {/* SECTION 2: BUSINESS PLANNING */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black">
              02
            </span>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
              What are you planning to build?
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-400">Step 2 of 3</span>
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
                    ? 'bg-blue-50/90 border-blue-700 shadow-xs ring-1 ring-blue-700 text-slate-950'
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
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                    : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isListening ? 'Listening (Speak now)...' : 'Voice Dictate (🎙 Speak)'}</span>
              </button>
            )}
          </div>

          <textarea
            rows={3}
            required
            value={businessIdea}
            onChange={(e) => setBusinessIdea(e.target.value)}
            placeholder="Describe your planned business scale, machinery, expected customer base, or target daily output..."
            className="w-full bg-slate-50 border border-slate-300 hover:border-blue-300 focus:border-blue-700 rounded-2xl p-4 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-3 focus:ring-blue-100 shadow-2xs leading-relaxed"
          />
        </div>
      </div>

      {/* SECTION 3: CAPITAL & FINANCES */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black">
              03
            </span>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
              How much own capital can you contribute?
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-400">Step 3 of 3</span>
        </div>

        {/* Currency Display & Interactive Number Input */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
              Available Own Promoter Equity
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                {isEditingCapital ? (
                  <div className="flex items-center">
                    <span>₹</span>
                    <input
                      type="text"
                      autoFocus
                      value={rawCapitalString}
                      onChange={handleRawCapitalChange}
                      onBlur={() => setIsEditingCapital(false)}
                      className="w-48 bg-white border border-blue-600 rounded-xl px-2.5 py-1 text-2xl font-mono font-bold text-slate-950 focus:outline-hidden"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingCapital(true)}
                    className="hover:text-blue-800 transition-colors cursor-pointer text-left"
                    title="Click to edit exact number"
                  >
                    ₹ {availableCapital.toLocaleString('en-IN')}
                  </button>
                )}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports project sizing up to <strong className="text-slate-900 font-mono">₹{(availableCapital * 10).toLocaleString('en-IN')}</strong> under 10% rural promoter margin norms.
            </p>
          </div>

          {/* Quick Capital Preset Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {capitalPresets.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handlePresetCapital(amt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  availableCapital === amt
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                ₹{amt >= 100000 ? `${amt / 100000} Lakh` : `${amt / 1000}k`}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Advanced Demographics Accordion */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
            <span>+ Add Beneficiary & Experience Details (Optional)</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-fadeIn">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Beneficiary Category</label>
                <select
                  value={beneficiaryCategory}
                  onChange={(e) => setBeneficiaryCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 cursor-pointer"
                >
                  <option value="General">General Category</option>
                  <option value="SC/ST">SC / ST (Special Subsidy 35%)</option>
                  <option value="Women">Women Entrepreneur (35% Subsidy)</option>
                  <option value="OBC">OBC</option>
                  <option value="Ex-Servicemen">Ex-Servicemen / PwD</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prior Industry Experience</label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 cursor-pointer"
                >
                  <option value={0}>0 Years (First-Time Entrepreneur)</option>
                  <option value={2}>1 - 2 Years Experience</option>
                  <option value={5}>3 - 5+ Years Experience</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Enterprise Status</label>
                <select
                  value={existingBusiness ? 'existing' : 'new'}
                  onChange={(e) => setExistingBusiness(e.target.value === 'existing')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 cursor-pointer"
                >
                  <option value="new">New Greenfield Enterprise</option>
                  <option value="existing">Existing Business Expansion</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: PRE-ANALYSIS SUMMARY STRIP & SUBMIT CTA */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ready for Multi-Agent Synthesis</span>
            </span>
            <h3 className="text-lg font-black tracking-tight text-white">
              Advisory Assessment Summary
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase">Location</span>
              <span className="font-bold text-slate-100">{selectedVillage.name}, {selectedVillage.districtName}</span>
            </div>
            <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase">Own Equity</span>
              <span className="font-bold text-emerald-400 font-mono">₹{availableCapital.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 space-y-0.5">
            <p>Runs 7 specialized agents: Evidence, Sizing, Market, Finance, Schemes, Risk & Validation.</p>
            <p className="text-[11px] text-slate-500 font-mono">Deterministic math • Zero hallucinated eligibility rules</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl text-sm font-bold text-white bg-blue-700 overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 cursor-pointer shrink-0"
          >
            <span
              className="absolute inset-0 w-full h-full bg-blue-900 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
              aria-hidden="true"
            />
            <span className="relative z-10 text-white">
              {isLoading ? 'EXECUTING ADVISORY WORKFLOW...' : 'ANALYZE BUSINESS →'}
            </span>
            <ArrowRight className="relative z-10 w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </form>
  );
};
