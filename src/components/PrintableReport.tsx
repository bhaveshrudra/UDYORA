import React from 'react';
import { CompleteAnalysisReport } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface PrintableReportProps {
  report: CompleteAnalysisReport;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ report }) => {
  const { t } = useLanguage();
  const {
    location,
    userInput,
    finalFeasibility,
    financialPlan,
    schemeMatches,
    riskProfile,
    evidenceRecords
  } = report;

  const topScheme = schemeMatches.length > 0 ? schemeMatches[0] : null;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white text-slate-900 font-sans text-xs print:p-0 print:m-0 print:w-full">
      {/* Official Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900">{t('print.headerTitle')}</span>
          </div>
          <p className="text-xs text-slate-600 font-bold mt-1 uppercase tracking-wider">
            {t('print.tagline')}
          </p>
        </div>

        <div className="text-right text-[11px] text-slate-500 space-y-0.5">
          <p className="font-bold text-slate-900">{t('print.reportId')}: {report.id}</p>
          <p>{t('print.date')}: {new Date(report.generatedAt).toLocaleDateString('en-IN')}</p>
          <p>{location.village}, {location.block}, {location.district}, {location.state}</p>
        </div>
      </div>

      {/* 1. Location & Context Summary */}
      <div className="mb-5">
        <h2 className="text-sm font-bold uppercase tracking-wider bg-slate-100 p-1.5 border border-slate-300 text-slate-900 mb-2">
          {t('print.sec1Title')}
        </h2>
        <div className="grid grid-cols-2 gap-3 border border-slate-200 p-3 rounded">
          <div>
            <p><strong className="text-slate-700">{t('print.proposedBiz')}</strong> {userInput.businessIdea}</p>
            <p><strong className="text-slate-700">{t('print.location')}</strong> {location.village} ({location.areaType}), Block {location.block}, District {location.district}, {location.state} - {location.pincode}</p>
          </div>
          <div>
            <p><strong className="text-slate-700">{t('print.ownCapital')}</strong> ₹{userInput.availableCapital.toLocaleString('en-IN')}</p>
            <p><strong className="text-slate-700">{t('print.areaCategory')}</strong> {userInput.beneficiaryCategory || 'General'} / {userInput.locationAreaType || 'Rural'}</p>
          </div>
        </div>
      </div>

      {/* 2. Executive Feasibility Score */}
      <div className="mb-5">
        <h2 className="text-sm font-bold uppercase tracking-wider bg-slate-100 p-1.5 border border-slate-300 text-slate-900 mb-2">
          {t('print.sec2Title')}
        </h2>
        <div className="border border-slate-200 p-3 rounded space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm text-slate-900">{finalFeasibility.headline}</span>
            <span className="text-sm font-black px-2 py-0.5 border border-slate-900 rounded">
              {finalFeasibility.score} / 100 ({finalFeasibility.category})
            </span>
          </div>
          <p className="text-slate-700 leading-relaxed">{finalFeasibility.explanation}</p>
          {finalFeasibility.criticalCaveat && (
            <p className="font-bold text-amber-900 bg-amber-50 p-2 border border-amber-200 rounded">
              {finalFeasibility.criticalCaveat}
            </p>
          )}
        </div>
      </div>

      {/* 3. Deterministic Financial Model */}
      <div className="mb-5">
        <h2 className="text-sm font-bold uppercase tracking-wider bg-slate-100 p-1.5 border border-slate-300 text-slate-900 mb-2">
          {t('print.sec3Title')}
        </h2>
        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-2 font-bold bg-slate-50">{t('fin.ownCapital')}</td>
                <td className="p-2">₹{financialPlan.availableOwnCapital.toLocaleString('en-IN')} ({financialPlan.marginPercentage}%)</td>
                <td className="p-2 font-bold bg-slate-50">{t('fin.projectCost')}</td>
                <td className="p-2 font-bold">₹{financialPlan.indicativeProjectCost.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold bg-slate-50">{t('fin.financing')}</td>
                <td className="p-2 font-bold">₹{financialPlan.indicativeFinancingRequirement.toLocaleString('en-IN')}</td>
                <td className="p-2 font-bold bg-slate-50">{t('fin.monthlyEMI')}</td>
                <td className="p-2 font-bold">₹{financialPlan.monthlyEMI.toLocaleString('en-IN')} / mo ({financialPlan.tenureMonths} mo @ {financialPlan.annualInterestRate}%)</td>
              </tr>
              <tr>
                <td className="p-2 font-bold bg-slate-50">{t('fin.estRevenue')}</td>
                <td className="p-2">₹{financialPlan.estimatedMonthlyRevenue.toLocaleString('en-IN')}</td>
                <td className="p-2 font-bold bg-slate-50">{t('fin.dscr')}</td>
                <td className="p-2">{financialPlan.debtServiceCoverageRatio}x</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Top Matched Scheme & Risk Summary */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 uppercase">
            {t('print.topScheme')}
          </h3>
          {topScheme ? (
            <div className="border border-slate-200 p-2.5 rounded space-y-1">
              <p className="font-bold">{topScheme.scheme.name}</p>
              <p className="text-[11px] text-slate-600">Nodal: {topScheme.scheme.nodalAgency} | {topScheme.scheme.interestRateRange}</p>
              <p className="text-[11px] text-emerald-800 font-bold">
                {topScheme.potentialSubsidyAmount > 0
                  ? `Est. Subsidy: ₹${topScheme.potentialSubsidyAmount.toLocaleString('en-IN')} (${topScheme.potentialSubsidyPct}%)`
                  : 'Collateral-free Credit Guarantee'}
              </p>
            </div>
          ) : (
            <p className="text-slate-500 italic">No scheme match available.</p>
          )}
        </div>

        <div>
          <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 uppercase">
            {t('print.riskPriority')}
          </h3>
          <div className="border border-slate-200 p-2.5 rounded space-y-1">
            <p className="font-bold uppercase text-slate-800">Overall: {riskProfile.overallRiskLevel}</p>
            <p className="text-[11px] text-slate-600">
              {riskProfile.riskFactors.length} multidimensional vectors analyzed across livestock biosecurity, feedstock volatility, and water resilience.
            </p>
          </div>
        </div>
      </div>

      {/* Official Disclaimer */}
      <div className="border-t border-slate-300 pt-3 text-[10px] text-slate-500 space-y-1">
        <p className="font-bold text-slate-700 uppercase">{t('print.disclaimerTitle')}</p>
        <p className="leading-normal">{finalFeasibility.disclaimer}</p>
        <div className="flex justify-between pt-2">
          <span>{t('brand.tagline')}</span>
          <span>{t('brand.developedBy')}</span>
        </div>
      </div>
    </div>
  );
};
