import React, { Component, ReactNode, ErrorInfo } from'react';
import { Compass, RotateCcw } from'lucide-react';

interface Props {
 children: ReactNode;
 fallbackMessage?: string;
}

interface State {
 hasError: boolean;
 error: Error | null;
}

export class MapErrorBoundary extends (Component as any) {
 state: State = {
 hasError: false,
 error: null
 };

 static getDerivedStateFromError(error: Error): State {
 return { hasError: true, error };
 }

 componentDidCatch(error: Error, errorInfo: ErrorInfo) {
 console.warn('[UDYORA Map ErrorBoundary] Caught map runtime error:', error, errorInfo);
 }

 handleRetry = () => {
 this.setState({ hasError: false, error: null });
 };

 render(): ReactNode {
 if (this.state.hasError) {
 return (
 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3 my-2 shadow-xs">
 <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mx-auto">
 <Compass className="w-5 h-5" />
 </div>
 <div className="space-y-1">
 <h3 className="text-xs sm:text-sm font-black text-slate-800">
 Unable to load location intelligence.
 </h3>
 <p className="text-[11px] text-slate-500">
 The map view encountered a rendering issue. Rest of the assessment stays active.
 </p>
 </div>
 <button
 type="button"
 onClick={this.handleRetry}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
 >
 <RotateCcw className="w-3.5 h-3.5" />
 <span>Retry Map</span>
 </button>
 </div>
 );
 }

 return this.props.children;
 }
}
