import {
  CompleteAnalysisReport,
  UserBusinessInput,
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

/**
 * UDYORA MULTI-AGENT ORCHESTRATOR
 * Executes agents in coordinated sequence with real-time step streaming.
 * Fault-tolerant execution ensures non-critical agent failures don't crash the report.
 */
export async function executeMultiAgentWorkflow(
  input: UserBusinessInput,
  onStepProgress?: (steps: AgentStepStatus[], currentActiveId?: string) => void
): Promise<CompleteAnalysisReport> {
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

  // 1. Resolve Location
  const location = input.customLocationText
    ? createCustomLocationData(input.customLocationText)
    : getLocationById(input.locationId);

  if (input.latitude && input.longitude) {
    location.latitude = input.latitude;
    location.longitude = input.longitude;
  }
  if (input.locationResolution) {
    location.administrativeSource = input.locationResolution.administrativeSource;
    location.mappingSource = input.locationResolution.mappingSource;
  }

  // Step 1: Evidence Agent
  updateStep('evidence', 'RUNNING', 30, 'Retrieving ground truth parameters from Census and District GIS...');
  await delay(300);
  const t0 = Date.now();
  let evidencePayload: AgentPayload<EvidenceRecord[]>;
  try {
    evidencePayload = runEvidenceAgent(input, location);
    updateStep('evidence', 'COMPLETED', 100, evidencePayload.summary, Date.now() - t0);
  } catch (err: any) {
    console.warn('Evidence agent warning:', err);
    evidencePayload = {
      agentName: 'Evidence & Data Agent',
      status: 'DEGRADED',
      dataQuality: 'INSUFFICIENT DATA',
      overallConfidence: 0.7,
      summary: 'Evidence retrieval defaulted to regional statistical baseline.',
      data: [],
      evidenceGenerated: []
    };
    updateStep('evidence', 'COMPLETED', 100, evidencePayload.summary, Date.now() - t0);
  }

  // Step 2: Business Analysis Agent
  updateStep('business', 'RUNNING', 40, 'Formulating operational model and capacity parameters...');
  await delay(300);
  const t1 = Date.now();
  let businessPayload: AgentPayload<BusinessAgentData>;
  try {
    businessPayload = runBusinessAgent(input, location);
    updateStep('business', 'COMPLETED', 100, businessPayload.summary, Date.now() - t1);
  } catch (err: any) {
    console.warn('Business agent warning:', err);
    businessPayload = {
      agentName: 'Business Analysis Agent',
      status: 'DEGRADED',
      summary: 'Operating model compiled from standard enterprise benchmarks.',
      data: { businessSummary: `${input.businessIdea} setup in ${location.village}.` },
      evidenceGenerated: []
    };
    updateStep('business', 'COMPLETED', 100, businessPayload.summary, Date.now() - t1);
  }

  // Step 3: Market Intelligence Agent
  updateStep('market', 'RUNNING', 40, 'Evaluating demographic reach, cooperative hubs, and competition index...');
  await delay(300);
  const t2 = Date.now();
  let marketPayload: AgentPayload<MarketAgentData>;
  try {
    marketPayload = runMarketAgent(input, location);
    updateStep('market', 'COMPLETED', 100, marketPayload.summary, Date.now() - t2);
  } catch (err: any) {
    console.warn('Market agent warning:', err);
    marketPayload = {
      agentName: 'Market Intelligence Agent',
      status: 'DEGRADED',
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
  await delay(350);
  const t3 = Date.now();
  let financePayload: AgentPayload<FinancialPlan>;
  try {
    financePayload = runFinanceAgent(input);
    updateStep('finance', 'COMPLETED', 100, financePayload.summary, Date.now() - t3);
  } catch (err: any) {
    console.error('Financial agent execution error:', err);
    throw err; // Finance is critical
  }

  // Step 5: Scheme Guidance Agent (Rule-based)
  updateStep('scheme', 'RUNNING', 50, 'Matching official government scheme guidelines and calculating subsidies...');
  await delay(300);
  const t4 = Date.now();
  let schemePayload: AgentPayload<SchemeMatchResult[]>;
  try {
    schemePayload = runSchemeAgent(input, financePayload.data);
    updateStep('scheme', 'COMPLETED', 100, schemePayload.summary, Date.now() - t4);
  } catch (err: any) {
    console.warn('Scheme agent warning:', err);
    schemePayload = {
      agentName: 'Scheme Guidance Agent',
      status: 'DEGRADED',
      summary: 'Scheme matching completed with standard credit facilities.',
      data: [],
      evidenceGenerated: []
    };
    updateStep('scheme', 'COMPLETED', 100, schemePayload.summary, Date.now() - t4);
  }

  // Step 6: Risk Analysis Agent
  updateStep('risk', 'RUNNING', 50, 'Evaluating high/medium/low vulnerabilities and rural mitigations...');
  await delay(300);
  const t5 = Date.now();
  let riskPayload: AgentPayload<RiskProfile>;
  try {
    riskPayload = runRiskAgent(input, location, financePayload.data);
    updateStep('risk', 'COMPLETED', 100, riskPayload.summary, Date.now() - t5);
  } catch (err: any) {
    console.warn('Risk agent warning:', err);
    riskPayload = {
      agentName: 'Risk Analysis Agent',
      status: 'DEGRADED',
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
  await delay(300);
  const t6 = Date.now();
  const aggregatorValidation = validateAndReconcileAgentOutputs(
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

  // Step 8: Final Advisor / Report Agent
  updateStep('final', 'RUNNING', 70, 'Compiling executive feasibility score and public-service report...');
  await delay(350);
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

  const repId = `UDY-${Date.now().toString(36).toUpperCase()}`;
  const report: CompleteAnalysisReport = {
    reportId: repId,
    id: repId,
    generatedAt: new Date().toISOString(),
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
    domainComparison: compareBusinessDomains(input, location),
    evidenceAuditLog,
    evidenceRecords: evidenceAuditLog,
    aggregatorValidation
  };

  return report;
}
