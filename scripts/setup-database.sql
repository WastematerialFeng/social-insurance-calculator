-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  base_min INTEGER NOT NULL,
  base_max INTEGER NOT NULL,
  rate NUMERIC(5,4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_name, year)
);

-- Create salaries table
CREATE TABLE IF NOT EXISTS salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL, -- Format: YYYYMM
  salary_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create results table
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  city_name TEXT NOT NULL,
  avg_salary NUMERIC(12,2) NOT NULL,
  contribution_base NUMERIC(12,2) NOT NULL,
  company_fee NUMERIC(12,2) NOT NULL,
  individual_fee NUMERIC(12,2) NOT NULL,
  total_fee NUMERIC(12,2) NOT NULL,
  calculation_year TEXT NOT NULL,
  months_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cities_name_year ON cities(city_name, year);
CREATE INDEX IF NOT EXISTS idx_salaries_employee_name ON salaries(employee_name);
CREATE INDEX IF NOT EXISTS idx_salaries_month ON salaries(month);
CREATE INDEX IF NOT EXISTS idx_results_employee_name ON results(employee_name);
CREATE INDEX IF NOT EXISTS idx_results_city_year ON results(city_name, calculation_year);
CREATE INDEX IF NOT EXISTS idx_results_created_at ON results(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to cities" ON cities
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to salaries" ON salaries
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to results" ON results
  FOR SELECT USING (true);

-- Create policies for service role (server-side) full access
CREATE POLICY "Allow full access to cities for service role" ON cities
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow full access to salaries for service role" ON salaries
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow full access to results for service role" ON results
  FOR ALL USING (auth.role() = 'service_role');