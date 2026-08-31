import React, { useState } from'react';
import { motion, AnimatePresence } from'framer-motion';
import {
 ShieldCheck,
 Lock,
 Mail,
 ArrowRight,
 ArrowLeft,
 Check,
 AlertCircle,
 HelpCircle,
 KeyRound,
 ShieldAlert,
 Building2,
 Users,
 Award,
 Languages
} from'lucide-react';
import {
 loginAdmin,
 AdminUser,
 AdminRole,
 ADMIN_AUTH_CONFIG
} from'../../services/adminAuthService';

interface AdminLoginViewProps {
 onLoginSuccess: (user: AdminUser) => void;
 onNavigateHome: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
 onLoginSuccess,
 onNavigateHome
}) => {
 const [email, setEmail] = useState<string>(ADMIN_AUTH_CONFIG.defaultEmail);
 const [password, setPassword] = useState<string>(ADMIN_AUTH_CONFIG.defaultPassword);
 const [selectedRole, setSelectedRole] = useState<AdminRole>('CHIEF_ADMINISTRATOR');
 const [rememberMe, setRememberMe] = useState<boolean>(true);
 const [authStatus, setAuthStatus] = useState<'idle' |'authenticating' |'error'>('idle');
 const [errorMessage, setErrorMessage] = useState<string | null>(null);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();

 if (!email.trim() || !password.trim()) {
 setAuthStatus('error');
 setErrorMessage('Please enter both administrator email and password.');
 return;
 }

 setAuthStatus('authenticating');
 setErrorMessage(null);

 const res = await loginAdmin(email, password, selectedRole, rememberMe);
 if (res.success && res.user) {
 setTimeout(() => {
 onLoginSuccess(res.user!);
 }, 350);
 } else {
 setAuthStatus('error');
 setErrorMessage(res.error ||'Invalid administrator credentials.');
 }
 };

 return (
 <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 select-none relative overflow-hidden">
 {/* BACKGROUND GRAPHICS */}
 <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
 <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.08]" />
 <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-b from-blue-600/30 via-indigo-600/10 to-transparent blur-3xl" />
 <div className="absolute bottom-6 right-8 text-[9vw] font-black text-white/[0.02] tracking-widest uppercase pointer-events-none select-none font-mono">
 UDYORA
 </div>
 </div>

 {/* TOP CONTROL BAR */}
 <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
 <button
 type="button"
 onClick={onNavigateHome}
 className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 shadow-2xs transition-all cursor-pointer"
 >
 <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
 <span>Back to Public Platform</span>
 </button>

 <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
 <ShieldCheck className="w-4 h-4 text-emerald-400" />
 <span>Secure Admin Portal</span>
 </div>
 </div>

 {/* CENTER AUTHENTICATION CARD */}
 <div className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
 <div className="text-center space-y-2 mb-6">
 <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-blue-600/30">
 U
 </div>
 <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
 UDYORA Admin Center
 </h1>
 <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
 Select your administrative role and enter credentials to access governance tools.
 </p>
 </div>

 <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 backdrop-blur-md">
 {authStatus ==='error' && errorMessage && (
 <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-2xl text-xs text-rose-300 font-medium flex items-center gap-2">
 <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
 <span>{errorMessage}</span>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 {/* ROLE SELECTOR CARDS */}
 <div className="space-y-1.5">
 <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
 Select Administrative Role
 </label>
 <div className="grid grid-cols-2 gap-2.5">
 {/* CHIEF ADMINISTRATOR */}
 <button
 type="button"
 onClick={() => {
 setSelectedRole('CHIEF_ADMINISTRATOR');
 setErrorMessage(null);
 }}
 className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
 selectedRole ==='CHIEF_ADMINISTRATOR' || selectedRole ==='ADMIN'
 ?'bg-blue-600/20 border-blue-500 text-white shadow-xs ring-1 ring-blue-500'
 :'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
 }`}
 >
 <div className="flex items-center justify-between mb-1">
 <span className="text-[11px] font-black tracking-tight uppercase">Chief Admin</span>
 <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
 selectedRole ==='CHIEF_ADMINISTRATOR' || selectedRole ==='ADMIN' ?'bg-blue-500 text-white' :'border border-slate-600'
 }`}>
 {(selectedRole ==='CHIEF_ADMINISTRATOR' || selectedRole ==='ADMIN') && <Check className="w-2.5 h-2.5 stroke-[3]" />}
 </div>
 </div>
 <span className="text-[10px] text-slate-400 leading-tight block font-medium">
 Full platform governance
 </span>
 </button>

 {/* EDITORIAL CONTENT OFFICER */}
 <button
 type="button"
 onClick={() => {
 setSelectedRole('EDITORIAL_OFFICER');
 setErrorMessage(null);
 }}
 className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
 selectedRole ==='EDITORIAL_OFFICER' || selectedRole ==='EDITORIAL'
 ?'bg-emerald-600/20 border-emerald-500 text-white shadow-xs ring-1 ring-emerald-500'
 :'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
 }`}
 >
 <div className="flex items-center justify-between mb-1">
 <span className="text-[11px] font-black tracking-tight uppercase">Editorial</span>
 <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
 selectedRole ==='EDITORIAL_OFFICER' || selectedRole ==='EDITORIAL' ?'bg-emerald-500 text-white' :'border border-slate-600'
 }`}>
 {(selectedRole ==='EDITORIAL_OFFICER' || selectedRole ==='EDITORIAL') && <Check className="w-2.5 h-2.5 stroke-[3]" />}
 </div>
 </div>
 <span className="text-[10px] text-slate-400 leading-tight block font-medium">
 Content & schemes
 </span>
 </button>
 </div>
 </div>

 {/* EMAIL INPUT */}
 <div className="space-y-1">
 <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
 Administrator Email
 </label>
 <div className="relative">
 <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="admin@udyora.gov.in"
 className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden"
 />
 </div>
 </div>

 {/* PASSWORD INPUT */}
 <div className="space-y-1">
 <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
 Password
 </label>
 <div className="relative">
 <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
 <input
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden"
 />
 </div>
 </div>

 {/* LOGIN SUBMIT CTA */}
 <button
 type="submit"
 disabled={authStatus ==='authenticating'}
 className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 border border-blue-400/30"
 >
 {authStatus ==='authenticating' ? (
 <span>Authenticating...</span>
 ) : (
 <>
 <span>Sign In to Admin Center</span>
 <ArrowRight className="w-4 h-4" />
 </>
 )}
 </button>
 </form>
 </div>
 </div>

 {/* BOTTOM FOOTER */}
 <div className="relative z-10 w-full max-w-5xl mx-auto text-center text-[10px] text-slate-500 font-mono">
 UDYORA Public Advisory & Governance Platform • Session Security Protocol active
 </div>
 </div>
 );
};
