const { createClient } = require('@supabase/supabase-js')
const XLSX = require('xlsx')
const { readFile } = require('fs/promises')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function uploadCitiesData() {
  try {
    console.log('正在读取 cities-data.xlsx...')
    const fileBuffer = await readFile('cities-data.xlsx')
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })

    // Get first worksheet
    const worksheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[worksheetName]

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet)

    console.log(`找到 ${data.length} 条城市数据`)

    // Clear existing cities data
    console.log('清除现有城市数据...')
    const { error: deleteError } = await supabase
      .from('cities')
      .delete()
      .neq('id', 0)

    if (deleteError) {
      console.error('清除数据失败:', deleteError)
    }

    // Insert new data
    console.log('插入新数据...')
    const { data: insertedData, error } = await supabase
      .from('cities')
      .insert(data)
      .select()

    if (error) {
      console.error('插入数据失败:', error)
    } else {
      console.log(`✅ 成功插入 ${insertedData.length} 条城市数据`)
    }

  } catch (error) {
    console.error('上传城市数据失败:', error)
  }
}

async function uploadSalariesData() {
  try {
    console.log('\n正在读取 salaries-data.xlsx...')
    const fileBuffer = await readFile('salaries-data.xlsx')
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })

    // Get first worksheet
    const worksheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[worksheetName]

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet)

    console.log(`找到 ${data.length} 条工资数据`)

    // Clear existing salaries data
    console.log('清除现有工资数据...')
    const { error: deleteError } = await supabase
      .from('salaries')
      .delete()
      .neq('id', 0)

    if (deleteError) {
      console.error('清除数据失败:', deleteError)
    }

    // Insert new data
    console.log('插入新数据...')
    const { data: insertedData, error } = await supabase
      .from('salaries')
      .insert(data)
      .select()

    if (error) {
      console.error('插入数据失败:', error)
    } else {
      console.log(`✅ 成功插入 ${insertedData.length} 条工资数据`)
    }

  } catch (error) {
    console.error('上传工资数据失败:', error)
  }
}

async function main() {
  console.log('=== 开始上传Excel数据到Supabase ===')

  await uploadCitiesData()
  await uploadSalariesData()

  console.log('\n=== 上传完成 ===')
}

main()