import React from 'react';
import { Compass, RotateCcw, Printer, ArrowLeft, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage } from '../i18n/types';

interface HeaderProps {
  onReset?: () => void;
  onPrint?: () => void;
  onNavigateHome?: () => void;
  hasResult?: boolean;
  isAppRoute?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onPrint,
  onNavigateHome,
  hasResult = false,
  isAppRoute = true
}) => {
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Subtle Indian Accent Band */}
      <div className="w-full h-1 bg-gradient-to-r from-amber-500 via-slate-200 to-emerald-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left Side: Home link & Brand Logo */}
        <div className="flex items-center gap-3.5">
          {isAppRoute && onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer mr-1"
              title={t('nav.home')}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.home')}</span>
            </button>
          )}

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={onNavigateHome || onReset}
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-xs border border-slate-700 tracking-wider">
              U
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-950">{t('brand.name')}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block leading-tight">
                {t('brand.tagline')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Unicode Language Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          {hasResult && onPrint && (
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-900 transition-colors shadow-2xs cursor-pointer"
              title={t('nav.printReport')}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('nav.printReport')}</span>
            </button>
          )}

          {hasResult && onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-900 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('nav.newAnalysis')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
