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
  Search,
  ChevronRight,
  Bell
} from 'lucide-react';
import { AdminUser, logoutAdmin } from '../../services/adminAuthService';

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

  const navSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard' as AdminSubRoute, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Data Management',
      items: [
        { id: 'locations' as AdminSubRoute, label: 'Locations', icon: <MapPin className="w-4 h-4" /> },
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

  const handleItemClick = (routeId: AdminSubRoute) => {
    onNavigate(routeId);
    setMobileDrawerOpen(false);
  };

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

          {/* Admin Brand Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
              U
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                <span>UDYORA Admin</span>
                <span className="text-[10px] font-mono uppercase bg-blue-900/80 text-blue-200 px-1.5 py-0.2 rounded border border-blue-700">
                  Control Plane
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
              <span className="font-bold text-slate-100 block text-[11px] truncate max-w-[120px]">
                {currentAdmin.name}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                {currentAdmin.role}
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
            <p className="font-semibold text-slate-600">UDYORA Core v2.4</p>
            <p className="font-mono text-[10px]">PostgreSQL Engine Ready</p>
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

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
