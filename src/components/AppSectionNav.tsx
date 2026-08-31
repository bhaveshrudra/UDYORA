import React, { useRef, useEffect, useState, useLayoutEffect } from'react';
import {
 Sparkles,
 MapPin,
 Calculator,
 Award,
 Store,
 ShieldAlert,
 Database,
 Layers
} from'lucide-react';
import { useLanguage } from'../i18n/LanguageContext';
import { TranslationDictionary } from'../i18n/types';

export interface SectionNavItem {
 id: string;
 labelKey: keyof TranslationDictionary;
 defaultLabel: string;
 icon: React.ReactNode;
}

export interface AppSectionNavProps {
 activeSection: string;
 onSectionSelect: (sectionId: string) => void;
 scrollProgress?: number;
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
 onSectionSelect,
 scrollProgress = 0
}) => {
 const { t } = useLanguage();
 const navContainerRef = useRef<HTMLDivElement>(null);
 const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

 const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
 left: 0,
 width: 0,
 opacity: 0
 });

 // Calculate sliding indicator coordinates on activeSection change or resize
 const updateIndicator = () => {
 const btn = buttonRefs.current.get(activeSection);
 const container = navContainerRef.current;
 if (btn && container) {
 setIndicatorStyle({
 left: btn.offsetLeft,
 width: btn.offsetWidth,
 opacity: 1
 });
 }
 };

 useLayoutEffect(() => {
 updateIndicator();
 }, [activeSection]);

 useEffect(() => {
 window.addEventListener('resize', updateIndicator);
 return () => window.removeEventListener('resize', updateIndicator);
 }, [activeSection]);

 // Auto-scroll active item into view on mobile horizontal scroll
 useEffect(() => {
 const btn = buttonRefs.current.get(activeSection);
 const container = navContainerRef.current;
 if (btn && container) {
 const containerRect = container.getBoundingClientRect();
 const buttonRect = btn.getBoundingClientRect();

 if (buttonRect.left < containerRect.left + 20 || buttonRect.right > containerRect.right - 20) {
 const targetLeft = btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
 container.scrollTo({
 left: Math.max(0, targetLeft),
 behavior:'smooth'
 });
 }
 }
 }, [activeSection]);

 return (
 <nav
 aria-label="Assessment Section Navigation"
 className="sticky top-16 sm:top-[68px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs select-none transition-colors duration-200"
 >
 {/* Top Scroll Reading Progress Bar (Subtle 2px) */}
 <div className="w-full h-[2px] bg-slate-100 overflow-hidden">
 <div
 className="h-full bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-700 transition-all duration-150 ease-out"
 style={{ width:`${Math.min(100, Math.max(0, scrollProgress))}%` }}
 />
 </div>

 <div className="max-w-7xl mx-auto px-3 sm:px-6">
 <div
 ref={navContainerRef}
 className="relative flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-1.5 scroll-smooth no-scrollbar"
 >
 {/* Smooth Sliding Active Background Indicator */}
 <div
 className="absolute top-1.5 bottom-1.5 rounded-xl bg-blue-50 border border-blue-200/80 pointer-events-none transition-all duration-300 ease-out"
 style={{
 left:`${indicatorStyle.left}px`,
 width:`${indicatorStyle.width}px`,
 opacity: indicatorStyle.opacity
 }}
 />

 {APP_SECTIONS.map((sec) => {
 const isActive = activeSection === sec.id;
 return (
 <button
 key={sec.id}
 ref={(el) => {
 if (el) buttonRefs.current.set(sec.id, el);
 else buttonRefs.current.delete(sec.id);
 }}
 type="button"
 onClick={() => onSectionSelect(sec.id)}
 className={`group relative z-10 shrink-0 min-h-[40px] px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
 isActive
 ?'text-blue-700 font-black'
 :'text-slate-600 hover:text-slate-950 hover:bg-slate-100/60'
 }`}
 aria-current={isActive ?'true' : undefined}
 >
 <span
 className={`transition-colors duration-200 ${
 isActive
 ?'text-blue-700'
 :'text-slate-400 group-hover:text-slate-700'
 }`}
 >
 {sec.icon}
 </span>
 <span className="whitespace-nowrap">
 {t(sec.labelKey) || sec.defaultLabel}
 </span>

 {/* Subtle active bottom underline bar */}
 {isActive && (
 <span
 className="absolute -bottom-1.5 inset-x-2.5 h-[2px] bg-blue-600 rounded-full"
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
