import postgres from 'postgres';
const sql = postgres('postgresql://postgres.hlbgedbgycamzvbbykdc:@Supabase01@@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require');
async function run() {
  try {
    const rls = await sql`SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('alerts', 'interactions', 'messages', 'participants');`;
    console.log("RLS enabled:", rls);
  } finally {
    await sql.end();
  }
}
run();
