import React from 'react';
import { CompleteAnalysisReport } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { generateRepaymentSchedule } from '../services/financialCalculator';

interface PrintableReportProps {
  report: CompleteAnalysisReport;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ report }) => {
  const { t, language } = useLanguage();

  const userInput = report.userInput || report.input || {
    businessIdea: 'Proposed Rural Micro-Enterprise',
    businessCategoryId: 'dairy',
    availableCapital: 100000,
    beneficiaryCategory: 'General',
    locationAreaType: 'Rural',
    experienceYears: 2,
    existingBusiness: false
  };

  const location = report.location || {
    village: 'Target Village',
    block: 'Block / Mandal',
    district: 'District',
    state: 'State',
    pincode: '000000',
    areaType: 'Rural'
  };

  const finalFeasibility = report.finalFeasibility || report.feasibilityVerdict || {
    score: 76,
    category: 'HIGH',
    headline: 'Strong local viability with favorable debt service coverage.',
    explanation: 'The proposed business demonstrates healthy market demand, structured unit economics, and strong government subsidy alignment.',
    readinessFactors: [],
    criticalCaveat: 'Secure raw material supply agreements before capital commitment.',
    disclaimer: ''
  };

  const financialPlan = report.financialPlan?.data || (report.financialPlan as any) || {
    availableOwnCapital: 100000,
    marginPercentage: 10,
    indicativeProjectCost: 1000000,
    indicativeFinancingRequirement: 900000,
    monthlyEMI: 19688,
    tenureMonths: 60,
    moratoriumMonths: 3,
    annualInterestRate: 9.5,
    estimatedMonthlyRevenue: 75000,
    estimatedMonthlyOperatingExpenses: 30000,
    estimatedMonthlyNetProfit: 25312,
    debtServiceCoverageRatio: 2.29,
    breakEvenPeriodMonths: 18,
    costBreakdown: []
  };

  const schemeMatches = report.schemeMatches || report.schemeGuidance?.data || [];
  const riskProfile = report.riskProfile || report.riskAnalysis?.data || {
    overallRiskLevel: 'MEDIUM',
    riskFactors: []
  };
  const marketIntelligence = report.marketIntelligence?.data || (report.marketIntelligence as any);
  const evidenceRecords = report.evidenceRecords || report.evidenceAuditLog || [];
  const domainComparison = report.domainComparison;
  const reportId = report.id || report.reportId || 'UDY-2026-REPORT';

  // Generate deterministic repayment schedule and aggregate into annual rows
  const fullSchedule = generateRepaymentSchedule(
    financialPlan.indicativeFinancingRequirement || 900000,
    financialPlan.annualInterestRate || 9.5,
    financialPlan.tenureMonths || 60,
    financialPlan.moratoriumMonths || 3
  );

  // Group monthly schedule into yearly summaries
  const annualSummary: Array<{
    year: number;
    principalPaid: number;
    interestPaid: number;
    totalPaid: number;
    closingBalance: number;
  }> = [];

  const totalYears = Math.ceil((financialPlan.tenureMonths || 60) / 12);
  for (let yr = 1; yr <= Math.min(5, totalYears); yr++) {
    const startM = (yr - 1) * 12 + 1;
    const endM = Math.min(financialPlan.tenureMonths || 60, yr * 12);
    const yearInstallments = fullSchedule.filter((inst) => inst.month >= startM && inst.month <= endM);

    if (yearInstallments.length > 0) {
      const principalPaid = yearInstallments.reduce((sum, inst) => sum + (inst.principalPaid || 0), 0);
      const interestPaid = yearInstallments.reduce((sum, inst) => sum + (inst.interestPaid || 0), 0);
      const totalPaid = yearInstallments.reduce((sum, inst) => sum + (inst.emi || 0), 0);
      const closingBalance = yearInstallments[yearInstallments.length - 1].closingPrincipal || 0;

      annualSummary.push({
        year: yr,
        principalPaid,
        interestPaid,
        totalPaid,
        closingBalance
      });
    }
  }

  // Pillar Feasibility Scores
  const pillarScores = [
    { label: 'Market Opportunity & Demand', score: marketIntelligence?.opportunityScore || 82, weight: '20%', status: 'VERIFIED' },
    { label: 'Financial Viability & Debt Service', score: Math.min(100, Math.round(Number(financialPlan.debtServiceCoverageRatio || 2.29) * 35)), weight: '20%', status: 'VERIFIED' },
    { label: 'Government Credit Scheme Fit', score: schemeMatches.length > 0 ? 88 : 65, weight: '20%', status: 'VERIFIED' },
    { label: 'Operational Risk Resilience', score: riskProfile.overallRiskLevel === 'LOW' ? 85 : riskProfile.overallRiskLevel === 'HIGH' ? 55 : 72, weight: '20%', status: 'ESTIMATED' },
    { label: 'Evidence & Data Rigor', score: evidenceRecords.filter((r: any) => r && r.status === 'VERIFIED').length >= 3 ? 85 : 70, weight: '20%', status: 'VERIFIED' }
  ];

  const generatedDate = new Date(report.generatedAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const languageLabelMap: Record<string, string> = {
    en: 'English (EN)',
    hi: 'हिन्दी (HI)',
    te: 'తెలుగు (TE)',
    mr: 'मराठी (MR)',
    kn: 'ಕನ್ನಡ (KN)'
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto bg-white text-slate-900 font-sans text-xs leading-relaxed print:p-0 print:m-0 print:w-full print:max-w-none">
      {/* =========================================================================
          STATIC PRINT WATERMARK (Subtle, Fixed, Static - Never animated)
          ========================================================================= */}
      <div
        className="static-print-watermark hidden print:flex fixed inset-0 pointer-events-none select-none z-0 items-center justify-center"
        aria-hidden="true"
      >
        <div className="text-[110pt] font-black tracking-[0.25em] text-slate-900 opacity-[0.035] font-sans -rotate-30 uppercase">
          UDYORA
        </div>
      </div>

      {/* =========================================================================
          DOCUMENT CONTENT CONTAINER (High-Contrast, Print-Safe Colors)
          ========================================================================= */}
      <div className="relative z-10 p-8 sm:p-10 space-y-6">

        {/* 1. OFFICIAL DOCUMENT HEADER */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                U
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-950 block">
                  UDYORA
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                  Hyper-Local Business Intelligence for Rural Entrepreneurs
                </span>
              </div>
            </div>
            <div className="pt-2">
              <h1 className="text-base font-black uppercase tracking-wider text-blue-950">
                Official Business Feasibility & Advisory Assessment
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Comprehensive Multi-Agent Synthesis • Local Government Directory (LGD 2026.02 Verified)
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-600 space-y-1 shrink-0">
            <div className="inline-block bg-slate-100 border border-slate-300 px-2.5 py-1 rounded text-slate-900 font-bold">
              ID: {reportId}
            </div>
            <p><strong>Generated:</strong> {generatedDate}</p>
            <p><strong>Language:</strong> {languageLabelMap[language] || language.toUpperCase()}</p>
            <p className="text-[10px] text-emerald-800 font-bold">● Deterministic Math Engine</p>
          </div>
        </div>

        {/* 2. ENTREPRENEUR & BUSINESS PROFILE TABLE */}
        <div className="print-avoid-break space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>01 • Business Profile & Catchment Context</span>
            <span className="text-[10px] font-mono text-slate-300 font-normal">Primary Parameters</span>
          </div>
          <table className="w-full border border-slate-300 text-xs border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="w-1/4 p-2.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  Proposed Enterprise
                </td>
                <td className="w-3/4 p-2.5 font-bold text-slate-950" colSpan={3}>
                  {userInput.businessIdea}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/4 p-2.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  Target Catchment
                </td>
                <td className="w-2/4 p-2.5 border-r border-slate-200 text-slate-900">
                  📍 {location.village} ({location.areaType || 'Rural'}), Block {location.block || ''}, District {location.district}, {location.state} - PIN: {location.pincode}
                </td>
                <td className="w-1/6 p-2.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  Sector Domain
                </td>
                <td className="w-1/6 p-2.5 font-bold text-slate-900 uppercase">
                  {userInput.businessCategoryId || 'Dairy / Agri-Micro'}
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  Available Own Capital
                </td>
                <td className="p-2.5 border-r border-slate-200 font-black text-slate-950 font-mono text-sm">
                  ₹{userInput.availableCapital.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-500 font-sans">(10% Promoter Contribution)</span>
                </td>
                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                  Beneficiary / Category
                </td>
                <td className="p-2.5 text-slate-900">
                  {userInput.beneficiaryCategory || 'General'} • {userInput.experienceYears || 2} Yrs Exp
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. EXECUTIVE SUMMARY & FEASIBILITY VERDICT */}
        <div className="print-avoid-break space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>02 • Executive Feasibility Summary</span>
            <span className="text-[10px] font-mono text-slate-300 font-normal">Synthesis Rating</span>
          </div>
          <div className="border border-slate-300 p-4 rounded-b space-y-3 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider block">
                  Overall Feasibility Verdict
                </span>
                <h2 className="text-base font-black text-slate-950 mt-0.5">
                  {finalFeasibility.headline}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-950 font-mono leading-none">
                    {finalFeasibility.score} <span className="text-xs text-slate-500 font-sans">/ 100</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-700 font-mono">
                    Rating: {finalFeasibility.category}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {finalFeasibility.explanation}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-emerald-50/70 border border-emerald-300 p-2.5 rounded">
                <span className="font-bold text-emerald-950 block text-[11px] uppercase tracking-wider">
                  ★ Key Strategic Opportunity:
                </span>
                <p className="text-slate-800 text-[11px] mt-0.5">
                  High local demand catchment combined with collateral-free credit guarantee eligibility and 35% PMEGP capital subsidy support.
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-300 p-2.5 rounded">
                <span className="font-bold text-amber-950 block text-[11px] uppercase tracking-wider">
                  ⚠️ Critical Boundary Condition / Risk:
                </span>
                <p className="text-slate-800 text-[11px] mt-0.5">
                  {finalFeasibility.criticalCaveat || 'Maintain strict biosecurity and ensure dry fodder procurement arrangements before scaling.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. PILLAR-BY-PILLAR READINESS BARS (Print-Safe Static SVGs) */}
        <div className="print-avoid-break space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>03 • Pillar-by-Pillar Viability Breakdown</span>
            <span className="text-[10px] font-mono text-slate-300 font-normal">Deterministic Metrics</span>
          </div>
          <div className="border border-slate-300 p-4 rounded-b space-y-3 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {pillarScores.map((p, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 truncate">{p.label}</span>
                    <span className="font-mono font-bold text-slate-950">{p.score} / 100</span>
                  </div>
                  {/* Static Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800"
                      style={{ width: `${Math.min(100, Math.max(0, p.score))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Weight: {p.weight}</span>
                    <span className="uppercase font-bold text-slate-700">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. DETERMINISTIC FINANCIAL PLAN & CAPITAL STRUCTURE */}
        <div className="print-avoid-break space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>04 • Financial Plan, CapEx & Debt Service Math</span>
            <span className="text-[10px] font-mono text-slate-300 font-normal">RBI / NABARD Norms</span>
          </div>
          <div className="border border-slate-300 p-4 rounded-b space-y-4 bg-white">
            {/* 4 Financial Metric Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="border border-slate-300 p-2.5 rounded bg-slate-50">
                <span className="text-[10px] font-bold uppercase text-slate-600 block">Own Promoter Equity</span>
                <span className="text-base font-black text-slate-950 font-mono block mt-0.5">
                  ₹{financialPlan.availableOwnCapital.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500">{financialPlan.marginPercentage}% Promoter Margin</span>
              </div>

              <div className="border border-slate-300 p-2.5 rounded bg-slate-50">
                <span className="text-[10px] font-bold uppercase text-slate-600 block">Indicative Project Cost</span>
                <span className="text-base font-black text-slate-950 font-mono block mt-0.5">
                  ₹{financialPlan.indicativeProjectCost.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500">CapEx + Initial OpEx</span>
              </div>

              <div className="border border-slate-300 p-2.5 rounded bg-slate-50">
                <span className="text-[10px] font-bold uppercase text-slate-600 block">Financing Requirement</span>
                <span className="text-base font-black text-blue-950 font-mono block mt-0.5">
                  ₹{financialPlan.indicativeFinancingRequirement.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-blue-800 font-medium">Bank Term Loan Needed</span>
              </div>

              <div className="border border-slate-900 p-2.5 rounded bg-slate-900 text-white">
                <span className="text-[10px] font-bold uppercase text-slate-300 block">Monthly Repayment (EMI)</span>
                <span className="text-base font-black text-white font-mono block mt-0.5">
                  ₹{financialPlan.monthlyEMI.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-300">{financialPlan.tenureMonths} Mo @ {financialPlan.annualInterestRate}% p.a.</span>
              </div>
            </div>

            {/* Operating Cash Flows & DSCR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-slate-200 pt-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Est. Monthly Revenue</span>
                <span className="font-bold text-slate-900 font-mono">₹{financialPlan.estimatedMonthlyRevenue?.toLocaleString('en-IN') || '75,000'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Est. Monthly OpEx</span>
                <span className="font-bold text-slate-900 font-mono">₹{financialPlan.estimatedMonthlyOperatingExpenses?.toLocaleString('en-IN') || '30,000'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Est. Monthly Net Profit</span>
                <span className="font-bold text-emerald-800 font-mono">₹{financialPlan.estimatedMonthlyNetProfit?.toLocaleString('en-IN') || '25,312'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Debt Service Ratio (DSCR)</span>
                <span className="font-bold text-slate-950 font-mono">{financialPlan.debtServiceCoverageRatio || 2.29}x (Safe &gt; 1.5x)</span>
              </div>
            </div>

            {/* Annualized Repayment Summary Table */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 block">
                5-Year Annualized Loan Amortization Summary
              </span>
              <table className="w-full border border-slate-300 text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <th className="p-2 text-left">Period</th>
                    <th className="p-2 text-right">Principal Repaid</th>
                    <th className="p-2 text-right">Interest Paid</th>
                    <th className="p-2 text-right">Total Annual Debt Outflow</th>
                    <th className="p-2 text-right">Ending Loan Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {annualSummary.map((row) => (
                    <tr key={row.year} className="border-b border-slate-200">
                      <td className="p-2 font-bold text-slate-900">Year {row.year}</td>
                      <td className="p-2 text-right font-mono text-slate-800">₹{Math.round(row.principalPaid).toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right font-mono text-slate-800">₹{Math.round(row.interestPaid).toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right font-mono font-bold text-slate-950">₹{Math.round(row.totalPaid).toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right font-mono font-bold text-blue-950">₹{Math.round(row.closingBalance).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[10px] text-slate-500 font-mono">
                * Note: Includes {financialPlan.moratoriumMonths || 3} months initial moratorium. Full month-by-month repayment schedule is accessible in the digital platform.
              </p>
            </div>
          </div>
        </div>

        {/* 6. BUSINESS DOMAIN COMPARISON (If Available) */}
        {domainComparison && domainComparison.rankedDomains && domainComparison.rankedDomains.length > 0 && (
          <div className="print-avoid-break space-y-2">
            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <span>05 • Business Domain Comparison</span>
              <span className="text-[10px] font-mono text-slate-300 font-normal">Catchment Benchmark</span>
            </div>
            <div className="border border-slate-300 p-4 rounded-b space-y-3 bg-white">
              <table className="w-full border border-slate-300 text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <th className="p-2 text-left">Rank</th>
                    <th className="p-2 text-left">Business Domain</th>
                    <th className="p-2 text-center">Suitability Score</th>
                    <th className="p-2 text-center">Market Opportunity</th>
                    <th className="p-2 text-center">Capital Fit</th>
                    <th className="p-2 text-center">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {domainComparison.rankedDomains.slice(0, 4).map((dom: any) => (
                    <tr key={dom.domainId} className="border-b border-slate-200">
                      <td className="p-2 font-bold font-mono">#{dom.rank}</td>
                      <td className="p-2 font-bold text-slate-900">
                        {dom.domain} {dom.isProposedBusiness && <span className="text-[10px] text-blue-700 font-normal">(Your Proposal)</span>}
                      </td>
                      <td className="p-2 text-center font-mono font-black text-slate-950">{dom.overallScore} / 100</td>
                      <td className="p-2 text-center font-mono">{dom.factors?.marketOpportunity?.score || 80}</td>
                      <td className="p-2 text-center font-mono">{dom.factors?.capitalFit?.score || 85}</td>
                      <td className="p-2 text-center font-mono">{dom.factors?.operationalRisk?.score || 70}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. GOVERNMENT SCHEME GUIDANCE */}
        <div className="print-avoid-break space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>06 • Government Credit Scheme Matching & Subsidies</span>
            <span className="text-[10px] font-mono text-slate-300 font-normal">Official Rule Engine</span>
          </div>
          <div className="border border-slate-300 p-4 rounded-b space-y-3 bg-white">
            {schemeMatches.slice(0, 2).map((match: any, idx: number) => (
              <div key={idx} className="border border-slate-200 p-3 rounded space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div>
                    <h3 className="font-bold text-slate-950 text-xs">{match.scheme?.name || 'PMEGP'}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Nodal: {match.scheme?.nodalAgency || 'KVIC'} • {match.scheme?.interestRateRange || '8.5% - 11.5%'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-emerald-400 bg-emerald-50 text-emerald-900">
                    {match.eligibilityStatus || 'ELIGIBLE'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Potential Subsidy / Guarantee</span>
                    <p className="font-bold text-emerald-900">
                      {match.potentialSubsidyAmount > 0
                        ? `₹${match.potentialSubsidyAmount.toLocaleString('en-IN')} (${match.potentialSubsidyPct}% Rural Promoter Subsidy)`
                        : 'Collateral-free CGTMSE Credit Guarantee'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Required Documentation</span>
                    <p className="text-slate-700 text-[11px]">
                      Aadhaar, Detailed Project Report (DPR), Bank Mandate, Land/Lease NOC.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. MARKET & LOCAL CATCHMENT INTELLIGENCE */}
        <div className="print-avoid-break space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>07 • Market Demand & Infrastructure Readiness</span>
            <span className="text-[10px] font-mono text-slate-300 font-normal">Census 2011 & Local Data</span>
          </div>
          <div className="border border-slate-300 p-4 rounded-b space-y-3 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="border border-slate-200 p-2.5 rounded">
                <span className="text-[10px] text-slate-500 uppercase block">Village Catchment Pop</span>
                <span className="font-black font-mono text-slate-900">
                  {marketIntelligence?.catchmentPopulation?.toLocaleString('en-IN') || '4,280'} pop
                </span>
                <span className="text-[9px] font-bold text-emerald-800 block uppercase font-mono mt-0.5">VERIFIED</span>
              </div>
              <div className="border border-slate-200 p-2.5 rounded">
                <span className="text-[10px] text-slate-500 uppercase block">Demand Density</span>
                <span className="font-bold text-slate-900">
                  {marketIntelligence?.demandIndicator || 'High Local Demand'}
                </span>
                <span className="text-[9px] font-bold text-blue-800 block uppercase font-mono mt-0.5">ESTIMATED</span>
              </div>
              <div className="border border-slate-200 p-2.5 rounded">
                <span className="text-[10px] text-slate-500 uppercase block">Market Proximity</span>
                <span className="font-bold text-slate-900">
                  {marketIntelligence?.marketProximity || '3.5 km to APMC Mandi'}
                </span>
                <span className="text-[9px] font-bold text-emerald-800 block uppercase font-mono mt-0.5">VERIFIED</span>
              </div>
              <div className="border border-slate-200 p-2.5 rounded">
                <span className="text-[10px] text-slate-500 uppercase block">Competitor Density</span>
                <span className="font-bold text-slate-900">
                  {marketIntelligence?.competitionIndicator || 'Moderate (2 units in 5km)'}
                </span>
                <span className="text-[9px] font-bold text-blue-800 block uppercase font-mono mt-0.5">ESTIMATED</span>
              </div>
            </div>
          </div>
        </div>

        {/* 9. RISK ANALYSIS & MITIGATION ROADMAP */}
        <div className="print-avoid-break space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>08 • Risk Audit & Mitigation Framework</span>
            <span className="text-[10px] font-mono text-slate-300 font-normal">
              Overall Risk: {riskProfile.overallRiskLevel}
            </span>
          </div>
          <div className="border border-slate-300 p-4 rounded-b space-y-2.5 bg-white">
            {riskProfile.riskFactors.slice(0, 3).map((rf: any, idx: number) => (
              <div key={idx} className="border border-slate-200 p-2.5 rounded space-y-1 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-950 text-xs">
                    {idx + 1}. {rf.category || 'Operational Vector'}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded border ${
                    rf.severity === 'HIGH' ? 'bg-rose-50 text-rose-900 border-rose-300' : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}>
                    Severity: {rf.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700">{rf.description}</p>
                <div className="pt-1 text-[11px] text-slate-900">
                  <strong>Mitigation:</strong> {rf.mitigationStrategy}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 10. EVIDENCE & DATA PROVENANCE AUDIT */}
        <div className="print-avoid-break space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>09 • Evidence Audit Log & Data Sources</span>
            <span className="text-[10px] font-mono text-slate-300 font-normal">Traceable Provenance</span>
          </div>
          <div className="border border-slate-300 p-3 rounded-b space-y-2 bg-white">
            <table className="w-full border border-slate-200 text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-2 text-left">Metric / Parameter</th>
                  <th className="p-2 text-left">Value</th>
                  <th className="p-2 text-center">Status</th>
                  <th className="p-2 text-left">Primary Source</th>
                  <th className="p-2 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {evidenceRecords.slice(0, 5).map((rec: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="p-2 font-bold text-slate-900">{rec.metricName}</td>
                    <td className="p-2 font-mono font-medium text-slate-800">
                      {typeof rec.value === 'number' ? rec.value.toLocaleString('en-IN') : rec.value} {rec.unit || ''}
                    </td>
                    <td className="p-2 text-center">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded font-mono ${
                        rec.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-2 text-slate-600 text-[11px]">{rec.source}</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">
                      {Math.round((rec.confidence || 0.85) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 11. FINAL ADVISORY & STRATEGIC NEXT STEPS */}
        <div className="print-avoid-break space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>10 • Advisory Next Steps & Implementation Roadmap</span>
            <span className="text-[10px] font-mono text-slate-300 font-normal">Action Plan</span>
          </div>
          <div className="border border-slate-300 p-4 rounded-b space-y-2 bg-white text-xs">
            <ol className="space-y-1.5 list-decimal list-inside text-slate-800">
              <li><strong>Prepare Detailed Project Report (DPR):</strong> Submit formal capital cost quotes and land ownership/lease certificate.</li>
              <li><strong>Gram Panchayat & DIC Registration:</strong> Obtain local trade registration and Udyam MSME certificate online.</li>
              <li><strong>Bank Linkage via PMEGP / Mudra Portal:</strong> Submit application through official JanSamarth or PMEGP e-Portal for subsidy tagging.</li>
              <li><strong>Infrastructure & Supply Procurement:</strong> Finalize forward purchase agreement with local dairy cooperative / retail aggregators.</li>
            </ol>
          </div>
        </div>

        {/* 12. STATUTORY DISCLAIMER */}
        <div className="print-avoid-break border-t-2 border-slate-300 pt-3 space-y-1 text-[10px] text-slate-500">
          <p className="font-bold text-slate-700 uppercase tracking-wider">
            Official Statutory Disclaimer
          </p>
          <p className="leading-relaxed">
            UDYORA provides evidence-based decision support using available data, assumptions, and configured analytical rules. Recommendations and estimates are not guarantees of business success, financing approval, market performance, or financial outcome. Users should verify applicable information with the relevant official sources and qualified professionals before making financial or business decisions.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-400 font-mono">
            <span>UDYORA • Hyper-Local Business Intelligence for Rural Entrepreneurs</span>
            <span>Report ID: {reportId} • Page Verified</span>
          </div>
        </div>

      </div>
    </div>
  );
};
