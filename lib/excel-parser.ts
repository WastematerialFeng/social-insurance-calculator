import * as XLSX from 'xlsx'
import { CityExcelRow, SalaryExcelRow, City, Salary } from '@/types'
import { readFile } from 'fs/promises'
import { join } from 'path'

/**
 * Parse Excel file for cities data (both File object and file path)
 */
export async function parseCitiesExcel(fileOrPath: File | string): Promise<CityExcelRow[]> {
  try {
    let workbook: XLSX.WorkBook

    // Check if input is a File object (browser) or a file path (Node.js)
    if (typeof fileOrPath === 'string') {
      // Node.js environment - read from file path
      const { readFile } = await import('fs/promises')
      const fileBuffer = await readFile(fileOrPath)
      workbook = XLSX.read(fileBuffer, { type: 'buffer' })

      // Process the workbook
      return await new Promise((resolve, reject) => {
        processCitiesWorkbook(workbook, resolve, reject)
      })
    } else {
      // Browser environment - read from File object
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            workbook = XLSX.read(data, { type: 'array' })
            processCitiesWorkbook(workbook, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsArrayBuffer(fileOrPath as File)
      })
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Process workbook and extract cities data
 */
function processCitiesWorkbook(workbook: XLSX.WorkBook, resolve: Function, reject: Function) {
  try {
    // Try to find cities worksheet by name or use first worksheet
    let worksheet = null
    const possibleNames = ['cities', '城市数据', '城市标准', 'City', 'Cities']

    // First try to find by exact match
    for (const name of workbook.SheetNames) {
      if (possibleNames.includes(name)) {
        worksheet = workbook.Sheets[name]
        break
      }
    }

    // If not found, use the first worksheet
    if (!worksheet) {
      const worksheetName = workbook.SheetNames[0]
      worksheet = workbook.Sheets[worksheetName]
    }

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

    // Validate and transform data
    const citiesData: CityExcelRow[] = jsonData.map((row, index) => {
      // Check required fields
      if (!row.city_name || !row.year || !row.base_min || !row.base_max || !row.rate) {
        throw new Error(`Row ${index + 1}: Missing required fields. Expected: city_name, year, base_min, base_max, rate`)
      }

      return {
        city_name: String(row.city_name),
        year: String(row.year),
        base_min: Number(row.base_min),
        base_max: Number(row.base_max),
        rate: Number(row.rate)
      }
    })

    resolve(citiesData)
  } catch (error) {
    reject(error)
  }
}

/**
 * Parse Excel file for salaries data
 */
export function parseSalariesExcel(file: File): Promise<SalaryExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        // Try to find salaries worksheet by name or use second worksheet
        let worksheet = null
        const possibleNames = ['salaries', '员工工资', '工资数据', 'Salary', 'Salaries']

        // First try to find by exact match
        for (const name of workbook.SheetNames) {
          if (possibleNames.includes(name)) {
            worksheet = workbook.Sheets[name]
            break
          }
        }

        // If not found, use the second worksheet (after cities)
        if (!worksheet && workbook.SheetNames.length > 1) {
          const worksheetName = workbook.SheetNames[1]
          worksheet = workbook.Sheets[worksheetName]
        }

        // If still not found, use the first worksheet
        if (!worksheet) {
          const worksheetName = workbook.SheetNames[0]
          worksheet = workbook.Sheets[worksheetName]
        }

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

        // Validate and transform data
        const salariesData: SalaryExcelRow[] = jsonData.map((row, index) => {
          // Check required fields
          if (!row.employee_id || !row.employee_name || !row.month || !row.salary_amount) {
            throw new Error(`Row ${index + 1}: Missing required fields. Expected: employee_id, employee_name, month, salary_amount`)
          }

          // Validate month format (YYYYMM)
          const monthStr = String(row.month)
          if (!/^\d{4}\d{2}$/.test(monthStr)) {
            throw new Error(`Row ${index + 1}: Invalid month format. Expected YYYYMM (e.g., 202401)`)
          }

          return {
            employee_id: String(row.employee_id),
            employee_name: String(row.employee_name),
            month: monthStr,
            salary_amount: Number(row.salary_amount)
          }
        })

        resolve(salariesData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Transform CityExcelRow to City (for database insertion)
 */
export function transformCityData(cityExcelData: CityExcelRow[]): Omit<City, 'id' | 'created_at'>[] {
  return cityExcelData.map(city => ({
    city_name: city.city_name,
    year: city.year,
    base_min: city.base_min,
    base_max: city.base_max,
    rate: city.rate
  }))
}

/**
 * Transform SalaryExcelRow to Salary (for database insertion)
 */
export function transformSalaryData(salaryExcelData: SalaryExcelRow[]): Omit<Salary, 'id' | 'created_at'>[] {
  return salaryExcelData.map(salary => ({
    employee_id: salary.employee_id,
    employee_name: salary.employee_name,
    month: salary.month,
    salary_amount: salary.salary_amount
  }))
}

/**
 * Validate Excel file type
 */
export function validateExcelFile(file: File): boolean {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ]
  const validExtensions = ['.xlsx', '.xls']

  const hasValidType = validTypes.includes(file.type)
  const hasValidExtension = validExtensions.some(ext =>
    file.name.toLowerCase().endsWith(ext)
  )

  return hasValidType || hasValidExtension
}

/**
 * Generate sample cities Excel template
 */
export function generateCitiesTemplate(): void {
  const templateData = [
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
      base_max: 26421,
      rate: 0.014
    }
  ]

  const worksheet = XLSX.utils.json_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cities')

  XLSX.writeFile(workbook, 'cities_template.xlsx')
}

/**
 * Generate sample salaries Excel template
 */
export function generateSalariesTemplate(): void {
  const templateData = [
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
      employee_id: '0002',
      employee_name: '李四',
      month: '202401',
      salary_amount: 12000
    }
  ]

  const worksheet = XLSX.utils.json_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Salaries')

  XLSX.writeFile(workbook, 'salaries_template.xlsx')
}