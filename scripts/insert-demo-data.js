const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function insertDemoData() {
  try {
    console.log('Inserting demo data...')

    // Insert cities data
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

    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .upsert(citiesData, {
        onConflict: 'city_name,year'
      })
      .select()

    if (citiesError) {
      console.error('Error inserting cities:', citiesError)
    } else {
      console.log(`✅ Inserted ${cities.length} cities`)
    }

    // Insert salaries data
    const salariesData = [
      // 张三 - 高工资员工
      { employee_id: '0001', employee_name: '张三', month: '202401', salary_amount: 15000 },
      { employee_id: '0001', employee_name: '张三', month: '202402', salary_amount: 15000 },
      { employee_id: '0001', employee_name: '张三', month: '202403', salary_amount: 15500 },
      { employee_id: '0001', employee_name: '张三', month: '202404', salary_amount: 15500 },
      { employee_id: '0001', employee_name: '张三', month: '202405', salary_amount: 16000 },
      { employee_id: '0001', employee_name: '张三', month: '202406', salary_amount: 16000 },
      { employee_id: '0001', employee_name: '张三', month: '202407', salary_amount: 16500 },
      { employee_id: '0001', employee_name: '张三', month: '202408', salary_amount: 16500 },
      { employee_id: '0001', employee_name: '张三', month: '202409', salary_amount: 17000 },
      { employee_id: '0001', employee_name: '张三', month: '202410', salary_amount: 17000 },
      { employee_id: '0001', employee_name: '张三', month: '202411', salary_amount: 17500 },
      { employee_id: '0001', employee_name: '张三', month: '202412', salary_amount: 17500 },

      // 李四 - 中等工资员工
      { employee_id: '0002', employee_name: '李四', month: '202401', salary_amount: 8500 },
      { employee_id: '0002', employee_name: '李四', month: '202402', salary_amount: 8500 },
      { employee_id: '0002', employee_name: '李四', month: '202403', salary_amount: 8800 },
      { employee_id: '0002', employee_name: '李四', month: '202404', salary_amount: 8800 },
      { employee_id: '0002', employee_name: '李四', month: '202405', salary_amount: 9000 },
      { employee_id: '0002', employee_name: '李四', month: '202406', salary_amount: 9000 },
      { employee_id: '0002', employee_name: '李四', month: '202407', salary_amount: 9200 },
      { employee_id: '0002', employee_name: '李四', month: '202408', salary_amount: 9200 },
      { employee_id: '0002', employee_name: '李四', month: '202409', salary_amount: 9500 },
      { employee_id: '0002', employee_name: '李四', month: '202410', salary_amount: 9500 },
      { employee_id: '0002', employee_name: '李四', month: '202411', salary_amount: 9800 },
      { employee_id: '0002', employee_name: '李四', month: '202412', salary_amount: 9800 },

      // 王五 - 低工资员工
      { employee_id: '0003', employee_name: '王五', month: '202401', salary_amount: 4200 },
      { employee_id: '0003', employee_name: '王五', month: '202402', salary_amount: 4200 },
      { employee_id: '0003', employee_name: '王五', month: '202403', salary_amount: 4300 },
      { employee_id: '0003', employee_name: '王五', month: '202404', salary_amount: 4300 },
      { employee_id: '0003', employee_name: '王五', month: '202405', salary_amount: 4400 },
      { employee_id: '0003', employee_name: '王五', month: '202406', salary_amount: 4400 },
      { employee_id: '0003', employee_name: '王五', month: '202407', salary_amount: 4500 },
      { employee_id: '0003', employee_name: '王五', month: '202408', salary_amount: 4500 },
      { employee_id: '0003', employee_name: '王五', month: '202409', salary_amount: 4600 },
      { employee_id: '0003', employee_name: '王五', month: '202410', salary_amount: 4600 },
      { employee_id: '0003', employee_name: '王五', month: '202411', salary_amount: 4700 },
      { employee_id: '0003', employee_name: '王五', month: '202412', salary_amount: 4700 },

      // 赵六 - 接近基数上限
      { employee_id: '0004', employee_name: '赵六', month: '202401', salary_amount: 30000 },
      { employee_id: '0004', employee_name: '赵六', month: '202402', salary_amount: 30000 },
      { employee_id: '0004', employee_name: '赵六', month: '202403', salary_amount: 32000 },
      { employee_id: '0004', employee_name: '赵六', month: '202404', salary_amount: 32000 },
      { employee_id: '0004', employee_name: '赵六', month: '202405', salary_amount: 35000 },
      { employee_id: '0004', employee_name: '赵六', month: '202406', salary_amount: 35000 },
      { employee_id: '0004', employee_name: '赵六', month: '202407', salary_amount: 38000 },
      { employee_id: '0004', employee_name: '赵六', month: '202408', salary_amount: 38000 },
      { employee_id: '0004', employee_name: '赵六', month: '202409', salary_amount: 40000 },
      { employee_id: '0004', employee_name: '赵六', month: '202410', salary_amount: 40000 },
      { employee_id: '0004', employee_name: '赵六', month: '202411', salary_amount: 42000 },
      { employee_id: '0004', employee_name: '赵六', month: '202412', salary_amount: 42000 }
    ]

    // Clear existing salaries first
    const { error: deleteError } = await supabase
      .from('salaries')
      .delete()
      .neq('id', 0)

    if (deleteError) {
      console.error('Error clearing salaries:', deleteError)
    }

    const { data: salaries, error: salariesError } = await supabase
      .from('salaries')
      .insert(salariesData)
      .select()

    if (salariesError) {
      console.error('Error inserting salaries:', salariesError)
    } else {
      console.log(`✅ Inserted ${salaries.length} salary records`)
    }

    console.log('\n🎉 Demo data insertion completed!')
    console.log('\nYou can now:')
    console.log('1. Visit http://localhost:3001 to see the application')
    console.log('2. Go to /upload to test file uploads')
    console.log('3. Go to /results to view calculation results')
    console.log('4. Use the demo data to test calculations')

  } catch (error) {
    console.error('Error inserting demo data:', error)
  }
}

insertDemoData()