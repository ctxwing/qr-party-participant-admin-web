import postgres from 'postgres';

const sql = postgres('postgresql://postgres.hlbgedbgycamzvbbykdc:@Supabase01@@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require');

async function run() {
  try {
    console.log('Creating system_settings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.system_settings (
          key TEXT PRIMARY KEY,
          value JSONB DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    console.log('Inserting default weights...');
    await sql`
      INSERT INTO public.system_settings (key, value)
      VALUES ('ranking_weights', '{"like": 1, "message": 5, "cupid": 10}')
      ON CONFLICT (key) DO NOTHING;
    `;

    console.log('Enabling RLS on system_settings...');
    await sql`ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;`;
    
    console.log('Adding SELECT policy for anon on system_settings...');
    await sql`
      CREATE POLICY anon_select_system_settings ON public.system_settings 
      FOR SELECT TO anon USING (true);
    `;
    
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await sql.end();
  }
}

run();
