import React, { useEffect, useRef } from'react';
import { X } from'lucide-react';
import { useLanguage } from'../../i18n/LanguageContext';

export interface DetailModalProps {
 isOpen: boolean;
 onClose: () => void;
 title: string;
 subtitle?: string;
 icon?: React.ReactNode;
 children: React.ReactNode;
 maxWidthClass?: string;
}

export const DetailModal: React.FC<DetailModalProps> = ({
 isOpen,
 onClose,
 title,
 subtitle,
 icon,
 children,
 maxWidthClass ='max-w-4xl'
}) => {
 const { t } = useLanguage();
 const modalRef = useRef<HTMLDivElement | null>(null);
 const previousActiveElementRef = useRef<HTMLElement | null>(null);

 // 1. Lock Body Scroll and Handle Focus / ESC Key
 useEffect(() => {
 if (!isOpen) return;

 // Save active element to restore focus on close
 previousActiveElementRef.current = document.activeElement as HTMLElement;

 // Lock body scroll
 const originalStyle = document.body.style.overflow;
 document.body.style.overflow ='hidden';

 // ESC Key listener
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key ==='Escape') {
 e.preventDefault();
 onClose();
 }
 };

 window.addEventListener('keydown', handleKeyDown);

 // Set focus inside modal
 if (modalRef.current) {
 modalRef.current.focus();
 }

 return () => {
 document.body.style.overflow = originalStyle;
 window.removeEventListener('keydown', handleKeyDown);
 if (previousActiveElementRef.current && previousActiveElementRef.current.focus) {
 previousActiveElementRef.current.focus();
 }
 };
 }, [isOpen, onClose]);

 if (!isOpen) return null;

 return (
 <div
 aria-modal="true"
 role="dialog"
 aria-label={title}
 className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in duration-150"
 onClick={(e) => {
 if (e.target === e.currentTarget) {
 onClose();
 }
 }}
 >
 <div
 ref={modalRef}
 tabIndex={-1}
 className={`bg-white rounded-t-3xl sm:rounded-3xl w-full ${maxWidthClass} h-[92vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl border border-slate-200/90 overflow-hidden outline-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150`}
 >
 {/* Header Bar */}
 <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50 flex items-start justify-between gap-3 shrink-0">
 <div className="flex items-center gap-3">
 {icon && <div className="p-2 bg-blue-100/80 text-blue-900 rounded-xl shrink-0">{icon}</div>}
 <div>
 <h2 className="text-sm sm:text-base font-black text-slate-950 tracking-tight">{title}</h2>
 {subtitle && <p className="text-xs font-semibold text-slate-500 mt-0.5">{subtitle}</p>}
 </div>
 </div>
 <button
 type="button"
 onClick={onClose}
 aria-label="Close dialog"
 className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200/80 transition-colors cursor-pointer shrink-0"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Scrollable Body Content */}
 <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-slate-800">
 {children}
 </div>

 {/* Footer Bar */}
 <div className="p-3 sm:p-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
 <button
 type="button"
 onClick={onClose}
 className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-2xs"
 >
 {t('dash.advisory.closeModal') ||'Close'}
 </button>
 </div>
 </div>
 </div>
 );
};
