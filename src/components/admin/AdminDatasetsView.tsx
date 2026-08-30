import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Layers,
  HelpCircle,
  Eye,
  ArrowRight,
  ShieldCheck,
  Tag,
  MapPin,
  IndianRupee,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { AdminUser } from '../../services/adminAuthService';
import {
  getIngestedDatasets,
  normalizeApplicantDataset,
  normalizeEntrepreneurDataset,
  normalizeLoanDataset,
  detectDatasetConflicts
} from '../../services/datasetService';
import { CanonicalDatasetRecord, DatasetConflictRecord, DatasetSourceType, ValidationStatus } from '../../types/datasetTypes';

interface AdminDatasetsViewProps {
  currentAdmin: AdminUser;
}

export const AdminDatasetsView: React.FC<AdminDatasetsViewProps> = ({ currentAdmin }) => {
  const [activeDatasetTab, setActiveDatasetTab] = useState<DatasetSourceType | 'CONFLICTS'>('ENTREPRENEUR');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<CanonicalDatasetRecord | null>(null);

  // Ingested Datasets
  const datasets = getIngestedDatasets();

  const currentDatasetResult =
    activeDatasetTab === 'APPLICANT'
      ? datasets.applicant
      : activeDatasetTab === 'ENTREPRENEUR'
      ? datasets.entrepreneur
      : activeDatasetTab === 'LOAN'
      ? datasets.loan
      : null;

  const currentRecords = currentDatasetResult?.records || [];

  const filteredRecords = currentRecords.filter((record) => {
    const matchesSearch =
      (record.sourceRecordId && record.sourceRecordId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.maskedName && record.maskedName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.district && record.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.state && record.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.businessCategory && record.businessCategory.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'VALID' && record.validationStatus === 'VALID') ||
      (statusFilter === 'INVALID' && record.validationStatus === 'INVALID') ||
      (statusFilter === 'WARNING' && record.validationStatus === 'WARNING') ||
      (statusFilter === 'DUPLICATE' && record.isDuplicate);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-950 tracking-tight">Dataset Ingestion & Management</h1>
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
              DEMO / TEST DATA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            RFC 4180 normalized dataset ingestion with strict PII masking, LGD validation, and conflict resolution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>PII Masked</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-700">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>3 Bundled Datasets</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Records</p>
          <p className="text-2xl font-black text-slate-950 mt-1">{datasets.allRecords.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Across 3 datasets</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Valid Records</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {datasets.allRecords.filter((r) => r.validationStatus === 'VALID').length}
          </p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Passes all validations</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Warnings</p>
          <p className="text-2xl font-black text-amber-700 mt-1">
            {datasets.allRecords.filter((r) => r.validationStatus === 'WARNING').length}
          </p>
          <p className="text-[10px] text-amber-600 mt-0.5">Fuzzy loc / taxonomy fallback</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Invalid Records</p>
          <p className="text-2xl font-black text-rose-700 mt-1">
            {datasets.allRecords.filter((r) => r.validationStatus === 'INVALID').length}
          </p>
          <p className="text-[10px] text-rose-600 mt-0.5">Negative cost / underage</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs col-span-2 md:col-span-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Conflicts Detected</p>
          <p className="text-2xl font-black text-indigo-700 mt-1">{datasets.conflicts.length}</p>
          <p className="text-[10px] text-indigo-600 mt-0.5">Cross-dataset discrepancies</p>
        </div>
      </div>

      {/* Dataset Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            setActiveDatasetTab('ENTREPRENEUR');
            setSelectedRecord(null);
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeDatasetTab === 'ENTREPRENEUR'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Dataset B: Entrepreneur Profiles</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-200">
            {datasets.entrepreneur.records.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveDatasetTab('APPLICANT');
            setSelectedRecord(null);
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeDatasetTab === 'APPLICANT'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Dataset A: Applicants & Eligibility</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-200">
            {datasets.applicant.records.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveDatasetTab('LOAN');
            setSelectedRecord(null);
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeDatasetTab === 'LOAN'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <IndianRupee className="w-3.5 h-3.5" />
          <span>Dataset C: Loan Applications</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-200">
            {datasets.loan.records.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveDatasetTab('CONFLICTS');
            setSelectedRecord(null);
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeDatasetTab === 'CONFLICTS'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Conflict Inspector</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-900 text-indigo-100">
            {datasets.conflicts.length}
          </span>
        </button>
      </div>

      {/* VIEW: CONFLICTS INSPECTOR */}
      {activeDatasetTab === 'CONFLICTS' ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-black text-slate-950">Cross-Dataset Discrepancy Analysis</h3>
              <p className="text-xs text-slate-500">
                Automated detection of conflicting inputs between Applicant records (Dataset A) and Loan applications (Dataset C).
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {datasets.conflicts.map((conflict, idx) => (
              <div key={idx} className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Entity: {conflict.entityId}
                  </span>
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                    Field: {conflict.fieldName}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">{conflict.discrepancyDescription}</p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white/80 border border-amber-200/60 rounded-lg p-2.5">
                    <p className="text-[10px] font-bold text-slate-500">Dataset A Value</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">
                      {typeof conflict.datasetAValue === 'number'
                        ? `₹${conflict.datasetAValue.toLocaleString('en-IN')}`
                        : String(conflict.datasetAValue)}
                    </p>
                  </div>
                  <div className="bg-white/80 border border-amber-200/60 rounded-lg p-2.5">
                    <p className="text-[10px] font-bold text-slate-500">Dataset C Value</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">
                      {typeof conflict.datasetCValue === 'number'
                        ? `₹${conflict.datasetCValue.toLocaleString('en-IN')}`
                        : String(conflict.datasetCValue)}
                    </p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <p className="text-[11px] text-blue-900 font-semibold">
                    Resolution Policy: <span className="font-normal">{conflict.resolvedAuthoritativeField}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW: RECORDS TABLE */
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 border border-slate-200/80 rounded-2xl shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ID, masked name, location, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="VALID">Valid Only</option>
                <option value="WARNING">Warnings Only</option>
                <option value="INVALID">Invalid Only</option>
                <option value="DUPLICATE">Duplicates Only</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Record ID</th>
                    <th className="py-3 px-4">Applicant (Masked)</th>
                    <th className="py-3 px-4">Location (LGD)</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Financial Amount</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No dataset records found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => {
                      const amount =
                        record.availableOwnCapital ||
                        record.estimatedProjectCost ||
                        record.annualFamilyIncome ||
                        record.requestedLoanAmount;

                      return (
                        <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {record.sourceRecordId}
                            {record.isDuplicate && (
                              <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-900 rounded-md border border-amber-300">
                                DUP
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900">{record.maskedName}</span>
                            <span className="block text-[10px] text-slate-400">
                              {record.gender || 'N/A'}, Age {record.age || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span>
                                {record.district || 'N/A'}, {record.state || ''}
                              </span>
                              {record.locationMatchStatus === 'EXACT' ? (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300">
                                  LGD Verified
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded-md border border-amber-300">
                                  Unverified
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="capitalize font-semibold text-slate-800">
                              {record.businessCategory}
                            </span>
                            {record.rawBusinessCategory && record.rawBusinessCategory !== record.businessCategory && (
                              <span className="block text-[10px] text-slate-400">
                                Raw: {record.rawBusinessCategory}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {amount ? `₹${amount.toLocaleString('en-IN')}` : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="uppercase text-[11px] font-bold text-slate-700">
                              {record.preferredLanguage}
                            </span>
                            {!record.isLanguageSupported && (
                              <span className="block text-[9px] text-amber-600 font-bold">Fallback EN</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {record.validationStatus === 'VALID' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Valid
                              </span>
                            ) : record.validationStatus === 'WARNING' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                Warning ({record.validationIssues.length})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Invalid
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedRecord(record)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Inspector Drawer / Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                  <span>Record: {selectedRecord.sourceRecordId}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md">
                    {selectedRecord.datasetType}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Data Quality: <span className="font-bold text-amber-700">{selectedRecord.dataQuality}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Masked Name</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedRecord.maskedName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">LGD Location</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {selectedRecord.district}, {selectedRecord.state} ({selectedRecord.locationMatchStatus})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Business Category</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedRecord.businessCategory}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Preferred Language</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedRecord.preferredLanguage}</p>
                </div>
              </div>

              {/* Validation Issues List */}
              {selectedRecord.validationIssues.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                    Validation Diagnostics
                  </h4>
                  {selectedRecord.validationIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-[11px] ${
                        issue.severity === 'ERROR'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}
                    >
                      <span className="font-bold uppercase tracking-wider text-[10px] mr-2">[{issue.code}]</span>
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
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
