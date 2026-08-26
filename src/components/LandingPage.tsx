import React, { useRef } from 'react';
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
import { BackgroundWatermark } from './BackgroundWatermark';
import { HeroWatermark } from './HeroWatermark';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage } from '../i18n/types';

interface LandingPageProps {
  onNavigateToApp: (scenario?: 'dairy' | 'tailoring' | 'retail') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToApp
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

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
    <div className="relative min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-950">
      {/* Background Watermarks & Grid */}
      <BackgroundWatermark />

      {/* Top Header Accent Band */}
      <div className="relative z-50 w-full h-1 bg-gradient-to-r from-amber-500 via-slate-200 to-emerald-600" />

      {/* LANDING HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
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

          {/* Language Selector & Launch App Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-hidden cursor-pointer"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onNavigateToApp()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 transition-all shadow-xs hover:shadow-sm cursor-pointer"
            >
              <span>{t('nav.launchApp')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN HERO SECTION */}
      <section
        ref={heroRef}
        className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden flex items-center justify-center min-h-[580px] sm:min-h-[640px]"
      >
        {/* Animated Background Watermark: HTML Text U-D-Y-O-R-A with subtle opacity */}
        <HeroWatermark containerRef={heroRef} />

        {/* Foreground Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Subtle Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200/80 shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>{t('brand.tagline')}</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-950"
          >
            {t('hero.title')}
          </motion.h1>

          {/* Supporting Statement */}
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            {t('hero.supporting')}
          </motion.p>

          {/* Call-To-Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4"
          >
            <button
              onClick={() => onNavigateToApp()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-blue-900 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>{t('nav.getStarted')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateToApp('dairy')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 transition-all shadow-xs hover:shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-700" />
              <span>{t('nav.exploreDemo')}</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 1: PRODUCT CAPABILITIES */}
      <section id="capabilities" className="py-20 bg-slate-50/80 border-t border-b border-slate-200">
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
                className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-950">
                    {item.title}
                  </h3>
                  <p className="text-sm font-semibold text-slate-800 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {t('workflow.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mt-3">
              {t('workflow.title')}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {t('workflow.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={`p-5 rounded-2xl border ${
                  idx === workflowSteps.length - 1
                    ? 'bg-slate-900 text-white border-slate-800 sm:col-span-2 lg:col-span-1 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-mono font-black ${
                    idx === workflowSteps.length - 1 ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    STEP {step.step}
                  </span>
                  <ChevronRight className={`w-4 h-4 ${
                    idx === workflowSteps.length - 1 ? 'text-slate-600' : 'text-slate-300'
                  }`} />
                </div>
                <h3 className="font-bold text-sm leading-snug">
                  {step.title}
                </h3>
                <p className={`text-xs mt-1.5 leading-relaxed ${
                  idx === workflowSteps.length - 1 ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: RESPONSIBLE AI / EVIDENCE-LED GUIDANCE */}
      <section id="evidence" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-950 px-3 py-1 rounded-full border border-blue-800">
              {t('evidence.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t('evidence.title')}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {t('evidence.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {/* VERIFIED */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 text-center space-y-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">
                {t('evidence.verified.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('evidence.verified.desc')}
              </p>
            </div>

            {/* ESTIMATED */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 text-center space-y-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
                {t('evidence.estimated.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('evidence.estimated.desc')}
              </p>
            </div>

            {/* INSUFFICIENT DATA */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 text-center space-y-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-rose-400">
                {t('evidence.insufficient.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('evidence.insufficient.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FINAL CTA */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            {t('cta.title')}
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigateToApp()}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-blue-900 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>{t('cta.button')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
              U
            </div>
            <div>
              <span className="font-bold text-slate-900">{t('brand.name')}</span>
              <span className="ml-2 text-slate-500">{t('brand.tagline')}</span>
            </div>
          </div>
          <div className="text-slate-500">
            <span>{t('brand.developedBy')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
