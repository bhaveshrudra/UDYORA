import React from 'react';
import { Compass, RotateCcw, Printer, FileText, Globe } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  onPrint?: () => void;
  currentLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  hasResult?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onPrint,
  currentLanguage = 'en',
  onLanguageChange,
  hasResult = false
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Official Subtle Indian Tri-color Accent Bar */}
      <div className="w-full h-1 bg-gradient-to-r from-amber-500 via-slate-200 to-emerald-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-xs border border-slate-700 tracking-wider">
            U
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-950">UDYORA</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                PROTOTYPE v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Hyper-Local Business Intelligence for Rural Entrepreneurs
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          {onLanguageChange && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="en">English (EN)</option>
                <option value="hi">à¤¹à¤¿à¤¨à¥à¤¦à¥€ (HI)</option>
                <option value="mr">à¤®à¤°à¤¾à¤ à¥€ (MR)</option>
                <option value="te">à°¤à11à±†à°²à±à°à± (TE)</option>
                <option value="kn">à²•à²¨à³à²¨à²¡ (KN)</option>
              </select>
            </div>
          )}

          {hasResult && onPrint && (
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-900 transition-colors shadow-2xs cursor-pointer"
              title="Print Advisory Dossier"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Dossier</span>
            </button>
          )}

          {hasResult && onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-900 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
