/**
 * UDYORA - Hyper-Local Business Intelligence for Rural Entrepreneurs
 * 
 * Routes:
 * /    -> UDYORA Public Landing Page
 * /app -> UDYORA Functional Business Intelligence Application
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  FileText,
  Building2,
  ShieldCheck,
  MapPin,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Award,
  Calculator,
  Store,
  Database,
  Printer
} from 'lucide-react';
import { UserBusinessInput, CompleteAnalysisReport, AgentStepStatus } from './types';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { BusinessInputForm } from './components/BusinessInputForm';
import { AgentExecutionProgress } from './components/AgentExecutionProgress';
import { ResultDashboard } from './components/ResultDashboard';
import { PrintableReport } from './components/PrintableReport';
import { executeMultiAgentWorkflow } from './agents/orchestrator';
import { runFinancialUnitTests } from './tests/financialCalculator.test';
import { getTranslations } from './utils/translations';

function getRouteFromLocation(): 'landing' | 'app' {
  if (typeof window === 'undefined') return 'landing';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  
  if (
    path.startsWith('/app') ||
    hash.startsWith('#/app') ||
    hash === '#app' ||
    searchParams.get('route') === 'app' ||
    searchParams.get('view') === 'app'
  ) {
    return 'app';
  }
  return 'landing';
}

export default function App() {
  // Robust initial route detection across pathname, hash, and search query
  const [currentRoute, setCurrentRoute] = useState<'landing' | 'app'>(getRouteFromLocation);
  const [currentScreen, setCurrentScreen] = useState<'form' | 'executing' | 'result'>('form');
  const [agentSteps, setAgentSteps] = useState<AgentStepStatus[]>([]);
  const [activeStepId, setActiveStepId] = useState<string>('evidence');
  const [analysisReport, setAnalysisReport] = useState<CompleteAnalysisReport | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  const t = getTranslations(currentLanguage);

  // Handle browser URL synchronization (pushState / popstate / hashchange)
  useEffect(() => {
    const handleNavigationEvent = () => {
      setCurrentRoute(getRouteFromLocation());
    };

    window.addEventListener('popstate', handleNavigationEvent);
    window.addEventListener('hashchange', handleNavigationEvent);
    return () => {
      window.removeEventListener('popstate', handleNavigationEvent);
      window.removeEventListener('hashchange', handleNavigationEvent);
    };
  }, []);

  // Run automated unit tests on mount to ensure deterministic math accuracy
  useEffect(() => {
    const testResult = runFinancialUnitTests();
    if (testResult.passed) {
      console.log('✅ [UDYORA Unit Tests] All 9 Deterministic Financial Calculations Passed:');
      testResult.logs.forEach((log) => console.log(log));
    } else {
      console.error('❌ [UDYORA Unit Tests] Test Failures Detected:', testResult.logs);
    }
  }, []);

  const navigateToRoute = (route: 'landing' | 'app', urlPath: string = route === 'app' ? '/app' : '/') => {
    setCurrentRoute(route);
    try {
      if (window.location.pathname !== urlPath) {
        window.history.pushState({ route }, '', urlPath);
      }
    } catch {
      // Fallback to hash navigation if pushState is restricted
      window.location.hash = route === 'app' ? '/app' : '/';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToApp = (scenario?: 'dairy' | 'tailoring' | 'retail') => {
    navigateToRoute('app', '/app');
    setCurrentScreen('form');
  };

  const handleNavigateHome = () => {
    navigateToRoute('landing', '/');
  };

  const handleFormSubmit = async (input: UserBusinessInput) => {
    setCurrentScreen('executing');
    try {
      const report = await executeMultiAgentWorkflow(input, (steps, activeId) => {
        setAgentSteps(steps);
        if (activeId) setActiveStepId(activeId);
      });
      setAnalysisReport(report);
      setCurrentScreen('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error during multi-agent analysis:', err);
      setCurrentScreen('form');
    }
  };

  const handleReset = () => {
    setAnalysisReport(null);
    setCurrentScreen('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  // ROUTE 1: PUBLIC LANDING PAGE (/)
  if (currentRoute === 'landing') {
    return (
      <LandingPage
        onNavigateToApp={handleNavigateToApp}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />
    );
  }

  // ROUTE 2: FUNCTIONAL UDYORA APPLICATION (/app)
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-100 selection:text-blue-950">
      {/* Printable View (Rendered only during browser print) */}
      {analysisReport && (
        <div className="hidden print:block bg-white min-h-screen">
          <PrintableReport report={analysisReport} />
        </div>
      )}

      {/* Screen View (Hidden during print) */}
      <div className="print:hidden flex flex-col flex-1">
        {/* Main Application Header with Home navigation */}
        <Header
          onNavigateHome={handleNavigateHome}
          onReset={analysisReport ? handleReset : undefined}
          onPrint={analysisReport ? handlePrint : undefined}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          hasResult={!!analysisReport}
          isAppRoute={true}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* SCREEN 1: GUIDED INPUT & HERO */}
          {currentScreen === 'form' && (
            <div className="space-y-8 animate-fadeIn">
              {/* App Top Intro Banner */}
              <div className="text-center max-w-3xl mx-auto pt-2 pb-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-100/70 text-blue-900 border border-blue-200 mb-3.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>{t.evidenceAwareBadge}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
                  {t.appTitle}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-2.5 max-w-2xl mx-auto leading-relaxed">
                  {t.appSubtitle}
                </p>
              </div>

              {/* Input Form with 1-Click Demo Presets */}
              <BusinessInputForm
                onSubmit={handleFormSubmit}
                isLoading={false}
                currentLanguage={currentLanguage}
              />
            </div>
          )}

          {/* SCREEN 2: MULTI-AGENT EXECUTION PROGRESS */}
          {currentScreen === 'executing' && (
            <div className="py-8 animate-fadeIn">
              <AgentExecutionProgress
                steps={agentSteps}
                currentActiveId={activeStepId}
              />
            </div>
          )}

          {/* SCREEN 3: RESULT DASHBOARD */}
          {currentScreen === 'result' && analysisReport && (
            <div className="animate-fadeIn">
              <ResultDashboard
                report={analysisReport}
                onReset={handleReset}
                onPrint={handlePrint}
                currentLanguage={currentLanguage}
              />
            </div>
          )}
        </main>

        {/* Global Public Service Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">
                U
              </div>
              <span className="font-bold text-slate-800">UDYORA</span>
              <span>— {t.tagline}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Deterministic Financial Engine</span>
              <span>•</span>
              <span>Rule-based Schemes</span>
              <span>•</span>
              <span>{t.developedBy}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
