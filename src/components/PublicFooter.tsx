import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from '../i18n/LanguageContext';

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
      {/* Subtle Background Node Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.025] pointer-events-none" />

      {/* Main Footer Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Mission Statement */}
          <div className="lg:col-span-2 space-y-3">
            <BrandLogo size="md" showTagline={true} onClick={onNavigateHome} />

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              UDYORA combines local business intelligence, financial planning, risk analysis and evidence-backed guidance to empower rural and semi-urban micro-entrepreneurs.
            </p>

            <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Evidence-Aware Multi-Agent Decision Platform</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Product
            </h3>
            <ul className="space-y-1.5 text-xs font-medium text-slate-600">
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

          {/* Languages */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Languages
            </h3>
            <div className="flex flex-col space-y-1 text-xs font-medium">
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

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© 2026 UDYORA</span>
            <span>•</span>
            <span>Developed by Beyond Zero</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="hover:text-slate-700 cursor-default">Privacy</span>
            <span className="hover:text-slate-700 cursor-default">Terms</span>
            <span className="hover:text-slate-700 cursor-default">Accessibility</span>
            <span>•</span>
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
