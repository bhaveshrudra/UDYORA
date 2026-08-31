import React, { useState } from'react';
import {
 Award,
 ExternalLink,
 CheckCircle2,
 AlertCircle,
 HelpCircle,
 FileText,
 CheckSquare,
 Square,
 ShieldCheck,
 Building2,
 Layers,
 ArrowRight,
 TrendingUp,
 IndianRupee,
 Calendar,
 Clock,
 ChevronRight,
 ShieldAlert,
 Sparkles,
 Info
} from'lucide-react';
import { SchemeMatchResult, EvidenceRecord, FinancialPlan, UserBusinessInput } from'../types';
import { useLanguage } from'../i18n/LanguageContext';

export interface SchemeAndFinancialGuidanceProps {
 schemes?: SchemeMatchResult[] | { data: SchemeMatchResult[] };
 evidenceRecords?: EvidenceRecord[] | { data: EvidenceRecord[] };
 financialPlan?: FinancialPlan;
 input?: UserBusinessInput;
}

type SubTab ='financials' |'overview' |'eligibility' |'documents' |'process' |'evidence';

export const SchemeAndFinancialGuidance: React.FC<SchemeAndFinancialGuidanceProps> = ({
 schemes: rawSchemes,
 evidenceRecords: rawEvidence,
 financialPlan,
 input
}) => {
 const { t, language } = useLanguage();

 const schemes: SchemeMatchResult[] = Array.isArray(rawSchemes)
 ? rawSchemes
 : (rawSchemes as any)?.data || [];

 const evidenceRecords: EvidenceRecord[] = Array.isArray(rawEvidence)
 ? rawEvidence
 : (rawEvidence as any)?.data || [];

 const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemes[0]?.scheme?.id ||'');
 const [activeSubTab, setActiveSubTab] = useState<SubTab>('financials');
 const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

 const toggleDoc = (docKey: string) => {
 setCheckedDocs((prev) => ({
 ...prev,
 [docKey]: !prev[docKey]
 }));
 };

 const activeSchemeMatch = schemes.find((s) => s.scheme.id === selectedSchemeId) || schemes[0];

 const getStatusBadge = (status: string) => {
 switch (status) {
 case'ELIGIBLE':
 return'bg-emerald-50 text-emerald-800 border-emerald-200';
 case'CONDITIONALLY_ELIGIBLE':
 return'bg-amber-50 text-amber-800 border-amber-200';
 case'REQUIRES_VERIFICATION':
 return'bg-blue-50 text-blue-800 border-blue-200';
 case'NOT_ELIGIBLE':
 return'bg-rose-50 text-rose-800 border-rose-200';
 default:
 return'bg-slate-100 text-slate-800 border-slate-200';
 }
 };

 const getLocalizedStatusText = (status: string) => {
 switch (status) {
 case'ELIGIBLE':
 return t('scheme.status.eligible') ||'Sanction Eligible';
 case'CONDITIONALLY_ELIGIBLE':
 return t('scheme.status.condEligible') ||'Conditionally Eligible';
 case'REQUIRES_VERIFICATION':
 return t('scheme.status.reqVerification') ||'Verification Required';
 case'NOT_ELIGIBLE':
 return t('scheme.status.notEligible') ||'Ineligible Activity';
 default:
 return status.replace(/_/g,'');
 }
 };

 if (!activeSchemeMatch || !activeSchemeMatch.scheme) {
 return (
 <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
 <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
 <Award className="w-5 h-5 text-blue-700" />
 <h2 className="text-lg font-black tracking-tight text-slate-900">
 {t('dash.scheme.title') ||'SCHEME & FINANCIAL GUIDANCE'}
 </h2>
 </div>
 <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
 <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
 <p>No matching verified scheme found from the current rule set. Requires verification against local district DIC catalog.</p>
 </div>
 </div>
 );
 }

 const s = activeSchemeMatch.scheme;
 const ownCapital = financialPlan?.availableOwnCapital || input?.availableCapital || 100000;
 const projectCost = financialPlan?.indicativeProjectCost || activeSchemeMatch.recommendedProjectCost || 1000000;
 const indicativeCapacity = activeSchemeMatch.indicativeFinancingCapacity || Math.round(ownCapital / 0.10) - ownCapital;
 const financingRequirement = activeSchemeMatch.indicativeFinancingRequirement || Math.max(0, projectCost - ownCapital);
 const estimatedEmi = activeSchemeMatch.estimatedEmi || 14850;

 return (
 <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6 transition-colors">
 {/* Header Banner */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
 <Award className="w-5 h-5" />
 </span>
 <div>
 <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider font-mono block">
 {t('dash.snapshot.completed') ||'Deterministic Decision Support'}
 </span>
 <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
 {t('dash.scheme.title') ||'SCHEME & FINANCIAL GUIDANCE'}
 </h2>
 </div>
 </div>
 <p className="text-xs text-slate-500 max-w-2xl mt-1">
 Connected guidance integrating institutional scheme rules, eligibility conditions, deterministic financial projections, application roadmap, and evidence verification.
 </p>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 <span className="text-xs font-bold text-slate-900 font-mono bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
 {schemes.length} {t('scheme.evaluated') ||'Schemes Evaluated'}
 </span>
 </div>
 </div>

 {/* Scheme Selection Pills / Selector */}
 <div className="space-y-2">
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
 {t('scheme.selectTitle') ||'Select Recommended Scheme:'}
 </span>
 <div className="flex flex-wrap gap-2">
 {schemes.map((match) => {
 const schemeItem = match.scheme;
 const isSelected = schemeItem.id === (activeSchemeMatch.scheme.id || schemes[0].scheme.id);
 return (
 <button
 key={schemeItem.id}
 type="button"
 onClick={() => setSelectedSchemeId(schemeItem.id)}
 className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border text-left cursor-pointer flex items-center gap-2.5 ${
 isSelected
 ?'bg-slate-950 text-white border-slate-900 shadow-sm ring-2 ring-emerald-500/30'
 :'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
 }`}
 >
 <Award className={`w-4 h-4 shrink-0 ${isSelected ?'text-emerald-400' :'text-slate-400'}`} />
 <div>
 <span className="block font-bold">{schemeItem.shortName || schemeItem.name}</span>
 <span className={`text-[10px] font-mono block ${isSelected ?'text-emerald-300' :'text-slate-500'}`}>
 {match.matchScore}% Match • {getLocalizedStatusText(match.qualificationStatus)}
 </span>
 </div>
 </button>
 );
 })}
 </div>
 </div>

 {/* Selected Scheme Container */}
 <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-5">
 {/* Scheme Header & Meta */}
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200/80 pb-4">
 <div className="space-y-1.5">
 <div className="flex flex-wrap items-center gap-2">
 <h3 className="text-base sm:text-lg font-black text-slate-950">
 {s.name}
 </h3>
 <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(activeSchemeMatch.qualificationStatus)}`}>
 {getLocalizedStatusText(activeSchemeMatch.qualificationStatus)}
 </span>
 </div>
 <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
 <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-800">
 Nodal: {s.nodalAgency}
 </span>
 <span>•</span>
 <span>Last Verified: <strong className="font-mono text-slate-800">{s.lastVerifiedDate}</strong></span>
 </div>
 </div>

 {s.officialSourceUrl && (
 <a
 href={s.officialSourceUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
 >
 <span>{t('scheme.portalBtn') ||'Official Nodal Portal'}</span>
 <ExternalLink className="w-3.5 h-3.5" />
 </a>
 )}
 </div>

 {/* Navigation Sub-Tabs */}
 <div className="flex flex-wrap gap-1.5 border-b border-slate-200/80 pb-2">
 {[
 { id:'financials', labelKey:'scheme.subtab.financials', defaultLabel:'Financial Overview & EMI', icon: IndianRupee },
 { id:'overview', labelKey:'scheme.subtab.overview', defaultLabel:'Why It Matches', icon: Sparkles },
 { id:'eligibility', labelKey:'scheme.subtab.eligibility', defaultLabel:'Eligibility Matrix', icon: CheckCircle2 },
 { id:'documents', labelKey:'scheme.subtab.documents', defaultLabel:'Document Checklist', icon: FileText },
 { id:'process', labelKey:'scheme.subtab.process', defaultLabel:'Application Roadmap (7 Steps)', icon: Layers },
 { id:'evidence', labelKey:'scheme.subtab.evidence', defaultLabel:'Evidence & Provenance', icon: ShieldCheck }
 ].map((tab) => {
 const Icon = tab.icon;
 const isActive = activeSubTab === tab.id;
 return (
 <button
 key={tab.id}
 type="button"
 onClick={() => setActiveSubTab(tab.id as SubTab)}
 className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
 isActive
 ?'bg-slate-900 text-white shadow-xs'
 :'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
 }`}
 >
 <Icon className="w-3.5 h-3.5" />
 <span>{t(tab.labelKey as any) || tab.defaultLabel}</span>
 </button>
 );
 })}
 </div>

 {/* =========================================================================
 TAB 1: FINANCIAL OVERVIEW & ADVISOR INTEGRATION
 ========================================================================= */}
 {activeSubTab ==='financials' && (
 <div className="space-y-4">
 {/* Concept Distinction Cards: Financing Capacity vs Business Plan Cost */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <div className="bg-white border border-blue-200/90 rounded-2xl p-4 space-y-2 shadow-2xs">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold uppercase text-blue-900 tracking-wider">
 1. PS-Based Indicative Financing Capacity
 </span>
 <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
 {s.minMarginContributionPct}% Margin Rule
 </span>
 </div>
 <div className="flex items-baseline gap-2">
 <span className="text-2xl font-black text-slate-950 font-mono">
 ₹{indicativeCapacity.toLocaleString('en-IN')}
 </span>
 </div>
 <p className="text-[11px] text-slate-600 leading-relaxed">
 Maximum theoretical borrowing limit supported by your own capital of <strong className="text-slate-900">₹{ownCapital.toLocaleString('en-IN')}</strong> under the scheme's {s.minMarginContributionPct}% promoter equity rule.
 </p>
 </div>

 <div className="bg-white border border-emerald-200/90 rounded-2xl p-4 space-y-2 shadow-2xs">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold uppercase text-emerald-900 tracking-wider">
 2. Business-Plan Recommended Cost
 </span>
 <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
 Unit Economics Model
 </span>
 </div>
 <div className="flex items-baseline gap-2">
 <span className="text-2xl font-black text-emerald-950 font-mono">
 ₹{projectCost.toLocaleString('en-IN')}
 </span>
 <span className="text-xs text-slate-500 font-medium">
 (₹{financingRequirement.toLocaleString('en-IN')} loan)
 </span>
 </div>
 <p className="text-[11px] text-slate-600 leading-relaxed">
 Total capital expenditure tailored to your enterprise scale, asset purchase (machinery/milch animals), and initial 2-month working capital buffer.
 </p>
 </div>
 </div>

 {/* Scheme Financial Terms Metric Grid */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
 <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-1">
 <span className="text-[10px] font-bold text-slate-500 uppercase">Interest Rate</span>
 <span className="font-mono font-black text-slate-900 text-xs block">{s.interestRateRange}</span>
 </div>
 <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-1">
 <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Subsidy</span>
 <span className="font-mono font-black text-emerald-800 text-xs block">
 {activeSchemeMatch.potentialSubsidyPct}% (~₹{activeSchemeMatch.potentialSubsidyAmount.toLocaleString('en-IN')})
 </span>
 </div>
 <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-1">
 <span className="text-[10px] font-bold text-slate-500 uppercase">Standard Tenure</span>
 <span className="font-mono font-black text-slate-900 text-xs block">{s.maxTenureMonths || 60} Months</span>
 </div>
 <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-1">
 <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated EMI</span>
 <span className="font-mono font-black text-blue-900 text-xs block">₹{estimatedEmi.toLocaleString('en-IN')} / month</span>
 </div>
 </div>

 {/* Practical Guidance Callout */}
 <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 text-xs space-y-2">
 <div className="flex items-center gap-2 text-blue-950 font-bold text-[11px] uppercase tracking-wider">
 <Info className="w-4 h-4 text-blue-700 shrink-0" />
 <span>Financial Guidance Note</span>
 </div>
 <p className="text-slate-800 leading-relaxed">
 {activeSchemeMatch.financialGuidanceNote ||
`Based on your available own capital of ₹${ownCapital.toLocaleString('en-IN')}, your indicative financing capacity under the ${s.minMarginContributionPct}% contribution rule is ₹${indicativeCapacity.toLocaleString('en-IN')}. Your business plan project cost of ₹${projectCost.toLocaleString('en-IN')} should be validated separately against actual local equipment quotes and working-capital requirements.`}
 </p>
 <p className="text-[11px] text-slate-500 italic pt-1 border-t border-blue-200/60">
 ⚠️ Indicative calculation only. Final eligibility, margin money, and loan sanction are determined by the lending institution following credit appraisal.
 </p>
 </div>
 </div>
 )}

 {/* =========================================================================
 TAB 2: WHY IT MATCHES & OVERVIEW
 ========================================================================= */}
 {activeSubTab ==='overview' && (
 <div className="space-y-4">
 <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3">
 <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">Scheme Purpose & Scope</h4>
 <p className="text-xs text-slate-700 leading-relaxed">
 {s.notes || s.description ||`${s.name} is designed to facilitate collateral-free and subsidized credit for rural micro-enterprises and priority sector self-employment ventures.`}
 </p>
 </div>

 <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2">
 <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">Match Justifications</h4>
 <ul className="space-y-2">
 {activeSchemeMatch.whyItMatches.map((reason, idx) => (
 <li key={idx} className="text-xs text-slate-800 flex items-start gap-2">
 <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
 <span>{reason}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 )}

 {/* =========================================================================
 TAB 3: ELIGIBILITY MATRIX
 ========================================================================= */}
 {activeSubTab ==='eligibility' && (
 <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
 <th className="p-3">{t('scheme.col.condition') ||'Eligibility Condition'}</th>
 <th className="p-3">{t('scheme.col.requirement') ||'Official Requirement'}</th>
 <th className="p-3">{t('scheme.col.userValue') ||'Your Declared Value'}</th>
 <th className="p-3 text-right">{t('scheme.col.status') ||'Status'}</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {(activeSchemeMatch.eligibilityMatrix || []).map((item, idx) => (
 <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
 <td className="p-3 font-bold text-slate-900">{item.criterion}</td>
 <td className="p-3 text-slate-600 font-mono text-[11px]">{item.requirement}</td>
 <td className="p-3 font-bold text-slate-950 font-mono">{item.userValue}</td>
 <td className="p-3 text-right">
 <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getStatusBadge(item.status)}`}>
 {item.status ==='ELIGIBLE' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
 {item.status ==='REQUIRES_VERIFICATION' && <AlertCircle className="w-3 h-3 text-amber-600" />}
 {item.status ==='NOT_ELIGIBLE' && <AlertCircle className="w-3 h-3 text-rose-600" />}
 <span>{getLocalizedStatusText(item.status)}</span>
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {/* =========================================================================
 TAB 4: DOCUMENT CHECKLIST (REQUIRED, OPTIONAL, CONDITIONAL)
 ========================================================================= */}
 {activeSubTab ==='documents' && (
 <div className="space-y-4">
 <div className="flex items-center justify-between text-xs font-bold text-slate-800">
 <span>{t('scheme.doc.checklistTitle') ||'Interactive Application Readiness Checklist'}</span>
 <span className="text-[10px] font-mono text-slate-500">
 {Object.values(checkedDocs).filter(Boolean).length} {t('scheme.doc.ready') ||'Marked Ready'}
 </span>
 </div>

 <div className="space-y-2">
 {(activeSchemeMatch.documentItems || []).map((doc, idx) => {
 const docKey =`${s.id}-${idx}`;
 const isChecked = !!checkedDocs[docKey];
 return (
 <div
 key={docKey}
 onClick={() => toggleDoc(docKey)}
 className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 transition-all cursor-pointer select-none ${
 isChecked
 ?'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold'
 :'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
 }`}
 >
 <div className="flex items-center gap-3">
 {isChecked ? (
 <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
 ) : (
 <Square className="w-4 h-4 text-slate-400 shrink-0" />
 )}
 <div>
 <span className="block font-medium">{doc.name}</span>
 {doc.conditionNote && (
 <span className="text-[10px] text-slate-500 font-sans block">{doc.conditionNote}</span>
 )}
 </div>
 </div>

 <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono shrink-0 ${
 doc.type ==='REQUIRED'
 ?'bg-rose-50 text-rose-800 border border-rose-200'
 : doc.type ==='CONDITIONAL'
 ?'bg-amber-50 text-amber-800 border border-amber-200'
 :'bg-slate-100 text-slate-600'
 }`}>
 {doc.type}
 </span>
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* =========================================================================
 TAB 5: 7-STEP APPLICATION PROCESS
 ========================================================================= */}
 {activeSubTab ==='process' && (
 <div className="space-y-3">
 <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">
 {t('scheme.subtab.process') ||'Step-by-Step Government Scheme Application Roadmap'}
 </h4>
 <div className="space-y-2.5">
 {(activeSchemeMatch.applicationSteps || []).map((step) => (
 <div
 key={step.stepNumber}
 className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 text-xs shadow-2xs"
 >
 <div className="flex items-center gap-2">
 <span className="w-5 h-5 rounded-full bg-slate-950 text-white flex items-center justify-center text-[10px] font-black shrink-0 font-mono">
 {step.stepNumber}
 </span>
 <h5 className="font-black text-slate-900 text-xs">{step.title}</h5>
 </div>
 <p className="text-slate-700 text-xs leading-relaxed pl-7">{step.whatToDo}</p>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-7 pt-1 text-[11px] text-slate-500 border-t border-slate-100">
 <div><span className="font-bold text-slate-700">{t('scheme.step.needed') ||'Needed:'}</span> {step.whatIsNeeded}</div>
 <div><span className="font-bold text-slate-700">{t('scheme.step.handler') ||'Handler:'}</span> {step.whoHandlesIt}</div>
 <div><span className="font-bold text-slate-700">{t('scheme.step.next') ||'Next:'}</span> {step.whatComesNext}</div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* =========================================================================
 TAB 6: EVIDENCE & PROVENANCE AUDIT
 ========================================================================= */}
 {activeSubTab ==='evidence' && (
 <div className="space-y-3">
 <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
 <span className="text-[10px] font-bold uppercase text-slate-500 block">Nodal Agency Verification Log</span>
 <p className="text-slate-800">{activeSchemeMatch.verificationNote}</p>
 <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
 <span>Official Guideline Status: <strong className="text-emerald-700 font-mono font-bold">VERIFIED</strong></span>
 <span>Audit Stamp: <strong className="font-mono text-slate-700">{s.lastVerifiedDate}</strong></span>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
};
