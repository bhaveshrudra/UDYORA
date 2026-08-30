import React, { useState, useEffect } from 'react';
import { Printer, Home, User, LogOut, Shield, FileText, Compass, Award } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { HeaderLanguageSelector } from './HeaderLanguageSelector';
import { getCurrentUserSession, UserProfile, logoutUserSession } from '../services/userAuthService';
import { UserAuthModal } from './UserAuthModal';

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
  const { t } = useLanguage();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUserSession());
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  useEffect(() => {
    setCurrentUser(getCurrentUserSession());
  }, []);

  const handleLogout = () => {
    logoutUserSession();
    setCurrentUser(null);
  };

  const handlePrintClick = () => {
    if (onPrint) {
      onPrint();
    } else if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleAdminClick = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs h-16 sm:h-[68px] flex items-center select-none">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left Side: Brand Logo + Primary Nav Links */}
          <div className="flex items-center gap-4 lg:gap-8">
            <div
              onClick={onNavigateHome || onReset}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-sm font-mono shadow-xs group-hover:bg-blue-900 transition-colors">
                U
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-black tracking-tight text-slate-950 leading-none">
                  UDYORA
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 mt-0.5">
                  BUSINESS ASSESSMENT
                </span>
              </div>
            </div>

            {/* Navigation Links matching Reference Image */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-700">
              {onNavigateHome && (
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="px-3 py-1.5 rounded-xl hover:text-blue-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {t('nav.home')}
                </button>
              )}
              <button
                type="button"
                onClick={onReset || onNavigateHome}
                className="px-3 py-1.5 rounded-xl text-blue-700 bg-blue-50 font-black hover:bg-blue-100 transition-colors cursor-pointer"
              >
                {t('nav.assessments')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('overview') || document.getElementById('result-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-xl hover:text-blue-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {t('nav.reports')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('guidance');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-xl hover:text-blue-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {t('nav.guidance')}
              </button>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Language Selector Dropdown */}
            <HeaderLanguageSelector align="right" showCodeOnlyOnMobile={false} />

            {/* Print Report Button */}
            <button
              type="button"
              onClick={handlePrintClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">{t('nav.printReport')}</span>
            </button>

            {/* User Account / Auth Status Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-blue-950">
                <User className="w-4 h-4 text-blue-700" />
                <span className="hidden sm:inline truncate max-w-[120px]">{currentUser.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>{t('nav.accountSignIn')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* User Auth Modal */}
      <UserAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => setCurrentUser(u)}
      />
    </>
  );
};
