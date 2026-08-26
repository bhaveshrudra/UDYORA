import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  Store,
  TrendingUp,
  Calculator,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Building2,
  Users,
  Compass,
  FileText,
  MapPin,
  ChevronRight,
  ExternalLink,
  Globe
} from 'lucide-react';
import { AnimatedBusinessBackground } from './AnimatedBusinessBackground';
import { ProductIntroSplash } from './ProductIntroSplash';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage } from '../i18n/types';

interface LandingPageProps {
  onNavigateToApp: (scenario?: 'dairy' | 'tailoring' | 'retail') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToApp
}) => {
  const landingRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  // Intro Splash state (only played on initial visit per session)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !sessionStorage.getItem('udyora_intro_seen');
    } catch {
      return false;
    }
  });

  const handleSplashComplete = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem('udyora_intro_seen', 'true');
    } catch {}
  };

  // Smooth scroll helper for landing nav links
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const capabilities = [
    {
      title: t('cap.market.title'),
      desc: t('cap.market.desc'),
      icon: <Store className="w-6 h-6 text-blue-700" />,
      detail: t('cap.market.detail')
    },
    {
      title: t('cap.feasibility.title'),
      desc: t('cap.feasibility.desc'),
      icon: <TrendingUp className="w-6 h-6 text-indigo-700" />,
      detail: t('cap.feasibility.detail')
    },
    {
      title: t('cap.finance.title'),
      desc: t('cap.finance.desc'),
      icon: <Calculator className="w-6 h-6 text-amber-700" />,
      detail: t('cap.finance.detail')
    },
    {
      title: t('cap.guidance.title'),
      desc: t('cap.guidance.desc'),
      icon: <Award className="w-6 h-6 text-emerald-700" />,
      detail: t('cap.guidance.detail')
    }
  ];

  const workflowSteps = [
    { step: '01', title: t('workflow.step1.title'), desc: t('workflow.step1.desc') },
    { step: '02', title: t('workflow.step2.title'), desc: t('workflow.step2.desc') },
    { step: '03', title: t('workflow.step3.title'), desc: t('workflow.step3.desc') },
    { step: '04', title: t('workflow.step4.title'), desc: t('workflow.step4.desc') },
    { step: '05', title: t('workflow.step5.title'), desc: t('workflow.step5.desc') },
    { step: '06', title: t('workflow.step6.title'), desc: t('workflow.step6.desc') },
    { step: '07', title: t('workflow.step7.title'), desc: t('workflow.step7.desc') }
  ];

  return (
    <div
      ref={landingRef}
      className="relative min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-950 overflow-x-hidden"
    >
      {/* 1. First-time Visitor Product Intro Splash */}
      {showSplash && <ProductIntroSplash onComplete={handleSplashComplete} />}

      {/* 2. Full-Page Continuous Business Intelligence Background Animation Layer */}
      <AnimatedBusinessBackground containerRef={landingRef} />

      {/* Top Header Accent Band */}
      <div className="relative z-50 w-full h-1 bg-gradient-to-r from-amber-500 via-slate-200 to-emerald-600" />

      {/* LANDING HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-xs border border-slate-700 tracking-wider">
              U
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-950 block">
                {t('brand.name')}
              </span>
              <p className="text-[11px] text-slate-500 font-medium tracking-normal leading-tight hidden sm:block">
                {t('brand.tagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-600">
            <button
              onClick={() => scrollToSection('capabilities')}
              className="hover:text-blue-900 transition-colors cursor-pointer"
            >
              {t('nav.capabilities')}
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-blue-900 transition-colors cursor-pointer"
            >
              {t('nav.howItWorks')}
            </button>
            <button
              onClick={() => scrollToSection('evidence')}
              className="hover:text-blue-900 transition-colors cursor-pointer"
            >
              {t('nav.evidence')}
            </button>
          </nav>

          {/* Right Header Controls: Language Selector & Launch App Button */}
          <div className="flex items-center gap-3">
            {/* Global Language Selector Dropdown */}
            <div className="relative inline-flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
              <select
                aria-label="Select Application Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="pl-7 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer transition-colors appearance-none shadow-2xs"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="py-1">
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Interactive Header LAUNCH APP button with Left-to-Right Fill Sweep */}
            <button
              onClick={() => onNavigateToApp()}
              className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 overflow-hidden transition-all duration-300 shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer"
            >
              <span
                className="absolute inset-0 w-full h-full bg-blue-900 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                aria-hidden="true"
              />
              <span className="relative z-10 text-white">
                {t('nav.launchApp')}
              </span>
              <ArrowRight className="relative z-10 w-3.5 h-3.5 text-white group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN HERO SECTION */}
      <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[580px] sm:min-h-[640px]">
        {/* Foreground Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Subtle Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50/90 backdrop-blur-xs text-blue-900 border border-blue-200/80 shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>{t('brand.tagline')}</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-950"
          >
            {t('hero.title')}
          </motion.h1>

          {/* Supporting Statement */}
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            {t('hero.supporting')}
          </motion.p>

          {/* Single Interactive Call-To-Action Button with Left-to-Right Sweep Fill */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center pt-4"
          >
            <button
              onClick={() => onNavigateToApp()}
              className="group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-xl text-sm sm:text-base font-bold text-slate-900 bg-white/95 backdrop-blur-xs border border-slate-300 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-900 active:scale-[0.98] cursor-pointer"
            >
              {/* Muted Blue Left-to-Right Sweep Fill Overlay */}
              <span
                className="absolute inset-0 w-full h-full bg-slate-900 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                aria-hidden="true"
              />

              {/* Foreground Label with smooth color inversion */}
              <span className="relative z-10 text-slate-900 group-hover:text-white transition-colors duration-300">
                {t('nav.getStarted')}
              </span>

              {/* Interactive Arrow Indicator with 4px Right Shift */}
              <ArrowRight className="relative z-10 w-4 h-4 text-slate-900 group-hover:text-white group-hover:translate-x-1.5 transition-all duration-300" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 1: PRODUCT CAPABILITIES */}
      <section id="capabilities" className="relative z-10 py-20 border-t border-b border-slate-200/80 bg-slate-50/50 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {t('cap.sectionBadge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mt-3">
              {t('cap.title')}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {t('cap.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: idx * 0.1 }}
                className="bg-white/90 backdrop-blur-xs border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-800">
                  {item.detail}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: 7-STEP MULTI-AGENT WORKFLOW WITH CONNECTED DATA TRAIL */}
      <section id="how-it-works" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {t('workflow.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mt-3">
              {t('workflow.title')}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {t('workflow.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="relative border border-slate-200 rounded-2xl p-5 bg-white/90 backdrop-blur-xs hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-black text-blue-700">
                      STEP {s.step}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-blue-500/40" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: RESPONSIBLE AI EVIDENCE AUDIT PRINCIPLES */}
      <section id="evidence" className="relative z-10 py-20 bg-slate-950 text-white border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-900/60 px-3 py-1 rounded-full border border-blue-700">
              {t('evidence.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-3">
              {t('evidence.title')}
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              {t('evidence.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. VERIFIED with small check pulse animation */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <h3 className="text-base font-bold text-white">{t('evidence.verified.title')}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('evidence.verified.desc')}
              </p>
            </div>

            {/* 2. ESTIMATED with slow breathing dot animation */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">{t('evidence.estimated.title')}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('evidence.estimated.desc')}
              </p>
            </div>

            {/* 3. INSUFFICIENT DATA with soft expanding information ring */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <h3 className="text-base font-bold text-white">{t('evidence.insufficient.title')}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('evidence.insufficient.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL LANDING CTA BANNER */}
      <section className="relative z-10 py-16 bg-blue-50/40 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            {t('cta.title')}
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigateToApp()}
              className="group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-xl text-sm font-bold text-white bg-slate-900 overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
            >
              <span
                className="absolute inset-0 w-full h-full bg-blue-900 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                aria-hidden="true"
              />
              <span className="relative z-10 text-white">
                {t('cta.button')}
              </span>
              <ArrowRight className="relative z-10 w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </section>

      {/* PUBLIC SERVICE FOOTER */}
      <footer className="relative z-10 border-t border-slate-200 bg-white/95 backdrop-blur-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">
              U
            </div>
            <span className="font-bold text-slate-800">{t('brand.name')}</span>
            <span>— {t('brand.tagline')}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Deterministic Financial Engine</span>
            <span>•</span>
            <span>Rule-based Schemes</span>
            <span>•</span>
            <span>{t('brand.developedBy')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
