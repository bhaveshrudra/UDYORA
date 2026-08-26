/**
 * UDYORA Demo Benchmark Market Indicators Dataset
 * NOTE: Explicitly marked as DEMO BENCHMARK / ESTIMATED for prototype simulation.
 */

export interface DemoMarketIndicator {
  sector: string;
  metric: string;
  value: number | string;
  unit: string;
  sourceType: 'DEMO';
  dataQuality: 'ESTIMATED';
  confidence: number;
  description: string;
}

export const DEMO_MARKET_INDICATORS: DemoMarketIndicator[] = [
  {
    sector: 'dairy',
    metric: 'Daily Rural Household Milk Consumption Benchmark',
    value: 1.8,
    unit: 'liters/day/household',
    sourceType: 'DEMO',
    dataQuality: 'ESTIMATED',
    confidence: 0.76,
    description: 'Estimated average household fluid milk intake in peri-rural clusters.'
  },
  {
    sector: 'dairy',
    metric: 'Cooperative Procurement Price Floor',
    value: 36.5,
    unit: '₹/liter (3.5% Fat / 8.5% SNF)',
    sourceType: 'DEMO',
    dataQuality: 'ESTIMATED',
    confidence: 0.82,
    description: 'Baseline organized cooperative procurement rate for buffalo/cow blend.'
  },
  {
    sector: 'tailoring',
    metric: 'Monthly Apparel Stitching Demand Index',
    value: 140,
    unit: 'garments/month/1000 population',
    sourceType: 'DEMO',
    dataQuality: 'ESTIMATED',
    confidence: 0.71,
    description: 'Estimated standard alteration and stitching order density.'
  },
  {
    sector: 'retail',
    metric: 'Average Rural Grocery Basket Value',
    value: 320,
    unit: '₹/visit',
    sourceType: 'DEMO',
    dataQuality: 'ESTIMATED',
    confidence: 0.74,
    description: 'Average ticket size for daily grocery and staple purchases.'
  }
];
