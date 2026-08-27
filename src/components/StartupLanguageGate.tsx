import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, ArrowRight, Globe } from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../i18n/types';
import { BrandLogo } from './BrandLogo';

interface StartupLanguageGateProps {
  initialLanguage?: SupportedLanguage;
  onConfirmLanguage: (selected: SupportedLanguage) => void;
}

export const StartupLanguageGate: React.FC<StartupLanguageGateProps> = ({
  initialLanguage = 'en',
  onConfirmLanguage
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage | null>(null);

  const handleContinue = () => {
    if (selectedLang) {
      onConfirmLanguage(selectedLang);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-white text-slate-900 p-6 sm:p-8 overflow-y-auto select-none">
      {/* Background Subtle Radial Ambient Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.035] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-100/50 via-indigo-50/20 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="w-full max-w-xl flex items-center justify-between z-10 pt-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-900 border border-blue-200">
          <Globe className="w-3 h-3 text-blue-700" />
          <span>Language Setup • भाषा चयन</span>
        </span>
        <span className="text-[11px] font-mono text-slate-500 font-bold">UDYORA Welcome</span>
      </div>

      {/* Center Main Language Selection Card */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl my-auto space-y-6 text-center py-6"
      >
        {/* Brand Logo & Heading */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <BrandLogo size="lg" showTagline={false} />

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-950">
              Choose your preferred language
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Select your language for localized business intelligence, financial plans, and voice guidance.
            </p>
          </div>
        </div>

        {/* 5 Selectable Language Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2" role="radiogroup" aria-label="Select preferred language">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;

            return (
              <button
                key={lang.code}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedLang(lang.code)}
                className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left focus:outline-hidden focus:ring-2 focus:ring-blue-600 ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-700 shadow-xs ring-1 ring-blue-700 text-slate-950 -translate-y-0.5'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 hover:-translate-y-0.5 text-slate-800 shadow-2xs'
                }`}
              >
                <div>
                  <span className="block text-sm sm:text-base font-black tracking-tight text-slate-950">
                    {lang.nativeName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                    {lang.label}
                  </span>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-blue-700 text-white'
                      : 'border border-slate-300 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 font-medium">
            You can switch languages anytime later from the header.
          </span>

          <button
            type="button"
            disabled={!selectedLang}
            onClick={handleContinue}
            aria-label="Continue to UDYORA Home"
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-slate-900 overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span
              className="absolute inset-0 w-full h-full bg-blue-800 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
              aria-hidden="true"
            />
            <span className="relative z-10 text-white">
              CONTINUE
            </span>
            <ArrowRight className="relative z-10 w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </div>
      </motion.div>

      {/* Bottom Footer Attribution */}
      <div className="w-full max-w-xl text-center text-[11px] text-slate-400 z-10 pb-2">
        <span>UDYORA • Hyper-Local Business Intelligence for Rural Entrepreneurs</span>
      </div>
    </div>
  );
};
