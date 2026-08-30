import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Info,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  Database,
  X,
  Layers
} from 'lucide-react';
import { SwotAnalysis, SwotItem } from '../types/swotTypes';
import { EvidenceRecord } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface SwotAnalysisSectionProps {
  swotAnalysis?: SwotAnalysis;
  evidenceAuditLog?: EvidenceRecord[];
}

export const SwotAnalysisSection: React.FC<SwotAnalysisSectionProps> = ({
  swotAnalysis,
  evidenceAuditLog = []
}) => {
  const { t, language } = useLanguage();
  const [selectedItemForEvidence, setSelectedItemForEvidence] = useState<SwotItem | null>(null);

  if (!swotAnalysis) return null;

  const { strengths, weaknesses, opportunities, threats, dataQuality } = swotAnalysis;

  // Find linked evidence records for modal
  const matchedEvidenceRecords = selectedItemForEvidence
    ? evidenceAuditLog.filter((ev) =>
        selectedItemForEvidence.evidenceIds.includes(ev.id) ||
        selectedItemForEvidence.evidenceIds.some((id) => ev.id.includes(id) || id.includes(ev.id))
      )
    : [];

  const labels = {
    en: {
      sectionTitle: 'Evidence-Based SWOT Analysis',
      sectionSubtitle: 'Strategic synthesis derived deterministically from validated business, market, location, and financial evidence.',
      strengths: 'Strengths',
      weaknesses: 'Weaknesses',
      opportunities: 'Opportunities',
      threats: 'Threats',
      viewEvidence: 'View Evidence',
      closeModal: 'Close',
      evidenceModalTitle: 'Source Evidence & Provenance',
      noEvidenceFound: 'No explicit primary registry metric ID attached. Derived from validated operational formula.'
    },
    hi: {
      sectionTitle: 'प्रमाण-आधारित स्वाट (SWOT) विश्लेषण',
      sectionSubtitle: 'सत्यापित व्यवसाय, बाज़ार, स्थान और वित्तीय साक्ष्यों से तैयार रणनीतिक विश्लेषण।',
      strengths: 'शक्तियाँ (Strengths)',
      weaknesses: 'कमजोरियाँ (Weaknesses)',
      opportunities: 'अवसर (Opportunities)',
      threats: 'चुनौतियां / खतरे (Threats)',
      viewEvidence: 'प्रमाण देखें',
      closeModal: 'बंद करें',
      evidenceModalTitle: 'मूल साक्ष्य एवं स्रोत विवरण',
      noEvidenceFound: 'कोई प्रत्यक्ष रजिस्ट्री मीट्रिक नहीं। मानक फॉर्मूले के आधार पर प्राप्त।'
    },
    mr: {
      sectionTitle: 'पुरावा-आधारित स्वाट (SWOT) विश्लेषण',
      sectionSubtitle: 'सत्यापित व्यवसाय, बाजार, स्थान आणि आर्थिक पुराव्यांवर आधारित धोरणात्मक विश्लेषण.',
      strengths: 'सामर्थ्य (Strengths)',
      weaknesses: 'उणिवा (Weaknesses)',
      opportunities: 'संधी (Opportunities)',
      threats: 'धोके / आव्हाने (Threats)',
      viewEvidence: 'पुरावा पहा',
      closeModal: 'बंद करा',
      evidenceModalTitle: 'मूळ पुरावा आणि स्रोत तपशील',
      noEvidenceFound: 'प्रत्यक्ष नोंदणी मेट्रिक उपलब्ध नाही. प्रमाणित सूत्रावरून काढलेले.'
    },
    te: {
      sectionTitle: 'సాక్ష్యాధారిత SWOT విశ్లేషణ',
      sectionSubtitle: 'ధృవీకరించబడిన వ్యాపార, మార్కెట్, స్థాన మరియు ఆర్థిక ఆధారాల నుండి రూపొందించిన వ్యూహాత్మక విశ్లేషణ.',
      strengths: 'బలాలు (Strengths)',
      weaknesses: 'బలహీనతలు (Weaknesses)',
      opportunities: 'అవకాశాలు (Opportunities)',
      threats: 'ముప్పులు / సవాళ్లు (Threats)',
      viewEvidence: 'సాక్ష్యం చూడండి',
      closeModal: 'మూసివేయి',
      evidenceModalTitle: 'మూల సాక్ష్యం & వివరణ',
      noEvidenceFound: 'ప్రత్యక్ష రిజిస్ట్రీ మెట్రిక్ లేదు. ప్రామాణిక సూత్రం నుండి లెక్కించబడింది.'
    },
    kn: {
      sectionTitle: 'ಸಾಕ್ಷ್ಯಾಧಾರಿತ SWOT ವಿಶ್ಲೇಷಣೆ',
      sectionSubtitle: 'ಪರಿಶೀಲಿಸಿದ ಉದ್ಯಮ, ಮಾರುಕಟ್ಟೆ, ಸ್ಥಳ ಮತ್ತು ಹಣಕಾಸು ಪುರಾವೆಗಳಿಂದ ಪಡೆದ ಕಾರ್ಯತಂತ್ರದ ವಿಶ್ಲೇಷಣೆ.',
      strengths: 'ಸಾಮರ್ಥ್ಯಗಳು (Strengths)',
      weaknesses: 'ದೌರ್ಬಲ್ಯಗಳು (Weaknesses)',
      opportunities: 'ಅವಕಾಶಗಳು (Opportunities)',
      threats: 'ಬೆದರಿಕೆಗಳು (Threats)',
      viewEvidence: 'ಸಾಕ್ಷ್ಯ ವೀಕ್ಷಿಸಿ',
      closeModal: 'ಮುಚ್ಚಿ',
      evidenceModalTitle: 'ಮೂಲ ಸಾಕ್ಷ್ಯ ಮತ್ತು ವಿವರಗಳು',
      noEvidenceFound: 'ಯಾವುದೇ ನೇರ ರಿಜಿಸ್ಟ್ರಿ ಮೆಟ್ರಿಕ್ ಇಲ್ಲ. ಅಧಿಕೃತ ಸೂತ್ರದಿಂದ ಪಡೆಯಲಾಗಿದೆ.'
    }
  }[language] || {
    sectionTitle: 'Evidence-Based SWOT Analysis',
    sectionSubtitle: 'Strategic synthesis derived deterministically from validated business, market, location, and financial evidence.',
    strengths: 'Strengths',
    weaknesses: 'Weaknesses',
    opportunities: 'Opportunities',
    threats: 'Threats',
    viewEvidence: 'View Evidence',
    closeModal: 'Close',
    evidenceModalTitle: 'Source Evidence & Provenance',
    noEvidenceFound: 'No explicit primary registry metric ID attached. Derived from validated operational formula.'
  };

  return (
    <div id="swot" className="scroll-mt-24 space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
              {labels.sectionTitle}
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Deterministic Evidence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {labels.sectionSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">Data Quality:</span>
          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-slate-100 text-slate-800 border border-slate-200">
            {dataQuality}
          </span>
        </div>
      </div>

      {/* 2x2 SWOT Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. STRENGTHS (Top Left - Emerald) */}
        <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                S
              </div>
              <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                {labels.strengths}
              </h3>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {strengths.length} Factors
            </span>
          </div>

          <div className="space-y-2.5">
            {strengths.map((item) => (
              <div
                key={item.id}
                className="bg-white/95 border border-emerald-100 rounded-xl p-3 space-y-1.5 shadow-2xs hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                  {item.badgeLabel && (
                    <span className="shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.badgeLabel}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.explanation}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                  <span className="text-slate-400 font-medium">
                    Source: <strong className="text-slate-700">{item.sourceType}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedItemForEvidence(item)}
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{labels.viewEvidence}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. WEAKNESSES (Top Right - Amber) */}
        <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                W
              </div>
              <h3 className="text-sm font-black text-amber-950 uppercase tracking-wide">
                {labels.weaknesses}
              </h3>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              {weaknesses.length} Factors
            </span>
          </div>

          <div className="space-y-2.5">
            {weaknesses.map((item) => (
              <div
                key={item.id}
                className="bg-white/95 border border-amber-100 rounded-xl p-3 space-y-1.5 shadow-2xs hover:border-amber-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                  {item.badgeLabel && (
                    <span className="shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      {item.badgeLabel}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.explanation}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                  <span className="text-slate-400 font-medium">
                    Source: <strong className="text-slate-700">{item.sourceType}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedItemForEvidence(item)}
                    className="text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{labels.viewEvidence}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. OPPORTUNITIES (Bottom Left - Indigo/Blue) */}
        <div className="bg-blue-50/40 border border-blue-200/80 rounded-2xl p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-blue-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                O
              </div>
              <h3 className="text-sm font-black text-blue-950 uppercase tracking-wide">
                {labels.opportunities}
              </h3>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-blue-100 text-blue-800 border border-blue-300">
              {opportunities.length} Factors
            </span>
          </div>

          <div className="space-y-2.5">
            {opportunities.map((item) => (
              <div
                key={item.id}
                className="bg-white/95 border border-blue-100 rounded-xl p-3 space-y-1.5 shadow-2xs hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                  {item.badgeLabel && (
                    <span className="shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                      {item.badgeLabel}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.explanation}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                  <span className="text-slate-400 font-medium">
                    Source: <strong className="text-slate-700">{item.sourceType}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedItemForEvidence(item)}
                    className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{labels.viewEvidence}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. THREATS (Bottom Right - Rose/Red) */}
        <div className="bg-rose-50/40 border border-rose-200/80 rounded-2xl p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-rose-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                T
              </div>
              <h3 className="text-sm font-black text-rose-950 uppercase tracking-wide">
                {labels.threats}
              </h3>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-100 text-rose-800 border border-rose-300">
              {threats.length} Factors
            </span>
          </div>

          <div className="space-y-2.5">
            {threats.map((item) => (
              <div
                key={item.id}
                className="bg-white/95 border border-rose-100 rounded-xl p-3 space-y-1.5 shadow-2xs hover:border-rose-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                  {item.badgeLabel && (
                    <span className="shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                      {item.badgeLabel}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.explanation}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                  <span className="text-slate-400 font-medium">
                    Source: <strong className="text-slate-700">{item.sourceType}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedItemForEvidence(item)}
                    className="text-rose-700 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{labels.viewEvidence}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence Provenance Modal */}
      {selectedItemForEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>{labels.evidenceModalTitle}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Factor: <strong className="text-slate-900">{selectedItemForEvidence.title}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedItemForEvidence(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Strategic Finding
                </span>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {selectedItemForEvidence.explanation}
                </p>
                {selectedItemForEvidence.metricReference && (
                  <p className="text-[11px] font-bold text-emerald-700 pt-1">
                    Metric Value: {selectedItemForEvidence.metricReference}
                  </p>
                )}
              </div>

              {matchedEvidenceRecords.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Verified Primary Records
                  </span>
                  {matchedEvidenceRecords.map((ev) => (
                    <div key={ev.id} className="border border-slate-200 rounded-xl p-3 bg-white space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{ev.metricName}</span>
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                          {ev.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Value: <strong>{String(ev.value)} {ev.unit || ''}</strong>
                      </p>
                      <p className="text-slate-500 text-[10px]">
                        Source: {ev.source} ({ev.geographicLevel})
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
                  {labels.noEvidenceFound}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedItemForEvidence(null)}
                className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {labels.closeModal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
