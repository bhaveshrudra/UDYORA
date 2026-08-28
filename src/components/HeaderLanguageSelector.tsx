import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage } from '../i18n/types';

export interface HeaderLanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
  shortCode: string;
}

export const HEADER_LANGUAGES: HeaderLanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', shortCode: 'EN' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', shortCode: 'HI' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', shortCode: 'MR' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', shortCode: 'TE' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', shortCode: 'KN' }
];

interface HeaderLanguageSelectorProps {
  className?: string;
  align?: 'left' | 'right';
  showCodeOnlyOnMobile?: boolean;
}

export const HeaderLanguageSelector: React.FC<HeaderLanguageSelectorProps> = ({
  className = '',
  align = 'right',
  showCodeOnlyOnMobile = true
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { language, setLanguage, resetLanguagePreference } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentOption =
    HEADER_LANGUAGES.find((l) => l.code === language) || HEADER_LANGUAGES[0];

  // Clear hover timeout
  const cancelCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  // Open with mouse enter (desktop hover)
  const handleMouseEnter = () => {
    cancelCloseTimeout();
    setIsOpen(true);
  };

  // Safe delayed close with mouse leave (desktop hover)
  const handleMouseLeave = () => {
    cancelCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setFocusedIndex(-1);
    }, 220); // 220ms safe grace window for mouse travel
  };

  // Toggle on click / tap (mobile & desktop click)
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    cancelCloseTimeout();
    setIsOpen((prev) => !prev);
    setFocusedIndex(-1);
  };

  // Select language and close
  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  };

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      cancelCloseTimeout();
    };
  }, [cancelCloseTimeout]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        const curIdx = HEADER_LANGUAGES.findIndex((l) => l.code === language);
        setFocusedIndex(curIdx >= 0 ? curIdx : 0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;

      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % HEADER_LANGUAGES.length);
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev <= 0 ? HEADER_LANGUAGES.length - 1 : prev - 1
        );
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < HEADER_LANGUAGES.length) {
          handleSelectLanguage(HEADER_LANGUAGES[focusedIndex].code);
        }
        break;

      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;

      default:
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block text-left select-none ${className}`}
    >
      {/* TRIGGER BUTTON */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        onKeyDown={handleKeyDown}
        aria-label="Select language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-white hover:bg-slate-50 border rounded-xl text-xs font-bold text-slate-900 transition-all duration-200 shadow-2xs cursor-pointer min-h-[38px] ${
          isOpen
            ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 text-blue-950'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <Globe className="w-3.5 h-3.5 text-blue-700 shrink-0" />

        {/* Desktop display: e.g. 'English (EN)', 'తెలుగు (TE)', 'हिन्दी (HI)' */}
        <span
          className={
            showCodeOnlyOnMobile
              ? 'hidden sm:inline font-bold tracking-tight text-slate-900'
              : 'font-bold tracking-tight text-slate-900'
          }
        >
          {currentOption.nativeName} ({currentOption.shortCode})
        </span>

        {/* Mobile display: e.g. 'EN', 'TE', 'HI' */}
        {showCodeOnlyOnMobile && (
          <span className="inline sm:hidden font-mono font-black text-slate-950 tracking-wider">
            {currentOption.shortCode}
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-blue-700' : 'group-hover:text-slate-600'
          }`}
        />
      </button>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={listRef}
            role="listbox"
            aria-label="Languages"
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 4,
              scale: shouldReduceMotion ? 1 : 0.98
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 4,
              scale: shouldReduceMotion ? 1 : 0.98
            }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute top-full mt-1.5 w-52 sm:w-56 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-50 space-y-0.5 overflow-hidden backdrop-blur-md ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {HEADER_LANGUAGES.map((opt, index) => {
              const isSelected = language === opt.code;
              const isKeyboardFocused = focusedIndex === index;

              return (
                <button
                  key={opt.code}
                  role="option"
                  type="button"
                  aria-selected={isSelected}
                  onClick={() => handleSelectLanguage(opt.code)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-150 cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-50/90 text-blue-950 font-bold border border-blue-200/80 shadow-2xs'
                      : isKeyboardFocused
                      ? 'bg-slate-100 text-slate-950 font-medium'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950 border border-transparent'
                  }`}
                >
                  {/* Left: Native Name */}
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs font-bold tracking-tight truncate">
                      {opt.nativeName}
                    </span>
                  </div>

                  {/* Right: Short Code Badge + Checkmark */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                        isSelected
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {opt.shortCode}
                    </span>

                  </div>
                </button>
              );
            })}

            {/* Dev Reset Action to easily test First-Visit Language Gate */}
            <div className="pt-1.5 mt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  resetLanguagePreference();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer border border-amber-200/80"
              >
                <span>Reset Language (Test First Visit)</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
