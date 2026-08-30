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
import { HeroEntry } from './components/HeroEntry';
import { AccountOnboardingView } from './components/AccountOnboardingView';
import { PublicFooter } from './components/PublicFooter';
import { getCurrentUserSession } from './services/userAuthService';
import { executeMultiAgentWorkflow } from './agents/orchestrator';
import { useLanguage } from './i18n/LanguageContext';

// Admin Imports
import { AdminUser, getAdminSession, logoutAdmin, checkRouteAuthorization } from './services/adminAuthService';
import { AdminLayout, AdminSubRoute } from './components/admin/AdminLayout';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import {
  AdminLocationsView,
  AdminBusinessesView,
  AdminSchemesView,
  AdminEvidenceView,
  AdminParticipantsView,
  AdminUserManagementView,
  AdminAssessmentsView,
  AdminTranslationsView,
  AdminGuidanceView,
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
    completeHeroEntry,
    resetLanguagePreference
  } = useLanguage();

  const appContainerRef = useRef<HTMLDivElement>(null);

  // Client-side path router
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
  const [analysisState, setAnalysisState] = useState<'idle' | 'validating' | 'running' | 'completed' | 'error'>('idle');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState<UserBusinessInput | undefined>(undefined);
  const [analysisReport, setAnalysisReport] = useState<CompleteAnalysisReport | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return getCurrentUserSession() !== null;
  });

  // Multi-agent execution steps (all 8 official agents)
  const INITIAL_AGENT_STEPS: AgentStepStatus[] = [
    { id: 'evidence', name: 'Evidence & Data Agent', role: 'Ground Truth Verification & Census Data', status: 'PENDING', progressPct: 0, message: 'Ready to query localized datasets' },
    { id: 'business', name: 'Business Analysis Agent', role: 'Operating Scale, Capacity & Resource Requirements', status: 'PENDING', progressPct: 0, message: 'Waiting for evidence layer' },
    { id: 'market', name: 'Market Intelligence Agent', role: 'Catchment Demographics & Competitor Analysis', status: 'PENDING', progressPct: 0, message: 'Waiting for business model' },
    { id: 'finance', name: 'Financial Advisor Agent', role: 'Deterministic Unit Economics & Repayment Formulas', status: 'PENDING', progressPct: 0, message: 'Waiting for unit economics' },
    { id: 'scheme', name: 'Scheme Guidance Agent', role: 'Official Government Scheme Rules & Subsidies', status: 'PENDING', progressPct: 0, message: 'Waiting for financial sizing' },
    { id: 'risk', name: 'Risk Analysis Agent', role: 'Multi-Dimensional Vulnerability Assessment', status: 'PENDING', progressPct: 0, message: 'Waiting for scheme & market data' },
    { id: 'validator', name: 'Aggregator & Validator', role: 'Cross-Agent Mathematical & Quality Audit', status: 'PENDING', progressPct: 0, message: 'Waiting for all agent outputs' },
    { id: 'final', name: 'Final Advisor & Report', role: 'Synthesized Feasibility Score & Advisory Report', status: 'PENDING', progressPct: 0, message: 'Waiting for validation' }
  ];
  const [agentSteps, setAgentSteps] = useState<AgentStepStatus[]>(INITIAL_AGENT_STEPS);
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
    console.log('[UDYORA ROUTING] handleNavigateToApp triggered', { _scenario });
    navigateTo('app');
    setCurrentScreen('form');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const handleNavigateHome = () => {
    navigateTo('landing');
    setCurrentScreen('form');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const handleNavigateToAdmin = () => {
    const session = getAdminSession();
    if (session) {
      setCurrentAdminUser(session);
      navigateTo('admin', 'dashboard');
    } else {
      navigateTo('admin_login');
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setCurrentAdminUser(user);
    navigateTo('admin', 'dashboard');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setCurrentAdminUser(null);
    navigateTo('admin_login');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const handleAdminSubNavigate = (sub: AdminSubRoute) => {
    setAdminSubRoute(sub);
    const targetPath = sub === 'dashboard' ? '/admin' : `/admin/${sub}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const handleFormSubmit = async (input: UserBusinessInput) => {
    // In-flight double submission prevention
    if (analysisState === 'running') {
      console.log('[UDYORA ANALYZE] Duplicate trigger ignored: Analysis already in progress.');
      return;
    }

    setAnalysisState('running');
    setAnalysisError(null);
    setCurrentInput(input);
    setCurrentScreen('executing');
    setAnalysisReport(null);

    // Reset steps
    setAgentSteps(
      INITIAL_AGENT_STEPS.map((s) => ({
        ...s,
        status: 'PENDING',
        progressPct: 0,
        message: 'Queued...'
      }))
    );
    setActiveStepId('evidence');

    try {
      const report = await executeMultiAgentWorkflow(input, (updatedSteps, activeId) => {
        setAgentSteps([...updatedSteps]);
        if (activeId) setActiveStepId(activeId);
      });

      setAnalysisReport(report);
      setAnalysisState('completed');
      setCurrentScreen('result');
      console.log('[UDYORA ANALYZE] navigation complete');

      // Record in Admin Assessments repository
      try {
        recordAssessment(report);
      } catch (recErr) {
        console.warn('Failed to record assessment in admin store:', recErr);
      }
    } catch (err: any) {
      console.error('[UDYORA ANALYZE ERROR]', err);
      setAnalysisState('error');
      setAnalysisError(err?.message || 'Unable to complete the analysis.');
      setCurrentScreen('form');
    }
  };

  const handleReset = () => {
    setAnalysisState('idle');
    setAnalysisError(null);
    setCurrentScreen('form');
    setAnalysisReport(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // =========================================================================
  // STARTUP FLOW GATE
  // =========================================================================
  //
  // For / (landing) route:
  //   1. hero-entry     → Show HeroEntry animation
  //   2. select-language → Show language selection (first visit only)
  //   3. ready           → Show landing page
  //
  // For /app route:
  //   Skip hero entry entirely — go straight to business app.
  //   (Users navigating to /app already know what UDYORA is.)
  //
  // For /admin routes:
  //   Skip hero entry — go straight to admin.
  // =========================================================================

  // Only show hero entry for the landing route
  const shouldShowHeroEntry =
    startupState === 'hero-entry' &&
    currentRoute === 'landing';

  // Show language selection gate for first-time users on the landing route only
  const shouldShowLanguageGate =
    startupState === 'select-language' &&
    currentRoute === 'landing';

  // =========================================================================
  // 1. HERO ENTRY ANIMATION (landing route only)
  // =========================================================================
  if (shouldShowHeroEntry) {
    return (
      <HeroEntry
        onComplete={() => {
          completeHeroEntry();
        }}
      />
    );
  }

  // =========================================================================
  // 2. FIRST-TIME LANGUAGE SELECTION GATE
  // =========================================================================
  if (shouldShowLanguageGate) {
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
  // 3. READY → ROUTE TO DESTINATION
  // =========================================================================

  // For non-landing routes opened directly while startupState was hero-entry or select-language,
  // we auto-advance directly to ready
  if (startupState !== 'ready' && currentRoute !== 'landing') {
    completeHeroEntry();
  }

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
    const session = currentAdminUser || getAdminSession();
    if (!session || session.role === 'ENTREPRENEUR') {
      return (
        <AdminLoginView
          onLoginSuccess={handleAdminLoginSuccess}
          onNavigateHome={handleNavigateHome}
        />
      );
    }

    const activeAdmin = session;
    const authCheck = checkRouteAuthorization(activeAdmin, adminSubRoute);

    return (
      <AdminLayout
        currentAdmin={activeAdmin}
        activeRoute={adminSubRoute}
        onNavigate={handleAdminSubNavigate}
        onLogout={handleAdminLogout}
        onNavigateToPublic={handleNavigateHome}
      >
        {!authCheck.authorized ? (
          <div className="bg-white border border-rose-200 rounded-3xl p-8 max-w-xl mx-auto my-12 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-rose-50 text-rose-700 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 font-bold">
              403
            </div>
            <h2 className="text-lg font-black text-slate-950">Access Restricted</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {authCheck.reason || "Your administrative role does not have permission to access this module."}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => handleAdminSubNavigate('dashboard')}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
              <button
                onClick={handleNavigateHome}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Back to Public Application
              </button>
            </div>
          </div>
        ) : (
          <>
            {adminSubRoute === 'dashboard' && (
              <AdminDashboardView currentAdmin={activeAdmin} onNavigate={handleAdminSubNavigate} />
            )}
            {adminSubRoute === 'locations' && <AdminLocationsView />}
            {adminSubRoute === 'businesses' && <AdminBusinessesView />}
            {adminSubRoute === 'schemes' && <AdminSchemesView currentAdmin={activeAdmin} />}
            {adminSubRoute === 'evidence' && <AdminEvidenceView />}
            {adminSubRoute === 'translations' && <AdminTranslationsView />}
            {adminSubRoute === 'guidance' && <AdminGuidanceView />}
            {adminSubRoute === 'assessments' && <AdminAssessmentsView />}
            {adminSubRoute === 'participants' && <AdminParticipantsView currentAdmin={activeAdmin} />}
            {adminSubRoute === 'users' && <AdminUserManagementView currentAdmin={activeAdmin} />}
            {adminSubRoute === 'audit-logs' && <AdminAuditLogsView />}
            {adminSubRoute === 'settings' && <AdminSettingsView />}
          </>
        )}
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

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              {/* SCREEN 1: ACCOUNT ONBOARDING FIRST OR GUIDED INPUT WORKSPACE */}
              {currentScreen === 'form' && (
                !isOnboardingComplete ? (
                  <AccountOnboardingView
                    onCompleteOnboarding={() => {
                      setIsOnboardingComplete(true);
                    }}
                    onContinueAsGuest={() => {
                      setIsOnboardingComplete(true);
                    }}
                  />
                ) : (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Analysis Error Alert UI */}
                    {analysisError && (
                      <div className="max-w-3xl mx-auto p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl shadow-sm space-y-3 animate-fadeIn">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 font-bold text-sm">
                            ⚠️
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-rose-950">Unable to complete the analysis.</h3>
                            <p className="text-xs text-rose-700 mt-0.5">{analysisError}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          {currentInput && (
                            <button
                              type="button"
                              onClick={() => handleFormSubmit(currentInput)}
                              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                            >
                              Try Again
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setAnalysisError(null);
                              setAnalysisState('idle');
                            }}
                            className="px-4 py-2 bg-white hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Back to Inputs
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Input Form with Guided 3-Numbered Sequence */}
                    <BusinessInputForm
                      onSubmit={handleFormSubmit}
                      isLoading={analysisState === 'running'}
                      initialValues={currentInput}
                    />
                  </div>
                )
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
