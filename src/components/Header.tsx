import React, { useState, useEffect } from 'react';
import { RotateCcw, Printer, ArrowLeft, User, LogOut } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { BrandLogo } from './BrandLogo';
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

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs h-16 sm:h-[68px] flex flex-col justify-between select-none">
        {/* Top Accent Line */}
        <div className="w-full h-1 bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 shrink-0" />

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between flex-1">
          {/* Left Side: Back Home + Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAppRoute && onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Return to UDYORA Home"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.home') || 'Home'}</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <BrandLogo
                size="sm"
                onClick={onNavigateHome || onReset}
                showTagline={false}
              />
              {isAppRoute && (
                <span className="hidden md:inline-block text-[11px] font-bold uppercase tracking-wider text-slate-500 border-l border-slate-200 pl-2">
                  {t('nav.app') || 'Business Assessment'}
                </span>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* User Account / Auth Status Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-xl text-xs font-bold text-blue-950">
                <User className="w-3.5 h-3.5 text-blue-700" />
                <span className="hidden sm:inline truncate max-w-[120px]">{currentUser.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Account / Sign In</span>
              </button>
            )}

            {/* Global Language Selector Dropdown */}
            <HeaderLanguageSelector align="right" showCodeOnlyOnMobile={true} />

            {/* Action Buttons */}
            {hasResult && onPrint && (
              <button
                onClick={onPrint}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('nav.printReport') || 'Print Report'}</span>
              </button>
            )}

            {hasResult && onReset && (
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('nav.reset') || 'Change Inputs'}</span>
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
