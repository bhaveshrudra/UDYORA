import {
  AgentStepStatus,
  CompleteAnalysisReport,
  UserBusinessInput,
  EvidenceRecord
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

export type OrchestrationStepCallback = (steps: AgentStepStatus[], currentActiveId?: string) => void;

/**
 * ORCHESTRATOR AGENT
 * Coordinates the full multi-agent workflow:
 * 1. Input Validation
 * 2. Ground Truth Evidence Retrieval
 * 3. Business Analysis
 * 4. Market Intelligence
 * 5. Financial Advisory (Deterministic)
 * 6. Scheme Guidance (Rule-Based)
 * 7. Risk Analysis
 * 8. Aggregator / Validator Cross-Check
 * 9. Final Report Synthesis
 */
export async function executeMultiAgentWorkflow(
  input: UserBusinessInput,
  onStepProgress?: OrchestrationStepCallback
): Promise<CompleteAnalysisReport> {
  const steps: AgentStepStatus[] = [
    {
      id: 'evidence',
      name: 'Evidence & Data Agent',
      role: 'Ground Truth Dataset & Census Retrieval',
      status: 'PENDING',
      progressPct: 0,
      message: 'Querying verified Census, NABARD, and District Statistical records...'
    },
    {
      id: 'business',
      name: 'Business Analysis Agent',
      role: 'Operating Model & Unit Economics Structuring',
      status: 'PENDING',
      progressPct: 0,
      message: 'Evaluating operational vectors, gestation periods, and capacity requirements...'
    },
    {
      id: 'market',
      name: 'Market Intelligence Agent',
      role: 'Hyper-Local Demand & Competition Analysis',
      status: 'PENDING',
      progressPct: 0,
      message: 'Analyzing local catchment demand, cooperative chilling hubs, and weekly haats...'
    },
    {
      id: 'finance',
      name: 'Financial Advisor Agent',
      role: 'Deterministic Math & Debt Servicing Engine',
      status: 'PENDING',
      progressPct: 0,
      message: 'Computing CapEx/OpEx, reducing-balance EMI, tenure, and DSCR metrics...'
    },
    {
      id: 'scheme',
      name: 'Scheme Guidance Agent',
      role: 'Rule-Based Government Scheme Matcher',
      status: 'PENDING',
      progressPct: 0,
      message: 'Evaluating PMEGP, MUDRA, KCC guidelines against eligibility rules...'
    },
    {
      id: 'risk',
      name: 'Risk Analysis Agent',
      role: 'Multidimensional Risk & Mitigation Matrix',
      status: 'PENDING',
      progressPct: 0,
      message: 'Assessing biological, price volatility, and liquidity risks with rural mitigations...'
    },
    {
      id: 'validator',
      name: 'Aggregator & Validator',
      role: 'Cross-Agent Mathematical & Logical Integrity Check',
      status: 'PENDING',
      progressPct: 0,
      message: 'Auditing cross-agent consistency and verifying financial identities...'
    },
    {
      id: 'final',
      name: 'Final Advisor / Report Agent',
      role: 'Explainable Feasibility Synthesis & Report Generation',
      status: 'PENDING',
      progressPct: 0,
      message: 'Synthesizing verified multi-agent findings into comprehensive advisory dossier...'
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

  // Step 1: Evidence Agent
  updateStep('evidence', 'RUNNING', 30, 'Retrieving ground truth parameters from Census and District GIS...');
  await delay(350);
  const t0 = Date.now();
  const evidencePayload = runEvidenceAgent(input, location);
  updateStep('evidence', 'COMPLETED', 100, evidencePayload.summary, Date.now() - t0);

  // Step 2: Business Analysis Agent
  updateStep('business', 'RUNNING', 40, 'Formulating operational model and capacity parameters...');
  await delay(350);
  const t1 = Date.now();
  const businessPayload = runBusinessAgent(input, location);
  updateStep('business', 'COMPLETED', 100, businessPayload.summary, Date.now() - t1);

  // Step 3: Market Intelligence Agent
  updateStep('market', 'RUNNING', 40, 'Evaluating demographic reach, cooperative hubs, and competition index...');
  await delay(350);
  const t2 = Date.now();
  const marketPayload = runMarketAgent(input, location);
  updateStep('market', 'COMPLETED', 100, marketPayload.summary, Date.now() - t2);

  // Step 4: Financial Advisor Agent (Deterministic)
  updateStep('finance', 'RUNNING', 50, 'Executing deterministic financial math formulas and repayment schedules...');
  await delay(400);
  const t3 = Date.now();
  const financePayload = runFinanceAgent(input);
  updateStep('finance', 'COMPLETED', 100, financePayload.summary, Date.now() - t3);

  // Step 5: Scheme Guidance Agent (Rule-based)
  updateStep('scheme', 'RUNNING', 50, 'Matching official government scheme guidelines and calculating subsidies...');
  await delay(350);
  const t4 = Date.now();
  const schemePayload = runSchemeAgent(input, financePayload.data);
  updateStep('scheme', 'COMPLETED', 100, schemePayload.summary, Date.now() - t4);

  // Step 6: Risk Analysis Agent
  updateStep('risk', 'RUNNING', 50, 'Evaluating high/medium/low vulnerabilities and rural mitigations...');
  await delay(350);
  const t5 = Date.now();
  const riskPayload = runRiskAgent(input, location, financePayload.data);
  updateStep('risk', 'COMPLETED', 100, riskPayload.summary, Date.now() - t5);

  // Aggregate all generated evidence records into a master audit log
  const allEvidenceMap = new Map<string, EvidenceRecord>();
  [
    ...evidencePayload.evidenceGenerated,
    ...businessPayload.evidenceGenerated,
    ...marketPayload.evidenceGenerated,
    ...financePayload.evidenceGenerated,
    ...schemePayload.evidenceGenerated,
    ...riskPayload.evidenceGenerated
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
  updateStep('final', 'RUNNING', 70, 'Compiling executive feasibility score and public-service dossier...');
  await delay(400);
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

  const report: CompleteAnalysisReport = {
    reportId: `UDY-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    input,
    location,
    feasibilityVerdict,
    businessAnalysis: businessPayload,
    marketIntelligence: marketPayload,
    financialPlan: financePayload,
    schemeGuidance: schemePayload,
    riskAnalysis: riskPayload,
    evidenceAuditLog,
    aggregatorValidation
  };

  return report;
}
