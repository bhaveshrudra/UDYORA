import React, { useState } from 'react';
import {
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
  Compass
} from 'lucide-react';
import {
  LocationEntity,
  BusinessTemplateEntity,
  SchemeEntity,
  EvidenceSourceEntity,
  FinancialRuleEntity,
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
  getFinancialRules,
  saveFinancialRule,
  getUsers,
  updateUserStatus,
  getAssessments,
  getAuditLogs,
  getSystemSettings,
  updateSystemSettings,
  getTranslationsList
} from '../../services/adminDataService';

import { getLgdIngestionStatus, triggerLgdDataRefresh } from '../../services/locationIngestionService';

/* =========================================================================
   1. LOCATION MANAGEMENT VIEW
   ========================================================================= */
export const AdminLocationsView: React.FC = () => {
  const [locations, setLocations] = useState<LocationEntity[]>(getLocations());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [editingLocation, setEditingLocation] = useState<LocationEntity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [ingestionStatus, setIngestionStatus] = useState(getLgdIngestionStatus());
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const filtered = locations.filter((loc) => {
    if (loc.isArchived) return false;
    const matchSearch =
      loc.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || loc.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleTriggerSync = () => {
    const res = triggerLgdDataRefresh();
    setIngestionStatus(res);
    setSyncFeedback('LGD Directory synchronized successfully.');
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingLocation({
      id: `loc_${Date.now()}`,
      village: '',
      block: '',
      district: '',
      state: 'Maharashtra',
      pincode: '',
      areaType: 'Rural',
      latitude: 18.52,
      longitude: 73.85,
      population: 3000,
      households: 600,
      nearestDairyCooperativeKm: 5.0,
      nearestApmcMandiKm: 20.0,
      nearestHighwayKm: 3.0,
      dataSource: 'Official Census & Mandi Registry',
      status: 'VERIFIED',
      confidence: 0.85,
      updatedAt: new Date().toISOString(),
      verifiedBy: 'Admin Officer'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation || !editingLocation.village || !editingLocation.district) return;
    saveLocation(editingLocation);
    setLocations(getLocations());
    setIsModalOpen(false);
  };

  const handleArchive = (id: string, name: string) => {
    if (window.confirm(`Archive location "${name}"? Archived records will be hidden from active suggestions.`)) {
      archiveLocation(id);
      setLocations(getLocations());
    }
  };

  return (
    <div className="space-y-5">
      {/* Official LGD Ingestion Status Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.2 rounded">
                  LGD Hierarchy Connected
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Version: {ingestionStatus.sourceVersion}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Local Government Directory (LGD) Administrative Ingestion
              </h3>
            </div>
          </div>

          <button
            onClick={handleTriggerSync}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer self-start sm:self-center shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Verify & Re-sync LGD</span>
          </button>
        </div>

        {syncFeedback && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{syncFeedback}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">States & UTs</span>
            <span className="text-sm font-black text-slate-900 font-mono">{ingestionStatus.totalStates} Covered</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Official Districts</span>
            <span className="text-sm font-black text-slate-900 font-mono">{ingestionStatus.totalDistricts} Indexed</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Sub-Districts/Mandals</span>
            <span className="text-sm font-black text-slate-900 font-mono">{ingestionStatus.totalSubDistricts} Mapped</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Unmapped Records</span>
            <span className="text-sm font-black text-emerald-700 font-mono">{ingestionStatus.unmappedParentCount} (0 Errors)</span>
          </div>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-700" />
            <span>Location Data Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage village demographic catchments, APMC mandi proximities, and cooperative node references.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search village, block, district or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="ESTIMATED">ESTIMATED</option>
            <option value="INCOMPLETE">INCOMPLETE</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Village / Block</th>
                <th className="py-3.5 px-4">District / State</th>
                <th className="py-3.5 px-4">Population / HH</th>
                <th className="py-3.5 px-4">Infrastructure Proximities</th>
                <th className="py-3.5 px-4">Data Quality</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{loc.village}</span>
                    <span className="text-[11px] text-slate-500">Block: {loc.block} (PIN: {loc.pincode})</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-800 block">{loc.district}</span>
                    <span className="text-[11px] text-slate-500">{loc.state} • {loc.areaType}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-slate-900 font-bold block">{loc.population.toLocaleString('en-IN')} pop</span>
                    <span className="text-[11px] text-slate-400">{loc.households} households</span>
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-slate-600">
                    <div>Dairy Co-op: <strong className="font-mono text-slate-900">{loc.nearestDairyCooperativeKm} km</strong></div>
                    <div>APMC Mandi: <strong className="font-mono text-slate-900">{loc.nearestApmcMandiKm} km</strong></div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                        loc.status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {loc.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      Conf: {Math.round(loc.confidence * 100)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingLocation(loc);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit location"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleArchive(loc.id, loc.village)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Archive location"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No locations match the active search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingLocation.village ? `Edit Location: ${editingLocation.village}` : 'Add New Location Catchment'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Village Name</label>
                  <input
                    type="text"
                    required
                    value={editingLocation.village}
                    onChange={(e) => setEditingLocation({ ...editingLocation, village: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Block / Taluk</label>
                  <input
                    type="text"
                    required
                    value={editingLocation.block}
                    onChange={(e) => setEditingLocation({ ...editingLocation, block: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={editingLocation.district}
                    onChange={(e) => setEditingLocation({ ...editingLocation, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={editingLocation.state}
                    onChange={(e) => setEditingLocation({ ...editingLocation, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={editingLocation.pincode}
                    onChange={(e) => setEditingLocation({ ...editingLocation, pincode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Population</label>
                  <input
                    type="number"
                    value={editingLocation.population}
                    onChange={(e) => setEditingLocation({ ...editingLocation, population: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Households</label>
                  <input
                    type="number"
                    value={editingLocation.households}
                    onChange={(e) => setEditingLocation({ ...editingLocation, households: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Dairy Co-op (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingLocation.nearestDairyCooperativeKm}
                    onChange={(e) => setEditingLocation({ ...editingLocation, nearestDairyCooperativeKm: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">APMC Mandi (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingLocation.nearestApmcMandiKm}
                    onChange={(e) => setEditingLocation({ ...editingLocation, nearestApmcMandiKm: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Data Quality</label>
                  <select
                    value={editingLocation.status}
                    onChange={(e) => setEditingLocation({ ...editingLocation, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="ESTIMATED">ESTIMATED</option>
                    <option value="INCOMPLETE">INCOMPLETE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Source Benchmark</label>
                  <input
                    type="text"
                    value={editingLocation.dataSource}
                    onChange={(e) => setEditingLocation({ ...editingLocation, dataSource: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 cursor-pointer shadow-xs"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   2. BUSINESS TEMPLATE MANAGEMENT VIEW
   ========================================================================= */
export const AdminBusinessesView: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessTemplateEntity[]>(getBusinessTemplates());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-700" />
            <span>Business Template Sizing & Unit Economics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure enterprise sector financial parameters, CapEx models, and seasonality risk factors used by the Business Agent.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {businesses.map((biz) => (
          <div key={biz.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                  {biz.category}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {biz.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">{biz.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{biz.description}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Indicative CapEx:</span>
                  <span className="font-bold text-slate-900 font-mono">₹{biz.indicativeCapEx.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Working Capital:</span>
                  <span className="font-bold text-slate-900 font-mono">₹{biz.workingCapital.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expected Revenue:</span>
                  <span className="font-bold text-emerald-700 font-mono">₹{biz.expectedMonthlyRevenue.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 space-y-1">
                <strong className="text-slate-900 block">Seasonality & Operating Notes:</strong>
                <p className="italic">{biz.seasonalityNotes}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Verified: {biz.verifiedBy}</span>
              <button
                onClick={() => alert(`Financial assumptions for ${biz.name} are code-governed by the SIH26091 deterministic calculator.`)}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                Inspect Norms
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   3. SCHEME MANAGEMENT VIEW
   ========================================================================= */
export const AdminSchemesView: React.FC = () => {
  const [schemes, setSchemes] = useState<SchemeEntity[]>(getSchemes());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <span>Government Schemes & Credit Subsidies</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule-based qualification criteria for PMEGP, MUDRA, AHIDF, and Stand-Up India.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Official Verification Policy:</strong>
          <span>All scheme rules must be checked against the latest MoMSME / MoA&FW official notifications. Unverified rules must be marked as REQUIRES REVIEW.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemes.map((s) => (
          <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {s.code}
                </span>
                <h3 className="font-bold text-base text-slate-950 mt-1">{s.name}</h3>
                <p className="text-[11px] text-slate-500 font-medium">Nodal Agency: {s.nodalAgency}</p>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                {s.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 block">Max Project Ceiling</span>
                <span className="text-sm font-black text-slate-900 font-mono">₹{s.maxProjectCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 block">Rural Subsidy (Special)</span>
                <span className="text-sm font-black text-emerald-700 font-mono">{s.subsidySpecialRuralPct}%</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 block">Min Margin Equity</span>
                <span className="text-sm font-black text-slate-900 font-mono">{s.minMarginContributionPct}%</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 block">Interest Rate Range</span>
                <span className="text-sm font-black text-slate-900 font-mono">{s.interestRateRange}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-800 text-[11px]">Mandatory Document Checklist:</span>
              <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                {s.requiredDocuments.slice(0, 3).map((d, i) => (
                  <li key={i} className="truncate">{d}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <a
                href={s.officialSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900"
              >
                <span>Official Nodal Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[10px] text-slate-400 font-mono">Verified: {s.verificationDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   4. EVIDENCE SOURCE MANAGEMENT VIEW
   ========================================================================= */
export const AdminEvidenceView: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceSourceEntity[]>(getEvidenceSources());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-700" />
            <span>Evidence Audit & Source Provenance</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage official datasets, Census registries, and Mandi price feeds referenced by multi-agent reasoning.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Dataset / Source</th>
              <th className="py-3.5 px-4">Metric & Benchmark Value</th>
              <th className="py-3.5 px-4">Organization / Level</th>
              <th className="py-3.5 px-4">Confidence</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {evidenceList.map((ev) => (
              <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4">
                  <span className="font-bold text-slate-900 block">{ev.sourceName}</span>
                  <a href={ev.url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 mt-0.5">
                    <span>{ev.datasetName}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-slate-800 font-bold block">{ev.metric}</span>
                  <span className="text-[11px] font-mono text-slate-600">{ev.value}</span>
                </td>
                <td className="py-3.5 px-4 text-[11px] text-slate-600">
                  <span className="block font-semibold">{ev.organization}</span>
                  <span className="text-slate-400">{ev.geographicLevel} Level ({ev.sourceType})</span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                  {Math.round(ev.confidence * 100)}%
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {ev.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================================
   5. FINANCIAL RULE MANAGEMENT VIEW
   ========================================================================= */
export const AdminFinancialRulesView: React.FC = () => {
  const [rules, setRules] = useState<FinancialRuleEntity[]>(getFinancialRules());

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-amber-700" />
          <span>Configurable Financial Assumptions</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage policy-approved lending assumptions without touching core deterministic math calculation formulas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {rule.parameterKey}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {rule.status}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900">{rule.ruleName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Configured Parameter Value:</span>
              <span className="text-base font-black text-slate-950 font-mono">
                {rule.value} {rule.unit}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Source: {rule.source}</span>
              <span>Effective: {rule.effectiveDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Domain Comparison Weights Configuration */}
      <AdminComparisonWeightsManager />
    </div>
  );
};

export const AdminComparisonWeightsManager: React.FC = () => {
  const [weights, setWeights] = useState({
    marketOpportunity: 20,
    capitalFit: 20,
    revenuePotential: 15,
    competition: 10,
    operationalRisk: 15,
    infrastructure: 10,
    schemeFit: 10
  });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const total = (Object.values(weights) as number[]).reduce((a: number, b: number) => a + b, 0);
  const isValid = total === 100;

  const handleSave = () => {
    if (!isValid) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('udyora_comparison_weights', JSON.stringify({
        marketOpportunity: weights.marketOpportunity / 100,
        capitalFit: weights.capitalFit / 100,
        revenuePotential: weights.revenuePotential / 100,
        competition: weights.competition / 100,
        operationalRisk: weights.operationalRisk / 100,
        infrastructure: weights.infrastructure / 100,
        schemeFit: weights.schemeFit / 100
      }));
    }
    setSaveMessage('Comparison algorithm weights updated successfully.');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleChange = (key: keyof typeof weights, val: string) => {
    const num = Math.max(0, Math.min(100, parseInt(val) || 0));
    setWeights((prev) => ({ ...prev, [key]: num }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
              Domain Comparison Engine
            </span>
            <span className={`text-xs font-bold font-mono ${isValid ? 'text-emerald-700' : 'text-rose-600'}`}>
              Total Weight: {total}% {isValid ? '(Valid)' : '(Must equal 100%)'}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-950 mt-1">
            Business Suitability Scoring Weights
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure the 7 multi-factor weights used to calculate localized business opportunity rankings.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!isValid}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs self-start sm:self-center"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Weights</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
          <label className="text-[11px] font-bold text-slate-700 block">Market Opportunity</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={weights.marketOpportunity}
              onChange={(e) => handleChange('marketOpportunity', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
            />
            <span className="font-mono text-slate-500">%</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
          <label className="text-[11px] font-bold text-slate-700 block">Capital Fit</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={weights.capitalFit}
              onChange={(e) => handleChange('capitalFit', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
            />
            <span className="font-mono text-slate-500">%</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
          <label className="text-[11px] font-bold text-slate-700 block">Revenue / Margin</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={weights.revenuePotential}
              onChange={(e) => handleChange('revenuePotential', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
            />
            <span className="font-mono text-slate-500">%</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
          <label className="text-[11px] font-bold text-slate-700 block">Operational Risk</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={weights.operationalRisk}
              onChange={(e) => handleChange('operationalRisk', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
            />
            <span className="font-mono text-slate-500">%</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
          <label className="text-[11px] font-bold text-slate-700 block">Infrastructure</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={weights.infrastructure}
              onChange={(e) => handleChange('infrastructure', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
            />
            <span className="font-mono text-slate-500">%</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
          <label className="text-[11px] font-bold text-slate-700 block">Scheme Fit</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={weights.schemeFit}
              onChange={(e) => handleChange('schemeFit', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
            />
            <span className="font-mono text-slate-500">%</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
          <label className="text-[11px] font-bold text-slate-700 block">Competition</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={weights.competition}
              onChange={(e) => handleChange('competition', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
            />
            <span className="font-mono text-slate-500">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   6. USER MANAGEMENT VIEW (PRIVACY-PRESERVING)
   ========================================================================= */
export const AdminUsersView: React.FC = () => {
  const [users, setUsers] = useState<UserEntity[]>(getUsers());

  const handleToggleStatus = (id: string, current: string) => {
    const next = current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    updateUserStatus(id, next);
    setUsers(getUsers());
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-700" />
          <span>User Directory & Active Sessions</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Privacy-preserving registry of participating rural entrepreneurs.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Language & Location</th>
              <th className="py-3.5 px-4">Preferred Sector</th>
              <th className="py-3.5 px-4">Assessments</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4">
                  <span className="font-bold text-slate-900 block">{u.maskedName}</span>
                  <span className="text-[11px] font-mono text-slate-400">{u.maskedPhone}</span>
                </td>
                <td className="py-3.5 px-4 text-slate-700">
                  <span className="font-bold uppercase text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.2 rounded mr-1.5">
                    {u.language}
                  </span>
                  <span>{u.location}</span>
                </td>
                <td className="py-3.5 px-4 text-slate-800">{u.preferredBusiness}</td>
                <td className="py-3.5 px-4 font-mono font-bold">{u.assessmentsCount} reports</td>
                <td className="py-3.5 px-4">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleToggleStatus(u.id, u.status)}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                  >
                    {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================================
   7. ASSESSMENT REPORTS VIEW
   ========================================================================= */
export const AdminAssessmentsView: React.FC = () => {
  const [assessments] = useState<AssessmentEntity[]>(getAssessments());
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentEntity | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-700" />
          <span>Historical Advisory Assessments</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Inspect generated feasibility verdicts, financial calculations, and reconciled agent findings.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Assessment ID</th>
              <th className="py-3.5 px-4">Location & Sector</th>
              <th className="py-3.5 px-4">Own Capital / Cost</th>
              <th className="py-3.5 px-4">Feasibility Score</th>
              <th className="py-3.5 px-4">Matched Scheme</th>
              <th className="py-3.5 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {assessments.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-blue-950">
                  {a.id}
                  <span className="text-[10px] text-slate-400 block font-normal">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-slate-900 block">{a.businessName}</span>
                  <span className="text-[11px] text-slate-500">{a.locationName}</span>
                </td>
                <td className="py-3.5 px-4 font-mono">
                  <span className="font-bold text-slate-900 block">₹{a.ownCapital.toLocaleString('en-IN')}</span>
                  <span className="text-[11px] text-slate-400">Total: ₹{a.projectCost.toLocaleString('en-IN')}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-xs font-black font-mono text-slate-900 block">{a.feasibilityScore}/100</span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {a.feasibilityCategory}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-700 text-[11px]">
                  {a.matchedScheme}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setSelectedAssessment(a)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assessment Inspection Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Advisory Assessment</span>
                <h3 className="text-base font-bold text-slate-900">{selectedAssessment.id}</h3>
              </div>
              <button onClick={() => setSelectedAssessment(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-2">
                <p className="font-bold text-sm text-slate-900">{selectedAssessment.businessName}</p>
                <p className="text-slate-600">{selectedAssessment.locationName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="bg-blue-50/50 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Promoter Equity</span>
                  <span className="text-sm font-black text-slate-900">₹{selectedAssessment.ownCapital.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-blue-50/50 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Monthly EMI</span>
                  <span className="text-sm font-black text-emerald-700">₹{selectedAssessment.monthlyEMI.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Feasibility Verdict: {selectedAssessment.feasibilityCategory}</span>
                  <span className="font-mono">{selectedAssessment.feasibilityScore}/100</span>
                </div>
                <p className="text-[11px]">Matched Institutional Scheme: {selectedAssessment.matchedScheme} (DSCR: {selectedAssessment.dscr}x)</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAssessment(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 cursor-pointer shadow-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   8. TRANSLATIONS (i18n) VIEW
   ========================================================================= */
export const AdminTranslationsView: React.FC = () => {
  const [translations] = useState(getTranslationsList());
  const [search, setSearch] = useState<string>('');

  const filtered = translations.filter((t) =>
    t.key.toLowerCase().includes(search.toLowerCase()) ||
    t.en.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            <Languages className="w-5 h-5 text-blue-700" />
            <span>Centralized Multilingual Translations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit strings across all 5 supported Indian languages: English, हिन्दी, मराठी, తెలుగు, and ಕನ್ನಡ.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search translation key or English text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Key</th>
              <th className="py-3.5 px-4">English (EN)</th>
              <th className="py-3.5 px-4">हिन्दी (HI)</th>
              <th className="py-3.5 px-4">తెలుగు (TE)</th>
              <th className="py-3.5 px-4">मराठी (MR)</th>
              <th className="py-3.5 px-4">ಕನ್ನಡ (KN)</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.slice(0, 15).map((t) => (
              <tr key={t.key} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-blue-900 text-[11px] truncate max-w-[140px]">{t.key}</td>
                <td className="py-3 px-4 text-slate-800 truncate max-w-[150px]">{t.en}</td>
                <td className="py-3 px-4 text-slate-700 truncate max-w-[150px]">{t.hi}</td>
                <td className="py-3 px-4 text-slate-700 truncate max-w-[150px]">{t.te}</td>
                <td className="py-3 px-4 text-slate-700 truncate max-w-[150px]">{t.mr}</td>
                <td className="py-3 px-4 text-slate-700 truncate max-w-[150px]">{t.kn}</td>
                <td className="py-3 px-4">
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================================
   9. AUDIT LOGS VIEW
   ========================================================================= */
export const AdminAuditLogsView: React.FC = () => {
  const [logs] = useState<AuditLogEntity[]>(getAuditLogs());

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-700" />
          <span>System Audit Trail & Provenance</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable log of all administrative actions, data edits, and rule updates.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4">Administrator</th>
              <th className="py-3.5 px-4">Action & Entity</th>
              <th className="py-3.5 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-slate-900 block">{log.actor}</span>
                  <span className="text-[10px] font-mono text-slate-400">{log.actorRole}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 inline-block mb-1">
                    {log.action} • {log.entityType}
                  </span>
                  <span className="text-xs font-bold text-slate-800 block">{log.entityName}</span>
                </td>
                <td className="py-3.5 px-4 text-slate-600 text-[11px] leading-relaxed max-w-md">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================================
   10. SYSTEM SETTINGS VIEW
   ========================================================================= */
export const AdminSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettingsEntity>(getSystemSettings());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          <span>Platform Settings & Governance</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure global platform flags, minimum evidence verification thresholds, and contact channels.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Platform configuration updated successfully. Recorded in audit log.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1.5">
              Default Platform Language
            </label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिन्दी (HI)</option>
              <option value="te">తెలుగు (TE)</option>
              <option value="mr">मराठी (MR)</option>
              <option value="kn">ಕನ್ನಡ (KN)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1.5">
              Default Valuation Currency
            </label>
            <input
              type="text"
              value={settings.defaultCurrency}
              onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
            />
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-100">
          <label className="flex items-center gap-3 text-slate-800 font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={settings.demoModeEnabled}
              onChange={(e) => setSettings({ ...settings, demoModeEnabled: e.target.checked })}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            />
            <span>Enable 1-Click Demo Presets on Public Input Workspace</span>
          </label>

          <label className="flex items-center gap-3 text-slate-800 font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={settings.requireEvidenceVerification}
              onChange={(e) => setSettings({ ...settings, requireEvidenceVerification: e.target.checked })}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            />
            <span>Enforce Strict Evidence Verification Flagging in Final Reports</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1.5">
              Public Advisory Support Email
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1.5">
              Platform Version String
            </label>
            <input
              type="text"
              readOnly
              value={settings.platformVersion}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Compass className="w-4 h-4 text-blue-700" />
            <span className="text-sm">Map & Spatial Intelligence Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1.5">
                Default Analysis Radius
              </label>
              <select
                defaultValue="5"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
              >
                <option value="5">5 Kilometers (Primary Catchment)</option>
                <option value="10">10 Kilometers (Extended Catchment)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1.5">
                Map Tile Provider
              </label>
              <select
                defaultValue="osm"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
              >
                <option value="osm">OpenStreetMap Standard (High Performance)</option>
                <option value="carto">CartoDB Positron (Clean Minimalist)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1.5">
                Spatial Cache Expiry
              </label>
              <select
                defaultValue="24"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
              >
                <option value="12">12 Hours</option>
                <option value="24">24 Hours (Recommended)</option>
                <option value="48">48 Hours</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-slate-800 text-[11px] space-y-1 font-medium">
            <span className="font-bold block text-blue-950">Spatial Observation Governance:</span>
            <p>
              Observed POIs are tagged with quality badge <code>OBSERVED</code>. Authoritative administrative boundaries remain anchored to Local Government Directory (LGD).
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 transition-colors cursor-pointer shadow-xs"
          >
            Save Platform Settings
          </button>
        </div>
      </form>
    </div>
  );
};
