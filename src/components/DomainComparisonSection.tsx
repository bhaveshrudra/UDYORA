import React, { useState } from'react';
import {
 Layers,
 Award,
 TrendingUp,
 AlertTriangle,
 CheckCircle2,
 HelpCircle,
 BarChart3,
 ArrowRight,
 Shield,
 Zap,
 Info,
 Sparkles
} from'lucide-react';
import { DomainComparisonReport, DomainComparisonItem } from'../types';

interface DomainComparisonSectionProps {
 comparisonReport?: DomainComparisonReport;
 selectedBusinessName?: string;
}

export const DomainComparisonSection: React.FC<DomainComparisonSectionProps> = ({
 comparisonReport,
 selectedBusinessName ='Your Proposed Business'
}) => {
 if (!comparisonReport || !comparisonReport.rankedDomains || comparisonReport.rankedDomains.length === 0) {
 return null;
 }

 const [activeDomainId, setActiveDomainId] = useState<string>(
 comparisonReport.bestFitDomain?.domainId || comparisonReport.rankedDomains[0].domainId
 );

 const activeDomain =
 comparisonReport.rankedDomains.find((d) => d.domainId === activeDomainId) ||
 comparisonReport.rankedDomains[0];

 const bestFit = comparisonReport.bestFitDomain;
 const alternatives = comparisonReport.alternativeDomains;

 const factorsList = [
 { key:'marketOpportunity', label:'Local Market Opportunity', weight:'20%' },
 { key:'capitalFit', label:'Capital Fit', weight:'20%' },
 { key:'revenuePotential', label:'Revenue / Margin Potential', weight:'15%' },
 { key:'competition', label:'Competition Structure', weight:'10%' },
 { key:'operationalRisk', label:'Operational Risk Profile', weight:'15%' },
 { key:'infrastructure', label:'Infrastructure Access', weight:'10%' },
 { key:'schemeFit', label:'Scheme & Financing Fit', weight:'10%' }
 ] as const;

 return (
 <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
 {/* 1. Header & Context */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
 <div>
 <div className="flex items-center gap-2 mb-1.5">
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-blue-50 text-blue-900 border border-blue-200">
 <Layers className="w-3.5 h-3.5 text-blue-700" />
 <span>Multi-Sector Comparative Intelligence</span>
 </span>
 </div>
 <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
 BUSINESS DOMAIN COMPARISON
 </h2>
 <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
 Compare your proposed business with other relevant opportunities for this location and capital level.
 </p>
 </div>

 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-right shrink-0">
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Metric Standard</span>
 <span className="text-xs font-black text-slate-800">SUITABILITY SCORE (0 – 100)</span>
 </div>
 </div>

 {/* 2. Comparative Horizontal Bar Chart */}
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
 <BarChart3 className="w-4 h-4 text-blue-700" />
 <span>Ranked Domain Suitability</span>
 </h3>
 <span className="text-xs text-slate-400 font-mono">Weighted Total: 100%</span>
 </div>

 <div className="space-y-3">
 {comparisonReport.rankedDomains.map((domain) => {
 const isSelectedCard = activeDomainId === domain.domainId;
 const isBest = domain.rank === 1;

 return (
 <div
 key={domain.domainId}
 onClick={() => setActiveDomainId(domain.domainId)}
 className={`p-4 rounded-2xl border transition-all cursor-pointer ${
 isSelectedCard
 ?'bg-blue-50/60 border-blue-600 ring-1 ring-blue-600 shadow-xs'
 :'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
 }`}
 >
 <div className="flex items-center justify-between gap-4 mb-2">
 <div className="flex items-center gap-2.5">
 <span
 className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center font-mono ${
 isBest
 ?'bg-emerald-600 text-white'
 :'bg-slate-100 text-slate-700'
 }`}
 >
 #{domain.rank}
 </span>
 <span className="text-sm font-extrabold text-slate-950">
 {domain.domain}
 </span>
 {domain.isProposedBusiness && (
 <span className="text-[10px] font-mono font-bold uppercase bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.2 rounded-full">
 Your Proposed Idea
 </span>
 )}
 {isBest && (
 <span className="text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.2 rounded-full flex items-center gap-1">
 <Sparkles className="w-2.5 h-2.5" />
 <span>Best-Fit Opportunity</span>
 </span>
 )}
 </div>

 <div className="flex items-center gap-1.5">
 <span className="text-lg font-black text-slate-950 font-mono">
 {domain.overallScore}
 </span>
 <span className="text-xs text-slate-400 font-mono">/ 100</span>
 </div>
 </div>

 {/* Progress Bar */}
 <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
 <div
 className={`h-full rounded-full transition-all duration-500 ${
 domain.overallScore >= 80
 ?'bg-gradient-to-r from-emerald-500 to-teal-600'
 : domain.overallScore >= 70
 ?'bg-gradient-to-r from-blue-600 to-indigo-600'
 : domain.overallScore >= 60
 ?'bg-gradient-to-r from-amber-500 to-orange-500'
 :'bg-gradient-to-r from-rose-500 to-red-600'
 }`}
 style={{ width:`${domain.overallScore}%` }}
 />
 </div>

 {/* Micro Factor Pills */}
 <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 font-mono flex-wrap">
 <span>Market: <strong>{domain.factors.marketOpportunity.score}</strong></span>
 <span>•</span>
 <span>Capital Fit: <strong>{domain.factors.capitalFit.score}</strong></span>
 <span>•</span>
 <span>Risk: <strong>{domain.factors.operationalRisk.score}</strong></span>
 <span>•</span>
 <span>Scheme: <strong>{domain.factors.schemeFit.score}</strong></span>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* 3. BEST-FIT BUSINESS RECOMMENDATION & WATCH OUT FOR */}
 {bestFit && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
 {/* Best Fit Card */}
 <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 shadow-xs space-y-4">
 <div className="flex items-center justify-between">
 <span className="inline-flex items-center gap-1.5 text-xs font-mono font-black uppercase text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
 <span>BEST-FIT BUSINESS</span>
 </span>
 <div className="text-right">
 <span className="text-xl font-black text-emerald-950 font-mono">{bestFit.overallScore}</span>
 <span className="text-xs text-emerald-700 font-mono"> / 100</span>
 </div>
 </div>

 <div>
 <h4 className="text-lg font-black text-slate-950">{bestFit.domain}</h4>
 <p className="text-xs text-emerald-900 mt-0.5 font-medium">
 Highest calculated suitability score for your confirmed village and capital allocation.
 </p>
 </div>

 <div className="space-y-2">
 <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">
 Why this opportunity leads:
 </span>
 <ul className="space-y-1.5 text-xs text-slate-700">
 {bestFit.whyRecommended.map((pt, idx) => (
 <li key={idx} className="flex items-start gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
 <span>{pt}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>

 {/* Watch Out For Risk Card */}
 <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 shadow-xs space-y-4">
 <div className="flex items-center justify-between">
 <span className="inline-flex items-center gap-1.5 text-xs font-mono font-black uppercase text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
 <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
 <span>WATCH OUT FOR</span>
 </span>
 <span className="text-xs text-amber-800 font-bold font-mono">Critical Caveats</span>
 </div>

 <div>
 <h4 className="text-base font-black text-slate-950">Primary Vulnerabilities</h4>
 <p className="text-xs text-amber-900 mt-0.5 font-medium">
 Key operational risk factors to safeguard against before deployment.
 </p>
 </div>

 <div className="space-y-2">
 <ul className="space-y-2 text-xs text-slate-700">
 {bestFit.riskHighlights.map((rk, idx) => (
 <li key={idx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-amber-200/80">
 <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
 <span className="leading-relaxed">{rk}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 )}

 {/* 4. Comprehensive Factor Comparison Matrix (Mobile Stacked Cards vs Desktop Table) */}
 <div className="space-y-4 pt-2">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
 <Layers className="w-4 h-4 text-blue-700" />
 <span>Comprehensive Factor Breakdown</span>
 </h3>
 </div>

 {/* Mobile View: Stacked Domain Factor Cards (below md) */}
 <div className="md:hidden space-y-4">
 {comparisonReport.rankedDomains.map((dom) => (
 <div
 key={`mob-dom-${dom.domainId}`}
 className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-2xs"
 >
 <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
 <div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-black font-mono bg-slate-900 text-white px-2 py-0.5 rounded">
 #{dom.rank}
 </span>
 <h4 className="text-sm font-black text-slate-950">{dom.domain}</h4>
 </div>
 {dom.isProposedBusiness && (
 <span className="text-[10px] text-blue-700 font-bold uppercase block mt-0.5">
 Your Proposed Idea
 </span>
 )}
 </div>

 <div className="text-right">
 <span className="text-base font-black text-slate-950 font-mono">{dom.overallScore}</span>
 <span className="text-[10px] text-slate-400 font-mono"> / 100</span>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2 text-xs">
 {factorsList.map((f) => {
 const factorData = dom.factors[f.key];
 return (
 <div key={f.key} className="bg-white p-2.5 rounded-xl border border-slate-200/70 space-y-0.5">
 <span className="text-[10px] text-slate-500 font-medium block truncate">
 {f.label}
 </span>
 <div className="flex items-center justify-between">
 <span className="font-mono font-black text-slate-950 text-xs">
 {factorData.score}
 </span>
 <span
 className={`text-[8px] font-mono font-bold uppercase px-1 py-0.2 rounded ${
 factorData.status ==='VERIFIED'
 ?'bg-emerald-50 text-emerald-800'
 : factorData.status ==='ESTIMATED'
 ?'bg-blue-50 text-blue-800'
 :'bg-slate-100 text-slate-600'
 }`}
 >
 {factorData.status ==='INSUFFICIENT DATA' ?'EST' : factorData.status}
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 ))}
 </div>

 {/* Desktop View: Full Matrix Table (md+) */}
 <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
 <table className="w-full text-left text-xs">
 <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
 <tr>
 <th className="p-3.5 min-w-[180px]">Evaluation Factor</th>
 {comparisonReport.rankedDomains.map((dom) => (
 <th key={dom.domainId} className="p-3.5 min-w-[130px] text-center">
 <div className="font-black text-slate-900">{dom.domain}</div>
 <div className="text-[10px] text-slate-400 font-mono mt-0.5">
 Rank #{dom.rank} • {dom.overallScore}/100
 </div>
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {factorsList.map((f) => (
 <tr key={f.key} className="hover:bg-slate-50/80 transition-colors">
 <td className="p-3.5 font-bold text-slate-900">
 <div>{f.label}</div>
 <span className="text-[10px] text-slate-400 font-mono">Weight: {f.weight}</span>
 </td>

 {comparisonReport.rankedDomains.map((dom) => {
 const factorData = dom.factors[f.key];
 return (
 <td key={dom.domainId} className="p-3.5 text-center">
 <div className="text-sm font-black text-slate-950 font-mono">
 {factorData.score}
 </div>
 <span
 className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase mt-1 ${
 factorData.status ==='VERIFIED'
 ?'bg-emerald-50 text-emerald-800 border border-emerald-200'
 : factorData.status ==='ESTIMATED'
 ?'bg-blue-50 text-blue-800 border border-blue-200'
 :'bg-slate-100 text-slate-600 border border-slate-300'
 }`}
 >
 {factorData.status}
 </span>
 </td>
 );
 })}
 </tr>
 ))}

 {/* Final Overall Suitability Row */}
 <tr className="bg-blue-50/50 font-black">
 <td className="p-4 text-blue-950 text-xs uppercase tracking-wider">
 Overall Suitability Score
 </td>
 {comparisonReport.rankedDomains.map((dom) => (
 <td key={dom.domainId} className="p-4 text-center">
 <span className="text-base font-black text-blue-950 font-mono">
 {dom.overallScore}
 </span>
 <span className="text-xs text-blue-700 font-mono"> / 100</span>
 </td>
 ))}
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 {/* 5. Alternative Opportunities to Consider */}
 {alternatives && alternatives.length > 0 && (
 <div className="pt-2 space-y-4">
 <div className="flex items-center gap-2">
 <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
 OTHER BUSINESS OPTIONS TO CONSIDER
 </span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {alternatives.map((alt) => (
 <div
 key={alt.domainId}
 className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 space-y-2.5 shadow-2xs hover:bg-white hover:border-blue-300 transition-all"
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-black text-slate-950">
 {alt.domain}
 </span>
 <span className="text-xs font-black text-slate-900 font-mono bg-white px-2 py-0.5 rounded-lg border border-slate-200">
 {alt.overallScore}/100
 </span>
 </div>

 <p className="text-[11px] text-slate-600 leading-relaxed">
 {alt.whyRecommended[0]}
 </p>

 <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
 <span>Rank #{alt.rank}</span>
 <span>Capital Fit: {alt.factors.capitalFit.score}/100</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
};
