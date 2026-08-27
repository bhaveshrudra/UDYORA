import {
  UserContext,
  BusinessSummary
} from '../types';

export const businessAgent = {
  async execute(userContext: UserContext): Promise<BusinessSummary> {
    const { businessProfile, locationContext } = userContext;
    const cat = businessProfile.businessCategory;
    const locality = locationContext.localityName;

    let operatingRequirements: string[] = [];
    let keyOpportunities: string[] = [];
    let keyConstraints: string[] = [];
    let costDrivers: string[] = [];
    let revenueDrivers: string[] = [];
    let scaleAssessment = 'Micro Enterprise (Promoter Managed)';

    switch (cat) {
      case 'Dairy':
        scaleAssessment = '8-10 High-Yield Crossbred Cows Unit with Automated Milking & Shed';
        operatingRequirements = [
          'All-weather cattle shed (approx. 1200 sq.ft covered area)',
          'Green fodder cultivation / silage storage access',
          'Clean water source (approx. 150 liters/animal/day)',
          'Proximity to bulk milk cooling center (BMCC) within 10 km'
        ];
        keyOpportunities = [
          'Guaranteed daily off-take via State Dairy Milk Cooperative Network',
          'High demand for fresh raw milk in nearby semi-urban clusters',
          'Additional secondary revenue from organic cow dung manure / vermicompost'
        ];
        keyConstraints = [
          'High sensitivity to green/dry fodder price fluctuations',
          'Requires 365-day active livestock management and disease prevention'
        ];
        costDrivers = [
          'Livestock procurement (60% of capital expenditure)',
          'Cattle feed & mineral supplements (55% of recurring operating cost)',
          'Veterinary healthcare & insurance premiums'
        ];
        revenueDrivers = [
          'Daily morning & evening milk procurement sales',
          'Periodic sale of calves and culled animals',
          'Organic bio-fertilizer sales to local farmers'
        ];
        break;

      case 'Retail':
        scaleAssessment = 'Modern Semi-Urban Kirana & Daily Provisions Store';
        operatingRequirements = [
          'Prime street-front commercial space (250-400 sq.ft)',
          'Display shelving, POS billing terminal and barcode scanner',
          'Commercial refrigeration for dairy/cold beverages',
          'Working capital buffer for fast-moving inventory'
        ];
        keyOpportunities = [
          'Consistent daily cash transactions with 14-18% gross margin blend',
          'Opportunity for home delivery to nearby residential clusters'
        ];
        keyConstraints = [
          'Working capital locked in slow-moving stock',
          'Competition from unorganized local grocery kiosks'
        ];
        costDrivers = [
          'Initial inventory stock build-up (65% of project cost)',
          'Commercial rent & shop interior fit-out',
          'Electricity for refrigeration and lighting'
        ];
        revenueDrivers = [
          'FMCG, branded staples, and daily packaged foods',
          'High-margin dairy, beverages, and personal care products'
        ];
        break;

      case 'Tailoring':
        scaleAssessment = 'Custom Apparel & Designer Ladies Boutique Unit';
        operatingRequirements = [
          '2-3 Industrial motorized sewing & interlocking machines',
          'Cutting table, steam iron press, and fitting mirror area',
          'Fabric sample catalog and embroidery thread stock'
        ];
        keyOpportunities = [
          'High seasonal demand during wedding and festival peaks',
          'Premium service margins (40-60%) on customized embroidery & designer blouses'
        ];
        keyConstraints = [
          'Dependence on skilled labor availability during peak demand'
        ];
        costDrivers = [
          'Specialized industrial machinery procurement',
          'Lining fabrics, zippers, threads, and accessories inventory'
        ];
        revenueDrivers = [
          'Stitching labor charges for ethnic & western wear',
          'Direct markup on dress materials, laces, and buttons'
        ];
        break;

      case 'Poultry':
      case 'Agro-processing':
      case 'Custom':
      default:
        scaleAssessment = 'Rural Micro Agro & Service Enterprise';
        operatingRequirements = [
          'Dedicated commercial or farm-gate setup',
          '3-phase commercial electricity power connection',
          'Equipment and machinery installation'
        ];
        keyOpportunities = [
          'Direct farm-gate value addition on local raw commodities',
          'Priority sector bank loan eligibility'
        ];
        keyConstraints = [
          'Seasonal variation in raw material supply'
        ];
        costDrivers = ['Machinery and initial working capital'];
        revenueDrivers = ['Product sales and custom processing fees'];
        break;
    }

    return {
      businessCategory: cat,
      businessName: `${cat} Enterprise (${locality})`,
      businessDescription: businessProfile.businessDescription || `${cat} unit in ${locality}`,
      businessIntent: businessProfile.businessIntent,
      targetLocality: locality,
      scaleAssessment,
      operatingRequirements,
      keyOpportunities,
      keyConstraints,
      costDrivers,
      revenueDrivers
    };
  }
};
