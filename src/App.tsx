import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';
import { UserBusinessInput, CompleteAnalysisReport, AgentStepStatus } from './types';
import { Header } from './components/Header';
import { BusinessInputForm } from './components/BusinessInputForm';
import { AgentExecutionProgress } from './components/AgentExecutionProgress';
import { ResultDashboard } from './components/ResultDashboard';
import { PrintableReport } from './components/PrintableReport';
import { LandingPage } from './components/LandingPage';
import { AdvisorChatbot } from './components/AdvisorChatbot';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AnimatedBusinessBackground } from './components/AnimatedBusinessBackground';
import { StartupLanguageGate } from './components/StartupLanguageGate';
import { ProductIntroSplash } from './components/ProductIntroSplash';
import { PublicFooter } from './components/PublicFooter';
import { executeMultiAgentWorkflow } from './agents/orchestrator';
import { useLanguage } from './i18n/LanguageContext';

// Admin Imports
import { AdminUser, getAdminSession, logoutAdmin } from './services/adminAuthService';
import { AdminLayout, AdminSubRoute } from './components/admin/AdminLayout';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import {
  AdminLocationsView,
  AdminBusinessesView,
  AdminSchemesView,
  AdminEvidenceView,
  AdminFinancialRulesView,
  AdminUsersView,
  AdminAssessmentsView,
  AdminTranslationsView,
  AdminAuditLogsView,
  AdminSettingsView
} from './components/admin/AdminManagementViews';
import { recordAssessment } from './services/adminDataService';

type AppRoute = 'landing' | 'app' | 'admin_login' | 'admin';

export function App() {
  const {
    t,
    language,
    startupState,
    selectLanguageAndProceed,
    completeIntro,
    resetLanguagePreference
  } = useLanguage();

  const appContainerRef = useRef<HTMLDivElement>(null);

  // Client-side path router (preserves target path across startup language gate)
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin/login') return 'admin_login';
      if (path.startsWith('/admin')) return 'admin';
      if (path === '/app' || path.startsWith('/app/')) return 'app';
    }
    return 'landing';
  });

  // Admin state
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(() => getAdminSession());
  const [adminSubRoute, setAdminSubRoute] = useState<AdminSubRoute>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.replace('/admin/', '');
      if (['locations', 'businesses', 'schemes', 'evidence', 'financial-rules', 'users', 'reports', 'translations', 'audit-logs', 'settings'].includes(p)) {
        return p as AdminSubRoute;
      }
    }
    return 'dashboard';
  });

  // Entrepreneur App state
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

  // Sync browser popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin/login') {
        setCurrentRoute('admin_login');
      } else if (path.startsWith('/admin')) {
        const session = getAdminSession();
        if (session) {
          setCurrentAdminUser(session);
          setCurrentRoute('admin');
          const sub = path.replace('/admin/', '').replace('/admin', '');
          if (sub) setAdminSubRoute((sub as AdminSubRoute) || 'dashboard');
        } else {
          setCurrentRoute('admin_login');
        }
      } else if (path === '/app' || path.startsWith('/app/')) {
        setCurrentRoute('app');
      } else {
        setCurrentRoute('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: AppRoute, subRoute?: AdminSubRoute) => {
    setCurrentRoute(route);
    let targetPath = '/';
    if (route === 'app') targetPath = '/app';
    else if (route === 'admin_login') targetPath = '/admin/login';
    else if (route === 'admin') {
      targetPath = subRoute && subRoute !== 'dashboard' ? `/admin/${subRoute}` : '/admin';
      if (subRoute) setAdminSubRoute(subRoute);
    }

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

  const handleNavigateToAdmin = () => {
    const session = getAdminSession();
    if (session) {
      setCurrentAdminUser(session);
      navigateTo('admin', 'dashboard');
    } else {
      navigateTo('admin_login');
    }
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setCurrentAdminUser(user);
    navigateTo('admin', 'dashboard');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setCurrentAdminUser(null);
    navigateTo('admin_login');
  };

  const handleAdminSubNavigate = (sub: AdminSubRoute) => {
    setAdminSubRoute(sub);
    const targetPath = sub === 'dashboard' ? '/admin' : `/admin/${sub}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
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

      // Record in Admin Assessments repository
      recordAssessment(report);
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

  // =========================================================================
  // 1. STARTUP STATE: CHECKING SAVED LANGUAGE
  // =========================================================================
  if (startupState === 'checking') {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center select-none">
        <div className="w-8 h-8 rounded-full border-3 border-blue-700 border-t-transparent animate-spin" />
      </div>
    );
  }

  // =========================================================================
  // 2. STARTUP STATE: FIRST-TIME VISITOR LANGUAGE SELECTION GATE
  // (NO LANDING / APP / ADMIN FLASH BEFORE SELECTION)
  // =========================================================================
  if (startupState === 'select-language') {
    return (
      <StartupLanguageGate
        initialLanguage={language}
        onConfirmLanguage={(chosen) => {
          selectLanguageAndProceed(chosen);
        }}
      />
    );
  }

  // =========================================================================
  // 4. STARTUP STATE: READY -> ROUTE TO INTENDED APPLICATION DESTINATION
  // =========================================================================

  // ROUTE: ADMIN LOGIN (/admin/login)
  if (currentRoute === 'admin_login') {
    return (
      <AdminLoginView
        onLoginSuccess={handleAdminLoginSuccess}
        onNavigateHome={handleNavigateHome}
      />
    );
  }

  // ROUTE: SECURE ADMIN CONTROL PLANE (/admin/*)
  if (currentRoute === 'admin') {
    if (!currentAdminUser && !getAdminSession()) {
      return (
        <AdminLoginView
          onLoginSuccess={handleAdminLoginSuccess}
          onNavigateHome={handleNavigateHome}
        />
      );
    }

    const activeAdmin = currentAdminUser || getAdminSession()!;

    return (
      <AdminLayout
        currentAdmin={activeAdmin}
        activeRoute={adminSubRoute}
        onNavigate={handleAdminSubNavigate}
        onLogout={handleAdminLogout}
        onNavigateToPublic={handleNavigateHome}
      >
        {adminSubRoute === 'dashboard' && (
          <AdminDashboardView onNavigate={handleAdminSubNavigate} role={activeAdmin.role} />
        )}
        {adminSubRoute === 'locations' && <AdminLocationsView />}
        {adminSubRoute === 'businesses' && <AdminBusinessesView />}
        {adminSubRoute === 'schemes' && <AdminSchemesView />}
        {adminSubRoute === 'evidence' && <AdminEvidenceView />}
        {adminSubRoute === 'financial-rules' && <AdminFinancialRulesView />}
        {adminSubRoute === 'users' && <AdminUsersView />}
        {adminSubRoute === 'reports' && <AdminAssessmentsView />}
        {adminSubRoute === 'translations' && <AdminTranslationsView />}
        {adminSubRoute === 'audit-logs' && <AdminAuditLogsView />}
        {adminSubRoute === 'settings' && <AdminSettingsView />}
      </AdminLayout>
    );
  }

  // ROUTE: PUBLIC LANDING PAGE (/) OR WORKSPACE (/app)
  return (
    <>
      {/* ROUTE 1: PUBLIC LANDING PAGE (/) */}
      {currentRoute === 'landing' && (
        <LandingPage
          onNavigateToApp={handleNavigateToApp}
          onNavigateToAdmin={handleNavigateToAdmin}
        />
      )}

      {/* ROUTE 2: FUNCTIONAL UDYORA APPLICATION (/app) */}
      {currentRoute === 'app' && (
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
                  {/* App Single Primary Heading Banner */}
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

            {/* Global Public Product Footer with Subtle Admin Access Entry */}
            <PublicFooter
              onNavigateHome={handleNavigateHome}
              onNavigateToApp={() => setCurrentScreen('form')}
              onNavigateToAdmin={handleNavigateToAdmin}
            />
          </div>
        </div>
      )}
    </>
  );
}
export default App;
