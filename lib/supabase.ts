import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a supabase client with admin privileges for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database helpers
export const dbOperations = {
  // Cities table operations
  cities: {
    // Insert or update cities data (overwrite existing data for the same year)
    async upsertCities(citiesData: any[]) {
      const { data, error } = await supabaseAdmin
        .from('cities')
        .upsert(citiesData, {
          onConflict: 'city_name,year'
        })

      if (error) throw error
      return data
    },

    // Delete all cities for a specific year
    async deleteCitiesByYear(year: string) {
      const { error } = await supabaseAdmin
        .from('cities')
        .eq('year', year)
        .delete()

      if (error) throw error
    },

    // Get all cities
    async getAllCities() {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('city_name')

      if (error) throw error
      return data
    },

    // Get city by name and year
    async getCityByNameAndYear(cityName: string, year: string) {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('city_name', cityName)
        .eq('year', year)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    }
  },

  // Salaries table operations
  salaries: {
    // Clear all salary data
    async clearAllSalaries() {
      const { error } = await supabaseAdmin
        .from('salaries')
        .delete()
        .neq('id', 0) // This deletes all rows

      if (error) throw error
    },

    // Insert salary data
    async insertSalaries(salariesData: any[]) {
      const { data, error } = await supabaseAdmin
        .from('salaries')
        .insert(salariesData)
        .select()

      if (error) throw error
      return data
    },

    // Get all salaries
    async getAllSalaries() {
      const { data, error } = await supabase
        .from('salaries')
        .select('*')
        .order('employee_name, month')

      if (error) throw error
      return data
    },

    // Get salaries by employee name
    async getSalariesByEmployee(employeeName: string) {
      const { data, error } = await supabase
        .from('salaries')
        .select('*')
        .eq('employee_name', employeeName)
        .order('month')

      if (error) throw error
      return data
    }
  },

  // Results table operations
  results: {
    // Clear all results
    async clearAllResults() {
      const { error } = await supabaseAdmin
        .from('results')
        .delete()
        .neq('id', 0) // This deletes all rows

      if (error) throw error
    },

    // Insert calculation results
    async insertResults(resultsData: any[]) {
      const { data, error } = await supabaseAdmin
        .from('results')
        .insert(resultsData)
        .select()

      if (error) throw error
      return data
    },

    // Get all results with pagination
    async getResults(page: number = 1, limit: number = 50, filters?: {
      city?: string;
      year?: string;
      employeeName?: string;
    }) {
      let query = supabase
        .from('results')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.city) {
        query = query.eq('city_name', filters.city)
      }
      if (filters?.year) {
        query = query.eq('calculation_year', filters.year)
      }
      if (filters?.employeeName) {
        query = query.ilike('employee_name', `%${filters.employeeName}%`)
      }

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      return {
        data,
        pagination: {
          page,
          limit,
          total: count || 0
        }
      }
    },

    // Get unique cities from results
    async getUniqueCities() {
      const { data, error } = await supabase
        .from('results')
        .select('city_name')
        .order('city_name')

      if (error) throw error
      return [...new Set(data?.map(r => r.city_name))]
    },

    // Get unique years from results
    async getUniqueYears() {
      const { data, error } = await supabase
        .from('results')
        .select('calculation_year')
        .order('calculation_year', { ascending: false })

      if (error) throw error
      return [...new Set(data?.map(r => r.calculation_year))]
    }
  }
}