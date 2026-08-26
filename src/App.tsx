/**
 * UDYORA - Hyper-Local Business Intelligence for Rural Entrepreneurs
 * Orchestrated Multi-Agent System Prototype
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
import { BusinessInputForm } from './components/BusinessInputForm';
import { AgentExecutionProgress } from './components/AgentExecutionProgress';
import { ResultDashboard } from './components/ResultDashboard';
import { PrintableReport } from './components/PrintableReport';
import { executeMultiAgentWorkflow } from './agents/orchestrator';
import { runFinancialUnitTests } from './tests/financialCalculator.test';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'form' | 'executing' | 'result'>('form');
  const [agentSteps, setAgentSteps] = useState<AgentStepStatus[]>([]);
  const [activeStepId, setActiveStepId] = useState<string>('evidence');
  const [analysisReport, setAnalysisReport] = useState<CompleteAnalysisReport | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Run automated unit test suite on mount to verify mathematical rigor
  useEffect(() => {
    const testResult = runFinancialUnitTests();
    if (testResult.passed) {
      console.log('âœ… [UDYORA Unit Tests] All 9 Deterministic Financial Calculations Passed:');
      testResult.logs.forEach((log) => console.log(log));
    } else {
      console.error('âŒ [UDYORA Unit Tests] Test Failures Detected:', testResult.logs);
    }
  }, []);

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
        {/* Main Public-Service Header */}
        <Header
          onReset={analysisReport ? handleReset : undefined}
          onPrint={analysisReport ? handlePrint : undefined}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          hasResult={!!analysisReport}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* SCREEN 1: GUIDED INPUT & HERO */}
          {currentScreen === 'form' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Hero Banner */}
              <div className="text-center max-w-3xl mx-auto pt-2 pb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100/70 text-blue-900 border border-blue-200 mb-3.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Verified Multi-Agent Business Advisory for Rural Micro-Enterprises</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
                  UDYORA Business Intelligence
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-2.5 max-w-2xl mx-auto leading-relaxed">
                  Evaluate village-level enterprise viability, deterministic loan financing, government scheme subsidies, and practical rural risk mitigations using coordinated specialized agents.
                </p>
              </div>

              {/* Input Form with 1-Click Demo Presets */}
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

          {/* SCREEN 3: RESULT DASHBOARD */}
          {currentScreen === 'result' && analysisReport && (
            <div className="animate-fadeIn">
              <ResultDashboard
                report={analysisReport}
                onReset={handleReset}
                onPrint={handlePrint}
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
              <span>â€” Hyper-Local Business Intelligence for Rural Entrepreneurs</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Deterministic Financial Engine</span>
              <span>â€¢</span>
              <span>Rule-based Schemes</span>
              <span>â€¢</span>
              <span>Census & Ground Truth Audit</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
