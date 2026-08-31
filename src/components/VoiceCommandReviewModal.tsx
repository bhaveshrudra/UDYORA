import React from'react';
import {
 Mic,
 MicOff,
 Sparkles,
 CheckCircle2,
 AlertTriangle,
 HelpCircle,
 RotateCcw,
 Edit3,
 X,
 IndianRupee,
 Briefcase,
 Layers,
 ChevronRight,
 ArrowRight
} from'lucide-react';
import {
 ParsedBusinessCommand,
 AmbiguityOption,
 BusinessCategoryKey,
 CATEGORY_LABELS
} from'../services/businessInputParser';
import { SpeechListeningState } from'../services/speechRecognition';
import { SupportedLanguage } from'../i18n/types';

interface VoiceCommandReviewModalProps {
 isOpen: boolean;
 listeningState: SpeechListeningState;
 liveTranscript: string;
 parsedResult: ParsedBusinessCommand | null;
 errorMessage: string | null;
 activeLanguage: SupportedLanguage;
 onApply: (command: ParsedBusinessCommand) => void;
 onSelectAmbiguityOption: (option: AmbiguityOption) => void;
 onEditManually: () => void;
 onTryAgain: () => void;
 onClose: () => void;
}

const CATEGORY_ICONS: Record<BusinessCategoryKey, string> = {
 dairy:'🐄',
 tailoring:'🧵',
 retail:'🛍️',
 poultry:'🐔',
 custom:'💼'
};

export const VoiceCommandReviewModal: React.FC<VoiceCommandReviewModalProps> = ({
 isOpen,
 listeningState,
 liveTranscript,
 parsedResult,
 errorMessage,
 activeLanguage,
 onApply,
 onSelectAmbiguityOption,
 onEditManually,
 onTryAgain,
 onClose
}) => {
 if (!isOpen) return null;

 const isRecording = listeningState ==='LISTENING' || listeningState ==='TRANSCRIBING';

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn select-none">
 <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp overflow-hidden">
 {/* Header */}
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
 <Mic className="w-4 h-4" />
 </div>
 <div>
 <h3 className="text-sm font-black text-slate-950">Voice Business Input</h3>
 <p className="text-[11px] font-semibold text-slate-500">
 Speak your business idea, required scale, and available capital
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={onClose}
 className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* 1. RECORDING & LIVE LISTENING STATE */}
 {isRecording && (
 <div className="py-6 text-center space-y-4 bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
 <div className="relative inline-flex items-center justify-center">
 <div className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg animate-pulse">
 <Mic className="w-8 h-8" />
 </div>
 <div className="absolute inset-0 rounded-full border-4 border-rose-400/40 animate-ping" />
 </div>

 <div className="space-y-1">
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800">
 <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
 <span>{listeningState ==='LISTENING' ?'Listening...' :'Transcribing Speech...'}</span>
 </div>
 <p className="text-xs text-slate-600 font-medium pt-1">
 Say something like: <br />
 <span className="font-bold text-slate-800">“I want to start a dairy farm with 8 cows and ₹1.5 lakh capital.”</span>
 </p>
 </div>

 {/* Real-time streaming transcript */}
 {liveTranscript && (
 <div className="mt-2 p-3 bg-white rounded-xl border border-blue-200/80 text-xs font-bold text-slate-900 shadow-2xs text-left">
 <span className="text-[10px] uppercase font-mono text-blue-600 block">Live Recognized Words:</span>
 <p className="mt-0.5 italic">“{liveTranscript}”</p>
 </div>
 )}
 </div>
 )}

 {/* 2. ERROR NOTICE */}
 {errorMessage && !isRecording && (
 <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
 <div className="flex items-start gap-2.5">
 <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
 <div className="space-y-0.5">
 <h4 className="text-xs font-black text-rose-950">Voice Recognition Notice</h4>
 <p className="text-xs text-rose-700 font-medium leading-relaxed">{errorMessage}</p>
 </div>
 </div>
 <div className="flex items-center gap-2 pt-1">
 <button
 type="button"
 onClick={onTryAgain}
 className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
 >
 <RotateCcw className="w-3.5 h-3.5" />
 <span>Try Again</span>
 </button>
 <button
 type="button"
 onClick={onEditManually}
 className="px-3.5 py-1.5 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
 >
 Enter Details Manually
 </button>
 </div>
 </div>
 )}

 {/* 3. PARSED RESULTS REVIEW: CLEAR CONFIDENCE */}
 {!isRecording && !errorMessage && parsedResult && parsedResult.confidence ==='CLEAR' && (
 <div className="space-y-4">
 <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-3.5 py-2">
 <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
 Speech Understood Clearly
 </span>
 <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
 Confidence: High
 </span>
 </div>

 {/* Recognized Raw Text */}
 <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
 Recognized Voice Input:
 </span>
 <p className="font-semibold text-slate-900 italic">“{parsedResult.rawTranscript}”</p>
 </div>

 {/* Extracted Business Parameters */}
 <div className="grid grid-cols-2 gap-3">
 <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-1">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block flex items-center gap-1">
 <Briefcase className="w-3 h-3" />
 Business Sector
 </span>
 <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
 <span className="text-base">{parsedResult.category ? CATEGORY_ICONS[parsedResult.category] :'💼'}</span>
 <span>{parsedResult.categoryLabel}</span>
 </p>
 </div>

 <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-1">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 block flex items-center gap-1">
 <IndianRupee className="w-3 h-3" />
 Own Capital
 </span>
 <p className="text-xs font-black text-slate-900 font-mono">
 {parsedResult.capitalFormatted ||'Not stated (kept ₹1,00,000)'}
 </p>
 </div>
 </div>

 {parsedResult.scaleQuantity && (
 <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-2">
 <Layers className="w-4 h-4 text-amber-700 shrink-0" />
 <span>Operating Scale Detected: {parsedResult.scaleQuantity}</span>
 </div>
 )}

 {/* Action Buttons */}
 <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
 <button
 type="button"
 onClick={() => onApply(parsedResult)}
 className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl transition-all cursor-pointer shadow-md active:scale-[0.99] flex items-center justify-center gap-1.5"
 >
 <CheckCircle2 className="w-4 h-4" />
 <span>Use This Input</span>
 </button>

 <button
 type="button"
 onClick={onEditManually}
 className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
 >
 <Edit3 className="w-3.5 h-3.5 text-slate-600" />
 <span>Edit</span>
 </button>

 <button
 type="button"
 onClick={onTryAgain}
 className="py-2.5 px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
 >
 <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
 <span>Try Again</span>
 </button>
 </div>
 </div>
 )}

 {/* 4. PARSED RESULTS REVIEW: AMBIGUOUS CONFIDENCE */}
 {!isRecording && !errorMessage && parsedResult && parsedResult.confidence ==='AMBIGUOUS' && (
 <div className="space-y-4">
 <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2">
 <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
 <HelpCircle className="w-4 h-4 text-amber-600" />
 Clarification Required
 </span>
 <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
 Ambiguous Input
 </span>
 </div>

 <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
 You said:
 </span>
 <p className="font-semibold text-slate-900 italic">“{parsedResult.rawTranscript}”</p>
 </div>

 <div className="space-y-2">
 <p className="text-xs font-black text-slate-900">
 {parsedResult.ambiguityQuestion ||'Which specific business type did you mean?'}
 </p>

 <div className="space-y-2">
 {parsedResult.ambiguityOptions?.map((opt, idx) => (
 <button
 key={idx}
 type="button"
 onClick={() => onSelectAmbiguityOption(opt)}
 className="w-full text-left p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 bg-white transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
 >
 <div className="flex items-center gap-2.5">
 <span className="text-lg">{CATEGORY_ICONS[opt.category]}</span>
 <div>
 <h4 className="text-xs font-black text-slate-950 group-hover:text-blue-700">
 {opt.label}
 </h4>
 <p className="text-[10px] text-slate-500 font-medium">
 {opt.suggestedIdea}
 </p>
 </div>
 </div>
 <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
 </button>
 ))}
 </div>
 </div>

 <div className="flex items-center justify-between pt-2 border-t border-slate-100">
 <button
 type="button"
 onClick={onTryAgain}
 className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
 >
 <RotateCcw className="w-3.5 h-3.5" />
 <span>Speak Again</span>
 </button>
 <button
 type="button"
 onClick={onEditManually}
 className="px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 cursor-pointer"
 >
 <Edit3 className="w-3.5 h-3.5" />
 <span>Type Manually</span>
 </button>
 </div>
 </div>
 )}

 {/* 5. PARSED RESULTS REVIEW: INSUFFICIENT CONFIDENCE */}
 {!isRecording && !errorMessage && parsedResult && parsedResult.confidence ==='INSUFFICIENT' && (
 <div className="space-y-4">
 <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-2xl px-3.5 py-2">
 <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
 <AlertTriangle className="w-4 h-4 text-rose-600" />
 Insufficient Business Details
 </span>
 <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
 Incomplete
 </span>
 </div>

 <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
 Recognized Speech:
 </span>
 <p className="font-semibold text-slate-900 italic">“{parsedResult.rawTranscript}”</p>
 </div>

 <p className="text-xs font-semibold text-slate-700 leading-relaxed">
 {parsedResult.feedbackMessage ||'Please specify the exact business type (such as Dairy Farming, Kirana Retail, Garment Tailoring, or Poultry) and your approximate capital.'}
 </p>

 <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
 <button
 type="button"
 onClick={onTryAgain}
 className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
 >
 <RotateCcw className="w-3.5 h-3.5" />
 <span>Try Speaking Again</span>
 </button>
 <button
 type="button"
 onClick={onEditManually}
 className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
 >
 Enter Manually
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
};
