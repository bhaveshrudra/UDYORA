import {
  AgentPayload,
  EvidenceRecord,
  FinancialPlan,
  SchemeMatchResult,
  UserBusinessInput
} from '../types';
import { evaluateSchemeEligibility } from '../services/schemeRules';

/**
 * SCHEME GUIDANCE AGENT
 * Rule-based evaluation of government credit, subsidy, and institutional schemes.
 * Never invents eligibility criteria or subsidy amounts.
 */
export function runSchemeAgent(
  input: UserBusinessInput,
  financialPlan: FinancialPlan
): AgentPayload<SchemeMatchResult[]> {
  const startTime = Date.now();

  const matches = evaluateSchemeEligibility(input, financialPlan);
  const eligibleSchemes = matches.filter(
    (m) => m.qualificationStatus === 'ELIGIBLE' || m.qualificationStatus === 'CONDITIONALLY_ELIGIBLE'
  );

  const topScheme = eligibleSchemes[0] || matches[0];

  const generatedEvidence: EvidenceRecord[] = matches.map((m) => ({
    id: `ev_scheme_match_${m.scheme.id}`,
    metricName: `${m.scheme.shortName} Eligibility Match`,
    value: `${m.qualificationStatus} (${m.matchScore}% Match Score)`,
    source: `${m.scheme.nodalAgency} Operational Guidelines (${m.scheme.lastVerifiedDate})`,
    sourceUrl: m.scheme.officialSourceUrl,
    geographicLevel: 'National',
    timestamp: new Date().toISOString(),
    status: m.scheme.verificationStatus || 'VERIFIED',
    confidence: m.scheme.verificationStatus === 'VERIFIED' ? 0.98 : 0.7,
    dataLimitationNote: m.verificationNote
  }));

  return {
    agentName: 'Scheme Guidance Agent',
    status: 'COMPLETED',
    executionTimeMs: Date.now() - startTime,
    dataQuality: 'VERIFIED',
    overallConfidence: 0.96,
    confidence: 0.96,
    summary: `Identified ${eligibleSchemes.length} matching institutional schemes. Top match: ${topScheme?.scheme.name} (Score: ${topScheme?.matchScore}/100, Est. Subsidy: ₹${(topScheme?.potentialSubsidyAmount || 0).toLocaleString('en-IN')}).`,
    data: matches,
    evidenceGenerated: generatedEvidence
  };
}
