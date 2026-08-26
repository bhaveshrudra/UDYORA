import { BusinessTemplate } from '../types';

export const BUSINESS_TEMPLATES: Record<string, BusinessTemplate> = {
  dairy: {
    categoryId: 'dairy',
    categoryName: 'Dairy Farming & Milk Supply Unit',
    typicalName: 'Commercial Micro Dairy Unit (8-10 Animals)',
    standardMarginRatio: 0.10, // 10% promoter contribution
    baseCapExRatio: 0.75, // 75% Capital Expenditure
    baseWorkingCapitalRatio: 0.25, // 25% Initial Working Capital Reserve
    defaultCostComponents: [
      {
        name: 'High-Yielding Milking Animals (8-10 Crossbred / Murrah)',
        category: 'CAPEX',
        estimatedCost: 520000,
        unitCount: 8,
        unitPrice: 65000,
        description: 'Purchase of healthy, vaccinated 2nd/3rd lactation cows with yield 12-15 L/day',
        isEssential: true
      },
      {
        name: 'Semi-Pucca Cattle Shed with Feeding Manger & Drainage',
        category: 'CAPEX',
        estimatedCost: 140000,
        description: 'Ventilated shed structure (approx 1,200 sq ft) with rubber matting and water troughs',
        isEssential: true
      },
      {
        name: 'Automatic Milking Machine & SS Milk Collection Cans',
        category: 'CAPEX',
        estimatedCost: 50000,
        description: 'Twin-bucket portable milking machine and 304 food-grade stainless steel cans',
        isEssential: true
      },
      {
        name: 'Motorized Chaff Cutter (3 HP) & Waste Slurry Handling',
        category: 'CAPEX',
        estimatedCost: 40000,
        description: 'Heavy duty fodder cutter for efficient feeding and reduced waste',
        isEssential: true
      },
      {
        name: 'Initial 3-Month Cattle Feed & Dry/Green Fodder Stock',
        category: 'WORKING_CAPITAL',
        estimatedCost: 150000,
        description: 'Concentrate feed bags, silage bales, and mineral mixture stockpile',
        isEssential: true
      },
      {
        name: 'Livestock Insurance Premium & Veterinary Care Pack',
        category: 'WORKING_CAPITAL',
        estimatedCost: 45000,
        description: '1-year comprehensive cattle insurance against disease/death and vaccination kit',
        isEssential: true
      },
      {
        name: 'Power Backup & Operational Cash Contingency',
        category: 'WORKING_CAPITAL',
        estimatedCost: 55000,
        description: 'Inverter/generator backup for milking machine and water pumping',
        isEssential: true
      }
    ],
    annualRevenuePerLakhCost: 145000, // ₹14.5 Lakhs gross annual revenue on ₹10 Lakhs project cost (~₹1.20 Lakh/month)
    operatingMarginPct: 38.0, // 38% operating profit before debt service (~₹46,000/month net cashflow)
    gestationPeriodMonths: 1,
    standardTenureMonths: 60, // 5 years
    benchmarkInterestRate: 9.50, // 9.50% p.a.
    standardMoratoriumMonths: 3
  },
  tailoring: {
    categoryId: 'tailoring',
    categoryName: 'Apparel & Custom Tailoring Production Unit',
    typicalName: 'Garment & Custom Tailoring Micro-Workshop',
    standardMarginRatio: 0.10,
    baseCapExRatio: 0.70,
    baseWorkingCapitalRatio: 0.30,
    defaultCostComponents: [
      {
        name: 'Industrial High-Speed Sewing & Overlock Machines (4 Units)',
        category: 'CAPEX',
        estimatedCost: 280000,
        unitCount: 4,
        unitPrice: 70000,
        description: 'Direct-drive computer-controlled stitching machines & 5-thread interlock machine',
        isEssential: true
      },
      {
        name: 'Fabric Cutting Table, Steam Press & Ironing Station',
        category: 'CAPEX',
        estimatedCost: 70000,
        description: 'Professional layout cutting table with rotary electric cutters and industrial boiler iron',
        isEssential: true
      },
      {
        name: 'Shop Interiors, Work Benches & Fitting Cubicle',
        category: 'CAPEX',
        estimatedCost: 50000,
        description: 'Lighting, customer display racks, shelving, and fitting mirror setup',
        isEssential: false
      },
      {
        name: 'Initial Fabric, Thread, Zippers & Trims Inventory',
        category: 'WORKING_CAPITAL',
        estimatedCost: 60000,
        description: 'Wholesale textile roll procurement for unstitched suits, uniform cloth, and lining',
        isEssential: true
      },
      {
        name: '2-Month Operating Rent Buffer & Working Capital',
        category: 'WORKING_CAPITAL',
        estimatedCost: 40000,
        description: 'Rental advance buffer, electricity advance, and initial artisan wages',
        isEssential: true
      }
    ],
    annualRevenuePerLakhCost: 160000,
    operatingMarginPct: 42.0,
    gestationPeriodMonths: 1,
    standardTenureMonths: 48, // 4 years
    benchmarkInterestRate: 10.0,
    standardMoratoriumMonths: 2
  },
  retail: {
    categoryId: 'retail',
    categoryName: 'Rural Kirana & Essential Goods Retail Enterprise',
    typicalName: 'Modernized Rural Daily Essentials & FMCG Store',
    standardMarginRatio: 0.10,
    baseCapExRatio: 0.40,
    baseWorkingCapitalRatio: 0.60,
    defaultCostComponents: [
      {
        name: 'Modular Display Racks, Billing Counter & POS Terminal',
        category: 'CAPEX',
        estimatedCost: 150000,
        description: 'Slotted angle powder-coated steel shelving, digital weighing scale & barcode printer',
        isEssential: true
      },
      {
        name: 'Commercial Deep Freezer & Beverage Cooler (Energy Efficient)',
        category: 'CAPEX',
        estimatedCost: 60000,
        description: '300L deep freezer for dairy items, ice cream, and cold beverages',
        isEssential: true
      },
      {
        name: 'Initial FMCG, Grocery, Grains & Packaged Goods Inventory',
        category: 'WORKING_CAPITAL',
        estimatedCost: 240000,
        description: 'Direct wholesale bulk procurement from APMC mandi and FMCG distributors',
        isEssential: true
      },
      {
        name: 'Working Capital Cash Float & 2-Month Rental Deposit',
        category: 'WORKING_CAPITAL',
        estimatedCost: 50000,
        description: 'Cash-in-hand buffer for vendor credit cycles and operational float',
        isEssential: true
      }
    ],
    annualRevenuePerLakhCost: 220000,
    operatingMarginPct: 18.0, // High turnover, moderate margin
    gestationPeriodMonths: 0.5,
    standardTenureMonths: 36, // 3 years
    benchmarkInterestRate: 10.5,
    standardMoratoriumMonths: 1
  },
  poultry: {
    categoryId: 'poultry',
    categoryName: 'Broiler / Country Chicken Micro Poultry Farm',
    typicalName: 'Environment-Controlled Poultry Shed (1,000 Bird Cycle)',
    standardMarginRatio: 0.10,
    baseCapExRatio: 0.65,
    baseWorkingCapitalRatio: 0.35,
    defaultCostComponents: [
      {
        name: 'Poultry Shed Construction with Wire Mesh & Curtains',
        category: 'CAPEX',
        estimatedCost: 320000,
        description: '1,500 sq ft elevated shed with rat-proof concrete base and thatch/tin roof',
        isEssential: true
      },
      {
        name: 'Automatic Feeder, Nipple Drinker Line & Fogger System',
        category: 'CAPEX',
        estimatedCost: 85000,
        description: 'Continuous water nipple lines and overhead misting foggers for heat management',
        isEssential: true
      },
      {
        name: 'Day-Old Chicks (DOC) First 2 Batches (2,000 birds total)',
        category: 'WORKING_CAPITAL',
        estimatedCost: 70000,
        description: 'Commercial broiler or improved indigenous breed chicks from registered hatchery',
        isEssential: true
      },
      {
        name: 'Pre-starter & Finisher Feed Stock (45-Day Cycle)',
        category: 'WORKING_CAPITAL',
        estimatedCost: 110000,
        description: 'Balanced protein feed bags, vitamins, liver tonic, and electrolytes',
        isEssential: true
      },
      {
        name: 'Vaccines, Bio-Security Disinfectants & Heating Gas Brooders',
        category: 'WORKING_CAPITAL',
        estimatedCost: 25000,
        description: 'Newcastle / IBD vaccines, sanitizers, and LPG brooding lamps',
        isEssential: true
      }
    ],
    annualRevenuePerLakhCost: 180000,
    operatingMarginPct: 24.0,
    gestationPeriodMonths: 2,
    standardTenureMonths: 48,
    benchmarkInterestRate: 9.75,
    standardMoratoriumMonths: 3
  }
};
