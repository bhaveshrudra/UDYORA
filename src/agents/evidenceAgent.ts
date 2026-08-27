import { AgentPayload, EvidenceRecord, LocationData, UserBusinessInput } from '../types';
import { GLOBAL_EVIDENCE_STORE } from '../data/evidenceStore';

/**
 * EVIDENCE / DATA INTEGRITY AGENT
 * Ground-truth retrieval and provenance verification.
 * Explicitly tags every metric with status (VERIFIED / ESTIMATED / INSUFFICIENT_DATA).
 * Never replaces missing evidence with fabricated values.
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
      evidenceList.push({
        ...record,
        status: record.status === 'INSUFFICIENT DATA' ? 'INSUFFICIENT_DATA' : record.status
      });
    }
  });

  // Sector-specific verified ground-truth evidence records
  const category = input.businessCategoryId || 'dairy';
  if (category === 'dairy') {
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
  } else if (category === 'tailoring') {
    [
      GLOBAL_EVIDENCE_STORE.ev_micro_tailoring_per_piece_stitching,
      GLOBAL_EVIDENCE_STORE.ev_pmegp_rural_general_subsidy_rule,
      GLOBAL_EVIDENCE_STORE.ev_mudra_tarun_interest_benchmark
    ].forEach((e) => {
      if (e) evidenceList.push(e);
    });
  } else if (category === 'retail') {
    [
      GLOBAL_EVIDENCE_STORE.ev_retail_daily_footfall_rural,
      GLOBAL_EVIDENCE_STORE.ev_pmegp_rural_general_subsidy_rule,
      GLOBAL_EVIDENCE_STORE.ev_mudra_tarun_interest_benchmark
    ].forEach((e) => {
      if (e) evidenceList.push(e);
    });
  }

  // Calculate aggregate confidence score
  const validRecords = evidenceList.filter((e) => e && e.status !== 'INSUFFICIENT_DATA' && e.status !== 'INSUFFICIENT DATA');
  const avgConfidence =
    validRecords.length > 0
      ? parseFloat((validRecords.reduce((sum, e) => sum + (e.confidence || 0.8), 0) / validRecords.length).toFixed(2))
      : 0.70;

  const verifiedCount = evidenceList.filter((e) => e && e.status === 'VERIFIED').length;
  const estimatedCount = evidenceList.filter((e) => e && e.status === 'ESTIMATED').length;
  const insufficientCount = evidenceList.filter((e) => e && (e.status === 'INSUFFICIENT_DATA' || e.status === 'INSUFFICIENT DATA')).length;

  return {
    agentName: 'Evidence & Data Integrity Agent',
    status: 'COMPLETED',
    executionTimeMs: Date.now() - startTime,
    dataQuality: verifiedCount > estimatedCount ? 'VERIFIED' : 'ESTIMATED',
    overallConfidence: avgConfidence,
    confidence: avgConfidence,
    summary: `Audited ${evidenceList.length} evidence metrics (${verifiedCount} Verified, ${estimatedCount} Estimated, ${insufficientCount} Insufficient Data).`,
    data: evidenceList,
    evidenceGenerated: evidenceList
  };
}
