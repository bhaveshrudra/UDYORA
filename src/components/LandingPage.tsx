import React, { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion, Variants, AnimatePresence, useScroll, useSpring } from 'motion/react';
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
  Info,
  Menu,
  X
} from 'lucide-react';
import { AnimatedBusinessBackground } from './AnimatedBusinessBackground';
import { HeroAnalyticsComposition } from './HeroAnalyticsComposition';
import { useLanguage } from '../i18n/LanguageContext';
import { BrandLogo } from './BrandLogo';
import { PublicFooter } from './PublicFooter';
import { HeaderLanguageSelector } from './HeaderLanguageSelector';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Scroll Progress Indicator Tracker
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001
  });

  // Track active section via IntersectionObserver for scroll-active navigation
  useEffect(() => {
    const sectionIds = ['capabilities', 'how-it-works', 'evidence'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // Smooth scroll helper for landing nav links
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* =========================================================================
     ANIMATION VARIANTS (STAGGERED CHOREOGRAPHY)
     ========================================================================= */
  const sectionHeaderVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.12 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
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
      className="relative min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-950 overflow-x-hidden w-full"
    >
      {/* Scroll Progress Indicator Bar at Very Top of Viewport */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-500 origin-left z-50 pointer-events-none"
      />

      {/* 1. Full-Page Continuous Business Intelligence Background Animation Layer */}
      <AnimatedBusinessBackground containerRef={landingRef} />

      {/* =========================================================================
          LANDING HEADER
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <BrandLogo size="md" />

          {/* Desktop Navigation with Active Scroll Highlighting */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-600">
            <button
              onClick={() => scrollToSection('capabilities')}
              className={`relative hover:text-blue-900 transition-colors cursor-pointer py-2 ${
                activeSection === 'capabilities' ? 'text-blue-900 font-extrabold' : ''
              }`}
            >
              <span>{t('nav.capabilities')}</span>
              {activeSection === 'capabilities' && (
                <motion.div
                  layoutId="activeNavUnderline"
                  className="absolute -bottom-0.5 inset-x-0 h-0.5 bg-blue-700 rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`relative hover:text-blue-900 transition-colors cursor-pointer py-2 ${
                activeSection === 'how-it-works' ? 'text-blue-900 font-extrabold' : ''
              }`}
            >
              <span>{t('nav.howItWorks')}</span>
              {activeSection === 'how-it-works' && (
                <motion.div
                  layoutId="activeNavUnderline"
                  className="absolute -bottom-0.5 inset-x-0 h-0.5 bg-blue-700 rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>

            <button
              onClick={() => scrollToSection('evidence')}
              className={`relative hover:text-blue-900 transition-colors cursor-pointer py-2 ${
                activeSection === 'evidence' ? 'text-blue-900 font-extrabold' : ''
              }`}
            >
              <span>{t('nav.evidence')}</span>
              {activeSection === 'evidence' && (
                <motion.div
                  layoutId="activeNavUnderline"
                  className="absolute -bottom-0.5 inset-x-0 h-0.5 bg-blue-700 rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          </nav>

          {/* Right Header Controls: Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Global Language Selector Dropdown with hover/click */}
            <HeaderLanguageSelector align="right" showCodeOnlyOnMobile={false} />

            {/* Interactive Header LAUNCH APP button */}
            <button
              onClick={() => onNavigateToApp()}
              className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 overflow-hidden transition-all duration-300 shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer min-h-[40px]"
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

          {/* Mobile Right Controls: Directly Visible Language Selector [ EN ▼ ] + Hamburger Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <HeaderLanguageSelector align="right" showCodeOnlyOnMobile={true} />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 active:bg-slate-200 transition-colors cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Slide-Down Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-5 py-6 space-y-5 overflow-hidden shadow-lg"
            >
              <nav className="flex flex-col space-y-3 text-sm font-bold text-slate-800">
                <button
                  onClick={() => scrollToSection('capabilities')}
                  className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <span>{t('nav.capabilities')}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <span>{t('nav.howItWorks')}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => scrollToSection('evidence')}
                  className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <span>{t('nav.evidence')}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </nav>

              {/* Language Selection Chips on Mobile */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Language Preference
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold text-center border transition-all ${
                        language === lang.code
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lang.nativeName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Launch App Full-Width CTA on Mobile */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToApp();
                  }}
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 flex items-center justify-center gap-2 shadow-md active:scale-[0.99] cursor-pointer"
                >
                  <span>{t('nav.launchApp')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* =========================================================================
          TWO-COLUMN MODERN BUSINESS-ANALYTICS HERO SECTION (CHOREOGRAPHED BUILD)
          ========================================================================= */}
      <section className="relative pt-8 pb-14 sm:pt-16 sm:pb-24 px-4 sm:px-6 lg:px-8 flex items-center min-h-[560px]">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* LEFT COLUMN: HIGH-IMPACT HEADLINE & PRIMARY CTA (SEQUENTIAL STAGGER) */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-5 sm:space-y-6 text-left">
            {/* Step 2: Hero Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-900 border border-blue-200/90 shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Hyper-Local Business Intelligence Platform</span>
            </motion.div>

            {/* Step 3: Large Bold Hero Headline */}
            <motion.h1
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="fluid-hero-heading font-black tracking-tight text-slate-950"
            >
              Understand Your Local Business.{' '}
              <span className="text-blue-700 block mt-1">
                Plan Smarter. Grow Confidently.
              </span>
            </motion.h1>

            {/* Step 4: Supporting Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed max-w-xl"
            >
              UDYORA combines local business intelligence, financial planning, risk analysis and evidence-backed guidance to help rural and semi-urban entrepreneurs make better-informed decisions.
            </motion.p>

            {/* Step 5: Primary Action Button with Left-to-Right Fill Sweep */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
            >
              <button
                onClick={() => onNavigateToApp()}
                className="group relative w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl text-base font-bold text-white bg-slate-900 overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl active:scale-[0.98] cursor-pointer"
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

              <span className="text-xs text-slate-500 font-semibold flex items-center justify-center sm:justify-start gap-1.5 py-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero guesswork • Instant feasibility check</span>
              </span>
            </motion.div>
          </div>

          {/* Step 6: RIGHT COLUMN: SOPHISTICATED FLOATING ANALYTICS COMPOSITION */}
          <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center w-full overflow-hidden">
            <HeroAnalyticsComposition />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: PRODUCT CAPABILITIES (SCROLL-TRIGGERED STAGGERED REVEAL)
          ========================================================================= */}
      <section id="capabilities" className="relative z-10 py-20 border-t border-b border-slate-200/80 bg-slate-50/50 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Staggered Section Header */}
          <motion.div
            variants={sectionHeaderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
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

          {/* 4 Animated Capability Cards Grid with Staggered Delays */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
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
                        boxShadow: '0 14px 30px -6px rgba(15, 23, 42, 0.12)',
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
            viewport={{ once: true, amount: 0.2 }}
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

          {/* Mobile Vertical Timeline Layout (below md) */}
          <div className="md:hidden relative pl-6 border-l-2 border-blue-600/30 space-y-4">
            {workflowSteps.map((s, idx) => (
              <motion.div
                key={`mob-step-${idx}`}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs"
              >
                <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-100 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono font-black text-blue-700">STEP {s.step}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-950">{s.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Desktop Multi-column Grid (hidden on mobile) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.55, delay: shouldReduceMotion ? 0 : idx * 0.08 }}
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
            viewport={{ once: true, amount: 0.2 }}
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
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-md hover:border-emerald-700/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
                </span>
                <h3 className="text-base font-bold text-white">{t('evidence.verified.title')}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('evidence.verified.desc')}
              </p>
            </motion.div>

            {/* 2. ESTIMATED with slow breathing dot */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-md hover:border-amber-700/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">{t('evidence.estimated.title')}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('evidence.estimated.desc')}
              </p>
            </motion.div>

            {/* 3. INSUFFICIENT DATA with soft ring */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-md hover:border-rose-700/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
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
          viewport={{ once: true, amount: 0.25 }}
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
