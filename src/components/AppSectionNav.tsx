import React, { useRef, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Calculator,
  Award,
  Store,
  ShieldAlert,
  Database,
  Layers
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { TranslationDictionary } from '../i18n/types';

export interface SectionNavItem {
  id: string;
  labelKey: keyof TranslationDictionary;
  defaultLabel: string;
  icon: React.ReactNode;
}

export interface AppSectionNavProps {
  activeSection: string;
  onSectionSelect: (sectionId: string) => void;
}

export const APP_SECTIONS: SectionNavItem[] = [
  {
    id: 'overview',
    labelKey: 'nav.sec.overview',
    defaultLabel: 'Overview',
    icon: <Sparkles className="w-3.5 h-3.5 shrink-0" />
  },
  {
    id: 'swot',
    labelKey: 'nav.sec.swot' as any,
    defaultLabel: 'SWOT',
    icon: <Layers className="w-3.5 h-3.5 shrink-0" />
  },
  {
    id: 'location',
    labelKey: 'nav.sec.location',
    defaultLabel: 'Location',
    icon: <MapPin className="w-3.5 h-3.5 shrink-0" />
  },
  {
    id: 'finance',
    labelKey: 'nav.sec.finance',
    defaultLabel: 'Finance',
    icon: <Calculator className="w-3.5 h-3.5 shrink-0" />
  },
  {
    id: 'guidance',
    labelKey: 'nav.sec.guidance',
    defaultLabel: 'Guidance',
    icon: <Award className="w-3.5 h-3.5 shrink-0" />
  },
  {
    id: 'market',
    labelKey: 'nav.sec.market',
    defaultLabel: 'Market',
    icon: <Store className="w-3.5 h-3.5 shrink-0" />
  },
  {
    id: 'risks',
    labelKey: 'nav.sec.risks',
    defaultLabel: 'Risks',
    icon: <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
  },
  {
    id: 'evidence',
    labelKey: 'nav.sec.evidence',
    defaultLabel: 'Evidence',
    icon: <Database className="w-3.5 h-3.5 shrink-0" />
  }
];

export const AppSectionNav: React.FC<AppSectionNavProps> = ({
  activeSection,
  onSectionSelect
}) => {
  const { t } = useLanguage();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Auto-scroll active item into view on mobile horizontal scroll
  useEffect(() => {
    if (activeBtnRef.current && navContainerRef.current) {
      const container = navContainerRef.current;
      const button = activeBtnRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      // If button is outside visible container bounds, smoothly scroll container horizontally only
      if (buttonRect.left < containerRect.left || buttonRect.right > containerRect.right) {
        const targetLeft = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2;
        container.scrollTo({
          left: targetLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeSection]);

  return (
    <nav
      aria-label="Assessment Section Navigation"
      className="sticky top-16 sm:top-[68px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs select-none transition-all"
    >
      <div className="max-w-5xl mx-auto px-2 sm:px-4">
        <div
          ref={navContainerRef}
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1 scroll-smooth no-scrollbar"
        >
          {APP_SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                ref={isActive ? activeBtnRef : null}
                type="button"
                onClick={() => onSectionSelect(sec.id)}
                className={`group relative shrink-0 min-h-[44px] px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer border-b-2 ${
                  isActive
                    ? 'text-blue-700 font-extrabold border-blue-700 bg-blue-50/50'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-50'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                <span
                  className={`transition-colors ${
                    isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  {sec.icon}
                </span>
                <span className="whitespace-nowrap">
                  {t(sec.labelKey) || sec.defaultLabel}
                </span>

                {/* Subtle active indicator underline dot for micro animation */}
                {isActive && (
                  <span
                    className="absolute bottom-[-2px] inset-x-3 h-[2px] bg-blue-700 rounded-full"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
