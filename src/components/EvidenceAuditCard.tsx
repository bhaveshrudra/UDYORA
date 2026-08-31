import React, { useState } from'react';
import {
 Database,
 CheckCircle2,
 AlertCircle,
 HelpCircle,
 ExternalLink,
 ShieldCheck,
 Filter
} from'lucide-react';
import { EvidenceRecord } from'../types';
import { useLanguage } from'../i18n/LanguageContext';

interface EvidenceAuditCardProps {
 evidenceRecords?: EvidenceRecord[] | { data: EvidenceRecord[] };
}

export const EvidenceAuditCard: React.FC<EvidenceAuditCardProps> = ({ evidenceRecords: rawRecords }) => {
 const { t } = useLanguage();
 const evidenceRecords: EvidenceRecord[] = Array.isArray(rawRecords)
 ? rawRecords
 : (rawRecords as any)?.data || [];

 const [filterStatus, setFilterStatus] = useState<string>('ALL');

 const validList = evidenceRecords.filter((r) => r && r.id);
 const filteredRecords = filterStatus ==='ALL'
 ? validList
 : validList.filter((r) => r.status === filterStatus);

 const getStatusBadge = (status: string) => {
 switch (status) {
 case'VERIFIED':
 return (
 <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border text-emerald-800 bg-emerald-50 border-emerald-300">
 <CheckCircle2 className="w-3 h-3 text-emerald-600" />
 <span>{t('evidence.badge.verified')}</span>
 </span>
 );
 case'ESTIMATED':
 return (
 <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border text-amber-800 bg-amber-50 border-amber-300">
 <AlertCircle className="w-3 h-3 text-amber-600" />
 <span>{t('evidence.badge.estimated')}</span>
 </span>
 );
 case'INSUFFICIENT DATA':
 default:
 return (
 <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border text-rose-800 bg-rose-50 border-rose-300">
 <HelpCircle className="w-3 h-3 text-rose-600" />
 <span>{t('evidence.badge.insufficient')}</span>
 </span>
 );
 }
 };

 const verifiedCount = validList.filter((r) => r.status ==='VERIFIED').length;
 const estimatedCount = validList.filter((r) => r.status ==='ESTIMATED').length;
 const insufficientCount = validList.filter((r) => r.status ==='INSUFFICIENT DATA').length;

 return (
 <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
 {/* Section Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
 <div>
 <div className="flex items-center gap-2">
 <Database className="w-5 h-5 text-blue-700" />
 <h2 className="text-lg font-bold tracking-tight text-slate-900">
 {t('evidence.auditTitle')}
 </h2>
 </div>
 <p className="text-xs text-slate-500 mt-0.5">
 {t('evidence.auditSubtitle')}
 </p>
 </div>

 {/* Filter Badges */}
 <div className="flex flex-wrap items-center gap-1.5 text-xs">
 <button
 onClick={() => setFilterStatus('ALL')}
 className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
 filterStatus ==='ALL'
 ?'bg-slate-900 text-white'
 :'bg-slate-100 text-slate-600 hover:bg-slate-200'
 }`}
 >
 {t('evidence.filterAll', { count: validList.length })}
 </button>
 <button
 onClick={() => setFilterStatus('VERIFIED')}
 className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
 filterStatus ==='VERIFIED'
 ?'bg-emerald-800 text-white'
 :'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
 }`}
 >
 {t('evidence.filterVerified', { count: verifiedCount })}
 </button>
 <button
 onClick={() => setFilterStatus('ESTIMATED')}
 className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
 filterStatus ==='ESTIMATED'
 ?'bg-amber-800 text-white'
 :'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
 }`}
 >
 {t('evidence.filterEstimated', { count: estimatedCount })}
 </button>
 <button
 onClick={() => setFilterStatus('INSUFFICIENT DATA')}
 className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
 filterStatus ==='INSUFFICIENT DATA'
 ?'bg-rose-800 text-white'
 :'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
 }`}
 >
 {t('evidence.filterInsufficient', { count: insufficientCount })}
 </button>
 </div>
 </div>

 {/* Mobile View: Stacked Evidence Cards (below md) */}
 <div className="md:hidden space-y-3">
 {filteredRecords.map((rec, idx) => (
 <div
 key={`mob-ev-${rec.id || idx}`}
 className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-2xs"
 >
 <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 pb-2">
 <div>
 <span className="font-bold text-xs text-slate-900 block">{rec.metricName}</span>
 <span className="text-[11px] font-mono text-slate-500">{rec.geographicLevel} Level</span>
 </div>
 <div className="shrink-0">{getStatusBadge(rec.status)}</div>
 </div>

 <div className="flex items-center justify-between text-xs">
 <span className="text-slate-500 font-medium">{t('evidence.table.value')}:</span>
 <span className="font-mono font-bold text-slate-950">
 {typeof rec.value ==='number' ? rec.value.toLocaleString('en-IN') : rec.value}{''}
 {rec.unit ||''}
 </span>
 </div>

 <div className="flex items-center justify-between text-xs">
 <span className="text-slate-500 font-medium">Confidence:</span>
 <span className="font-mono font-bold text-slate-900">
 {Math.round((rec.confidence || 0.8) * 100)}%
 </span>
 </div>

 <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
 <span className="truncate max-w-[220px]">{rec.source}</span>
 {rec.sourceUrl && (
 <a
 href={rec.sourceUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="text-blue-700 font-bold hover:underline flex items-center gap-1 shrink-0"
 >
 <span>Source</span>
 <ExternalLink className="w-2.5 h-2.5" />
 </a>
 )}
 </div>

 {rec.dataLimitationNote && (
 <p className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 leading-snug">
 ⚠️ {rec.dataLimitationNote}
 </p>
 )}
 </div>
 ))}
 </div>

 {/* Desktop Table View (md+) */}
 <div className="hidden md:block border border-slate-200 rounded-xl overflow-x-auto">
 <table className="min-w-full divide-y divide-slate-200 text-xs">
 <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
 <tr>
 <th className="px-4 py-3 text-left">{t('evidence.table.param')}</th>
 <th className="px-3 py-3 text-left">{t('evidence.table.value')}</th>
 <th className="px-3 py-3 text-center">{t('evidence.table.status')}</th>
 <th className="px-3 py-3 text-center">{t('evidence.table.level')}</th>
 <th className="px-4 py-3 text-left">{t('evidence.table.source')}</th>
 <th className="px-3 py-3 text-right">{t('evidence.table.confidence')}</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 bg-white">
 {filteredRecords.map((rec, idx) => (
 <tr key={rec.id || idx} className="hover:bg-slate-50/60 transition-colors">
 <td className="px-4 py-3">
 <span className="font-bold text-slate-900 block">{rec.metricName}</span>
 {rec.dataLimitationNote && (
 <span className="text-[11px] text-amber-800 block mt-0.5 font-medium">
 ⚠️ {rec.dataLimitationNote}
 </span>
 )}
 </td>
 <td className="px-3 py-3 font-semibold text-slate-800 whitespace-nowrap">
 {typeof rec.value ==='number' ? rec.value.toLocaleString('en-IN') : rec.value}
 {rec.unit && <span className="text-slate-500 font-normal ml-1">{rec.unit}</span>}
 </td>
 <td className="px-3 py-3 text-center whitespace-nowrap">
 {getStatusBadge(rec.status)}
 </td>
 <td className="px-3 py-3 text-center whitespace-nowrap">
 <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
 {rec.geographicLevel}
 </span>
 </td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-1">
 <span className="text-slate-600 line-clamp-1">{rec.source}</span>
 {rec.sourceUrl && (
 <a
 href={rec.sourceUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="text-blue-700 hover:text-blue-900 shrink-0"
 >
 <ExternalLink className="w-3 h-3" />
 </a>
 )}
 </div>
 </td>
 <td className="px-3 py-3 text-right whitespace-nowrap">
 <span className="font-mono font-bold text-slate-900">
 {Math.round((rec.confidence || 0.8) * 100)}%
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
};
