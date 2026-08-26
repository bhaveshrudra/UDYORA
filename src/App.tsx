/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Compass,
  Calculator,
  Layers,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Clock,
  Info,
  Menu,
  X,
  FileText,
  Building2,
  ShieldCheck,
  MapPin,
  TrendingUp,
  HelpCircle,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import { BackgroundWatermark } from './components/BackgroundWatermark';
import { HeroWatermark } from './components/HeroWatermark';
import { ScrollProgressBar } from './components/ScrollProgressBar';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('rudrabhavesh2@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const containerStaggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const processSteps = [
    {
      step: '01',
      title: 'Profile',
      desc: 'Capture background, available capital, sector interests, and literacy preferences.',
    },
    {
      step: '02',
      title: 'Location',
      desc: 'Define target village, block, and district context.',
    },
    {
      step: '03',
      title: 'Business Idea',
      desc: 'Define initial enterprise concept.',
    },
    {
      step: '04',
      title: 'Local Intelligence',
      desc: 'Evaluate hyper-local demand patterns, supply chains, and nearby competition.',
    },
    {
      step: '05',
      title: 'Feasibility',
      desc: 'Assess viability, operational risks, seasonal dependencies, and break-even targets.',
    },
    {
      step: '06',
      title: 'Financial Planning',
      desc: 'Calculate total project cost, working capital, loan needs, and cash flow structures.',
    },
    {
      step: '07',
      title: 'Recommendation',
      desc: 'Identify relevant institutional credit schemes, subsidies, and local incubation pathways.',
    },
  ];

  const statusItems = [
    {
      module: 'Product Architecture',
      scope: 'System design, modular workflows, data pipeline specifications',
      status: 'In Progress',
      phase: 'Phase 1',
    },
    {
      module: 'User Experience',
      scope: 'Accessible low-literacy interfaces, multilingual wireframes, clean user journeys',
      status: 'In Progress',
      phase: 'Phase 1',
    },
    {
      module: 'Business Feasibility Engine',
      scope: 'Hyper-local market assessment logic, risk indices, demand estimation algorithms',
      status: 'In Development',
      phase: 'Phase 2',
    },
    {
      module: 'Financial Planning Engine',
      scope: 'Cost projection models, working capital estimators, repayment schedules',
      status: 'In Development',
      phase: 'Phase 2',
    },
    {
      module: 'Data Integration',
      scope: 'District-level economic data structures, demographic layers, local trade data',
      status: 'In Development',
      phase: 'Phase 2',
    },
    {
      module: 'AI Assistance Layer',
      scope: 'Natural language advisory generation, structured guidance, vernacular summaries',
      status: 'In Development',
      phase: 'Phase 2',
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-white text-slate-800 font-sans antialiased selection:bg-blue-100 selection:text-blue-950">
      {/* Top thin scroll progress bar */}
      <ScrollProgressBar />

      {/* Background Watermark & Faint Micro-Grid Animation */}
      <BackgroundWatermark />

      {/* Top subtle tri-color header accent band */}
      <div className="relative z-10 w-full h-1 bg-gradient-to-r from-amber-500 via-slate-200 to-emerald-600" />

      {/* MAIN HEADER */}
      <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-md bg-slate-900 flex items-center justify-center text-white font-bold text-lg tracking-wider border border-slate-700 shadow-xs">
              U
            </div>
            <div>
              <a
                href="#hero"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('hero');
                }}
                className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 hover:text-blue-900 transition-colors block"
              >
                UDYORA
              </a>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-normal leading-tight">
                Hyper-Local Business Intelligence for Rural Entrepreneurs
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-navigation" aria-label="Main Navigation" className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            {[
              { id: 'hero', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'status', label: 'Status' },
              { id: 'contact', label: 'Contact' },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => scrollToSection(nav.id)}
                className="group relative hover:text-blue-700 transition-colors cursor-pointer py-1"
              >
                {nav.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-700 transition-all duration-200 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Right Action: Coming Soon Badge / Button */}
          <div className="hidden sm:flex items-center gap-3">
            <span
              id="coming-soon-header-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200"
            >
              <motion.span
                animate={shouldReduceMotion ? {} : { opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 h-1.5 rounded-full bg-blue-600"
              />
              Coming Soon
            </span>
          </div>

          {/* Mobile menu button */}
          <button
            id="mobile-menu-toggle-btn"
            type="button"
            aria-label="Toggle Navigation Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 focus:outline-hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-md overflow-hidden"
          >
            <button
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('status')}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Development Status
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Contact
            </button>
          </motion.div>
        )}
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main id="main-content" className="relative z-10 flex-1">
        {/* HERO / FORMAL NOTICE SECTION */}
        <section id="hero" className="relative border-b border-slate-200 bg-slate-50/70 py-12 sm:py-16 overflow-hidden">
          {/* Subtle animated letter-by-letter watermark & uploaded graphic behind hero content */}
          <HeroWatermark />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
            
            {/* Header info badge & Title Stagger Sequence */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerStaggerVariants}
              className="text-center mb-6"
            >
              {/* Main Product Title */}
              <motion.h1
                id="hero-title"
                variants={fadeInVariants}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
              >
                UDYORA
              </motion.h1>
              <motion.p
                id="hero-tagline"
                variants={fadeInVariants}
                className="mt-2 text-base sm:text-lg font-semibold text-blue-900 max-w-2xl mx-auto"
              >
                Hyper-Local Business Intelligence for Rural Entrepreneurs
              </motion.p>

              {/* Short Description */}
              <motion.p
                id="hero-description"
                variants={fadeInVariants}
                className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto"
              >
                An intelligent platform designed to help rural and semi-urban entrepreneurs understand local opportunities, assess business feasibility, and plan their finances with greater confidence.
              </motion.p>
            </motion.div>

            {/* FORMAL NOTICE BOX */}
            <motion.div
              id="maintenance-notice-panel"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 shadow-xs relative overflow-hidden"
            >
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerStaggerVariants}
              >
                {/* Notice top bar */}
                <motion.div variants={fadeInVariants} className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                      !
                    </span>
                    <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                      Official Notice • Development Phase
                    </span>
                  </div>
                </motion.div>

                {/* Notice Heading & Text */}
                <motion.div variants={fadeInVariants} className="text-center py-2">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-slate-100 text-slate-700 mb-3 border border-slate-200">
                    <Building2 className="w-6 h-6 text-slate-700" />
                  </div>
                  <h2 id="notice-heading" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    WEBSITE UNDER DEVELOPMENT
                  </h2>
                  <p id="notice-body" className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
                    UDYORA is currently being built. Our team is working on an intelligent business advisory platform for rural and semi-urban entrepreneurs.
                  </p>
                </motion.div>

                {/* SYSTEM STATUS BADGE & PROGRESS INDICATOR */}
                <motion.div variants={fadeInVariants} id="status-progress-card" className="mt-6 pt-5 border-t border-slate-200 bg-slate-50/80 rounded-md p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        SYSTEM STATUS
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        {/* Slow gentle breathing status pulse */}
                        <motion.span
                          animate={
                            shouldReduceMotion
                              ? {}
                              : {
                                  scale: [1, 1.35, 1],
                                  opacity: [0.75, 1, 0.75],
                                }
                          }
                          transition={{
                            duration: 2.6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="w-2 h-2 rounded-full bg-emerald-600"
                        />
                        Under Development
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Target: Core Module Integration
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
                      <span>Active Prototype Build Progress</span>
                      <span className="font-semibold text-slate-900">Phase 1 & 2 in Progress</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '60%' }}
                        transition={{ duration: 1.1, delay: 0.45, ease: 'easeOut' }}
                        className="h-full bg-blue-700 rounded-full"
                      />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Architecture Design ✓</span>
                      <span className="font-semibold text-blue-900">Engine Development (Active)</span>
                      <span>Evaluation & Release</span>
                    </div>
                  </div>
                </motion.div>

                {/* Launching Soon Footer inside card */}
                <motion.div variants={fadeInVariants} className="mt-5 text-center">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Clock className="w-4 h-4 text-blue-700" />
                    Launching Soon
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    The complete advisory interface and intelligence modules will be deployed once core verification is complete.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>

          </div>
        </section>

        {/* PROJECT OVERVIEW: WHAT IS UDYORA? */}
        <section id="about" className="py-14 sm:py-18 bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            
            {/* Section Header */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeInVariants}
              className="max-w-3xl mb-10"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Product Architecture
              </span>
              <h2 id="about-heading" className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
                What is UDYORA?
              </h2>
              <p id="about-description" className="mt-3 text-base text-slate-700 leading-relaxed">
                UDYORA aims to help rural micro-entrepreneurs evaluate a business idea using local context, available capital, financial planning and relevant support pathways before investing or borrowing.
              </p>
            </motion.div>

            {/* THREE INFORMATION BLOCKS (Staggered Animation) */}
            <motion.div
              id="feature-blocks-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={containerStaggerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              
              {/* BLOCK 1 */}
              <motion.div
                id="block-local-feasibility"
                variants={cardVariants}
                className="bg-slate-50/70 border border-slate-300 rounded-lg p-6 hover:border-slate-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-md bg-white border border-slate-300 flex items-center justify-center text-blue-900 mb-4 shadow-2xs">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
                  Local Business Feasibility
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Understand local market conditions, opportunity areas, competition, potential risks and business feasibility.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center text-xs font-medium text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mr-2"></span>
                  Hyper-local market data modeling
                </div>
              </motion.div>

              {/* BLOCK 2 */}
              <motion.div
                id="block-financial-planning"
                variants={cardVariants}
                className="bg-slate-50/70 border border-slate-300 rounded-lg p-6 hover:border-slate-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-md bg-white border border-slate-300 flex items-center justify-center text-blue-900 mb-4 shadow-2xs">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
                  Financial Planning
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Understand project cost, financing requirements, repayment planning and financial structure.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center text-xs font-medium text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mr-2"></span>
                  Structured capital & debt estimates
                </div>
              </motion.div>

              {/* BLOCK 3 */}
              <motion.div
                id="block-support-guidance"
                variants={cardVariants}
                className="bg-slate-50/70 border border-slate-300 rounded-lg p-6 hover:border-slate-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-md bg-white border border-slate-300 flex items-center justify-center text-blue-900 mb-4 shadow-2xs">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
                  Support & Scheme Guidance
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Identify relevant support and financing pathways based on the entrepreneur’s situation.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center text-xs font-medium text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mr-2"></span>
                  Credit scheme & subsidy alignment
                </div>
              </motion.div>

            </motion.div>

          </div>
        </section>

        {/* HOW IT WILL WORK */}
        <section id="how-it-works" className="py-14 sm:py-18 bg-slate-50/60 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            
            {/* Section Header */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeInVariants}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                System Workflow
              </span>
              <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
                How It Will Work
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                A structured, step-by-step guidance pipeline designed specifically for rural micro-entrepreneurs.
              </p>
            </motion.div>

            {/* PROCESS DIAGRAM (Sequential Animated Steps) */}
            <motion.div
              id="process-diagram"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={containerStaggerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {processSteps.map((item, idx) => (
                <motion.div
                  key={item.step}
                  id={`process-step-${idx + 1}`}
                  variants={cardVariants}
                  className="bg-white border border-slate-300 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-slate-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-300">
                        {item.step}
                      </span>
                      {idx < processSteps.length - 1 && (
                        <span className="text-slate-300 text-xs font-mono hidden lg:inline">
                          Step {idx + 1} of {processSteps.length} →
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Input & Analysis Stage</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Summary note under diagram */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInVariants}
              className="mt-10 text-center max-w-2xl mx-auto bg-white border border-slate-200 rounded-md p-4 shadow-2xs"
            >
              <p id="process-summary-note" className="text-sm font-medium text-slate-800">
                “UDYORA is designed to transform a complex business-planning process into a simple guided experience.”
              </p>
            </motion.div>

          </div>
        </section>

        {/* CURRENT DEVELOPMENT STATUS */}
        <section id="status" className="py-14 sm:py-18 bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            
            {/* Section Header */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeInVariants}
              className="mb-8"
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Engineering Ledger
                </span>
              </div>
              <h2 id="status-heading" className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
                Development Status
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Current progress across core technical workstreams.
              </p>
            </motion.div>

            {/* PROFESSIONAL STATUS TABLE */}
            <motion.div
              id="development-status-table-container"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeInVariants}
              className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs"
            >
              <div className="overflow-x-auto">
                <table id="development-status-table" className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <th className="py-3 px-4 sm:px-6">Module / Workstream</th>
                      <th className="py-3 px-4 hidden md:table-cell">Technical Scope</th>
                      <th className="py-3 px-4 text-center">Development Phase</th>
                      <th className="py-3 px-4 sm:px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {statusItems.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                          {item.module}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 hidden md:table-cell">
                          {item.scope}
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs font-mono text-slate-600">
                          {item.phase}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                              item.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-800 border border-amber-300'
                                : 'bg-blue-50 text-blue-800 border border-blue-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.status === 'In Progress' ? 'bg-amber-600' : 'bg-blue-600'
                              }`}
                            ></span>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span>All workstreams are governed by technical milestones.</span>
                <span className="font-medium text-slate-700">Last Synced: Development Cycle</span>
              </div>
            </motion.div>

          </div>
        </section>

        {/* WHY WE ARE BUILDING IT / OUR OBJECTIVE */}
        <section id="objective" className="py-14 sm:py-18 bg-slate-50/70 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-8">
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeInVariants}
              className="bg-white border border-slate-300 rounded-lg p-6 sm:p-10 shadow-2xs"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block w-2.5 h-2.5 bg-blue-800 rounded-xs"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Project Mission
                </span>
              </div>

              <h2 id="objective-heading" className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Our Objective
              </h2>

              <p id="objective-text" className="mt-4 text-base sm:text-lg text-slate-700 leading-relaxed">
                Many rural and first-time entrepreneurs make important business decisions with limited access to localized market information, financial planning tools and structured guidance. UDYORA is being developed to make these decisions more informed, transparent and accessible.
              </p>

              <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <div className="text-xs font-bold text-slate-900">1. Informed Decisions</div>
                  <div className="text-xs text-slate-600 mt-1">Ground business choices in actual district demand.</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <div className="text-xs font-bold text-slate-900">2. Transparent Planning</div>
                  <div className="text-xs text-slate-600 mt-1">De-risk capital expenditure and loan commitments.</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <div className="text-xs font-bold text-slate-900">3. Accessible Guidance</div>
                  <div className="text-xs text-slate-600 mt-1">Provide intuitive advice for first-time founders.</div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* TEAM INQUIRIES & CONTACT SECTION */}
        <section id="contact" className="py-12 sm:py-16 bg-slate-50/60 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeInVariants}
              className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Contact Us
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Team Inquiries
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-lg">
                  For any inquiries regarding the development of UDYORA, please reach out to the development team.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedEmail ? 'Email Copied!' : 'Copy Team Email'}
                </button>
                <a
                  href="mailto:rudrabhavesh2@gmail.com"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-800 rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  <Mail className="w-4 h-4 text-slate-600" />
                  Direct Email
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* RESTRAINED COMING SOON / BACK TO TOP SECTION */}
        <section id="coming-soon" className="py-14 sm:py-20 bg-white text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInVariants}
            className="max-w-3xl mx-auto px-4 sm:px-8"
          >
            
            <span className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-300 mb-3">
              COMING SOON
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              UDYORA
            </h2>

            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              UDYORA is being actively developed. The full platform will be revealed once the core modules are ready.
            </p>

            <div className="mt-8">
              <button
                id="back-to-top-button"
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
                Back to Top
              </button>
            </div>

          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="main-footer" className="relative z-10 bg-slate-900 text-slate-300 border-t border-slate-800 pt-10 pb-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            {/* Column 1: Brand & Tagline */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-6 h-6 rounded-xs bg-white text-slate-900 font-bold flex items-center justify-center text-xs">
                  U
                </div>
                <span className="text-lg font-bold text-white tracking-tight">UDYORA</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Hyper-Local Business Intelligence for Rural Entrepreneurs
              </p>
              <div className="mt-3 text-xs text-slate-400">
                A digital public-service platform.
              </div>
            </div>

            {/* Column 2: Quick Navigation */}
            <div>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-2">
                Index
              </span>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li>
                  <button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors cursor-pointer">
                    Home / Notice
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors cursor-pointer">
                    What is UDYORA?
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors cursor-pointer">
                    How It Will Work
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('status')} className="hover:text-white transition-colors cursor-pointer">
                    Development Status
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-2">
                Connect
              </span>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li>
                  <a href="mailto:rudrabhavesh2@gmail.com" className="hover:text-white transition-colors">
                    Contact Team
                  </a>
                </li>
                <li>
                  <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors cursor-pointer">
                    Support / Inquiries
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Safety Disclaimer */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              UDYORA © 2026
            </div>
            <div className="text-center sm:text-right text-[11px] text-slate-500">
              Not an official Government of India portal
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}

