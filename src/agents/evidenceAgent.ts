import { AgentPayload, EvidenceRecord, LocationData, UserBusinessInput } from '../types';
import { GLOBAL_EVIDENCE_STORE } from '../data/evidenceStore';

/**
 * EVIDENCE / DATA AGENT
 * Responsible for retrieving, validating, and auditing ground truth data points.
 * Explicitly tags every metric with status (VERIFIED / ESTIMATED / INSUFFICIENT DATA)
 * and confidence scores.
 */
export function runEvidenceAgent(
  input: UserBusinessInput,
  location: LocationData
): AgentPayload<EvidenceRecord[]> {
  const startTime = Date.now();
  const evidenceList: EvidenceRecord[] = [];

  // Extract all evidence records from location data
  const locationRecords: EvidenceRecord[] = [
    location.population,
    location.householdCount,
    location.nearestTownDistanceKm,
    location.nearestMandiDistanceKm,
    location.nearestDairyCooperativeKm,
    location.weeklyHaatFrequency,
    location.powerAvailabilityHours,
    location.groundwaterStatus,
    location.transportConnectivity,
    location.localCompetitorsCount,
    location.averageHouseholdIncomeBand
  ];

  evidenceList.push(...locationRecords);

  // Add global sectoral evidence records
  if (input.businessCategoryId === 'dairy') {
    evidenceList.push(
      GLOBAL_EVIDENCE_STORE.ev_raw_milk_farmgate_price_pune,
      GLOBAL_EVIDENCE_STORE.ev_dairy_concentrate_feed_cost,
      GLOBAL_EVIDENCE_STORE.ev_crossbred_cow_market_rate_pune,
      GLOBAL_EVIDENCE_STORE.ev_pmegp_rural_general_subsidy_rule,
      GLOBAL_EVIDENCE_STORE.ev_mudra_tarun_interest_benchmark,
      GLOBAL_EVIDENCE_STORE.ev_ward_level_exact_daily_milk_surplus
    );
  } else if (input.businessCategoryId === 'tailoring') {
    evidenceList.push(
      GLOBAL_EVIDENCE_STORE.ev_micro_tailoring_per_piece_stitching,
      GLOBAL_EVIDENCE_STORE.ev_pmegp_rural_general_subsidy_rule,
      GLOBAL_EVIDENCE_STORE.ev_mudra_tarun_interest_benchmark
    );
  } else if (input.businessCategoryId === 'retail') {
    evidenceList.push(
      GLOBAL_EVIDENCE_STORE.ev_retail_daily_footfall_rural,
      GLOBAL_EVIDENCE_STORE.ev_pmegp_rural_general_subsidy_rule,
      GLOBAL_EVIDENCE_STORE.ev_mudra_tarun_interest_benchmark
    );
  }

  // Calculate aggregate confidence score
  const validRecords = evidenceList.filter((e) => e.status !== 'INSUFFICIENT DATA');
  const avgConfidence =
    validRecords.length > 0
      ? parseFloat((validRecords.reduce((sum, e) => sum + e.confidence, 0) / validRecords.length).toFixed(2))
      : 0.5;

  const verifiedCount = evidenceList.filter((e) => e.status === 'VERIFIED').length;
  const estimatedCount = evidenceList.filter((e) => e.status === 'ESTIMATED').length;
  const insufficientCount = evidenceList.filter((e) => e.status === 'INSUFFICIENT DATA').length;

  return {
    agentName: 'Evidence / Data Integrity Agent',
    status: 'SUCCESS',
    executionTimeMs: Date.now() - startTime,
    dataQuality: verifiedCount > estimatedCount ? 'VERIFIED' : 'ESTIMATED',
    overallConfidence: avgConfidence,
    summary: `Audited ${evidenceList.length} evidence metrics (${verifiedCount} Verified, ${estimatedCount} Estimated, ${insufficientCount} Insufficient Data).`,
    data: evidenceList,
    evidenceGenerated: evidenceList
  };
}
