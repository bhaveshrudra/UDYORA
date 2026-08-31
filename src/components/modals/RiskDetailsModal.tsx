import React from'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from'lucide-react';
import { DetailModal } from'./DetailModal';

export interface RiskItem {
 factor?: string;
 riskName?: string;
 severity?:'HIGH' |'MEDIUM' |'LOW';
 impact?: string;
 mitigation?: string;
 recommendedAction?: string;
 evidenceSource?: string;
}

export interface RiskDetailsModalProps {
 isOpen: boolean;
 onClose: () => void;
 riskFactors: RiskItem[];
}

export const RiskDetailsModal: React.FC<RiskDetailsModalProps> = ({
 isOpen,
 onClose,
 riskFactors = []
}) => {
 return (
 <DetailModal
 isOpen={isOpen}
 onClose={onClose}
 title="RISK ANALYSIS & MITIGATION"
 subtitle="Complete risk vectors, severity rating, and actionable field mitigation strategies"
 icon={<ShieldAlert className="w-5 h-5 text-amber-600" />}
 maxWidthClass="max-w-4xl"
 >
 <div className="space-y-3">
 <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-900 flex items-center gap-2">
 <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
 <span>
 Displaying all <strong>{riskFactors.length}</strong> identified enterprise risk vectors and field mitigation guidelines.
 </span>
 </div>

 <div className="space-y-3">
 {riskFactors.map((rf, idx) => {
 const rName = rf.factor || rf.riskName ||`Risk Vector #${idx + 1}`;
 const rSev = rf.severity ||'MEDIUM';
 const rMitigation = rf.mitigation || rf.recommendedAction ||'Establish formal operational procedures.';
 const rImpact = rf.impact ||'Potential impact on operational cash flow or timelines.';

 return (
 <div
 key={idx}
 className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-2xs hover:border-slate-300 transition-colors"
 >
 <div className="flex items-center justify-between border-b border-slate-100 pb-2">
 <span className="text-xs font-black text-slate-950 flex items-center gap-2">
 <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono font-bold">
 {idx + 1}
 </span>
 {rName}
 </span>
 <span
 className={`px-2.5 py-0.5 rounded-full font-black text-[10px] font-mono ${
 rSev ==='HIGH'
 ?'bg-rose-100 text-rose-900 border border-rose-300'
 : rSev ==='MEDIUM'
 ?'bg-amber-100 text-amber-900 border border-amber-300'
 :'bg-emerald-100 text-emerald-900 border border-emerald-300'
 }`}
 >
 {rSev} SEVERITY
 </span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Risk Impact</span>
 <p className="text-slate-800 font-medium leading-relaxed">{rImpact}</p>
 </div>
 <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-1">
 <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block flex items-center gap-1">
 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
 Actionable Mitigation
 </span>
 <p className="text-emerald-950 font-medium leading-relaxed">{rMitigation}</p>
 </div>
 </div>

 {rf.evidenceSource && (
 <div className="text-[10px] text-slate-500 font-mono pt-1">
 Evidence Source: {rf.evidenceSource}
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 </DetailModal>
 );
};
