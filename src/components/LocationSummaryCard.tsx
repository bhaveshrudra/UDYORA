import React, { useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building2,
  Database,
  Calendar,
  Layers,
  Compass,
  Info
} from 'lucide-react';
import { LocationResolution } from '../types/map';
import { useLanguage } from '../i18n/LanguageContext';

interface LocationSummaryCardProps {
  location: LocationResolution;
  className?: string;
  onEditLocation?: () => void;
}

export const LocationSummaryCard: React.FC<LocationSummaryCardProps> = ({
  location,
  className = '',
  onEditLocation
}) => {
  const { t } = useLanguage();
  const [showAdminDetails, setShowAdminDetails] = useState<boolean>(false);

  return (
    <div className={`bg-white border-2 border-emerald-500/30 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3 ${className}`}>
      {/* 1. STATUS HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider font-mono block">
              LOCATION CONFIRMED
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-950 leading-tight">
              {location.localityName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEditLocation && (
            <button
              type="button"
              onClick={onEditLocation}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
            >
              Change Location
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowAdminDetails(!showAdminDetails)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <span>{showAdminDetails ? 'Hide Details' : 'View Administrative Details'}</span>
            {showAdminDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. ADMINISTRATIVE HIERARCHY SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">State</span>
          <span className="font-bold text-slate-900 truncate block mt-0.5">{location.stateName}</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">District</span>
          <span className="font-bold text-slate-900 truncate block mt-0.5">{location.districtName}</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">Sub-District / Mandal</span>
          <span className="font-bold text-slate-900 truncate block mt-0.5">{location.subDistrictName}</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">Coordinates</span>
          <span className="font-mono font-bold text-blue-950 truncate block mt-0.5 text-[11px]">
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </span>
        </div>
      </div>

      {/* 3. DUAL PROVENANCE SOURCES */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          <span><strong>Admin Source:</strong> {location.administrativeSource}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-emerald-700" />
          <span><strong>Map Source:</strong> {location.mappingSource}</span>
        </div>
      </div>

      {/* 4. EXPANDABLE LGD ADMINISTRATIVE DETAILS DRAWER */}
      {showAdminDetails && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 font-mono text-[11px]">
            <span className="font-bold text-slate-700">Official Administrative Identifiers (LGD)</span>
            <span className="text-emerald-800 font-bold">MoPR Verified</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">State Code</span>
              <span className="font-bold text-slate-900">{location.stateCode}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">District Code</span>
              <span className="font-bold text-slate-900">{location.districtCode}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Sub-District Code</span>
              <span className="font-bold text-slate-900">{location.subDistrictCode}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Village LGD Code</span>
              <span className="font-bold text-slate-900">{location.villageCode || 'N/A'}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-tight pt-1">
            * All administrative boundaries, local naming conventions, and postal indices are synchronized from the Local Government Directory (LGD).
          </p>
        </div>
      )}
    </div>
  );
};
