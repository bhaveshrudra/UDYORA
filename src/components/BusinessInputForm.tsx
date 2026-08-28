import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin,
  Briefcase,
  Mic,
  MicOff,
  ArrowRight,
  Sparkles,
  Info,
  Compass,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { UserBusinessInput, LocationData } from '../types';
import { LgdVillage } from '../types/lgd';
import { LocationResolution } from '../types/map';
import { OFFICIAL_LGD_VILLAGES } from '../data/lgdHierarchy';
import {
  getLgdStates,
  getLgdDistrictsByState,
  getLgdSubDistrictsByDistrict,
  getLocalizedLocationName,
  convertLgdToLocationData
} from '../services/locationHierarchyService';
import {
  getStateCoordinates,
  getDistrictCoordinates,
  getSubDistrictCoordinates,
  validateAndResolvePincode,
  INDIA_MAP_DEFAULT
} from '../services/geocodingService';
import { InteractiveMap } from './InteractiveMap';
import { MapErrorBoundary } from './MapErrorBoundary';
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

  // Phase 1 Location State (Dependent Dropdowns)
  const statesList = getLgdStates();
  const [selectedStateCode, setSelectedStateCode] = useState<number | undefined>(undefined);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | undefined>(undefined);
  const [selectedSubDistrictCode, setSelectedSubDistrictCode] = useState<number | undefined>(undefined);
  const [pincode, setPincode] = useState<string>('');
  const [locationConfirmed, setLocationConfirmed] = useState<boolean>(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [locationResolution, setLocationResolution] = useState<LocationResolution | null>(null);

  // Map Catchment Radius State
  const [analysisRadius, setAnalysisRadius] = useState<5 | 10>(5);

  const handleRadiusChange = useCallback((r: 5 | 10) => {
    setAnalysisRadius(r);
  }, []);

  // Derived dropdown options
  const availableDistricts = selectedStateCode ? getLgdDistrictsByState(selectedStateCode) : [];
  const availableSubDistricts = selectedDistrictCode ? getLgdSubDistrictsByDistrict(selectedDistrictCode) : [];
  const currentStateObj = statesList.find((s) => s.lgdCode === selectedStateCode);
  const dynamicSubDistrictTerm = currentStateObj?.subDistrictTerm || 'Mandal / Block';

  // Derived Progressive Map State & Centroid
  const mapState: 'india' | 'state' | 'district' | 'mandal' | 'confirmed' = locationConfirmed
    ? 'confirmed'
    : selectedSubDistrictCode
    ? 'mandal'
    : selectedDistrictCode
    ? 'district'
    : selectedStateCode
    ? 'state'
    : 'india';

  const mapCenterCoords = locationConfirmed && locationResolution
    ? { lat: locationResolution.latitude, lng: locationResolution.longitude, zoom: 13 }
    : selectedSubDistrictCode
    ? getSubDistrictCoordinates(selectedSubDistrictCode, selectedDistrictCode, selectedStateCode)
    : selectedDistrictCode
    ? getDistrictCoordinates(selectedDistrictCode, selectedStateCode)
    : selectedStateCode
    ? getStateCoordinates(selectedStateCode)
    : INDIA_MAP_DEFAULT;

  const locationRequestIdRef = useRef<number>(0);

  // Dropdown Handlers
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    locationRequestIdRef.current += 1;
    const code = Number(e.target.value) || undefined;
    setSelectedStateCode(code);
    setSelectedDistrictCode(undefined);
    setSelectedSubDistrictCode(undefined);
    setPincode('');
    setLocationConfirmed(false);
    setPincodeError(null);
    setLocationResolution(null);
    if (validationError) setValidationError(null);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    locationRequestIdRef.current += 1;
    const code = Number(e.target.value) || undefined;
    setSelectedDistrictCode(code);
    setSelectedSubDistrictCode(undefined);
    setPincode('');
    setLocationConfirmed(false);
    setPincodeError(null);
    setLocationResolution(null);
    if (validationError) setValidationError(null);
  };

  const handleSubDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    locationRequestIdRef.current += 1;
    const code = Number(e.target.value) || undefined;
    setSelectedSubDistrictCode(code);
    setPincode('');
    setLocationConfirmed(false);
    setPincodeError(null);
    setLocationResolution(null);
    if (validationError) setValidationError(null);
  };

  const handlePincodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setPincode(val);

    if (val.length === 6) {
      locationRequestIdRef.current += 1;
      const currentReqId = locationRequestIdRef.current;

      const res = validateAndResolvePincode(val, selectedStateCode, selectedDistrictCode, selectedSubDistrictCode);
      if (res.isValid && res.coords) {
        setPincodeError(null);

        const stateObj = statesList.find((s) => s.lgdCode === selectedStateCode);
        const distObj = availableDistricts.find((d) => d.lgdCode === selectedDistrictCode);
        const subObj = availableSubDistricts.find((s) => s.lgdCode === selectedSubDistrictCode);

        const newResolution: LocationResolution = {
          id: `res_p1_${val}`,
          localityName: res.localityName || subObj?.name || 'Local Area',
          villageName: res.localityName || subObj?.name || 'Local Area',
          subDistrictName: subObj?.name || 'Mandal',
          districtName: distObj?.name || 'District',
          stateName: stateObj?.name || 'State',
          stateCode: selectedStateCode || 27,
          districtCode: selectedDistrictCode || 490,
          subDistrictCode: selectedSubDistrictCode || 270101,
          pincode: val,
          latitude: res.coords.lat,
          longitude: res.coords.lng,
          administrativeSource: 'Local Government Directory (LGD), MoPR',
          mappingSource: 'OpenStreetMap / Nominatim Spatial Engine',
          confidence: 0.96,
          formattedAddress: `${res.localityName || subObj?.name}, ${subObj?.name} ${dynamicSubDistrictTerm}, ${distObj?.name} District, ${stateObj?.name} - ${val}`,
          areaType: 'Rural'
        };

        if (currentReqId !== locationRequestIdRef.current) return;

        setLocationResolution(newResolution);
        setLocationConfirmed(true);

        if (import.meta.env?.DEV) {
          console.log(`[LOCATION] User selected: ${newResolution.localityName}`);
          console.log(`[LOCATION STATE] Canonical location updated: ${newResolution.localityName}`);
          console.log(`[MAP] Using location: ${newResolution.localityName}`);
        }

        if (validationError) setValidationError(null);
      } else {
        setLocationConfirmed(false);
        setLocationResolution(null);
        setPincodeError(res.errorMsg || t('loc.pincodeError'));
      }
    } else {
      setLocationConfirmed(false);
      setLocationResolution(null);
      setPincodeError(null);
    }
  };

  const handleUseDemoScenario = () => {
    setSelectedStateCode(27); // Maharashtra
    setSelectedDistrictCode(490); // Pune
    setSelectedSubDistrictCode(270101); // Haveli
    setPincode('412801');
    setPincodeError(null);
    setLocationConfirmed(true);

    const demoRes: LocationResolution = {
      id: 'res_demo_khed',
      localityName: 'Khed Shivapur',
      villageName: 'Khed Shivapur',
      subDistrictName: 'Haveli',
      districtName: 'Pune',
      stateName: 'Maharashtra',
      stateCode: 27,
      districtCode: 490,
      subDistrictCode: 270101,
      pincode: '412801',
      latitude: 18.3517,
      longitude: 73.8567,
      administrativeSource: 'Local Government Directory (LGD), MoPR',
      mappingSource: 'OpenStreetMap / Nominatim Spatial Engine',
      confidence: 0.98,
      formattedAddress: 'Khed Shivapur, Haveli Taluka, Pune District, Maharashtra - 412801',
      areaType: 'Rural'
    };
    setLocationResolution(demoRes);
    if (validationError) setValidationError(null);
  };

  const handleChangeLocation = () => {
    setLocationConfirmed(false);
    setPincodeError(null);
  };

  // Business Category & Idea State
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

  // Optional Advanced Profile State
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [experienceYears, setExperienceYears] = useState<number>(initialValues?.experienceYears || 2);
  const [existingBusiness, setExistingBusiness] = useState<boolean>(initialValues?.existingBusiness || false);
  const [beneficiaryCategory, setBeneficiaryCategory] = useState<string>(initialValues?.beneficiaryCategory || 'General');

  // Speech Recognition State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);

  // Form Validation Error State
  const [validationError, setValidationError] = useState<string | null>(null);

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
          if (validationError) setValidationError(null);
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

  const handlePresetCapital = (amount: number) => {
    setAvailableCapital(amount);
    setRawCapitalString(String(amount));
    if (validationError) setValidationError(null);
  };

  const handleRawCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setRawCapitalString(val);
    const num = Number(val) || 0;
    setAvailableCapital(num);
    if (validationError) setValidationError(null);
  };

  // Form Submission Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationConfirmed || !locationResolution) {
      setValidationError('Please select your State, District, Mandal/Block, and enter a valid 6-digit pincode.');
      return;
    }
    if (!businessIdea.trim()) {
      setValidationError('Please enter a description for your business plan or idea.');
      return;
    }
    if (availableCapital < 10000) {
      setValidationError('Minimum own equity capital for feasibility assessment is ₹10,000.');
      return;
    }

    setValidationError(null);

    const matchedVillage = OFFICIAL_LGD_VILLAGES[0];
    const locationData: LocationData = convertLgdToLocationData(matchedVillage);
    locationData.village = locationResolution.villageName || locationResolution.localityName;
    locationData.block = `${locationResolution.subDistrictName} (${dynamicSubDistrictTerm})`;
    locationData.district = locationResolution.districtName;
    locationData.state = locationResolution.stateName;
    locationData.pincode = locationResolution.pincode;
    locationData.latitude = locationResolution.latitude;
    locationData.longitude = locationResolution.longitude;

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

  const indicativeProjectCost = Math.round(availableCapital / 0.10);
  const indicativeFinancing = Math.round(indicativeProjectCost - availableCapital);
  const capitalPresets = [50000, 100000, 150000, 200000, 500000];

  return (
    <form onSubmit={handleSubmit} className="select-none max-w-7xl mx-auto space-y-4">
      {/* Inline Validation Banner */}
      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-semibold shadow-xs">
          <Info className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            LEFT COLUMN: MANUAL LOCATION INPUTS & BUSINESS FORM (~60% width)
            ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. LOCATION SELECTION SECTION */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black">
                  01
                </span>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                  Target Business Location
                </h2>
              </div>
              <button
                type="button"
                onClick={handleUseDemoScenario}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                {t('loc.useDemoBtn')}
              </button>
            </div>

            {/* UNCONFIRMED FORM: Dependent Dropdowns */}
            {!locationConfirmed ? (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* State Select */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {t('loc.stateLabel')}
                    </label>
                    <select
                      value={selectedStateCode || ''}
                      onChange={handleStateChange}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-hidden cursor-pointer"
                    >
                      <option value="">{t('loc.selectState')}</option>
                      {statesList.map((st) => (
                        <option key={st.lgdCode} value={st.lgdCode}>
                          {getLocalizedLocationName(st, language)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Select */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {t('loc.districtLabel')}
                    </label>
                    <select
                      disabled={!selectedStateCode}
                      value={selectedDistrictCode || ''}
                      onChange={handleDistrictChange}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <option value="">{t('loc.selectDistrict')}</option>
                      {availableDistricts.map((d) => (
                        <option key={d.lgdCode} value={d.lgdCode}>
                          {getLocalizedLocationName(d, language)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Mandal / Sub-District Select */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {dynamicSubDistrictTerm} *
                    </label>
                    <select
                      disabled={!selectedDistrictCode}
                      value={selectedSubDistrictCode || ''}
                      onChange={handleSubDistrictChange}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <option value="">{t('loc.selectMandal')}</option>
                      {availableSubDistricts.map((sd) => (
                        <option key={sd.lgdCode} value={sd.lgdCode}>
                          {getLocalizedLocationName(sd, language)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pincode Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {t('loc.pincodeLabel')}
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      disabled={!selectedSubDistrictCode}
                      value={pincode}
                      onChange={handlePincodeInputChange}
                      placeholder={t('loc.enterPincode')}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Inline Pincode Error Banner */}
                {pincodeError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                    <Info className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{pincodeError}</span>
                  </div>
                )}
              </div>
            ) : (
              /* LOCATION CONFIRMED CARD */
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase font-mono text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    {t('loc.confirmedTitle')}
                  </span>
                  <button
                    type="button"
                    onClick={handleChangeLocation}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                  >
                    {t('loc.changeLocationBtn')}
                  </button>
                </div>

                {locationResolution && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block">State:</span>
                      <span>
                        {getLocalizedLocationName(
                          statesList.find((s) => s.lgdCode === selectedStateCode),
                          language
                        ) || locationResolution.stateName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">District:</span>
                      <span>
                        {getLocalizedLocationName(
                          availableDistricts.find((d) => d.lgdCode === selectedDistrictCode),
                          language
                        ) || locationResolution.districtName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">{dynamicSubDistrictTerm}:</span>
                      <span>
                        {getLocalizedLocationName(
                          availableSubDistricts.find((sd) => sd.lgdCode === selectedSubDistrictCode),
                          language
                        ) || locationResolution.subDistrictName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Pincode:</span>
                      <span className="font-mono font-bold">{locationResolution.pincode}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-2">
                      <span className="text-[10px] text-slate-500 block">Geographic Coordinates:</span>
                      <span className="font-mono text-blue-800">
                        {locationResolution.latitude.toFixed(4)}° N, {locationResolution.longitude.toFixed(4)}° E
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. BUSINESS PLANNING SECTION */}
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
            </div>

            {/* Category Pills */}
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
                      if (cat.id === 'dairy') {
                        setBusinessIdea('Commercial Micro Dairy Farming with 8-10 high-yield milch cows, hygienic shed and local chilling center connectivity.');
                      } else if (cat.id === 'tailoring') {
                        setBusinessIdea('Custom Garment & Boutique Tailoring Workshop with 4 industrial sewing machines and bridal embroidery.');
                      } else if (cat.id === 'retail') {
                        setBusinessIdea('Rural Kirana & Essential Provisions Retail Store with packaged goods, dairy distribution and digital UPI billing.');
                      } else {
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

            {/* Business Description */}
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

              <textarea
                rows={3}
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                placeholder="Describe your micro-enterprise plan..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-700 focus:ring-3 focus:ring-blue-100 transition-all outline-hidden resize-none"
              />
            </div>
          </div>

          {/* 3. CAPITAL SECTION */}
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

            {/* Quick Presets */}
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

            {/* Input Field */}
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
          </div>

          {/* SUBMIT BUTTON (Desktop) */}
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
            RIGHT COLUMN: PROGRESSIVE MAP DISPLAY (~40% width)
            Mobile Ordering: Location fields -> Map -> Confirmation
            ========================================================================= */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <MapErrorBoundary>
            <InteractiveMap
              location={locationResolution}
              mapState={mapState}
              centerCoords={mapCenterCoords}
              radiusKm={analysisRadius}
              onRadiusChange={handleRadiusChange}
              businessCategory={businessCategory}
            />
          </MapErrorBoundary>

          {/* SUBMIT BUTTON (Mobile) */}
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
