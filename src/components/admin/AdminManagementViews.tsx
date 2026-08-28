import React, { useState } from 'react';
import {
  MapPin,
  Briefcase,
  Award,
  Database,
  Users,
  FileText,
  Languages,
  History,
  Settings,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Shield,
  Eye,
  Archive,
  Save,
  X,
  RotateCcw,
  Check,
  Ban,
  ArrowRight,
  Info,
  Compass,
  Printer,
  FileSpreadsheet,
  BookOpen,
  UserCheck,
  UserX,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { AdminUser } from '../../services/adminAuthService';
import {
  LocationEntity,
  BusinessTemplateEntity,
  SchemeEntity,
  EvidenceSourceEntity,
  UserEntity,
  AssessmentEntity,
  AuditLogEntity,
  SystemSettingsEntity,
  getLocations,
  saveLocation,
  archiveLocation,
  getBusinessTemplates,
  saveBusinessTemplate,
  getSchemes,
  saveScheme,
  getEvidenceSources,
  saveEvidenceSource,
  getUsers,
  updateUserStatus,
  getAssessments,
  getAuditLogs,
  getSystemSettings,
  updateSystemSettings,
  getTranslationsList
} from '../../services/adminDataService';
import { getLgdIngestionStatus, triggerLgdDataRefresh } from '../../services/locationIngestionService';
import { checkDuplicateIdentitiesDiagnostic } from '../../services/userAuthService';

/* =========================================================================
   1. PARTICIPANTS MANAGEMENT VIEW (CHIEF ADMINISTRATOR ONLY)
   ========================================================================= */
interface AdminParticipantsViewProps {
  currentAdmin: AdminUser;
}

export const AdminParticipantsView: React.FC<AdminParticipantsViewProps> = ({ currentAdmin }) => {
  const [usersList, setUsersList] = useState<UserEntity[]>(getUsers());
  const [assessmentsList] = useState<AssessmentEntity[]>(getAssessments());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserEntity | null>(null);
  const [selectedAssessmentForReport, setSelectedAssessmentForReport] = useState<AssessmentEntity | null>(null);

  // Diagnostic State
  const [diagnosticResult, setDiagnosticResult] = useState<{
    duplicateMobileCount: number;
    duplicateEmailCount: number;
    details: string[];
  } | null>(null);

  // Modal States
  const [suspendModalUser, setSuspendModalUser] = useState<UserEntity | null>(null);
  const [suspendReason, setSuspendReason] = useState<string>('Policy review pending');
  const [removeModalUser, setRemoveModalUser] = useState<UserEntity | null>(null);
  const [removeReason, setRemoveReason] = useState<string>('Account deactivated per retention policy');

  const filteredUsers = usersList.filter((u) => {
    const matchSearch =
      u.maskedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.maskedPhone.includes(searchQuery) ||
      u.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleRunDiagnostic = () => {
    const res = checkDuplicateIdentitiesDiagnostic();
    setDiagnosticResult(res);
  };

  const handleConfirmSuspend = () => {
    if (!suspendModalUser) return;
    updateUserStatus(suspendModalUser.id, 'SUSPENDED');
    setUsersList(getUsers());
    setSuspendModalUser(null);
  };

  const handleConfirmReactivate = (u: UserEntity) => {
    updateUserStatus(u.id, 'ACTIVE');
    setUsersList(getUsers());
  };

  const handleConfirmRemove = () => {
    if (!removeModalUser) return;
    updateUserStatus(removeModalUser.id, 'SUSPENDED'); // Deactivate/Archive per retention policy
    setUsersList(getUsers());
    setRemoveModalUser(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
              CHIEF ADMINISTRATOR PRIVILEGED MODULE
            </span>
            <span className="text-xs text-slate-400 font-mono">Total: {usersList.length}</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-950 mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Participant Directory & Profile Management</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunDiagnostic}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4 text-blue-700" />
            <span>Duplicate Identity Check</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Selected Reports</span>
          </button>
        </div>
      </div>

      {/* DIAGNOSTIC BANNER */}
      {diagnosticResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-emerald-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Identity Uniqueness Audit Result</span>
          </div>
          <p className="text-slate-700 font-medium">
            Duplicate Mobiles: <strong className="font-mono font-bold text-emerald-800">{diagnosticResult.duplicateMobileCount}</strong> | Duplicate Emails: <strong className="font-mono font-bold text-emerald-800">{diagnosticResult.duplicateEmailCount}</strong>
          </p>
          {diagnosticResult.details.length === 0 ? (
            <p className="text-emerald-700 font-bold text-[11px]">✓ All participant mobile & email identities are canonically unique across the platform database.</p>
          ) : (
            <div className="text-rose-800 text-[11px] font-mono space-y-0.5 pt-1">
              {diagnosticResult.details.map((d, idx) => (
                <div key={idx}>⚠️ {d}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search participant name, phone, location..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-hidden cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE Only</option>
            <option value="SUSPENDED">SUSPENDED Only</option>
          </select>
        </div>
      </div>

      {/* Participants Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="py-3 px-4">Participant</th>
              <th className="py-3 px-4">Contact Phone</th>
              <th className="py-3 px-4">Language</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Assessments</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-bold text-slate-950 block">{u.maskedName}</span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {u.id}</span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-700">{u.maskedPhone}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                    {u.language}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-slate-900">{u.location}</td>
                <td className="py-3 px-4 font-mono font-bold text-blue-900">{u.assessmentsCount}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    u.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[11px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Profile</span>
                  </button>

                  {u.status === 'ACTIVE' ? (
                    <button
                      onClick={() => setSuspendModalUser(u)}
                      className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[11px]"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Suspend</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConfirmReactivate(u)}
                      className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[11px]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reactivate</span>
                    </button>
                  )}

                  <button
                    onClick={() => setRemoveModalUser(u)}
                    className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[11px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PARTICIPANT PROFILE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">PARTICIPANT PROFILE</span>
                <h3 className="text-lg font-black text-slate-950">{selectedUser.maskedName}</h3>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold">Contact Phone</span>
                <span className="font-mono font-bold text-slate-900">{selectedUser.maskedPhone}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold">Language</span>
                <span className="font-bold text-slate-900 uppercase">{selectedUser.language}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold">Primary Location</span>
                <span className="font-bold text-slate-900">{selectedUser.location}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold">Status</span>
                <span className="font-black text-emerald-700 uppercase">{selectedUser.status}</span>
              </div>
            </div>

            {/* Assessment History */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">ASSESSMENT HISTORY</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {assessmentsList.map((a) => (
                  <div key={a.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-blue-900 block">{a.id} • {a.locationName}</span>
                      <span className="text-slate-600">{a.businessName} (₹{(a.ownCapital / 100000).toFixed(1)}L Equity)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-700">{a.feasibilityScore}/100</span>
                      <button
                        onClick={() => setSelectedAssessmentForReport(a)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Report</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND MODAL */}
      {suspendModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-3 text-rose-700">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-black text-slate-950">Suspend Participant Account?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to suspend <strong>{suspendModalUser.maskedName}</strong>? The participant will be blocked from accessing platform assessments.
            </p>
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-700">Reason for Suspension *</label>
              <textarea
                rows={2}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setSuspendModalUser(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer">
                Cancel
              </button>
              <button onClick={handleConfirmSuspend} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-2xs">
                Suspend Participant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE MODAL */}
      {removeModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-3 text-rose-700">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-black text-slate-950">Remove / Archive Participant?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              This will deactivate <strong>{removeModalUser.maskedName}</strong> and archive their account. Historical assessment audit records will be preserved for compliance.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setRemoveModalUser(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer">
                Cancel
              </button>
              <button onClick={handleConfirmRemove} className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-2xs">
                Deactivate & Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   2. TRANSLATIONS MANAGEMENT VIEW (i18n MULTILINGUAL EDITOR)
   ========================================================================= */
export const AdminTranslationsView: React.FC = () => {
  const [translations, setTranslations] = useState(getTranslationsList());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const filtered = translations.filter((t) => {
    const matchSearch =
      t.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.en.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setTranslations((prev) =>
      prev.map((item) => (item.key === editingItem.key ? { ...editingItem, updatedAt: new Date().toISOString() } : item))
    );
    setEditingItem(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
              EDITORIAL CONTENT MODULE
            </span>
            <span className="text-xs text-slate-400 font-mono">Total Keys: {translations.length}</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-950 mt-1 flex items-center gap-2">
            <Languages className="w-5 h-5 text-blue-600" />
            <span>Centralized Multilingual Translations (i18n)</span>
          </h2>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search translation key or English text..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-hidden cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETE">COMPLETE Only</option>
            <option value="REVIEW REQUIRED">REVIEW REQUIRED Only</option>
          </select>
        </div>
      </div>

      {/* Translations Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="py-3 px-4">Key</th>
              <th className="py-3 px-4">English (EN)</th>
              <th className="py-3 px-4">Hindi (HI)</th>
              <th className="py-3 px-4">Telugu (TE)</th>
              <th className="py-3 px-4">Marathi (MR)</th>
              <th className="py-3 px-4">Kannada (KN)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.map((t) => (
              <tr key={t.key} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-blue-900 truncate max-w-[140px]">{t.key}</td>
                <td className="py-3 px-4 text-slate-950 font-semibold truncate max-w-[150px]">{t.en}</td>
                <td className="py-3 px-4 text-slate-700 truncate max-w-[130px]">{t.hi}</td>
                <td className="py-3 px-4 text-slate-700 truncate max-w-[130px]">{t.te}</td>
                <td className="py-3 px-4 text-slate-700 truncate max-w-[130px]">{t.mr}</td>
                <td className="py-3 px-4 text-slate-700 truncate max-w-[130px]">{t.kn}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    t.status === 'COMPLETE' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setEditingItem(t)}
                    className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[11px]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TRANSLATION EDITOR DRAWER/MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveItem} className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">EDIT TRANSLATION KEY</span>
                <h3 className="text-sm font-mono font-bold text-slate-950">{editingItem.key}</h3>
              </div>
              <button type="button" onClick={() => setEditingItem(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">English (en-IN) *</label>
                <input
                  type="text"
                  value={editingItem.en}
                  onChange={(e) => setEditingItem({ ...editingItem, en: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hindi (hi-IN)</label>
                  <input
                    type="text"
                    value={editingItem.hi}
                    onChange={(e) => setEditingItem({ ...editingItem, hi: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telugu (te-IN)</label>
                  <input
                    type="text"
                    value={editingItem.te}
                    onChange={(e) => setEditingItem({ ...editingItem, te: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marathi (mr-IN)</label>
                  <input
                    type="text"
                    value={editingItem.mr}
                    onChange={(e) => setEditingItem({ ...editingItem, mr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kannada (kn-IN)</label>
                  <input
                    type="text"
                    value={editingItem.kn}
                    onChange={(e) => setEditingItem({ ...editingItem, kn: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-2xs">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   3. GOVERNMENT SCHEMES MANAGEMENT VIEW
   ========================================================================= */
interface AdminSchemesViewProps {
  currentAdmin: AdminUser;
}

export const AdminSchemesView: React.FC<AdminSchemesViewProps> = ({ currentAdmin }) => {
  const [schemes, setSchemes] = useState<SchemeEntity[]>(getSchemes());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingScheme, setEditingScheme] = useState<SchemeEntity | null>(null);

  const filtered = schemes.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nodalAgency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (e: React.FormEvent, isPublishing: boolean) => {
    e.preventDefault();
    if (!editingScheme) return;
    const updated = {
      ...editingScheme,
      status: (isPublishing ? 'VERIFIED' : 'REQUIRES REVIEW') as any
    };
    saveScheme(updated);
    setSchemes(getSchemes());
    setEditingScheme(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
              SCHEME CATALOG ENGINE
            </span>
            <span className="text-xs text-slate-400 font-mono">Total Schemes: {schemes.length}</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-950 mt-1 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Government Credit & Subsidy Schemes</span>
          </h2>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scheme name or nodal agency..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white outline-hidden"
          />
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {s.shortName}
                </span>
                <h3 className="text-sm font-black text-slate-950 mt-1">{s.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{s.nodalAgency}</p>
              </div>
              <button
                onClick={() => setEditingScheme(s)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 font-medium">
              <p><span className="text-slate-400">Max Cost:</span> <span className="font-mono font-bold text-slate-900">₹{(s.maxProjectCost / 100000).toFixed(1)}L</span></p>
              <p><span className="text-slate-400">Subsidy:</span> <span className="font-bold text-emerald-700">{s.subsidySpecialRuralPct}% Rural</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* SCHEME EDITOR MODAL */}
      {editingScheme && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-950">Edit Scheme: {editingScheme.shortName}</h3>
              <button type="button" onClick={() => setEditingScheme(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Scheme Name *</label>
                <input
                  type="text"
                  value={editingScheme.name}
                  onChange={(e) => setEditingScheme({ ...editingScheme, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nodal Agency *</label>
                  <input
                    type="text"
                    value={editingScheme.nodalAgency}
                    onChange={(e) => setEditingScheme({ ...editingScheme, nodalAgency: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Project Cost (₹)</label>
                  <input
                    type="number"
                    value={editingScheme.maxProjectCost}
                    onChange={(e) => setEditingScheme({ ...editingScheme, maxProjectCost: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setEditingScheme(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={(e) => handleSave(e, false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer">
                Save Draft
              </button>
              <button type="button" onClick={(e) => handleSave(e, true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-2xs">
                Publish Scheme
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   4. EVIDENCE SOURCES & BUSINESS TEMPLATES VIEWS
   ========================================================================= */
export const AdminEvidenceView: React.FC = () => {
  const [sources] = useState(getEvidenceSources());
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          <span>Evidence Sources & Ground Truth Datasets</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {sources.map((s) => (
          <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-950">{s.sourceName}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                {s.status}
              </span>
            </div>
            <p className="text-slate-600 font-medium">{s.organization}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminBusinessesView: React.FC = () => {
  const [templates] = useState(getBusinessTemplates());
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          <span>Business Model Templates</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {templates.map((b) => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-950">{b.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-blue-800 border border-blue-200">
                {b.status}
              </span>
            </div>
            <p className="text-slate-600 font-medium">{b.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminGuidanceView: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
      <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <span>Announcements & Guidance Content</span>
      </h2>
      <p className="text-xs text-slate-600 font-medium">
        Editorial Guidance for rural entrepreneurs & district data coordinators.
      </p>
    </div>
  );
};

export const AdminLocationsView: React.FC = () => {
  const [locations] = useState<LocationEntity[]>(getLocations());
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-600" />
        <span>Locations Management (LGD)</span>
      </h2>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs">
        <p className="font-bold text-slate-900">{locations.length} Authoritative LGD Locations Connected</p>
      </div>
    </div>
  );
};

export const AdminUserManagementView: React.FC<{ currentAdmin: AdminUser }> = ({ currentAdmin }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
        <UserCheck className="w-5 h-5 text-blue-600" />
        <span>Admin User & Role Governance</span>
      </h2>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-xs space-y-2">
        <p className="font-bold text-slate-950">Active Admin Session: {currentAdmin.name} ({currentAdmin.role})</p>
      </div>
    </div>
  );
};

export const AdminAssessmentsView: React.FC = () => {
  const [assessments] = useState<AssessmentEntity[]>(getAssessments());
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
        <FileText className="w-5 h-5 text-indigo-600" />
        <span>Enterprise Feasibility Assessments</span>
      </h2>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Location</th>
              <th className="p-3">Business</th>
              <th className="p-3">Feasibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assessments.map((a) => (
              <tr key={a.id}>
                <td className="p-3 font-mono font-bold text-blue-900">{a.id}</td>
                <td className="p-3 font-bold text-slate-900">{a.locationName}</td>
                <td className="p-3 text-slate-600">{a.businessName}</td>
                <td className="p-3 font-mono font-bold text-emerald-700">{a.feasibilityScore}/100</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AdminAuditLogsView: React.FC = () => {
  const [logs] = useState<AuditLogEntity[]>(getAuditLogs());
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
        <History className="w-5 h-5 text-slate-700" />
        <span>Admin Audit Logs & Provenance</span>
      </h2>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs">
        <p className="font-bold text-slate-900">{logs.length} Immutable Audit Entries Recorded</p>
      </div>
    </div>
  );
};

export const AdminSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettingsEntity>(getSystemSettings());
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 text-xs">
      <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
        <Settings className="w-5 h-5 text-slate-700" />
        <span>Platform System Settings</span>
      </h2>
      <p className="font-bold text-slate-700">Platform Version: {settings.platformVersion}</p>
    </div>
  );
};
