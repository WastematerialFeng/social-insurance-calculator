import * as XLSX from 'xlsx'
import { CityExcelRow, SalaryExcelRow } from '@/types'

// Generate sample cities data
export function generateCitiesTemplate() {
  const citiesData: CityExcelRow[] = [
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

  // Create workbook
  const wb = XLSX.utils.book_new()

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(citiesData)

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // city_name
    { wch: 10 }, // year
    { wch: 12 }, // base_min
    { wch: 12 }, // base_max
    { wch: 10 }  // rate
  ]

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Cities')

  // Write file
  XLSX.writeFile(wb, 'cities-template.xlsx')
}

// Generate sample salaries data
export function generateSalariesTemplate() {
  const salariesData: SalaryExcelRow[] = [
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

  // Create workbook
  const wb = XLSX.utils.book_new()

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(salariesData)

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // employee_id
    { wch: 15 }, // employee_name
    { wch: 10 }, // month
    { wch: 12 }  // salary_amount
  ]

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Salaries')

  // Write file
  XLSX.writeFile(wb, 'salaries-template.xlsx')
}