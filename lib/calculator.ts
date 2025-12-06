import { City, Salary, CalculationResult, RateDistribution } from '@/types'

// Fixed rate distribution
export const RATE_DISTRIBUTION: RateDistribution = {
  total: 0.014,      // 1.4% total
  company: 0.0098,   // 70% of total (0.98%)
  individual: 0.0042 // 30% of total (0.42%)
}

/**
 * Calculate average annual salary for an employee
 * Note: Returns actual average, NOT annualized (not multiplying by 12)
 */
export function calculateAverageSalary(salaries: Salary[]): number {
  if (salaries.length === 0) return 0

  const totalSalary = salaries.reduce((sum, salary) => sum + salary.salary_amount, 0)
  const actualMonths = salaries.length

  // Return actual monthly average (not annualized)
  return totalSalary / actualMonths
}

/**
 * Determine contribution base based on city limits
 */
export function determineContributionBase(
  averageSalary: number,
  city: City
): number {
  if (averageSalary < city.base_min) {
    return city.base_min
  } else if (averageSalary > city.base_max) {
    return city.base_max
  } else {
    return averageSalary
  }
}

/**
 * Calculate social insurance fees for an employee
 */
export function calculateEmployeeInsurance(
  employeeSalaries: Salary[],
  city: City,
  calculationYear: string
): CalculationResult {
  // Calculate average salary (actual months, not annualized)
  const avgSalary = calculateAverageSalary(employeeSalaries)

  // Determine contribution base
  const contributionBase = determineContributionBase(avgSalary, city)

  // Calculate fees using rate distribution
  const totalFee = contributionBase * RATE_DISTRIBUTION.total
  const companyFee = contributionBase * RATE_DISTRIBUTION.company
  const individualFee = contributionBase * RATE_DISTRIBUTION.individual

  return {
    id: 0, // Will be set by database
    employee_name: employeeSalaries[0].employee_name,
    employee_id: employeeSalaries[0].employee_id,
    city_name: city.city_name,
    avg_salary: Math.round(avgSalary * 100) / 100, // Round to 2 decimal places
    contribution_base: Math.round(contributionBase * 100) / 100,
    company_fee: Math.round(companyFee * 100) / 100,
    individual_fee: Math.round(individualFee * 100) / 100,
    total_fee: Math.round(totalFee * 100) / 100,
    calculation_year: calculationYear,
    months_count: employeeSalaries.length
  }
}

/**
 * Group salaries by employee name
 */
export function groupSalariesByEmployee(salaries: Salary[]): Record<string, Salary[]> {
  return salaries.reduce((groups, salary) => {
    const employeeName = salary.employee_name
    if (!groups[employeeName]) {
      groups[employeeName] = []
    }
    groups[employeeName].push(salary)
    return groups
  }, {} as Record<string, Salary[]>)
}

/**
 * Calculate insurance for all employees in a city
 */
export async function calculateAllEmployeesInsurance(
  salaries: Salary[],
  city: City,
  calculationYear: string
): Promise<CalculationResult[]> {
  // Group salaries by employee
  const groupedSalaries = groupSalariesByEmployee(salaries)

  // Calculate for each employee
  const results: CalculationResult[] = []

  for (const [employeeName, employeeSalaries] of Object.entries(groupedSalaries)) {
    const result = calculateEmployeeInsurance(employeeSalaries, city, calculationYear)
    results.push(result)
  }

  return results
}

/**
 * Get calculation summary statistics
 */
export function getCalculationSummary(results: CalculationResult[]): {
  totalEmployees: number;
  totalCompanyFee: number;
  totalIndividualFee: number;
  totalFee: number;
  averageCompanyFee: number;
  averageIndividualFee: number;
  averageTotalFee: number;
} {
  if (results.length === 0) {
    return {
      totalEmployees: 0,
      totalCompanyFee: 0,
      totalIndividualFee: 0,
      totalFee: 0,
      averageCompanyFee: 0,
      averageIndividualFee: 0,
      averageTotalFee: 0
    }
  }

  const totalCompanyFee = results.reduce((sum, r) => sum + r.company_fee, 0)
  const totalIndividualFee = results.reduce((sum, r) => sum + r.individual_fee, 0)
  const totalFee = results.reduce((sum, r) => sum + r.total_fee, 0)

  return {
    totalEmployees: results.length,
    totalCompanyFee: Math.round(totalCompanyFee * 100) / 100,
    totalIndividualFee: Math.round(totalIndividualFee * 100) / 100,
    totalFee: Math.round(totalFee * 100) / 100,
    averageCompanyFee: Math.round((totalCompanyFee / results.length) * 100) / 100,
    averageIndividualFee: Math.round((totalIndividualFee / results.length) * 100) / 100,
    averageTotalFee: Math.round((totalFee / results.length) * 100) / 100
  }
}