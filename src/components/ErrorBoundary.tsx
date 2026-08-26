import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft, ShieldAlert } from 'lucide-react';

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

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('UDYORA Runtime Error Caught by Boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleTryAgain = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
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
                {this.props.fallbackTitle || 'Unable to render the advisory report.'}
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            An unexpected error occurred while compiling the final advisory dashboard. The underlying data model or report parameters may have encountered a schema inconsistency.
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
              <span>Try Analysis Again</span>
            </button>

            {this.props.onNavigateHome && (
              <button
                onClick={this.props.onNavigateHome}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Input</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
