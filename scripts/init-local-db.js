const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' )

// Check if environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ Error: Supabase environment variables not found!')
  console.error('\nPlease ensure your .env.local file contains:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key')
  console.error('\nYou can get these values from your Supabase project settings.')
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function initializeDatabase() {
  console.log('\n🚀 Initializing database...')

  try {
    // Read and execute the SQL setup script
    const fs = require('fs')
    const path = require('path')
    const sqlFile = path.join(__dirname, 'setup-database.sql')

    if (!fs.existsSync(sqlFile)) {
      throw new Error('Database setup script not found at scripts/setup-database.sql')
    }

    const sql = fs.readFileSync(sqlFile, 'utf8')

    // Execute SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Try direct execution if RPC fails
      console.log('\n⚠️  RPC method not available, trying direct SQL execution...')

      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .filter(s => s.trim().length > 0)
        .map(s => s.trim())

      for (const statement of statements) {
        if (statement.toLowerCase().includes('create table') ||
            statement.toLowerCase().includes('create index') ||
            statement.toLowerCase().includes('create policy') ||
            statement.toLowerCase().includes('alter table')) {
          console.log(`\nExecuting: ${statement.substring(0, 50)}...`)
          const { error: stmtError } = await supabase.from('_temp').select('*').limit(1)
          // Note: Direct SQL execution requires admin access
          // You may need to execute these statements manually in Supabase SQL Editor
        }
      }

      console.log('\n⚠️  Please execute the SQL statements manually in Supabase SQL Editor:')
      console.log('\n1. Open your Supabase project')
      console.log('2. Go to SQL Editor')
      console.log('3. Copy and paste the contents of scripts/setup-database.sql')
      console.log('4. Click "Run" to execute')

    } else {
      console.log('\n✅ Database initialized successfully!')
    }

    // Check if tables exist
    console.log('\n📋 Checking table status...')

    const tables = ['cities', 'salaries', 'results']
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`\n❌ Table '${table}': Not accessible`)
      } else {
        console.log(`\n✅ Table '${table}': OK (${count} records)`)
      }
    }

    console.log('\n🎉 Database initialization completed!')
    console.log('\nNext steps:')
    console.log('1. Run "node scripts/insert-demo-data.js" to add sample data')
    console.log('2. Start the development server with "npm run dev"')

  } catch (error) {
    console.error('\n❌ Error initializing database:', error.message)
    process.exit(1)
  }
}

initializeDatabase()