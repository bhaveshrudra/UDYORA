import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';
import { UserBusinessInput, CompleteAnalysisReport, AgentStepStatus } from './types';
import { DEMO_LOCATIONS } from './data/locations';
import { Header } from './components/Header';
import { BusinessInputForm } from './components/BusinessInputForm';
import { AgentExecutionProgress } from './components/AgentExecutionProgress';
import { ResultDashboard } from './components/ResultDashboard';
import { PrintableReport } from './components/PrintableReport';
import { LandingPage } from './components/LandingPage';
import { AdvisorChatbot } from './components/AdvisorChatbot';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AnimatedBusinessBackground } from './components/AnimatedBusinessBackground';
import { executeMultiAgentWorkflow } from './agents/orchestrator';
import { useLanguage } from './i18n/LanguageContext';

export function App() {
  const { t, language } = useLanguage();
  const appContainerRef = useRef<HTMLDivElement>(null);

  // Simple client-side path router: 'landing' (/) vs 'app' (/app)
  const [currentRoute, setCurrentRoute] = useState<'landing' | 'app'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/app' || path.startsWith('/app/')) return 'app';
    }
    return 'landing';
  });

  const [currentScreen, setCurrentScreen] = useState<'form' | 'executing' | 'result'>('form');
  const [currentInput, setCurrentInput] = useState<UserBusinessInput | undefined>(undefined);
  const [analysisReport, setAnalysisReport] = useState<CompleteAnalysisReport | null>(null);

  // Multi-agent execution steps
  const [agentSteps, setAgentSteps] = useState<AgentStepStatus[]>([
    { id: 'evidence', name: 'Evidence & Data Agent', role: 'Census & Market Data Verification', status: 'PENDING', progressPct: 0, message: 'Ready to query localized datasets' },
    { id: 'business', name: 'Business Analysis Agent', role: 'Unit Economics & Capacity Sizing', status: 'PENDING', progressPct: 0, message: 'Waiting for evidence layer' },
    { id: 'market', name: 'Market Intelligence Agent', role: 'Local Demand & Infrastructure Proximity', status: 'PENDING', progressPct: 0, message: 'Waiting for business model' },
    { id: 'finance', name: 'Financial Advisor Agent', role: 'CapEx, OpEx & Debt Service Math', status: 'PENDING', progressPct: 0, message: 'Waiting for unit economics' },
    { id: 'schemes', name: 'Scheme Guidance Agent', role: 'Government Schemes Rule-Matching', status: 'PENDING', progressPct: 0, message: 'Waiting for financial sizing' },
    { id: 'risks', name: 'Risk Analysis Agent', role: 'Risk Scoring & Mitigation Planning', status: 'PENDING', progressPct: 0, message: 'Waiting for scheme & market data' },
    { id: 'aggregator', name: 'Aggregator & Validator', role: 'Synthesis & Consistency Auditing', status: 'PENDING', progressPct: 0, message: 'Waiting for all agent outputs' }
  ]);
  const [activeStepId, setActiveStepId] = useState<string>('evidence');

  // Handle browser popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/app' || path.startsWith('/app/')) {
        setCurrentRoute('app');
      } else {
        setCurrentRoute('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: 'landing' | 'app') => {
    setCurrentRoute(route);
    const targetPath = route === 'landing' ? '/' : '/app';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  const handleNavigateToApp = (_scenario?: 'dairy' | 'tailoring' | 'retail') => {
    navigateTo('app');
    setCurrentScreen('form');
  };

  const handleNavigateHome = () => {
    navigateTo('landing');
    setCurrentScreen('form');
  };

  const handleFormSubmit = async (input: UserBusinessInput) => {
    setCurrentInput(input);
    setCurrentScreen('executing');
    setAnalysisReport(null);

    // Reset steps
    setAgentSteps((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'PENDING',
        progressPct: 0,
        message: 'Queued...'
      }))
    );

    try {
      const report = await executeMultiAgentWorkflow(input, (updatedSteps, activeId) => {
        setAgentSteps([...updatedSteps]);
        if (activeId) setActiveStepId(activeId);
      });

      setAnalysisReport(report);
      setCurrentScreen('result');
    } catch (err) {
      console.error('Multi-agent analysis execution failed:', err);
      alert('An error occurred during analysis. Please try again.');
      setCurrentScreen('form');
    }
  };

  const handleReset = () => {
    setCurrentScreen('form');
    setAnalysisReport(null);
  };

  const handlePrint = () => {
    window.print();
  };

  // ROUTE 1: PUBLIC LANDING PAGE (/)
  if (currentRoute === 'landing') {
    return (
      <LandingPage
        onNavigateToApp={handleNavigateToApp}
      />
    );
  }

  // ROUTE 2: FUNCTIONAL UDYORA APPLICATION (/app)
  return (
    <div
      ref={appContainerRef}
      className="relative min-h-screen bg-slate-100/90 text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-100 selection:text-blue-950 overflow-x-hidden"
    >
      {/* Background Animated Analytics Environment */}
      <AnimatedBusinessBackground containerRef={appContainerRef} />

      {/* Printable View (Rendered only during browser print) */}
      {analysisReport && (
        <div className="hidden print:block bg-white min-h-screen">
          <PrintableReport report={analysisReport} />
        </div>
      )}

      {/* Screen View (Hidden during print) */}
      <div className="relative z-10 print:hidden flex flex-col flex-1">
        {/* Main Application Header with Home navigation */}
        <Header
          onNavigateHome={handleNavigateHome}
          onReset={analysisReport ? handleReset : undefined}
          onPrint={analysisReport ? handlePrint : undefined}
          hasResult={!!analysisReport}
          isAppRoute={true}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* SCREEN 1: GUIDED INPUT & WORKSPACE */}
          {currentScreen === 'form' && (
            <div className="space-y-6 animate-fadeIn">
              {/* App Single Primary Heading Banner (No duplicate titles) */}
              <div className="text-center max-w-3xl mx-auto pt-2 pb-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-100/80 text-blue-900 border border-blue-200 mb-3 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>{t('brand.badge')}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950">
                  Enterprise Feasibility & Advisory Assessment
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto leading-relaxed">
                  Tell us about your location, business idea, and available capital to begin your assessment.
                </p>
              </div>

              {/* Input Form with Guided 3-Numbered Sequence */}
              <BusinessInputForm
                onSubmit={handleFormSubmit}
                isLoading={false}
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

          {/* SCREEN 3: RESULT DASHBOARD PROTECTED BY ERROR BOUNDARY */}
          {currentScreen === 'result' && analysisReport && (
            <div className="animate-fadeIn">
              <ErrorBoundary
                fallbackTitle="Unable to render the advisory report."
                onReset={handleReset}
                onNavigateHome={handleNavigateHome}
              >
                <ResultDashboard
                  report={analysisReport}
                  onReset={handleReset}
                  onPrint={handlePrint}
                />
              </ErrorBoundary>
            </div>
          )}
        </main>

        {/* Floating UDYORA AI Business Advisor Chatbot with Voice Interaction */}
        <AdvisorChatbot
          currentInput={currentInput}
          currentLocation={analysisReport?.location}
          analysisReport={analysisReport}
          onUpdateInput={(updated) => {
            if (currentInput) {
              setCurrentInput({ ...currentInput, ...updated });
            }
          }}
          onTriggerAnalysis={() => {
            if (currentInput) {
              handleFormSubmit(currentInput);
            }
          }}
          onResetAnalysis={handleReset}
        />

        {/* Global Public Service Footer */}
        <footer className="border-t border-slate-200/80 bg-white/95 backdrop-blur-xs py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">
                U
              </div>
              <span className="font-bold text-slate-800">UDYORA</span>
              <span>— {t('brand.tagline')}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Deterministic Math</span>
              <span>•</span>
              <span>Multi-Agent Synthesis</span>
              <span>•</span>
              <span>{t('brand.developedBy')}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
export default App;
