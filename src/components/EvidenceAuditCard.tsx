import React, { useState } from 'react';
import {
  Database,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Filter,
  Info
} from 'lucide-react';
import { EvidenceRecord, DataQualityStatus } from '../types';

interface EvidenceAuditCardProps {
  evidenceList: EvidenceRecord[];
}

export const EvidenceAuditCard: React.FC<EvidenceAuditCardProps> = ({ evidenceList }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredEvidence = evidenceList.filter((e) => {
    if (filterStatus === 'ALL') return true;
    return e.status === filterStatus;
  });

  const getStatusBadge = (status: DataQualityStatus) => {
    switch (status) {
      case 'VERIFIED':
        return 'text-emerald-800 bg-emerald-50 border-emerald-300';
      case 'ESTIMATED':
        return 'text-amber-800 bg-amber-50 border-amber-300';
      case 'INSUFFICIENT DATA':
        return 'text-rose-800 bg-rose-50 border-rose-300';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-300';
    }
  };

  const verifiedCount = evidenceList.filter((e) => e.status === 'VERIFIED').length;
  const estimatedCount = evidenceList.filter((e) => e.status === 'ESTIMATED').length;
  const insufficientCount = evidenceList.filter((e) => e.status === 'INSUFFICIENT DATA').length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Evidence & Ground Truth Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full provenance of every factual parameter with confidence scores and verification stamps.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({evidenceList.length})
          </button>
          <button
            onClick={() => setFilterStatus('VERIFIED')}
            className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
              filterStatus === 'VERIFIED'
                ? 'bg-emerald-800 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            Verified ({verifiedCount})
          </button>
          <button
            onClick={() => setFilterStatus('ESTIMATED')}
            className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
              filterStatus === 'ESTIMATED'
                ? 'bg-amber-800 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            Estimated ({estimatedCount})
          </button>
          {insufficientCount > 0 && (
            <button
              onClick={() => setFilterStatus('INSUFFICIENT DATA')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                filterStatus === 'INSUFFICIENT DATA'
                  ? 'bg-rose-800 text-white'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              Insufficient ({insufficientCount})
            </button>
          )}
        </div>
      </div>

      {/* Audit Table */}
      <div className="border border-slate-200 rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Parameter / Metric</th>
              <th className="px-3 py-3 text-left">Value</th>
              <th className="px-3 py-3 text-left">Level</th>
              <th className="px-3 py-3 text-center">Status</th>
              <th className="px-3 py-3 text-center">Confidence</th>
              <th className="px-4 py-3 text-left">Source & Audit Trail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredEvidence.map((ev, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-2.5 font-bold text-slate-900">
                  {ev.metricName}
                </td>
                <td className="px-3 py-2.5 text-slate-800 font-medium">
                  {String(ev.value)} {ev.unit && <span className="text-slate-500 text-[11px]">({ev.unit})</span>}
                </td>
                <td className="px-3 py-2.5 text-slate-600">
                  <span className="text-[10px] font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                    {ev.geographicLevel}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border whitespace-nowrap ${getStatusBadge(ev.status)}`}>
                    {ev.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center font-bold text-slate-700">
                  {Math.round(ev.confidence * 100)}%
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="line-clamp-1">{ev.source}</span>
                    {ev.sourceUrl && (
                      <a
                        href={ev.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-900 shrink-0"
                        title="Open verified official source"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {ev.dataLimitationNote && (
                    <p className="text-[10px] text-amber-800 font-medium mt-0.5">
                      {ev.dataLimitationNote}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
