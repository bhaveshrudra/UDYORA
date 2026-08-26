import React from 'react';
import { Globe, ArrowRight, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage } from '../i18n/types';

interface PublicFooterProps {
  onNavigateHome?: () => void;
  onNavigateToApp?: () => void;
  onNavigateToAdmin?: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onNavigateHome,
  onNavigateToApp,
  onNavigateToAdmin
}) => {
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  const scrollToSection = (id: string) => {
    if (onNavigateHome) {
      onNavigateHome();
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="relative bg-white border-t border-slate-200 text-slate-700 overflow-hidden select-none">
      {/* Subtle Background Data Node Grid Pattern (Low Opacity) */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      {/* Main Footer Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & Purpose Column (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" showTagline={true} onClick={onNavigateHome} />

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              UDYORA combines local business intelligence, financial planning, risk analysis and evidence-backed guidance to empower rural and semi-urban micro-entrepreneurs.
            </p>

            <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Evidence-Aware Multi-Agent Architecture (SIH26091)</span>
            </div>
          </div>

          {/* Column 1: PRODUCT */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Product
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li>
                <button
                  onClick={() => scrollToSection('capabilities')}
                  className="hover:text-blue-900 transition-colors cursor-pointer"
                >
                  {t('nav.capabilities')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="hover:text-blue-900 transition-colors cursor-pointer"
                >
                  {t('nav.howItWorks')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('evidence')}
                  className="hover:text-blue-900 transition-colors cursor-pointer"
                >
                  {t('nav.evidence')}
                </button>
              </li>
              {onNavigateToApp && (
                <li>
                  <button
                    onClick={onNavigateToApp}
                    className="font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{t('nav.startAnalysis')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 2: RESOURCES */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Resources
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li>
                <span className="hover:text-blue-900 cursor-default">Local Market Catchments</span>
              </li>
              <li>
                <span className="hover:text-blue-900 cursor-default">Deterministic Loan EMI Math</span>
              </li>
              <li>
                <span className="hover:text-blue-900 cursor-default">Government Scheme Rules</span>
              </li>
              <li>
                <span className="hover:text-blue-900 cursor-default">Responsible AI Audit Trail</span>
              </li>
            </ul>
          </div>

          {/* Column 3: LANGUAGES & CONTACT */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Languages
            </h3>
            <div className="flex flex-col space-y-1.5 text-xs font-medium">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`text-left transition-colors cursor-pointer ${
                    language === lang.code ? 'font-bold text-blue-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          {/* Left Copyright & Attribution */}
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© 2026 UDYORA</span>
            <span>•</span>
            <span>Developed by Beyond Zero</span>
          </div>

          {/* Right Links & Subtle Low-Emphasis Admin Entry */}
          <div className="flex items-center gap-5 text-[11px] text-slate-500">
            <span className="hover:text-slate-700 cursor-default">Privacy</span>
            <span className="hover:text-slate-700 cursor-default">Terms</span>
            <span className="hover:text-slate-700 cursor-default">Accessibility</span>
            <span>•</span>
            {/* Low-emphasis, subtle Admin Portal link */}
            <button
              onClick={onNavigateToAdmin}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer underline-offset-2 hover:underline"
              title="Restricted Administrative Access"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
