import { NextRequest, NextResponse } from 'next/server'
import { dbOperations } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const city = searchParams.get('city')
    const year = searchParams.get('year')
    const employeeName = searchParams.get('employeeName')

    // Build filters object
    const filters: any = {}
    if (city) filters.city = city
    if (year) filters.year = year
    if (employeeName) filters.employeeName = employeeName

    // Get results with pagination and filters
    const result = await dbOperations.results.getResults(page, limit, filters)

    // Get unique cities and years for filter options
    const [uniqueCities, uniqueYears] = await Promise.all([
      dbOperations.results.getUniqueCities(),
      dbOperations.results.getUniqueYears()
    ])

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      filters: {
        cities: uniqueCities,
        years: uniqueYears,
        current: filters
      }
    })

  } catch (error) {
    console.error('Results fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clear all results
    await dbOperations.results.clearAllResults()

    return NextResponse.json({
      success: true,
      message: 'All results cleared successfully'
    })

  } catch (error) {
    console.error('Results clear error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}