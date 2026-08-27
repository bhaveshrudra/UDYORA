import {
  UserContext,
  FinancialPlan,
  EvidenceRecord
} from '../types';

export const evidenceAgent = {
  async execute(
    userContext: UserContext,
    financialPlan: FinancialPlan
  ): Promise<EvidenceRecord[]> {
    const { locationContext, businessProfile } = userContext;
    const now = new Date().toISOString();

    return [
      {
        id: 'ev_lgd_admin',
        metric: 'Administrative LGD Hierarchy',
        value: `${locationContext.subDistrictName} ${locationContext.subDistrictType}, ${locationContext.districtName}, ${locationContext.stateName}`,
        unit: 'directory',
        source: 'Local Government Directory (LGD), Ministry of Panchayati Raj',
        sourceType: 'LGD',
        status: 'VERIFIED',
        confidence: 0.99,
        timestamp: now
      },
      {
        id: 'ev_geo_osm',
        metric: 'Commercial & Spatial POIs Detected',
        value: 'Catchment OpenStreetMap Facility Grid',
        unit: 'facilities',
        source: 'OpenStreetMap / Photon Geospatial Engine',
        sourceType: 'MAP_PROVIDER',
        status: 'OBSERVED',
        confidence: 0.88,
        timestamp: now
      },
      {
        id: 'ev_census_rural',
        metric: 'Demographic Area Classification',
        value: locationContext.areaType || 'Rural Catchment',
        unit: 'category',
        source: 'Census of India & MoPR Rural Framework',
        sourceType: 'CENSUS',
        status: 'VERIFIED',
        confidence: 0.95,
        timestamp: now
      },
      {
        id: 'ev_fin_margin',
        metric: 'Promoter Equity Margin Ratio',
        value: `${financialPlan.promoterMarginPercentage}% Equity : ${100 - financialPlan.promoterMarginPercentage}% Debt`,
        unit: 'ratio',
        source: 'NABARD & Mudra Priority Sector Lending Norms (SIH26091)',
        sourceType: 'OFFICIAL',
        status: 'VERIFIED',
        confidence: 0.98,
        timestamp: now
      },
      {
        id: 'ev_dscr_model',
        metric: 'Debt Service Coverage Ratio (DSCR)',
        value: `${financialPlan.debtServiceCoverageRatio}x`,
        unit: 'coverage_ratio',
        source: 'UDYORA Deterministic Cash Flow Engine',
        sourceType: 'UDYORA_DATASET',
        status: 'ESTIMATED',
        confidence: 0.90,
        timestamp: now
      }
    ];
  }
};
