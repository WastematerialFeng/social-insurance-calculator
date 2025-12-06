import { NextRequest, NextResponse } from 'next/server'
import { dbOperations, isSupabaseConfigured } from '@/lib/supabase'
import { calculateAllEmployeesInsurance } from '@/lib/calculator'

export async function POST(request: NextRequest) {
  try {
    // Log environment status for debugging
    console.log('Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      isConfigured: isSupabaseConfigured
    })

    // Check if Supabase is properly configured
    if (!isSupabaseConfigured) {
      console.error('Supabase not configured - missing environment variables')
      return NextResponse.json(
        {
          success: false,
          message: 'Database is not configured. Please contact administrator.',
          error: 'SUPABASE_NOT_CONFIGURED',
          details: {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasSupabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            hasSupabaseService: !!process.env.SUPABASE_SERVICE_ROLE_KEY
          }
        },
        { status: 503 }
      )
    }

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
    console.log('Attempting to fetch salary data...')
    const salaries = await dbOperations.salaries.getAllSalaries()

    console.log('Found salaries:', salaries.length)

    if (salaries.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No salary data found. Please upload salary data first.' },
        { status: 400 }
      )
    }

    // Log some salary data for debugging
    console.log('Sample salary data:', salaries.slice(0, 2))

    // Clear existing results
    await dbOperations.results.clearAllResults()

    const allResults: any[] = []

    // Calculate for each city
    for (const cityName of cityNames) {
      try {
        console.log(`Processing city: ${cityName} for year: ${calculationYear}`)

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

        // Log first result for debugging
        if (results.length > 0) {
          console.log('Sample calculation result:', results[0])
        }

        allResults.push(...results)
      } catch (cityError) {
        console.error(`Error processing city ${cityName}:`, cityError)
        // Continue with other cities
      }
    }

    if (allResults.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No cities found for the specified year' },
        { status: 400 }
      )
    }

    // Insert all results into database
    console.log('Attempting to insert', allResults.length, 'results into database...')
    await dbOperations.results.insertResults(allResults)
    console.log('Results inserted successfully')

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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          success: false,
          message: 'Database is not configured. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.',
          error: 'SUPABASE_NOT_CONFIGURED'
        },
        { status: 503 }
      )
    }

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