import React from 'react';
import {
  MapPin,
  Briefcase,
  Award,
  Database,
  Users,
  FileText,
  TrendingUp,
  ShieldCheck,
  Languages,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';
import {
  getLocations,
  getBusinessTemplates,
  getSchemes,
  getEvidenceSources,
  getUsers,
  getAssessments
} from '../../services/adminDataService';
import { HorizontalBarChart, DonutChart } from '../charts/DashboardCharts';
import { AdminSubRoute } from './AdminLayout';
import { AdminRole } from '../../services/adminAuthService';

interface AdminDashboardViewProps {
  onNavigate: (route: AdminSubRoute) => void;
  role?: AdminRole;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate, role = 'ADMIN' }) => {
  const locations = getLocations();
  const businesses = getBusinessTemplates();
  const schemes = getSchemes();
  const evidence = getEvidenceSources();
  const users = getUsers();
  const assessments = getAssessments();

  // Compute live KPI values
  const totalLocations = locations.length;
  const verifiedLocations = locations.filter((l) => l.status === 'VERIFIED').length;
  const totalBusinesses = businesses.length;
  const activeSchemes = schemes.filter((s) => s.status === 'VERIFIED').length;
  const totalEvidence = evidence.length;
  const verifiedEvidence = evidence.filter((e) => e.status === 'VERIFIED').length;
  const totalUsers = users.length;
  const totalAssessments = assessments.length;

  // Analytics: Feasibility Distribution
  const highFeasibility = assessments.filter((a) => a.feasibilityCategory === 'HIGH').length;
  const modFeasibility = assessments.filter((a) => a.feasibilityCategory === 'MODERATE').length;
  const condFeasibility = assessments.filter((a) => a.feasibilityCategory === 'CONDITIONAL' || a.feasibilityCategory === 'LOW').length;
  const totalAssessed = assessments.length || 1;

  const feasibilityDistribution = [
    { name: 'High Feasibility (Green)', value: highFeasibility, percentage: Math.round((highFeasibility / totalAssessed) * 100), color: '#059669', formatted: `${highFeasibility} reports` },
    { name: 'Moderate Feasibility', value: modFeasibility, percentage: Math.round((modFeasibility / totalAssessed) * 100), color: '#2563eb', formatted: `${modFeasibility} reports` },
    { name: 'Conditional / Needs Support', value: condFeasibility, percentage: Math.round((condFeasibility / totalAssessed) * 100), color: '#d97706', formatted: `${condFeasibility} reports` }
  ];

  // Analytics: Assessments by Business Sector
  const sectorCounts: Record<string, number> = {};
  assessments.forEach((a) => {
    const key = a.businessName.includes('Dairy') ? 'Dairy Farming' : a.businessName.includes('Tailoring') ? 'Apparel & Tailoring' : 'Rural Retail Store';
    sectorCounts[key] = (sectorCounts[key] || 0) + 1;
  });

  const businessSectorBars = Object.entries(sectorCounts).map(([label, count]) => ({
    label,
    value: count,
    max: Math.max(...Object.values(sectorCounts), 5),
    unit: 'assessments',
    color: label.includes('Dairy') ? '#059669' : label.includes('Tailoring') ? '#7c3aed' : '#2563eb',
    badge: `${Math.round((count / totalAssessed) * 100)}% Share`
  }));

  // Analytics: Evidence Data Quality
  const dataQualityDonut = [
    { name: 'Verified Official Sources', value: verifiedEvidence, percentage: Math.round((verifiedEvidence / (totalEvidence || 1)) * 100), color: '#059669', formatted: `${verifiedEvidence} sources` },
    { name: 'Statistical Models', value: totalEvidence - verifiedEvidence, percentage: Math.round(((totalEvidence - verifiedEvidence) / (totalEvidence || 1)) * 100), color: '#d97706', formatted: `${totalEvidence - verifiedEvidence} sources` }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
              Administrative Control Plane
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Live Repository Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 mt-1.5">
            UDYORA Administration Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage business intelligence data, schemes, evidence, financial rules and platform configuration.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('locations')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Manage Locations</span>
          </button>
          <button
            onClick={() => onNavigate('schemes')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 transition-colors cursor-pointer shadow-xs"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Manage Schemes</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid (6 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div
          onClick={() => onNavigate('locations')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5 text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Locations</span>
            <MapPin className="w-3.5 h-3.5 text-blue-700" />
          </div>
          <span className="text-xl font-black text-slate-950">{totalLocations}</span>
          <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">{verifiedLocations} Verified</span>
        </div>

        <div
          onClick={() => onNavigate('businesses')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5 text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Business Templates</span>
            <Briefcase className="w-3.5 h-3.5 text-indigo-700" />
          </div>
          <span className="text-xl font-black text-slate-950">{totalBusinesses}</span>
          <span className="text-[10px] font-bold text-indigo-700 block mt-0.5">3 Active Sectors</span>
        </div>

        <div
          onClick={() => onNavigate('schemes')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5 text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Schemes</span>
            <Award className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <span className="text-xl font-black text-slate-950">{schemes.length}</span>
          <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">{activeSchemes} Verified Rules</span>
        </div>

        <div
          onClick={() => onNavigate('evidence')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5 text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Evidence Sources</span>
            <Database className="w-3.5 h-3.5 text-blue-700" />
          </div>
          <span className="text-xl font-black text-slate-950">{totalEvidence}</span>
          <span className="text-[10px] font-bold text-blue-700 block mt-0.5">Census & APMC</span>
        </div>

        <div
          onClick={() => onNavigate('users')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5 text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Registered Users</span>
            <Users className="w-3.5 h-3.5 text-slate-700" />
          </div>
          <span className="text-xl font-black text-slate-950">{totalUsers}</span>
          <span className="text-[10px] font-bold text-slate-500 block mt-0.5">3 Active Clusters</span>
        </div>

        <div
          onClick={() => onNavigate('reports')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5 text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Assessments</span>
            <FileText className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <span className="text-xl font-black text-slate-950">{totalAssessments}</span>
          <span className="text-[10px] font-bold text-amber-700 block mt-0.5">Multi-Agent Run</span>
        </div>
      </div>

      {/* Real Data Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Feasibility Verdict Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Assessment Feasibility Distribution</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Proportion of enterprise readiness ratings across generated advisory reports.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
              {totalAssessments} Records
            </span>
          </div>

          <DonutChart
            segments={feasibilityDistribution}
            centerTitle={`${highFeasibility}/${totalAssessed}`}
            centerSubtitle="High Readiness"
          />
        </div>

        {/* Chart 2: Assessments by Sector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-700" />
                <span>Assessments by Business Sector</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of micro-enterprise categories evaluated by entrepreneurs.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Sector Demand
            </span>
          </div>

          <HorizontalBarChart
            items={businessSectorBars}
            maxValue={Math.max(...Object.values(sectorCounts), 5)}
          />
        </div>
      </div>

      {/* Quick Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Generated Assessments */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <span>Recent Generated Assessments</span>
            </h3>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Reports</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {assessments.slice(0, 3).map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{a.id}</span>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {a.feasibilityCategory}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium mt-0.5">{a.businessName}</p>
                  <p className="text-[11px] text-slate-400">{a.locationName}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-slate-900">Score: {a.feasibilityScore}/100</span>
                  <span className="text-[11px] text-slate-400 block font-mono">EMI: ₹{a.monthlyEMI.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Verification Ratio Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-700" />
              <span>Evidence Verification</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified dataset ratio used by agents.
            </p>
          </div>

          <DonutChart
            segments={dataQualityDonut}
            centerTitle={`${verifiedEvidence}/${totalEvidence}`}
            centerSubtitle="Verified"
            size={160}
          />
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
