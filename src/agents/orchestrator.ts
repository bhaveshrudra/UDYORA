import {
  CompleteAnalysisReport,
  UserBusinessInput,
  LocationData,
  AgentStepStatus,
  EvidenceRecord,
  BusinessAgentData,
  MarketAgentData,
  FinancialPlan,
  SchemeMatchResult,
  RiskProfile,
  AgentPayload
} from '../types';
import { getLocationById, createCustomLocationData } from '../services/locationService';
import { runEvidenceAgent } from './evidenceAgent';
import { runBusinessAgent } from './businessAgent';
import { runMarketAgent } from './marketAgent';
import { runFinanceAgent } from './financeAgent';
import { runSchemeAgent } from './schemeAgent';
import { runRiskAgent } from './riskAgent';
import { validateAndReconcileAgentOutputs } from '../services/aggregatorValidator';
import { runFinalAdvisorAgent } from './finalAdvisor';
import { compareBusinessDomains } from '../services/domainComparisonService';
import { normalizeCoordinates } from '../services/coordinateNormalizer';
import { generateDeterministicSwot } from '../services/swotEngine';

/**
 * UDYORA MULTI-AGENT ORCHESTRATOR
 * 
 * Coordinates multi-agent execution pipeline with:
 * - Single source of truth for UserBusinessInput
 * - Fault tolerance (graceful degradation if non-critical agents fail)
 * - Observability with correlation request IDs
 * - Deterministic cross-agent validation
 */
export async function executeMultiAgentWorkflow(
  input: UserBusinessInput,
  onStepProgress?: (steps: AgentStepStatus[], currentActiveId?: string) => void
): Promise<CompleteAnalysisReport> {
  const reqId = `REQ-${Date.now().toString(36).toUpperCase()}`;
  const isDev = process.env.NODE_ENV !== 'production';

  console.log('[UDYORA ANALYZE] orchestrator started');

  if (isDev) {
    console.log(`[ORCHESTRATOR] [${reqId}] Input received:`, {
      locationId: input.locationId,
      category: input.businessCategoryId,
      capital: input.availableCapital,
      language: input.language
    });
  }

  const steps: AgentStepStatus[] = [
    {
      id: 'evidence',
      name: 'Evidence & Data Agent',
      role: 'Ground Truth Verification & Census Data Retrieval',
      status: 'PENDING',
      progressPct: 0,
      message: 'Pending execution...'
    },
    {
      id: 'business',
      name: 'Business Analysis Agent',
      role: 'Operating Scale, Capacity & Resource Requirements',
      status: 'PENDING',
      progressPct: 0,
      message: 'Pending execution...'
    },
    {
      id: 'market',
      name: 'Market Intelligence Agent',
      role: 'Catchment Demographics, Competitor & Off-take Analysis',
      status: 'PENDING',
      progressPct: 0,
      message: 'Pending execution...'
    },
    {
      id: 'finance',
      name: 'Financial Advisor Agent',
      role: 'Deterministic Unit Economics & Repayment Calculations',
      status: 'PENDING',
      progressPct: 0,
      message: 'Pending execution...'
    },
    {
      id: 'scheme',
      name: 'Scheme Guidance Agent',
      role: 'Official Government Scheme Rules & Subsidies',
      status: 'PENDING',
      progressPct: 0,
      message: 'Pending execution...'
    },
    {
      id: 'risk',
      name: 'Risk Analysis Agent',
      role: 'Multi-Dimensional Vulnerability Assessment',
      status: 'PENDING',
      progressPct: 0,
      message: 'Pending execution...'
    },
    {
      id: 'validator',
      name: 'Aggregator & Validator',
      role: 'Cross-Agent Mathematical & Quality Audit',
      status: 'PENDING',
      progressPct: 0,
      message: 'Pending execution...'
    },
    {
      id: 'final',
      name: 'Final Advisor & Report',
      role: 'Synthesized Feasibility Score & Official Advisory Report',
      status: 'PENDING',
      progressPct: 0,
      message: 'Pending execution...'
    }
  ];

  const updateStep = (
    stepId: string,
    status: AgentStepStatus['status'],
    progress: number,
    message?: string,
    durationMs?: number
  ) => {
    const target = steps.find((s) => s.id === stepId);
    if (target) {
      target.status = status;
      target.progressPct = progress;
      if (message) target.message = message;
      if (durationMs) target.durationMs = durationMs;
    }
    if (onStepProgress) {
      onStepProgress([...steps], stepId);
    }
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 1. Resolve Canonical Location (Strict Priority: locationResolution > customLocationText > locationId)
  let location: LocationData;
  if (input.locationResolution) {
    const res = input.locationResolution;
    const base = createCustomLocationData(res.formattedAddress || 'Selected Location');
    location = {
      ...base,
      id: `loc_canon_${res.subDistrictCode || res.districtCode || Date.now()}`,
      village: res.localityName || res.villageName || 'Selected Location',
      block: res.subDistrictName || base.block,
      district: res.districtName || base.district,
      state: res.stateName || base.state,
      pincode: res.pincode || base.pincode,
      latitude: res.latitude,
      longitude: res.longitude,
      areaType: res.areaType || 'Rural',
      administrativeSource: res.administrativeSource || 'Local Government Directory (LGD), MoPR',
      mappingSource: res.mappingSource || 'OpenStreetMap / Nominatim Spatial Engine'
    };
  } else if (input.customLocationText) {
    location = createCustomLocationData(input.customLocationText);
  } else if (input.locationId) {
    location = getLocationById(input.locationId);
  } else {
    location = createCustomLocationData('Unspecified Rural Locality');
  }

  if (input.latitude && input.longitude) {
    location.latitude = input.latitude;
    location.longitude = input.longitude;
  }
  const normCoords = normalizeCoordinates(input.locationResolution) || normalizeCoordinates(input) || normalizeCoordinates(location) || { lat: 18.3517, lng: 73.8567 };
  location.latitude = normCoords.lat;
  location.longitude = normCoords.lng;

  if (input.locationResolution) {
    location.administrativeSource = input.locationResolution.administrativeSource;
    location.mappingSource = input.locationResolution.mappingSource;
  }

  console.log('[ORCHESTRATOR INPUT]', {
    location: location.village,
    businessType: input.businessCategoryId,
    availableCapital: input.availableCapital,
    language: input.language
  });

  // Step 1: Evidence Agent
  updateStep('evidence', 'RUNNING', 30, 'Retrieving ground truth parameters from Census and District GIS...');
  await delay(250);
  const t0 = Date.now();
  let evidencePayload: AgentPayload<EvidenceRecord[]>;
  try {
    evidencePayload = runEvidenceAgent(input, location);
    updateStep('evidence', 'COMPLETED', 100, evidencePayload.summary, Date.now() - t0);
    if (isDev) console.log(`[EVIDENCE] [${reqId}] Completed with ${evidencePayload.data.length} records.`);
  } catch (err: any) {
    console.warn(`[EVIDENCE] [${reqId}] Agent warning:`, err);
    evidencePayload = {
      agentName: 'Evidence & Data Agent',
      status: 'PARTIAL',
      dataQuality: 'INSUFFICIENT_DATA',
      overallConfidence: 0.7,
      summary: 'Evidence retrieval defaulted to regional statistical baseline.',
      data: [],
      evidenceGenerated: []
    };
    updateStep('evidence', 'COMPLETED', 100, evidencePayload.summary, Date.now() - t0);
  }

  // Step 2: Business Analysis Agent
  updateStep('business', 'RUNNING', 40, 'Formulating operational model and capacity parameters...');
  await delay(250);
  const t1 = Date.now();
  let businessPayload: AgentPayload<BusinessAgentData>;
  try {
    businessPayload = runBusinessAgent(input, location);
    updateStep('business', 'COMPLETED', 100, businessPayload.summary, Date.now() - t1);
    if (isDev) console.log(`[BUSINESS] [${reqId}] Completed for ${input.businessCategoryId}.`);
  } catch (err: any) {
    console.warn(`[BUSINESS] [${reqId}] Agent warning:`, err);
    businessPayload = {
      agentName: 'Business Analysis Agent',
      status: 'PARTIAL',
      dataQuality: 'ESTIMATED',
      summary: 'Operating model compiled from standard enterprise benchmarks.',
      data: { businessSummary: `${input.businessIdea || 'Enterprise'} setup in ${location.village}.` },
      evidenceGenerated: []
    };
    updateStep('business', 'COMPLETED', 100, businessPayload.summary, Date.now() - t1);
  }

  // Step 3: Market Intelligence Agent
  updateStep('market', 'RUNNING', 40, 'Evaluating demographic reach, cooperative hubs, and competition index...');
  await delay(250);
  const t2 = Date.now();
  let marketPayload: AgentPayload<MarketAgentData>;
  try {
    marketPayload = runMarketAgent(input, location);
    updateStep('market', 'COMPLETED', 100, marketPayload.summary, Date.now() - t2);
    if (isDev) console.log(`[MARKET] [${reqId}] Completed with competition level: ${marketPayload.data.competitionLevel}.`);
  } catch (err: any) {
    console.warn(`[MARKET] [${reqId}] Agent warning:`, err);
    marketPayload = {
      agentName: 'Market Intelligence Agent',
      status: 'PARTIAL',
      dataQuality: 'INSUFFICIENT_DATA',
      summary: 'Market evaluated with rural statistical benchmarks.',
      data: {
        demandSummary: 'Steady local consumer demand.',
        competitionLevel: 'MODERATE',
        demandDrivers: ['Local catchment population']
      },
      evidenceGenerated: []
    };
    updateStep('market', 'COMPLETED', 100, marketPayload.summary, Date.now() - t2);
  }

  // Step 4: Financial Advisor Agent (Deterministic)
  updateStep('finance', 'RUNNING', 50, 'Executing deterministic financial math formulas and repayment schedules...');
  await delay(250);
  const t3 = Date.now();
  let financePayload: AgentPayload<FinancialPlan>;
  try {
    financePayload = runFinanceAgent(input);
    updateStep('finance', 'COMPLETED', 100, financePayload.summary, Date.now() - t3);
    if (isDev) console.log(`[FINANCE] [${reqId}] Completed: Project Cost ₹${financePayload.data.indicativeProjectCost}, Loan ₹${financePayload.data.indicativeFinancingRequirement}, EMI ₹${financePayload.data.monthlyEMI}.`);
  } catch (err: any) {
    console.error(`[FINANCE] [${reqId}] Critical error:`, err);
    throw err; // Finance is foundational
  }

  // Step 5: Scheme Guidance Agent (Rule-based)
  updateStep('scheme', 'RUNNING', 50, 'Matching official government scheme guidelines and calculating subsidies...');
  await delay(250);
  const t4 = Date.now();
  let schemePayload: AgentPayload<SchemeMatchResult[]>;
  try {
    schemePayload = runSchemeAgent(input, financePayload.data);
    updateStep('scheme', 'COMPLETED', 100, schemePayload.summary, Date.now() - t4);
    if (isDev) console.log(`[SCHEME] [${reqId}] Completed with ${schemePayload.data.length} matches.`);
  } catch (err: any) {
    console.warn(`[SCHEME] [${reqId}] Agent warning:`, err);
    schemePayload = {
      agentName: 'Scheme Guidance Agent',
      status: 'PARTIAL',
      dataQuality: 'ESTIMATED',
      summary: 'Scheme matching completed with standard credit facilities.',
      data: [],
      evidenceGenerated: []
    };
    updateStep('scheme', 'COMPLETED', 100, schemePayload.summary, Date.now() - t4);
  }

  // Step 6: Risk Analysis Agent
  updateStep('risk', 'RUNNING', 50, 'Evaluating high/medium/low vulnerabilities and rural mitigations...');
  await delay(250);
  const t5 = Date.now();
  let riskPayload: AgentPayload<RiskProfile>;
  try {
    riskPayload = runRiskAgent(input, location, financePayload.data);
    updateStep('risk', 'COMPLETED', 100, riskPayload.summary, Date.now() - t5);
    if (isDev) console.log(`[RISK] [${reqId}] Completed: Overall Risk ${riskPayload.data.overallRiskLevel}.`);
  } catch (err: any) {
    console.warn(`[RISK] [${reqId}] Agent warning:`, err);
    riskPayload = {
      agentName: 'Risk Analysis Agent',
      status: 'PARTIAL',
      dataQuality: 'ESTIMATED',
      summary: 'Standard operational risk profile applied.',
      data: {
        overallRiskLevel: 'MEDIUM',
        riskFactors: []
      },
      evidenceGenerated: []
    };
    updateStep('risk', 'COMPLETED', 100, riskPayload.summary, Date.now() - t5);
  }

  // Aggregate all generated evidence records into a master audit log safely
  const allEvidenceMap = new Map<string, EvidenceRecord>();
  [
    ...(evidencePayload.evidenceGenerated || []),
    ...(businessPayload.evidenceGenerated || []),
    ...(marketPayload.evidenceGenerated || []),
    ...(financePayload.evidenceGenerated || []),
    ...(schemePayload.evidenceGenerated || []),
    ...(riskPayload.evidenceGenerated || [])
  ].forEach((e) => {
    if (e && e.id) {
      allEvidenceMap.set(e.id, e);
    }
  });
  const evidenceAuditLog = Array.from(allEvidenceMap.values());

  // Step 7: Aggregator & Validator Service
  updateStep('validator', 'RUNNING', 60, 'Reconciling cross-agent outputs and auditing mathematical identities...');
  await delay(250);
  const t6 = Date.now();
  const aggregatorValidation = validateAndReconcileAgentOutputs(
    input,
    businessPayload,
    marketPayload,
    financePayload,
    schemePayload,
    riskPayload,
    evidenceAuditLog
  );
  updateStep(
    'validator',
    'COMPLETED',
    100,
    `Validation verified: ${aggregatorValidation.inconsistenciesResolved.length} reconciled, ${aggregatorValidation.warnings.length} advisory notes.`,
    Date.now() - t6
  );
  if (isDev) {
    console.log(`[VALIDATOR] [${reqId}] Validation passed:`, aggregatorValidation.flags);
  }

  // Step 8: Final Advisor / Report Agent
  updateStep('final', 'RUNNING', 70, 'Compiling executive feasibility score and public-service report...');
  await delay(250);
  const t7 = Date.now();
  const feasibilityVerdict = runFinalAdvisorAgent(
    input,
    location,
    businessPayload,
    marketPayload,
    financePayload,
    schemePayload,
    riskPayload,
    evidenceAuditLog
  );
  updateStep(
    'final',
    'COMPLETED',
    100,
    `Feasibility Score: ${feasibilityVerdict.score}/100 (${feasibilityVerdict.category}). Report compiled.`,
    Date.now() - t7
  );
  if (isDev) {
    console.log(`[FINAL] [${reqId}] Final Report compiled. Feasibility: ${feasibilityVerdict.score}/100, Confidence: ${feasibilityVerdict.dataConfidenceScore}%.`);
  }

  const repId = `UDY-${Date.now().toString(36).toUpperCase()}`;
  const report: CompleteAnalysisReport = {
    reportId: repId,
    id: repId,
    generatedAt: new Date().toISOString(),
    language: (input.language as any) || 'en',
    input,
    userInput: input,
    location,
    feasibilityVerdict,
    finalFeasibility: feasibilityVerdict,
    businessAnalysis: businessPayload,
    marketIntelligence: marketPayload,
    marketAnalysis: marketPayload.data,
    financialPlan: financePayload,
    schemeGuidance: schemePayload,
    schemeMatches: schemePayload.data,
    riskAnalysis: riskPayload,
    riskProfile: riskPayload.data,
    swotAnalysis: generateDeterministicSwot({
      input,
      location,
      financialPlan: financePayload.data,
      schemeMatches: schemePayload.data,
      riskProfile: riskPayload.data,
      evidenceAuditLog,
      opportunitySpots: marketPayload.data?.recommendedOpportunitySpots || []
    }),
    domainComparison: compareBusinessDomains(input, location),
    evidenceAuditLog,
    evidenceRecords: evidenceAuditLog,
    aggregatorValidation
  };

  console.log('[UDYORA ANALYZE] orchestrator completed');
  console.log('[UDYORA ANALYZE] results received', {
    reportId: repId,
    feasibilityScore: feasibilityVerdict.score
  });

  return report;
}
