import { NextRequest, NextResponse } from 'next/server'

// 模拟的城市数据
const mockCities = [
  { city_name: '佛山', year: '2024', base_min: 4546, base_max: 26421, rate: 0.014 },
  { city_name: '广州', year: '2024', base_min: 5284, base_max: 26421, rate: 0.014 },
  { city_name: '深圳', year: '2024', base_min: 5284, base_max: 26421, rate: 0.014 },
  { city_name: '上海', year: '2024', base_min: 6520, base_max: 36549, rate: 0.014 },
  { city_name: '北京', year: '2024', base_min: 6720, base_max: 33891, rate: 0.014 }
]

// 模拟的员工数据
const mockSalaries = [
  { employee_id: '0001', employee_name: '张三', month: '202401', salary_amount: 4000 },
  { employee_id: '0001', employee_name: '张三', month: '202402', salary_amount: 4000 },
  { employee_id: '0001', employee_name: '张三', month: '202403', salary_amount: 4200 },
  { employee_id: '0001', employee_name: '张三', month: '202404', salary_amount: 4200 },
  { employee_id: '0001', employee_name: '张三', month: '202405', salary_amount: 4500 },
  { employee_id: '0001', employee_name: '张三', month: '202406', salary_amount: 4500 },
  { employee_id: '0001', employee_name: '张三', month: '202407', salary_amount: 4000 },
  { employee_id: '0001', employee_name: '张三', month: '202408', salary_amount: 4000 },
  { employee_id: '0001', employee_name: '张三', month: '202409', salary_amount: 4300 },
  { employee_id: '0001', employee_name: '张三', month: '202410', salary_amount: 4300 },
  { employee_id: '0001', employee_name: '张三', month: '202411', salary_amount: 4500 },
  { employee_id: '0001', employee_name: '张三', month: '202412', salary_amount: 4500 },
  { employee_id: '0002', employee_name: '李四', month: '202401', salary_amount: 8000 },
  { employee_id: '0002', employee_name: '李四', month: '202402', salary_amount: 8000 },
  { employee_id: '0002', employee_name: '李四', month: '202403', salary_amount: 8500 },
  { employee_id: '0002', employee_name: '李四', month: '202404', salary_amount: 8500 },
  { employee_id: '0002', employee_name: '李四', month: '202405', salary_amount: 9000 },
  { employee_id: '0002', employee_name: '李四', month: '202406', salary_amount: 9000 },
  { employee_id: '0002', employee_name: '李四', month: '202407', salary_amount: 8800 },
  { employee_id: '0002', employee_name: '李四', month: '202408', salary_amount: 8800 },
  { employee_id: '0002', employee_name: '李四', month: '202409', salary_amount: 9200 },
  { employee_id: '0002', employee_name: '李四', month: '202410', salary_amount: 9200 },
  { employee_id: '0002', employee_name: '李四', month: '202411', salary_amount: 9500 },
  { employee_id: '0002', employee_name: '李四', month: '202412', salary_amount: 9500 }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cityNames, calculationYear } = body

    if (!cityNames || !Array.isArray(cityNames) || cityNames.length === 0) {
      return NextResponse.json(
        { success: false, message: '请选择至少一个城市' },
        { status: 400 }
      )
    }

    const allResults: any[] = []

    // 为每个城市计算
    for (const cityName of cityNames) {
      const city = mockCities.find(c => c.city_name === cityName && c.year === calculationYear)

      if (!city) {
        console.warn(`City ${cityName} not found for year ${calculationYear}`)
        continue
      }

      // 按员工分组
      const employeeGroups = mockSalaries.reduce((groups, salary) => {
        if (!groups[salary.employee_name]) {
          groups[salary.employee_name] = []
        }
        groups[salary.employee_name].push(salary)
        return groups
      }, {} as Record<string, typeof mockSalaries>)

      // 为每个员工计算
      Object.entries(employeeGroups).forEach(([employeeName, salaries]) => {
        const avgSalary = salaries.reduce((sum, s) => sum + s.salary_amount, 0) / salaries.length

        // 确定缴费基数
        let contributionBase
        if (avgSalary < city.base_min) {
          contributionBase = city.base_min
        } else if (avgSalary > city.base_max) {
          contributionBase = city.base_max
        } else {
          contributionBase = avgSalary
        }

        // 计算费用
        const totalFee = contributionBase * city.rate
        const companyFee = totalFee * 0.7
        const individualFee = totalFee * 0.3

        allResults.push({
          employee_id: salaries[0].employee_id,
          employee_name: employeeName,
          city_name: cityName,
          avg_salary: Math.round(avgSalary * 100) / 100,
          contribution_base: contributionBase,
          company_fee: Math.round(companyFee * 100) / 100,
          individual_fee: Math.round(individualFee * 100) / 100,
          total_fee: Math.round(totalFee * 100) / 100,
          calculation_year: calculationYear,
          months_count: salaries.length
        })
      })
    }

    // 计算汇总
    const totalEmployees = allResults.length
    const totalCompanyFee = allResults.reduce((sum, r) => sum + r.company_fee, 0)
    const totalIndividualFee = allResults.reduce((sum, r) => sum + r.individual_fee, 0)
    const totalFee = allResults.reduce((sum, r) => sum + r.total_fee, 0)

    return NextResponse.json({
      success: true,
      message: `计算完成！共计算 ${totalEmployees} 名员工的社保费用`,
      data: {
        summary: {
          totalEmployees,
          totalCompanyFee: Math.round(totalCompanyFee * 100) / 100,
          totalIndividualFee: Math.round(totalIndividualFee * 100) / 100,
          totalFee: Math.round(totalFee * 100) / 100,
          citiesCalculated: cityNames.length
        },
        results: allResults
      }
    })

  } catch (error) {
    console.error('Calculation error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const uniqueCities = [...new Set(mockCities.map(c => c.city_name))]
    const uniqueYears = [...new Set(mockCities.map(c => c.year))].sort((a, b) => b.localeCompare(a))

    return NextResponse.json({
      cities: uniqueCities,
      years: uniqueYears
    })
  } catch (error) {
    console.error('Error fetching calculation options:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch calculation options'
      },
      { status: 500 }
    )
  }
}