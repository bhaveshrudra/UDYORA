import { OrchestratorAgent } from './agents/OrchestratorAgent.js';
import {
  BusinessProfile,
  FinalSynthesisReport,
  AgentOutput,
} from './types.js';

/**
 * Singleton Orchestrator instance
 */
export const defaultOrchestrator = new OrchestratorAgent();

/**
 * Main execution function to run the full multi-agent pipeline in sequence:
 * 1. Intake Profile Check
 * 2. Financial Engine (Deterministic Calculations)
 * 3. Risk Assessment & Stress Testing
 * 4. Scheme Matching & Subsidy Optimization
 * 5. Final Synthesis & Plain-Language Advisory Report
 *
 * @param profile - The structured BusinessProfile to analyze
 * @returns Promise<AgentOutput<FinalSynthesisReport>>
 */
export async function runUdyoraPipeline(
  profile: BusinessProfile
): Promise<AgentOutput<FinalSynthesisReport>> {
  return await defaultOrchestrator.runPipeline(profile);
}

// Re-export agent classes and orchestrator
export { OrchestratorAgent };
export { IntakeAgent } from './agents/IntakeAgent.js';
export { FinancialEngineAgent } from './agents/FinancialEngineAgent.js';
export { RiskAssessmentAgent } from './agents/RiskAssessmentAgent.js';
export { SchemeMatchingAgent } from './agents/SchemeMatchingAgent.js';
export * from './types.js';
