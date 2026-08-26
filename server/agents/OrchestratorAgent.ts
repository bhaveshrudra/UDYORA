import { ai, DEFAULT_GEMINI_MODEL } from '../config/gemini.js';
import { IntakeAgent } from './IntakeAgent.js';
import { FinancialEngineAgent } from './FinancialEngineAgent.js';
import { RiskAssessmentAgent } from './RiskAssessmentAgent.js';
import { SchemeMatchingAgent } from './SchemeMatchingAgent.js';
import {
  BusinessProfile,
  FinalSynthesisReport,
  PipelineContext,
  AgentOutput,
  ActionableStep,
  ExecutiveSummary,
} from '../types.js';

/**
 * OrchestratorAgent
 * 
 * Coordinates the full multi-agent analysis pipeline:
 * Step 1: Intake validation / profile completion
 * Step 2: Financial Engine deterministic calculations (Break-even, Cash flow, Safe loan capacity)
 * Step 3: Risk Assessment & stress testing (Viability score, lean season resilience)
 * Step 4: Government Scheme matching & subsidy optimization
 * Step 5: Final synthesis & actionable report generation with Gemini AI
 */
export class OrchestratorAgent {
  private intakeAgent: IntakeAgent;
  private financialEngineAgent: FinancialEngineAgent;
  private riskAssessmentAgent: RiskAssessmentAgent;
  private schemeMatchingAgent: SchemeMatchingAgent;
  private modelName: string;

  constructor(modelName = DEFAULT_GEMINI_MODEL) {
    this.modelName = modelName;
    this.intakeAgent = new IntakeAgent(modelName);
    this.financialEngineAgent = new FinancialEngineAgent();
    this.riskAssessmentAgent = new RiskAssessmentAgent(modelName);
    this.schemeMatchingAgent = new SchemeMatchingAgent(modelName);
  }

  /**
   * Runs the complete end-to-end UDYORA pipeline in sequence
   */
  public async runPipeline(
    profileInput: BusinessProfile
  ): Promise<AgentOutput<FinalSynthesisReport>> {
    const pipelineStartTime = Date.now();
    const agentExecutionNotes: string[] = [];

    try {
      // ----------------------------------------------------
      // Step 1: Profile Validation / Intake Verification
      // ----------------------------------------------------
      const completeness = this.intakeAgent.evaluateCompleteness(profileInput);
      if (!completeness.isComplete) {
        agentExecutionNotes.push(
          `Intake Warning: Profile is missing fields: ${completeness.missingFields.join(', ')}`
        );
      } else {
        agentExecutionNotes.push('Step 1 [Intake]: Profile verification passed 100%.');
      }

      // ----------------------------------------------------
      // Step 2: Financial Engine Execution (Deterministic)
      // ----------------------------------------------------
      const financialResult = await this.financialEngineAgent.runFinancialEngine(profileInput);
      if (!financialResult.success) {
        throw new Error(`FinancialEngineAgent failed: ${financialResult.errors?.join('; ')}`);
      }
      agentExecutionNotes.push(
        `Step 2 [FinancialEngine]: Safe Loan Limit = ₹${financialResult.data.loanCapacity.recommendedSafeLoanAmount.toLocaleString('en-IN')}`
      );

      // ----------------------------------------------------
      // Step 3: Risk Assessment & Stress Testing
      // ----------------------------------------------------
      const riskResult = await this.riskAssessmentAgent.assessRisk(profileInput, financialResult.data);
      if (!riskResult.success) {
        throw new Error(`RiskAssessmentAgent failed: ${riskResult.errors?.join('; ')}`);
      }
      agentExecutionNotes.push(
        `Step 3 [RiskAssessment]: Viability Score = ${riskResult.data.viabilityScore}/100 (${riskResult.data.viabilityTier})`
      );

      // ----------------------------------------------------
      // Step 4: Government Scheme Matching
      // ----------------------------------------------------
      const schemeResult = await this.schemeMatchingAgent.matchSchemes(
        profileInput,
        financialResult.data,
        riskResult.data
      );
      if (!schemeResult.success) {
        throw new Error(`SchemeMatchingAgent failed: ${schemeResult.errors?.join('; ')}`);
      }
      agentExecutionNotes.push(
        `Step 4 [SchemeMatching]: Top Scheme = ${schemeResult.data.topRecommendedScheme?.schemeName || 'None'}`
      );

      // ----------------------------------------------------
      // Step 5: Final Synthesis & Actionable Report Generation
      // ----------------------------------------------------
      const finalReport = await this.synthesizeFinalReport(
        profileInput,
        financialResult.data,
        riskResult.data,
        schemeResult.data
      );
      agentExecutionNotes.push('Step 5 [Synthesis]: Generated final comprehensive advisory report.');

      return {
        agentName: 'OrchestratorAgent',
        success: true,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - pipelineStartTime,
        data: finalReport,
        agentNotes: agentExecutionNotes,
      };
    } catch (error: any) {
      return {
        agentName: 'OrchestratorAgent',
        success: false,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - pipelineStartTime,
        data: {} as FinalSynthesisReport,
        errors: [error.message || 'Pipeline execution failure'],
        agentNotes: agentExecutionNotes,
      };
    }
  }

  /**
   * Synthesizes all multi-agent outputs into a coherent, structured, rural-entrepreneur-friendly report
   */
  private async synthesizeFinalReport(
    profile: BusinessProfile,
    financial: any,
    risk: any,
    schemes: any
  ): Promise<FinalSynthesisReport> {
    // Determine overall health verdict
    let businessHealthVerdict: ExecutiveSummary['businessHealthVerdict'] = 'STABLE_GROWTH';
    if (risk.viabilityScore >= 75) businessHealthVerdict = 'EXCELLENT';
    else if (risk.viabilityScore >= 55) businessHealthVerdict = 'STABLE_GROWTH';
    else if (risk.viabilityScore >= 35) businessHealthVerdict = 'PROCEED_WITH_CAUTION';
    else businessHealthVerdict = 'HIGH_RISK_RESTRUCTURE_NEEDED';

    const executiveSummary: ExecutiveSummary = {
      headline: `${profile.businessName} shows ${businessHealthVerdict.replace(/_/g, ' ')} with sustainable loan headroom.`,
      businessHealthVerdict,
      safeLoanLimitFormatted: `₹${financial.loanCapacity.recommendedSafeLoanAmount.toLocaleString('en-IN')}`,
      topSchemeRecommendation: schemes.topRecommendedScheme?.schemeName || 'Pradhan Mantri MUDRA Yojana',
      keyActionItem: 'Apply for collateral-free MUDRA Kishor loan to retire informal moneylender debt and expand inventory.',
    };

    const actionableRoadmap: ActionableStep[] = [
      {
        stepNumber: 1,
        title: 'Clear or Refinance Informal Moneylender Debt',
        description: 'Use the initial disbursement of the formal loan to immediately clear high-interest informal loans (36% p.a.), instantly saving monthly cash flow.',
        priority: 'immediate',
        targetEntity: 'Self',
      },
      {
        stepNumber: 2,
        title: 'Assemble Document Pack at Local CSC / Jan Seva Kendra',
        description: 'Visit the nearest Common Service Centre with Aadhaar, electricity bill, and bank passbook to prepare the online application.',
        priority: 'immediate',
        targetEntity: 'CSC_Center',
      },
      {
        stepNumber: 3,
        title: 'Submit Formal MUDRA Application at Local Bank Branch',
        description: `Submit application for ₹${financial.loanCapacity.recommendedSafeLoanAmount.toLocaleString('en-IN')} with 36 months tenure at an estimated EMI of ₹${financial.loanCapacity.recommendedMaxMonthlyEMI.toLocaleString('en-IN')}.`,
        priority: 'short_term',
        targetEntity: 'Bank',
      },
      {
        stepNumber: 4,
        title: 'Establish 2-Month Lean Season Cash Reserve',
        description: 'During upcoming peak festival months, reserve ₹15,000 monthly in a recurring deposit to cover monsoon lean period obligations.',
        priority: 'long_term',
        targetEntity: 'Bank',
      },
    ];

    // TODO: Use Gemini API to personalize the bilingual counselor explanation based on location and business dialect
    const counselorExplanation = `Aapka vyapaar ${profile.yearsInOperation} saal se accha chal raha hai. Aapki monthly surakshit loan lene ki kshamta lagbhag ₹${financial.loanCapacity.recommendedSafeLoanAmount.toLocaleString('en-IN')} hai, jiski maahik kist (EMI) lagbhag ₹${financial.loanCapacity.recommendedMaxMonthlyEMI.toLocaleString('en-IN')} aayegi. MUDRA Kishor yojana ke tehat bina kisi collateral (zamaanat) ke aap is loan ke liye aavedan kar sakte hain.`;

    return {
      reportId: `UDY-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      entrepreneur: {
        name: profile.entrepreneurName,
        businessName: profile.businessName,
        category: profile.businessCategory,
        location: `${profile.location.villageOrTown}, ${profile.location.district}, ${profile.location.state}`,
      },
      executiveSummary,
      businessProfileSnapshot: profile,
      financialMetrics: financial,
      riskAssessment: risk,
      matchedSchemes: schemes,
      actionableRoadmap,
      counselorExplanationHindiEnglish: counselorExplanation,
    };
  }

  // Accessors for individual agents if invoked standalone
  public getIntakeAgent(): IntakeAgent {
    return this.intakeAgent;
  }
  public getFinancialEngineAgent(): FinancialEngineAgent {
    return this.financialEngineAgent;
  }
  public getRiskAssessmentAgent(): RiskAssessmentAgent {
    return this.riskAssessmentAgent;
  }
  public getSchemeMatchingAgent(): SchemeMatchingAgent {
    return this.schemeMatchingAgent;
  }
}
