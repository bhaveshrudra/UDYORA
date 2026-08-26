import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  UserCheck,
  BookOpen,
  Loader2,
  Check,
  Sparkles,
  Server,
  Activity
} from 'lucide-react';
import { loginAdmin, AdminUser, AdminRole, ADMIN_AUTH_CONFIG } from '../../services/adminAuthService';
import { BrandLogo } from '../BrandLogo';

interface AdminLoginViewProps {
  onLoginSuccess: (user: AdminUser) => void;
  onNavigateHome: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onNavigateHome
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedRole, setSelectedRole] = useState<AdminRole>('ADMIN');
  const [email, setEmail] = useState<string>(ADMIN_AUTH_CONFIG.defaultEmail);
  const [password, setPassword] = useState<string>(ADMIN_AUTH_CONFIG.defaultPassword);
  const [remember, setRemember] = useState<boolean>(true);
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Content according to selected role
  const isEditorial = selectedRole === 'EDITORIAL';
  const welcomeHeading = isEditorial ? 'WELCOME, EDITORIAL' : 'WELCOME, ADMIN';
  const centerTitle = isEditorial ? 'UDYORA Editorial Center' : 'UDYORA Administration Center';
  const supportingText = isEditorial
    ? 'Manage content, evidence, business templates, schemes, and translations.'
    : 'Manage data, evidence, business intelligence configuration, and platform operations.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || authStatus === 'loading') return;

    setAuthStatus('loading');
    setErrorMessage(null);

    const res = await loginAdmin(email, password, selectedRole, remember);

    if (res.success && res.user) {
      setAuthStatus('success');
      // Smooth 500ms transition before invoking success callback
      setTimeout(() => {
        onLoginSuccess(res.user!);
      }, 550);
    } else {
      setAuthStatus('error');
      setErrorMessage(res.error || 'Invalid administrator credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950/2 text-slate-900 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 select-none relative overflow-hidden">
      {/* 1. RESTAINED ANIMATED BUSINESS INTELLIGENCE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.035]" />

        {/* Ambient Top Light Beam */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-b from-blue-100/60 via-indigo-50/20 to-transparent blur-3xl" />

        {/* Faint Administrative Analytics Spline Curve */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 900"
        >
          <path
            d="M 0,600 C 300,550 500,450 720,480 C 950,510 1150,380 1440,320 L 1440,900 L 0,900 Z"
            fill="url(#adminSplineGradient)"
          />
          <path
            d="M 0,600 C 300,550 500,450 720,480 C 950,510 1150,380 1440,320"
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <defs>
            <linearGradient id="adminSplineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Faint Watermark Text */}
        <div className="absolute bottom-6 right-8 text-[9vw] font-black text-slate-900/[0.02] tracking-widest uppercase pointer-events-none select-none font-mono">
          UDYORA
        </div>
      </div>

      {/* 2. TOP CONTROL BAR */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateHome}
          className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-950 bg-white/90 hover:bg-white border border-slate-200 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Public App</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Control Plane Operational</span>
        </div>
      </div>

      {/* 3. CENTER ENTRY COMPOSITION */}
      <div className="relative z-10 my-auto w-full max-w-md mx-auto py-6">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {/* Header Reveal & Branding */}
          <div className="text-center space-y-3">
            {/* Logo Mark Reveal */}
            <motion.div
              initial={{ scale: shouldReduceMotion ? 1 : 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="inline-flex justify-center"
            >
              <BrandLogo size="lg" showTagline={false} />
            </motion.div>

            {/* Dynamic Welcome Titles */}
            <div className="space-y-1">
              <motion.div
                key={welcomeHeading}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-900 text-white shadow-2xs">
                  <Shield className="w-3 h-3 text-blue-400" />
                  <span>Authorized Access</span>
                </span>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mt-2">
                  {welcomeHeading}
                </h1>
                <p className="text-xs font-bold text-blue-900 mt-0.5 tracking-tight">
                  {centerTitle}
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  {supportingText}
                </p>
              </motion.div>
            </div>
          </div>

          {/* MAIN LOGIN CARD */}
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
            animate={{
              opacity: authStatus === 'success' ? 0.4 : 1,
              scale: authStatus === 'success' ? 0.98 : 1
            }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-5 backdrop-blur-xs"
          >
            {/* Error Feedback Message */}
            <AnimatePresence>
              {authStatus === 'error' && errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium flex items-center gap-2 overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* STEP 6: ROLE SELECTOR CARDS */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Administrative Role
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* ADMIN Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('ADMIN');
                      setErrorMessage(null);
                    }}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      selectedRole === 'ADMIN'
                        ? 'bg-blue-50/90 border-blue-700 shadow-xs ring-1 ring-blue-700 text-slate-950 -translate-y-0.5'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 hover:-translate-y-0.5 text-slate-700 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black tracking-tight">ADMIN</span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                          selectedRole === 'ADMIN' ? 'bg-blue-700 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {selectedRole === 'ADMIN' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight block font-medium">
                      Full administration
                    </span>
                  </button>

                  {/* EDITORIAL Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('EDITORIAL');
                      setErrorMessage(null);
                    }}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      selectedRole === 'EDITORIAL'
                        ? 'bg-blue-50/90 border-blue-700 shadow-xs ring-1 ring-blue-700 text-slate-950 -translate-y-0.5'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 hover:-translate-y-0.5 text-slate-700 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black tracking-tight">EDITORIAL</span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                          selectedRole === 'EDITORIAL' ? 'bg-blue-700 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {selectedRole === 'EDITORIAL' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight block font-medium">
                      Data & content
                    </span>
                  </button>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@udyora.gov.in"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
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
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Remember Session Toggle */}
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
                <span className="text-[11px] text-slate-400 font-mono">256-bit Token</span>
              </div>

              {/* PRIMARY CTA: SIGN IN WITH LEFT-TO-RIGHT SWEEP FILL ANIMATION */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={authStatus === 'loading' || authStatus === 'success'}
                  className={`group relative w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-85 cursor-pointer ${
                    authStatus === 'success' ? 'bg-emerald-600' : 'bg-slate-900'
                  }`}
                >
                  {/* Left-to-Right Hover Sweep Fill */}
                  <span
                    className="absolute inset-0 w-full h-full bg-blue-800 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                    aria-hidden="true"
                  />

                  {/* Button Content */}
                  <span className="relative z-10 flex items-center gap-2 text-white">
                    {authStatus === 'loading' && (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>AUTHENTICATING...</span>
                      </>
                    )}
                    {authStatus === 'success' && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>ACCESS GRANTED • OPENING...</span>
                      </>
                    )}
                    {authStatus !== 'loading' && authStatus !== 'success' && (
                      <>
                        <span>SIGN IN TO ADMIN CENTER</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300 text-white" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>

      {/* 4. MINIMAL ADMIN FOOTER */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="font-bold text-slate-700">UDYORA Administration Center</span>
          <span>•</span>
          <span>© 2026 UDYORA</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="hover:text-slate-600 cursor-default">Privacy</span>
          <span className="hover:text-slate-600 cursor-default">Accessibility</span>
          <span className="hover:text-slate-600 cursor-default">Support</span>
        </div>
      </footer>
    </div>
  );
};
