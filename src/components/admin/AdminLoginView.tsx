import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { loginAdmin, AdminUser } from '../../services/adminAuthService';
import { BrandLogo } from '../BrandLogo';

interface AdminLoginViewProps {
  onLoginSuccess: (user: AdminUser) => void;
  onNavigateHome: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onNavigateHome
}) => {
  const [email, setEmail] = useState<string>('admin@udyora.gov.in');
  const [password, setPassword] = useState<string>('admin123');
  const [remember, setRemember] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    const res = await loginAdmin(email, password, remember);
    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickDemoFill = (role: 'super' | 'editor') => {
    if (role === 'super') {
      setEmail('admin@udyora.gov.in');
      setPassword('admin123');
    } else {
      setEmail('editor@udyora.in');
      setPassword('editor123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none relative overflow-hidden">
      {/* Background Subtle Accent Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

      {/* Top Back to App Navigation */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public App</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10 px-4">
        <div className="inline-flex justify-center">
          <BrandLogo size="lg" showTagline={false} />
        </div>
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-900 text-white shadow-xs">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>Administrative Control Plane</span>
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            Sign In to UDYORA Admin
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Restricted access for policy officers, data managers, and authorized scheme reviewers.
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Admin Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@udyora.gov.in"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Remember session</span>
              </label>
              <span className="text-slate-400 text-[11px]">Prototype Mode</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'VERIFYING CREDENTIALS...' : 'SIGN IN TO PORTAL'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons (For Hackathon Prototype) */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick Prototype Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('super')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-900 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer text-center"
              >
                Chief Policy Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('editor')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-900 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer text-center"
              >
                Data Reviewer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
