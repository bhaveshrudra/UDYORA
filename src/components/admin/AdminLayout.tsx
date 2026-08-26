import React, { useState } from 'react';
import {
  LayoutDashboard,
  MapPin,
  Briefcase,
  Award,
  Database,
  Calculator,
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
  Bell
} from 'lucide-react';
import { AdminUser, isRouteAllowedForRole } from '../../services/adminAuthService';

export type AdminSubRoute =
  | 'dashboard'
  | 'locations'
  | 'businesses'
  | 'schemes'
  | 'evidence'
  | 'financial-rules'
  | 'users'
  | 'reports'
  | 'translations'
  | 'audit-logs'
  | 'settings';

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

  const rawNavSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard' as AdminSubRoute, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Data Management',
      items: [
        { id: 'locations' as AdminSubRoute, label: 'Locations (LGD)', icon: <MapPin className="w-4 h-4" /> },
        { id: 'businesses' as AdminSubRoute, label: 'Business Templates', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'schemes' as AdminSubRoute, label: 'Government Schemes', icon: <Award className="w-4 h-4" /> },
        { id: 'evidence' as AdminSubRoute, label: 'Evidence Sources', icon: <Database className="w-4 h-4" /> },
        { id: 'financial-rules' as AdminSubRoute, label: 'Financial Rules', icon: <Calculator className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Platform',
      items: [
        { id: 'users' as AdminSubRoute, label: 'User Directory', icon: <Users className="w-4 h-4" /> },
        { id: 'reports' as AdminSubRoute, label: 'Assessments', icon: <FileText className="w-4 h-4" /> },
        { id: 'translations' as AdminSubRoute, label: 'Translations (i18n)', icon: <Languages className="w-4 h-4" /> }
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'audit-logs' as AdminSubRoute, label: 'Audit Logs', icon: <History className="w-4 h-4" /> },
        { id: 'settings' as AdminSubRoute, label: 'Settings', icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  // Filter sections and items based on active role permissions
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

  const isCurrentRouteAllowed = isRouteAllowedForRole(currentAdmin.role, activeRoute);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-950">
      {/* Top Admin Navigation Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-xs px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle navigation drawer"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Admin Brand Badge & Role Pill */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
              U
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-tight flex items-center gap-2">
                <span>UDYORA Administration Center</span>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    currentAdmin.role === 'ADMIN'
                      ? 'bg-blue-900/90 text-blue-200 border-blue-700'
                      : 'bg-amber-900/90 text-amber-200 border-amber-700'
                  }`}
                >
                  {currentAdmin.role}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToPublic}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span>Public App</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          {/* Admin User Chip */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800 text-xs">
            <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-[10px]">
              {currentAdmin.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left leading-tight">
              <span className="font-bold text-slate-100 block text-[11px] truncate max-w-[140px]">
                {currentAdmin.name}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                {currentAdmin.email}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="Sign out of Admin Portal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Layout Container (Sidebar + Content Workspace) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-60 bg-white border-r border-slate-200 flex-col shrink-0 overflow-y-auto">
          <div className="p-4 space-y-6 flex-1">
            {navSections.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block mb-1">
                  {sec.title}
                </span>
                {sec.items.map((item) => {
                  const isActive = activeRoute === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className={isActive ? 'text-blue-700' : 'text-slate-500'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Bottom Metadata */}
          <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">UDYORA Core v2.4</span>
              <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.2 rounded font-bold">
                {currentAdmin.role}
              </span>
            </div>
            <p className="font-mono text-[10px]">Session Active</p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative w-64 bg-white shadow-xl flex flex-col p-4 space-y-6 overflow-y-auto z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">Admin Navigation</span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navSections.map((sec, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                    {sec.title}
                  </span>
                  {sec.items.map((item) => {
                    const isActive = activeRoute === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? 'bg-blue-50 text-blue-900 border border-blue-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Workspace (or Permission Denied Guard) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70">
          <div className="max-w-6xl mx-auto space-y-6">
            {isCurrentRouteAllowed ? (
              children
            ) : (
              <PermissionDeniedView
                role={currentAdmin.role}
                route={activeRoute}
                onReturnToDashboard={() => onNavigate('dashboard')}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export const PermissionDeniedView: React.FC<{
  role: string;
  route: string;
  onReturnToDashboard: () => void;
}> = ({ role, route, onReturnToDashboard }) => {
  return (
    <div className="bg-white border border-rose-200 rounded-3xl p-8 sm:p-12 shadow-sm text-center max-w-lg mx-auto space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-black text-slate-950">Permission Denied</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The <strong className="text-slate-900 font-mono uppercase">{role}</strong> role does not have administrative permission to view or manage the <strong className="text-slate-900 font-mono">/{route}</strong> section.
        </p>
      </div>
      <div className="pt-2">
        <button
          onClick={onReturnToDashboard}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 transition-colors cursor-pointer shadow-xs"
        >
          <span>Return to Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
