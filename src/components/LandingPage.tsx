import React, { useRef, useState } from 'react';
import { motion, useReducedMotion, Variants } from 'motion/react';
import {
  ArrowRight,
  Store,
  TrendingUp,
  Calculator,
  Award,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Users,
  Compass,
  FileText,
  MapPin,
  ChevronRight,
  ExternalLink,
  Globe,
  Sparkles,
  Search,
  Layers,
  IndianRupee,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';
import { AnimatedBusinessBackground } from './AnimatedBusinessBackground';
import { HeroAnalyticsComposition } from './HeroAnalyticsComposition';
import { ProductIntroSplash } from './ProductIntroSplash';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage } from '../i18n/types';
import { BrandLogo } from './BrandLogo';
import { PublicFooter } from './PublicFooter';

interface LandingPageProps {
  onNavigateToApp: (scenario?: 'dairy' | 'tailoring' | 'retail') => void;
  onNavigateToAdmin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToApp,
  onNavigateToAdmin
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

  /* =========================================================================
     ANIMATION VARIANTS (STAGGERED CHOREOGRAPHY)
     ========================================================================= */
  const sectionHeaderVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.12 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  const capabilities = [
    {
      id: 'market',
      title: t('cap.market.title'),
      desc: t('cap.market.desc'),
      detail: t('cap.market.detail'),
      iconType: 'market',
      color: 'blue'
    },
    {
      id: 'feasibility',
      title: t('cap.feasibility.title'),
      desc: t('cap.feasibility.desc'),
      detail: t('cap.feasibility.detail'),
      iconType: 'feasibility',
      color: 'indigo'
    },
    {
      id: 'finance',
      title: t('cap.finance.title'),
      desc: t('cap.finance.desc'),
      detail: t('cap.finance.detail'),
      iconType: 'finance',
      color: 'amber'
    },
    {
      id: 'guidance',
      title: t('cap.guidance.title'),
      desc: t('cap.guidance.desc'),
      detail: t('cap.guidance.detail'),
      iconType: 'guidance',
      color: 'emerald'
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
      <div className="relative z-50 w-full h-1 bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600" />

      {/* =========================================================================
          LANDING HEADER
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <BrandLogo size="md" />

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

      {/* =========================================================================
          TWO-COLUMN MODERN BUSINESS-ANALYTICS HERO SECTION
          ========================================================================= */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 flex items-center min-h-[640px]">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT COLUMN: HIGH-IMPACT HEADLINE & PRIMARY CTA */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 text-left">
            {/* Subtle Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-900 border border-blue-200/90 shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Hyper-Local Business Intelligence Platform</span>
            </motion.div>

            {/* Large Bold Hero Headline */}
            <motion.h1
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-[1.08]"
            >
              Understand Your Local Business.{' '}
              <span className="text-blue-700 block mt-1">
                Plan Smarter. Grow Confidently.
              </span>
            </motion.h1>

            {/* Supporting Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl"
            >
              UDYORA combines local business intelligence, financial planning, risk analysis and evidence-backed guidance to help rural and semi-urban entrepreneurs make better-informed decisions.
            </motion.p>

            {/* Primary Action Button with Left-to-Right Fill Sweep */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <button
                onClick={() => onNavigateToApp()}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white bg-slate-900 overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl active:scale-[0.98] cursor-pointer"
              >
                <span
                  className="absolute inset-0 w-full h-full bg-blue-800 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                  aria-hidden="true"
                />
                <span className="relative z-10 text-white">
                  START ANALYSIS
                </span>
                <ArrowRight className="relative z-10 w-4 h-4 text-white group-hover:translate-x-1.5 transition-all duration-300" />
              </button>

              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero guesswork • Instant feasibility check</span>
              </span>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: SOPHISTICATED FLOATING ANALYTICS COMPOSITION */}
          <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center">
            <HeroAnalyticsComposition />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: PRODUCT CAPABILITIES (ANIMATED CARDS, SYMBOLS & STAGGERED TEXT)
          ========================================================================= */}
      <section id="capabilities" className="relative z-10 py-20 border-t border-b border-slate-200/80 bg-slate-50/50 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Staggered Section Header */}
          <motion.div
            variants={sectionHeaderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <motion.span
              variants={itemVariants}
              className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200"
            >
              {t('cap.sectionBadge')}
            </motion.span>
            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mt-3"
            >
              {t('cap.title')}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm text-slate-600 mt-2"
            >
              {t('cap.subtitle')}
            </motion.p>
          </motion.div>

          {/* 4 Animated Capability Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.65,
                  delay: shouldReduceMotion ? 0 : idx * 0.12,
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: -4,
                        boxShadow: '0 12px 28px -6px rgba(15, 23, 42, 0.12)',
                        borderColor: '#2563eb'
                      }
                }
                className="group bg-white/95 backdrop-blur-xs border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Icon Box with Independent Idle & Hover Animations */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.55,
                      delay: shouldReduceMotion ? 0 : idx * 0.12 + 0.1,
                      ease: 'easeOut'
                    }}
                    className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 group-hover:border-blue-300 group-hover:bg-blue-50/60 transition-colors"
                  >
                    {item.iconType === 'market' && (
                      <motion.div
                        animate={shouldReduceMotion ? {} : { x: [-1.5, 1.5, -1.5] }}
                        transition={{ duration: 4.0, repeat: Infinity, ease: 'easeInOut' }}
                        className="group-hover:scale-108 group-hover:-translate-y-0.5 transition-transform duration-300"
                      >
                        <Store className="w-6 h-6 text-blue-700" />
                      </motion.div>
                    )}

                    {item.iconType === 'feasibility' && (
                      <motion.div
                        animate={shouldReduceMotion ? {} : { y: [0, -2.5, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="group-hover:scale-108 group-hover:-translate-y-0.5 transition-transform duration-300"
                      >
                        <TrendingUp className="w-6 h-6 text-indigo-700" />
                      </motion.div>
                    )}

                    {item.iconType === 'finance' && (
                      <motion.div
                        animate={shouldReduceMotion ? {} : { scale: [1, 1.06, 1] }}
                        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="group-hover:scale-108 group-hover:-translate-y-0.5 transition-transform duration-300"
                      >
                        <Calculator className="w-6 h-6 text-amber-700" />
                      </motion.div>
                    )}

                    {item.iconType === 'guidance' && (
                      <motion.div
                        animate={shouldReduceMotion ? {} : { rotate: [0, 4, 0, -4, 0] }}
                        transition={{ duration: 5.0, repeat: Infinity, ease: 'easeInOut' }}
                        className="group-hover:scale-108 group-hover:-translate-y-0.5 transition-transform duration-300"
                      >
                        <Award className="w-6 h-6 text-emerald-700" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Heading Staggered Reveal */}
                  <motion.h3
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.45,
                      delay: shouldReduceMotion ? 0 : idx * 0.12 + 0.12
                    }}
                    className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors"
                  >
                    {item.title}
                  </motion.h3>

                  {/* Description Staggered Reveal */}
                  <motion.p
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.45,
                      delay: shouldReduceMotion ? 0 : idx * 0.12 + 0.18
                    }}
                    className="text-xs text-slate-600 mt-1.5 leading-relaxed"
                  >
                    {item.desc}
                  </motion.p>
                </div>

                {/* Supporting Info Staggered Reveal */}
                <motion.div
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: shouldReduceMotion ? 0 : idx * 0.12 + 0.24
                  }}
                  className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-800"
                >
                  {item.detail}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 7-STEP MULTI-AGENT WORKFLOW (CONNECTED DATA TRAIL ANIMATION)
          ========================================================================= */}
      <section id="how-it-works" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Staggered Section Header */}
          <motion.div
            variants={sectionHeaderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <motion.span
              variants={itemVariants}
              className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200"
            >
              {t('workflow.badge')}
            </motion.span>
            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mt-3"
            >
              {t('workflow.title')}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm text-slate-600 mt-2"
            >
              {t('workflow.subtitle')}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : idx * 0.08 }}
                whileHover={shouldReduceMotion ? {} : { y: -3, borderColor: '#2563eb' }}
                className="relative border border-slate-200 rounded-2xl p-5 bg-white/90 backdrop-blur-xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-black text-blue-700">
                      STEP {s.step}
                    </span>
                    <motion.span
                      animate={
                        shouldReduceMotion
                          ? {}
                          : {
                              scale: [1, 1.4, 1],
                              opacity: [0.4, 0.9, 0.4]
                            }
                      }
                      transition={{
                        duration: 3.0,
                        repeat: Infinity,
                        delay: idx * 0.35,
                        ease: 'easeInOut'
                      }}
                      className="w-2.5 h-2.5 rounded-full bg-blue-600"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: RESPONSIBLE AI EVIDENCE AUDIT PRINCIPLES
          ========================================================================= */}
      <section id="evidence" className="relative z-10 py-20 bg-slate-950 text-white border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Staggered Section Header */}
          <motion.div
            variants={sectionHeaderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <motion.span
              variants={itemVariants}
              className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-900/60 px-3 py-1 rounded-full border border-blue-700"
            >
              {t('evidence.badge')}
            </motion.span>
            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-3"
            >
              {t('evidence.title')}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm text-slate-300 mt-2"
            >
              {t('evidence.desc')}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. VERIFIED with check pulse */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-md hover:border-emerald-700/60 transition-colors"
            >
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
            </motion.div>

            {/* 2. ESTIMATED with slow breathing dot */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-md hover:border-amber-700/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">{t('evidence.estimated.title')}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('evidence.estimated.desc')}
              </p>
            </motion.div>

            {/* 3. INSUFFICIENT DATA with soft ring */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-md hover:border-rose-700/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <h3 className="text-base font-bold text-white">{t('evidence.insufficient.title')}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('evidence.insufficient.desc')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL LANDING CTA BANNER (STAGGERED REVEAL)
          ========================================================================= */}
      <section className="relative z-10 py-16 bg-blue-50/40 border-t border-slate-200">
        <motion.div
          variants={sectionHeaderVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="max-w-4xl mx-auto px-4 text-center space-y-5"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl font-extrabold text-slate-950"
          >
            {t('cta.title')}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-sm text-slate-600 max-w-xl mx-auto"
          >
            {t('cta.subtitle')}
          </motion.p>
          <motion.div variants={itemVariants} className="pt-2">
            <button
              onClick={() => onNavigateToApp()}
              className="group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-xl text-sm font-bold text-white bg-slate-900 overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
            >
              <span
                className="absolute inset-0 w-full h-full bg-blue-900 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                aria-hidden="true"
              />
              <span className="relative z-10 text-white">
                START ANALYSIS
              </span>
              <ArrowRight className="relative z-10 w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* REDESIGNED PUBLIC PRODUCT FOOTER WITH SUBTLE ADMIN LINK */}
      <PublicFooter
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateToApp={() => onNavigateToApp()}
        onNavigateToAdmin={onNavigateToAdmin}
      />
    </div>
  );
};
