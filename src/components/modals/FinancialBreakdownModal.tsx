import React from 'react';
import { Calculator, CheckCircle2, TrendingUp } from 'lucide-react';
import { DetailModal } from './DetailModal';

export interface FinancialBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  financialPlan: any;
}

export const FinancialBreakdownModal: React.FC<FinancialBreakdownModalProps> = ({
  isOpen,
  onClose,
  financialPlan = {}
}) => {
  const fp: Record<string, any> = financialPlan || {};
  const ownCapital = Number(fp.availableOwnCapital || 100000);
  const totalCost = Number(fp.indicativeProjectCost || 1000000);
  const bankLoan = Number(fp.indicativeFinancingRequirement || 900000);
  const emi = Number(fp.monthlyEMI || 19680);
  const tenureYears = fp.tenureYears || 5;
  const interestRate = fp.interestRate || '9.5% p.a.';
  const capexItems = fp.capexItems || [
    { component: 'High-Yield Livestock / Machinery & Equipment', category: 'Fixed Capital', amount: Math.round(totalCost * 0.65) },
    { component: 'Shed / Shop Infrastructure & Chilling Unit', category: 'Infrastructure', amount: Math.round(totalCost * 0.20) },
    { component: 'Initial Raw Material & Working Capital Buffer', category: 'Working Capital', amount: Math.round(totalCost * 0.15) }
  ];

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="FINANCIAL BREAKDOWN"
      subtitle="Itemized Capital Expenditure (CapEx), loan structuring & debt service model"
      icon={<Calculator className="w-5 h-5 text-blue-700" />}
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Core Financial Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Own Capital</span>
            <span className="text-base font-black text-slate-950 font-mono">₹{ownCapital.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Project Cost</span>
            <span className="text-base font-black text-slate-950 font-mono">₹{totalCost.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 space-y-1">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">Bank Loan</span>
            <span className="text-base font-black text-blue-950 font-mono">₹{bankLoan.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 space-y-1">
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">Monthly EMI</span>
            <span className="text-base font-black text-emerald-950 font-mono">₹{emi.toLocaleString('en-IN')} / mo</span>
          </div>
        </div>

        {/* Itemized CapEx Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Itemized CapEx Breakdown</h3>
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="p-3">Asset Component</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Estimated Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-800">
                {capexItems.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-950">{item.component}</td>
                    <td className="p-3 text-slate-600">
                      <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      ₹{Number(item.amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Debt Service & Repayment Assumptions */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
          <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-700" />
            Debt Service & Repayment Assumptions
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold text-slate-800 pt-1">
            <div>
              <span className="text-[10px] text-slate-500 block">Interest Rate:</span>
              <span className="font-mono font-bold text-slate-900">{interestRate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Repayment Tenure:</span>
              <span className="font-mono font-bold text-slate-900">{tenureYears} Years ({tenureYears * 12} Months)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Moratorium Period:</span>
              <span className="font-mono font-bold text-slate-900">6 Months (Interest Only)</span>
            </div>
          </div>
        </div>
      </div>
    </DetailModal>
  );
};
