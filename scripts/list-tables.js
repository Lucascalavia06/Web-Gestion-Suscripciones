const fs = require('fs')
const path = require('path')

async function main() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found at', envPath)
    process.exit(2)
  }

  const env = fs.readFileSync(envPath, 'utf8')
  const lines = env.split(/\r?\n/)
  const vars = {}
  for (const line of lines) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/)
    if (m) {
      vars[m[1]] = m[2].replace(/^"|"$/g, '')
    }
  }

  const url = vars.NEXT_PUBLIC_SUPABASE_URL
  const key = vars.SUPABASE_SERVICE_ROLE_KEY || vars.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
    process.exit(3)
  }

  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(url, key)

    console.log('Listing tables in schema "public"...')

    // Try information_schema.tables first
    const { data: infoData, error: infoErr } = await supabase
      .from('information_schema.tables')
      .select('table_schema, table_name')
      .eq('table_schema', 'public')
      .order('table_name', { ascending: true })

    if (infoErr) {
      console.error('Query information_schema.tables error:', infoErr)
    } else {
      console.log('Found', infoData.length, 'tables (information_schema):')
      infoData.forEach(r => console.log('-', r.table_name))
    }

    // Also try pg_catalog.pg_tables
    const { data: pgData, error: pgErr } = await supabase
      .from('pg_catalog.pg_tables')
      .select('schemaname, tablename')
      .eq('schemaname', 'public')
      .order('tablename', { ascending: true })

    if (pgErr) {
      console.error('Query pg_catalog.pg_tables error:', pgErr)
    } else {
      console.log('Found', pgData.length, 'tables (pg_tables):')
      pgData.forEach(r => console.log('-', r.tablename))
    }

    process.exit(0)
  } catch (err) {
    console.error('Unexpected error:', err && err.message ? err.message : err)
    process.exit(5)
  }
}

main()
