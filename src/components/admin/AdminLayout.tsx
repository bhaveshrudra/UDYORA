import React, { useState } from'react';
import {
 LayoutDashboard,
 MapPin,
 Briefcase,
 Award,
 Database,
 Users,
 FileText,
 Languages,
 History,
 Settings,
 LogOut,
 Menu,
 X,
 ExternalLink,
 Shield,
 ShieldAlert,
 Search,
 ChevronRight,
 Bell,
 BookOpen,
 UserCheck,
 Building2,
 FileCode,
 FileSpreadsheet
} from'lucide-react';
import { AdminUser, isRouteAllowedForRole } from'../../services/adminAuthService';

export type AdminSubRoute =
 |'dashboard'
 |'locations'
 |'businesses'
 |'schemes'
 |'evidence'
 |'datasets'
 |'translations'
 |'guidance'
 |'assessments'
 |'participants'
 |'users'
 |'audit-logs'
 |'settings';

interface AdminLayoutProps {
 currentAdmin: AdminUser;
 activeRoute: AdminSubRoute;
 onNavigate: (route: AdminSubRoute) => void;
 onLogout: () => void;
 onNavigateToPublic: () => void;
 children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
 currentAdmin,
 activeRoute,
 onNavigate,
 onLogout,
 onNavigateToPublic,
 children
}) => {
 const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
 const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);

 const isChiefAdmin = currentAdmin.role ==='CHIEF_ADMINISTRATOR' || currentAdmin.role ==='ADMIN';

 const rawNavSections = [
 {
 title:'OVERVIEW',
 items: [
 { id:'dashboard' as AdminSubRoute, label:'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> }
 ]
 },
 {
 title:'DATA MANAGEMENT',
 items: [
 { id:'locations' as AdminSubRoute, label:'Locations', icon: <MapPin className="w-4 h-4" /> },
 { id:'businesses' as AdminSubRoute, label:'Business Templates', icon: <Briefcase className="w-4 h-4" /> },
 { id:'schemes' as AdminSubRoute, label:'Government Schemes', icon: <Award className="w-4 h-4" /> },
 { id:'evidence' as AdminSubRoute, label:'Evidence Sources', icon: <Database className="w-4 h-4" /> },
 { id:'datasets' as AdminSubRoute, label:'Datasets & Ingestion', icon: <FileSpreadsheet className="w-4 h-4" /> }
 ]
 },
 {
 title:'CONTENT',
 items: [
 { id:'translations' as AdminSubRoute, label:'Translations', icon: <Languages className="w-4 h-4" /> },
 { id:'guidance' as AdminSubRoute, label:'Announcements / Guidance', icon: <BookOpen className="w-4 h-4" /> }
 ]
 },
 {
 title:'PLATFORM',
 items: [
 { id:'assessments' as AdminSubRoute, label:'Assessments', icon: <FileText className="w-4 h-4" /> },
 { id:'participants' as AdminSubRoute, label:'Participants', icon: <Users className="w-4 h-4" /> }
 ]
 },
 {
 title:'ADMINISTRATION',
 items: [
 { id:'users' as AdminSubRoute, label:'User Management', icon: <UserCheck className="w-4 h-4" /> },
 { id:'audit-logs' as AdminSubRoute, label:'Audit Logs', icon: <History className="w-4 h-4" /> }
 ]
 },
 {
 title:'SYSTEM',
 items: [
 { id:'settings' as AdminSubRoute, label:'Settings', icon: <Settings className="w-4 h-4" /> }
 ]
 }
 ];

 const navSections = rawNavSections
 .map((sec) => ({
 ...sec,
 items: sec.items.filter((item) => isRouteAllowedForRole(currentAdmin.role, item.id))
 }))
 .filter((sec) => sec.items.length > 0);

 const handleItemClick = (routeId: AdminSubRoute) => {
 onNavigate(routeId);
 setMobileDrawerOpen(false);
 };

 return (
 <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-950">
 {/* TOP DEEP NAVY BAR */}
 <header className="bg-slate-950 text-white sticky top-0 z-40 border-b border-slate-800 shadow-sm h-14 flex items-center justify-between px-4 sm:px-6">
 <div className="flex items-center gap-3">
 <button
 onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
 className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
 >
 {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
 </button>

 <div className="flex items-center gap-2">
 <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs shadow-2xs">
 U
 </div>
 <span className="font-black text-sm tracking-tight text-white">
 UDYORA <span className="font-medium text-slate-400 text-xs hidden sm:inline">Administration Center</span>
 </span>
 </div>

 <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
 isChiefAdmin
 ?'bg-blue-500/10 text-blue-400 border-blue-500/30'
 :'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
 }`}>
 {isChiefAdmin ?'CHIEF ADMINISTRATOR' :'EDITORIAL CONTENT OFFICER'}
 </span>
 </div>

 <div className="flex items-center gap-3">
 <button
 onClick={onNavigateToPublic}
 className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-slate-800"
 >
 <span>Main Platform</span>
 <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
 </button>

 {/* User Profile Menu */}
 <div className="relative">
 <button
 onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
 className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
 >
 <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
 {currentAdmin.name.charAt(0)}
 </div>
 <div className="hidden md:block text-left text-xs">
 <p className="font-bold text-white leading-tight">{currentAdmin.name}</p>
 <p className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">{currentAdmin.email}</p>
 </div>
 </button>

 {profileDropdownOpen && (
 <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-slate-900 text-xs animate-in fade-in">
 <div className="px-3.5 py-2 border-b border-slate-100">
 <p className="font-bold text-slate-950">{currentAdmin.name}</p>
 <p className="text-[10px] text-slate-500 font-mono">{currentAdmin.email}</p>
 <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
 isChiefAdmin ?'bg-blue-50 text-blue-800 border border-blue-200' :'bg-emerald-50 text-emerald-800 border border-emerald-200'
 }`}>
 {isChiefAdmin ?'Chief Administrator' :'Editorial Content Officer'}
 </span>
 </div>
 <button
 onClick={() => {
 setProfileDropdownOpen(false);
 onLogout();
 }}
 className="w-full text-left px-3.5 py-2 font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
 >
 <LogOut className="w-4 h-4" />
 <span>Sign Out</span>
 </button>
 </div>
 )}
 </div>
 </div>
 </header>

 <div className="flex-1 flex overflow-hidden">
 {/* SIDEBAR NAVIGATION */}
 <aside
 className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col pt-14 lg:pt-0 ${
 mobileDrawerOpen ?'translate-x-0' :'-translate-x-full'
 }`}
 >
 <div className="flex-1 overflow-y-auto p-4 space-y-6">
 {navSections.map((sec, idx) => (
 <div key={idx} className="space-y-1.5">
 <h3 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
 {sec.title}
 </h3>
 <div className="space-y-0.5">
 {sec.items.map((item) => {
 const isActive = activeRoute === item.id;
 return (
 <button
 key={item.id}
 onClick={() => handleItemClick(item.id)}
 className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
 isActive
 ?'bg-blue-600 text-white shadow-2xs'
 :'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
 }`}
 >
 <span className={isActive ?'text-white' :'text-slate-500'}>{item.icon}</span>
 <span>{item.label}</span>
 </button>
 );
 })}
 </div>
 </div>
 ))}
 </div>

 <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2">
 <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
 <span>Platform Version</span>
 <span className="font-mono font-bold text-slate-700">v2.4.0</span>
 </div>
 <button
 onClick={onLogout}
 className="w-full py-2 px-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold text-rose-600 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
 >
 <LogOut className="w-3.5 h-3.5" />
 <span>Sign Out</span>
 </button>
 </div>
 </aside>

 {/* MAIN CONTENT AREA */}
 <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/70">
 <div className="max-w-7xl mx-auto space-y-6">
 {children}
 </div>
 </main>
 </div>
 </div>
 );
};
