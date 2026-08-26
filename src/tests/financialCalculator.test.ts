/**
 * Unit Tests for UDYORA Deterministic Financial Calculator
 */

import {
  calculateProjectCost,
  calculateLoanAmount,
  calculateEMI,
  calculateTotalInterest,
  generateRepaymentSchedule,
  calculateDSCR,
  calculateBreakEvenMonths,
  generateDeterministicFinancialPlan
} from '../services/financialCalculator';
import { UserBusinessInput } from '../types';

export function runFinancialUnitTests(): { passed: boolean; logs: string[] } {
  const logs: string[] = [];
  let allPassed = true;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      logs.push(`âœ“ PASS: ${testName}`);
    } else {
      logs.push(`âœ— FAIL: ${testName}`);
      allPassed = false;
    }
  }

  // Test 1: Standard SIH Margin Logic (10% promoter margin)
  const projectCost = calculateProjectCost(100000, 0.10);
  assert(projectCost === 1000000, `calculateProjectCost(100000, 0.10) should equal 1,000,000 (got ${projectCost})`);

  // Test 2: Financing Requirement
  const loanAmount = calculateLoanAmount(1000000, 100000);
  assert(loanAmount === 900000, `calculateLoanAmount(1000000, 100000) should equal 900,000 (got ${loanAmount})`);

  // Test 3: Standard EMI Calculation
  // P = 900,000, r = 9.5% p.a., n = 57 months (60 months total with 3 months moratorium)
  const emi = calculateEMI(900000, 9.5, 57);
  // Expected EMI around 19688
  assert(emi > 19000 && emi < 20500, `calculateEMI(900000, 9.5, 57) should be approx ₹19,688 (got ${emi})`);

  // Test 4: Zero interest or edge cases
  const zeroInterestEMI = calculateEMI(900000, 0, 60);
  assert(zeroInterestEMI === 15000, `calculateEMI with 0% interest should be simple division (got ${zeroInterestEMI})`);

  // Test 5: Total interest payable
  const totalInterest = calculateTotalInterest(emi, 57, 900000);
  assert(totalInterest > 0 && totalInterest === (emi * 57 - 900000), `calculateTotalInterest should be EMI * n - P (got ${totalInterest})`);

  // Test 6: Repayment Schedule structure & closing balance
  const schedule = generateRepaymentSchedule(900000, 9.5, 60, 3);
  assert(schedule.length === 60, `Repayment schedule should contain exactly 60 months (got ${schedule.length})`);
  assert(schedule[0].isMoratorium === true, `Month 1 should be in moratorium`);
  assert(schedule[2].isMoratorium === true, `Month 3 should be in moratorium`);
  assert(schedule[3].isMoratorium === false, `Month 4 should be active amortization`);
  assert(schedule[59].closingPrincipal === 0, `Closing principal at month 60 should be 0 (got ${schedule[59].closingPrincipal})`);

  // Test 7: DSCR computation
  const dscr = calculateDSCR(550000, 230000);
  assert(dscr === 2.39, `calculateDSCR(550000, 230000) should equal 2.39 (got ${dscr})`);

  // Test 8: Break-even months
  const breakEven = calculateBreakEvenMonths(750000, 45000, 1);
  assert(breakEven === 18, `calculateBreakEvenMonths(750000, 45000, 1) should equal 18 (got ${breakEven})`);

  // Test 9: Complete Plan generation for Dairy Demo
  const demoInput: UserBusinessInput = {
    locationId: 'loc_khed_shivapur_pune',
    businessCategoryId: 'dairy',
    businessIdea: 'Dairy Farming & Milk Supply Unit',
    availableCapital: 100000
  };
  const plan = generateDeterministicFinancialPlan(demoInput);
  assert(plan.availableOwnCapital === 100000, `Plan own capital is ₹1,00,000`);
  assert(plan.indicativeProjectCost === 1000000, `Plan indicative project cost is ₹10,00,000`);
  assert(plan.indicativeFinancingRequirement === 900000, `Plan financing requirement is ₹9,00,000`);
  assert(plan.capitalExpenditureTotal + plan.workingCapitalTotal === 1000000, `CapEx + Working Capital equals total project cost`);

  return { passed: allPassed, logs };
}
