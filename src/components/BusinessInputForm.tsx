import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin,
  Briefcase,
  Mic,
  MicOff,
  Sparkles,
  Info,
  Compass,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Building2,
  Users,
  Activity,
  Award,
  ShieldAlert,
  FileText,
  ChevronRight,
  TrendingUp,
  Navigation,
  Loader2,
  AlertTriangle,
  Edit3
} from 'lucide-react';
import { UserBusinessInput, LocationData } from '../types';
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
  reverseGeocodeCoordinates,
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

export type LocationSelectionMode = 'select' | 'detecting' | 'detected' | 'manual';

export const BusinessInputForm: React.FC<BusinessInputFormProps> = ({
  onSubmit,
  isLoading,
  initialValues
}) => {
  const { t, language } = useLanguage();

  // Location Selection & Live GPS State
  const [locationMode, setLocationMode] = useState<LocationSelectionMode>(
    initialValues?.locationResolution ? 'detected' : 'select'
  );
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(initialValues?.locationResolution?.accuracy || null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Phase 1 Location State (Dependent Dropdowns)
  const statesList = getLgdStates();
  const [selectedStateCode, setSelectedStateCode] = useState<number | undefined>(initialValues?.locationResolution?.stateCode || undefined);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | undefined>(initialValues?.locationResolution?.districtCode || undefined);
  const [selectedSubDistrictCode, setSelectedSubDistrictCode] = useState<number | undefined>(initialValues?.locationResolution?.subDistrictCode || undefined);
  const [pincode, setPincode] = useState<string>(initialValues?.locationResolution?.pincode || '');
  const [locationConfirmed, setLocationConfirmed] = useState<boolean>(!!initialValues?.locationResolution);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [locationResolution, setLocationResolution] = useState<LocationResolution | null>(initialValues?.locationResolution || null);

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

  // Live GPS Location Detection Handler (Triggered ONLY on explicit user click)
  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Browser geolocation is not supported in this environment.');
      setLocationMode('manual');
      return;
    }

    locationRequestIdRef.current += 1;
    const currentReqId = locationRequestIdRef.current;

    setLocationMode('detecting');
    setGpsError(null);
    setPincodeError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (currentReqId !== locationRequestIdRef.current) return;

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 35);

        try {
          const resolved = reverseGeocodeCoordinates(lat, lng, accuracy);
          setLocationResolution(resolved);
          setSelectedStateCode(resolved.stateCode);
          setSelectedDistrictCode(resolved.districtCode);
          setSelectedSubDistrictCode(resolved.subDistrictCode);
          setPincode(resolved.pincode);
          setGpsAccuracy(accuracy);
          setLocationMode('detected');
          setLocationConfirmed(true);

          if (import.meta.env?.DEV) {
            console.log(`[LIVE GPS] Location detected: ${resolved.localityName} (±${accuracy}m)`);
          }

          if (validationError) setValidationError(null);
        } catch (err: any) {
          console.warn('[LIVE GPS Error]', err);
          setGpsError('Unable to reverse geocode live coordinates.');
          setLocationMode('manual');
        }
      },
      (error) => {
        if (currentReqId !== locationRequestIdRef.current) return;

        let errMsg = 'Location permission was not granted or signal timed out.';
        if (error.code === error.PERMISSION_DENIED) {
          errMsg = 'Location permission was not granted. Please enter your location manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errMsg = 'GPS position unavailable. Please enter your location manually.';
        } else if (error.code === error.TIMEOUT) {
          errMsg = 'Location detection timed out. Please enter your location manually.';
        }

        setGpsError(errMsg);
        setLocationMode('manual');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleConfirmDetectedLocation = () => {
    setLocationConfirmed(true);
    if (validationError) setValidationError(null);
  };

  const handleChooseManualLocation = () => {
    setLocationMode('manual');
    setLocationConfirmed(false);
    setGpsError(null);
  };

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
          areaType: 'Rural',
          source: 'MANUAL_SELECTION'
        };

        if (currentReqId !== locationRequestIdRef.current) return;

        setLocationResolution(newResolution);
        setLocationConfirmed(true);

        if (import.meta.env?.DEV) {
          console.log(`[LOCATION] User selected: ${newResolution.localityName}`);
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
      areaType: 'Rural',
      source: 'DEMO'
    };
    setLocationResolution(demoRes);
    setLocationMode('detected');
    if (validationError) setValidationError(null);
  };

  // Business Category & Description State
  const [businessCategory, setBusinessCategory] = useState<'dairy' | 'tailoring' | 'retail' | 'poultry' | 'custom'>(
    initialValues?.businessCategoryId || 'dairy'
  );
  const [businessIdea, setBusinessIdea] = useState<string>(
    initialValues?.businessIdea ||
      'Commercial Micro Dairy Farming with 8-10 high-yield milch cows, hygienic shed and local chilling center connectivity.'
  );

  // Capital State
  const [availableCapital, setAvailableCapital] = useState<number>(initialValues?.availableCapital || 100000);
  const [rawCapitalString, setRawCapitalString] = useState<string>(String(initialValues?.availableCapital || 100000));

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
      const initialText = businessIdea.trim();
      let lastCommittedFinal = '';

      startVoiceRecognition({
        language,
        onResult: (transcript, isFinal) => {
          if (isFinal) {
            const cleanText = transcript.trim();
            if (cleanText && cleanText !== lastCommittedFinal) {
              lastCommittedFinal = cleanText;
              setBusinessIdea(initialText ? `${initialText} ${cleanText}` : cleanText);
            }
          }
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
      setValidationError('Please confirm your location or select your State, District, Mandal/Block, and enter a valid pincode.');
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
      experienceYears: 2,
      existingBusiness: false,
      beneficiaryCategory: 'General',
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
  const indicativeEMI = Math.round((indicativeFinancing * (1 + 0.105 * 5)) / 60);

  const businessCategories = [
    {
      id: 'dairy' as const,
      title: 'Dairy Farming',
      subtext: 'Livestock & Milk',
      icon: '🐄'
    },
    {
      id: 'tailoring' as const,
      title: 'Tailoring Unit',
      subtext: 'Apparel & Boutique',
      icon: '🧵'
    },
    {
      id: 'retail' as const,
      title: 'Kirana Retail',
      subtext: 'Provisions & FMCG',
      icon: '🛍️'
    },
    {
      id: 'poultry' as const,
      title: 'Poultry & Agro',
      subtext: 'Broiler / Processing',
      icon: '🐔'
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="select-none max-w-7xl mx-auto space-y-6">
      {/* 1. ASSESSMENT HERO */}
      <div className="text-center max-w-3xl mx-auto pt-2 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50/90 text-blue-900 border border-blue-200 mb-2.5 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>Evidence-Aware Multi-Agent Business Advisory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-950">
          Enterprise Feasibility & Advisory Assessment
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1.5 max-w-xl mx-auto leading-relaxed">
          Tell us about your location, business idea, and available capital to begin your assessment.
        </p>
      </div>

      {/* Inline Validation Banner */}
      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs sm:text-sm font-semibold shadow-2xs animate-in fade-in">
          <Info className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 2. TWO-COLUMN MAIN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (~52% width on desktop) */}
        <div className="lg:col-span-6 space-y-5">
          {/* CARD 01: Target Business Location (Live GPS + Manual Selection) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                  01
                </span>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                  Where is your business located?
                </h2>
              </div>
              <button
                type="button"
                onClick={handleUseDemoScenario}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                {t('loc.useDemoBtn')}
              </button>
            </div>

            {/* GPS ERROR ALERT NOTICE */}
            {gpsError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-900 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* STEP 1: INITIAL LOCATION SELECTION MODE */}
            {locationMode === 'select' && (
              <div className="space-y-3.5 pt-1 text-center">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Use My Current Location</span>
                </button>
                <p className="text-[11px] font-semibold text-slate-500">
                  Allow location access to automatically identify your area.
                </p>
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400"><span className="bg-white px-2">or</span></div>
                </div>
                <button
                  type="button"
                  onClick={handleChooseManualLocation}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Enter Location Manually
                </button>
              </div>
            )}

            {/* STEP 2: GPS DETECTING LOADING STATE */}
            {locationMode === 'detecting' && (
              <div className="py-6 text-center space-y-3 bg-blue-50/40 border border-blue-100 rounded-2xl">
                <Loader2 className="w-8 h-8 text-blue-700 animate-spin mx-auto" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-blue-950">Detecting your location...</h4>
                  <p className="text-[11px] text-blue-700 font-medium">Acquiring GPS coordinates & resolving LGD boundary...</p>
                </div>
              </div>
            )}

            {/* STEP 3: LOCATION DETECTED & PLANNED OPERATION CONFIRMATION */}
            {(locationMode === 'detected' || locationConfirmed) && locationResolution && (
              <div className="space-y-3.5 bg-emerald-50/40 border border-emerald-200/90 rounded-2xl p-4">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Location Detected ✓
                  </span>
                  <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {locationResolution.source === 'LIVE_GPS'
                      ? `Accuracy: ±${gpsAccuracy || 35} m (GPS)`
                      : locationResolution.source === 'DEMO'
                      ? 'Demo Scenario'
                      : 'Manual Selection'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
                  <p><span className="text-slate-400 font-semibold">State:</span> {locationResolution.stateName}</p>
                  <p><span className="text-slate-400 font-semibold">District:</span> {locationResolution.districtName}</p>
                  <p><span className="text-slate-400 font-semibold">Mandal/Block:</span> {locationResolution.subDistrictName}</p>
                  <p><span className="text-slate-400 font-semibold">Pincode:</span> <span className="font-mono text-blue-700">{locationResolution.pincode}</span></p>
                </div>

                {gpsAccuracy && gpsAccuracy > 200 && (
                  <p className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                    Location detected with limited accuracy (±{gpsAccuracy} m). Please confirm or adjust manually.
                  </p>
                )}

                <div className="pt-1 space-y-2 border-t border-emerald-200/60">
                  <p className="text-xs font-black text-slate-900">
                    Is this where you plan to operate your business?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleConfirmDetectedLocation}
                      className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Yes, Use This Location</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleChooseManualLocation}
                      className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Choose Another</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: MANUAL LOCATION FORM (Dependent Dropdowns) */}
            {locationMode === 'manual' && (
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    ENTER PLANNED BUSINESS LOCATION
                  </span>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Try GPS Detection</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* State Select */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {t('loc.stateLabel')} *
                    </label>
                    <select
                      value={selectedStateCode || ''}
                      onChange={handleStateChange}
                      className="w-full p-3 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden cursor-pointer"
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
                      {t('loc.districtLabel')} *
                    </label>
                    <select
                      disabled={!selectedStateCode}
                      value={selectedDistrictCode || ''}
                      onChange={handleDistrictChange}
                      className="w-full p-3 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                  {/* Mandal / Block Select */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {dynamicSubDistrictTerm} *
                    </label>
                    <select
                      disabled={!selectedDistrictCode}
                      value={selectedSubDistrictCode || ''}
                      onChange={handleSubDistrictChange}
                      className="w-full p-3 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <option value="">{t('loc.selectMandal')}</option>
                      {availableSubDistricts.map((sub) => (
                        <option key={sub.lgdCode} value={sub.lgdCode}>
                          {getLocalizedLocationName(sub, language)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pincode Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {t('loc.pincodeLabel')} *
                    </label>
                    <input
                      type="text"
                      disabled={!selectedSubDistrictCode}
                      value={pincode}
                      onChange={handlePincodeInputChange}
                      placeholder="Enter Pincode (e.g. 501218)"
                      className="w-full p-3 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold font-mono text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {pincodeError && (
                  <p className="text-[11px] font-bold text-rose-600 pt-0.5">{pincodeError}</p>
                )}
              </div>
            )}
          </div>

          {/* CARD 02: What are you planning to build? */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                02
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                What are you planning to build?
              </h2>
            </div>

            {/* BUSINESS SECTOR CATEGORY CARDS */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                BUSINESS SECTOR CATEGORY
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {businessCategories.map((cat) => {
                  const isSelected = businessCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setBusinessCategory(cat.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                        isSelected
                          ? 'border-2 border-blue-600 bg-blue-50/40 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{cat.icon}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <h4 className="text-xs font-bold text-slate-950 leading-snug">{cat.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{cat.subtext}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BUSINESS SCOPE & IDEA DESCRIPTION */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  BUSINESS SCOPE & IDEA DESCRIPTION
                </span>
                <button
                  type="button"
                  onClick={handleVoiceInputToggle}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-50 border-rose-300 text-rose-600 ring-2 ring-rose-300 animate-pulse'
                      : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                  <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={businessIdea}
                onChange={(e) => {
                  setBusinessIdea(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Describe your business scope, machinery, target capacity..."
                className="w-full p-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden resize-none"
              />
            </div>
          </div>

          {/* CARD 03: Available Own Capital */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                03
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                Available Own Capital
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[50000, 100000, 150000, 200000, 500000].map((amt) => {
                const isSel = availableCapital === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handlePresetCapital(amt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                      isSel
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    ₹{amt >= 100000 ? `${amt / 100000} Lakh` : `${amt / 1000}k`}
                  </button>
                );
              })}
            </div>

            <div className="pt-1">
              <div className="relative max-w-xs">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-500 text-sm">
                  ₹
                </span>
                <input
                  type="text"
                  value={rawCapitalString}
                  onChange={handleRawCapitalChange}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black font-mono text-slate-950 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden"
                />
              </div>
            </div>

            {/* Financial Calculator Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Own Equity</span>
                <span className="font-mono font-bold text-slate-900">₹{availableCapital.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Project Cost</span>
                <span className="font-mono font-bold text-slate-900">₹{indicativeProjectCost.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Bank Loan</span>
                <span className="font-mono font-bold text-blue-700">₹{indicativeFinancing.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Est. EMI</span>
                <span className="font-mono font-bold text-emerald-800">₹{indicativeEMI.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>
          </div>

          {/* PRIMARY CTA BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 border border-blue-500/30"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Running Multi-Agent Synthesis...</span>
              </span>
            ) : (
              <>
                <span>ANALYZE ENTERPRISE FEASIBILITY & GET ADVISORY</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN (~48% width on desktop) */}
        <div className="lg:col-span-6 space-y-4">
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

          {/* LOCATION INSIGHTS METRIC STRIP */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              LOCATION INSIGHTS
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                <div className="flex items-center gap-1.5 text-blue-700">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold text-slate-500">Location Type</span>
                </div>
                <p className="text-xs font-black text-slate-900">
                  {locationResolution?.areaType || 'Semi-Urban'}
                </p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                <div className="flex items-center gap-1.5 text-indigo-700">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold text-slate-500">Population (Est.)</span>
                </div>
                <p className="text-xs font-black text-slate-900 font-mono">
                  {locationConfirmed ? '42,540' : 'Census LGD'}
                </p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold text-slate-500">Connectivity</span>
                </div>
                <p className="text-xs font-black text-slate-900">Good (NH-48)</p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                <div className="flex items-center gap-1.5 text-amber-700">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold text-slate-500">Market Potential</span>
                </div>
                <p className="text-xs font-black text-emerald-700">High</p>
              </div>
            </div>

            <div className="pt-1 text-[11px] text-slate-600 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Based on your location, here are relevant nearby resources and opportunities.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CAPABILITY FEATURE STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Multi-Agent Analysis</h4>
            <p className="text-[10px] text-slate-500 font-medium">7 Specialized AI Agents</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Evidence-Aware</h4>
            <p className="text-[10px] text-slate-500 font-medium">Verified & Estimated Data</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Financial Intelligence</h4>
            <p className="text-[10px] text-slate-500 font-medium">EMI, DSCR, Cash Flow</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Govt. Schemes</h4>
            <p className="text-[10px] text-slate-500 font-medium">PMEGP, Mudra & More</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Risk Assessment</h4>
            <p className="text-[10px] text-slate-500 font-medium">Market, Financial, Operational</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Printable Report</h4>
            <p className="text-[10px] text-slate-500 font-medium">Download & Share PDF</p>
          </div>
        </div>
      </div>
    </form>
  );
};
