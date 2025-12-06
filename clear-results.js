const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function clearResults() {
  try {
    console.log('正在清除 results 表数据...')

    const { error } = await supabase
      .from('results')
      .delete()
      .neq('id', 0)

    if (error) {
      console.error('清除失败:', error)
    } else {
      console.log('✅ results 表已清除')
    }
  } catch (error) {
    console.error('操作失败:', error)
  }
}

clearResults()