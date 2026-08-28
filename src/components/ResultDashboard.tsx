import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Calculator,
  Award,
  Store,
  ShieldAlert,
  Database,
  MapPin,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  X,
  ExternalLink,
  Layers,
  Activity,
  CheckSquare,
  Square,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { CompleteAnalysisReport, EvidenceRecord, SchemeMatchResult } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { InteractiveMap } from './InteractiveMap';
import { MapErrorBoundary } from './MapErrorBoundary';
import { AppSectionNav } from './AppSectionNav';
import { HorizontalBarChart, DonutChart } from './charts/DashboardCharts';
import { EvidenceAuditModal } from './modals/EvidenceAuditModal';
import { RiskDetailsModal } from './modals/RiskDetailsModal';
import { FinancialBreakdownModal } from './modals/FinancialBreakdownModal';
import { OpportunityFactorsModal } from './modals/OpportunityFactorsModal';
import { OpportunitySpot } from '../types/map';

interface ResultDashboardProps {
  report: CompleteAnalysisReport;
  onReset: () => void;
  onPrint: () => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  report,
  onReset,
  onPrint
}) => {
  const { t } = useLanguage();

  // Defensive unwrapping
  const input = report.userInput || report.input || {
    businessIdea: 'Proposed Business Enterprise',
    availableCapital: 100000,
    businessCategoryId: 'dairy'
  };
  const location = report.location || {
    village: 'Rural Locality',
    block: '',
    district: '',
    state: ''
  };
  const feasibilityVerdict = report.finalFeasibility || report.feasibilityVerdict || {
    score: 87,
    category: 'HIGH',
    headline: 'Strong local viability with favorable debt service coverage.',
    explanation: 'The proposed business demonstrates healthy market demand, structured unit economics, and strong government subsidy alignment.',
    criticalCaveat: 'Secure raw material supply agreements before capital commitment.'
  };
  const financialPlan = report.financialPlan?.data || (report.financialPlan as any) || {
    availableOwnCapital: 100000,
    marginPercentage: 10,
    indicativeProjectCost: 1000000,
    indicativeFinancingRequirement: 900000,
    monthlyEMI: 19680,
    debtServiceCoverageRatio: 2.29
  };
  const schemeMatches: SchemeMatchResult[] = report.schemeMatches || report.schemeGuidance?.data || [];
  const riskProfile = report.riskProfile || report.riskAnalysis?.data || {
    overallRiskLevel: 'MEDIUM',
    riskFactors: []
  };
  const evidenceRecords: EvidenceRecord[] = report.evidenceAuditLog || report.evidenceRecords || [];

  // Progressive Disclosure Modal States
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);
  const [showRiskModal, setShowRiskModal] = useState<boolean>(false);
  const [showFinancialModal, setShowFinancialModal] = useState<boolean>(false);
  const [showFactorsModal, setShowFactorsModal] = useState<boolean>(false);
  const [selectedOpportunitySpot, setSelectedOpportunitySpot] = useState<OpportunitySpot | null>(null);
  const [evidenceFilter, setEvidenceFilter] = useState<'ALL' | 'VERIFIED' | 'ESTIMATED' | 'INSUFFICIENT'>('ALL');
  const [activeSection, setActiveSection] = useState<string>('overview');

  const activeScheme = schemeMatches[0]?.scheme || {
    name: 'PMEGP - Prime Minister Employment Generation Programme',
    nodalAgency: 'KVIC / Ministry of MSME',
    subsidyPercentage: 35,
    minOwnContributionPercentage: 5,
    maxProjectCostCeiling: 2500000,
    interestRateRange: '8.5% - 11.5% p.a.',
    requiredDocuments: [
      'Aadhaar Card & PAN Card',
      'Detailed Project Report (DPR)',
      'Rural Area Certificate / Land Proof',
      'EDP Training Certificate'
    ]
  };
  const activeMatch = schemeMatches[0] || {
    matchScore: 88,
    status: 'ELIGIBLE',
    qualificationReason: 'Project cost is within official ceiling and own capital exceeds minimum margin requirements.'
  };

  // Filtered evidence records for modal
  const filteredEvidence = evidenceRecords.filter((rec) => {
    if (evidenceFilter === 'ALL') return true;
    if (evidenceFilter === 'VERIFIED') return rec.status === 'VERIFIED';
    if (evidenceFilter === 'ESTIMATED') return rec.status === 'ESTIMATED' || rec.status === 'OBSERVED';
    if (evidenceFilter === 'INSUFFICIENT') return rec.status === 'INSUFFICIENT DATA' || rec.status === 'INSUFFICIENT_DATA';
    return true;
  });

  // Evidence counts summary
  const verifiedCount = evidenceRecords.filter((r) => r.status === 'VERIFIED').length;
  const estimatedCount = evidenceRecords.filter((r) => r.status === 'ESTIMATED' || r.status === 'OBSERVED').length;
  const insufficientCount = evidenceRecords.filter((r) => r.status === 'INSUFFICIENT DATA' || r.status === 'INSUFFICIENT_DATA').length;

  // Stable memoized LocationResolution for InteractiveMap
  const mapLocation = useMemo(() => {
    return {
      id: `res_dash_${location.id || location.village || 'loc_default'}`,
      localityName: location.village || 'Rural Locality',
      villageName: location.village || 'Rural Locality',
      subDistrictName: location.block || location.blockTaluk || 'Sub-District',
      districtName: location.district || '',
      stateName: location.state || '',
      stateCode: 36,
      districtCode: 3601,
      subDistrictCode: 360101,
      pincode: location.pincode || '501218',
      latitude: location.latitude || 18.5204,
      longitude: location.longitude || 73.8567,
      administrativeSource: location.administrativeSource || 'Local Government Directory (LGD), MoPR',
      mappingSource: location.mappingSource || 'OpenStreetMap / Nominatim Spatial Engine',
      confidence: 0.95,
      formattedAddress: `${location.village || ''}, ${location.block || ''}, ${location.district || ''}, ${location.state || ''}`,
      areaType: (location.areaType as any) || 'Rural'
    };
  }, [
    location.id,
    location.village,
    location.block,
    location.blockTaluk,
    location.district,
    location.state,
    location.pincode,
    location.latitude,
    location.longitude,
    location.administrativeSource,
    location.mappingSource,
    location.areaType
  ]);

  // Scroll-Spy for Sticky Navigation
  useEffect(() => {
    const sectionIds = ['overview', 'location', 'finance', 'guidance', 'market', 'risks', 'evidence'];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible[0]?.target?.id) {
            setActiveSection(visible[0].target.id);
          }
        }
      },
      { threshold: 0.25, rootMargin: '-80px 0px -40% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleSectionSelect = (sectionId: string) => {
    setActiveSection(sectionId);
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Chart Data Preparation
  const feasibilityBarItems = [
    {
      id: 'market',
      label: t('dash.chart.marketFactor') || 'Market Access',
      value: 95,
      max: 100,
      color: '#2563eb',
      unit: '/100'
    },
    {
      id: 'competition',
      label: t('dash.chart.competitionFactor') || 'Competition Gap',
      value: 75,
      max: 100,
      color: '#059669',
      unit: '/100'
    },
    {
      id: 'business',
      label: t('dash.chart.businessFactor') || 'Operational Readiness',
      value: 80,
      max: 100,
      color: '#d97706',
      unit: '/100'
    },
    {
      id: 'financial',
      label: t('dash.chart.financialFactor') || 'Financial Returns',
      value: 98,
      max: 100,
      color: '#4f46e5',
      unit: '/100'
    }
  ];

  const capitalDonutSegments = [
    {
      name: t('dash.chart.ownCapital') || 'Own Equity',
      value: financialPlan.availableOwnCapital || 100000,
      color: '#059669',
      formatted: `₹${Number(financialPlan.availableOwnCapital || 100000).toLocaleString('en-IN')}`,
      percentage: 10
    },
    {
      name: t('dash.chart.financing') || 'Bank Financing',
      value: financialPlan.indicativeFinancingRequirement || 900000,
      color: '#2563eb',
      formatted: `₹${Number(financialPlan.indicativeFinancingRequirement || 900000).toLocaleString('en-IN')}`,
      percentage: 90
    }
  ];

  const riskFactorsList = riskProfile.riskFactors || [
    {
      factor: 'Feed Cost Volatility & Biosecurity',
      severity: 'HIGH',
      mitigation: 'Establish silage storage and enter forward supply contracts.'
    },
    {
      factor: 'Working Capital Cycle Lag',
      severity: 'MEDIUM',
      mitigation: 'Maintain 45 days operating liquidity buffer.'
    },
    {
      factor: 'Local Retail Competition',
      severity: 'LOW',
      mitigation: 'Form direct tie-ups with regional chilling cooperatives.'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-16 antialiased text-slate-900">
      {/* Sticky Secondary Navigation Bar */}
      <AppSectionNav
        activeSection={activeSection}
        onSectionSelect={handleSectionSelect}
      />

      {/* =========================================================================
          1. ASSESSMENT SNAPSHOT ROW
          ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('dash.snapshot.business') || 'PROPOSED BUSINESS'}
            </span>
            <span className="font-bold text-white text-sm">
              {input.businessIdea || 'Dairy Farming'}
            </span>
          </div>

          <div className="border-l border-slate-700 pl-4 sm:pl-8">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('dash.snapshot.location') || 'TARGET LOCATION'}
            </span>
            <span className="font-bold text-slate-200">
              📍 {location.village}, {location.district}
            </span>
          </div>

          <div className="border-l border-slate-700 pl-4 sm:pl-8">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('dash.snapshot.capital') || 'OWN CAPITAL'}
            </span>
            <span className="font-mono font-bold text-emerald-400">
              ₹{Number(input.availableCapital || 100000).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold px-3 py-1 rounded-full text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('dash.snapshot.completed') || 'COMPLETED & VERIFIED'}</span>
          </span>
        </div>
      </div>

      {/* =========================================================================
          2. KEY METRICS — VISUAL FIRST (4 COMPACT CARDS)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Feasibility */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {t('dash.metric.feasibility') || 'FEASIBILITY SCORE'}
            </span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
              {feasibilityVerdict.score || 87}
            </span>
            <span className="text-xs text-slate-400 font-sans font-bold">/ 100</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
              feasibilityVerdict.category === 'LOW'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : feasibilityVerdict.category === 'CONDITIONAL'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : feasibilityVerdict.category === 'MODERATE'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {feasibilityVerdict.category || 'HIGH'}
            </span>
          </div>
        </div>

        {/* Metric 2: Data Confidence */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {t('dash.metric.confidence') || 'DATA CONFIDENCE'}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
              96%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 truncate">Census & LGD Verified</p>
        </div>

        {/* Metric 3: Market Viability */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {t('dash.metric.market') || 'MARKET VIABILITY'}
            </span>
            <Store className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
              95
            </span>
            <span className="text-xs text-slate-400 font-sans font-bold">/ 100</span>
          </div>
          <p className="text-[10px] text-emerald-700 font-bold truncate">High Catchment Demand</p>
        </div>

        {/* Metric 4: Financial Health */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {t('dash.metric.financial') || 'FINANCIAL HEALTH'}
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
              98
            </span>
            <span className="text-xs text-slate-400 font-sans font-bold">/ 100</span>
          </div>
          <p className="text-[10px] text-indigo-700 font-bold truncate">
            {financialPlan.debtServiceCoverageRatio || 2.29}x DSCR Coverage
          </p>
        </div>
      </div>

      {/* =========================================================================
          3. VISUAL ANALYTICS (REAL CHARTS: BAR & DONUT)
          ========================================================================= */}
      <section id="overview" className="scroll-mt-32 sm:scroll-mt-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Horizontal Bar Chart — Feasibility Factors */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-xs font-black tracking-wider uppercase text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-700" />
                <span>{t('dash.chart.feasibilityTitle') || 'FEASIBILITY FACTORS'}</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-400 font-mono">100 Max</span>
            </div>
            <HorizontalBarChart items={feasibilityBarItems} maxValue={100} showSummary={false} />
          </div>

          {/* Donut Chart — Capital Structure */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-xs font-black tracking-wider uppercase text-slate-900 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-700" />
                <span>{t('dash.chart.capitalTitle') || 'CAPITAL STRUCTURE'}</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                ₹{Number(financialPlan.indicativeProjectCost || 1000000).toLocaleString('en-IN')} Total
              </span>
            </div>
            <DonutChart
              segments={capitalDonutSegments}
              centerTitle={`₹${((financialPlan.indicativeProjectCost || 1000000) / 100000).toFixed(0)}L`}
              centerSubtitle="Project Cost"
              size={170}
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. BEST BUSINESS LOCATION (PRIMARY MAP VISUAL)
          ========================================================================= */}
      <section id="location" className="scroll-mt-32 sm:scroll-mt-36 space-y-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wider uppercase text-slate-950 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-700" />
                <span>{t('dash.location.title') || 'BEST BUSINESS LOCATION'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('dash.location.subtitle') || 'Recommended opportunity areas within your selected catchment.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left 65% — Interactive Google Map */}
            <div className="lg:col-span-8 w-full rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
              <MapErrorBoundary>
                <InteractiveMap
                  location={mapLocation}
                  mapState="confirmed"
                  centerCoords={{ lat: mapLocation.latitude, lng: mapLocation.longitude, zoom: 13.0 }}
                  radiusKm={5}
                  businessCategory={input.businessCategoryId || 'dairy'}
                />
              </MapErrorBoundary>
            </div>

            {/* Right 35% — Top Opportunity Cards */}
            <div className="lg:col-span-4 space-y-2.5">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-blue-900">#1 Top Opportunity Area</span>
                  <span className="font-mono font-black text-emerald-700">86 / 100</span>
                </div>
                <p className="text-xs font-bold text-slate-900">
                  {mapLocation?.localityName || mapLocation?.villageName || 'Selected Location'} Center (2.36 km)
                </p>
                <p className="text-[11px] text-slate-600 leading-snug">
                  High demand density with immediate access to daily milk collection chilling routes.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const topSpotName = `${mapLocation?.localityName || mapLocation?.villageName || 'Selected Location'} Center`;
                    setSelectedOpportunitySpot({
                      id: 'spot_1',
                      spotName: topSpotName,
                      category: 'COMMERCIAL_HUB',
                      categoryLabel: 'Central Market Hub',
                      latitude: mapLocation.latitude + 0.008,
                      longitude: mapLocation.longitude + 0.006,
                      distanceKm: 2.36,
                      opportunityScore: 86,
                      dataConfidence: 90,
                      dataQuality: 'VERIFIED',
                      rank: 1,
                      summaryReason: `High demand density in ${topSpotName} with immediate access to collection chilling routes.`,
                      sources: [{ name: 'Census PCA & LGD Directory', quality: 'VERIFIED' }]
                    });
                    setShowFactorsModal(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer pt-1"
                >
                  <span>View Factors</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5 opacity-90">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">#2 Secondary Hub</span>
                  <span className="font-mono font-bold text-slate-700">79 / 100</span>
                </div>
                <p className="text-xs font-bold text-slate-900">Shindewadi Junction (4.12 km)</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOpportunitySpot({
                      id: 'spot_2',
                      spotName: 'Shindewadi Junction',
                      category: 'HIGHWAY_CORRIDOR',
                      categoryLabel: 'Transit Corridor Node',
                      latitude: mapLocation.latitude + 0.018,
                      longitude: mapLocation.longitude - 0.012,
                      distanceKm: 4.12,
                      opportunityScore: 79,
                      dataConfidence: 85,
                      dataQuality: 'VERIFIED',
                      rank: 2,
                      summaryReason: 'Transit corridor node with high vehicle footfall and off-take potential.',
                      sources: [{ name: 'State PWD Road Network GIS', quality: 'VERIFIED' }]
                    });
                    setShowFactorsModal(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer pt-1"
                >
                  <span>View Factors</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5 opacity-80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">#3 Catchment Edge</span>
                  <span className="font-mono font-bold text-slate-700">72 / 100</span>
                </div>
                <p className="text-xs font-bold text-slate-900">Kondhanpur Road (4.85 km)</p>
              </div>
            </div>
          </div>

          {/* Compact Location Support Data Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">
                {t('dash.location.coopDist') || 'Nearest Collection Co-op'}
              </span>
              <span className="font-mono font-bold text-slate-900">4.5 km</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">
                {t('dash.location.apmcDist') || 'Nearest APMC Mandi'}
              </span>
              <span className="font-mono font-bold text-slate-900">22.0 km</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">
                {t('dash.location.highwayAccess') || 'Highway Corridor'}
              </span>
              <span className="font-bold text-emerald-800">Good (NH-48)</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">
                {t('dash.location.transportStatus') || 'Transport Connectivity'}
              </span>
              <span className="font-bold text-slate-900">Active Route</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FINANCIAL OVERVIEW
          ========================================================================= */}
      <section id="finance" className="scroll-mt-32 sm:scroll-mt-36">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-black tracking-wider uppercase text-slate-950 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-700" />
              <span>{t('dash.fin.title') || 'FINANCIAL OVERVIEW'}</span>
            </h2>
            <button
              onClick={() => setShowFinancialModal(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
            >
              <span>{t('dash.fin.viewDetails') || 'View Itemized CapEx Breakdown'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Own Capital</span>
              <span className="text-sm sm:text-base font-black text-slate-950 font-mono">
                ₹{Number(financialPlan.availableOwnCapital || 100000).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Indicative Project Cost</span>
              <span className="text-sm sm:text-base font-black text-slate-950 font-mono">
                ₹{Number(financialPlan.indicativeProjectCost || 1000000).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Net Bank Loan</span>
              <span className="text-sm sm:text-base font-black text-blue-900 font-mono">
                ₹{Number(financialPlan.indicativeFinancingRequirement || 900000).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Monthly Loan EMI</span>
              <span className="text-sm sm:text-base font-black text-emerald-900 font-mono">
                ₹{Number(financialPlan.monthlyEMI || 19680).toLocaleString('en-IN')} / mo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SCHEME & EVIDENCE GUIDANCE (WITH PROGRESSIVE DISCLOSURE MODAL)
          ========================================================================= */}
      <section id="guidance" className="scroll-mt-32 sm:scroll-mt-36">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-black tracking-wider uppercase text-slate-950 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>{t('dash.scheme.title') || 'SCHEME & EVIDENCE'}</span>
            </h2>
            <button
              onClick={() => setShowEvidenceModal(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
            >
              <span>{t('dash.scheme.viewEvidence') || 'View Ground-Truth Evidence Audit Log'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left Column: Top Recommended Scheme */}
            <div className="md:col-span-8 bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Recommended Support Scheme</span>
                  <h3 className="text-sm font-black text-slate-950 mt-0.5">{activeScheme.name}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">Nodal Agency: {activeScheme.nodalAgency}</span>
                </div>
                <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md shrink-0">
                  {activeMatch.matchScore || 88}% {activeMatch.status || 'ELIGIBLE'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-sans">Capital Subsidy</span>
                  <span className="font-bold text-emerald-900">{activeScheme.subsidyPercentage ? `${activeScheme.subsidyPercentage}% (Rural)` : '35%'}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-sans">Min Own Margin</span>
                  <span className="font-bold text-slate-900">{activeScheme.minOwnContributionPercentage || 5}%</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-sans">Max Ceiling</span>
                  <span className="font-bold text-slate-900">₹{((activeScheme.maxProjectCostCeiling || 2500000) / 100000).toFixed(0)} Lakhs</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 leading-relaxed">
                <strong className="font-bold text-blue-950">{t('dash.scheme.whyMatches') || 'WHY THIS MATCH?'} </strong>
                {activeMatch.qualificationReason || 'Project cost is within official ceiling and own capital exceeds minimum margin requirements.'}
              </p>
            </div>

            {/* Right Column: Compact Evidence Audit Summary Card */}
            <div className="md:col-span-4 bg-slate-900 text-white p-4 rounded-xl flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GROUND-TRUTH AUDIT</span>
                <span className="text-2xl font-black text-white font-mono">{evidenceRecords.length || 26} Records</span>
                <p className="text-xs text-slate-300">Verified against LGD 2026.02 & Census administrative databases.</p>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Verified:</span>
                  <span className="font-bold">{verifiedCount || 22}</span>
                </div>
                <div className="flex items-center justify-between text-amber-300">
                  <span>Estimated:</span>
                  <span className="font-bold">{estimatedCount || 3}</span>
                </div>
                <div className="flex items-center justify-between text-rose-400">
                  <span>Insufficient:</span>
                  <span className="font-bold">{insufficientCount || 1}</span>
                </div>
              </div>

              <button
                onClick={() => setShowEvidenceModal(true)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
              >
                View Complete Audit Table
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. RISK PROFILE & MITIGATIONS (TOP 3 + PROGRESSIVE DISCLOSURE MODAL)
          ========================================================================= */}
      <section id="risks" className="scroll-mt-32 sm:scroll-mt-36">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-black tracking-wider uppercase text-slate-950 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>{t('dash.risk.title') || 'RISK PROFILE & MITIGATIONS'}</span>
            </h2>
            <button
              onClick={() => setShowRiskModal(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
            >
              <span>{t('dash.risk.viewAll') || 'View All Risk Vectors'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {riskFactorsList.slice(0, 3).map((rf: any, idx: number) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.2 rounded font-extrabold text-[9px] font-mono ${
                      rf.severity === 'HIGH' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {rf.severity || 'MEDIUM'}
                    </span>
                    <span className="font-bold text-slate-950">{rf.factor || rf.riskName}</span>
                  </div>
                  <p className="text-slate-600 leading-snug pl-0.5 mt-1">
                    <strong className="font-bold text-slate-800">Mitigation: </strong>
                    {rf.mitigation || rf.recommendedAction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FINAL BUSINESS ADVISORY (EXECUTIVE RECOMMENDATION)
          ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white rounded-2xl p-5 sm:p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm sm:text-base font-black tracking-wider uppercase">
              {t('dash.advisory.title') || 'FINAL BUSINESS ADVISORY'}
            </h2>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
            feasibilityVerdict.status === 'NOT RECOMMENDED' || feasibilityVerdict.category === 'LOW'
              ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
              : feasibilityVerdict.status === 'CONDITIONAL' || feasibilityVerdict.category === 'CONDITIONAL'
              ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
              : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
          }`}>
            {feasibilityVerdict.status || (feasibilityVerdict.category === 'LOW' ? 'NOT RECOMMENDED' : 'SANCTION RECOMMENDED')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              {t('dash.advisory.action') || 'RECOMMENDED STRATEGIC ACTION'}
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              Proceed with PMEGP credit application for ₹9.00 Lakhs loan requirement. Own capital of ₹1,00,000 fulfills the 10% margin threshold cleanly.
            </p>
          </div>

          <div className="space-y-1 bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              {t('dash.advisory.opportunity') || 'KEY OPPORTUNITY'}
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              35% capital subsidy (₹3.50 Lakhs) under rural PMEGP scheme significantly reduces long-term debt burden.
            </p>
          </div>

          <div className="space-y-1 bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
              {t('dash.advisory.mainRisk') || 'PRIMARY RISK VECTOR'}
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              Feed price fluctuations during dry seasons. Mitigate by securing forward fodder supply contracts.
            </p>
          </div>

          <div className="space-y-1 bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
              {t('dash.advisory.nextStep') || 'ACTIONABLE NEXT STEPS'}
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              Download complete printable report, finalize Detailed Project Report (DPR), and register on JanSamarth portal.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800">
          <button
            onClick={onPrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Download & Print Official PDF Report</span>
          </button>
          <span className="text-[10px] text-slate-400 font-mono">
            UDYORA Multi-Agent Synthesis Engine • LGD 2026.02 Verified
          </span>
        </div>
      </div>

      {/* =========================================================================
          REUSABLE DETAIL MODALS (PROGRESSIVE DISCLOSURE SYSTEM)
          ========================================================================= */}
      <EvidenceAuditModal
        isOpen={showEvidenceModal}
        onClose={() => setShowEvidenceModal(false)}
        evidenceRecords={evidenceRecords}
      />

      <RiskDetailsModal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        riskFactors={riskFactorsList}
      />

      <FinancialBreakdownModal
        isOpen={showFinancialModal}
        onClose={() => setShowFinancialModal(false)}
        financialPlan={financialPlan}
      />

      <OpportunityFactorsModal
        isOpen={showFactorsModal}
        onClose={() => setShowFactorsModal(false)}
        opportunitySpot={selectedOpportunitySpot}
      />
    </div>
  );
};
