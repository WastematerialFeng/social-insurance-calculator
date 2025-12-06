import { NextRequest, NextResponse } from 'next/server'
import { generateCitiesTemplate } from '@/lib/template-generator'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // Generate template file in memory
    const citiesData = [
      {
        city_name: '佛山',
        year: '2024',
        base_min: 4546,
        base_max: 26421,
        rate: 0.014
      },
      {
        city_name: '广州',
        year: '2024',
        base_min: 5284,
        base_max: 36072,
        rate: 0.014
      },
      {
        city_name: '深圳',
        year: '2024',
        base_min: 5284,
        base_max: 36072,
        rate: 0.014
      }
    ]

    // Create Excel file
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(citiesData)

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // city_name
      { wch: 10 }, // year
      { wch: 12 }, // base_min
      { wch: 12 }, // base_max
      { wch: 10 }  // rate
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Cities')

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="cities-template.xlsx"'
      }
    })
  } catch (error) {
    console.error('Error generating cities template:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}