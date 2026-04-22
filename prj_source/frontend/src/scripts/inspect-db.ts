import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for inspection

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspect() {
  console.log('Inspecting Supabase tables...')
  
  // Try to query information_schema.tables
  const { data, error } = await supabase.rpc('run_sql', { sql: 'SELECT table_name FROM information_schema.tables WHERE table_schema = "public"' })
  
  if (error) {
    console.error('RPC run_sql failed (expected if not created):', error.message)
    
    // Alternative: try to select from party_sessions directly
    const { error: tableError } = await supabase.from('party_sessions').select('*').limit(1)
    if (tableError) {
      console.error('Table party_sessions access failed:', tableError.message)
    } else {
      console.log('✅ Table party_sessions exists!')
    }
  } else {
    console.log('Tables in public schema:', data)
  }
}

inspect()
