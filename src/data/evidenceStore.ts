import { EvidenceRecord } from '../types';

export const GLOBAL_EVIDENCE_STORE: Record<string, EvidenceRecord> = {
  ev_raw_milk_farmgate_price_pune: {
    id: 'ev_raw_milk_farmgate_price_pune',
    metricName: 'Farmgate Buffalo/Cow Milk Procurement Price (Pune District)',
    value: '₹37.50 - ₹43.00 per Litre (Fat 4.0 / SNF 8.5 benchmark)',
    unit: '₹/Litre',
    source: 'Maharashtra State Cooperative Milk Federation (Mahanand / Katraj Price Circular)',
    sourceUrl: 'https://katrajdairy.com',
    geographicLevel: 'District',
    timestamp: '2024-07-01T00:00:00Z',
    status: 'VERIFIED',
    confidence: 0.96,
    dataLimitationNote: 'Subject to quarterly price review by district cooperative board.'
  },
  ev_dairy_concentrate_feed_cost: {
    id: 'ev_dairy_concentrate_feed_cost',
    metricName: 'Commercial Cattle Feed (20% CP) Wholesale Price',
    value: '₹24.00 - ₹27.50 per kg',
    unit: '₹/kg',
    source: 'National Dairy Development Board (NDDB Feed Price Monitor)',
    sourceUrl: 'https://www.nddb.coop',
    geographicLevel: 'State',
    timestamp: '2024-06-15T00:00:00Z',
    status: 'VERIFIED',
    confidence: 0.94
  },
  ev_crossbred_cow_market_rate_pune: {
    id: 'ev_crossbred_cow_market_rate_pune',
    metricName: 'Average Market Purchase Rate of 2nd Lactation Crossbred Cow',
    value: '₹60,000 - ₹72,000 per animal',
    unit: '₹/animal',
    source: 'Loni Kalbhor & Saswad Cattle Bazaar APMC Price Transactions',
    geographicLevel: 'Block',
    timestamp: '2024-05-20T00:00:00Z',
    status: 'VERIFIED',
    confidence: 0.91
  },
  ev_pmegp_rural_general_subsidy_rule: {
    id: 'ev_pmegp_rural_general_subsidy_rule',
    metricName: 'PMEGP Rural Area General Category Margin Money Subsidy Rate',
    value: '25% of Total Admissible Project Cost',
    unit: '%',
    source: 'Ministry of MSME PMEGP Scheme Operational Guidelines',
    sourceUrl: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',
    geographicLevel: 'National',
    timestamp: '2026-01-15T00:00:00Z',
    status: 'VERIFIED',
    confidence: 1.0
  },
  ev_pmegp_rural_special_subsidy_rule: {
    id: 'ev_pmegp_rural_special_subsidy_rule',
    metricName: 'PMEGP Rural Area Special Category (SC/ST/OBC/Women) Margin Money Subsidy Rate',
    value: '35% of Total Admissible Project Cost',
    unit: '%',
    source: 'Ministry of MSME PMEGP Scheme Operational Guidelines',
    sourceUrl: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',
    geographicLevel: 'National',
    timestamp: '2026-01-15T00:00:00Z',
    status: 'VERIFIED',
    confidence: 1.0
  },
  ev_mudra_tarun_interest_benchmark: {
    id: 'ev_mudra_tarun_interest_benchmark',
    metricName: 'Public Sector Bank Weighted Average Micro-Loan Lending Rate (MUDRA Tarun)',
    value: '9.25% - 10.50% per annum',
    unit: '% p.a.',
    source: 'Reserve Bank of India (RBI) Financial Inclusion & Credit Report',
    sourceUrl: 'https://www.rbi.org.in',
    geographicLevel: 'National',
    timestamp: '2024-06-30T00:00:00Z',
    status: 'VERIFIED',
    confidence: 0.95
  },
  ev_micro_tailoring_per_piece_stitching: {
    id: 'ev_micro_tailoring_per_piece_stitching',
    metricName: 'Average Rural Blouse/Kurti Custom Stitching Rate',
    value: '₹220 - ₹450 per unit',
    unit: '₹/garment',
    source: 'Local Block Chamber of Rural Artisans Sampling Survey',
    geographicLevel: 'Block',
    timestamp: '2024-04-01T00:00:00Z',
    status: 'ESTIMATED',
    confidence: 0.76
  },
  ev_retail_daily_footfall_rural: {
    id: 'ev_retail_daily_footfall_rural',
    metricName: 'Estimated Daily Customer Footfall for Main Village Road Kirana',
    value: '85 - 140 visits/day',
    unit: 'visits/day',
    source: 'Retail Association of India (Rural Chapter Sample Study)',
    geographicLevel: 'State',
    timestamp: '2023-11-15T00:00:00Z',
    status: 'ESTIMATED',
    confidence: 0.69
  },
  ev_unregistered_informal_lending_rate: {
    id: 'ev_unregistered_informal_lending_rate',
    metricName: 'Local Informal Village Moneylender Monthly Interest Rate',
    value: '2.5% - 4.0% per month (30% - 48% annualized)',
    unit: '%/month',
    source: 'NABARD All India Rural Financial Inclusion Survey',
    sourceUrl: 'https://www.nabard.org',
    geographicLevel: 'State',
    timestamp: '2023-08-01T00:00:00Z',
    status: 'ESTIMATED',
    confidence: 0.82,
    dataLimitationNote: 'Highlights urgent necessity of formal institutional banking credit.'
  },
  ev_hyperlocal_consumer_brand_elasticity: {
    id: 'ev_hyperlocal_consumer_brand_elasticity',
    metricName: 'Micro-Village Packaged Dairy vs Loose Fresh Milk Brand Loyalty',
    value: 'INSUFFICIENT DATA',
    source: 'No verified field survey available for specific village ward',
    geographicLevel: 'Village',
    timestamp: '2026-01-01T00:00:00Z',
    status: 'INSUFFICIENT DATA',
    confidence: 0.0,
    dataLimitationNote: 'Requires primary ground survey of village tea-shops and households.'
  },
  ev_ward_level_exact_daily_milk_surplus: {
    id: 'ev_ward_level_exact_daily_milk_surplus',
    metricName: 'Village Sub-Ward Unsold Liquid Milk Volume Surplus',
    value: 'INSUFFICIENT DATA',
    source: 'No localized dairy IoT / telemetry installed in village collection center',
    geographicLevel: 'Village',
    timestamp: '2026-01-01T00:00:00Z',
    status: 'INSUFFICIENT DATA',
    confidence: 0.0,
    dataLimitationNote: 'Field collection centers aggregate at village level without sub-ward telemetry.'
  }
};
