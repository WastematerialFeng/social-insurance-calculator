// Database table types
export interface City {
  id: number;
  city_name: string;
  year: string;
  base_min: number;
  base_max: number;
  rate: number;
  created_at?: string;
}

export interface Salary {
  id: number;
  employee_id: string;
  employee_name: string;
  month: string; // YYYYMM format
  salary_amount: number;
  created_at?: string;
}

export interface CalculationResult {
  id: number;
  employee_name: string;
  employee_id: string;
  city_name: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
  individual_fee: number;
  total_fee: number;
  calculation_year: string;
  months_count: number;
  created_at?: string;
}

// Excel file types
export interface CityExcelRow {
  city_name: string;
  year: string;
  base_min: number;
  base_max: number;
  rate: number;
}

export interface SalaryExcelRow {
  employee_id: string;
  employee_name: string;
  month: string;
  salary_amount: number;
}

// API response types
export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    rowsInserted: number;
    rowsUpdated: number;
    errors?: string[];
  };
}

export interface CalculateResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface ResultsResponse {
  data: CalculationResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  filters: {
    cities: string[];
    years: string[];
  };
}

export interface JobStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  results?: CalculationResult[];
}

// Calculation types
export interface RateDistribution {
  total: number; // 0.014
  company: number; // 0.0098 (70%)
  individual: number; // 0.0042 (30%)
}

export interface CalculationInput {
  employeeSalaries: Salary[];
  city: City;
  calculationYear: string;
}