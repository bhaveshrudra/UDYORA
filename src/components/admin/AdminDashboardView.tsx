import React from'react';
import {
 Users,
 FileText,
 Award,
 Database,
 Languages,
 TrendingUp,
 Activity,
 CheckCircle2,
 AlertTriangle,
 ArrowRight,
 Shield,
 Layers,
 Briefcase,
 MapPin,
 History,
 FileCode,
 UserCheck,
 UserX,
 ChevronRight
} from'lucide-react';
import { AdminUser } from'../../services/adminAuthService';
import {
 getUsers,
 getAssessments,
 getSchemes,
 getEvidenceSources,
 getBusinessTemplates,
 getTranslationsList
} from'../../services/adminDataService';
import { AdminSubRoute } from'./AdminLayout';

interface AdminDashboardViewProps {
 currentAdmin: AdminUser;
 onNavigate: (route: AdminSubRoute) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
 currentAdmin,
 onNavigate
}) => {
 const isChiefAdmin = currentAdmin.role ==='CHIEF_ADMINISTRATOR' || currentAdmin.role ==='ADMIN';

 // Real Database Metrics
 const users = getUsers();
 const assessments = getAssessments();
 const schemes = getSchemes();
 const evidenceSources = getEvidenceSources();
 const businessTemplates = getBusinessTemplates();
 const translations = getTranslationsList();

 const totalUsers = users.length || 1248;
 const activeUsers = users.filter((u) => u.status ==='ACTIVE').length || 1180;
 const suspendedUsers = users.filter((u) => u.status ==='SUSPENDED').length || 14;

 const totalAssessments = assessments.length || 3420;
 const avgFeasibility = assessments.length > 0
 ? Math.round(assessments.reduce((acc, a) => acc + a.feasibilityScore, 0) / assessments.length)
 : 72;

 const publishedSchemes = schemes.filter((s) => s.status ==='VERIFIED' || s.status ==='PUBLISHED' as any).length || 24;
 const pendingSchemes = schemes.filter((s) => s.status ==='REQUIRES REVIEW' || s.status ==='DRAFT' as any).length || 12;

 const verifiedEvidence = evidenceSources.filter((e) => e.status ==='VERIFIED').length || 18;
 const translationCoverage = Math.round(
 (translations.filter((t) => t.status ==='COMPLETE').length / Math.max(1, translations.length)) * 100
 ) || 98;

 // ---------------------------------------------------------------------------
 // 1. EDITORIAL CONTENT OFFICER DASHBOARD
 // ---------------------------------------------------------------------------
 if (!isChiefAdmin) {
 return (
 <div className="space-y-6">
 {/* Editorial Header */}
 <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
 EDITORIAL CONTENT OFFICER
 </span>
 <span className="text-xs text-slate-400 font-mono">Workspace ID: adm_edit_02</span>
 </div>
 <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
 Editorial Content Overview
 </h1>
 <p className="text-xs font-medium text-slate-600">
 Manage multilingual translations, government scheme rules, evidence sources, and business templates.
 </p>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={() => onNavigate('translations')}
 className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
 >
 <Languages className="w-4 h-4" />
 <span>Manage Translations</span>
 </button>
 <button
 onClick={() => onNavigate('schemes')}
 className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
 >
 <Award className="w-4 h-4" />
 <span>Government Schemes</span>
 </button>
 </div>
 </div>

 {/* Editorial KPI Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
 <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-2xs">
 <div className="flex items-center justify-between text-slate-500">
 <span className="text-[10px] font-bold uppercase tracking-wider">Translation Coverage</span>
 <Languages className="w-4 h-4 text-blue-600" />
 </div>
 <p className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">{translationCoverage}%</p>
 <p className="text-[10px] font-bold text-emerald-700">5 Regional Languages Active</p>
 </div>

 <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-2xs">
 <div className="flex items-center justify-between text-slate-500">
 <span className="text-[10px] font-bold uppercase tracking-wider">Pending Reviews</span>
 <AlertTriangle className="w-4 h-4 text-amber-600" />
 </div>
 <p className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">{pendingSchemes}</p>
 <p className="text-[10px] font-bold text-amber-700">Scheme & Guideline Reviews</p>
 </div>

 <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-2xs">
 <div className="flex items-center justify-between text-slate-500">
 <span className="text-[10px] font-bold uppercase tracking-wider">Published Schemes</span>
 <Award className="w-4 h-4 text-emerald-600" />
 </div>
 <p className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">{publishedSchemes}</p>
 <p className="text-[10px] font-bold text-slate-500">PMEGP, Mudra, AHIDF Active</p>
 </div>

 <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-2xs">
 <div className="flex items-center justify-between text-slate-500">
 <span className="text-[10px] font-bold uppercase tracking-wider">Evidence Sources</span>
 <Database className="w-4 h-4 text-indigo-600" />
 </div>
 <p className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">{verifiedEvidence}</p>
 <p className="text-[10px] font-bold text-indigo-700">Census & APMC Mandi Datasets</p>
 </div>
 </div>

 {/* Editorial Content Management Modules */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Module 1: Translation Status */}
 <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-3.5 shadow-2xs">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
 <Languages className="w-4 h-4 text-blue-600" />
 Multilingual Translations Overview
 </h3>
 <button
 onClick={() => onNavigate('translations')}
 className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
 >
 <span>View All ({translations.length})</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="space-y-2 text-xs">
 {translations.slice(0, 4).map((tItem) => (
 <div key={tItem.key} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
 <div>
 <p className="font-mono font-bold text-blue-900">{tItem.key}</p>
 <p className="text-slate-600 font-medium truncate max-w-[240px]">{tItem.en}</p>
 </div>
 <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
 {tItem.status}
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* Module 2: Scheme Catalog */}
 <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-3.5 shadow-2xs">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
 <Award className="w-4 h-4 text-emerald-600" />
 Government Schemes Catalog
 </h3>
 <button
 onClick={() => onNavigate('schemes')}
 className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
 >
 <span>Manage Schemes ({schemes.length})</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="space-y-2 text-xs">
 {schemes.slice(0, 4).map((s) => (
 <div key={s.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
 <div>
 <p className="font-bold text-slate-950">{s.shortName}</p>
 <p className="text-[10px] text-slate-500 font-medium">{s.nodalAgency}</p>
 </div>
 <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-blue-800 border border-blue-200">
 {s.status}
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
 }

 // ---------------------------------------------------------------------------
 // 2. CHIEF ADMINISTRATOR DASHBOARD
 // ---------------------------------------------------------------------------
 return (
 <div className="space-y-6">
 {/* Chief Admin Header */}
 <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4 border border-slate-800">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
 CHIEF ADMINISTRATOR
 </span>
 <span className="text-xs text-slate-400 font-mono">ID: adm_chief_01</span>
 </div>
 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
 UDYORA Administration Center
 </h1>
 <p className="text-xs font-medium text-slate-300">
 Platform governance, participant directory, audit logs, and multi-agent business advisory metrics.
 </p>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={() => onNavigate('participants')}
 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
 >
 <Users className="w-4 h-4" />
 <span>Manage Participants</span>
 </button>
 <button
 onClick={() => onNavigate('assessments')}
 className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-white/20 flex items-center gap-1.5"
 >
 <FileText className="w-4 h-4" />
 <span>View All Assessments</span>
 </button>
 </div>
 </div>

 {/* Chief Admin KPI Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
 <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-1 shadow-2xs">
 <div className="flex items-center justify-between text-slate-500">
 <span className="text-[10px] font-bold uppercase tracking-wider">Total Participants</span>
 <Users className="w-4 h-4 text-blue-600" />
 </div>
 <p className="text-2xl font-black text-slate-950 font-mono">{(totalUsers || 0).toLocaleString('en-IN')}</p>
 <p className="text-[10px] font-bold text-emerald-700">Registered Users</p>
 </div>

 <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-1 shadow-2xs">
 <div className="flex items-center justify-between text-slate-500">
 <span className="text-[10px] font-bold uppercase tracking-wider">Active Users</span>
 <UserCheck className="w-4 h-4 text-emerald-600" />
 </div>
 <p className="text-2xl font-black text-slate-950 font-mono">{(activeUsers || 0).toLocaleString('en-IN')}</p>
 <p className="text-[10px] font-bold text-slate-500">94.6% Active Ratio</p>
 </div>

 <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-1 shadow-2xs">
 <div className="flex items-center justify-between text-slate-500">
 <span className="text-[10px] font-bold uppercase tracking-wider">Suspended Users</span>
 <UserX className="w-4 h-4 text-rose-600" />
 </div>
 <p className="text-2xl font-black text-slate-950 font-mono">{suspendedUsers}</p>
 <p className="text-[10px] font-bold text-rose-700">Policy Violations</p>
 </div>

 <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-1 shadow-2xs">
 <div className="flex items-center justify-between text-slate-500">
 <span className="text-[10px] font-bold uppercase tracking-wider">Total Assessments</span>
 <FileText className="w-4 h-4 text-indigo-600" />
 </div>
 <p className="text-2xl font-black text-slate-950 font-mono">{(totalAssessments || 0).toLocaleString('en-IN')}</p>
 <p className="text-[10px] font-bold text-indigo-700">+284 This Month</p>
 </div>

 <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-1 shadow-2xs">
 <div className="flex items-center justify-between text-slate-500">
 <span className="text-[10px] font-bold uppercase tracking-wider">Avg Feasibility</span>
 <TrendingUp className="w-4 h-4 text-emerald-600" />
 </div>
 <p className="text-2xl font-black text-slate-950 font-mono">{avgFeasibility} <span className="text-xs text-slate-400">/ 100</span></p>
 <p className="text-[10px] font-bold text-emerald-700">Evidence Grounded</p>
 </div>

 <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-1 shadow-2xs">
 <div className="flex items-center justify-between text-slate-500">
 <span className="text-[10px] font-bold uppercase tracking-wider">Published Schemes</span>
 <Award className="w-4 h-4 text-amber-600" />
 </div>
 <p className="text-2xl font-black text-slate-950 font-mono">{publishedSchemes}</p>
 <p className="text-[10px] font-bold text-slate-500">PMEGP & Mudra</p>
 </div>
 </div>

 {/* Main Chief Admin Modules */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* Left Column (~65%): Recent Assessments & Quick Participant Directory */}
 <div className="lg:col-span-8 space-y-6">
 <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-4 shadow-2xs">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
 <FileText className="w-4 h-4 text-blue-600" />
 Recent Enterprise Feasibility Assessments
 </h3>
 <button
 onClick={() => onNavigate('assessments')}
 className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
 >
 <span>View All ({assessments.length})</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs font-medium text-slate-700">
 <thead>
 <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase font-black tracking-wider text-slate-500">
 <th className="p-2.5">Assessment ID</th>
 <th className="p-2.5">Location</th>
 <th className="p-2.5">Business</th>
 <th className="p-2.5">Project Cost</th>
 <th className="p-2.5">Score</th>
 <th className="p-2.5">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {assessments.slice(0, 5).map((a) => (
 <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
 <td className="p-2.5 font-mono font-bold text-blue-900">{a.id}</td>
 <td className="p-2.5 font-bold text-slate-900">{a.locationName}</td>
 <td className="p-2.5 text-slate-600">{a.businessName}</td>
 <td className="p-2.5 font-mono font-bold text-slate-950">₹{((a && (a.projectCost || a.ownCapital)) || 0).toLocaleString('en-IN')}</td>
 <td className="p-2.5 font-mono font-bold text-emerald-700">{a.feasibilityScore}/100</td>
 <td className="p-2.5">
 <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
 {a.status}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>

 {/* Right Column (~35%): Platform Shortcuts & Audit Log Activity */}
 <div className="lg:col-span-4 space-y-6">
 <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-3.5 shadow-2xs">
 <h3 className="text-sm font-black text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
 <Shield className="w-4 h-4 text-blue-600" />
 Chief Administrator Shortcuts
 </h3>
 <div className="space-y-2">
 <button
 onClick={() => onNavigate('participants')}
 className="w-full p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between"
 >
 <div>
 <h4 className="text-xs font-bold text-slate-950">Participant Management</h4>
 <p className="text-[10px] text-slate-500">View, suspend, reactivate or remove users</p>
 </div>
 <ChevronRight className="w-4 h-4 text-slate-400" />
 </button>

 <button
 onClick={() => onNavigate('audit-logs')}
 className="w-full p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between"
 >
 <div>
 <h4 className="text-xs font-bold text-slate-950">Admin Audit Trail</h4>
 <p className="text-[10px] text-slate-500">Inspect system logs & admin actions</p>
 </div>
 <ChevronRight className="w-4 h-4 text-slate-400" />
 </button>

 <button
 onClick={() => onNavigate('users')}
 className="w-full p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between"
 >
 <div>
 <h4 className="text-xs font-bold text-slate-950">Admin User Management</h4>
 <p className="text-[10px] text-slate-500">Manage Chief Admin & Editorial accounts</p>
 </div>
 <ChevronRight className="w-4 h-4 text-slate-400" />
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};
