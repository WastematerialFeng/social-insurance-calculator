import { NextRequest, NextResponse } from 'next/server'
import { parseCitiesExcel, parseSalariesExcel, transformCityData, transformSalaryData, validateExcelFile } from '@/lib/excel-parser'
import { dbOperations } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('type') as string // 'cities' or 'salaries'
    const overwrite = formData.get('overwrite') === 'true'

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!fileType || !['cities', 'salaries'].includes(fileType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Validate file format
    if (!validateExcelFile(file)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file format. Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      )
    }

    let data: any[] = []

    // Parse Excel based on file type
    if (fileType === 'cities') {
      const excelData = await parseCitiesExcel(file)
      data = transformCityData(excelData)

      // If overwrite is true, clear existing data
      if (overwrite) {
        // Get unique years from the uploaded data
        const years = [...new Set(excelData.map(row => row.year))]

        // Delete existing data for these years
        for (const year of years) {
          await dbOperations.cities.deleteCitiesByYear(year)
        }
      }

      // Insert new data
      await dbOperations.cities.upsertCities(data)
    } else if (fileType === 'salaries') {
      const excelData = await parseSalariesExcel(file)
      data = transformSalaryData(excelData)

      // If overwrite is true, clear all existing salary data
      if (overwrite) {
        await dbOperations.salaries.clearAllSalaries()
      }

      // Insert new data
      await dbOperations.salaries.insertSalaries(data)
    } else {
      return NextResponse.json(
        { success: false, message: 'Unsupported file type' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${fileType} data uploaded successfully`,
      data: {
        rowsInserted: data.length,
        rowsUpdated: 0
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
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
  return NextResponse.json({
    message: 'Upload endpoint. Use POST to upload files.',
    usage: {
      method: 'POST',
      formData: {
        file: 'Excel file (.xlsx or .xls)',
        type: 'Either "cities" or "salaries"',
        overwrite: 'Optional boolean, default false'
      }
    }
  })
}