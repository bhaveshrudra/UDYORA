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
  ChevronDown
} from 'lucide-react';
import { UserBusinessInput } from '../types';
import { DEMO_LOCATIONS } from '../data/locations';
import { useLanguage } from '../i18n/LanguageContext';

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const projectCostEstimate = (availableCapital * 10).toLocaleString('en-IN');
  const financingEstimate = (availableCapital * 9).toLocaleString('en-IN');

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Quick Demo Scenario Presets */}
      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('form.presets.title')}
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-500">{t('form.presets.subtitle')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Primary Demo: Dairy */}
          <button
            type="button"
            onClick={() =>
              applyPreset(
                'loc_khed_shivapur_pune',
                'dairy',
                'Commercial Micro Dairy Farming (8-10 Cows)',
                100000,
                'General'
              )
            }
            className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
              selectedLocationId === 'loc_khed_shivapur_pune' && businessCategory === 'dairy' && availableCapital === 100000
                ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                selectedLocationId === 'loc_khed_shivapur_pune' && businessCategory === 'dairy'
                  ? 'bg-blue-800 text-blue-100'
                  : 'bg-amber-100 text-amber-900 font-semibold'
              }`}>
                {t('form.presets.primaryBadge')}
              </span>
              <span className="text-xs font-bold">₹1,00,000</span>
            </div>
            <p className="font-bold text-sm mt-1.5 line-clamp-1">{t('form.presets.dairyTitle')}</p>
            <p className={`text-xs mt-0.5 ${
              selectedLocationId === 'loc_khed_shivapur_pune' && businessCategory === 'dairy'
                ? 'text-blue-200'
                : 'text-slate-500'
            }`}>
              Khed Shivapur, Pune (MH)
            </p>
          </button>

          {/* Secondary Demo 1: Tailoring */}
          <button
            type="button"
            onClick={() =>
              applyPreset(
                'loc_madhurawada_vizag',
                'tailoring',
                'Custom Garment & Boutique Tailoring Unit',
                50000,
                'Women'
              )
            }
            className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
              selectedLocationId === 'loc_madhurawada_vizag' && businessCategory === 'tailoring'
                ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                selectedLocationId === 'loc_madhurawada_vizag' && businessCategory === 'tailoring'
                  ? 'bg-blue-800 text-blue-100'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {t('form.presets.secondaryBadge')}
              </span>
              <span className="text-xs font-bold">₹50,000</span>
            </div>
            <p className="font-bold text-sm mt-1.5 line-clamp-1">{t('form.presets.tailoringTitle')}</p>
            <p className={`text-xs mt-0.5 ${
              selectedLocationId === 'loc_madhurawada_vizag' && businessCategory === 'tailoring'
                ? 'text-blue-200'
                : 'text-slate-500'
            }`}>
              Madhurawada, Vizag (AP)
            </p>
          </button>

          {/* Secondary Demo 2: Retail */}
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
            className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
              selectedLocationId === 'loc_mandya_karnataka' && businessCategory === 'retail'
                ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                selectedLocationId === 'loc_mandya_karnataka' && businessCategory === 'retail'
                  ? 'bg-blue-800 text-blue-100'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {t('form.presets.secondaryBadge')}
              </span>
              <span className="text-xs font-bold">₹75,000</span>
            </div>
            <p className="font-bold text-sm mt-1.5 line-clamp-1">{t('form.presets.retailTitle')}</p>
            <p className={`text-xs mt-0.5 ${
              selectedLocationId === 'loc_mandya_karnataka' && businessCategory === 'retail'
                ? 'text-blue-200'
                : 'text-slate-500'
            }`}>
              Gejjalagere, Mandya (KA)
            </p>
          </button>
        </div>
      </div>

      {/* Main Guided Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {t('form.title')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t('form.subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          {/* 1. Location Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-700" />
              {t('form.location.label')}
            </label>

            {!isCustomLocation ? (
              <div className="space-y-2">
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 cursor-pointer"
                >
                  {DEMO_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.village}, Block {loc.block}, District {loc.district}, {loc.state} (PIN: {loc.pincode}) [{loc.areaType}]
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('form.location.indexed')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustomLocation(true)}
                    className="text-blue-700 hover:underline cursor-pointer font-medium"
                  >
                    {t('form.location.customPrompt')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder={t('form.location.customPlaceholder')}
                  value={customLocationText}
                  onChange={(e) => setCustomLocationText(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="text-amber-700 font-medium">
                    {t('form.location.customNote')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustomLocation(false)}
                    className="text-blue-700 hover:underline cursor-pointer font-medium"
                  >
                    {t('form.location.useVerified')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Business Category & Idea */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-700" />
                {t('form.sector.label')}
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
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 cursor-pointer"
              >
                <option value="dairy">{t('cat.dairy')}</option>
                <option value="tailoring">{t('cat.tailoring')}</option>
                <option value="retail">{t('cat.retail')}</option>
                <option value="poultry">{t('cat.poultry')}</option>
                <option value="custom">{t('cat.custom')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                {t('form.title.label')}
              </label>
              <input
                type="text"
                value={businessIdeaText}
                onChange={(e) => setBusinessIdeaText(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* 3. Available Own Capital */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-blue-700" />
                {t('form.capital.label')}
              </label>
              <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                ₹{availableCapital.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
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
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            {/* Quick capital selector buttons */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[50000, 100000, 150000, 200000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAvailableCapital(amt)}
                  className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    availableCapital === amt
                      ? 'bg-blue-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ₹{(amt / 100000).toFixed(amt % 100000 === 0 ? 0 : 2)} Lakh{amt >= 200000 ? 's' : ''}
                </button>
              ))}
            </div>

            <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                {t('form.capital.formula', { projectCost: projectCostEstimate, financing: financingEstimate })}
              </span>
            </div>
          </div>

          {/* Advanced / Optional Fields Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-slate-600 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              <span>{showAdvanced ? t('form.optional.hide') : t('form.optional.show')}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('form.beneficiary.label')}
                  </label>
                  <select
                    value={beneficiaryCategory}
                    onChange={(e) => setBeneficiaryCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-800"
                  >
                    <option value="General">{t('form.beneficiary.general')}</option>
                    <option value="Women">{t('form.beneficiary.women')}</option>
                    <option value="SC/ST">{t('form.beneficiary.scst')}</option>
                    <option value="OBC">{t('form.beneficiary.obc')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('form.experience.label')}
                  </label>
                  <select
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-800"
                  >
                    <option value={0}>{t('form.experience.0')}</option>
                    <option value={2}>{t('form.experience.2')}</option>
                    <option value={5}>{t('form.experience.5')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('form.area.label')}
                  </label>
                  <select
                    value={locationAreaType}
                    onChange={(e) => setLocationAreaType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-800"
                  >
                    <option value="Rural">{t('form.area.rural')}</option>
                    <option value="Semi-Urban">{t('form.area.semiurban')}</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-blue-900 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('form.submittingBtn')}</span>
                </>
              ) : (
                <>
                  <span>{t('form.submitBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
