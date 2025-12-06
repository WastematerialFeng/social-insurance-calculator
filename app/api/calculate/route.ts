import { NextRequest, NextResponse } from 'next/server'
import { dbOperations } from '@/lib/supabase'
import { calculateAllEmployeesInsurance } from '@/lib/calculator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cityNames, calculationYear } = body

    // Validate required fields
    if (!cityNames || !Array.isArray(cityNames) || cityNames.length === 0) {
      return NextResponse.json(
        { success: false, message: 'City names are required' },
        { status: 400 }
      )
    }

    if (!calculationYear) {
      return NextResponse.json(
        { success: false, message: 'Calculation year is required' },
        { status: 400 }
      )
    }

    // Get all salary data
    const salaries = await dbOperations.salaries.getAllSalaries()

    console.log('Found salaries:', salaries.length)

    if (salaries.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No salary data found. Please upload salary data first.' },
        { status: 400 }
      )
    }

    // Clear existing results
    await dbOperations.results.clearAllResults()

    const allResults: any[] = []

    // Calculate for each city
    for (const cityName of cityNames) {
      // Get city data for the specified year
      const city = await dbOperations.cities.getCityByNameAndYear(cityName, calculationYear)

      console.log('Looking for city:', cityName, 'year:', calculationYear)
      console.log('Found city:', city)

      if (!city) {
        console.warn(`City ${cityName} not found for year ${calculationYear}`)
        continue
      }

      // Calculate insurance for all employees in this city
      console.log('Calculating insurance for', salaries.length, 'employees')
      const results = await calculateAllEmployeesInsurance(salaries, city, calculationYear)
      console.log('Calculation results:', results.length, 'employees calculated')
      allResults.push(...results)
    }

    if (allResults.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No cities found for the specified year' },
        { status: 400 }
      )
    }

    // Insert all results into database
    await dbOperations.results.insertResults(allResults)

    // Calculate summary statistics
    const totalEmployees = allResults.length
    const totalCompanyFee = allResults.reduce((sum, r) => sum + r.company_fee, 0)
    const totalIndividualFee = allResults.reduce((sum, r) => sum + r.individual_fee, 0)
    const totalFee = allResults.reduce((sum, r) => sum + r.total_fee, 0)

    return NextResponse.json({
      success: true,
      message: `Calculation completed for ${totalEmployees} employees`,
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
    // Get available cities and years for frontend
    const cities = await dbOperations.cities.getAllCities()
    const uniqueCities = [...new Set(cities.map(c => c.city_name))]
    const uniqueYears = [...new Set(cities.map(c => c.year))].sort((a, b) => b.localeCompare(a))

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