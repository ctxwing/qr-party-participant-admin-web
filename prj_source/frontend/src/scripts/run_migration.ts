import postgres from 'postgres';

const sql = postgres('postgresql://postgres.hlbgedbgycamzvbbykdc:@Supabase01@@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require');

async function run() {
  try {
    console.log('Running migration...');
    await sql`ALTER TABLE public.alerts DROP COLUMN IF EXISTS receiver_id;`;
    console.log('Dropped receiver_id');
    await sql`ALTER TABLE public.alerts ADD COLUMN receiver_id TEXT REFERENCES public.participants(id) ON DELETE CASCADE;`;
    console.log('Added receiver_id as TEXT');
    await sql`ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.party_sessions(id);`;
    console.log('Added session_id as UUID');
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await sql.end();
  }
}

run();
