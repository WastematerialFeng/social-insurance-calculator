-- Create cities table
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  base_min INTEGER NOT NULL,
  base_max INTEGER NOT NULL,
  rate FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique constraint on city_name and year
ALTER TABLE cities ADD CONSTRAINT unique_city_year UNIQUE (city_name, year);

-- Create salaries table
CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL CHECK (month ~ '^\d{6}$'), -- YYYYMM format
  salary_amount INTEGER NOT NULL CHECK (salary_amount > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for salaries table
CREATE INDEX idx_salaries_employee_name ON salaries(employee_name);
CREATE INDEX idx_salaries_month ON salaries(month);

-- Create results table
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  city_name TEXT NOT NULL,
  avg_salary FLOAT NOT NULL,
  contribution_base FLOAT NOT NULL,
  company_fee FLOAT NOT NULL,
  individual_fee FLOAT NOT NULL,
  total_fee FLOAT NOT NULL,
  calculation_year TEXT NOT NULL,
  months_count INTEGER NOT NULL CHECK (months_count > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for results table
CREATE INDEX idx_results_employee_name ON results(employee_name);
CREATE INDEX idx_results_city_name ON results(city_name);
CREATE INDEX idx_results_calculation_year ON results(calculation_year);

-- Create uploads table to track file uploads
CREATE TABLE uploads (
  id SERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('cities', 'salaries')),
  upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  rows_affected INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'partial')),
  error_message TEXT
);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_salaries_updated_at BEFORE UPDATE ON salaries
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample data
INSERT INTO cities (city_name, year, base_min, base_max, rate) VALUES
  ('佛山', '2024', 4546, 26421, 0.014),
  ('广州', '2024', 5284, 26421, 0.014),
  ('深圳', '2024', 5284, 26421, 0.014);

-- Set up Row Level Security (RLS)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Create policies
-- For development, allow all operations
-- In production, you might want to restrict these
CREATE POLICY "Allow all operations on cities" ON cities
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on salaries" ON salaries
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on results" ON results
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on uploads" ON uploads
  FOR ALL USING (true);