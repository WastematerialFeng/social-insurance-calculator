import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // Generate template file in memory
    const salariesData = [
      {
        employee_id: '0001',
        employee_name: '张三',
        month: '202401',
        salary_amount: 8500
      },
      {
        employee_id: '0001',
        employee_name: '张三',
        month: '202402',
        salary_amount: 8500
      },
      {
        employee_id: '0001',
        employee_name: '张三',
        month: '202403',
        salary_amount: 9000
      },
      {
        employee_id: '0002',
        employee_name: '李四',
        month: '202401',
        salary_amount: 12000
      },
      {
        employee_id: '0002',
        employee_name: '李四',
        month: '202402',
        salary_amount: 12000
      },
      {
        employee_id: '0002',
        employee_name: '李四',
        month: '202403',
        salary_amount: 12500
      },
      {
        employee_id: '0003',
        employee_name: '王五',
        month: '202401',
        salary_amount: 6800
      },
      {
        employee_id: '0003',
        employee_name: '王五',
        month: '202402',
        salary_amount: 6800
      },
      {
        employee_id: '0003',
        employee_name: '王五',
        month: '202403',
        salary_amount: 7200
      }
    ]

    // Create Excel file
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(salariesData)

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // employee_id
      { wch: 15 }, // employee_name
      { wch: 10 }, // month
      { wch: 12 }  // salary_amount
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Salaries')

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="salaries-template.xlsx"'
      }
    })
  } catch (error) {
    console.error('Error generating salaries template:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}