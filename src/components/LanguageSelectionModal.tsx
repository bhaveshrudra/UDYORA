import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, ArrowRight, Globe, Sparkles } from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../i18n/types';
import { BrandLogo } from './BrandLogo';

interface LanguageSelectionModalProps {
  initialLanguage?: SupportedLanguage;
  onSelectLanguage: (selected: SupportedLanguage) => void;
}

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  initialLanguage = 'en',
  onSelectLanguage
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(initialLanguage);

  const handleContinue = () => {
    onSelectLanguage(selectedLang);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md p-4 sm:p-6 overflow-y-auto select-none"
    >
      {/* Subtle Background Radial Ambient Glow */}
      <div className="absolute inset-0 bg-radial from-blue-100/50 via-indigo-50/20 to-transparent opacity-80 pointer-events-none" />

      {/* Center Container Card */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center"
      >
        {/* Brand Logo & Heading */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <BrandLogo size="lg" showTagline={true} />

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
              <Globe className="w-3.5 h-3.5 text-blue-700" />
              <span>Language Selection • भाषा चयन</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 mt-2">
              Choose your preferred language
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Select the language you want to use for business feasibility analysis, financial reports, and voice guidance.
            </p>
          </div>
        </div>

        {/* 5 Language Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedLang(lang.code)}
                className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 shadow-xs ring-1 ring-blue-600 text-slate-950'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div>
                  <span className="block text-sm sm:text-base font-bold tracking-tight">
                    {lang.nativeName}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                    {lang.label}
                  </span>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-300 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Controls: CONTINUE CTA */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 font-medium">
            You can also switch languages anytime from the header.
          </span>

          <button
            type="button"
            onClick={handleContinue}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl text-sm font-bold text-white bg-slate-900 overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
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
    </motion.div>
  );
};
