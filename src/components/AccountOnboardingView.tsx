import React, { useState } from'react';
import {
 User,
 Phone,
 Mail,
 Languages,
 CheckCircle2,
 ArrowRight,
 AlertCircle,
 UserPlus,
 LogIn
} from'lucide-react';
import {
 UserProfile,
 registerUser,
 loginUserSession,
 getUserAssessments,
 normalizeMobile,
 normalizeEmail
} from'../services/userAuthService';
import { useLanguage } from'../i18n/LanguageContext';
import { SupportedLanguage } from'../i18n/types';

interface AccountOnboardingViewProps {
 onCompleteOnboarding: (user: UserProfile) => void;
 onContinueAsGuest?: () => void;
}

export const AccountOnboardingView: React.FC<AccountOnboardingViewProps> = ({
 onCompleteOnboarding,
 onContinueAsGuest
}) => {
 const { language, setLanguage } = useLanguage();

 const [step, setStep] = useState<'welcome' |'signin' |'register' |'welcome_back'>('welcome');

 // CLEAN INITIAL FORM STATE FOR NEW USER (NO SAMPLE OR HARDCODED PERSONAL VALUES)
 const [identifier, setIdentifier] = useState<string>('');
 const [fullName, setFullName] = useState<string>('');
 const [email, setEmail] = useState<string>('');
 const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(language);

 const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
 const [errorNotice, setErrorNotice] = useState<string | null>(null);
 const [errorCode, setErrorCode] = useState<string | null>(null);
 const [isLoading, setIsLoading] = useState<boolean>(false);

 // 1. Handle Sign-In Search
 const handleIdentifierSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!identifier.trim()) {
 setErrorNotice('Please enter your mobile number or email address.');
 return;
 }

 setIsLoading(true);
 setErrorNotice(null);
 setErrorCode(null);

 setTimeout(() => {
 const res = loginUserSession(identifier);
 setIsLoading(false);

 if (res.success && res.user) {
 setCurrentUser(res.user);
 setLanguage(res.user.preferredLanguage);
 setStep('welcome_back');
 } else if (res.errorCode ==='ACCOUNT_SUSPENDED') {
 setErrorNotice(res.error ||'Your account has been suspended by administration.');
 setErrorCode('ACCOUNT_SUSPENDED');
 } else {
 // User not found -> Transition to Create Profile screen for new user
 const cleanDigits = normalizeMobile(identifier);
 const cleanEmail = normalizeEmail(identifier);
 if (cleanDigits) {
 setIdentifier(cleanDigits);
 } else if (cleanEmail) {
 setEmail(cleanEmail);
 } else {
 setIdentifier('');
 }
 setStep('register');
 }
 }, 300);
 };

 // 2. Handle New Profile Registration
 const handleRegisterSubmit = (e: React.FormEvent) => {
 e.preventDefault();

 if (!fullName.trim()) {
 setErrorNotice('Please enter your name.');
 return;
 }

 const normMob = normalizeMobile(identifier);
 if (!normMob || normMob.length < 10) {
 setErrorNotice('Please enter your mobile number.');
 return;
 }

 setIsLoading(true);
 setErrorNotice(null);
 setErrorCode(null);

 const res = registerUser({
 name: fullName.trim(),
 mobile: normMob,
 email: email.trim() || undefined,
 preferredLanguage: selectedLanguage
 });

 setIsLoading(false);

 if (res.success && res.user) {
 setCurrentUser(res.user);
 setLanguage(res.user.preferredLanguage);
 onCompleteOnboarding(res.user);
 } else {
 setErrorNotice(res.error ||'Unable to create profile.');
 setErrorCode(res.errorCode || null);
 }
 };

 const userAssessments = currentUser ? getUserAssessments(currentUser.userId) : [];

 return (
 <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6">
 <div className="bg-white border border-slate-200/90 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6 animate-fadeIn">
 {/* TOP PLATFORM BADGE */}
 <div className="text-center space-y-2">
 <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl mx-auto shadow-md shadow-blue-600/30">
 U
 </div>
 <h1 className="text-2xl font-black text-slate-950 tracking-tight">UDYORA</h1>
 <p className="text-xs font-semibold text-slate-500">
 Hyper-Local Business Advisory & Intelligence Platform
 </p>
 </div>

 {/* ERROR NOTICE ALERT */}
 {errorNotice && (
 <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium flex items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
 <span>{errorNotice}</span>
 </div>
 {errorCode ==='DUPLICATE_MOBILE' || errorCode ==='DUPLICATE_EMAIL' ? (
 <button
 type="button"
 onClick={() => {
 setErrorNotice(null);
 setStep('signin');
 }}
 className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg text-[10px] shrink-0 cursor-pointer"
 >
 Sign In
 </button>
 ) : null}
 </div>
 )}

 {/* STEP 1: INITIAL LAUNCH WELCOME */}
 {step ==='welcome' && (
 <div className="space-y-4 text-center">
 <h2 className="text-lg font-black text-slate-950">Welcome to UDYORA</h2>
 <p className="text-xs text-slate-600 font-medium leading-relaxed">
 Identify your user account to begin personalized business feasibility assessments and access subsidy reports.
 </p>

 <div className="pt-2 space-y-2.5">
 <button
 type="button"
 onClick={() => {
 setErrorNotice(null);
 setStep('signin');
 }}
 className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
 >
 <LogIn className="w-4 h-4" />
 <span>Account / Sign In</span>
 </button>

 {onContinueAsGuest && (
 <button
 type="button"
 onClick={onContinueAsGuest}
 className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
 >
 Continue as Guest
 </button>
 )}
 </div>
 </div>
 )}

 {/* STEP 2: IDENTIFIER SIGN-IN */}
 {step ==='signin' && (
 <form onSubmit={handleIdentifierSubmit} className="space-y-4">
 <div className="space-y-1">
 <h2 className="text-base font-black text-slate-950">Sign In to Your Account</h2>
 <p className="text-xs text-slate-500 font-medium">Enter your registered mobile number or email address.</p>
 </div>

 <div className="space-y-3 text-xs">
 <div>
 <label className="block font-bold text-slate-700 mb-1">Mobile Number or Email *</label>
 <div className="relative">
 <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 value={identifier}
 onChange={(e) => setIdentifier(e.target.value)}
 placeholder="Enter your mobile number or email address"
 autoComplete="username"
 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
 />
 </div>
 </div>

 <div>
 <label className="block font-bold text-slate-700 mb-1">Preferred Language *</label>
 <select
 value={selectedLanguage}
 onChange={(e) => {
 const lang = e.target.value as SupportedLanguage;
 setSelectedLanguage(lang);
 setLanguage(lang);
 }}
 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 outline-hidden cursor-pointer"
 >
 <option value="en">English (EN)</option>
 <option value="hi">हिन्दी (HI)</option>
 <option value="te">తెలుగు (TE)</option>
 <option value="mr">मराठी (MR)</option>
 <option value="kn">ಕನ್ನಡ (KN)</option>
 </select>
 </div>
 </div>

 <button
 type="submit"
 disabled={isLoading}
 className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
 >
 {isLoading ? <span>Verifying...</span> : (
 <>
 <span>Continue</span>
 <ArrowRight className="w-4 h-4" />
 </>
 )}
 </button>
 </form>
 )}

 {/* STEP 3: NEW USER PROFILE REGISTRATION */}
 {step ==='register' && (
 <form onSubmit={handleRegisterSubmit} className="space-y-4">
 <div className="space-y-1 border-b border-slate-100 pb-2">
 <h2 className="text-base font-black text-slate-950">Create Your UDYORA Profile</h2>
 <p className="text-xs text-slate-500 font-medium">Enter your details to personalize your business assessment.</p>
 </div>

 <div className="space-y-3 text-xs">
 <div>
 <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
 <div className="relative">
 <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 required
 value={fullName}
 onChange={(e) => setFullName(e.target.value)}
 placeholder="Enter your name"
 autoComplete="name"
 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
 />
 </div>
 </div>

 <div>
 <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
 <div className="relative">
 <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="tel"
 required
 value={identifier}
 onChange={(e) => setIdentifier(e.target.value)}
 placeholder="Enter your mobile number"
 autoComplete="tel"
 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
 />
 </div>
 </div>

 <div>
 <label className="block font-bold text-slate-700 mb-1">Email Address (Optional)</label>
 <div className="relative">
 <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="Enter your email address"
 autoComplete="email"
 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
 />
 </div>
 </div>

 <div>
 <label className="block font-bold text-slate-700 mb-1">Preferred Language *</label>
 <select
 value={selectedLanguage}
 onChange={(e) => {
 const lang = e.target.value as SupportedLanguage;
 setSelectedLanguage(lang);
 setLanguage(lang);
 }}
 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 outline-hidden cursor-pointer"
 >
 <option value="en">English (EN)</option>
 <option value="hi">हिन्दी (HI)</option>
 <option value="te">తెలుగు (TE)</option>
 <option value="mr">मराठी (MR)</option>
 <option value="kn">ಕನ್ನಡ (KN)</option>
 </select>
 </div>
 </div>

 <button
 type="submit"
 disabled={isLoading}
 className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
 >
 {isLoading ? <span>Creating Profile...</span> : (
 <>
 <UserPlus className="w-4 h-4" />
 <span>CREATE PROFILE & START</span>
 </>
 )}
 </button>
 </form>
 )}

 {/* STEP 4: WELCOME BACK (AUTHENTICATED RETURNING USER) */}
 {step ==='welcome_back' && currentUser && (
 <div className="space-y-5">
 <div className="p-4 bg-blue-50/80 border border-blue-200/90 rounded-2xl space-y-1">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider">AUTHENTICATED PROFILE</span>
 <span className="text-[10px] font-mono text-slate-500">ID: {currentUser.userId}</span>
 </div>
 <h2 className="text-xl font-black text-slate-950">
 Welcome back, {currentUser.name}!
 </h2>
 <p className="text-xs text-slate-600 font-medium">
 Good to see you again. Your preferred language is set to <strong className="uppercase">{currentUser.preferredLanguage}</strong>.
 </p>
 </div>

 {/* Assessment History Summary */}
 <div className="space-y-2">
 <div className="flex items-center justify-between text-xs font-bold text-slate-700">
 <span>Your Saved Assessments</span>
 <span className="font-mono text-blue-700">{userAssessments.length} Records</span>
 </div>

 {userAssessments.length > 0 ? (
 <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
 {userAssessments.map((a) => (
 <div key={a.assessmentId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
 <div>
 <p className="font-bold text-slate-950">{a.businessType.toUpperCase()} • {a.mandal}</p>
 <p className="text-[10px] text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</p>
 </div>
 <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
 {a.feasibilityScore}/100
 </span>
 </div>
 ))}
 </div>
 ) : (
 <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-500 font-medium text-center">
 No previous assessments yet. Start your first business assessment below!
 </div>
 )}
 </div>

 <button
 type="button"
 onClick={() => onCompleteOnboarding(currentUser)}
 className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
 >
 <span>Continue to Business Assessment</span>
 <ArrowRight className="w-4 h-4" />
 </button>
 </div>
 )}
 </div>
 </div>
 );
};
