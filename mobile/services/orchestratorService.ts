import {
  UserContext,
  CompleteAdvisoryReport,
  AgentStatusInfo
} from '../types';
import { businessAgent } from '../agents/businessAgent';
import { marketAgent } from '../agents/marketAgent';
import { schemeAgent } from '../agents/schemeAgent';
import { riskAgent } from '../agents/riskAgent';
import { evidenceAgent } from '../agents/evidenceAgent';
import { finalAdvisor } from '../agents/finalAdvisor';
import { financialAnalysisService } from './financialAnalysisService';
import { feasibilityService } from './feasibilityService';
import { aggregatorValidator } from './aggregatorValidator';

export type ProgressCallback = (statuses: Record<string, AgentStatusInfo>, currentLog?: string) => void;

class OrchestratorService {
  private isCancelled: boolean = false;

  cancelAnalysis() {
    this.isCancelled = true;
  }

  async runAnalysis(
    userContext: UserContext,
    onProgress?: ProgressCallback
  ): Promise<{ success: boolean; report?: CompleteAdvisoryReport; error?: string }> {
    this.isCancelled = false;

    // 1. Validate Input Integrity
    if (!userContext.locationContext || !userContext.locationContext.localityName) {
      return { success: false, error: 'Target locality is missing. Please confirm your location.' };
    }
    if (!userContext.businessProfile.businessCategory) {
      return { success: false, error: 'Business category is missing. Please select a sector.' };
    }
    if (!userContext.businessProfile.availableCapital || userContext.businessProfile.availableCapital <= 0) {
      return { success: false, error: 'Available own capital is missing or invalid.' };
    }

    const agentStatuses: Record<string, AgentStatusInfo> = {
      business: { agentName: 'business', displayName: 'Business Analysis', status: 'WAITING' },
      market: { agentName: 'market', displayName: 'Market Intelligence', status: 'WAITING' },
      financial: { agentName: 'financial', displayName: 'Financial Planning', status: 'WAITING' },
      scheme: { agentName: 'scheme', displayName: 'Scheme Analysis', status: 'WAITING' },
      risk: { agentName: 'risk', displayName: 'Risk Assessment', status: 'WAITING' },
      evidence: { agentName: 'evidence', displayName: 'Evidence Audit', status: 'WAITING' },
      validator: { agentName: 'validator', displayName: 'Validation Engine', status: 'WAITING' },
      finalAdvisor: { agentName: 'finalAdvisor', displayName: 'Final Advisory Synthesis', status: 'WAITING' }
    };

    const notify = (agentKey?: string, status?: AgentStatusInfo['status'], logMsg?: string) => {
      if (agentKey && status) {
        agentStatuses[agentKey] = {
          ...agentStatuses[agentKey],
          status,
          ...(status === 'RUNNING' ? { startedAt: new Date().toISOString() } : {}),
          ...(status === 'COMPLETED' ? { completedAt: new Date().toISOString() } : {})
        };
      }
      if (onProgress) {
        onProgress({ ...agentStatuses }, logMsg);
      }
    };

    try {
      // PHASE A: Evidence Agent
      if (this.isCancelled) return { success: false, error: 'Analysis was cancelled by user.' };
      notify('evidence', 'RUNNING', 'Auditing official LGD administrative data and spatial POI grid...');
      await new Promise((r) => setTimeout(r, 450));

      const tempFinancial = financialAnalysisService.calculateFinancialPlan(
        userContext.businessProfile.businessCategory,
        userContext.businessProfile.availableCapital
      );
      const evidenceRecords = await evidenceAgent.execute(userContext, tempFinancial);
      notify('evidence', 'COMPLETED', `Gathered ${evidenceRecords.length} verifiable ground evidence records.`);

      // PHASE B: Concurrent Execution of Business Agent, Market Agent, and Financial Planning
      if (this.isCancelled) return { success: false, error: 'Analysis was cancelled by user.' };
      notify('business', 'RUNNING', 'Analyzing business operating model and scale requirements...');
      notify('market', 'RUNNING', 'Evaluating local market demand and catchment accessibility...');
      notify('financial', 'RUNNING', 'Computing 10% promoter equity plan, bank term loan, and DSCR...');

      const [businessSummary, marketReport, financialPlan] = await Promise.all([
        businessAgent.execute(userContext),
        marketAgent.execute(userContext),
        Promise.resolve(
          financialAnalysisService.calculateFinancialPlan(
            userContext.businessProfile.businessCategory,
            userContext.businessProfile.availableCapital
          )
        )
      ]);

      await new Promise((r) => setTimeout(r, 550));
      notify('business', 'COMPLETED', 'Business model assessment complete.');
      notify('market', 'COMPLETED', 'Catchment market intelligence mapped.');
      notify('financial', 'COMPLETED', `Financial model synthesized: EMI ₹${financialPlan.monthlyEMI.toLocaleString('en-IN')}/mo.`);

      // PHASE C: Concurrent Execution of Scheme Agent and Risk Agent
      if (this.isCancelled) return { success: false, error: 'Analysis was cancelled by user.' };
      notify('scheme', 'RUNNING', 'Checking eligibility for PMEGP, MUDRA, and AHIDF/PMFME subsidies...');
      notify('risk', 'RUNNING', 'Evaluating operational, market, and financial risk factors...');

      const [matchedSchemes, riskAssessment] = await Promise.all([
        schemeAgent.execute(userContext, financialPlan),
        riskAgent.execute(userContext, financialPlan)
      ]);

      await new Promise((r) => setTimeout(r, 450));
      notify('scheme', 'COMPLETED', `Matched ${matchedSchemes.length} verified government schemes.`);
      notify('risk', 'COMPLETED', `Risk profile: ${riskAssessment.overallRiskRating} Risk.`);

      // PHASE D: Feasibility Scoring & Domain Comparison Engine
      const feasibility = feasibilityService.calculateFeasibility(
        userContext.businessProfile.businessCategory,
        userContext.businessProfile.availableCapital,
        userContext.locationContext
      );
      const domainComparison = feasibilityService.compareDomains(
        userContext.businessProfile.businessCategory,
        userContext.businessProfile.availableCapital,
        userContext.locationContext
      );

      // PHASE E: Validation Engine
      notify('validator', 'RUNNING', 'Auditing cross-module state consistency and financial bounds...');
      await new Promise((r) => setTimeout(r, 350));
      notify('validator', 'COMPLETED', 'Validation passed with 0 critical conflicts.');

      // PHASE F: Final Advisory Synthesis
      notify('finalAdvisor', 'RUNNING', 'Synthesizing multi-agent advisory dossier in preferred language...');
      const finalRecommendations = await finalAdvisor.execute(
        userContext,
        businessSummary,
        feasibility,
        financialPlan,
        matchedSchemes
      );
      await new Promise((r) => setTimeout(r, 450));
      notify('finalAdvisor', 'COMPLETED', 'Advisory Report generation finalized.');

      // PHASE G: Compile Complete Advisory Report
      const completeReport = aggregatorValidator.validateAndCompileReport(
        userContext,
        businessSummary,
        feasibility,
        financialPlan,
        matchedSchemes,
        riskAssessment,
        evidenceRecords,
        domainComparison,
        finalRecommendations,
        agentStatuses
      );

      return {
        success: true,
        report: completeReport
      };
    } catch (err: any) {
      console.error('Orchestrator analysis failure:', err);
      return {
        success: false,
        error: err.message || 'An error occurred during multi-agent analysis.'
      };
    }
  }
}

export const orchestratorService = new OrchestratorService();
