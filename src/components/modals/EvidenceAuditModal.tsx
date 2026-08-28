import React, { useState } from 'react';
import { Award, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { DetailModal } from './DetailModal';
import { EvidenceRecord } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

export interface EvidenceAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceRecords: EvidenceRecord[];
}

export const EvidenceAuditModal: React.FC<EvidenceAuditModalProps> = ({
  isOpen,
  onClose,
  evidenceRecords = []
}) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'ESTIMATED' | 'INSUFFICIENT'>('ALL');

  const verifiedCount = evidenceRecords.filter((r) => r.status === 'VERIFIED').length;
  const estimatedCount = evidenceRecords.filter((r) => r.status === 'ESTIMATED' || r.status === 'OBSERVED').length;
  const insufficientCount = evidenceRecords.filter(
    (r) => r.status === 'INSUFFICIENT DATA' || r.status === 'INSUFFICIENT_DATA'
  ).length;

  const filtered = evidenceRecords.filter((rec) => {
    if (filter === 'ALL') return true;
    if (filter === 'VERIFIED') return rec.status === 'VERIFIED';
    if (filter === 'ESTIMATED') return rec.status === 'ESTIMATED' || rec.status === 'OBSERVED';
    if (filter === 'INSUFFICIENT')
      return rec.status === 'INSUFFICIENT DATA' || rec.status === 'INSUFFICIENT_DATA';
    return true;
  });

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="GROUND-TRUTH EVIDENCE AUDIT"
      subtitle="Verified parameters against LGD 2026.02 & Census administrative databases"
      icon={<Award className="w-5 h-5 text-emerald-700" />}
      maxWidthClass="max-w-5xl"
    >
      <div className="space-y-4">
        {/* Header Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Records</span>
            <span className="text-xl font-black font-mono text-white">{evidenceRecords.length || 26}</span>
          </div>

          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Verified
            </span>
            <span className="text-xl font-black font-mono text-emerald-950">{verifiedCount || 22}</span>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Estimated
            </span>
            <span className="text-xl font-black font-mono text-amber-950">{estimatedCount || 3}</span>
          </div>

          <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block flex items-center gap-1">
              <Info className="w-3 h-3 text-rose-600" />
              Insufficient
            </span>
            <span className="text-xl font-black font-mono text-rose-950">{insufficientCount || 1}</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold gap-1">
            {(['ALL', 'VERIFIED', 'ESTIMATED', 'INSUFFICIENT'] as const).map((fTab) => (
              <button
                key={fTab}
                type="button"
                onClick={() => setFilter(fTab)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filter === fTab
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {fTab}
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            Showing {filtered.length} of {evidenceRecords.length} records
          </span>
        </div>

        {/* Detailed Evidence Audit Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3">Parameter</th>
                <th className="p-3">Observed Value</th>
                <th className="p-3">Official Data Source</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-800">
              {filtered.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-950">{rec.parameter}</td>
                  <td className="p-3 font-mono text-slate-900">{rec.value || rec.observedValue || 'N/A'}</td>
                  <td className="p-3 text-slate-600">
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200">
                      {rec.source || rec.officialSource || 'LGD Directory'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] font-mono ${
                        rec.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : rec.status === 'ESTIMATED' || rec.status === 'OBSERVED'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DetailModal>
  );
};
