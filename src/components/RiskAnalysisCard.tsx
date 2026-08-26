import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  TrendingDown
} from 'lucide-react';
import { RiskProfile } from '../types';

interface RiskAnalysisCardProps {
  riskProfile: RiskProfile;
}

export const RiskAnalysisCard: React.FC<RiskAnalysisCardProps> = ({ riskProfile }) => {
  const { overallRiskLevel, riskFactors, summary, dataConfidenceLimitation } = riskProfile;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'text-rose-800 bg-rose-50 border-rose-200';
      case 'MEDIUM':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'LOW':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-800 bg-slate-50 border-slate-200';
    }
  };

  const highRisks = riskFactors.filter((r) => r.severity === 'HIGH');
  const mediumRisks = riskFactors.filter((r) => r.severity === 'MEDIUM');
  const lowRisks = riskFactors.filter((r) => r.severity === 'LOW');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Multidimensional Risk Analysis & Mitigations
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational, financial, seasonal, biological, and data-quality risk evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${getSeverityBadge(overallRiskLevel)}`}>
            OVERALL RISK: {overallRiskLevel}
          </span>
        </div>
      </div>

      {/* Summary Note */}
      <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3.5 leading-relaxed">
        {summary}
      </p>

      {/* Risk Items List */}
      <div className="space-y-4">
        {/* HIGH RISKS */}
        {highRisks.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                High Priority Vulnerabilities ({highRisks.length})
              </h3>
            </div>

            <div className="space-y-3">
              {highRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="bg-rose-50/40 border border-rose-200 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{risk.title}</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border text-rose-800 bg-rose-100/70 border-rose-300">
                      HIGH RISK
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {risk.description}
                  </p>

                  <div className="bg-white/80 border border-rose-100 rounded-lg p-2.5 text-xs">
                    <span className="font-bold text-rose-950 block mb-0.5">Recommended Action / Mitigation:</span>
                    <span className="text-slate-700">{risk.mitigationSuggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MEDIUM RISKS */}
        {mediumRisks.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Zap className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Medium Priority Operational Factors ({mediumRisks.length})
              </h3>
            </div>

            <div className="space-y-3">
              {mediumRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="bg-amber-50/40 border border-amber-200 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{risk.title}</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border text-amber-800 bg-amber-100/70 border-amber-300">
                      MEDIUM RISK
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {risk.description}
                  </p>

                  <div className="bg-white/80 border border-amber-100 rounded-lg p-2.5 text-xs">
                    <span className="font-bold text-amber-950 block mb-0.5">Recommended Action / Mitigation:</span>
                    <span className="text-slate-700">{risk.mitigationSuggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOW RISKS */}
        {lowRisks.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Managed & Low-Risk Vectors ({lowRisks.length})
              </h3>
            </div>

            <div className="space-y-2">
              {lowRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-900">{risk.title}</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border text-emerald-800 bg-emerald-50 border-emerald-200">
                      LOW
                    </span>
                  </div>
                  <p className="text-slate-600">{risk.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confidence Limitation Footer */}
      {dataConfidenceLimitation && (
        <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{dataConfidenceLimitation}</span>
        </div>
      )}
    </div>
  );
};
