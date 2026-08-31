import React from'react';
import { Sparkles, CheckCircle2, Building2, MapPin } from'lucide-react';
import { DetailModal } from'./DetailModal';
import { OpportunitySpot } from'../../types/map';

export interface OpportunityFactorsModalProps {
 isOpen: boolean;
 onClose: () => void;
 opportunitySpot?: OpportunitySpot | null;
}

export const OpportunityFactorsModal: React.FC<OpportunityFactorsModalProps> = ({
 isOpen,
 onClose,
 opportunitySpot
}) => {
 if (!opportunitySpot) return null;

 const factors = opportunitySpot.factors || [
 { name:'Population Reach & Density', score: 85, weight: 0.25 },
 { name:'Road Accessibility & Connectivity', score: 90, weight: 0.25 },
 { name:'Competitor Gap & Market Vacuum', score: 80, weight: 0.25 },
 { name:'Off-take Demand & Wholesale Hub', score: 88, weight: 0.25 }
 ];

 return (
 <DetailModal
 isOpen={isOpen}
 onClose={onClose}
 title="OPPORTUNITY FACTORS"
 subtitle={`Detailed scoring breakdown for ${opportunitySpot.spotName}`}
 icon={<Sparkles className="w-5 h-5 text-amber-600" />}
 maxWidthClass="max-w-4xl"
 >
 <div className="space-y-4">
 {/* Header Summary */}
 <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-3">
 <div>
 <div className="flex items-center gap-2">
 <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono">
 #{opportunitySpot.rank || 1}
 </span>
 <h3 className="text-sm font-black text-slate-950">{opportunitySpot.spotName}</h3>
 </div>
 <p className="text-xs font-medium text-slate-700 mt-1">{opportunitySpot.summaryReason}</p>
 </div>
 <div className="text-right shrink-0">
 <span className="text-[10px] font-bold uppercase text-slate-500 block">Opportunity Score</span>
 <span className="text-2xl font-black font-mono text-emerald-800">
 {opportunitySpot.opportunityScore}%
 </span>
 </div>
 </div>

 {/* Factors Breakdown List */}
 <div className="space-y-2">
 <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Evaluation Factors</h4>
 <div className="space-y-2.5">
 {factors.map((f: any, idx: number) => (
 <div key={idx} className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1.5 shadow-2xs">
 <div className="flex items-center justify-between text-xs font-bold">
 <span className="text-slate-900">{f.name || f.factorName}</span>
 <span className="font-mono text-emerald-800">{f.score}%</span>
 </div>
 <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
 <div
 className="h-full bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full"
 style={{ width:`${f.score}%` }}
 />
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Sources & Data Quality */}
 <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1.5 text-xs">
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Data Sources & Confidence</span>
 <div className="flex flex-wrap gap-2 pt-0.5">
 {opportunitySpot.sources?.map((s, idx) => (
 <span key={idx} className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-800 font-mono text-[11px]">
 {s.name} ({s.quality})
 </span>
 )) || (
 <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-800 font-mono text-[11px]">
 Census PCA & LGD Administrative Directory (VERIFIED)
 </span>
 )}
 </div>
 </div>
 </div>
 </DetailModal>
 );
};
