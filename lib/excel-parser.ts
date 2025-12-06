import * as XLSX from 'xlsx'
import { CityExcelRow, SalaryExcelRow, City, Salary } from '@/types'

/**
 * Parse Excel file for cities data
 * Note: In server environment (API routes), File object might not behave as expected
 */
export async function parseCitiesExcel(file: File | Buffer): Promise<CityExcelRow[]> {
  try {
    let workbook: XLSX.WorkBook
    let buffer: Buffer

    // Convert to Buffer if needed
    if (Buffer.isBuffer(file)) {
      buffer = file
    } else {
      // Handle File object in server environment
      const fileObj = file as any

      // Try multiple ways to get the buffer
      if (fileObj.arrayBuffer) {
        // Modern approach: Use arrayBuffer
        try {
          const arrayBuffer = await fileObj.arrayBuffer()
          buffer = Buffer.from(arrayBuffer)
        } catch (e) {
          throw new Error(`Failed to convert File to ArrayBuffer: ${e}`)
        }
      } else if (fileObj.buffer) {
        // Some server environments provide buffer directly
        buffer = Buffer.from(fileObj.buffer)
      } else if (fileObj._buffer) {
        // Some environments store it in _buffer
        buffer = Buffer.from(fileObj._buffer)
      } else if (fileObj.stream) {
        // Read from stream if available
        const chunks = []
        for await (const chunk of fileObj.stream()) {
          chunks.push(chunk)
        }
        buffer = Buffer.concat(chunks)
      } else {
        throw new Error('Unable to extract buffer from File object. Available properties: ' + Object.keys(fileObj).join(', '))
      }
    }

    // Parse the workbook from buffer
    workbook = XLSX.read(buffer, { type: 'buffer' })
    return processCitiesWorkbookSync(workbook)
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Parse Excel file for salaries data
 * Note: In server environment (API routes), File object might not behave as expected
 */
export async function parseSalariesExcel(file: File | Buffer): Promise<SalaryExcelRow[]> {
  try {
    let workbook: XLSX.WorkBook
    let buffer: Buffer

    // Convert to Buffer if needed
    if (Buffer.isBuffer(file)) {
      buffer = file
    } else {
      // Handle File object in server environment
      const fileObj = file as any

      // Try multiple ways to get the buffer
      if (fileObj.arrayBuffer) {
        // Modern approach: Use arrayBuffer
        try {
          const arrayBuffer = await fileObj.arrayBuffer()
          buffer = Buffer.from(arrayBuffer)
        } catch (e) {
          throw new Error(`Failed to convert File to ArrayBuffer: ${e}`)
        }
      } else if (fileObj.buffer) {
        // Some server environments provide buffer directly
        buffer = Buffer.from(fileObj.buffer)
      } else if (fileObj._buffer) {
        // Some environments store it in _buffer
        buffer = Buffer.from(fileObj._buffer)
      } else if (fileObj.stream) {
        // Read from stream if available
        const chunks = []
        for await (const chunk of fileObj.stream()) {
          chunks.push(chunk)
        }
        buffer = Buffer.concat(chunks)
      } else {
        throw new Error('Unable to extract buffer from File object. Available properties: ' + Object.keys(fileObj).join(', '))
      }
    }

    // Parse the workbook from buffer
    workbook = XLSX.read(buffer, { type: 'buffer' })
    return processSalariesWorkbookSync(workbook)
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Process workbook and extract cities data (synchronous version)
 */
function processCitiesWorkbookSync(workbook: XLSX.WorkBook): CityExcelRow[] {
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

  return citiesData
}

/**
 * Process workbook and extract salaries data (synchronous version)
 */
function processSalariesWorkbookSync(workbook: XLSX.WorkBook): SalaryExcelRow[] {
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

  return salariesData
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