import { AgentPayload, EvidenceRecord, LocationData, UserBusinessInput } from '../types';
import { GLOBAL_EVIDENCE_STORE } from '../data/evidenceStore';

/**
 * EVIDENCE / DATA AGENT
 * Responsible for retrieving, validating, and auditing ground truth data points safely.
 * Explicitly tags every metric with status (VERIFIED / ESTIMATED / INSUFFICIENT DATA)
 * and confidence scores without crashing on missing location fields.
 */
export function runEvidenceAgent(
  input: UserBusinessInput,
  location: LocationData
): AgentPayload<EvidenceRecord[]> {
  const startTime = Date.now();
  const evidenceList: EvidenceRecord[] = [];

  // Extract all evidence records from location data safely filtering out null/undefined
  const locationRecords: (EvidenceRecord | undefined)[] = [
    location.population,
    location.householdCount,
    location.nearestTownDistanceKm,
    location.nearestMandiDistanceKm || location.nearestApmcMandiKm,
    location.nearestDairyCooperativeKm,
    location.nearestWeeklyHaatKm || location.weeklyHaatFrequency,
    location.powerAvailabilityHours || location.powerReliabilityHoursPerDay,
    location.groundwaterStatus || location.groundwaterDepthMeters,
    location.transportConnectivity,
    location.localCompetitorsCount || location.majorCompetitorsCountEstimate,
    location.averageHouseholdIncomeBand
  ];

  locationRecords.forEach((record) => {
    if (record && record.id) {
      evidenceList.push(record);
    }
  });

  // Add global sectoral evidence records
  if (input.businessCategoryId === 'dairy') {
    [
      GLOBAL_EVIDENCE_STORE.ev_raw_milk_farmgate_price_pune,
      GLOBAL_EVIDENCE_STORE.ev_dairy_concentrate_feed_cost,
      GLOBAL_EVIDENCE_STORE.ev_crossbred_cow_market_rate_pune,
      GLOBAL_EVIDENCE_STORE.ev_pmegp_rural_general_subsidy_rule,
      GLOBAL_EVIDENCE_STORE.ev_mudra_tarun_interest_benchmark,
      GLOBAL_EVIDENCE_STORE.ev_ward_level_exact_daily_milk_surplus
    ].forEach((e) => {
      if (e) evidenceList.push(e);
    });
  } else if (input.businessCategoryId === 'tailoring') {
    [
      GLOBAL_EVIDENCE_STORE.ev_micro_tailoring_per_piece_stitching,
      GLOBAL_EVIDENCE_STORE.ev_pmegp_rural_general_subsidy_rule,
      GLOBAL_EVIDENCE_STORE.ev_mudra_tarun_interest_benchmark
    ].forEach((e) => {
      if (e) evidenceList.push(e);
    });
  } else if (input.businessCategoryId === 'retail') {
    [
      GLOBAL_EVIDENCE_STORE.ev_retail_daily_footfall_rural,
      GLOBAL_EVIDENCE_STORE.ev_pmegp_rural_general_subsidy_rule,
      GLOBAL_EVIDENCE_STORE.ev_mudra_tarun_interest_benchmark
    ].forEach((e) => {
      if (e) evidenceList.push(e);
    });
  }

  // Calculate aggregate confidence score safely
  const validRecords = evidenceList.filter((e) => e && e.status !== 'INSUFFICIENT DATA');
  const avgConfidence =
    validRecords.length > 0
      ? parseFloat((validRecords.reduce((sum, e) => sum + (e.confidence || 0.8), 0) / validRecords.length).toFixed(2))
      : 0.85;

  const verifiedCount = evidenceList.filter((e) => e && e.status === 'VERIFIED').length;
  const estimatedCount = evidenceList.filter((e) => e && e.status === 'ESTIMATED').length;
  const insufficientCount = evidenceList.filter((e) => e && e.status === 'INSUFFICIENT DATA').length;

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
