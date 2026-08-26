import React, { useState } from 'react';
import {
  Calculator,
  IndianRupee,
  Calendar,
  Percent,
  CheckCircle2,
  Sliders,
  ChevronDown,
  Info,
  ShieldCheck
} from 'lucide-react';
import { FinancialPlan } from '../types';
import { calculateEMI, calculateTotalInterest, generateRepaymentSchedule } from '../services/financialCalculator';
import { useLanguage } from '../i18n/LanguageContext';

interface FinancialPlanCardProps {
  initialPlan: FinancialPlan;
}

export const FinancialPlanCard: React.FC<FinancialPlanCardProps> = ({ initialPlan }) => {
  const { t } = useLanguage();

  const [tenureMonths, setTenureMonths] = useState<number>(initialPlan.tenureMonths || 60);
  const [interestRate, setInterestRate] = useState<number>(initialPlan.annualInterestRate || 9.50);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(initialPlan.moratoriumMonths || 3);
  const [showFullBreakdown, setShowFullBreakdown] = useState<boolean>(false);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // Dynamic live deterministic calculation on slider changes
  const loanAmount = initialPlan.indicativeFinancingRequirement;
  const amortizationMonths = Math.max(1, tenureMonths - moratoriumMonths);
  const dynamicEMI = calculateEMI(loanAmount, interestRate, amortizationMonths);
  const dynamicTotalInterest = calculateTotalInterest(dynamicEMI, amortizationMonths, loanAmount);
  const dynamicTotalRepayment = loanAmount + dynamicTotalInterest;
  const dynamicSchedule = generateRepaymentSchedule(loanAmount, interestRate, tenureMonths, moratoriumMonths);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              {t('fin.title')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('fin.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t('fin.zeroHallucination')}</span>
        </div>
      </div>

      {/* Core 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t('fin.ownCapital')}
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            ₹{initialPlan.availableOwnCapital.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
            {initialPlan.marginPercentage}% {t('fin.promoterMargin')}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t('fin.projectCost')}
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            ₹{initialPlan.indicativeProjectCost.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-blue-700 font-medium mt-0.5 block">
            {t('fin.capexWorkingCap')}
          </span>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
            {t('fin.financing')}
          </span>
          <p className="text-xl sm:text-2xl font-black text-blue-950 mt-1">
            ₹{initialPlan.indicativeFinancingRequirement.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-blue-700 font-medium mt-0.5 block">
            {t('fin.loanNeed')}
          </span>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            {t('fin.monthlyEMI')}
          </span>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">
            ₹{dynamicEMI.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-300 font-medium mt-0.5 block">
            {t('fin.emiTenureRate', { months: tenureMonths, rate: interestRate })}
          </span>
        </div>
      </div>

      {/* Additional Unit Economics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
        <div>
          <span className="text-slate-500 font-medium">{t('fin.estRevenue')}</span>
          <p className="font-bold text-slate-900 mt-0.5">₹{initialPlan.estimatedMonthlyRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <span className="text-slate-500 font-medium">{t('fin.estOpEx')}</span>
          <p className="font-bold text-slate-900 mt-0.5">₹{initialPlan.estimatedMonthlyOperatingExpenses.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <span className="text-slate-500 font-medium">{t('fin.estNetProfit')}</span>
          <p className="font-bold text-emerald-700 mt-0.5">₹{(initialPlan.estimatedMonthlyRevenue - initialPlan.estimatedMonthlyOperatingExpenses - dynamicEMI).toLocaleString('en-IN')}</p>
        </div>
        <div>
          <span className="text-slate-500 font-medium">{t('fin.dscr')}</span>
          <p className="font-bold text-blue-900 mt-0.5">{initialPlan.debtServiceCoverageRatio}x</p>
        </div>
      </div>

      {/* Interactive Sliders: Live Repayment Sensitivity */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('fin.calculatorTitle')}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">{t('fin.calculatorSubtitle')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Tenure Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>{t('fin.tenure')}</span>
              <span className="text-blue-900">{tenureMonths} Mo ({(tenureMonths / 12).toFixed(1)} Yrs)</span>
            </div>
            <input
              type="range"
              min="12"
              max="84"
              step="6"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 Yr</span>
              <span>3 Yrs</span>
              <span>5 Yrs</span>
              <span>7 Yrs</span>
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>{t('fin.interestRate')}</span>
              <span className="text-blue-900">{interestRate.toFixed(2)}% p.a.</span>
            </div>
            <input
              type="range"
              min="4.00"
              max="14.00"
              step="0.25"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>4.0%</span>
              <span>9.5%</span>
              <span>14.0%</span>
            </div>
          </div>

          {/* Moratorium Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>{t('fin.moratorium')}</span>
              <span className="text-blue-900">{moratoriumMonths} Mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="1"
              value={moratoriumMonths}
              onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 Mo</span>
              <span>3 Mo</span>
              <span>6 Mo</span>
              <span>12 Mo</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <span>
            {t('fin.totalInterest')} <strong className="text-slate-900">₹{dynamicTotalInterest.toLocaleString('en-IN')}</strong>
          </span>
          <span>
            {t('fin.totalRepayment')} <strong className="text-slate-900">₹{dynamicTotalRepayment.toLocaleString('en-IN')}</strong>
          </span>
        </div>
      </div>

      {/* CapEx vs Working Capital Itemized Cost Table Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowFullBreakdown(!showFullBreakdown)}
          className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border border-slate-200 cursor-pointer transition-colors"
        >
          <span>{t('fin.capexToggle')}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFullBreakdown ? 'rotate-180' : ''}`} />
        </button>

        {showFullBreakdown && (
          <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 text-left">{t('fin.table.item')}</th>
                  <th className="px-3 py-2.5 text-left">{t('fin.table.category')}</th>
                  <th className="px-3 py-2.5 text-center">{t('fin.table.status')}</th>
                  <th className="px-4 py-2.5 text-right">{t('fin.table.cost')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {initialPlan.costBreakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500">{item.description}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.category === 'CAPEX' ? 'bg-indigo-50 text-indigo-800' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {item.category === 'CAPEX' ? t('fin.table.capex') : t('fin.table.workingCapital')}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.isEssential ? t('fin.table.essential') : t('fin.table.optional')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                      ₹{item.estimatedCost.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold text-slate-900">
                  <td colSpan={3} className="px-4 py-2.5 text-right uppercase">
                    {t('fin.table.totalCost')}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm">
                    ₹{initialPlan.indicativeProjectCost.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Month-by-Month Repayment Schedule Preview Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowSchedule(!showSchedule)}
          className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border border-slate-200 cursor-pointer transition-colors"
        >
          <span>{t('fin.scheduleToggle')}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showSchedule ? 'rotate-180' : ''}`} />
        </button>

        {showSchedule && (
          <div className="mt-3 border border-slate-200 rounded-xl overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2 text-center">{t('fin.schedule.month')}</th>
                  <th className="px-3 py-2 text-right">{t('fin.schedule.opening')}</th>
                  <th className="px-3 py-2 text-right">{t('fin.schedule.principal')}</th>
                  <th className="px-3 py-2 text-right">{t('fin.schedule.interest')}</th>
                  <th className="px-3 py-2 text-right">{t('fin.schedule.emi')}</th>
                  <th className="px-3 py-2 text-right">{t('fin.schedule.closing')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {dynamicSchedule.slice(0, 12).map((row) => (
                  <tr key={row.month} className={row.isMoratorium ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'}>
                    <td className="px-3 py-2 text-center font-bold text-slate-700">
                      M{row.month} {row.isMoratorium && <span className="text-[10px] text-amber-800 font-semibold">{t('fin.schedule.grace')}</span>}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">₹{row.openingPrincipal.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 text-right font-medium text-emerald-800">₹{row.principalPaid.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 text-right text-slate-600">₹{row.interestPaid.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 text-right font-bold text-slate-900">₹{row.emi.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 text-right font-medium text-slate-800">₹{row.closingPrincipal.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
