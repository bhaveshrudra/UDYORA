import React from 'react';
import { CompleteAnalysisReport } from '../types';

interface PrintableReportProps {
  report: CompleteAnalysisReport;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ report }) => {
  const { input, location, feasibilityVerdict, financialPlan, schemeGuidance, riskAnalysis, evidenceAuditLog } = report;
  const plan = financialPlan.data;
  const schemes = schemeGuidance.data;
  const topScheme = schemes[0];

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white text-slate-900 font-sans print:p-0">
      {/* Official Top Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">UDYORA</h1>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Hyper-Local Business Intelligence Dossier for Rural Entrepreneurs
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p><strong className="text-slate-800">Dossier ID:</strong> {report.reportId}</p>
            <p><strong className="text-slate-800">Date:</strong> {new Date(report.generatedAt).toLocaleDateString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Target Enterprise Summary */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
          1. Enterprise Profile & Location Context
        </h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p><span className="text-slate-500">Proposed Business:</span> <strong>{input.businessIdea}</strong></p>
            <p><span className="text-slate-500">Location:</span> <strong>{location.village}, Block {location.block}, {location.district} ({location.state})</strong></p>
          </div>
          <div>
            <p><span className="text-slate-500">Promoter Own Capital:</span> <strong>₹{plan.availableOwnCapital.toLocaleString('en-IN')}</strong></p>
            <p><span className="text-slate-500">Target Area Category:</span> <strong>{location.areaType} (PIN: {location.pincode})</strong></p>
          </div>
        </div>
      </div>

      {/* Feasibility Verdict */}
      <div className="border border-slate-300 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            2. Executive Feasibility Assessment
          </h2>
          <span className="text-xs font-black px-2.5 py-0.5 rounded border border-slate-900 bg-slate-900 text-white uppercase">
            Score: {feasibilityVerdict.score}/100 ({feasibilityVerdict.category})
          </span>
        </div>
        <p className="text-xs font-medium text-slate-800 leading-relaxed mb-3">
          {feasibilityVerdict.headline}
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          {feasibilityVerdict.explanation}
        </p>
      </div>

      {/* Financial Plan */}
      <div className="border border-slate-300 rounded-lg p-4 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-1">
          3. Deterministic Financial Model (10% Promoter Contribution Standard)
        </h2>
        <div className="grid grid-cols-4 gap-2 text-xs mb-4">
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Indicative Project Cost:</span>
            <strong className="text-sm">₹{plan.indicativeProjectCost.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Own Contribution:</span>
            <strong className="text-sm">₹{plan.availableOwnCapital.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Financing Requirement:</span>
            <strong className="text-sm">₹{plan.indicativeFinancingRequirement.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Monthly EMI ({plan.tenureMonths} Mo):</span>
            <strong className="text-sm">₹{plan.monthlyEMI.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <table className="min-w-full text-xs border border-slate-200">
          <thead className="bg-slate-100 font-bold">
            <tr>
              <th className="p-2 text-left border-b border-slate-200">Item</th>
              <th className="p-2 text-center border-b border-slate-200">Category</th>
              <th className="p-2 text-right border-b border-slate-200">Cost (INR)</th>
            </tr>
          </thead>
          <tbody>
            {plan.costBreakdown.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="p-2 font-medium">{item.name}</td>
                <td className="p-2 text-center">{item.category}</td>
                <td className="p-2 text-right font-bold">₹{item.estimatedCost.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scheme & Risk Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
        <div className="border border-slate-300 rounded-lg p-3">
          <h3 className="font-bold uppercase tracking-wider text-slate-800 mb-1">
            Top Matched Scheme
          </h3>
          <p className="font-bold">{topScheme?.scheme.name}</p>
          <p className="text-slate-600 mt-1">Nodal: {topScheme?.scheme.nodalAgency}</p>
          <p className="text-emerald-800 font-bold mt-1">Est. Margin Money Subsidy: ₹{topScheme?.potentialSubsidyAmount.toLocaleString('en-IN')}</p>
        </div>

        <div className="border border-slate-300 rounded-lg p-3">
          <h3 className="font-bold uppercase tracking-wider text-slate-800 mb-1">
            Risk & Mitigation Priority
          </h3>
          <p className="font-bold">Overall Risk Level: {riskAnalysis.data.overallRiskLevel}</p>
          <p className="text-slate-600 mt-1">Primary Mitigations: Livestock Insurance, Green Fodder Production, 3-Month Moratorium window.</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-slate-300 pt-3 text-[10px] text-slate-500 leading-tight">
        <p><strong>Official Advisory Disclaimer:</strong> {feasibilityVerdict.disclaimer}</p>
      </div>
    </div>
  );
};
