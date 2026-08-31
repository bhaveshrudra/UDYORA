import React, { Component, ReactNode, ErrorInfo } from'react';
import { ShieldAlert, RotateCcw, Home } from'lucide-react';

interface Props {
 children: ReactNode;
 fallbackTitle?: string;
 onReset?: () => void;
 onNavigateHome?: () => void;
}

interface State {
 hasError: boolean;
 error: Error | null;
 errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends (Component as any) {
 state: State = {
 hasError: false,
 error: null,
 errorInfo: null
 };

 static getDerivedStateFromError(error: Error): State {
 return { hasError: true, error, errorInfo: null };
 }

 componentDidCatch(error: Error, errorInfo: ErrorInfo) {
 console.error('UDYORA Runtime Error Caught by Boundary:', error, errorInfo);
 this.setState({ error, errorInfo });
 }

 handleTryAgain = () => {
 this.setState({ hasError: false, error: null, errorInfo: null });
 if (this.props.onReset) {
 this.props.onReset();
 } else {
 window.location.reload();
 }
 };

 handleGoHome = () => {
 if (this.props.onNavigateHome) {
 this.props.onNavigateHome();
 } else {
 window.location.href ='/';
 }
 };

 render(): ReactNode {
 if (this.state.hasError) {
 return (
 <div className="w-full max-w-3xl mx-auto my-8 p-6 sm:p-8 bg-white border border-rose-200 rounded-2xl shadow-sm space-y-6">
 <div className="flex items-center gap-3 border-b border-rose-100 pb-4">
 <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
 <ShieldAlert className="w-6 h-6" />
 </div>
 <div>
 <span className="text-xs font-black uppercase tracking-wider text-rose-800">
 UDYORA
 </span>
 <h2 className="text-lg font-bold text-slate-900">
 {this.props.fallbackTitle ||'Something went wrong while loading this page.'}
 </h2>
 </div>
 </div>

 <p className="text-sm text-slate-600 leading-relaxed">
 An unexpected error occurred. You can retry the action or return to the home page.
 </p>

 {/* Development Debug Info */}
 {this.state.error && (
 <div className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto space-y-2">
 <p className="text-rose-400 font-bold">
 {this.state.error.name}: {this.state.error.message}
 </p>
 {this.state.error.stack && (
 <pre className="text-[11px] text-slate-400 whitespace-pre-wrap">
 {this.state.error.stack}
 </pre>
 )}
 </div>
 )}

 <div className="flex flex-wrap items-center gap-3 pt-2">
 <button
 onClick={this.handleTryAgain}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 transition-colors cursor-pointer shadow-xs"
 >
 <RotateCcw className="w-4 h-4" />
 <span>Retry</span>
 </button>

 <button
 onClick={this.handleGoHome}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
 >
 <Home className="w-4 h-4" />
 <span>Go to Home</span>
 </button>
 </div>
 </div>
 );
 }

 return this.props.children;
 }
}
