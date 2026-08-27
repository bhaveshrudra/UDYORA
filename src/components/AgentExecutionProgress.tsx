import React from 'react';
import {
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Database,
  Building,
  Store,
  Calculator,
  Award,
  ShieldAlert,
  CheckCheck,
  FileCheck
} from 'lucide-react';
import { AgentStepStatus } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface AgentExecutionProgressProps {
  steps: AgentStepStatus[];
  currentActiveId?: string;
}

const getAgentIcon = (id: string) => {
  switch (id) {
    case 'evidence':
      return <Database className="w-4 h-4 text-blue-600" />;
    case 'business':
      return <Building className="w-4 h-4 text-indigo-600" />;
    case 'market':
      return <Store className="w-4 h-4 text-emerald-600" />;
    case 'finance':
      return <Calculator className="w-4 h-4 text-amber-600" />;
    case 'scheme':
      return <Award className="w-4 h-4 text-purple-600" />;
    case 'risk':
      return <ShieldAlert className="w-4 h-4 text-rose-600" />;
    case 'validator':
      return <CheckCheck className="w-4 h-4 text-teal-600" />;
    case 'final':
      return <FileCheck className="w-4 h-4 text-blue-800" />;
    default:
      return <Loader2 className="w-4 h-4 text-slate-600" />;
  }
};

export const AgentExecutionProgress: React.FC<AgentExecutionProgressProps> = ({
  steps,
  currentActiveId
}) => {
  const { t } = useLanguage();
  const completedCount = steps.filter((s) => s.status === 'COMPLETED').length;
  const progressPercent = Math.round((completedCount / Math.max(1, steps.length)) * 100);

  const getLocalizedAgentName = (id: string) => {
    switch (id) {
      case 'evidence': return t('progress.agent.evidence');
      case 'business': return t('progress.agent.business');
      case 'market': return t('progress.agent.market');
      case 'finance': return t('progress.agent.finance');
      case 'scheme': return t('progress.agent.scheme');
      case 'risk': return t('progress.agent.risk');
      case 'validator': return t('progress.agent.validator');
      case 'final': return t('progress.agent.final');
      default: return id;
    }
  };

  const getLocalizedAgentRole = (id: string) => {
    switch (id) {
      case 'evidence': return t('progress.agent.evidenceRole');
      case 'business': return t('progress.agent.businessRole');
      case 'market': return t('progress.agent.marketRole');
      case 'finance': return t('progress.agent.financeRole');
      case 'scheme': return t('progress.agent.schemeRole');
      case 'risk': return t('progress.agent.riskRole');
      case 'validator': return t('progress.agent.validatorRole');
      case 'final': return t('progress.agent.finalRole');
      default: return '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              {t('progress.title')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('progress.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-700">
              {t('progress.completeRatio', { completed: completedCount, total: steps.length })}
            </span>
            <div className="w-32 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Agent Progress List */}
      <div className="space-y-3">
        {steps.map((step) => {
          const isRunning = step.status === 'RUNNING';
          const isCompleted = step.status === 'COMPLETED';
          const isPending = step.status === 'PENDING';

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isRunning
                  ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300 shadow-xs'
                  : isCompleted
                  ? 'bg-slate-50/60 border-slate-200'
                  : 'bg-white border-slate-150 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs shrink-0 mt-0.5 sm:mt-0">
                    {getAgentIcon(step.id)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        {getLocalizedAgentName(step.id)}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        ({getLocalizedAgentRole(step.id)})
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isRunning ? 'text-blue-900 font-medium' : 'text-slate-600'} break-words`}>
                      {step.message}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end gap-2 pl-11 sm:pl-0">
                  {isCompleted && (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{step.durationMs ? `${step.durationMs}ms` : t('progress.status.completed')}</span>
                    </div>
                  )}

                  {isRunning && (
                    <div className="flex items-center gap-1 text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('progress.status.running')}</span>
                    </div>
                  )}

                  {isPending && (
                    <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5">
                      {t('progress.status.waiting')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
