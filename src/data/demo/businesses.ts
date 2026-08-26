/**
 * UDYORA Demo Benchmark Business Models Dataset
 * NOTE: Explicitly marked as DEMO BENCHMARK / ESTIMATED for prototype simulation.
 */

export interface DemoBusinessBenchmark {
  categoryId: 'dairy' | 'tailoring' | 'retail' | 'poultry';
  name: string;
  sourceType: 'DEMO';
  dataQuality: 'ESTIMATED';
  typicalInputs: string[];
  costStructure: {
    capexBreakdown: { item: string; pct: number }[];
    opexBreakdown: { item: string; pct: number }[];
  };
  riskFactors: { risk: string; severity: 'HIGH' | 'MEDIUM' | 'LOW'; mitigation: string }[];
  revenueFactors: string[];
  seasonality: string;
  benchmarkRoiPct: number;
}

export const DEMO_BUSINESS_BENCHMARKS: DemoBusinessBenchmark[] = [
  {
    categoryId: 'dairy',
    name: 'Dairy Farming & Milk Supply',
    sourceType: 'DEMO',
    dataQuality: 'ESTIMATED',
    typicalInputs: ['Crossbred Milch Cows / Murrah Buffaloes', 'Cattle Feed & Silage', 'Milking Equipment', 'Biosecurity & Shed'],
    costStructure: {
      capexBreakdown: [
        { item: 'Livestock Acquisition (8-10 animals)', pct: 60 },
        { item: 'Shed Construction & Ventilation', pct: 25 },
        { item: 'Chilling & Milking Equipment', pct: 15 }
      ],
      opexBreakdown: [
        { item: 'Green/Dry Fodder & Concentrate', pct: 65 },
        { item: 'Veterinary & Vaccination', pct: 15 },
        { item: 'Labor & Utilities', pct: 20 }
      ]
    },
    riskFactors: [
      { risk: 'Feed Cost Volatility', severity: 'HIGH', mitigation: 'Form local fodder agreements and prepare seasonal silage reserves.' },
      { risk: 'Livestock Morbidity & Mastitis', severity: 'MEDIUM', mitigation: 'Strict hygiene protocols, bi-weekly vet audits, and comprehensive livestock insurance.' },
      { risk: 'Milk Price Fluctuation', severity: 'MEDIUM', mitigation: 'Secure formal offtake contracts with local dairy cooperatives.' }
    ],
    revenueFactors: ['Daily milk collection fat/SNF testing', 'Ghee & curd value-addition', 'Organic manure byproduct sales'],
    seasonality: 'Flush season (Oct-Feb) yields higher volumes; lean season (Apr-Jun) yields higher prices.',
    benchmarkRoiPct: 24.5
  },
  {
    categoryId: 'tailoring',
    name: 'Custom Tailoring & Apparel Workshop',
    sourceType: 'DEMO',
    dataQuality: 'ESTIMATED',
    typicalInputs: ['High-Speed Industrial Sewing Machines', 'Interlock & Overlock Units', 'Fabric Stock', 'Cutting Tables'],
    costStructure: {
      capexBreakdown: [
        { item: 'Sewing & Hemming Machinery', pct: 55 },
        { item: 'Shop Fitout & Cutting Tables', pct: 25 },
        { item: 'Initial Fabric & Thread Inventory', pct: 20 }
      ],
      opexBreakdown: [
        { item: 'Raw Materials & Trims', pct: 45 },
        { item: 'Rent & Electricity', pct: 30 },
        { item: 'Operator Wages', pct: 25 }
      ]
    },
    riskFactors: [
      { risk: 'Fashion Trend Shift & Dead Stock', severity: 'MEDIUM', mitigation: 'Maintain low customized inventory with on-demand pre-orders.' },
      { risk: 'Skilled Stitcher Churn', severity: 'MEDIUM', mitigation: 'Offer piece-rate incentives and structured apprentice training.' },
      { risk: 'Seasonal Festival Demand Spikes', severity: 'LOW', mitigation: 'Schedule advance booking for festive and wedding seasons.' }
    ],
    revenueFactors: ['Custom bridal & festive attire', 'School & work uniform contracts', 'Alteration & repair services'],
    seasonality: 'High festive surge during Diwali, Pongal, Eid, and wedding months.',
    benchmarkRoiPct: 28.0
  },
  {
    categoryId: 'retail',
    name: 'Rural Kirana & Daily Needs Store',
    sourceType: 'DEMO',
    dataQuality: 'ESTIMATED',
    typicalInputs: ['Modular Shelving & Display Racks', 'Deep Freezers for Dairy/Beverages', 'Initial Fast-Moving Stock', 'POS Billing Device'],
    costStructure: {
      capexBreakdown: [
        { item: 'Initial FMCG & Staple Stock', pct: 60 },
        { item: 'Shelving & Counter Fitout', pct: 25 },
        { item: 'Refrigeration & Digital POS', pct: 15 }
      ],
      opexBreakdown: [
        { item: 'Inventory Replenishment', pct: 75 },
        { item: 'Store Rent & Power', pct: 18 },
        { item: 'Logistics / Transport', pct: 7 }
      ]
    },
    riskFactors: [
      { risk: 'Customer Credit / Khata Default', severity: 'HIGH', mitigation: 'Enforce strict 7-day credit caps and incentivize UPI/digital payments.' },
      { risk: 'Perishable Goods Spoilage', severity: 'MEDIUM', mitigation: 'Implement strict FIFO inventory management with low batch reordering.' },
      { risk: 'Supermarket / Wholesale Competition', severity: 'MEDIUM', mitigation: 'Focus on hyper-local convenience and doorstep delivery.' }
    ],
    revenueFactors: ['Daily staple commodities', 'Packaged dairy & beverages', 'Mobile recharges & utility agency'],
    seasonality: 'Consistent baseline year-round with festive spending surges.',
    benchmarkRoiPct: 22.0
  },
  {
    categoryId: 'poultry',
    name: 'Broiler & Layer Poultry Farm',
    sourceType: 'DEMO',
    dataQuality: 'ESTIMATED',
    typicalInputs: ['Day-Old Chicks (DOC)', 'Poultry Feed & Concentrates', 'Brooding & Climate Control Shed', 'Vaccines & Sanitizers'],
    costStructure: {
      capexBreakdown: [
        { item: 'Shed Construction & Nipple Drinkers', pct: 50 },
        { item: 'Automated Feeders & Brooders', pct: 30 },
        { item: 'Water Filtration & Generator Backup', pct: 20 }
      ],
      opexBreakdown: [
        { item: 'Poultry Feed', pct: 70 },
        { item: 'Chicks Procurement', pct: 15 },
        { item: 'Medicines & Labor', pct: 15 }
      ]
    },
    riskFactors: [
      { risk: 'Avian Influenza / Disease Outbreak', severity: 'HIGH', mitigation: 'Biosecurity fencing, foot-baths, and scheduled vaccination protocol.' },
      { risk: 'Feed Price Surge', severity: 'HIGH', mitigation: 'Long-term forward procurement of maize and soya meal.' },
      { risk: 'Heat Stress Mortality in Summer', severity: 'MEDIUM', mitigation: 'Install roof foggers and evaporative cooling pads.' }
    ],
    revenueFactors: ['Broiler meat bird sales to wholesale aggregators', 'Egg batch sales', 'Poultry litter fertilizer sales'],
    seasonality: 'High winter demand; reduced consumption during specific festive fasting periods.',
    benchmarkRoiPct: 26.0
  }
];
