import { BusinessInputData, LocationResolution, AnalysisReportSummary } from '../types';
import { api } from './api';

export const analysisService = {
  async triggerAnalysis(
    input: BusinessInputData,
    location: LocationResolution
  ): Promise<{ analysisId: string }> {
    // Stub ready for real server / backend API connection
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { analysisId: `anl_${Date.now()}` };
  },

  async fetchAnalysisSummary(
    input: BusinessInputData,
    location: LocationResolution
  ): Promise<AnalysisReportSummary> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const capital = input.availableCapital || 100000;
    const projectCost = Math.round(capital / 0.10);
    const loanAmount = Math.round(projectCost - capital);
    const monthlyEMI = Math.round((loanAmount * (9.5 / 1200) * Math.pow(1 + 9.5 / 1200, 60)) / (Math.pow(1 + 9.5 / 1200, 60) - 1));

    return {
      reportId: `UDY-${Math.floor(100000 + Math.random() * 900000)}`,
      feasibilityScore: 84,
      feasibilityRating: 'HIGH',
      businessIdea: input.businessIdea,
      location: `${location.localityName}, ${location.districtName}, ${location.stateName}`,
      capital,
      projectCost,
      loanAmount,
      monthlyEMI,
      dscr: 1.85,
      topSchemeName: input.categoryId === 'dairy' ? 'PMEGP (Prime Minister Employment Generation Programme)' : 'MUDRA Tarun Scheme',
      topSchemeSubsidy: '35% Rural Government Capital Subsidy',
      riskSummary: 'Low input price fluctuation risk. Strong local off-take and cooperative collection infrastructure verified.',
      timestamp: new Date().toISOString()
    };
  }
};
