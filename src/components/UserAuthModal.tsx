import React, { useState } from 'react';
import { User, Phone, Mail, Globe, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { UserProfile, registerUser, loginUserWithMobile } from '../services/userAuthService';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage } from '../i18n/types';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t, language, setLanguage } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [prefLang, setPrefLang] = useState<SupportedLanguage>(language);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (!cleanMobile || cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setErrorMsg(null);

    let user: UserProfile;
    if (mode === 'register') {
      user = registerUser({
        name: name.trim(),
        mobile: cleanMobile,
        email: email.trim() || undefined,
        preferredLanguage: prefLang
      });
    } else {
      user = loginUserWithMobile(cleanMobile, name.trim() || undefined);
    }

    setLanguage(user.preferredLanguage);
    onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-black text-xs">
              UD
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {mode === 'register' ? 'Create Entrepreneur Account' : 'Sign In to UDYORA'}
              </h2>
              <p className="text-[11px] text-slate-500">Save and access your micro-enterprise assessments</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 font-bold text-xs">
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            New Registration
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'login' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Sign In with Mobile
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-700 outline-hidden"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Mobile Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit Mobile Number"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-700 outline-hidden"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-700 outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Preferred Advisory Language
                </label>
                <select
                  value={prefLang}
                  onChange={(e) => setPrefLang(e.target.value as SupportedLanguage)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-700 outline-hidden cursor-pointer"
                >
                  <option value="en">English (EN)</option>
                  <option value="hi">हिन्दी (HI)</option>
                  <option value="mr">मराठी (MR)</option>
                  <option value="te">తెలుగు (TE)</option>
                  <option value="kn">ಕನ್ನಡ (KN)</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-black tracking-tight shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{mode === 'register' ? 'Register & Continue' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400">
          UDYORA protects promoter privacy and encrypts assessment data.
        </p>
      </div>
    </div>
  );
};
